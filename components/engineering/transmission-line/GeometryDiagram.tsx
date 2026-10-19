import type { TransmissionLineKind } from "@/lib/engineering/transmission-line-solver";

export interface GeometryLabels { width: string; thickness: string; height: string; planes: string; gap: string }

export function GeometryDiagram({ kind, title, labels }: { kind: TransmissionLineKind; title: string; labels: GeometryLabels }) {
  return <svg role="img" aria-label={title} viewBox="0 0 420 220" className="h-auto w-full max-w-lg rounded-xl bg-[var(--color-input-bg)]">
    <rect x="30" y="50" width="360" height="130" fill="var(--color-card)" stroke="var(--color-border)" />
    {kind === "stripline" ? <>
      <rect x="30" y="35" width="360" height="12" fill="var(--color-muted)" />
      <rect x="30" y="183" width="360" height="12" fill="var(--color-muted)" />
      <rect x="165" y="108" width="90" height="10" fill="var(--color-accent)" />
      <text x="210" y="102" textAnchor="middle">{labels.width}</text><text x="260" y="117">{labels.thickness}</text><text x="45" y="115">{labels.planes}</text>
    </> : kind === "cpwg" ? <>
      <rect x="30" y="180" width="360" height="12" fill="var(--color-muted)" />
      <rect x="30" y="46" width="110" height="10" fill="var(--color-muted)" /><rect x="170" y="46" width="80" height="10" fill="var(--color-accent)" /><rect x="280" y="46" width="110" height="10" fill="var(--color-muted)" />
      <text x="210" y="40" textAnchor="middle">{labels.width}</text><text x="255" y="57">{labels.thickness}</text><text x="155" y="75" textAnchor="middle">{labels.gap}</text><text x="400" y="120" textAnchor="end">{labels.height}</text>
    </> : <>
      <rect x="30" y="180" width="360" height="12" fill="var(--color-muted)" />
      <rect x="165" y="46" width="90" height="10" fill="var(--color-accent)" />
      <text x="210" y="40" textAnchor="middle">{labels.width}</text><text x="260" y="57">{labels.thickness}</text><text x="390" y="120" textAnchor="end">{labels.height}</text>
    </>}
  </svg>;
}
