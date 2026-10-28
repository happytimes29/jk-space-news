"use client";

import { useEffect, useRef, useState } from "react";
import { computeSignalFrame, selectSignalFieldMode, type SignalFieldMode, type SignalPointer } from "./home-signal-field";

function drawFrame(context: CanvasRenderingContext2D, width: number, height: number, progress: number, pointer: SignalPointer) {
  const frame = computeSignalFrame({ width, height, progress, pointer });
  context.clearRect(0, 0, width, height);
  context.lineCap = "round";
  context.lineJoin = "round";

  for (const trace of frame.traces) {
    context.beginPath();
    context.moveTo(trace.from.x, trace.from.y);
    context.lineTo(trace.to.x, trace.to.y);
    context.strokeStyle = `rgba(23, 32, 58, ${trace.opacity})`;
    context.lineWidth = 1;
    context.stroke();
  }
  for (const arc of frame.smithArcs) {
    context.beginPath();
    context.arc(arc.x, arc.y, arc.radius, arc.start, arc.end);
    context.strokeStyle = `rgba(23, 32, 58, ${arc.opacity})`;
    context.lineWidth = 1;
    context.stroke();
  }
  if (frame.signalPath.length > 1) {
    context.beginPath();
    context.moveTo(frame.signalPath[0].x, frame.signalPath[0].y);
    for (const point of frame.signalPath.slice(1)) context.lineTo(point.x, point.y);
    context.strokeStyle = "#a73b2b";
    context.lineWidth = 2;
    context.stroke();
  }
  for (const node of frame.nodes) {
    context.beginPath();
    context.arc(node.x, node.y, 2.2, 0, Math.PI * 2);
    context.fillStyle = "rgba(23, 32, 58, 0.58)";
    context.fill();
  }
  if (frame.matchPoint) {
    context.beginPath();
    context.arc(frame.matchPoint.x, frame.matchPoint.y, 6, 0, Math.PI * 2);
    context.fillStyle = "#a88654";
    context.fill();
    context.strokeStyle = "#f6f1e7";
    context.lineWidth = 2;
    context.stroke();
  }
  if (frame.jkMark) {
    context.save();
    context.globalAlpha = frame.jkMark.opacity;
    context.fillStyle = "#17203a";
    context.font = `${Math.max(18, Math.min(width, height) * 0.055)}px Georgia, serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("JK", frame.jkMark.x, frame.jkMark.y);
    context.restore();
  }
}

export function HomeSignalField({ label }: { label: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<SignalFieldMode>("static");

  useEffect(() => {
    const canQueryMedia = typeof window.matchMedia === "function";
    const reducedMotion = !canQueryMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = canQueryMedia && window.matchMedia("(pointer: coarse)").matches;
    const canvasAvailable = reducedMotion || coarsePointer
      ? false
      : Boolean(document.createElement("canvas").getContext("2d"));
    setMode(selectSignalFieldMode({ reducedMotion, coarsePointer, canvasAvailable }));
  }, []);

  useEffect(() => {
    if (mode !== "interactive") return;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!root || !canvas || !context) return;

    let width = 0;
    let height = 0;
    let visible = false;
    let frameId = 0;
    let pointer: SignalPointer = null;

    const progress = () => {
      const bounds = root.getBoundingClientRect();
      const travel = Math.max(1, bounds.height + window.innerHeight);
      return Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / travel));
    };
    const paint = () => {
      frameId = 0;
      if (!visible || width <= 0 || height <= 0) return;
      drawFrame(context, width, height, progress(), pointer);
    };
    const schedule = () => {
      if (visible && frameId === 0) frameId = window.requestAnimationFrame(paint);
    };
    const resize = new ResizeObserver(([entry]) => {
      width = Math.max(0, entry.contentRect.width);
      height = Math.max(0, entry.contentRect.height);
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      schedule();
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible && frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
      schedule();
    });
    const onPointerMove = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      schedule();
    };
    const onPointerLeave = () => { pointer = null; schedule(); };

    resize.observe(root);
    intersection.observe(root);
    window.addEventListener("scroll", schedule, { passive: true });
    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave);

    return () => {
      resize.disconnect();
      intersection.disconnect();
      window.removeEventListener("scroll", schedule);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [mode]);

  return (
    <figure ref={rootRef} className="v2-home-hero__signal-field" data-signal-field-host data-mode={mode} role="img" aria-label={label}>
      {mode === "interactive" ? <canvas ref={canvasRef} aria-hidden="true" /> : (
        <div className="v2-signal-static" data-testid="signal-field-static" aria-hidden="true">
          <span className="v2-signal-static__arc v2-signal-static__arc--one" />
          <span className="v2-signal-static__arc v2-signal-static__arc--two" />
          <span className="v2-signal-static__trace" />
          <span className="v2-signal-static__match" />
          <strong>JK</strong>
          <small>1.000 GHz · 50 Ω</small>
        </div>
      )}
    </figure>
  );
}
