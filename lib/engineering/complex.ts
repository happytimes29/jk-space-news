import { failure, success, type EngineeringResult } from "./types";

export interface Complex {
  re: number;
  im: number;
}

export function complexAdd(left: Complex, right: Complex): Complex {
  return { re: left.re + right.re, im: left.im + right.im };
}

export function complexSubtract(left: Complex, right: Complex): Complex {
  return { re: left.re - right.re, im: left.im - right.im };
}

export function complexMultiply(left: Complex, right: Complex): Complex {
  return {
    re: left.re * right.re - left.im * right.im,
    im: left.re * right.im + left.im * right.re,
  };
}

export function complexReciprocal(value: Complex): EngineeringResult<Complex> {
  const denominator = value.re ** 2 + value.im ** 2;
  if (denominator === 0) return failure("division_by_zero");
  if (!Number.isFinite(denominator)) return failure("non_finite");
  return success({ re: value.re / denominator, im: -value.im / denominator });
}

export function complexDivide(left: Complex, right: Complex): EngineeringResult<Complex> {
  const reciprocal = complexReciprocal(right);
  if (!reciprocal.ok) return reciprocal;
  return success(complexMultiply(left, reciprocal.value));
}

export function complexMagnitude(value: Complex): number {
  return Math.hypot(value.re, value.im);
}

export function complexPhaseDegrees(value: Complex): number {
  return Math.atan2(value.im, value.re) * 180 / Math.PI;
}

export function complexFromPolar(magnitude: number, phaseDegrees: number): Complex {
  const radians = phaseDegrees * Math.PI / 180;
  return { re: magnitude * Math.cos(radians), im: magnitude * Math.sin(radians) };
}
