import { describe, expect, it } from "vitest";
import { microstripHammerstadJensen } from "./transmission-line";

const example = { widthM: 3e-3, substrateHeightM: 1.6e-3, conductorThicknessM: 35e-6, relativePermittivity: 4.3, frequencyHz: 1e9, lengthM: 0.1 };

describe("Hammerstad-Jensen microstrip", () => {
  it("returns plausible impedance and propagation metrics for an FR-4 example", () => {
    const result = microstripHammerstadJensen(example);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.impedanceOhms).toBeGreaterThan(45);
    expect(result.value.impedanceOhms).toBeLessThan(55);
    expect(result.value.effectivePermittivity).toBeGreaterThan(1);
    expect(result.value.effectivePermittivity).toBeLessThan(example.relativePermittivity);
    expect(result.value.wavelengthM).toBeLessThan(0.299792458);
    expect(microstripHammerstadJensen({ ...example, lengthM: 0 })).toMatchObject({ ok: true, value: { electricalLengthDegrees: 0 } });
  });

  it.each([
    ["widthM", 0], ["substrateHeightM", -1], ["conductorThicknessM", 0], ["conductorThicknessM", 3e-3],
    ["relativePermittivity", 0.9], ["frequencyHz", 0], ["lengthM", -1],
  ] as const)("rejects invalid %s", (field, value) => {
    expect(microstripHammerstadJensen({ ...example, [field]: value })).toMatchObject({ ok: false });
  });

  it("warns when width-to-height is outside the documented model range", () => {
    const result = microstripHammerstadJensen({ ...example, widthM: 200 * example.substrateHeightM, conductorThicknessM: 1e-6 });
    expect(result).toMatchObject({ ok: true, warnings: [{ code: "model_range" }] });
  });
});
