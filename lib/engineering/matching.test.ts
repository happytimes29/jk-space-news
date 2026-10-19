import { describe, expect, it } from "vitest";
import { applyNetwork, componentImpedance } from "./network";
import { roundMatchSolution, solveLMatch } from "./matching";
import { reflectionCoefficient } from "./rf";
import { complexMagnitude, complexReciprocal } from "./complex";

const input = { load: { re: 25, im: 0 }, targetOhms: 50, frequencyHz: 1e9 };

function residual(load: { re: number; im: number }, target: number): number {
  const gamma = reflectionCoefficient(load, target);
  if (!gamma.ok) return Number.POSITIVE_INFINITY;
  return complexMagnitude(gamma.value);
}

describe("single-frequency L-match synthesis", () => {
  it("returns the low-pass and high-pass matches for a 25 ohm load", () => {
    const result = solveLMatch(input);
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected matches");
    expect(result.value).toHaveLength(2);
    expect(result.value.map(({ character }) => character).sort()).toEqual(["high-pass", "low-pass"]);

    const lowPass = result.value.find(({ character }) => character === "low-pass")!;
    expect(lowPass.steps).toMatchObject([
      { connection: "series", component: "L" },
      { connection: "shunt", component: "C" },
    ]);
    expect(lowPass.steps[0].value).toBeCloseTo(3.978873577e-9, 16);
    expect(lowPass.steps[1].value).toBeCloseTo(3.183098862e-12, 19);

    const highPass = result.value.find(({ character }) => character === "high-pass")!;
    expect(highPass.steps).toMatchObject([
      { connection: "series", component: "C" },
      { connection: "shunt", component: "L" },
    ]);
    expect(highPass.steps[0].value).toBeCloseTo(6.366197724e-12, 19);
    expect(highPass.steps[1].value).toBeCloseTo(7.957747155e-9, 16);

    for (const solution of result.value) {
      const reapplied = applyNetwork(input.load, solution.steps, input.frequencyHz);
      expect(reapplied).toMatchObject({ ok: true });
      if (!reapplied.ok) throw new Error("expected reapplied match");
      expect(residual(reapplied.value, input.targetOhms)).toBeLessThan(1e-9);
      expect(solution.residualGammaMagnitude).toBeLessThan(1e-9);
    }
  });

  it("describes an already matched load without inventing components", () => {
    expect(solveLMatch({ ...input, load: { re: 50, im: 0 } })).toEqual({
      ok: true, value: [], warnings: [{ code: "already_matched" }],
    });
  });

  it.each([
    { ...input, load: { re: -1, im: 0 } },
    { ...input, load: { re: 0, im: 0 } },
    { ...input, load: { re: Number.POSITIVE_INFINITY, im: 0 } },
    { ...input, targetOhms: 0 },
    { ...input, frequencyHz: 0 },
    { ...input, load: { re: 25, im: Number.NaN } },
  ])("rejects invalid matching input", (invalid) => {
    expect(solveLMatch(invalid)).toMatchObject({ ok: false });
  });

  it.each([{ re: 25, im: 10 }, { re: 100, im: -30 }])("matches representative complex load %o", (load) => {
    const result = solveLMatch({ ...input, load });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected complex-load match");
    expect(result.value.length).toBeGreaterThan(0);
    for (const solution of result.value) {
      const reapplied = applyNetwork(load, solution.steps, input.frequencyHz);
      if (!reapplied.ok) throw new Error("expected reapplied match");
      expect(residual(reapplied.value, input.targetOhms)).toBeLessThan(1e-9);
    }
  });
});

describe("preferred-value L-match", () => {
  it("evaluates nearby E24 values without mutating the ideal solution", () => {
    const idealResult = solveLMatch(input);
    if (!idealResult.ok) throw new Error("expected ideal matches");
    const ideal = idealResult.value[0];
    const snapshot = structuredClone(ideal);
    const rounded = roundMatchSolution(ideal, 24, input.load, input.targetOhms, input.frequencyHz);
    expect(rounded).toMatchObject({ ok: true });
    if (!rounded.ok) throw new Error("expected rounded match");
    expect(ideal).toEqual(snapshot);
    expect(rounded.value.steps.every(({ value }) => Number.isFinite(value) && value > 0)).toBe(true);
    expect(rounded.value.residualGammaMagnitude).toBeGreaterThanOrEqual(ideal.residualGammaMagnitude);
    for (const component of rounded.value.steps) {
      expect(componentImpedance(component, input.frequencyHz)).toMatchObject({ ok: true });
    }
  });

  it("keeps the shunt operation physically passive after rounding", () => {
    const idealResult = solveLMatch(input);
    if (!idealResult.ok) throw new Error("expected ideal matches");
    const rounded = roundMatchSolution(idealResult.value[0], 24, input.load, input.targetOhms, input.frequencyHz);
    if (!rounded.ok) throw new Error("expected rounded match");
    const final = applyNetwork(input.load, rounded.value.steps, input.frequencyHz);
    expect(final).toMatchObject({ ok: true });
    if (!final.ok) throw new Error("expected rounded network");
    expect(final.value.re).toBeGreaterThan(0);
    expect(complexReciprocal(final.value)).toMatchObject({ ok: true });
  });
});
