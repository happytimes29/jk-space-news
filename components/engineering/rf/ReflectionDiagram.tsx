import { ResistorSymbol } from "../diagrams/CircuitSymbols";
import { EngineeringDiagramFrame } from "../diagrams/EngineeringDiagramFrame";

interface ReflectionDiagramProps {
  label: string;
  description: string;
  values: { z0: string; zLoad: string; gamma: string; vswr: string; returnLoss: string; magnitude: number };
  labels: { incident: string; reflected: string; load: string; zeroReflection: string };
  limit: "finite" | "short" | "open";
  stale: boolean;
  staleLabel: string;
}

export function ReflectionDiagram({ label, description, values, labels, limit, stale, staleLabel }: ReflectionDiagramProps) {
  const reflectionOpacity = Math.max(0.18, Math.min(1, values.magnitude));
  return (
    <EngineeringDiagramFrame label={label} title={label} description={description} viewBox="0 0 700 340" stale={stale} staleLabel={staleLabel} minWidthClassName="min-w-[540px]">
      <defs>
        <marker id="incident-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="var(--color-accent)" /></marker>
        <marker id="reflected-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="currentColor" /></marker>
      </defs>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3">
        <path d="M70 170H570" />
        <path d="M100 115H500" stroke="var(--color-accent)" strokeWidth="5" markerEnd="url(#incident-arrow)" />
        <path d="M500 225H100" strokeWidth="5" opacity={reflectionOpacity} markerEnd="url(#reflected-arrow)" data-testid="reflected-arrow" />
      </g>
      {limit === "finite" && <g data-testid="finite-load"><ResistorSymbol x1={570} y1={110} x2={570} y2={235} orientation="vertical" /><path d="M570 110V85 M570 235V260" stroke="currentColor" strokeWidth="3" /></g>}
      {limit === "short" && <g data-testid="short-load" fill="none" stroke="currentColor" strokeWidth="5"><path d="M570 85V260" /><path d="M545 260H595" /></g>}
      {limit === "open" && <g data-testid="open-load" fill="var(--color-card)" stroke="currentColor" strokeWidth="3"><circle cx="570" cy="145" r="8" /><circle cx="570" cy="195" r="8" /></g>}
      <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="14">
        <text x="300" y="94" textAnchor="middle">{labels.incident}</text><text x="300" y="250" textAnchor="middle">{labels.reflected}</text>
        {values.magnitude === 0 && <text x="300" y="278" textAnchor="middle">{labels.zeroReflection}</text>}
        <text x="570" y="50" textAnchor="middle">{labels.load}</text><text x="570" y="72" textAnchor="middle">{values.zLoad}</text>
        <text x="70" y="305">Z₀ {values.z0}</text><text x="245" y="305">Γ {values.gamma}</text><text x="455" y="305">VSWR {values.vswr}</text><text x="455" y="328">RL {values.returnLoss}</text>
      </g>
    </EngineeringDiagramFrame>
  );
}
