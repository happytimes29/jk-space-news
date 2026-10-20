interface LineSymbolProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  orientation?: "horizontal" | "vertical";
  testId?: string;
}

function transformFor({ x1, y1, x2, y2 }: LineSymbolProps) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return { length, transform: `translate(${x1} ${y1}) rotate(${angle})` };
}

export function ResistorSymbol(props: LineSymbolProps) {
  const { length, transform } = transformFor(props);
  const lead = Math.min(18, length * 0.2);
  const step = (length - lead * 2) / 6;
  const points = [
    `${lead},0`,
    `${lead + step * 0.5},-8`,
    `${lead + step * 1.5},8`,
    `${lead + step * 2.5},-8`,
    `${lead + step * 3.5},8`,
    `${lead + step * 4.5},-8`,
    `${length - lead},0`,
  ].join(" ");

  return (
    <g data-testid={props.testId} transform={transform} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
      <path d={`M 0 0 H ${lead}`} />
      <polyline points={points} />
      <path d={`M ${length - lead} 0 H ${length}`} />
    </g>
  );
}

export function InductorSymbol(props: LineSymbolProps) {
  const { length, transform } = transformFor(props);
  const lead = Math.min(16, length * 0.18);
  const span = length - lead * 2;
  const radius = span / 8;

  return (
    <g data-testid={props.testId} transform={transform} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3">
      <path d={`M 0 0 H ${lead} c 0 ${-radius} ${radius * 2} ${-radius} ${radius * 2} 0 c 0 ${-radius} ${radius * 2} ${-radius} ${radius * 2} 0 c 0 ${-radius} ${radius * 2} ${-radius} ${radius * 2} 0 c 0 ${-radius} ${radius * 2} ${-radius} ${radius * 2} 0 H ${length}`} />
    </g>
  );
}

export function CapacitorSymbol(props: LineSymbolProps) {
  const { length, transform } = transformFor(props);
  const center = length / 2;

  return (
    <g data-testid={props.testId} transform={transform} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3">
      <path d={`M 0 0 H ${center - 5} M ${center - 5} -13 V 13 M ${center + 5} -13 V 13 M ${center + 5} 0 H ${length}`} />
    </g>
  );
}

export function GroundSymbol({ x, y, testId }: { x: number; y: number; testId?: string }) {
  return (
    <g data-testid={testId} transform={`translate(${x} ${y})`} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3">
      <path d="M 0 -18 V 0 M -22 0 H 22 M -15 8 H 15 M -7 16 H 7" />
    </g>
  );
}
