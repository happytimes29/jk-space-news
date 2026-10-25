import { requiredFieldsFor } from "./component-fields";
import type {
  ComparisonRow,
  ExtractionEnvelope,
  ReplacementReport,
  SpecificationValue,
  WorkConditions,
  WorkRequirement,
} from "./types";

export interface ReplacementInput {
  original: ExtractionEnvelope;
  candidate: ExtractionEnvelope;
  conditions: WorkConditions;
  footprintCompatible: boolean;
  externalChangesRequired?: boolean;
  processChangesRequired?: boolean;
}

function hasVerifiedEvidence(value: SpecificationValue | undefined): value is SpecificationValue {
  return Boolean(value && value.status === "extracted" && value.evidence.length > 0);
}

function conditionsMatch(original: SpecificationValue, candidate: SpecificationValue): boolean {
  if (original.conditions.length === 0 && candidate.conditions.length === 0) return true;
  const left = [...original.conditions].sort();
  const right = [...candidate.conditions].sort();
  return JSON.stringify(left) === JSON.stringify(right);
}

function representative(value: SpecificationValue, preference: "min" | "typical" | "max"): number | undefined {
  const normalized = value.normalized;
  if (!normalized) return undefined;
  if (preference === "max") return normalized.max ?? normalized.typical ?? normalized.min;
  if (preference === "min") return normalized.min ?? normalized.typical ?? normalized.max;
  return normalized.typical ?? normalized.max ?? normalized.min;
}

function requirementNumber(requirement: WorkRequirement, preference: "min" | "typical" | "max"): number | undefined {
  const normalized = requirement.normalized;
  if (!normalized) return undefined;
  if (preference === "max") return normalized.max ?? normalized.typical ?? normalized.min;
  if (preference === "min") return normalized.min ?? normalized.typical ?? normalized.max;
  return normalized.typical ?? normalized.max ?? normalized.min;
}

function requirementPasses(candidate: SpecificationValue, requirement: WorkRequirement): boolean {
  if (!requirement.normalized) return candidate.rawValue === requirement.rawValue;
  if (!candidate.normalized || candidate.normalized.unit !== requirement.normalized.unit) return false;

  if (["rated_voltage", "rated_current", "rms_current", "saturation_current"].includes(requirement.field)) {
    const available = representative(candidate, "max");
    const needed = requirementNumber(requirement, "typical");
    return available !== undefined && needed !== undefined && available >= needed;
  }
  if (["dcr", "esr", "dimensions_max"].includes(requirement.field)) {
    const available = representative(candidate, "max");
    const allowed = requirementNumber(requirement, "max");
    return available !== undefined && allowed !== undefined && available <= allowed;
  }
  if (requirement.field === "operating_temperature") {
    const availableMin = candidate.normalized.min;
    const availableMax = candidate.normalized.max;
    const neededMin = requirement.normalized.min;
    const neededMax = requirement.normalized.max;
    return availableMin !== undefined && availableMax !== undefined
      && neededMin !== undefined && neededMax !== undefined
      && availableMin <= neededMin && availableMax >= neededMax;
  }
  const available = representative(candidate, "typical");
  const needed = requirementNumber(requirement, "typical");
  return available !== undefined && needed !== undefined && available === needed;
}

function baselinePasses(original: SpecificationValue, candidate: SpecificationValue): boolean {
  if (original.normalized && candidate.normalized && original.normalized.unit === candidate.normalized.unit) {
    if (["rated_voltage", "rated_current", "rms_current", "saturation_current"].includes(original.field)) {
      const left = representative(original, "max");
      const right = representative(candidate, "max");
      return left !== undefined && right !== undefined && right >= left;
    }
    if (["dcr", "esr"].includes(original.field)) {
      const left = representative(original, "max");
      const right = representative(candidate, "max");
      return left !== undefined && right !== undefined && right <= left;
    }
    if (original.field === "operating_temperature") {
      return candidate.normalized.min !== undefined && candidate.normalized.max !== undefined
        && original.normalized.min !== undefined && original.normalized.max !== undefined
        && candidate.normalized.min <= original.normalized.min
        && candidate.normalized.max >= original.normalized.max;
    }
    return representative(original, "typical") === representative(candidate, "typical");
  }
  return original.rawValue.trim().toLowerCase() === candidate.rawValue.trim().toLowerCase();
}

