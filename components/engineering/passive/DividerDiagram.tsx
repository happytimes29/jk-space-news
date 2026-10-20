interface DividerDiagramProps {
  label: string;
  vin: string;
  rTop: string;
  rBottom: string;
  vout: string;
  load?: string;
}

function Resistor({ x, y, testId }: { x: number; y: number; testId?: string }) {
  return (
    <path
      d={`M ${x} ${y} l -9 8 l 18 12 l -18 12 l 18 12 l -18 12 l 18 12 l -9 8`}
      data-testid={testId}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
    />
  );
}

export function DividerDiagram({ label, vin, rTop, rBottom, vout, load }: DividerDiagramProps) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3">
      <svg
        role="img"
        aria-label={label}
        viewBox="0 0 520 320"
        className="h-auto min-w-[420px] text-[var(--color-text)]"
      >
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3">
          <path d="M 105 55 H 270 V 74 M 270 150 V 170 M 270 246 V 270 H 105 V 205" />
          <path d="M 270 160 H 435" />
          <path d="M 435 270 H 270" data-testid="divider-diagram-return" />
          <circle cx="270" cy="160" r="5" fill="var(--color-accent)" stroke="var(--color-accent)" />
          <circle cx="435" cy="160" r="5" fill="var(--color-card)" />
          <circle cx="435" cy="270" r="5" fill="var(--color-card)" />
          <path d="M 84 130 H 126 M 94 144 H 116" />
          <path d="M 105 55 V 130 M 105 144 V 205" />
          {load && <path d="M 400 160 V 174 M 400 250 V 270" />}
        </g>

        <Resistor x={270} y={74} />
        <Resistor x={270} y={170} />
        {load && <Resistor x={400} y={174} testId="divider-diagram-load-resistor" />}

        <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="15">
          <text x="72" y="105" fontWeight="700">+</text>
          <text x="75" y="180" fontWeight="700">−</text>
          <text x="38" y="233" data-testid="divider-diagram-vin">Vin {vin}</text>

          <text x="294" y="100" fontWeight="700">R1</text>
          <text x="294" y="121" data-testid="divider-diagram-r1">{rTop}</text>
          <text x="294" y="204" fontWeight="700">R2</text>
          <text x="294" y="225" data-testid="divider-diagram-r2">{rBottom}</text>

          <text x="354" y="105" fill="var(--color-accent)" fontWeight="700">Vout</text>
          <text x="354" y="126" data-testid="divider-diagram-vout">{vout}</text>

          {load && <>
            <text x="420" y="200" fontWeight="700">RL</text>
            <text x="420" y="221" data-testid="divider-diagram-load">{load}</text>
          </>}
        </g>

        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3">
          <path d="M 248 270 H 292 M 255 280 H 285 M 263 290 H 277" />
        </g>
      </svg>
    </div>
  );
}
