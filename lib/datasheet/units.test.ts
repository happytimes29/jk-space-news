import { describe, expect, it } from "vitest";
import { normalizeQuantity } from "./units";

describe("normalizeQuantity", () => {
  it.each([
    ["capacitance", "pF", 100, "F", 1e-10],
    ["capacitance", "nF", 100, "F", 1e-7],
    ["capacitance", "µF", 0.1, "F", 1e-7],
    ["capacitance", "μF", 0.1, "F", 1e-7],
    ["resistance", "mΩ", 80, "Ω", 0.08],
    ["resistance", "Ω", 2, "Ω", 2],
    ["frequency", "kHz", 100, "Hz", 100_000],
    ["frequency", "MHz", 2.4, "Hz", 2_400_000],
    ["current", "mA", 750, "A", 0.75],
    ["current", "A", 2, "A", 2],
    ["temperature", "°C", 125, "°C", 125],
  ] as const)("normalizes %s %s to its SI base", (dimension, unit, input, expectedUnit, expected) => {
    const result = normalizeQuantity({ rawValue: `${input} ${unit}`, dimension, unit, typical: input });

    expect(result).toEqual({
      ok: true,
      value: { rawValue: `${input} ${unit}`, dimension, unit: expectedUnit, typical: expected },
    });
  });

  it("preserves_min_typical_and_max_during_conversion", () => {
    const result = normalizeQuantity({
      rawValue: "4.5 to 5.5 V",
      dimension: "voltage",
      unit: "V",
      min: 4.5,
      typical: 5,
      max: 5.5,
    });

    expect(result).toEqual({
      ok: true,
      value: { rawValue: "4.5 to 5.5 V", dimension: "voltage", unit: "V", min: 4.5, typical: 5, max: 5.5 },
    });
  });

  it("rejects_a_unit_from_the_wrong_dimension", () => {
    expect(normalizeQuantity({ rawValue: "50 V", dimension: "current", unit: "V", max: 50 })).toEqual({
      ok: false,
      error: { code: "unit_dimension_mismatch", dimension: "current", unit: "V" },
    });
  });

  it("rejects_non_finite_values_instead_of_returning_nan", () => {
    expect(normalizeQuantity({ rawValue: "invalid", dimension: "resistance", unit: "Ω", typical: Number.NaN })).toEqual({
      ok: false,
      error: { code: "non_finite_quantity", field: "typical" },
    });
  });

  it("does_not_parse_values_from_curve_descriptions", () => {
    expect(normalizeQuantity({ rawValue: "see DC bias curve on page 4", dimension: "capacitance", unit: "F" })).toEqual({
      ok: false,
      error: { code: "quantity_value_required" },
    });
  });
});
