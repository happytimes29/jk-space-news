import { describe, expect, it } from "vitest";
import {
  dbmFromPowerWatts,
  impedanceToAdmittance,
  powerWattsFromDbm,
  reflectionCoefficient,
  reflectionMetrics,
  rfVoltageFromPower,
  wavelength,
} from "./rf";

describe("RF power and propagation", () => {
  it("converts dBm, watts, and voltage from independent references", () => {
    expect(powerWattsFromDbm(0)).toMatchObject({ ok: true, value: 0.001 });
    expect(powerWattsFromDbm(30)).toMatchObject({ ok: true, value: 1 });
    expect(dbmFromPowerWatts(1)).toMatchObject({ ok: true, value: 30 });
    const voltage = rfVoltageFromPower({ watts: 1, impedanceOhms: 50 });
    expect(voltage).toMatchObject({ ok: true });
    if (!voltage.ok) throw new Error("expected voltage");
    expect(voltage.value.vrms).toBeCloseTo(Math.sqrt(50), 12);
    expect(voltage.value.vPeakToPeak).toBeCloseTo(2 * Math.sqrt(2) * Math.sqrt(50), 12);
  });

  it("calculates free-space and dielectric wavelength", () => {
    expect(wavelength({ frequencyHz: 1e9 })).toMatchObject({ ok: true, value: { wavelengthM: 0.299792458 } });
    const dielectric = wavelength({ frequencyHz: 1e9, relativePermittivity: 4 });
    expect(dielectric).toMatchObject({ ok: true, value: { wavelengthM: 0.149896229 } });
    expect(wavelength({ frequencyHz: 1e9, relativePermittivity: 4, velocityFactor: 0.5 })).toMatchObject({ ok: false, error: { code: "conflicting_inputs" } });
  });

  it.each([
    () => dbmFromPowerWatts(-1),
    () => rfVoltageFromPower({ watts: 1, impedanceOhms: 0 }),
    () => wavelength({ frequencyHz: 0 }),
    () => wavelength({ frequencyHz: 1, relativePermittivity: 0 }),
    () => powerWattsFromDbm(Number.POSITIVE_INFINITY),
  ])("rejects invalid physical inputs", (calculate) => {
    expect(calculate()).toMatchObject({ ok: false });
  });
});

describe("RF impedance and reflection", () => {
  it("converts impedance to admittance", () => {
    const result = impedanceToAdmittance({ re: 25, im: 25 });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected admittance");
    expect(result.value.re).toBeCloseTo(0.02, 12);
    expect(result.value.im).toBeCloseTo(-0.02, 12);
  });

  it("represents matched and short-circuit limits deliberately", () => {
    const matched = reflectionCoefficient({ re: 50, im: 0 }, 50);
    expect(matched).toEqual({ ok: true, value: { re: 0, im: 0 }, warnings: [] });
    if (!matched.ok) throw new Error("expected match");
    expect(reflectionMetrics(matched.value)).toMatchObject({
      ok: true,
      value: { magnitude: 0, vswr: 1, s11Db: Number.NEGATIVE_INFINITY, returnLossDb: Number.POSITIVE_INFINITY, mismatchLossDb: 0 },
    });

    const short = reflectionCoefficient({ re: 0, im: 0 }, 50);
    expect(short).toEqual({ ok: true, value: { re: -1, im: 0 }, warnings: [] });
    if (!short.ok) throw new Error("expected short");
    expect(reflectionMetrics(short.value)).toMatchObject({ ok: true, value: { magnitude: 1, vswr: Number.POSITIVE_INFINITY, returnLossDb: 0, mismatchLossDb: Number.POSITIVE_INFINITY } });
  });

  it("rejects undefined reflection inputs", () => {
    expect(reflectionCoefficient({ re: -50, im: 0 }, 50)).toMatchObject({ ok: false, error: { code: "division_by_zero" } });
    expect(reflectionCoefficient({ re: 50, im: 0 }, 0)).toMatchObject({ ok: false });
    expect(reflectionMetrics({ re: Number.NaN, im: 0 })).toMatchObject({ ok: false, error: { code: "non_finite" } });
  });
});
