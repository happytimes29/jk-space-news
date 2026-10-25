import { requiredFieldsFor } from "./component-fields";
import type {
  ComponentKind,
  ExtractionEnvelope,
  NormalizedQuantity,
  SourceEvidence,
  SpecificationValue,
  ValidationIssue,
  ValidationResult,
} from "./types";

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function stringAt(source: Record<string, unknown>, key: string, path: string, errors: ValidationIssue[]): string {
  const value = source[key];
  if (typeof value !== "string" || value.trim() === "") {
    errors.push({ path, code: "invalid_string", message: "Expected a non-empty string" });
    return "";
  }
  return value;
}

function optionalString(source: Record<string, unknown>, key: string, path: string, errors: ValidationIssue[]): string | undefined {
  if (source[key] === undefined) return undefined;
  return stringAt(source, key, path, errors);
}

function parseEvidence(value: unknown, path: string, errors: ValidationIssue[]): SourceEvidence {
  const source = record(value) ?? {};
  if (!record(value)) errors.push({ path, code: "invalid_object", message: "Expected an evidence object" });
  const page = source.page;
  if (!Number.isInteger(page) || (page as number) < 1) {
    errors.push({ path: `${path}.page`, code: "invalid_page", message: "Expected a one-based page number" });
  }
  return {
    documentId: stringAt(source, "documentId", `${path}.documentId`, errors),
    page: Number.isInteger(page) ? page as number : 0,
    section: optionalString(source, "section", `${path}.section`, errors),
    table: optionalString(source, "table", `${path}.table`, errors),
    quote: stringAt(source, "quote", `${path}.quote`, errors),
    chunkHash: stringAt(source, "chunkHash", `${path}.chunkHash`, errors),
  };
}

const FIELD_UNITS: Readonly<Record<string, string>> = {
  capacitance: "F", rated_voltage: "V", inductance: "H", test_frequency: "Hz",
  rated_current: "A", rms_current: "A", saturation_current: "A", ripple_current: "A",
  dcr: "Ω", esr: "Ω", operating_temperature: "°C", dimensions: "m",
};

function parseNormalized(value: unknown, field: string, path: string, errors: ValidationIssue[]): NormalizedQuantity | undefined {
  if (value === undefined) return undefined;
  const source = record(value);
  if (!source) {
    errors.push({ path, code: "invalid_object", message: "Expected a normalized quantity" });
    return undefined;
  }
  const quantity: NormalizedQuantity = { unit: stringAt(source, "unit", `${path}.unit`, errors) };
  const expectedUnit = FIELD_UNITS[field];
  if (expectedUnit && quantity.unit !== expectedUnit) {
    errors.push({ path: `${path}.unit`, code: "unit_dimension_mismatch", message: `Expected ${expectedUnit} for ${field}` });
  }
  for (const key of ["min", "typical", "max"] as const) {
    const number = source[key];
    if (number === undefined) continue;
    if (typeof number !== "number" || !Number.isFinite(number)) {
      errors.push({ path: `${path}.${key}`, code: "invalid_number", message: "Expected a finite number" });
    } else {
      quantity[key] = number;
    }
  }
  if (quantity.min !== undefined && quantity.max !== undefined && quantity.min > quantity.max) {
    errors.push({ path, code: "invalid_range", message: "Expected min to be no greater than max" });
  }
  return quantity;
}

function parseSpecification(value: unknown, index: number, errors: ValidationIssue[]): SpecificationValue {
  const path = `part.specifications[${index}]`;
  const source = record(value) ?? {};
  if (!record(value)) errors.push({ path, code: "invalid_object", message: "Expected a specification object" });
  const conditions = source.conditions;
  if (!Array.isArray(conditions) || conditions.some((item) => typeof item !== "string")) {
    errors.push({ path: `${path}.conditions`, code: "invalid_string_array", message: "Expected string conditions" });
  }
  const evidence = source.evidence;
  if (!Array.isArray(evidence) || evidence.length === 0) {
    errors.push({ path: `${path}.evidence`, code: "evidence_required", message: "At least one source is required" });
  }
  const status = source.status;
  const statuses = ["extracted", "missing", "ambiguous", "conflicting"];
  if (typeof status !== "string" || !statuses.includes(status)) {
    errors.push({ path: `${path}.status`, code: "invalid_status", message: "Expected a supported status" });
  }
  const field = stringAt(source, "field", `${path}.field`, errors);
  return {
    field,
    rawValue: stringAt(source, "rawValue", `${path}.rawValue`, errors),
    normalized: parseNormalized(source.normalized, field, `${path}.normalized`, errors),
    category: typeof source.category === "string" ? source.category as SpecificationValue["category"] : undefined,
    conditions: Array.isArray(conditions) ? conditions.filter((item): item is string => typeof item === "string") : [],
    evidence: Array.isArray(evidence) ? evidence.map((item, evidenceIndex) => parseEvidence(item, `${path}.evidence[${evidenceIndex}]`, errors)) : [],
    status: statuses.includes(String(status)) ? status as SpecificationValue["status"] : "ambiguous",
    manualReview: source.manualReview === true ? true : undefined,
  };
}

export function parseExtractionEnvelope(value: unknown): ValidationResult<ExtractionEnvelope> {
  const errors: ValidationIssue[] = [];
  const source = record(value);
  if (!source) return { ok: false, errors: [{ path: "", code: "invalid_object", message: "Expected an extraction object" }] };

  const componentKind = source.componentKind;
  if (componentKind !== "mlcc" && componentKind !== "shielded-power-inductor") {
    return { ok: false, errors: [{ path: "componentKind", code: "unsupported_component_kind", message: "Expected mlcc or shielded-power-inductor" }] };
  }
  const kind = componentKind as ComponentKind;
  const documentSource = record(source.document) ?? {};
  if (!record(source.document)) errors.push({ path: "document", code: "invalid_object", message: "Expected document metadata" });
  const partSource = record(source.part) ?? {};
  if (!record(source.part)) errors.push({ path: "part", code: "invalid_object", message: "Expected a part record" });
  const specificationsSource = partSource.specifications;
  if (!Array.isArray(specificationsSource)) {
    errors.push({ path: "part.specifications", code: "invalid_array", message: "Expected specifications" });
  }
  const specifications = Array.isArray(specificationsSource)
    ? specificationsSource.map((item, index) => parseSpecification(item, index, errors))
    : [];

  const envelope: ExtractionEnvelope = {
    version: 1,
    document: {
      documentId: stringAt(documentSource, "documentId", "document.documentId", errors),
      fileName: stringAt(documentSource, "fileName", "document.fileName", errors),
      sha256: stringAt(documentSource, "sha256", "document.sha256", errors),
      title: optionalString(documentSource, "title", "document.title", errors),
      revision: optionalString(documentSource, "revision", "document.revision", errors),
      publishedAt: optionalString(documentSource, "publishedAt", "document.publishedAt", errors),
    },
    componentKind: kind,
    selectedOrderingCode: optionalString(source, "selectedOrderingCode", "selectedOrderingCode", errors),
    part: {
      manufacturer: stringAt(partSource, "manufacturer", "part.manufacturer", errors),
      family: optionalString(partSource, "family", "part.family", errors),
      orderingCode: optionalString(partSource, "orderingCode", "part.orderingCode", errors),
      specifications,
    },
    missingFields: requiredFieldsFor(kind)
      .filter(({ requiredForReplacement }) => requiredForReplacement)
      .map(({ id }) => id)
      .filter((field) => !specifications.some((specification) => specification.field === field && specification.status === "extracted")),
  };

  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: envelope };
}

