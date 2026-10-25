export function EditorialSignalPanel() {
  const verticals = Array.from({ length: 13 }, (_, index) => 32 + index * 52);
  const horizontals = Array.from({ length: 8 }, (_, index) => 34 + index * 52);

  return (
    <figure className="editorial-signal" aria-label="Engineering signal study">
      <div className="editorial-signal__meta">
        <span>FIELD SIGNAL / 01</span>
        <span>1.000 GHz</span>
      </div>
      <svg viewBox="0 0 720 430" role="img" aria-labelledby="signal-title signal-desc">
        <title id="signal-title">Engineering signal study</title>
        <desc id="signal-desc">A measured waveform drawn over a technical grid.</desc>
        <g className="editorial-signal__grid" aria-hidden="true">
          {verticals.map((x) => <line key={`v-${x}`} x1={x} x2={x} y1="28" y2="398" />)}
          {horizontals.map((y) => <line key={`h-${y}`} x1="28" x2="692" y1={y} y2={y} />)}
        </g>
        <line className="editorial-signal__axis" x1="28" x2="692" y1="216" y2="216" />
        <path
          className="editorial-signal__trace editorial-signal__trace--ghost"
          d="M28 260 C76 260 83 95 137 95 S195 332 252 332 S306 148 365 148 S421 270 478 270 S534 184 585 184 S646 216 692 216"
        />
        <path
          className="editorial-signal__trace"
          d="M28 216 C70 216 84 121 131 121 S187 307 244 307 S303 158 360 158 S418 261 475 261 S530 185 584 185 S645 216 692 216"
        />
        <g className="editorial-signal__markers" aria-hidden="true">
          <circle cx="131" cy="121" r="5" />
          <circle cx="244" cy="307" r="5" />
          <circle cx="475" cy="261" r="5" />
        </g>
      </svg>
      <figcaption>
        <span>Z<sub>0</sub> 50 Ω</span>
        <span>S11 −18.4 dB</span>
        <span>Δ 0.02</span>
      </figcaption>
    </figure>
  );
}
