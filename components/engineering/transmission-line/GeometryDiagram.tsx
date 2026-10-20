import type { TransmissionLineKind } from "@/lib/engineering/transmission-line-solver";
import { EngineeringDiagramFrame } from "../diagrams/EngineeringDiagramFrame";

export interface GeometryLabels {
  width: string;
  thickness: string;
  height: string;
  planes: string;
  gap: string;
  conductor: string;
  dielectric: string;
  ground: string;
  impedance: string;
  electricalAngle: string;
}

export interface GeometryDiagramValues {
  width: string;
  thickness: string;
  heightOrPlanes: string;
  gap?: string;
  permittivity: string;
  impedance: string;
  electricalAngle: string;
}

interface GeometryDiagramProps {
  kind: TransmissionLineKind;
  title: string;
  description: string;
  labels: GeometryLabels;
  values: GeometryDiagramValues;
  stale: boolean;
  staleLabel: string;
}

const dimensionClass = "fill-[var(--color-text)] text-[13px] font-semibold";
const valueClass = "fill-[var(--color-muted)] text-[12px]";

function Dimension({ x, y, label, value, anchor = "middle" }: { x: number; y: number; label: string; value: string; anchor?: "start" | "middle" | "end" }) {
  return <text x={x} y={y} textAnchor={anchor}><tspan className={dimensionClass}>{label}</tspan><tspan dx="5" className={valueClass}>{value}</tspan></text>;
}

export function GeometryDiagram({ kind, title, description, labels, values, stale, staleLabel }: GeometryDiagramProps) {
  const heightLabel = kind === "stripline" ? labels.planes : labels.height;

  return (
    <EngineeringDiagramFrame label={title} title={title} description={description} viewBox="0 0 560 360" stale={stale} staleLabel={staleLabel} minWidthClassName="min-w-[500px]">
      <defs>
        <marker id="tl-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-muted)" />
        </marker>
      </defs>

      <rect x="45" y="72" width="360" height="160" rx="8" fill="var(--color-card)" stroke="var(--color-border)" />
      <text x="60" y="214" className={valueClass}>{labels.dielectric}: {values.permittivity}</text>

      {kind === "stripline" ? <>
        <rect x="45" y="56" width="360" height="14" rx="3" fill="var(--color-muted)" />
        <rect x="45" y="234" width="360" height="14" rx="3" fill="var(--color-muted)" />
        <rect x="180" y="145" width="90" height="12" rx="2" fill="var(--color-accent)" />
        <line x1="180" y1="132" x2="270" y2="132" stroke="var(--color-muted)" markerStart="url(#tl-arrow)" markerEnd="url(#tl-arrow)" />
        <Dimension x={225} y={122} label={labels.width} value={values.width} />
        <Dimension x={278} y={158} label={labels.thickness} value={values.thickness} anchor="start" />
        <line x1="424" y1="63" x2="424" y2="241" stroke="var(--color-muted)" markerStart="url(#tl-arrow)" markerEnd="url(#tl-arrow)" />
        <Dimension x={438} y={156} label={heightLabel} value={values.heightOrPlanes} anchor="start" />
      </> : kind === "cpwg" ? <>
        <rect x="45" y="234" width="360" height="14" rx="3" fill="var(--color-muted)" />
        <rect x="45" y="91" width="112" height="12" rx="2" fill="var(--color-muted)" />
        <rect x="190" y="91" width="72" height="12" rx="2" fill="var(--color-accent)" />
        <rect x="295" y="91" width="110" height="12" rx="2" fill="var(--color-muted)" />
        <line x1="190" y1="78" x2="262" y2="78" stroke="var(--color-muted)" markerStart="url(#tl-arrow)" markerEnd="url(#tl-arrow)" />
        <Dimension x={226} y={67} label={labels.width} value={values.width} />
        <Dimension x={268} y={103} label={labels.thickness} value={values.thickness} anchor="start" />
        <line x1="157" y1="119" x2="190" y2="119" stroke="var(--color-muted)" markerStart="url(#tl-arrow)" markerEnd="url(#tl-arrow)" />
        <Dimension x={173} y={137} label={labels.gap} value={values.gap ?? "—"} />
        <line x1="424" y1="97" x2="424" y2="241" stroke="var(--color-muted)" markerStart="url(#tl-arrow)" markerEnd="url(#tl-arrow)" />
        <Dimension x={438} y={174} label={heightLabel} value={values.heightOrPlanes} anchor="start" />
      </> : <>
        <rect x="45" y="234" width="360" height="14" rx="3" fill="var(--color-muted)" />
        <rect x="180" y="91" width="90" height="12" rx="2" fill="var(--color-accent)" />
        <line x1="180" y1="78" x2="270" y2="78" stroke="var(--color-muted)" markerStart="url(#tl-arrow)" markerEnd="url(#tl-arrow)" />
        <Dimension x={225} y={67} label={labels.width} value={values.width} />
        <Dimension x={278} y={103} label={labels.thickness} value={values.thickness} anchor="start" />
        <line x1="424" y1="97" x2="424" y2="241" stroke="var(--color-muted)" markerStart="url(#tl-arrow)" markerEnd="url(#tl-arrow)" />
        <Dimension x={438} y={174} label={heightLabel} value={values.heightOrPlanes} anchor="start" />
      </>}

      <g transform="translate(45 282)">
        <circle cx="7" cy="-4" r="6" fill="var(--color-accent)" /><text x="19" y="0" className={valueClass}>{labels.conductor}</text>
        <circle cx="142" cy="-4" r="6" fill="var(--color-card)" stroke="var(--color-border)" /><text x="154" y="0" className={valueClass}>{labels.dielectric}</text>
        <circle cx="277" cy="-4" r="6" fill="var(--color-muted)" /><text x="289" y="0" className={valueClass}>{labels.ground}</text>
      </g>
      <rect x="45" y="310" width="510" height="36" rx="8" fill="var(--color-card)" stroke="var(--color-border)" />
      <text x="62" y="333" className={dimensionClass}>{labels.impedance}: <tspan className={valueClass}>{values.impedance}</tspan></text>
      <text x="320" y="333" className={dimensionClass}>{labels.electricalAngle}: <tspan className={valueClass}>{values.electricalAngle}</tspan></text>
    </EngineeringDiagramFrame>
  );
}
