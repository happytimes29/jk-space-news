import { complexMagnitude, complexPhaseDegrees, type Complex } from "./complex";
import { impedanceToAdmittance, reflectionCoefficient, reflectionMetrics } from "./rf";
import { failure, success, type EngineeringResult } from "./types";

export interface SmithPoint {
  impedance: Complex;
  normalizedImpedance: Complex;
  admittance: Complex | null;
  gamma: Complex;
  x: number;
  y: number;
}

export interface ComplexReadout {
  rectangular: Complex;
  magnitude: number;
  phaseDegrees: number;
}

export interface SmithReadout {
  impedance: ComplexReadout;
  admittance: ComplexReadout | null;
  gamma: ComplexReadout;
  s11Db: number;
  vswr: number;
  returnLossDb: number;
  mismatchLossDb: number;
}

function summary(value: Complex): ComplexReadout {
  return { rectangular: value, magnitude: complexMagnitude(value), phaseDegrees: complexPhaseDegrees(value) };
}

export function smithPoint(impedance: Complex, referenceOhms: number): EngineeringResult<SmithPoint> {
  if (!Number.isFinite(referenceOhms)) return failure("non_finite", "referenceOhms");
  if (referenceOhms <= 0) return failure("non_positive", "referenceOhms");

  const idealOpen = impedance.re === Number.POSITIVE_INFINITY && impedance.im === 0;
  if (idealOpen) {
    return success({
      impedance,
      normalizedImpedance: { re: Number.POSITIVE_INFINITY, im: 0 },
      admittance: { re: 0, im: 0 },
      gamma: { re: 1, im: 0 },
      x: 1,
      y: 0,
    });
  }
  if (!Number.isFinite(impedance.re) || !Number.isFinite(impedance.im)) return failure("non_finite", "impedance");
  if (impedance.re === -referenceOhms && impedance.im === 0) return failure("division_by_zero", "impedance");
  if (impedance.re < 0) return failure("out_of_range", "impedance");

  const gamma = reflectionCoefficient(impedance, referenceOhms);
  if (!gamma.ok) return gamma;
  const admittance = impedanceToAdmittance(impedance);
  return success({
    impedance,
    normalizedImpedance: { re: impedance.re / referenceOhms, im: impedance.im / referenceOhms },
    admittance: admittance.ok ? admittance.value : null,
    gamma: gamma.value,
    x: gamma.value.re,
    // RF math uses +Im(Γ); SVG coordinates grow downward, so display y is inverted.
    y: -gamma.value.im,
  });
}

export function smithReadout(point: SmithPoint): EngineeringResult<SmithReadout> {
  const metrics = reflectionMetrics(point.gamma);
  if (!metrics.ok) return metrics;
  return success({
    impedance: summary(point.impedance),
    admittance: point.admittance ? summary(point.admittance) : null,
    gamma: summary(point.gamma),
    s11Db: metrics.value.s11Db,
    vswr: metrics.value.vswr,
    returnLossDb: metrics.value.returnLossDb,
    mismatchLossDb: metrics.value.mismatchLossDb,
  });
}
