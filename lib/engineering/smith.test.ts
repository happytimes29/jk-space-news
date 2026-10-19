import { describe, expect, it } from "vitest";
import { smithPoint, smithReadout } from "./smith";

describe("Smith chart projection", () => {
  it.each([
    [{ re: 50, im: 0 }, 0, 0],
    [{ re: 0, im: 0 }, -1, 0],
    [{ re: 50, im: 50 }, 0.2, -0.4],
    [{ re: 50, im: -50 }, 0.2, 0.4],
  ] as const)("maps canonical impedance %o", (impedance, x, y) => {
    const result = smithPoint(impedance, 50);
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected Smith point");
    expect(result.value.x).toBeCloseTo(x, 12);
    expect(result.value.y).toBeCloseTo(y, 12);
  });

  it("approaches the open-circuit point for a very large resistance", () => {
    const result = smithPoint({ re: 1e15, im: 0 }, 50);
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected Smith point");
    expect(result.value.x).toBeCloseTo(1, 12);
    expect(result.value.y).toBeCloseTo(0, 12);
  });

  it("represents an explicit ideal open circuit without broken coordinates", () => {
    const result = smithPoint({ re: Number.POSITIVE_INFINITY, im: 0 }, 50);
    expect(result).toMatchObject({ ok: true, value: { gamma: { re: 1, im: 0 }, x: 1, y: 0, admittance: { re: 0, im: 0 } } });
  });

  it.each([
    [{ re: -1, im: 0 }, 50, "out_of_range"],
    [{ re: -50, im: 0 }, 50, "division_by_zero"],
    [{ re: 50, im: 0 }, 0, "non_positive"],
    [{ re: Number.NaN, im: 0 }, 50, "non_finite"],
  ] as const)("rejects invalid point input", (impedance, reference, code) => {
    expect(smithPoint(impedance, reference)).toMatchObject({ ok: false, error: { code } });
  });
});

describe("Smith readout", () => {
  it("returns rectangular and polar values with RF metrics", () => {
    const point = smithPoint({ re: 25, im: 25 }, 50);
    if (!point.ok) throw new Error("expected Smith point");
    const readout = smithReadout(point.value);
    expect(readout).toMatchObject({ ok: true });
    if (!readout.ok) throw new Error("expected readout");
    expect(readout.value.impedance).toMatchObject({ rectangular: { re: 25, im: 25 } });
    expect(readout.value.impedance.magnitude).toBeCloseTo(Math.sqrt(1250), 12);
    expect(readout.value.admittance?.rectangular).toMatchObject({ re: 0.02, im: -0.02 });
    expect(readout.value.gamma.magnitude).toBeGreaterThan(0);
    expect(readout.value.s11Db).toBeLessThan(0);
    expect(readout.value.vswr).toBeGreaterThan(1);
  });

  it("uses explicit ideal limits for short and open circuits without NaN", () => {
    for (const impedance of [{ re: 0, im: 0 }, { re: Number.POSITIVE_INFINITY, im: 0 }]) {
      const point = smithPoint(impedance, 50);
      if (!point.ok) throw new Error("expected limit point");
      const readout = smithReadout(point.value);
      expect(readout).toMatchObject({ ok: true, value: { vswr: Number.POSITIVE_INFINITY, returnLossDb: 0, mismatchLossDb: Number.POSITIVE_INFINITY } });
      if (!readout.ok) throw new Error("expected limit readout");
      expect(Object.values(readout.value).some((value) => typeof value === "number" && Number.isNaN(value))).toBe(false);
    }
  });
});
