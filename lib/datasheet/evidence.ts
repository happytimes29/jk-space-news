import type { ExtractionEnvelope, SpecificationValue } from "./types";
import type { DocumentChunk } from "./pdf/types";
import { normalizeQuantity, type QuantityDimension } from "./units";

export type EvidenceIssueCode =
  | "conflicting_value"
  | "document_mismatch"
  | "duplicate_field"
  | "evidence_missing"
  | "page_mismatch"
  | "quote_mismatch"
  | "value_mismatch"
  | "unknown_chunk";

export interface EvidenceIssue {
  field: string;
  code: EvidenceIssueCode;
  evidenceIndex?: number;
}

export interface EvidenceVerification {
  ok: boolean;
  envelope: ExtractionEnvelope;
  issues: EvidenceIssue[];
}

function normalizeQuote(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function addIssue(issues: EvidenceIssue[], issue: EvidenceIssue): void {
  if (!issues.some((current) => current.field === issue.field && current.code === issue.code && current.evidenceIndex === issue.evidenceIndex)) {
    issues.push(issue);
  }
}

const FIELD_DIMENSIONS: Readonly<Record<string, QuantityDimension>> = {
  capacitance: "capacitance", rated_voltage: "voltage", inductance: "inductance",
  test_frequency: "frequency", rated_current: "current", rms_current: "current",
  saturation_current: "current", ripple_current: "current", dcr: "resistance",
  esr: "resistance", operating_temperature: "temperature",
};

const DIMENSION_UNITS: Readonly<Record<QuantityDimension, string>> = {
  capacitance: "pF|nF|[µμu]F|F",
  inductance: "nH|[µμu]H|mH|H",
  voltage: "mV|V",
  current: "mA|A",
  resistance: "mΩ|Ω",
  frequency: "Hz|kHz|MHz|GHz",
  temperature: "°C",
  length: "[µμu]m|mm|cm|m",
};

function dimensionValues(text: string, dimension: QuantityDimension): number[] {
  const unitPattern = DIMENSION_UNITS[dimension];
  const numberPattern = "[-+]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[-+]?\\d+)?";
  const values: number[] = [];
  for (const match of text.matchAll(new RegExp(`(${numberPattern})\\s*(${unitPattern})(?![A-Za-zµμΩ])`, "gi"))) {
    const result = normalizeQuantity({ rawValue: match[0], dimension, unit: match[2], typical: Number(match[1]) });
    if (result.ok && result.value.typical !== undefined) values.push(result.value.typical);
  }
  for (const match of text.matchAll(new RegExp(`(${numberPattern})\\s*(?:to|–|—|~)\\s*(${numberPattern})\\s*(${unitPattern})(?![A-Za-zµμΩ])`, "gi"))) {
    for (const raw of [match[1], match[2]]) {
      const result = normalizeQuantity({ rawValue: match[0], dimension, unit: match[3], typical: Number(raw) });
      if (result.ok && result.value.typical !== undefined) values.push(result.value.typical);
    }
  }
  return values;
}

function closeToAny(value: number, candidates: readonly number[]): boolean {
  return candidates.some((expected) => Math.abs(value - expected) <= Math.max(1e-12, Math.abs(expected) * 1e-9));
}

function valueIsBoundToRawAndEvidence(specification: SpecificationValue): boolean {
  if (!specification.normalized) return true;
  const dimension = FIELD_DIMENSIONS[specification.field];
  if (!dimension) return true;
  const actual = [specification.normalized.min, specification.normalized.typical, specification.normalized.max].filter((value): value is number => value !== undefined);
  const rawValues = dimensionValues(specification.rawValue, dimension);
  const evidenceValues = specification.evidence.flatMap(({ quote }) => dimensionValues(quote, dimension));
  return actual.length > 0
    && actual.every((value) => closeToAny(value, rawValues))
    && actual.every((value) => closeToAny(value, evidenceValues));
}

function verifySpecification(specification: SpecificationValue, chunks: readonly DocumentChunk[], issues: EvidenceIssue[]): void {
  if (specification.status === "conflicting") {
    addIssue(issues, { field: specification.field, code: "conflicting_value" });
    specification.status = "ambiguous";
  }
  if (specification.evidence.length === 0) {
    addIssue(issues, { field: specification.field, code: "evidence_missing" });
    specification.status = "ambiguous";
    return;
  }

  specification.evidence.forEach((evidence, evidenceIndex) => {
    const chunk = chunks.find(({ chunkHash }) => chunkHash === evidence.chunkHash);
    let code: EvidenceIssueCode | undefined;
    if (!chunk) code = "unknown_chunk";
    else if (chunk.documentId !== evidence.documentId) code = "document_mismatch";
    else if (chunk.page !== evidence.page) code = "page_mismatch";
    else if (!normalizeQuote(evidence.quote) || !normalizeQuote(chunk.text).includes(normalizeQuote(evidence.quote))) code = "quote_mismatch";
    if (code) {
      addIssue(issues, { field: specification.field, code, evidenceIndex });
      specification.status = "ambiguous";
    }
  });
  if (specification.status === "extracted" && !valueIsBoundToRawAndEvidence(specification)) {
    addIssue(issues, { field: specification.field, code: "value_mismatch" });
    specification.status = "ambiguous";
    specification.normalized = undefined;
  }
}

export function verifyEvidence(envelope: ExtractionEnvelope, chunks: readonly DocumentChunk[]): EvidenceVerification {
  const verified = structuredClone(envelope);
  const issues: EvidenceIssue[] = [];
  const counts = new Map<string, number>();
  verified.part.specifications.forEach(({ field }) => counts.set(field, (counts.get(field) ?? 0) + 1));

  for (const specification of verified.part.specifications) {
    if ((counts.get(specification.field) ?? 0) > 1) {
      addIssue(issues, { field: specification.field, code: "duplicate_field" });
      specification.status = "ambiguous";
    }
    verifySpecification(specification, chunks, issues);
  }

  return { ok: issues.length === 0, envelope: verified, issues };
}

