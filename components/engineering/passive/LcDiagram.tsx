interface LcDiagramProps {
  label: string;
  inductance: string;
  capacitance: string;
  resonance: string;
}

export function LcDiagram({ label, inductance, capacitance, resonance }: LcDiagramProps) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3">
      <svg
        role="img"
        aria-label={label}
        viewBox="0 0 520 290"
        className="h-auto min-w-[420px] text-[var(--color-text)]"
      >
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
          <path d="M 130 60 H 390 M 130 220 H 390" />
          <circle cx="260" cy="60" r="5" fill="var(--color-accent)" stroke="var(--color-accent)" />
          <path d="M 200 60 V 88 C 180 88 180 111 200 111 C 220 111 220 134 200 134 C 180 134 180 157 200 157 C 220 157 220 180 200 180 V 220" />
          <path d="M 330 60 V 122 M 300 122 H 360 M 300 142 H 360 M 330 142 V 220" />
          <path d="M 235 220 H 285 M 243 231 H 277 M 252 242 H 268" />
        </g>

        <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="15">
          <text x="154" y="104" fontWeight="700">L</text>
          <text x="110" y="126" data-testid="lc-diagram-l">{inductance}</text>
          <text x="374" y="124" fontWeight="700">C</text>
          <text x="374" y="146" data-testid="lc-diagram-c">{capacitance}</text>
          <text x="260" y="38" textAnchor="middle" fill="var(--color-accent)" fontWeight="700">LC tank</text>
          <text x="260" y="274" textAnchor="middle" data-testid="lc-diagram-resonance">f₀ {resonance}</text>
        </g>
      </svg>
    </div>
  );
}
