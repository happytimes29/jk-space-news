import { describe, expect, it } from "vitest";
import { applyNetwork, applyNetworkStep, componentImpedance, sampleNetworkStep, type NetworkStep } from "./network";

const ghz = 1e9;
const step = (connection: "series" | "shunt", component: "R" | "L" | "C", value: number, id = `${connection}-${component}`): NetworkStep => ({ id, connection, component, value });

describe("ideal component impedance", () => {
  it("converts the reference inductance and capacitance to ±j25 ohms", () => {
    const inductor = componentImpedance(step("series", "L", 3.978873577e-9), ghz);
    const capacitor = componentImpedance(step("series", "C", 6.366197724e-12), ghz);
    expect(inductor).toMatchObject({ ok: true });
    expect(capacitor).toMatchObject({ ok: true });
    if (!inductor.ok || !capacitor.ok) throw new Error("expected component impedance");
    expect(inductor.value.re).toBe(0);
    expect(inductor.value.im).toBeCloseTo(25, 8);
    expect(capacitor.value.re).toBe(0);
    expect(capacitor.value.im).toBeCloseTo(-25, 8);
  });

  it.each([
    step("series", "R", 0), step("series", "L", -1), step("shunt", "C", Number.NaN),
    { id: "bad", connection: "series", component: "X", value: 1 } as unknown as NetworkStep,
  ])("rejects invalid component data", (component) => {
    expect(componentImpedance(component, ghz)).toMatchObject({ ok: false });
  });

  it("rejects non-positive frequency", () => {
    expect(componentImpedance(step("series", "L", 1e-9), 0)).toMatchObject({ ok: false, error: { code: "non_positive" } });
  });
});

describe("network application", () => {
  it("adds series impedance directly", () => {
    const result = applyNetworkStep({ re: 25, im: 10 }, step("series", "L", 3.978873577e-9), ghz);
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected network result");
    expect(result.value.re).toBeCloseTo(25, 12);
    expect(result.value.im).toBeCloseTo(35, 8);
  });

  it("adds shunt admittance", () => {
    const result = applyNetworkStep({ re: 50, im: 0 }, step("shunt", "R", 50), ghz);
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected network result");
    expect(result.value).toEqual({ re: 25, im: 0 });
  });

  it("cascades in order and matches direct complex arithmetic", () => {
    const steps = [step("series", "L", 25 / (2 * Math.PI * ghz)), step("shunt", "C", 1 / (2 * Math.PI * ghz * 25))] as const;
    const result = applyNetwork({ re: 25, im: 0 }, steps, ghz);
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected cascade");
    // Z1=25+j25; Y1=.02-j.02; shunt C contributes +j.04 S.
    expect(result.value.re).toBeCloseTo(25, 10);
    expect(result.value.im).toBeCloseTo(-25, 10);
  });

  it.each([
    [{ re: Number.NaN, im: 0 }, step("series", "R", 10), ghz],
    [{ re: -1, im: 0 }, step("series", "R", 10), ghz],
    [{ re: 50, im: 0 }, step("series", "R", 10), -1],
  ] as const)("rejects invalid network input", (load, component, frequency) => {
    expect(applyNetworkStep(load, component, frequency)).toMatchObject({ ok: false });
  });
});

describe("Smith path sampling", () => {
  it("includes the exact start and end with finite chart coordinates", () => {
    const load = { re: 25, im: 0 };
    const component = step("series", "L", 3.978873577e-9);
    const sampled = sampleNetworkStep(load, component, ghz, 50);
    const endpoint = applyNetworkStep(load, component, ghz);
    expect(sampled).toMatchObject({ ok: true });
    expect(endpoint).toMatchObject({ ok: true });
    if (!sampled.ok || !endpoint.ok) throw new Error("expected sampled path");
    expect(sampled.value).toHaveLength(48);
    expect(sampled.value[0].impedance).toEqual(load);
    expect(sampled.value.at(-1)?.impedance.re).toBeCloseTo(endpoint.value.re, 12);
    expect(sampled.value.at(-1)?.impedance.im).toBeCloseTo(endpoint.value.im, 12);
    expect(sampled.value.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))).toBe(true);
  });

  it.each([
    step("series", "R", 10),
    step("series", "L", 3.978873577e-9),
    step("series", "C", 6.366197724e-12),
    step("shunt", "R", 100),
    step("shunt", "L", 7.957747155e-9),
    step("shunt", "C", 3.183098862e-12),
  ])("starts every %s %s trajectory at the preceding network state", (component) => {
    const load = { re: 25, im: 10 };
    const sampled = sampleNetworkStep(load, component, ghz, 50);
    expect(sampled).toMatchObject({ ok: true });
    if (!sampled.ok) return;
    expect(sampled.value[0].impedance.re).toBeCloseTo(load.re, 12);
    expect(sampled.value[0].impedance.im).toBeCloseTo(load.im, 12);
  });

  it("rejects an unusable sample count", () => {
    expect(sampleNetworkStep({ re: 50, im: 0 }, step("series", "R", 10), ghz, 50, 1)).toMatchObject({ ok: false });
  });
});
