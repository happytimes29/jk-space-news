import type { ExtractionEnvelope, SpecificationValue } from "./types";
import type { DocumentChunk } from "./pdf/types";

export type EvidenceIssueCode =
  | "conflicting_value"
  | "document_mismatch"
  | "duplicate_field"
  | "evidence_missing"
  | "page_mismatch"
  | "quote_mismatch"
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
    else if (!normalizeQuote(chunk.text).includes(normalizeQuote(evidence.quote))) code = "quote_mismatch";
    if (code) {
      addIssue(issues, { field: specification.field, code, evidenceIndex });
      specification.status = "ambiguous";
    }
  });
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

