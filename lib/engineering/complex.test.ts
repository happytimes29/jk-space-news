import { describe, expect, it } from "vitest";
import {
  complexAdd,
  complexDivide,
  complexFromPolar,
  complexMagnitude,
  complexMultiply,
  complexPhaseDegrees,
  complexReciprocal,
  complexSubtract,
} from "./complex";

describe("complex arithmetic", () => {
  it("keeps arithmetic immutable and hand-checkable", () => {
    const left = { re: 3, im: 4 };
    const right = { re: 1, im: -2 };
    expect(complexAdd(left, right)).toEqual({ re: 4, im: 2 });
    expect(complexSubtract(left, right)).toEqual({ re: 2, im: 6 });
    expect(complexMultiply(left, right)).toEqual({ re: 11, im: -2 });
    expect(left).toEqual({ re: 3, im: 4 });
  });

  it("converts between rectangular and polar values", () => {
    expect(complexMagnitude({ re: 3, im: 4 })).toBe(5);
    expect(complexPhaseDegrees({ re: 0, im: 1 })).toBe(90);
    expect(complexFromPolar(2, 180)).toMatchObject({ re: -2 });
    expect(complexFromPolar(2, 180).im).toBeCloseTo(0, 12);
  });

  it("round-trips a reciprocal and division", () => {
    const value = { re: 3, im: 4 };
    const reciprocal = complexReciprocal(value);
    expect(reciprocal).toMatchObject({ ok: true });
    if (!reciprocal.ok) throw new Error("expected reciprocal");
    expect(complexMultiply(value, reciprocal.value).re).toBeCloseTo(1, 12);
    expect(complexMultiply(value, reciprocal.value).im).toBeCloseTo(0, 12);
    expect(complexDivide(value, value)).toMatchObject({ ok: true, value: { re: 1, im: 0 } });
  });

  it("rejects division by exact zero", () => {
    expect(complexReciprocal({ re: 0, im: 0 })).toMatchObject({ ok: false, error: { code: "division_by_zero" } });
    expect(complexDivide({ re: 1, im: 0 }, { re: 0, im: 0 })).toMatchObject({ ok: false, error: { code: "division_by_zero" } });
  });
});
