import type { AnalysisResult } from "./analysis";
import type { ReplacementReport, SourceEvidence, WorkConditions } from "./types";

export interface WorkbenchReport {
  schemaVersion: 1;
  mode: "quick-read" | "replacement";
  original: AnalysisResult;
  candidate?: AnalysisResult;
  conditions?: WorkConditions;
  replacement?: ReplacementReport;
}

interface PortableSpecification {
  field: string;
  rawValue: string;
  normalized?: unknown;
  conditions: string[];
  status: string;
  manualReview: boolean;
  evidence: SourceEvidence[];
}

function portablePart(result: AnalysisResult) {
  const { envelope } = result;
  return {
    documentId: envelope.document.documentId,
    fileName: envelope.document.fileName,
    componentKind: envelope.componentKind,
    manufacturer: envelope.part.manufacturer,
    orderingCode: envelope.part.orderingCode ?? envelope.selectedOrderingCode ?? "",
    missingFields: [...envelope.missingFields],
    evidenceIssues: result.evidenceIssues.map(({ field, code, evidenceIndex }) => ({ field, code, ...(evidenceIndex === undefined ? {} : { evidenceIndex }) })),
    specifications: envelope.part.specifications.map((value): PortableSpecification => ({
      field: value.field,
      rawValue: value.rawValue,
      normalized: value.normalized,
      conditions: [...value.conditions],
      status: value.status,
      manualReview: value.manualReview === true,
      evidence: value.evidence.map((source) => ({ ...source })),
    })),
  };
}

function portableConditions(conditions: WorkConditions | undefined) {
  if (!conditions) return undefined;
  return {
    componentKind: conditions.componentKind,
    pcbChangeAllowed: conditions.pcbChangeAllowed,
    requirements: conditions.requirements.map(({ field, rawValue, normalized, priority }) => ({ field, rawValue, normalized, priority })),
  };
}

function portableReplacement(replacement: ReplacementReport | undefined) {
  if (!replacement) return undefined;
  return {
    verdict: replacement.verdict,
    reasonCodes: [...replacement.reasonCodes],
    comparisons: replacement.comparisons.map(({ field, status, reasonCode }) => ({ field, status, reasonCode })),
  };
}

function portableReport(report: WorkbenchReport) {
  return {
    schemaVersion: 1 as const,
    mode: report.mode,
    original: portablePart(report.original),
    ...(report.candidate ? { candidate: portablePart(report.candidate) } : {}),
    ...(report.conditions ? { conditions: portableConditions(report.conditions) } : {}),
    ...(report.replacement ? { replacement: portableReplacement(report.replacement) } : {}),
  };
}

export function serializeJson(report: WorkbenchReport): string {
  return JSON.stringify(portableReport(report), null, 2);
}

function partMarkdown(label: string, part: ReturnType<typeof portablePart>): string[] {
  const lines = [
    `## ${label}`,
    `- Ordering Code: ${part.orderingCode}`,
    `- Manufacturer: ${part.manufacturer}`,
    `- Component kind: ${part.componentKind}`,
    `- Missing fields: ${part.missingFields.length > 0 ? part.missingFields.join(", ") : "none"}`,
    "",
    "### Specifications",
  ];
  for (const specification of part.specifications) {
    lines.push(`- ${specification.field}: ${specification.rawValue} [${specification.status}]${specification.manualReview ? " — manual review" : ""}`);
  }
  lines.push("", "### Sources");
  for (const specification of part.specifications) {
    for (const evidence of specification.evidence) {
      lines.push(`- ${specification.field} — ${evidence.documentId}, page ${evidence.page}: “${evidence.quote}”`);
    }
  }
  return lines;
}

export function serializeMarkdown(report: WorkbenchReport): string {
  const portable = portableReport(report);
  const lines = ["# Datasheet Workbench Report", "", `Mode: ${portable.mode}`, ""];
  lines.push(...partMarkdown("Original", portable.original));
  if (portable.candidate) lines.push("", ...partMarkdown("Candidate", portable.candidate));
  if (portable.conditions) {
    lines.push("", "## Work conditions");
    for (const requirement of portable.conditions.requirements) {
      lines.push(`- ${requirement.field}: ${requirement.rawValue} (${requirement.priority})`);
    }
  }
  if (portable.replacement) {
    lines.push("", "## Replacement verdict", `- Verdict: ${portable.replacement.verdict}`);
    for (const reason of portable.replacement.reasonCodes) lines.push(`- Reason: ${reason}`);
  }
  return `${lines.join("\n")}\n`;
}

