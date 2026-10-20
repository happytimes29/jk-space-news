import { nearestStandardValues, type ESeries } from "./standard-values";
import { failure, success, type EngineeringResult } from "./types";

export interface DividerResult {
  vout: number;
  branchCurrentA: number;
  rTopPowerW: number;
  rBottomPowerW: number;
  loadPowerW?: number;
  effectiveBottomOhms: number;
  totalResistanceOhms: number;
}

export interface DividerCandidate {
  rTopOhms: number;
  rBottomOhms: number;
  vout: number;
  relativeVoltageError: number;
  totalResistanceOhms: number;
  branchCurrentA: number;
}

export interface RlcResult {
  resonanceHz: number;
  q: number;
  bandwidthHz: number;
}

interface AttenuatorPowerSummary {
  inputPowerW?: number;
  outputPowerW?: number;
  estimatedTotalDissipationW?: number;
}

export type AttenuatorResult = AttenuatorPowerSummary & ({
  topology: "tee";
  resistorsOhms: { seriesEach: number; shunt: number };
  resistorDissipationW?: { inputSeries: number; shunt: number; outputSeries: number };
} | {
  topology: "pi";
  resistorsOhms: { shuntEach: number; series: number };
  resistorDissipationW?: { inputShunt: number; series: number; outputShunt: number };
});

function validateFinite(value: number, field: string): EngineeringResult<number> {
  return Number.isFinite(value) ? success(value) : failure("non_finite", field);
}

function validatePositive(value: number, field: string): EngineeringResult<number> {
  const finite = validateFinite(value, field);
  if (!finite.ok) return finite;
  return value > 0 ? success(value) : failure("non_positive", field);
}

function validateNonNegative(value: number, field: string): EngineeringResult<number> {
  const finite = validateFinite(value, field);
  if (!finite.ok) return finite;
  return value >= 0 ? success(value) : failure("out_of_range", field);
}

function effectiveParallel(left: number, right?: number): number {
  return right === undefined ? left : (left * right) / (left + right);
}

export function loadedDivider(input: {
  vin: number;
  rTopOhms: number;
  rBottomOhms: number;
  loadOhms?: number;
}): EngineeringResult<DividerResult> {
  for (const [field, value] of [
    ["vin", input.vin],
    ["rTopOhms", input.rTopOhms],
    ["rBottomOhms", input.rBottomOhms],
  ] as const) {
    const checked = validatePositive(value, field);
    if (!checked.ok) return checked;
  }
  if (input.loadOhms !== undefined) {
    const checked = validatePositive(input.loadOhms, "loadOhms");
    if (!checked.ok) return checked;
  }

  const effectiveBottomOhms = effectiveParallel(input.rBottomOhms, input.loadOhms);
  const totalResistanceOhms = input.rTopOhms + effectiveBottomOhms;
  const branchCurrentA = input.vin / totalResistanceOhms;
  const vout = branchCurrentA * effectiveBottomOhms;
  const result: DividerResult = {
    vout,
    branchCurrentA,
    effectiveBottomOhms,
    totalResistanceOhms,
    rTopPowerW: branchCurrentA ** 2 * input.rTopOhms,
    rBottomPowerW: vout ** 2 / input.rBottomOhms,
  };
  if (input.loadOhms !== undefined) result.loadPowerW = vout ** 2 / input.loadOhms;
  return success(result);
}

export function dividerWorstCase(input: {
  vin: number;
  rTopOhms: number;
  rBottomOhms: number;
  tolerancePercent: number;
  loadOhms?: number;
}): EngineeringResult<{ minVout: number; maxVout: number }> {
  const tolerance = validateFinite(input.tolerancePercent, "tolerancePercent");
  if (!tolerance.ok) return tolerance;
  if (input.tolerancePercent < 0 || input.tolerancePercent >= 100) return failure("out_of_range", "tolerancePercent");

  const ratio = input.tolerancePercent / 100;
  const minimum = loadedDivider({
    vin: input.vin,
    rTopOhms: input.rTopOhms * (1 + ratio),
    rBottomOhms: input.rBottomOhms * (1 - ratio),
    loadOhms: input.loadOhms,
  });
  if (!minimum.ok) return minimum;
  const maximum = loadedDivider({
    vin: input.vin,
    rTopOhms: input.rTopOhms * (1 - ratio),
    rBottomOhms: input.rBottomOhms * (1 + ratio),
    loadOhms: input.loadOhms,
  });
  if (!maximum.ok) return maximum;
  return success({ minVout: minimum.value.vout, maxVout: maximum.value.vout });
}

