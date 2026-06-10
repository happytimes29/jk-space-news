"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CompareResult, DXFData, DXFEntity } from "@/lib/pcb-tool/types";

interface Props {
  results: CompareResult[];
  dxfData?: DXFData | null;
}

interface DXFTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

// Default scale = 39.37 converts DXF mm units to mil (OrCAD test-point coordinates are in mil)
const DEFAULT_DXF_TRANSFORM: DXFTransform = { scale: 39.37, offsetX: 0, offsetY: 0 };

// Colors matching CSS vars (canvas can't read CSS vars directly)
const COLOR = {
  unchanged: "#3fb950",
  moved_old: "#f0883e",
  moved_new: "#f0883e",
  added: "#58a6ff",
  removed: "#f85149",
  bg: "#161b22",
  grid: "#21262d",
  gridText: "#8b949e",
  label: "#e6edf3",
  dxf: "rgba(100, 160, 220, 0.35)",
};

const POINT_RADIUS = 3;
const PADDING = 48;
const DEG = Math.PI / 180;

interface ViewTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

function worldToScreen(wx: number, wy: number, t: ViewTransform, canvasH: number): [number, number] {
  const sx = wx * t.scale + t.offsetX;
  const sy = canvasH - (wy * t.scale + t.offsetY);
  return [sx, sy];
}

// Apply user-specified DXF coordinate transform before the view transform:
//   target = original * dxfScale + dxfOffset
function applyDXF(x: number, y: number, dt: DXFTransform): [number, number] {
  return [x * dt.scale + dt.offsetX, y * dt.scale + dt.offsetY];
}

// ── Bounding-box helpers ─────────────────────────────────────────────────────

function collectDXFBounds(
  entities: DXFEntity[],
  dt: DXFTransform,
  xs: number[],
  ys: number[]
) {
  for (const e of entities) {
    switch (e.type) {
      case "line": {
        const [x1, y1] = applyDXF(e.x1, e.y1, dt);
        const [x2, y2] = applyDXF(e.x2, e.y2, dt);
        xs.push(x1, x2); ys.push(y1, y2);
        break;
      }
      case "polyline": {
        for (const v of e.vertices) {
          const [vx, vy] = applyDXF(v.x, v.y, dt);
          xs.push(vx); ys.push(vy);
        }
        break;
      }
      case "arc":
      case "circle": {
        const [cx, cy] = applyDXF(e.cx, e.cy, dt);
        const r = e.r * dt.scale;
        xs.push(cx - r, cx + r);
        ys.push(cy - r, cy + r);
        break;
      }
    }
  }
}

function buildTransform(
  results: CompareResult[],
  dxfData: DXFData | null | undefined,
  dxfT: DXFTransform,
  canvasW: number,
  canvasH: number
): ViewTransform {
  const xs: number[] = [];
  const ys: number[] = [];

  for (const r of results) {
    if (r.oldX !== undefined) xs.push(r.oldX);
    if (r.newX !== undefined) xs.push(r.newX);
    if (r.oldY !== undefined) ys.push(r.oldY);
    if (r.newY !== undefined) ys.push(r.newY);
  }

  if (dxfData && dxfData.entities.length > 0) {
    collectDXFBounds(dxfData.entities, dxfT, xs, ys);
  }

  if (xs.length === 0) return { offsetX: 0, offsetY: 0, scale: 1 };

  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const drawW = canvasW - PADDING * 2;
  const drawH = canvasH - PADDING * 2;
  const scale = Math.min(drawW / rangeX, drawH / rangeY);
  const offsetX = PADDING - minX * scale + (drawW - rangeX * scale) / 2;
  const offsetY = PADDING - minY * scale + (drawH - rangeY * scale) / 2;

  return { offsetX, offsetY, scale };
}

// ── Grid ─────────────────────────────────────────────────────────────────────

