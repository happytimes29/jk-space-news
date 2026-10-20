interface ReactanceDiagramProps {
  label: string;
  frequency: string;
  inductance: string;
  capacitance: string;
  inductiveReactance: string;
  capacitiveReactance: string;
}

export function ReactanceDiagram({ label, frequency, inductance, capacitance, inductiveReactance, capacitiveReactance }: ReactanceDiagramProps) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3">
      <svg role="img" aria-label={label} viewBox="0 0 520 300" className="h-auto min-w-[420px] text-[var(--color-text)]">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
          <path d="M 55 105 H 155 C 155 84 180 84 180 105 C 180 126 205 126 205 105 C 205 84 230 84 230 105 C 230 126 255 126 255 105 H 465" />
          <circle cx="55" cy="105" r="5" fill="var(--color-card)" />
          <circle cx="465" cy="105" r="5" fill="var(--color-card)" />

          <path d="M 55 210 H 240 M 240 177 V 243 M 262 177 V 243 M 262 210 H 465" />
          <circle cx="55" cy="210" r="5" fill="var(--color-card)" />
          <circle cx="465" cy="210" r="5" fill="var(--color-card)" />
        </g>

        <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="15">
          <text x="260" y="30" textAnchor="middle" fill="var(--color-accent)" fontWeight="700" data-testid="reactance-diagram-frequency">f {frequency}</text>

          <text x="205" y="63" textAnchor="middle" fontWeight="700">L</text>
          <text x="205" y="82" textAnchor="middle" data-testid="reactance-diagram-l">{inductance}</text>
          <text x="365" y="143" textAnchor="middle" data-testid="reactance-diagram-xl">Xₗ {inductiveReactance}</text>

          <text x="251" y="160" textAnchor="middle" fontWeight="700">C</text>
          <text x="251" y="272" textAnchor="middle" data-testid="reactance-diagram-c">{capacitance}</text>
          <text x="365" y="248" textAnchor="middle" data-testid="reactance-diagram-xc">X꜀ {capacitiveReactance}</text>
        </g>
      </svg>
    </div>
  );
}
