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
  | "ordering_code_scope_missing"
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
  voltage: "mV|V(?:dc)?",
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
    const result = normalizeQuantity({ rawValue: match[0], dimension, unit: match[2].replace(/dc$/i, ""), typical: Number(match[1]) });
    if (result.ok && result.value.typical !== undefined) values.push(result.value.typical);
  }
  for (const match of text.matchAll(new RegExp(`(${numberPattern})\\s*(?:to|–|—|~)\\s*(${numberPattern})\\s*(${unitPattern})(?![A-Za-zµμΩ])`, "gi"))) {
    for (const raw of [match[1], match[2]]) {
      const result = normalizeQuantity({ rawValue: match[0], dimension, unit: match[3].replace(/dc$/i, ""), typical: Number(raw) });
      if (result.ok && result.value.typical !== undefined) values.push(result.value.typical);
    }
  }
  return values;
}

function closeToAny(value: number, candidates: readonly number[]): boolean {
  return candidates.some((expected) => {
    const scale = Math.max(Math.abs(value), Math.abs(expected));
    const tolerance = scale === 0 ? Number.EPSILON * 16 : scale * 1e-9;
    return Math.abs(value - expected) <= tolerance;
  });
}

const FIELD_ALIASES: Readonly<Record<string, readonly string[]>> = {
  capacitance: ["capacitance"], rated_voltage: ["rated voltage", "voltage rating", "working voltage"],
  inductance: ["inductance"], test_frequency: ["test frequency", "frequency"],
  rated_current: ["rated current", "current rating"], rms_current: ["rms current"],
  saturation_current: ["saturation current"], ripple_current: ["ripple current"],
  dcr: ["dcr", "dc resistance"], esr: ["esr", "equivalent series resistance"],
  operating_temperature: ["operating temperature", "temperature range"],
};

function normalizedWords(value: string): string {
  return value.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function fieldBoundQuotes(specification: SpecificationValue): string[] {
  const aliases = FIELD_ALIASES[specification.field] ?? [specification.field.replaceAll("_", " ")];
  return specification.evidence.flatMap(({ quote }) => quote.split(/[;\n]+/))
    .filter((clause) => aliases.some((alias) => normalizedWords(clause).includes(alias)));
}

function containsExactToken(text: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^A-Za-z0-9_-])${escaped}(?:$|[^A-Za-z0-9_-])`, "i").test(text);
}

function valueIsBoundToRawAndEvidence(specification: SpecificationValue): boolean {
  if (!specification.normalized) return true;
  const dimension = FIELD_DIMENSIONS[specification.field];
  if (!dimension) return true;
  const unique = (values: readonly number[]) => values.filter((value, index) => values.findIndex((other) => closeToAny(value, [other])) === index);
  const actual = unique([specification.normalized.min, specification.normalized.typical, specification.normalized.max].filter((value): value is number => value !== undefined));
  const rawValues = unique(dimensionValues(specification.rawValue, dimension));
  const evidenceValues = unique(fieldBoundQuotes(specification).flatMap((quote) => dimensionValues(quote, dimension)));
  return actual.length > 0
    && rawValues.length === actual.length
    && evidenceValues.length === actual.length
    && actual.every((value) => closeToAny(value, rawValues))
    && actual.every((value) => closeToAny(value, evidenceValues));
}

function verifySpecification(
  specification: SpecificationValue,
  chunks: readonly DocumentChunk[],
  issues: EvidenceIssue[],
  orderingCode: string | undefined,
): void {
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
  if (specification.status === "extracted" && orderingCode) {
    const scoped = fieldBoundQuotes(specification).some((clause) => containsExactToken(clause, orderingCode));
    if (!scoped) {
      addIssue(issues, { field: specification.field, code: "ordering_code_scope_missing" });
      specification.status = "ambiguous";
    }
  }
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
    verifySpecification(specification, chunks, issues, verified.selectedOrderingCode);
  }

  return { ok: issues.length === 0, envelope: verified, issues };
}