export function suggestDivider(input: {
  vin: number;
  targetVout: number;
  series: ESeries;
  nominalCurrentA?: number;
  loadOhms?: number;
  limit?: number;
}): EngineeringResult<DividerCandidate[]> {
  const vin = validatePositive(input.vin, "vin");
  if (!vin.ok) return vin;
  const target = validatePositive(input.targetVout, "targetVout");
  if (!target.ok) return target;
  if (input.targetVout >= input.vin) return failure("out_of_range", "targetVout");

  const nominalCurrentA = input.nominalCurrentA ?? 100e-6;
  const current = validatePositive(nominalCurrentA, "nominalCurrentA");
  if (!current.ok) return current;
  if (input.loadOhms !== undefined) {
    const load = validatePositive(input.loadOhms, "loadOhms");
    if (!load.ok) return load;
  }
  const limit = input.limit ?? 10;
  if (!Number.isFinite(limit) || limit <= 0) return failure("out_of_range", "limit");

  const idealTop = (input.vin - input.targetVout) / nominalCurrentA;
  const idealEffectiveBottom = input.targetVout / nominalCurrentA;
  let idealBottom = idealEffectiveBottom;
  if (input.loadOhms !== undefined) {
    if (input.loadOhms <= idealEffectiveBottom) return failure("no_solution", "loadOhms");
    idealBottom = (idealEffectiveBottom * input.loadOhms) / (input.loadOhms - idealEffectiveBottom);
  }

  const topValues = nearestStandardValues(idealTop, input.series, 11);
  const bottomValues = nearestStandardValues(idealBottom, input.series, 11);
  const candidates: DividerCandidate[] = [];
  const seen = new Set<string>();
  for (const rTopOhms of topValues) {
    for (const rBottomOhms of bottomValues) {
      const key = `${rTopOhms}:${rBottomOhms}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const operatingPoint = loadedDivider({ vin: input.vin, rTopOhms, rBottomOhms, loadOhms: input.loadOhms });
      if (!operatingPoint.ok) continue;
      candidates.push({
        rTopOhms,
        rBottomOhms,
        vout: operatingPoint.value.vout,
        relativeVoltageError: Math.abs(operatingPoint.value.vout - input.targetVout) / input.targetVout,
        totalResistanceOhms: operatingPoint.value.totalResistanceOhms,
        branchCurrentA: operatingPoint.value.branchCurrentA,
      });
    }
  }
  candidates.sort((left, right) =>
    left.relativeVoltageError - right.relativeVoltageError ||
    left.totalResistanceOhms - right.totalResistanceOhms ||
    left.rTopOhms - right.rTopOhms ||
    left.rBottomOhms - right.rBottomOhms,
  );
  return success(candidates.slice(0, Math.floor(limit)));
}

function validatePair(first: [string, number], second: [string, number]): EngineeringResult<true> {
  for (const [field, value] of [first, second]) {
    const checked = validatePositive(value, field);
    if (!checked.ok) return checked;
  }
  return success(true);
}

export function rcCutoffHz(input: { resistanceOhms: number; capacitanceF: number }): EngineeringResult<number> {
  const checked = validatePair(["resistanceOhms", input.resistanceOhms], ["capacitanceF", input.capacitanceF]);
  return checked.ok ? success(1 / (2 * Math.PI * input.resistanceOhms * input.capacitanceF)) : checked;
}

export function rcTimeConstantSeconds(input: { resistanceOhms: number; capacitanceF: number }): EngineeringResult<number> {
  const checked = validatePair(["resistanceOhms", input.resistanceOhms], ["capacitanceF", input.capacitanceF]);
  return checked.ok ? success(input.resistanceOhms * input.capacitanceF) : checked;
}

export function lcResonanceHz(input: { inductanceH: number; capacitanceF: number }): EngineeringResult<number> {
  const checked = validatePair(["inductanceH", input.inductanceH], ["capacitanceF", input.capacitanceF]);
  return checked.ok ? success(1 / (2 * Math.PI * Math.sqrt(input.inductanceH * input.capacitanceF))) : checked;
}

export function capacitiveReactanceOhms(input: { frequencyHz: number; capacitanceF: number }): EngineeringResult<number> {
  const checked = validatePair(["frequencyHz", input.frequencyHz], ["capacitanceF", input.capacitanceF]);
  return checked.ok ? success(1 / (2 * Math.PI * input.frequencyHz * input.capacitanceF)) : checked;
}

export function inductiveReactanceOhms(input: { frequencyHz: number; inductanceH: number }): EngineeringResult<number> {
  const checked = validatePair(["frequencyHz", input.frequencyHz], ["inductanceH", input.inductanceH]);
  return checked.ok ? success(2 * Math.PI * input.frequencyHz * input.inductanceH) : checked;
}

function validateRlc(input: { resistanceOhms: number; inductanceH: number; capacitanceF: number }): EngineeringResult<number> {
  for (const [field, value] of [
    ["resistanceOhms", input.resistanceOhms],
    ["inductanceH", input.inductanceH],
    ["capacitanceF", input.capacitanceF],
  ] as const) {
    const checked = validatePositive(value, field);
    if (!checked.ok) return checked;
  }
  return lcResonanceHz(input);
}

export function seriesRlc(input: { resistanceOhms: number; inductanceH: number; capacitanceF: number }): EngineeringResult<RlcResult> {
  const resonance = validateRlc(input);
  if (!resonance.ok) return resonance;
  const q = 2 * Math.PI * resonance.value * input.inductanceH / input.resistanceOhms;
  return success({ resonanceHz: resonance.value, q, bandwidthHz: resonance.value / q });
}

export function parallelRlc(input: { resistanceOhms: number; inductanceH: number; capacitanceF: number }): EngineeringResult<RlcResult> {
  const resonance = validateRlc(input);
  if (!resonance.ok) return resonance;
  const q = input.resistanceOhms / (2 * Math.PI * resonance.value * input.inductanceH);
  return success({ resonanceHz: resonance.value, q, bandwidthHz: resonance.value / q });
}

export function symmetricAttenuator(input: {
  topology: "tee" | "pi";
  attenuationDb: number;
  impedanceOhms: number;
  inputPowerWatts?: number;
}): EngineeringResult<AttenuatorResult> {
  const attenuation = validatePositive(input.attenuationDb, "attenuationDb");
  if (!attenuation.ok) return attenuation;
  const impedance = validatePositive(input.impedanceOhms, "impedanceOhms");
  if (!impedance.ok) return impedance;
  if (input.inputPowerWatts !== undefined) {
    const power = validateNonNegative(input.inputPowerWatts, "inputPowerWatts");
    if (!power.ok) return power;
  }

  const attenuationNepers = input.attenuationDb * Math.LN10 / 20;
  if (!Number.isFinite(attenuationNepers)) return failure("out_of_range", "attenuationDb");
  const halfTanh = Math.tanh(attenuationNepers / 2);
  const sinh = Math.sinh(attenuationNepers);
  if (!Number.isFinite(sinh) || halfTanh <= 0) return failure("out_of_range", "attenuationDb");
  const inputPowerW = input.inputPowerWatts;
  const outputPowerW = inputPowerW === undefined
    ? undefined
    : inputPowerW * Math.exp(-2 * attenuationNepers);
  const estimatedTotalDissipationW = inputPowerW === undefined || outputPowerW === undefined
    ? undefined
    : inputPowerW * -Math.expm1(-2 * attenuationNepers);

  if (input.topology === "tee") {
    const seriesEach = input.impedanceOhms * halfTanh;
    const shunt = input.impedanceOhms / sinh;
    if (![seriesEach, shunt].every((value) => Number.isFinite(value) && value > 0)) return failure("out_of_range", "attenuationDb");
    let resistorDissipationW: { inputSeries: number; shunt: number; outputSeries: number } | undefined;
    if (input.inputPowerWatts !== undefined) {
      const inputVoltageRms = Math.sqrt(input.inputPowerWatts * input.impedanceOhms);
      const inputCurrentRms = inputVoltageRms / input.impedanceOhms;
      const centerVoltageRms = inputVoltageRms - inputCurrentRms * seriesEach;
      const outputBranchCurrentRms = centerVoltageRms / (seriesEach + input.impedanceOhms);
      resistorDissipationW = {
        inputSeries: inputCurrentRms ** 2 * seriesEach,
        shunt: centerVoltageRms ** 2 / shunt,
        outputSeries: outputBranchCurrentRms ** 2 * seriesEach,
      };
      if (!Object.values(resistorDissipationW).every((value) => Number.isFinite(value) && value >= 0)) return failure("out_of_range", "attenuationDb");
    }
    return success({
      topology: "tee",
      resistorsOhms: { seriesEach, shunt },
      ...(inputPowerW === undefined ? {} : { inputPowerW, outputPowerW }),
      ...(estimatedTotalDissipationW === undefined ? {} : { estimatedTotalDissipationW }),
      ...(resistorDissipationW === undefined ? {} : { resistorDissipationW }),
    });
  }
  const shuntEach = input.impedanceOhms / halfTanh;
  const series = input.impedanceOhms * sinh;
  if (![shuntEach, series].every((value) => Number.isFinite(value) && value > 0)) return failure("out_of_range", "attenuationDb");
  let resistorDissipationW: { inputShunt: number; series: number; outputShunt: number } | undefined;
  if (input.inputPowerWatts !== undefined) {
    const inputVoltageRms = Math.sqrt(input.inputPowerWatts * input.impedanceOhms);
    const outputParallelOhms = shuntEach * input.impedanceOhms / (shuntEach + input.impedanceOhms);
    const seriesCurrentRms = inputVoltageRms / (series + outputParallelOhms);
    const outputVoltageRms = seriesCurrentRms * outputParallelOhms;
    resistorDissipationW = {
      inputShunt: inputVoltageRms ** 2 / shuntEach,
      series: seriesCurrentRms ** 2 * series,
      outputShunt: outputVoltageRms ** 2 / shuntEach,
    };
    if (!Object.values(resistorDissipationW).every((value) => Number.isFinite(value) && value >= 0)) return failure("out_of_range", "attenuationDb");
  }
  return success({
    topology: "pi",
    resistorsOhms: { shuntEach, series },
    ...(inputPowerW === undefined ? {} : { inputPowerW, outputPowerW }),
    ...(estimatedTotalDissipationW === undefined ? {} : { estimatedTotalDissipationW }),
    ...(resistorDissipationW === undefined ? {} : { resistorDissipationW }),
  });
}
