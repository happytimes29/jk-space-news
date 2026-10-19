import { failure, success, type EngineeringResult } from "./types";

export function completeEllipticKModulus(k: number): EngineeringResult<number> {
  if (!Number.isFinite(k) || k < 0 || k >= 1) return failure("out_of_range", "k");
  let arithmetic = 1;
  let geometric = Math.sqrt(1 - k * k);
  for (let iteration = 0; iteration < 100; iteration += 1) {
    const nextArithmetic = (arithmetic + geometric) / 2;
    const nextGeometric = Math.sqrt(arithmetic * geometric);
    if (Math.abs(nextArithmetic - nextGeometric) <= 1e-15 * nextArithmetic) {
      return success(Math.PI / (2 * nextArithmetic));
    }
    arithmetic = nextArithmetic;
    geometric = nextGeometric;
  }
  return failure("no_convergence", "k");
}

export function solveBisection(input: {
  fn: (x: number) => number;
  target: number;
  min: number;
  max: number;
  relativeTolerance?: number;
  maxIterations?: number;
}): EngineeringResult<number> {
  const tolerance = input.relativeTolerance ?? 1e-9;
  const iterations = input.maxIterations ?? 100;
  if (![input.target, input.min, input.max, tolerance].every(Number.isFinite) || input.min >= input.max || tolerance <= 0 || !Number.isInteger(iterations) || iterations <= 0) return failure("out_of_range");
  let low = input.min;
  let high = input.max;
  let lowValue = input.fn(low);
  let highValue = input.fn(high);
  if (!Number.isFinite(lowValue) || !Number.isFinite(highValue)) return failure("non_finite");
  if (lowValue === input.target) return success(low);
  if (highValue === input.target) return success(high);
  const increasing = highValue > lowValue;
  if (lowValue === highValue || input.target < Math.min(lowValue, highValue) || input.target > Math.max(lowValue, highValue)) return failure("no_bracket");
  const allowedError = tolerance * Math.max(1, Math.abs(input.target));
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const middle = (low + high) / 2;
    const value = input.fn(middle);
    if (!Number.isFinite(value)) return failure("non_finite");
    if (Math.abs(value - input.target) <= allowedError) return success(middle);
    if ((increasing && value < input.target) || (!increasing && value > input.target)) {
      low = middle;
      lowValue = value;
    } else {
      high = middle;
      highValue = value;
    }
  }
  return failure("no_convergence");
}
