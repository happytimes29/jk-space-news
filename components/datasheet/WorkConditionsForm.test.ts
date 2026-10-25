import { describe, expect, it } from "vitest";
import { buildWorkConditions, conditionDraftIssues, type ConditionDraft } from "./WorkConditionsForm";

describe("work condition validation", () => {
  it("requires_the_complete_component_specific_condition_set", () => {
    expect(conditionDraftIssues("mlcc", { values: { rated_voltage: "25 V" }, priorities: {} })).toContain("capacitance: required");
  });

  it("parses_scientific_notation_as_one_number_instead_of_a_range", () => {
    const draft: ConditionDraft = { values: { rated_voltage: "1e3 V" }, priorities: {} };
    const conditions = buildWorkConditions("mlcc", draft);
    expect(conditions.requirements[0].normalized).toEqual({ typical: 1_000, unit: "V" });
  });

  it("rejects_reversed_ranges_and_trailing_unparsed_text", () => {
    const complete: ConditionDraft = {
      values: {
        capacitance: "0.1 µF", rated_voltage: "25 V", test_frequency: "100 kHz",
        ripple_current: "1 A", operating_temperature: "-40 to 85 °C",
        dielectric: "X7R", dimensions: "1.6 × 0.8 mm",
      },
      priorities: {},
    };

    expect(conditionDraftIssues("mlcc", { ...complete, values: { ...complete.values, rated_voltage: "500 to 25 V" } })).toContain("rated_voltage: invalid quantity");
    expect(conditionDraftIssues("mlcc", { ...complete, values: { ...complete.values, operating_temperature: "85 to -40 °C" } })).toContain("operating_temperature: invalid quantity");
    expect(conditionDraftIssues("mlcc", { ...complete, values: { ...complete.values, rated_voltage: "25 V maybe" } })).toContain("rated_voltage: invalid quantity");
  });
});