export function compareSpecification(
  original: SpecificationValue | undefined,
  candidate: SpecificationValue | undefined,
  requirement?: WorkRequirement,
): ComparisonRow {
  const field = requirement?.field ?? original?.field ?? candidate?.field ?? "unknown";
  const priority = requirement?.priority ?? "mandatory";
  if (!hasVerifiedEvidence(original)) {
    return { field, status: priority === "preference" ? "soft-difference" : "insufficient-evidence", reasonCode: `${priority === "preference" ? "preference" : "original"}_evidence_missing`, original, candidate, requirement };
  }
  if (!hasVerifiedEvidence(candidate)) {
    return { field, status: priority === "preference" ? "soft-difference" : "insufficient-evidence", reasonCode: `${priority === "preference" ? "preference" : "candidate"}_evidence_missing`, original, candidate, requirement };
  }
  if (original.manualReview || candidate.manualReview) {
    return { field, status: priority === "preference" ? "soft-difference" : "insufficient-evidence", reasonCode: `manual_curve_review_required`, original, candidate, requirement };
  }
  if (!conditionsMatch(original, candidate)) {
    return { field, status: priority === "preference" ? "soft-difference" : "insufficient-evidence", reasonCode: "test_conditions_mismatch", original, candidate, requirement };
  }
  const pass = requirement ? requirementPasses(candidate, requirement) : baselinePasses(original, candidate);
  if (pass) return { field, status: "pass", reasonCode: "compatible", original, candidate, requirement };
  return {
    field,
    status: priority === "preference" ? "soft-difference" : "fail",
    reasonCode: priority === "preference" ? "preference_not_met" : "requirement_not_met",
    original,
    candidate,
    requirement,
  };
}

function withField(reasonCode: string, field: string): string {
  return reasonCode === "compatible" ? "" : `${reasonCode}: ${field}`;
}

export function evaluateReplacement(input: ReplacementInput): ReplacementReport {
  const comparisons: ComparisonRow[] = [];
  const reasonCodes: string[] = [];
  const addReason = (reason: string) => {
    if (reason && !reasonCodes.includes(reason)) reasonCodes.push(reason);
  };

  if (!input.original.selectedOrderingCode || !input.candidate.selectedOrderingCode) {
    addReason("ordering_code_required");
  }
  if (input.original.componentKind !== input.candidate.componentKind || input.conditions.componentKind !== input.original.componentKind) {
    addReason("component_kind_mismatch");
  }
  if (!input.footprintCompatible) addReason("footprint_incompatible");
  if (input.externalChangesRequired) addReason("external_change_required");
  if (input.processChangesRequired) addReason("process_change_required");

  const requiredFields = requiredFieldsFor(input.original.componentKind)
    .filter(({ requiredForReplacement }) => requiredForReplacement)
    .map(({ id }) => id);
  const fields = [...new Set([...requiredFields, ...input.conditions.requirements.map(({ field }) => field)])];

  for (const field of fields) {
    const original = input.original.part.specifications.find((item) => item.field === field);
    const candidate = input.candidate.part.specifications.find((item) => item.field === field);
    const requirement = input.conditions.requirements.find((item) => item.field === field);
    const row = compareSpecification(original, candidate, requirement);
    comparisons.push(row);
    addReason(withField(row.reasonCode, field));
  }

  const hasHardFailure = reasonCodes.some((reason) =>
    reason === "footprint_incompatible"
    || reason === "component_kind_mismatch"
    || reason.startsWith("requirement_not_met:"));
  const hasInsufficientEvidence = reasonCodes.some((reason) =>
    reason === "ordering_code_required"
    || reason.startsWith("original_evidence_missing:")
    || reason.startsWith("candidate_evidence_missing:")
    || reason.startsWith("test_conditions_mismatch:")
    || reason.startsWith("manual_curve_review_required:"));
  const hasCondition = reasonCodes.some((reason) =>
    reason === "external_change_required"
    || reason === "process_change_required"
    || reason.startsWith("preference_"));

  return {
    verdict: hasHardFailure
      ? "not-recommended"
      : hasInsufficientEvidence
        ? "insufficient-evidence"
        : hasCondition
          ? "conditional"
          : "direct-replacement",
    reasonCodes,
    comparisons,
  };
}

