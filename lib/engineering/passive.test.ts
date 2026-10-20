import { describe, expect, it } from "vitest";
import {
  capacitiveReactanceOhms,
  dividerWorstCase,
  inductiveReactanceOhms,
  lcResonanceHz,
  loadedDivider,
  parallelRlc,
  rcCutoffHz,
  rcTimeConstantSeconds,
  seriesRlc,
  suggestDivider,
  symmetricAttenuator,
} from "./passive";

describe("voltage divider calculations", () => {
  it("calculates unloaded and loaded divider operating points", () => {
    const unloaded = loadedDivider({ vin: 10, rTopOhms: 10_000, rBottomOhms: 10_000 });
    expect(unloaded).toMatchObject({ ok: true });
    if (!unloaded.ok) throw new Error("expected divider result");
    expect(unloaded.value.vout).toBeCloseTo(5, 12);
    expect(unloaded.value.branchCurrentA).toBeCloseTo(0.0005, 12);
    expect(unloaded.value.effectiveBottomOhms).toBeCloseTo(10_000, 12);
    expect(unloaded.value.rTopPowerW).toBeCloseTo(0.0025, 12);
    expect(unloaded.value.rBottomPowerW).toBeCloseTo(0.0025, 12);

    const loaded = loadedDivider({ vin: 10, rTopOhms: 10_000, rBottomOhms: 10_000, loadOhms: 10_000 });
    expect(loaded).toMatchObject({ ok: true });
    if (!loaded.ok) throw new Error("expected loaded divider result");
    expect(loaded.value.effectiveBottomOhms).toBeCloseTo(5_000, 12);
    expect(loaded.value.vout).toBeCloseTo(10 / 3, 12);
    expect(loaded.value.loadPowerW).toBeCloseTo((10 / 3) ** 2 / 10_000, 12);
  });

  it("brackets nominal output with resistor tolerance extremes", () => {
    const nominal = loadedDivider({ vin: 10, rTopOhms: 10_000, rBottomOhms: 10_000 });
    const worstCase = dividerWorstCase({ vin: 10, rTopOhms: 10_000, rBottomOhms: 10_000, tolerancePercent: 1 });
    expect(nominal).toMatchObject({ ok: true });
    expect(worstCase).toMatchObject({ ok: true });
    if (!nominal.ok || !worstCase.ok) throw new Error("expected divider results");
    expect(worstCase.value.minVout).toBeLessThan(nominal.value.vout);
    expect(worstCase.value.maxVout).toBeGreaterThan(nominal.value.vout);
  });

  it("suggests deterministic E24 pairs ranked by voltage error then resistance", () => {
    const result = suggestDivider({ vin: 3.3, targetVout: 1.8, series: 24, nominalCurrentA: 100e-6, limit: 8 });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected suggestions");
    expect(result.value).toHaveLength(8);
    for (let index = 1; index < result.value.length; index += 1) {
      const previous = result.value[index - 1];
      const current = result.value[index];
      expect(
        current.relativeVoltageError > previous.relativeVoltageError ||
          (current.relativeVoltageError === previous.relativeVoltageError && current.totalResistanceOhms >= previous.totalResistanceOhms),
      ).toBe(true);
    }
    expect(suggestDivider({ vin: 3.3, targetVout: 1.8, series: 24, nominalCurrentA: 100e-6, limit: 8 })).toEqual(result);
  });

  it.each([
    () => loadedDivider({ vin: 10, rTopOhms: 0, rBottomOhms: 10_000 }),
    () => loadedDivider({ vin: 10, rTopOhms: 10_000, rBottomOhms: -1 }),
    () => loadedDivider({ vin: 10, rTopOhms: 10_000, rBottomOhms: 10_000, loadOhms: Number.POSITIVE_INFINITY }),
    () => suggestDivider({ vin: 3.3, targetVout: 0, series: 24 }),
    () => suggestDivider({ vin: 3.3, targetVout: 3.3, series: 24 }),
    () => suggestDivider({ vin: 3.3, targetVout: 3.4, series: 24 }),
  ])("rejects invalid divider input", (calculate) => {
    expect(calculate()).toMatchObject({ ok: false });
  });
});

