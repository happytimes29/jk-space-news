import { EngineeringDiagramFrame } from "../diagrams/EngineeringDiagramFrame";

interface PropagationDiagramProps {
  label: string;
  description: string;
  values: { frequency: string; wavelength: string; half: string; quarter: string; length: string; delay: string; angle: string; medium: string; repeated: boolean };
  labels: { frequency: string; wavelength: string; half: string; quarter: string; length: string; delay: string; angle: string; medium: string; waveDirection: string };
  stale: boolean;
  staleLabel: string;
}

export function PropagationDiagram({ label, description, values, labels, stale, staleLabel }: PropagationDiagramProps) {
  return (
    <EngineeringDiagramFrame label={label} title={label} description={description} viewBox="0 0 720 360" stale={stale} staleLabel={staleLabel} minWidthClassName="min-w-[560px]">
      <defs><marker id="wave-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="var(--color-accent)" /></marker></defs>
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M70 145 C100 80 130 80 160 145 S220 210 250 145 S310 80 340 145 S400 210 430 145 S490 80 520 145 S580 210 610 145" stroke="var(--color-accent)" strokeWidth="4" />
        <path d="M70 55 H630" markerEnd="url(#wave-arrow)" />
        <path d="M70 228 H630 M70 218V238 M210 218V238 M350 218V238 M630 218V238" />
        <path d="M70 280 H520" strokeDasharray="5 5" /><path d="M70 270V290 M520 270V290" />
      </g>
      <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="14">
        <text x="350" y="42" textAnchor="middle">{labels.waveDirection}</text>
        <text x="70" y="205">0</text><text x="210" y="205" textAnchor="middle">λ/4 {values.quarter}</text><text x="350" y="205" textAnchor="middle">λ/2 {values.half}</text><text x="630" y="205" textAnchor="end">λ {values.wavelength}</text>
        <text x="295" y="305" textAnchor="middle" data-testid="propagation-length">{labels.length}: {values.length}</text>
        {values.repeated && <text x="560" y="292" fontSize="28" data-testid="propagation-repeat-marker">…</text>}
        <text x="70" y="330">{labels.frequency}: {values.frequency}</text><text x="350" y="330" textAnchor="middle" data-testid="propagation-medium">{labels.medium}: {values.medium}</text>
        <text x="650" y="315" textAnchor="end">{labels.angle}: {values.angle}</text><text x="650" y="340" textAnchor="end">{labels.delay}: {values.delay}</text>
      </g>
    </EngineeringDiagramFrame>
  );
}
