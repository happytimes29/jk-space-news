import { describe, expect, it } from "vitest";
import { completeEllipticKModulus, solveBisection } from "./numerics";

describe("completeEllipticKModulus", () => {
  it("matches reference values and remains finite near both domain limits", () => {
    const zero = completeEllipticKModulus(0);
    const middle = completeEllipticKModulus(1 / Math.sqrt(2));
    const nearZero = completeEllipticKModulus(1e-12);
    const nearOne = completeEllipticKModulus(1 - 1e-12);
    expect(zero.ok && zero.value).toBeCloseTo(Math.PI / 2, 14);
    expect(middle.ok && middle.value).toBeCloseTo(1.8540746773013719, 12);
    expect(nearZero.ok && Number.isFinite(nearZero.value)).toBe(true);
    expect(nearOne.ok && Number.isFinite(nearOne.value)).toBe(true);
    expect(nearOne.ok && nearZero.ok && nearOne.value).toBeGreaterThan(nearZero.ok ? nearZero.value : 0);
  });

  it.each([-1, 1, 2, Number.NaN, Number.POSITIVE_INFINITY])("rejects modulus %s", (value) => {
    expect(completeEllipticKModulus(value)).toMatchObject({ ok: false, error: { code: "out_of_range" } });
  });
});

describe("solveBisection", () => {
  it("solves increasing and decreasing monotonic functions", () => {
    const increasing = solveBisection({ fn: (x) => x * x, target: 2, min: 0, max: 2 });
    const decreasing = solveBisection({ fn: (x) => 10 - x, target: 7, min: 0, max: 10 });
    expect(increasing.ok && increasing.value).toBeCloseTo(Math.sqrt(2), 8);
    expect(decreasing.ok && decreasing.value).toBeCloseTo(3, 8);
  });

  it("reports unbracketed, invalid, non-finite, and unconverged cases", () => {
    expect(solveBisection({ fn: (x) => x, target: 3, min: 0, max: 2 })).toMatchObject({ ok: false, error: { code: "no_bracket" } });
    expect(solveBisection({ fn: (x) => x, target: 1, min: 2, max: 0 })).toMatchObject({ ok: false, error: { code: "out_of_range" } });
    expect(solveBisection({ fn: () => Number.NaN, target: 1, min: 0, max: 2 })).toMatchObject({ ok: false, error: { code: "non_finite" } });
    expect(solveBisection({ fn: (x) => x * x, target: 2, min: 0, max: 2, relativeTolerance: 1e-15, maxIterations: 1 })).toMatchObject({ ok: false, error: { code: "no_convergence" } });
  });
});
