import { useId } from "react";
import type { SmithPoint } from "@/lib/engineering/smith";
import { buildSmithGrid, type SmithChartMode, type SmithGridDetail, type SmithGridPrimitive } from "./smith-grid";

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
  const stable = (value: number) => Math.round(value * 1e12) / 1e12;
  return points.map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${stable(x)} ${stable(y)}`).join(" ");
}

function coordinate(point: SmithPoint | undefined): string {
  return point ? `${Number(point.x.toPrecision(5))}, ${Number(point.y.toPrecision(5))}` : "—";
}

function gridValueText(mode: SmithChartMode, primitive: Extract<SmithGridPrimitive, { kind: "value-label" }>): string {
  const value = Number(Math.abs(primitive.value).toPrecision(3));
  if (primitive.family === "constant") return `${mode === "impedance" ? "r" : "g"} ${value}`;
  return `${mode === "impedance" ? "x" : "b"} ${primitive.value > 0 ? "+" : "−"}${value}`;
}

export function SmithChart({ mode, paths, activePoint, targetPoint, labels, size = 640, showTable = true, detail = "detailed" }: { mode: SmithChartMode; paths: SmithPath[]; activePoint: SmithPoint; targetPoint: SmithPoint; labels: SmithChartLabels; size?: number; showTable?: boolean; detail?: SmithGridDetail }) {
  const clipId = `smith-clip-${useId().replace(/:/g, "")}`;
  const grid = buildSmithGrid(mode, detail);
  return <figure className="space-y-4">
    <svg role="img" aria-labelledby={`${clipId}-title`} aria-describedby={`${clipId}-description`} viewBox="-1.08 -1.08 2.16 2.16" width={size} height={size} className="h-auto w-full max-w-[640px]" style={{ background: "var(--color-card)" }}>
      <title id={`${clipId}-title`}>{labels.title}</title>
      <desc id={`${clipId}-description`}>{labels.description}</desc>
      <defs><clipPath id={clipId}><circle cx="0" cy="0" r="1" /></clipPath></defs>
      <g clipPath={`url(#${clipId})`} fill="none">
        {grid.filter((primitive) => primitive.kind === "path").map((primitive) => {
          const boundary = primitive.id === "unit-circle" || primitive.id === "real-axis";
          const level = boundary ? "boundary" : primitive.major ? "major" : "minor";
          return <path key={primitive.id} data-grid-level={level} d={pathData(primitive.points)} stroke={boundary ? "var(--color-text)" : primitive.major ? "var(--color-muted)" : "var(--color-border)"} strokeOpacity={boundary ? 0.72 : primitive.major ? 0.62 : 0.72} strokeWidth={boundary ? 1.5 : primitive.major ? 1 : 0.55} vectorEffect="non-scaling-stroke" />;
        })}
      </g>
      {grid.filter((primitive) => primitive.kind === "value-label").map((primitive) => <text key={primitive.id} x={primitive.x} y={primitive.y} textAnchor={primitive.textAnchor} dominantBaseline="middle" fontSize="0.04" fill="var(--color-muted)" stroke="var(--color-card)" strokeWidth="0.012" paintOrder="stroke">{gridValueText(mode, primitive)}</text>)}
      {grid.filter((primitive) => primitive.kind === "label").map((primitive) => <text key={primitive.id} x={primitive.x} y={primitive.y - 0.035} textAnchor={primitive.role === "open" ? "end" : primitive.role === "short" ? "start" : "middle"} fontSize="0.055" fill="var(--color-muted)" stroke="var(--color-card)" strokeWidth="0.014" paintOrder="stroke">{labels[primitive.role]}</text>)}
      <g data-legend="load" transform="translate(-0.94 -1.025)" fill="var(--color-text)" fontSize="0.04"><circle r="0.022" fill="var(--accent-orange)" stroke="var(--color-text)" strokeWidth="0.008" /><text x="0.04" y="0.014">{labels.load}</text></g>
      <g data-legend="target" transform="translate(-0.54 -1.025)" fill="var(--color-text)" fontSize="0.04"><rect x="-0.02" y="-0.02" width="0.04" height="0.04" fill="var(--accent-green)" stroke="var(--color-text)" strokeWidth="0.008" /><text x="0.04" y="0.014">{labels.target}</text></g>
      <g clipPath={`url(#${clipId})`} fill="none">
        {paths.map((path, index) => {
          const marker = path.points[Math.floor(path.points.length / 2)];
          return <g key={path.id}>
            <path data-network-path d={pathData(path.points)} stroke="var(--color-accent)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            {marker && <g data-path-marker={index + 1} transform={`translate(${marker.x} ${marker.y})`}><circle r="0.036" fill="var(--color-accent)" stroke="var(--color-card)" strokeWidth="0.009"><title>{path.label}</title></circle><text y="0.014" textAnchor="middle" fontSize="0.04" fontWeight="700" fill="white">{index + 1}</text></g>}
          </g>;
        })}
      </g>
      <circle data-marker="load" cx={activePoint.x} cy={activePoint.y} r="0.035" fill="var(--accent-orange)" stroke="var(--color-text)" strokeWidth="0.01"><title>{labels.load}</title></circle>
      <rect data-marker="target" x={targetPoint.x - 0.025} y={targetPoint.y - 0.025} width="0.05" height="0.05" fill="var(--accent-green)" stroke="var(--color-text)" strokeWidth="0.01"><title>{labels.target}</title></rect>
    </svg>
    {showTable && <div className="overflow-x-auto"><table aria-label={labels.pathTableTitle} className="w-full text-left text-sm"><thead><tr><th>{labels.pointLabel}</th><th>{labels.startLabel}</th><th>{labels.endLabel}</th></tr></thead><tbody>
      <tr><th>{labels.load}</th><td>{coordinate(activePoint)}</td><td>—</td></tr>
      <tr><th>{labels.target}</th><td>{coordinate(targetPoint)}</td><td>—</td></tr>
      {paths.map((path) => <tr key={path.id}><th>{path.label}</th><td>{coordinate(path.points[0])}</td><td>{coordinate(path.points.at(-1))}</td></tr>)}
    </tbody></table></div>}
  </figure>;
}
