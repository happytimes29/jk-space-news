import {
  complexDivide,
  complexMagnitude,
  complexPhaseDegrees,
  complexReciprocal,
  type Complex,
} from "./complex";
import { failure, success, type EngineeringResult } from "./types";

const SPEED_OF_LIGHT_MPS = 299_792_458;

function allFinite(...values: number[]): boolean {
  return values.every(Number.isFinite);
}

export function powerWattsFromDbm(dbm: number): EngineeringResult<number> {
  if (!Number.isFinite(dbm)) return failure("non_finite");
  const watts = 10 ** ((dbm - 30) / 10);
  return Number.isFinite(watts) ? success(watts) : failure("non_finite");
}

export function dbmFromPowerWatts(watts: number): EngineeringResult<number> {
  if (!Number.isFinite(watts)) return failure("non_finite");
  if (watts <= 0) return failure("non_positive");
  return success(10 * Math.log10(watts) + 30);
}

export function rfVoltageFromPower(input: {
  watts: number;
  impedanceOhms: number;
}): EngineeringResult<{ vrms: number; vPeak: number; vPeakToPeak: number; iRms: number }> {
  if (!allFinite(input.watts, input.impedanceOhms)) return failure("non_finite");
  if (input.watts < 0 || input.impedanceOhms <= 0) return failure("non_positive");
  const vrms = Math.sqrt(input.watts * input.impedanceOhms);
  return success({
    vrms,
    vPeak: vrms * Math.sqrt(2),
    vPeakToPeak: 2 * Math.sqrt(2) * vrms,
    iRms: Math.sqrt(input.watts / input.impedanceOhms),
  });
}

export function wavelength(input: {
  frequencyHz: number;
  relativePermittivity?: number;
  velocityFactor?: number;
}): EngineeringResult<{
  velocityMps: number;
  wavelengthM: number;
  halfM: number;
  quarterM: number;
  delaySecondsPerM: number;
}> {
  if (!Number.isFinite(input.frequencyHz)) return failure("non_finite", "frequencyHz");
  if (input.frequencyHz <= 0) return failure("non_positive", "frequencyHz");
  if (input.relativePermittivity !== undefined && input.velocityFactor !== undefined) return failure("conflicting_inputs");

  let factor = 1;
  if (input.relativePermittivity !== undefined) {
    if (!Number.isFinite(input.relativePermittivity)) return failure("non_finite", "relativePermittivity");
    if (input.relativePermittivity <= 0) return failure("non_positive", "relativePermittivity");
    factor = 1 / Math.sqrt(input.relativePermittivity);
  } else if (input.velocityFactor !== undefined) {
    if (!Number.isFinite(input.velocityFactor)) return failure("non_finite", "velocityFactor");
    if (input.velocityFactor <= 0 || input.velocityFactor > 1) return failure("out_of_range", "velocityFactor");
    factor = input.velocityFactor;
  }

  const velocityMps = SPEED_OF_LIGHT_MPS * factor;
  const wavelengthM = velocityMps / input.frequencyHz;
  return success({
    velocityMps,
    wavelengthM,
    halfM: wavelengthM / 2,
    quarterM: wavelengthM / 4,
    delaySecondsPerM: 1 / velocityMps,
  });
}

export function impedanceToAdmittance(z: Complex): EngineeringResult<Complex> {
  if (!allFinite(z.re, z.im)) return failure("non_finite");
  return complexReciprocal(z);
}

export function reflectionCoefficient(z: Complex, referenceOhms: number): EngineeringResult<Complex> {
  if (!allFinite(z.re, z.im, referenceOhms)) return failure("non_finite");
  if (referenceOhms <= 0) return failure("non_positive", "referenceOhms");
  return complexDivide({ re: z.re - referenceOhms, im: z.im }, { re: z.re + referenceOhms, im: z.im });
}

export function reflectionMetrics(gamma: Complex): EngineeringResult<{
  magnitude: number;
  phaseDegrees: number;
  s11Db: number;
  vswr: number;
  returnLossDb: number;
  mismatchLossDb: number;
}> {
  if (!allFinite(gamma.re, gamma.im)) return failure("non_finite");
  const rawMagnitude = complexMagnitude(gamma);
  if (rawMagnitude > 1 + 1e-12) return failure("out_of_range");
  const magnitude = Math.min(1, rawMagnitude);
  const s11Db = magnitude === 0 ? Number.NEGATIVE_INFINITY : 20 * Math.log10(magnitude);
  return success({
    magnitude,
    phaseDegrees: complexPhaseDegrees(gamma),
    s11Db,
    vswr: magnitude === 1 ? Number.POSITIVE_INFINITY : (1 + magnitude) / (1 - magnitude),
    returnLossDb: magnitude === 0 ? Number.POSITIVE_INFINITY : magnitude === 1 ? 0 : -s11Db,
    mismatchLossDb: magnitude === 0 ? 0 : magnitude === 1 ? Number.POSITIVE_INFINITY : -10 * Math.log10(1 - magnitude ** 2),
  });
}
