interface RlcDiagramProps {
  label: string;
  topology: "series" | "parallel";
  topologyLabel: string;
  resistance: string;
  inductance: string;
  capacitance: string;
  resonance: string;
  quality: string;
  bandwidth: string;
}

function SeriesCircuit() {
  return <g data-testid="rlc-series-circuit" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
    <path d="M 35 115 H 90 M 90 115 l 9 -10 l 14 20 l 14 -20 l 14 20 l 14 -20 l 9 10 H 195" />
    <path d="M 195 115 C 195 94 220 94 220 115 C 220 136 245 136 245 115 C 245 94 270 94 270 115 C 270 136 295 136 295 115 H 330" />
    <path d="M 330 82 V 148 M 350 82 V 148 M 350 115 H 485" />
    <circle cx="35" cy="115" r="5" fill="var(--color-card)" />
    <circle cx="485" cy="115" r="5" fill="var(--color-card)" />
  </g>;
}

function ParallelCircuit() {
  return <g data-testid="rlc-parallel-circuit" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
    <path d="M 100 55 H 420 M 100 205 H 420" />
    <path d="M 170 55 V 85 l -9 8 l 18 12 l -18 12 l 18 12 l -18 12 l 9 8 V 205" />
    <path d="M 260 55 V 84 C 240 84 240 107 260 107 C 280 107 280 130 260 130 C 240 130 240 153 260 153 C 280 153 280 176 260 176 V 205" />
    <path d="M 350 55 V 116 M 320 116 H 380 M 320 136 H 380 M 350 136 V 205" />
    <circle cx="260" cy="55" r="5" fill="var(--color-accent)" stroke="var(--color-accent)" />
  </g>;
}

export function RlcDiagram({ label, topology, topologyLabel, resistance, inductance, capacitance, resonance, quality, bandwidth }: RlcDiagramProps) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3">
      <svg role="img" aria-label={label} viewBox="0 0 520 310" className="h-auto min-w-[420px] text-[var(--color-text)]">
        {topology === "series" ? <SeriesCircuit /> : <ParallelCircuit />}
        <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="14">
          <text x="260" y="28" textAnchor="middle" fill="var(--color-accent)" fontWeight="700" data-testid="rlc-diagram-topology">{topologyLabel}</text>
          {topology === "series" ? <>
            <text x="122" y="76" textAnchor="middle" fontWeight="700">R</text>
            <text x="122" y="96" textAnchor="middle" data-testid="rlc-diagram-r">{resistance}</text>
            <text x="245" y="76" textAnchor="middle" fontWeight="700">L</text>
            <text x="245" y="96" textAnchor="middle" data-testid="rlc-diagram-l">{inductance}</text>
            <text x="340" y="62" textAnchor="middle" fontWeight="700">C</text>
            <text x="340" y="168" textAnchor="middle" data-testid="rlc-diagram-c">{capacitance}</text>
          </> : <>
            <text x="138" y="112" textAnchor="end" fontWeight="700">R</text>
            <text x="138" y="134" textAnchor="end" data-testid="rlc-diagram-r">{resistance}</text>
            <text x="226" y="112" textAnchor="end" fontWeight="700">L</text>
            <text x="226" y="134" textAnchor="end" data-testid="rlc-diagram-l">{inductance}</text>
            <text x="391" y="112" fontWeight="700">C</text>
            <text x="391" y="134" data-testid="rlc-diagram-c">{capacitance}</text>
          </>}
          <text x="42" y="258" data-testid="rlc-diagram-resonance">f₀ {resonance}</text>
          <text x="220" y="258" data-testid="rlc-diagram-q">Q {quality}</text>
          <text x="330" y="258" data-testid="rlc-diagram-bandwidth">BW {bandwidth}</text>
        </g>
      </svg>
    </div>
  );
}
