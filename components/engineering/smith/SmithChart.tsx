import { useId } from "react";
import type { SmithPoint } from "@/lib/engineering/smith";
import { buildSmithGrid, type SmithChartMode } from "./smith-grid";

export interface SmithPath { id: string; label: string; points: SmithPoint[] }
export interface SmithChartLabels {
  title: string;
  description: string;
  load: string;
  target: string;
  center: string;
  open: string;
  short: string;
  pathTableTitle: string;
  pointLabel: string;
  startLabel: string;
  endLabel: string;
}

function pathData(points: Array<{ x: number; y: number }>): string {
  return points.map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
}

function coordinate(point: SmithPoint | undefined): string {
  return point ? `${Number(point.x.toPrecision(5))}, ${Number(point.y.toPrecision(5))}` : "—";
}

export function SmithChart({ mode, paths, activePoint, targetPoint, labels, size = 640 }: { mode: SmithChartMode; paths: SmithPath[]; activePoint: SmithPoint; targetPoint: SmithPoint; labels: SmithChartLabels; size?: number }) {
  const clipId = `smith-clip-${useId().replace(/:/g, "")}`;
  const grid = buildSmithGrid(mode);
  return <figure className="space-y-4">
    <svg role="img" aria-labelledby={`${clipId}-title`} aria-describedby={`${clipId}-description`} viewBox="-1.08 -1.08 2.16 2.16" width={size} height={size} className="h-auto w-full max-w-[640px]" style={{ background: "var(--color-card)" }}>
      <title id={`${clipId}-title`}>{labels.title}</title>
      <desc id={`${clipId}-description`}>{labels.description}</desc>
      <defs><clipPath id={clipId}><circle cx="0" cy="0" r="1" /></clipPath></defs>
      <g clipPath={`url(#${clipId})`} fill="none" stroke="var(--color-border)">
        {grid.filter((primitive) => primitive.kind === "path").map((primitive) => <path key={primitive.id} d={pathData(primitive.points)} strokeWidth={primitive.major ? 0.012 : 0.006} vectorEffect="non-scaling-stroke" />)}
      </g>
      {grid.filter((primitive) => primitive.kind === "label").map((primitive) => <text key={primitive.id} x={primitive.x} y={primitive.y - 0.035} textAnchor={primitive.role === "open" ? "end" : primitive.role === "short" ? "start" : "middle"} fontSize="0.055" fill="var(--color-muted)">{labels[primitive.role]}</text>)}
      <g clipPath={`url(#${clipId})`} fill="none">
        {paths.map((path) => <g key={path.id}>
          <path d={pathData(path.points)} stroke="var(--color-accent)" strokeWidth="0.018" vectorEffect="non-scaling-stroke" />
          {path.points[Math.floor(path.points.length / 2)] && <text x={path.points[Math.floor(path.points.length / 2)].x} y={path.points[Math.floor(path.points.length / 2)].y - 0.035} fontSize="0.045" fill="var(--color-text)">{path.label}</text>}
        </g>)}
      </g>
      <circle data-marker="load" cx={activePoint.x} cy={activePoint.y} r="0.035" fill="var(--accent-orange)" stroke="var(--color-text)" strokeWidth="0.01"><title>{labels.load}</title></circle>
      <rect data-marker="target" x={targetPoint.x - 0.025} y={targetPoint.y - 0.025} width="0.05" height="0.05" fill="var(--accent-green)" stroke="var(--color-text)" strokeWidth="0.01"><title>{labels.target}</title></rect>
    </svg>
    <div className="overflow-x-auto"><table aria-label={labels.pathTableTitle} className="w-full text-left text-sm"><thead><tr><th>{labels.pointLabel}</th><th>{labels.startLabel}</th><th>{labels.endLabel}</th></tr></thead><tbody>
      <tr><th>{labels.load}</th><td>{coordinate(activePoint)}</td><td>—</td></tr>
      <tr><th>{labels.target}</th><td>{coordinate(targetPoint)}</td><td>—</td></tr>
      {paths.map((path) => <tr key={path.id}><th>{path.label}</th><td>{coordinate(path.points[0])}</td><td>{coordinate(path.points.at(-1))}</td></tr>)}
    </tbody></table></div>
  </figure>;
}
