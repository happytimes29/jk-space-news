export type SmithChartMode = "impedance" | "admittance";
export type SmithGridDetail = "detailed" | "compact";
export interface GridPoint { x: number; y: number }
export type SmithGridPrimitive =
  | { kind: "path"; id: string; points: GridPoint[]; major: boolean }
  | { kind: "label"; id: string; role: "center" | "open" | "short"; x: number; y: number }
  | { kind: "value-label"; id: string; family: "constant" | "reactive"; value: number; x: number; y: number; textAnchor: "start" | "middle" | "end" };

const MAJOR_CONSTANT_VALUES = [0.2, 0.5, 1, 2, 5, 10] as const;
const MINOR_CONSTANT_VALUES = [0.1, 0.3, 0.7, 1.5, 3, 7, 20] as const;
const MAJOR_REACTIVE_VALUES = [0.2, 0.5, 1, 2, 5, 10] as const;
const MINOR_REACTIVE_VALUES = [0.1, 0.3, 0.7, 1.5, 3, 7, 20] as const;

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

export function buildSmithGrid(mode: SmithChartMode, detail: SmithGridDetail = "detailed"): SmithGridPrimitive[] {
  const map = mode === "impedance" ? impedanceGamma : admittanceGamma;
  const constantName = mode === "impedance" ? "resistance" : "conductance";
  const reactiveName = mode === "impedance" ? "reactance" : "susceptance";
  const paths: SmithGridPrimitive[] = [];
  const constants = detail === "detailed" ? [...MAJOR_CONSTANT_VALUES, ...MINOR_CONSTANT_VALUES] : [...MAJOR_CONSTANT_VALUES];
  const reactives = detail === "detailed" ? [...MAJOR_REACTIVE_VALUES, ...MINOR_REACTIVE_VALUES] : [...MAJOR_REACTIVE_VALUES];

  for (const constant of constants) {
    paths.push({ kind: "path", id: `${constantName}-${constant}`, points: clean(sweep().map((reactive) => map(constant, reactive))), major: MAJOR_CONSTANT_VALUES.some((major) => major === constant) });
  }
  for (const magnitude of reactives) {
    for (const signed of [magnitude, -magnitude]) {
      paths.push({ kind: "path", id: `${reactiveName}-${signed}`, points: clean(positiveSweep().map((constant) => map(constant, signed))), major: MAJOR_REACTIVE_VALUES.some((major) => major === magnitude) });
    }
  }
  paths.push({ kind: "path", id: "real-axis", points: [map(0, 0), map(50, 0)], major: true });
  paths.push({ kind: "path", id: "unit-circle", points: Array.from({ length: 129 }, (_, index) => ({ x: Math.cos(index / 128 * 2 * Math.PI), y: Math.sin(index / 128 * 2 * Math.PI) })), major: true });
  const valueLabels: SmithGridPrimitive[] = detail === "compact" ? [] : [
    ...MAJOR_CONSTANT_VALUES.map((value) => {
      const point = map(value, 0);
      return { kind: "value-label" as const, id: `${constantName}-label-${value}`, family: "constant" as const, value, x: point.x, y: 0.075, textAnchor: "middle" as const };
    }),
    ...MAJOR_REACTIVE_VALUES.flatMap((magnitude) => [magnitude, -magnitude].map((value) => {
      const point = map(0.04, value);
      const x = point.x * 0.93;
      const y = point.y * 0.93;
      return { kind: "value-label" as const, id: `${reactiveName}-label-${value}`, family: "reactive" as const, value, x, y, textAnchor: x > 0.62 ? "end" as const : x < -0.62 ? "start" as const : "middle" as const };
    })),
  ];
  return [
    ...paths,
    ...valueLabels,
    { kind: "label", id: "label-center", role: "center", x: 0, y: 0 },
    { kind: "label", id: "label-open", role: "open", x: 1, y: 0 },
    { kind: "label", id: "label-short", role: "short", x: -1, y: 0 },
  ];
}