function drawGrid(ctx: CanvasRenderingContext2D, t: ViewTransform, w: number, h: number) {
  const worldW = w / t.scale, worldH = h / t.scale;
  const rawStep = Math.max(worldW, worldH) / 8;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = Math.ceil(rawStep / mag) * mag;
  const x0 = -t.offsetX / t.scale, y0 = -t.offsetY / t.scale;

  ctx.strokeStyle = COLOR.grid;
  ctx.lineWidth = 0.5;
  ctx.fillStyle = COLOR.gridText;
  ctx.font = "10px monospace";

  ctx.textAlign = "center";
  for (let wx = Math.floor(x0 / step) * step; wx <= x0 + worldW; wx += step) {
    const [sx] = worldToScreen(wx, 0, t, h);
    ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();
    ctx.fillText(wx.toFixed(1), sx, h - 4);
  }

  ctx.textAlign = "right";
  for (let wy = Math.floor(y0 / step) * step; wy <= y0 + worldH; wy += step) {
    const [, sy] = worldToScreen(0, wy, t, h);
    ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(w, sy); ctx.stroke();
    ctx.fillText(wy.toFixed(1), PADDING - 4, sy + 3);
  }
}

// ── DXF layer ────────────────────────────────────────────────────────────────

function drawDXFLayer(
  ctx: CanvasRenderingContext2D,
  entities: DXFEntity[],
  dxfT: DXFTransform,
  vt: ViewTransform,
  canvasH: number
) {
  ctx.strokeStyle = COLOR.dxf;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([]);

  for (const e of entities) {
    ctx.beginPath();
    switch (e.type) {
      case "line": {
        const [tx1, ty1] = applyDXF(e.x1, e.y1, dxfT);
        const [tx2, ty2] = applyDXF(e.x2, e.y2, dxfT);
        const [sx1, sy1] = worldToScreen(tx1, ty1, vt, canvasH);
        const [sx2, sy2] = worldToScreen(tx2, ty2, vt, canvasH);
        ctx.moveTo(sx1, sy1); ctx.lineTo(sx2, sy2);
        break;
      }
      case "polyline": {
        if (e.vertices.length < 2) continue;
        const [tx0, ty0] = applyDXF(e.vertices[0].x, e.vertices[0].y, dxfT);
        const [sx0, sy0] = worldToScreen(tx0, ty0, vt, canvasH);
        ctx.moveTo(sx0, sy0);
        for (let i = 1; i < e.vertices.length; i++) {
          const [tvx, tvy] = applyDXF(e.vertices[i].x, e.vertices[i].y, dxfT);
          const [svx, svy] = worldToScreen(tvx, tvy, vt, canvasH);
          ctx.lineTo(svx, svy);
        }
        if (e.closed) ctx.closePath();
        break;
      }
      case "arc": {
        const [tcx, tcy] = applyDXF(e.cx, e.cy, dxfT);
        const [scx, scy] = worldToScreen(tcx, tcy, vt, canvasH);
        const sr = e.r * dxfT.scale * vt.scale;
        if (sr < 0.5) continue;
        // DXF: CCW from +X in Y-up space → after Y-flip: swap+negate angles
        ctx.arc(scx, scy, sr, -(e.endAngle * DEG), -(e.startAngle * DEG), false);
        break;
      }
      case "circle": {
        const [tcx, tcy] = applyDXF(e.cx, e.cy, dxfT);
        const [scx, scy] = worldToScreen(tcx, tcy, vt, canvasH);
        const sr = e.r * dxfT.scale * vt.scale;
        if (sr < 0.5) continue;
        ctx.arc(scx, scy, sr, 0, Math.PI * 2);
        break;
      }
    }
    ctx.stroke();
  }
}

// ── Number input helper ───────────────────────────────────────────────────────

