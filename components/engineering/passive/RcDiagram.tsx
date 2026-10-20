interface RcDiagramProps {
  label: string;
  resistance: string;
  capacitance: string;
  cutoff: string;
  timeConstant: string;
}

export function RcDiagram({ label, resistance, capacitance, cutoff, timeConstant }: RcDiagramProps) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3">
      <svg
        role="img"
        aria-label={label}
        viewBox="0 0 520 290"
        className="h-auto min-w-[420px] text-[var(--color-text)]"
      >
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
          <path d="M 50 105 H 130" />
          <path d="M 130 105 l 10 -10 l 16 20 l 16 -20 l 16 20 l 16 -20 l 16 20 l 10 -10" />
          <path d="M 230 105 H 445" />
          <circle cx="315" cy="105" r="5" fill="var(--color-accent)" stroke="var(--color-accent)" />
          <circle cx="445" cy="105" r="5" fill="var(--color-card)" />
          <path d="M 315 105 V 155 M 286 155 H 344 M 286 174 H 344 M 315 174 V 220" />
          <path d="M 290 220 H 340 M 298 231 H 332 M 307 242 H 323" />
        </g>

        <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="15">
          <text x="50" y="88" fontWeight="700">Vin</text>
          <text x="163" y="68" fontWeight="700">R</text>
          <text x="135" y="88" data-testid="rc-diagram-r">{resistance}</text>
          <text x="336" y="150" fontWeight="700">C</text>
          <text x="354" y="171" data-testid="rc-diagram-c">{capacitance}</text>
          <text x="367" y="88" fill="var(--color-accent)" fontWeight="700">Vout</text>

          <text x="50" y="270" data-testid="rc-diagram-cutoff">fc {cutoff}</text>
          <text x="302" y="270" data-testid="rc-diagram-time">τ {timeConstant}</text>
        </g>
      </svg>
    </div>
  );
}
