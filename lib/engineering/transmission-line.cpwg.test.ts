import { describe, expect, it } from "vitest";
import { groundedCoplanarWaveguideQucs } from "./transmission-line";

const example = { widthM: 3e-3, gapM: 0.2e-3, substrateHeightM: 1.6e-3, conductorThicknessM: 0, relativePermittivity: 4.3, frequencyHz: 1e9, lengthM: 0.1 };

describe("Qucs grounded coplanar waveguide", () => {
  it("matches Qucs equations 12.10 through 12.13 for zero thickness", () => {
    const result = groundedCoplanarWaveguideQucs(example);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.impedanceOhms).toBeCloseTo(36.35, 0);
    expect(result.value.effectivePermittivity).toBeCloseTo(2.873, 2);
  });

  it("applies the first-order metal thickness correction", () => {
    const result = groundedCoplanarWaveguideQucs({ ...example, conductorThicknessM: 35e-6 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.impedanceOhms).toBeCloseTo(34.483, 3);
    expect(result.value.effectivePermittivity).toBeCloseTo(2.71389, 5);
  });

  it.each([
    ["widthM", 0], ["gapM", 0], ["substrateHeightM", -1], ["conductorThicknessM", -1],
    ["conductorThicknessM", 0.2e-3], ["relativePermittivity", 0.9], ["frequencyHz", 0], ["lengthM", -1],
  ] as const)("rejects invalid %s", (field, value) => {
    expect(groundedCoplanarWaveguideQucs({ ...example, [field]: value })).toMatchObject({ ok: false });
  });

  it("rejects a correction that consumes the physical gap", () => {
    expect(groundedCoplanarWaveguideQucs({ ...example, widthM: 1, substrateHeightM: 1, conductorThicknessM: 0.19e-3 })).toMatchObject({ ok: false, error: { code: "unsupported_geometry" } });
  });
});