describe("reactive component calculations", () => {
  it("calculates RC cutoff and time constant", () => {
    const cutoff = rcCutoffHz({ resistanceOhms: 1_000, capacitanceF: 100e-9 });
    const timeConstant = rcTimeConstantSeconds({ resistanceOhms: 1_000, capacitanceF: 100e-9 });
    expect(cutoff).toMatchObject({ ok: true });
    expect(timeConstant).toMatchObject({ ok: true });
    if (!cutoff.ok || !timeConstant.ok) throw new Error("expected RC results");
    expect(cutoff.value).toBeCloseTo(1591.5494309189535, 10);
    expect(timeConstant.value).toBeCloseTo(0.0001, 12);
  });

  it("calculates LC resonance and equal reactance magnitudes", () => {
    const resonance = lcResonanceHz({ inductanceH: 10e-9, capacitanceF: 1e-12 });
    expect(resonance).toMatchObject({ ok: true });
    if (!resonance.ok) throw new Error("expected resonance");
    expect(resonance.value).toBeCloseTo(1.5915494309189534e9, 3);

    const xl = inductiveReactanceOhms({ frequencyHz: resonance.value, inductanceH: 10e-9 });
    const xc = capacitiveReactanceOhms({ frequencyHz: resonance.value, capacitanceF: 1e-12 });
    expect(xl).toMatchObject({ ok: true });
    expect(xc).toMatchObject({ ok: true });
    if (!xl.ok || !xc.ok) throw new Error("expected reactances");
    expect(xl.value).toBeCloseTo(xc.value, 10);
  });

  it("calculates series and parallel RLC quality factor and bandwidth", () => {
    const series = seriesRlc({ resistanceOhms: 10, inductanceH: 10e-6, capacitanceF: 100e-9 });
    const parallel = parallelRlc({ resistanceOhms: 1_000, inductanceH: 10e-6, capacitanceF: 100e-9 });
    expect(series).toMatchObject({ ok: true });
    expect(parallel).toMatchObject({ ok: true });
    if (!series.ok || !parallel.ok) throw new Error("expected RLC results");
    expect(series.value.q).toBeGreaterThan(0);
    expect(series.value.bandwidthHz).toBeGreaterThan(0);
    expect(parallel.value.q).toBeGreaterThan(0);
    expect(parallel.value.bandwidthHz).toBeGreaterThan(0);
  });

  it.each([
    () => rcCutoffHz({ resistanceOhms: 0, capacitanceF: 1e-9 }),
    () => rcTimeConstantSeconds({ resistanceOhms: 1_000, capacitanceF: -1 }),
    () => lcResonanceHz({ inductanceH: Number.NaN, capacitanceF: 1e-12 }),
    () => inductiveReactanceOhms({ frequencyHz: 0, inductanceH: 1e-9 }),
    () => capacitiveReactanceOhms({ frequencyHz: 1e9, capacitanceF: 0 }),
    () => seriesRlc({ resistanceOhms: 0, inductanceH: 1e-9, capacitanceF: 1e-12 }),
    () => parallelRlc({ resistanceOhms: 50, inductanceH: -1, capacitanceF: 1e-12 }),
  ])("rejects invalid reactive input", (calculate) => {
    expect(calculate()).toMatchObject({ ok: false });
  });
});

describe("symmetric attenuator calculations", () => {
  it.each(["tee", "pi"] as const)("calculates a positive finite 6 dB 50 ohm %s network", (topology) => {
    const result = symmetricAttenuator({ topology, attenuationDb: 6, impedanceOhms: 50, inputPowerWatts: 1 });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected attenuator");
    expect(Object.values(result.value.resistorsOhms).every((value) => Number.isFinite(value) && value > 0)).toBe(true);
    expect(result.value.inputPowerW).toBe(1);
    expect(result.value.outputPowerW).toBeCloseTo(10 ** (-0.6), 12);
    expect(result.value.estimatedTotalDissipationW).toBeCloseTo(1 - 10 ** (-6 / 10), 12);
    expect(Object.values(result.value.resistorDissipationW ?? {}).reduce((sum, value) => sum + value, 0)).toBeCloseTo(result.value.estimatedTotalDissipationW!, 12);
  });

  it("omits power dissipation when input power is omitted", () => {
    const result = symmetricAttenuator({ topology: "tee", attenuationDb: 6, impedanceOhms: 50 });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected attenuator");
    expect(result.value.estimatedTotalDissipationW).toBeUndefined();
    expect(result.value.inputPowerW).toBeUndefined();
    expect(result.value.outputPowerW).toBeUndefined();
  });

  it.each(["tee", "pi"] as const)("accepts zero input power for a %s network", (topology) => {
    const result = symmetricAttenuator({ topology, attenuationDb: 6, impedanceOhms: 50, inputPowerWatts: 0 });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected attenuator");
    expect(result.value.inputPowerW).toBe(0);
    expect(result.value.outputPowerW).toBe(0);
    expect(result.value.estimatedTotalDissipationW).toBe(0);
    expect(Object.values(result.value.resistorDissipationW ?? {})).toEqual([0, 0, 0]);
  });

  it.each(["tee", "pi"] as const)("remains finite for a very small %s attenuation", (topology) => {
    const result = symmetricAttenuator({ topology, attenuationDb: 0.001, impedanceOhms: 50 });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected attenuator");
    expect(Object.values(result.value.resistorsOhms).every((value) => Number.isFinite(value) && value > 0)).toBe(true);
  });

  it.each([
    ["attenuationDb", () => symmetricAttenuator({ topology: "tee", attenuationDb: 0, impedanceOhms: 50 })],
    ["attenuationDb", () => symmetricAttenuator({ topology: "pi", attenuationDb: -1, impedanceOhms: 50 })],
    ["impedanceOhms", () => symmetricAttenuator({ topology: "tee", attenuationDb: 6, impedanceOhms: 0 })],
    ["inputPowerWatts", () => symmetricAttenuator({ topology: "tee", attenuationDb: 6, impedanceOhms: 50, inputPowerWatts: -1 })],
    ["attenuationDb", () => symmetricAttenuator({ topology: "tee", attenuationDb: Number.NaN, impedanceOhms: 50 })],
    ["impedanceOhms", () => symmetricAttenuator({ topology: "pi", attenuationDb: 6, impedanceOhms: Number.POSITIVE_INFINITY })],
    ["inputPowerWatts", () => symmetricAttenuator({ topology: "tee", attenuationDb: 6, impedanceOhms: 50, inputPowerWatts: Number.NaN })],
  ] as const)("reports invalid attenuator input on %s", (field, calculate) => {
    expect(calculate()).toMatchObject({ ok: false, error: { field } });
  });
});
