import { describe, expect, it } from "vitest";
import { inductorRecord } from "@/tests/fixtures/datasheets/inductor-record";
import { mlccRecord } from "@/tests/fixtures/datasheets/mlcc-record";
import type { ExtractionEnvelope, SpecificationValue, WorkConditions } from "./types";
import { compareSpecification, evaluateReplacement } from "./replacement";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function specification(record: ExtractionEnvelope, field: string): SpecificationValue {
  const value = record.part.specifications.find((item) => item.field === field);
  if (!value) throw new Error(`Missing fixture field ${field}`);
  return value;
}

const mlccConditions: WorkConditions = {
  componentKind: "mlcc",
  pcbChangeAllowed: false,
  requirements: [
    { field: "capacitance", rawValue: "0.1 µF", normalized: { typical: 1e-7, unit: "F" }, priority: "mandatory" },
    { field: "rated_voltage", rawValue: "25 V", normalized: { typical: 25, unit: "V" }, priority: "mandatory" },
    { field: "operating_temperature", rawValue: "-40 °C to 85 °C", normalized: { min: -40, max: 85, unit: "°C" }, priority: "mandatory" },
  ],
};

function replacementInput(overrides: Partial<Parameters<typeof evaluateReplacement>[0]> = {}) {
  return {
    original: clone(mlccRecord),
    candidate: clone(mlccRecord),
    conditions: clone(mlccConditions),
    footprintCompatible: true,
    externalChangesRequired: false,
    processChangesRequired: false,
    ...overrides,
  };
}

describe("evaluateReplacement", () => {
  it("returns_direct_replacement_only_when_all_mandatory_ratings_and_footprint_pass", () => {
    const report = evaluateReplacement(replacementInput());

    expect(report.verdict).toBe("direct-replacement");
    expect(report.reasonCodes).toEqual([]);
    expect(report.comparisons.every(({ status }) => status === "pass")).toBe(true);
  });

  it("returns_conditional_for_a_permitted_preference_difference", () => {
    const input = replacementInput();
    input.conditions.requirements.push({
      field: "esr",
      rawValue: "20 mΩ preferred",
      normalized: { max: 0.02, unit: "Ω" },
      priority: "preference",
    });

    const report = evaluateReplacement(input);

    expect(report.verdict).toBe("conditional");
    expect(report.reasonCodes).toContain("preference_evidence_missing: esr");
  });

  it("returns_not_recommended_when_candidate_voltage_is_below_the_working_requirement", () => {
    const input = replacementInput();
    specification(input.candidate, "rated_voltage").normalized = { max: 16, unit: "V" };

    const report = evaluateReplacement(input);

    expect(report.verdict).toBe("not-recommended");
    expect(report.reasonCodes).toContain("requirement_not_met: rated_voltage");
  });

  it("returns_not_recommended_when_the_footprint_is_not_compatible", () => {
    const report = evaluateReplacement(replacementInput({ footprintCompatible: false }));

    expect(report.verdict).toBe("not-recommended");
    expect(report.reasonCodes).toContain("footprint_incompatible");
  });

  it("returns_insufficient_evidence_when_a_mandatory_value_has_no_source", () => {
    const input = replacementInput();
    const voltage = specification(input.candidate, "rated_voltage");
    voltage.status = "missing";
    voltage.evidence = [];

    const report = evaluateReplacement(input);

    expect(report.verdict).toBe("insufficient-evidence");
    expect(report.reasonCodes).toContain("candidate_evidence_missing: rated_voltage");
  });

  it("returns_insufficient_evidence_when_test_conditions_are_not_comparable", () => {
    const input = replacementInput();
    specification(input.original, "capacitance").conditions = ["1 kHz, 1 Vrms"];
    specification(input.candidate, "capacitance").conditions = ["120 Hz, 0.5 Vrms"];

    const report = evaluateReplacement(input);

    expect(report.verdict).toBe("insufficient-evidence");
    expect(report.reasonCodes).toContain("test_conditions_mismatch: capacitance");
  });

  it("returns_insufficient_evidence_for_curve_only_dc_bias_data", () => {
    const input = replacementInput();
    input.conditions.requirements.push({ field: "dc_bias", rawValue: "retain at least 80%", priority: "mandatory" });
    input.original.part.specifications.push({
      field: "dc_bias",
      rawValue: "See curve",
      conditions: ["25 VDC"],
      evidence: [{ documentId: "fixture-mlcc", page: 4, quote: "DC bias characteristics", chunkHash: "4".repeat(64) }],
      status: "extracted",
      manualReview: true,
    });
    input.candidate.part.specifications.push(clone(input.original.part.specifications.at(-1)!));

    const report = evaluateReplacement(input);

    expect(report.verdict).toBe("insufficient-evidence");
    expect(report.reasonCodes).toContain("manual_curve_review_required: dc_bias");
  });

  it("returns_insufficient_evidence_until_both_exact_ordering_codes_are_selected", () => {
    const input = replacementInput();
    input.candidate.selectedOrderingCode = undefined;

    const report = evaluateReplacement(input);

    expect(report.verdict).toBe("insufficient-evidence");
    expect(report.reasonCodes).toContain("ordering_code_required");
  });

  it("treats_different_inductor_saturation_definitions_as_insufficient_evidence", () => {
    const original = clone(inductorRecord);
    const candidate = clone(inductorRecord);
    specification(original, "saturation_current").conditions = ["30% inductance drop"];
    specification(candidate, "saturation_current").conditions = ["10% inductance drop"];
    const conditions: WorkConditions = {
      componentKind: "shielded-power-inductor",
      pcbChangeAllowed: false,
      requirements: [{ field: "saturation_current", rawValue: "2 A peak", normalized: { typical: 2, unit: "A" }, priority: "mandatory" }],
    };

    const report = evaluateReplacement({ original, candidate, conditions, footprintCompatible: true });

    expect(report.verdict).toBe("insufficient-evidence");
    expect(report.reasonCodes).toContain("test_conditions_mismatch: saturation_current");
  });
});

describe("compareSpecification", () => {
  it("keeps_both_sources_on_a_passing_comparison", () => {
    const original = specification(mlccRecord, "rated_voltage");
    const candidate = clone(original);
    const row = compareSpecification(original, candidate, mlccConditions.requirements[1]);

    expect(row.status).toBe("pass");
    expect(row.original?.evidence[0].documentId).toBe("fixture-mlcc");
    expect(row.candidate?.evidence[0].documentId).toBe("fixture-mlcc");
  });
});
