import { solveBisection } from "./numerics";
import { groundedCoplanarWaveguideQucs, microstripHammerstadJensen, symmetricStriplineFiniteThickness, type TransmissionLineResult } from "./transmission-line";
import { failure, success, type EngineeringResult } from "./types";

interface CommonInput {
  widthM: number;
  conductorThicknessM: number;
  relativePermittivity: number;
  frequencyHz: number;
  lengthM: number;
}

export type TransmissionLineKind = "microstrip" | "stripline" | "cpwg";
export type TransmissionLineInput =
  | (CommonInput & { kind: "microstrip"; substrateHeightM: number })
  | (CommonInput & { kind: "stripline"; planeSeparationM: number })
  | (CommonInput & { kind: "cpwg"; gapM: number; substrateHeightM: number });

export type TransmissionLineSolveInput =
  | (Omit<Extract<TransmissionLineInput, { kind: "microstrip" }>, "widthM"> & { targetImpedanceOhms: number; minWidthM?: number; maxWidthM?: number })
  | (Omit<Extract<TransmissionLineInput, { kind: "stripline" }>, "widthM"> & { targetImpedanceOhms: number; minWidthM?: number; maxWidthM?: number })
  | (Omit<Extract<TransmissionLineInput, { kind: "cpwg" }>, "widthM"> & { targetImpedanceOhms: number; minWidthM?: number; maxWidthM?: number });

export function analyzeTransmissionLine(input: TransmissionLineInput): EngineeringResult<TransmissionLineResult> {
  const common = { widthM: input.widthM, conductorThicknessM: input.conductorThicknessM, relativePermittivity: input.relativePermittivity, frequencyHz: input.frequencyHz, lengthM: input.lengthM };
  if (input.kind === "microstrip") return microstripHammerstadJensen({ ...common, substrateHeightM: input.substrateHeightM });
  if (input.kind === "stripline") return symmetricStriplineFiniteThickness({ ...common, planeSeparationM: input.planeSeparationM });
  return groundedCoplanarWaveguideQucs({ ...common, gapM: input.gapM, substrateHeightM: input.substrateHeightM });
}

function scale(input: TransmissionLineSolveInput): number {
  return input.kind === "stripline" ? input.planeSeparationM : input.substrateHeightM;
}

function withWidth(input: TransmissionLineSolveInput, widthM: number): TransmissionLineInput {
  const common = { widthM, conductorThicknessM: input.conductorThicknessM, relativePermittivity: input.relativePermittivity, frequencyHz: input.frequencyHz, lengthM: input.lengthM };
  if (input.kind === "microstrip") return { kind: input.kind, ...common, substrateHeightM: input.substrateHeightM };
  if (input.kind === "stripline") return { kind: input.kind, ...common, planeSeparationM: input.planeSeparationM };
  return { kind: input.kind, ...common, gapM: input.gapM, substrateHeightM: input.substrateHeightM };
}

function findValidBound(input: TransmissionLineSolveInput, start: number, other: number): number | undefined {
  let candidate = start;
  for (let iteration = 0; iteration < 64; iteration += 1) {
    if (analyzeTransmissionLine(withWidth(input, candidate)).ok) return candidate;
    candidate = (candidate + other) / 2;
  }
  return undefined;
}

export function solveTransmissionLineWidth(input: TransmissionLineSolveInput): EngineeringResult<{ widthM: number; result: TransmissionLineResult }> {
  if (!Number.isFinite(input.targetImpedanceOhms) || input.targetImpedanceOhms <= 0) return failure("non_positive", "targetImpedanceOhms");
  const geometryScale = scale(input);
  if (!Number.isFinite(geometryScale) || geometryScale <= 0) return failure("non_positive");
  let min = input.minWidthM ?? geometryScale * 1e-3;
  const max = input.maxWidthM ?? geometryScale * 100;
  if (input.conductorThicknessM > 0) min = Math.max(min, input.conductorThicknessM * 1.001);
  if (![min, max].every(Number.isFinite) || min <= 0 || max <= min) return failure("out_of_range");
  const validMin = findValidBound(input, min, max);
  const validMax = findValidBound(input, max, min);
  if (validMin === undefined || validMax === undefined || validMin >= validMax) {
    const probe = analyzeTransmissionLine(withWidth(input, Math.sqrt(min * max)));
    return probe.ok ? failure("unsupported_geometry") : probe;
  }
  const solved = solveBisection({
    fn: (widthM) => {
      const result = analyzeTransmissionLine(withWidth(input, widthM));
      return result.ok ? result.value.impedanceOhms : Number.NaN;
    },
    target: input.targetImpedanceOhms,
    min: validMin,
    max: validMax,
    relativeTolerance: 1e-10,
  });
  if (!solved.ok) return solved;
  const result = analyzeTransmissionLine(withWidth(input, solved.value));
  return result.ok ? success({ widthM: solved.value, result: result.value }, result.warnings) : result;
}
