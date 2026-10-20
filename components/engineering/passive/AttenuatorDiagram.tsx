interface AttenuatorDiagramProps {
  label: string;
  topology: "tee" | "pi";
  topologyLabel: string;
  attenuation: string;
  impedance: string;
  r1: string;
  r2: string;
  r3: string;
}

function TeeNetwork() {
  return <g data-testid="attenuator-tee-network" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
    <path d="M 35 105 H 75 l 10 -10 l 15 20 l 15 -20 l 15 20 l 15 -20 l 10 10 H 260" />
    <path d="M 260 105 H 365 l 10 -10 l 15 20 l 15 -20 l 15 20 l 15 -20 l 10 10 H 485" />
    <path d="M 260 105 V 135 l -10 9 l 20 14 l -20 14 l 20 14 l -20 14 l 10 9 V 238" />
    <path d="M 228 238 H 292 M 237 249 H 283 M 247 260 H 273" />
    <circle cx="35" cy="105" r="5" fill="var(--color-card)" />
    <circle cx="260" cy="105" r="5" fill="var(--color-accent)" stroke="var(--color-accent)" />
    <circle cx="485" cy="105" r="5" fill="var(--color-card)" />
  </g>;
}

function PiNetwork() {
  return <g data-testid="attenuator-pi-network" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
    <path d="M 35 105 H 215 l 10 -10 l 15 20 l 15 -20 l 15 20 l 15 -20 l 10 10 H 485" />
    <path d="M 120 105 V 135 l -10 9 l 20 14 l -20 14 l 20 14 l -20 14 l 10 9 V 238" />
    <path d="M 400 105 V 135 l -10 9 l 20 14 l -20 14 l 20 14 l -20 14 l 10 9 V 238" />
    <path d="M 88 238 H 152 M 97 249 H 143 M 107 260 H 133 M 368 238 H 432 M 377 249 H 423 M 387 260 H 413" />
    <circle cx="35" cy="105" r="5" fill="var(--color-card)" />
    <circle cx="120" cy="105" r="5" fill="var(--color-accent)" stroke="var(--color-accent)" />
    <circle cx="400" cy="105" r="5" fill="var(--color-accent)" stroke="var(--color-accent)" />
    <circle cx="485" cy="105" r="5" fill="var(--color-card)" />
  </g>;
}

export function AttenuatorDiagram({ label, topology, topologyLabel, attenuation, impedance, r1, r2, r3 }: AttenuatorDiagramProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3">
      <svg role="img" aria-label={label} viewBox="0 0 520 320" className="h-auto min-w-[420px] text-[var(--color-text)]">
        {topology === "tee" ? <TeeNetwork /> : <PiNetwork />}
        <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="14">
          <text x="260" y="28" textAnchor="middle" fill="var(--color-accent)" fontWeight="700" data-testid="attenuator-diagram-topology">{topologyLabel}</text>
          {topology === "tee" ? <>
            <text x="115" y="72" textAnchor="middle" data-testid="attenuator-diagram-r1">R1 {r1}</text>
            <text x="282" y="174" data-testid="attenuator-diagram-r2">R2 {r2}</text>
            <text x="405" y="72" textAnchor="middle" data-testid="attenuator-diagram-r3">R3 {r3}</text>
          </> : <>
            <text x="143" y="174" data-testid="attenuator-diagram-r1">R1 {r1}</text>
            <text x="260" y="72" textAnchor="middle" data-testid="attenuator-diagram-r2">R2 {r2}</text>
            <text x="377" y="174" textAnchor="end" data-testid="attenuator-diagram-r3">R3 {r3}</text>
          </>}
          <text x="110" y="302" data-testid="attenuator-diagram-attenuation">A {attenuation}</text>
          <text x="325" y="302" data-testid="attenuator-diagram-impedance">Z₀ {impedance}</text>
        </g>
      </svg>
    </div>
  );
}
