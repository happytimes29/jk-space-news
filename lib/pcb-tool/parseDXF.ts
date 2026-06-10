/**
 * Minimal DXF parser — handles LINE, LWPOLYLINE, ARC, CIRCLE entities.
 * Supports ASCII DXF R12 through R2018+.
 * Runs entirely in the browser (no Node.js APIs required).
 */
import type { DXFArc, DXFCircle, DXFData, DXFEntity, DXFLine, DXFPolyline } from "./types";

// Group code / value pair
type Pair = [number, string];

// ── Low-level pair parser ────────────────────────────────────────────────────

function parsePairs(content: string): Pair[] {
  const lines = content.split(/\r?\n/).map((l) => l.trim());
  const pairs: Pair[] = [];
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const code = parseInt(lines[i], 10);
    if (!isNaN(code)) pairs.push([code, lines[i + 1]]);
  }
  return pairs;
}

// Extract the ENTITIES section between SECTION/ENTITIES … ENDSEC
function extractEntitiesSection(pairs: Pair[]): Pair[] {
  let start = -1;
  let end = -1;
  for (let i = 0; i < pairs.length; i++) {
    const [c, v] = pairs[i];
    if (c === 0 && v === "SECTION" && i + 1 < pairs.length && pairs[i + 1][0] === 2 && pairs[i + 1][1] === "ENTITIES") {
      start = i + 2;
    }
    if (start !== -1 && c === 0 && v === "ENDSEC") {
      end = i;
      break;
    }
  }
  return start >= 0 && end > start ? pairs.slice(start, end) : [];
}

// Split section into per-entity blocks (each starting with a group-0 marker)
function splitEntityBlocks(pairs: Pair[]): Pair[][] {
  const blocks: Pair[][] = [];
  let cur: Pair[] = [];
  for (const pair of pairs) {
    if (pair[0] === 0) {
      if (cur.length > 0) blocks.push(cur);
      cur = [pair];
    } else {
      cur.push(pair);
    }
  }
  if (cur.length > 0) blocks.push(cur);
  return blocks;
}

// Helper — read the layer name (group code 8) from a block
function readLayer(block: Pair[]): string {
  return block.find(([c]) => c === 8)?.[1] ?? "0";
}

// ── Entity parsers ───────────────────────────────────────────────────────────

function parseLine(block: Pair[]): DXFLine {
  const v: Record<number, number> = {};
  for (const [c, s] of block) {
    if (c === 10 || c === 20 || c === 11 || c === 21) v[c] = parseFloat(s);
  }
  return {
    type: "line",
    layer: readLayer(block),
    x1: v[10] ?? 0, y1: v[20] ?? 0,
    x2: v[11] ?? 0, y2: v[21] ?? 0,
  };
}

function parseLWPolyline(block: Pair[]): DXFPolyline {
  let closed = false;
  const vertices: Array<{ x: number; y: number }> = [];
  let pendingX: number | null = null;
  for (const [c, s] of block) {
    if (c === 70) {
      closed = (parseInt(s, 10) & 1) !== 0;
    } else if (c === 10) {
      pendingX = parseFloat(s);
    } else if (c === 20 && pendingX !== null) {
      vertices.push({ x: pendingX, y: parseFloat(s) });
      pendingX = null;
    }
  }
  return { type: "polyline", layer: readLayer(block), vertices, closed };
}

function parseArc(block: Pair[]): DXFArc {
  const v: Record<number, number> = {};
  for (const [c, s] of block) {
    if (c === 10 || c === 20 || c === 40 || c === 50 || c === 51) v[c] = parseFloat(s);
  }
  return {
    type: "arc",
    layer: readLayer(block),
    cx: v[10] ?? 0, cy: v[20] ?? 0,
    r: v[40] ?? 0,
    startAngle: v[50] ?? 0,
    endAngle: v[51] ?? 360,
  };
}

function parseCircle(block: Pair[]): DXFCircle {
  const v: Record<number, number> = {};
  for (const [c, s] of block) {
    if (c === 10 || c === 20 || c === 40) v[c] = parseFloat(s);
  }
  return {
    type: "circle",
    layer: readLayer(block),
    cx: v[10] ?? 0, cy: v[20] ?? 0,
    r: v[40] ?? 0,
  };
}

// ── Layer filtering ──────────────────────────────────────────────────────────

// Keywords that commonly appear in PCB board-outline layer names across CAD tools.
// KiCad: "Edge.Cuts" | Altium: "Board" | OrCAD: "BOARD GEOMETRY/OUTLINE", "BOARD_OUTLINE"
const OUTLINE_KEYWORDS = ["edge", "outline", "board", "border", "contour", "perimeter", "mechanical"];

function looksLikeOutlineLayer(name: string): boolean {
  const l = name.toLowerCase();
  return OUTLINE_KEYWORDS.some((k) => l.includes(k));
}

/**
 * Try to return only entities on known board-outline layers.
 * If none are found, fall back to all geometry entities (LINE, POLYLINE, ARC).
 * CIRCLE entities are included in the fallback only if no outline layers were found,
 * because circles are often used for drills/vias rather than the board perimeter.
 */
function filterToOutline(entities: DXFEntity[]): DXFEntity[] {
  const outlined = entities.filter((e) => looksLikeOutlineLayer(e.layer));
  if (outlined.length > 0) return outlined;

  // No recognized outline layer — return all non-circle geometry as best-effort
  return entities.filter((e) => e.type !== "circle");
}

// ── Public API ───────────────────────────────────────────────────────────────

export function parseDXF(content: string, fileName: string): DXFData {
  const pairs = parsePairs(content);
  const section = extractEntitiesSection(pairs);
  const blocks = splitEntityBlocks(section);

  const all: DXFEntity[] = [];
  for (const block of blocks) {
    if (block.length === 0) continue;
    const type = block[0][1].toUpperCase();
    switch (type) {
      case "LINE":       all.push(parseLine(block));       break;
      case "LWPOLYLINE": all.push(parseLWPolyline(block)); break;
      case "ARC":        all.push(parseArc(block));        break;
      case "CIRCLE":     all.push(parseCircle(block));     break;
    }
  }

  const entities = filterToOutline(all);

  console.log(
    `[DXF] "${fileName}" — ${all.length} geometry entities parsed, ${entities.length} after layer filter`
  );

  return { entities, fileName, totalParsed: all.length };
}
