export type SmithChartMode = "impedance" | "admittance";
export interface GridPoint { x: number; y: number }
export type SmithGridPrimitive =
  | { kind: "path"; id: string; points: GridPoint[]; major: boolean }
  | { kind: "label"; id: string; role: "center" | "open" | "short"; x: number; y: number };

const RESISTANCE_VALUES = [0, 0.2, 0.5, 1, 2, 5] as const;
const REACTIVE_VALUES = [0.2, 0.5, 1, 2, 5] as const;

function impedanceGamma(re: number, im: number): GridPoint {
  const denominator = (re + 1) ** 2 + im ** 2;
  const gammaRe = (re ** 2 + im ** 2 - 1) / denominator;
  const gammaIm = 2 * im / denominator;
  return { x: gammaRe, y: -gammaIm };
}

function admittanceGamma(re: number, im: number): GridPoint {
  const denominator = (re + 1) ** 2 + im ** 2;
  const gammaRe = (1 - re ** 2 - im ** 2) / denominator;
  const gammaIm = -2 * im / denominator;
  return { x: gammaRe, y: -gammaIm };
}

function sweep(): number[] {
  return Array.from({ length: 161 }, (_, index) => {
    const normalized = (index - 80) / 80;
    return Math.tan(normalized * Math.atan(50));
  });
}

function positiveSweep(): number[] {
  return Array.from({ length: 121 }, (_, index) => 50 * (index / 120) ** 2);
}

function clean(points: GridPoint[]): GridPoint[] {
  return points.filter(({ x, y }) => Number.isFinite(x) && Number.isFinite(y) && Math.hypot(x, y) <= 1.000000001);
}

export function buildSmithGrid(mode: SmithChartMode): SmithGridPrimitive[] {
  const map = mode === "impedance" ? impedanceGamma : admittanceGamma;
  const constantName = mode === "impedance" ? "resistance" : "conductance";
  const reactiveName = mode === "impedance" ? "reactance" : "susceptance";
  const paths: SmithGridPrimitive[] = [];

  for (const constant of RESISTANCE_VALUES) {
    paths.push({ kind: "path", id: `${constantName}-${constant}`, points: clean(sweep().map((reactive) => map(constant, reactive))), major: constant === 0 || constant === 1 });
  }
  for (const magnitude of REACTIVE_VALUES) {
    for (const signed of [magnitude, -magnitude]) {
      paths.push({ kind: "path", id: `${reactiveName}-${signed}`, points: clean(positiveSweep().map((constant) => map(constant, signed))), major: magnitude === 1 });
    }
  }
  paths.push({ kind: "path", id: "real-axis", points: [map(0, 0), map(50, 0)], major: true });
  paths.push({ kind: "path", id: "unit-circle", points: Array.from({ length: 129 }, (_, index) => ({ x: Math.cos(index / 128 * 2 * Math.PI), y: Math.sin(index / 128 * 2 * Math.PI) })), major: true });
  return [
    ...paths,
    { kind: "label", id: "label-center", role: "center", x: 0, y: 0 },
    { kind: "label", id: "label-open", role: "open", x: 1, y: 0 },
    { kind: "label", id: "label-short", role: "short", x: -1, y: 0 },
  ];
}
