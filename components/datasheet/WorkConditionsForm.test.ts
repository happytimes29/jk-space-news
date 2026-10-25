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
});