function NumInput({
  label,
  value,
  step,
  min,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
      {label}
      <input
        type="number"
        step={step}
        min={min}
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v) && (min === undefined || v >= min)) onChange(v);
        }}
        className="w-24 px-2 py-0.5 rounded font-mono text-xs"
        style={{
          backgroundColor: "var(--surface-2)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
          outline: "none",
        }}
      />
    </label>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CanvasMap({ results, dxfData }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 480 });
  const [hoveredRefDes, setHoveredRefDes] = useState<string | null>(null);

  // DXF coordinate transform (scale & offset applied before view transform)
  const [dxfT, setDxfT] = useState<DXFTransform>(DEFAULT_DXF_TRANSFORM);

  const viewTransformRef     = useRef<ViewTransform>({ offsetX: 0, offsetY: 0, scale: 1 });
  const baseViewTransformRef = useRef<ViewTransform>({ offsetX: 0, offsetY: 0, scale: 1 });
  const isPanning  = useRef(false);
  const panStart   = useRef({ x: 0, y: 0 });

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setSize({ w: e.contentRect.width, h: Math.max(360, e.contentRect.width * 0.5) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Auto-fit whenever data, DXF transform, or canvas size changes
  useEffect(() => {
    const base = buildTransform(results, dxfData, dxfT, size.w, size.h);
    viewTransformRef.current     = { ...base };
    baseViewTransformRef.current = { ...base };
  }, [results, dxfData, dxfT, size]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h } = size;
    const vt = viewTransformRef.current;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = COLOR.bg;
    ctx.fillRect(0, 0, w, h);

    drawGrid(ctx, vt, w, h);

    // ── Layer 1: DXF board outline ──────────────────────────────────────
    if (dxfData && dxfData.entities.length > 0) {
      drawDXFLayer(ctx, dxfData.entities, dxfT, vt, h);
    }

    // ── Layer 2: Test points ─────────────────────────────────────────────
    const unchanged = results.filter((r) => r.status === "unchanged");
    const added     = results.filter((r) => r.status === "added");
    const removed   = results.filter((r) => r.status === "removed");
    const moved     = results.filter((r) => r.status === "moved");

    for (const r of unchanged) {
      const [sx, sy] = worldToScreen(r.newX!, r.newY!, vt, h);
      ctx.beginPath(); ctx.arc(sx, sy, POINT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = COLOR.unchanged; ctx.fill();
    }

    for (const r of removed) {
      const [sx, sy] = worldToScreen(r.oldX!, r.oldY!, vt, h);
      ctx.beginPath(); ctx.arc(sx, sy, POINT_RADIUS + 1, 0, Math.PI * 2);
      ctx.fillStyle = COLOR.removed; ctx.fill();
    }

    for (const r of added) {
      const [sx, sy] = worldToScreen(r.newX!, r.newY!, vt, h);
      ctx.beginPath(); ctx.arc(sx, sy, POINT_RADIUS + 1, 0, Math.PI * 2);
      ctx.fillStyle = COLOR.added; ctx.fill();
      ctx.beginPath(); ctx.arc(sx, sy, POINT_RADIUS + 4, 0, Math.PI * 2);
      ctx.strokeStyle = COLOR.added + "40"; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.stroke();
    }

    for (const r of moved) {
      const [ox, oy] = worldToScreen(r.oldX!, r.oldY!, vt, h);
      const [nx, ny] = worldToScreen(r.newX!, r.newY!, vt, h);
      ctx.beginPath(); ctx.setLineDash([4, 3]);
      ctx.moveTo(ox, oy); ctx.lineTo(nx, ny);
      ctx.strokeStyle = COLOR.moved_old + "99"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.setLineDash([]);
      const angle = Math.atan2(ny - oy, nx - ox);
      const al = 6;
      ctx.beginPath();
      ctx.moveTo(nx, ny);
      ctx.lineTo(nx - al * Math.cos(angle - 0.4), ny - al * Math.sin(angle - 0.4));
      ctx.moveTo(nx, ny);
      ctx.lineTo(nx - al * Math.cos(angle + 0.4), ny - al * Math.sin(angle + 0.4));
      ctx.strokeStyle = COLOR.moved_new; ctx.lineWidth = 1.5; ctx.stroke();
    }

    for (const r of moved) {
      const [ox, oy] = worldToScreen(r.oldX!, r.oldY!, vt, h);
      const [nx, ny] = worldToScreen(r.newX!, r.newY!, vt, h);
      ctx.beginPath(); ctx.arc(ox, oy, POINT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = COLOR.moved_old + "60"; ctx.fill();
      ctx.beginPath(); ctx.arc(nx, ny, POINT_RADIUS + 1, 0, Math.PI * 2);
      ctx.fillStyle = COLOR.moved_new; ctx.fill();
    }

    // Hover label
    if (hoveredRefDes) {
      const r = results.find((x) => x.refDes === hoveredRefDes);
      if (r) {
        const wx = r.newX ?? r.oldX!;
        const wy = r.newY ?? r.oldY!;
        const [sx, sy] = worldToScreen(wx, wy, vt, h);
        const label = r.refDes;
        ctx.font = "bold 11px monospace";
        const tw = ctx.measureText(label).width;
        const bx = sx + 8, by = sy - 18;
        ctx.fillStyle = "rgba(13,17,23,0.85)";
        ctx.fillRect(bx - 3, by - 12, tw + 6, 16);
        ctx.fillStyle = COLOR.label;
        ctx.fillText(label, bx, by);
      }
    }
  }, [results, dxfData, dxfT, size, hoveredRefDes]);

  useEffect(() => { draw(); }, [draw]);

  // Mouse helpers
  const getHovered = useCallback(
    (mx: number, my: number): string | null => {
      const vt = viewTransformRef.current;
      let closest: string | null = null, minDist = 12;
      for (const r of results) {
        const wx = r.newX ?? r.oldX, wy = r.newY ?? r.oldY;
        if (wx === undefined || wy === undefined) continue;
        const [sx, sy] = worldToScreen(wx, wy, vt, size.h);
        const d = Math.hypot(mx - sx, my - sy);
        if (d < minDist) { minDist = d; closest = r.refDes; }
      }
      return closest;
    },
    [results, size.h]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      if (isPanning.current) {
        const dx = mx - panStart.current.x, dy = my - panStart.current.y;
        viewTransformRef.current = {
          ...viewTransformRef.current,
          offsetX: baseViewTransformRef.current.offsetX + dx,
          offsetY: baseViewTransformRef.current.offsetY - dy,
        };
        draw(); return;
      }
      const h = getHovered(mx, my);
      if (h !== hoveredRefDes) setHoveredRefDes(h);
    },
    [draw, getHovered, hoveredRefDes]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isPanning.current = true;
    const rect = canvasRef.current!.getBoundingClientRect();
    panStart.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    baseViewTransformRef.current = { ...viewTransformRef.current };
  }, []);

  const handleMouseUp  = useCallback(() => { isPanning.current = false; }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const rect = canvasRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const vt = viewTransformRef.current;
      viewTransformRef.current = {
        scale: vt.scale * factor,
        offsetX: mx - (mx - vt.offsetX) * factor,
        offsetY: (size.h - my) - (size.h - my - vt.offsetY) * factor,
      };
      draw();
    },
    [draw, size.h]
  );

  const resetView = useCallback(() => {
    const base = buildTransform(results, dxfData, dxfT, size.w, size.h);
    viewTransformRef.current     = { ...base };
    baseViewTransformRef.current = { ...base };
    draw();
  }, [results, dxfData, dxfT, size, draw]);

  // Zoom toward the canvas centre by a given factor
  const zoomBy = useCallback((factor: number) => {
    const mx = size.w / 2;
    const my = size.h / 2;
    const vt = viewTransformRef.current;
    viewTransformRef.current = {
      scale: vt.scale * factor,
      offsetX: mx - (mx - vt.offsetX) * factor,
      offsetY: (size.h - my) - (size.h - my - vt.offsetY) * factor,
    };
    draw();
  }, [draw, size]);

  const resetDXFTransform = useCallback(() => {
    setDxfT(DEFAULT_DXF_TRANSFORM);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {/* Legend + controls */}
      <div className="flex flex-wrap items-center gap-4 px-1 text-xs" style={{ color: "var(--foreground-muted)" }}>
        {/* Legend dots */}
        {dxfData && (
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-0.5 inline-block rounded" style={{ backgroundColor: COLOR.dxf }} />
            Board Outline
          </span>
        )}
        {[
          { color: COLOR.unchanged, label: "Unchanged" },
          { color: COLOR.moved_new, label: "Moved" },
          { color: COLOR.added,     label: "Added" },
          { color: COLOR.removed,   label: "Removed" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}

        {/* Zoom + Reset button group */}
        <div className="ml-auto flex items-center gap-1">
          {/* Zoom out */}
          <button
            onClick={() => zoomBy(1 / 1.4)}
            title="縮小 (Zoom out)"
            className="w-6 h-6 flex items-center justify-center rounded border text-sm leading-none transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--foreground-muted)", backgroundColor: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--tech-blue)"; e.currentTarget.style.borderColor = "var(--tech-blue)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--foreground-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            −
          </button>

          {/* Zoom in */}
          <button
            onClick={() => zoomBy(1.4)}
            title="放大 (Zoom in)"
            className="w-6 h-6 flex items-center justify-center rounded border text-sm leading-none transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--foreground-muted)", backgroundColor: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--tech-blue)"; e.currentTarget.style.borderColor = "var(--tech-blue)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--foreground-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            ＋
          </button>

          {/* Reset View */}
          <button
            onClick={resetView}
            title="重設視角 (Reset view)"
            className="px-2 h-6 flex items-center rounded border text-xs transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--foreground-muted)", backgroundColor: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--tech-blue)"; e.currentTarget.style.borderColor = "var(--tech-blue)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--foreground-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            Reset View
          </button>
        </div>

        <span style={{ color: "var(--foreground-muted)" }}>
          滾輪縮放 · 拖曳平移 · Hover 顯示標籤
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border)" }}
      >
        <canvas
          ref={canvasRef}
          width={size.w}
          height={size.h}
          style={{ display: "block", cursor: isPanning.current ? "grabbing" : "crosshair", width: "100%", height: size.h }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
      </div>

      {/* DXF coordinate transform controls — only shown when a DXF is loaded */}
      {dxfData && (
        <div
          className="flex flex-wrap items-center gap-x-5 gap-y-2 px-3 py-2 rounded-lg text-xs"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <span className="font-semibold" style={{ color: "var(--foreground-muted)" }}>
            DXF 座標對齊
          </span>

          <NumInput
            label="Scale"
            value={dxfT.scale}
            step={0.01}
            min={0.0001}
            onChange={(v) => setDxfT((p) => ({ ...p, scale: v }))}
          />
          <NumInput
            label="Offset X"
            value={dxfT.offsetX}
            step={1}
            onChange={(v) => setDxfT((p) => ({ ...p, offsetX: v }))}
          />
          <NumInput
            label="Offset Y"
            value={dxfT.offsetY}
            step={1}
            onChange={(v) => setDxfT((p) => ({ ...p, offsetY: v }))}
          />

          <button
            onClick={resetDXFTransform}
            className="px-2 py-0.5 rounded border text-xs transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--foreground-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--tech-blue)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--foreground-muted)")}
          >
            Reset Transform
          </button>

          <span style={{ color: "var(--foreground-muted)", opacity: 0.6 }}>
            Target = Original × Scale + Offset
          </span>
        </div>
      )}
    </div>
  );
}
