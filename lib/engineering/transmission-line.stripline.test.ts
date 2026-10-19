import { describe, expect, it } from "vitest";
import { symmetricStriplineFiniteThickness } from "./transmission-line";

const example = { widthM: 0.75e-3, planeSeparationM: 1.6e-3, conductorThicknessM: 35e-6, relativePermittivity: 4.3, frequencyHz: 1e9, lengthM: 0.1 };

describe("finite-thickness symmetric stripline", () => {
  it("matches a centered FR-4 reference and homogeneous propagation", () => {
    const result = symmetricStriplineFiniteThickness(example);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.impedanceOhms).toBeGreaterThan(45);
    expect(result.value.impedanceOhms).toBeLessThan(55);
    expect(result.value.effectivePermittivity).toBe(example.relativePermittivity);
    expect(result.value.phaseVelocityMps).toBeCloseTo(299_792_458 / Math.sqrt(4.3), 6);
  });

  it("matches the independent Steer finite-thickness narrow-trace benchmark", () => {
    const result = symmetricStriplineFiniteThickness({ ...example, widthM: 0.1e-3 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.impedanceOhms).toBeCloseTo(95.21, 2);
  });

  it.each([
    ["widthM", 0], ["planeSeparationM", 0], ["conductorThicknessM", -1], ["conductorThicknessM", 1.6e-3],
    ["relativePermittivity", 0.9], ["frequencyHz", 0], ["lengthM", -1],
  ] as const)("rejects invalid %s", (field, value) => {
    expect(symmetricStriplineFiniteThickness({ ...example, [field]: value })).toMatchObject({ ok: false });
  });

  it("warns outside the documented finite-thickness validity range", () => {
    expect(symmetricStriplineFiniteThickness({ ...example, widthM: 0.05e-3 })).toMatchObject({ ok: true, warnings: [{ code: "model_range" }] });
    expect(symmetricStriplineFiniteThickness({ ...example, conductorThicknessM: 0.05e-3 })).toMatchObject({ ok: true, warnings: [{ code: "model_range" }] });
  });
});
