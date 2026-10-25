import { requiredFieldsFor } from "./component-fields";
import { verifyEvidence, type EvidenceIssue } from "./evidence";
import { searchDocumentChunks } from "./pdf/chunks";
import type { DocumentChunk, ParsedPdf } from "./pdf/types";
import { buildDiscoveryPrompt, buildExtractionPrompt, buildRepairPrompt } from "./prompts";
import { evaluateReplacement, type ReplacementInput } from "./replacement";
import type { ComponentKind, ExtractionEnvelope, ReplacementReport } from "./types";
import { parseExtractionEnvelope } from "./validation";

export type AnalysisStage = "parsing" | "retrieving" | "extracting" | "verifying" | "comparing" | "complete";
export type ProgressListener = (stage: AnalysisStage) => void;

export interface ModelRequest {
  operation: "discover" | "extract" | "repair" | "explain" | "question";
  prompt: string;
  chunks: readonly DocumentChunk[];
}

export type ModelTransport = (request: ModelRequest, signal?: AbortSignal) => Promise<unknown>;

export interface PartOption {
  orderingCode: string;
  manufacturer: string;
  componentKind: ComponentKind;
}

export interface AnalysisInput {
  document: ParsedPdf;
  chunks: readonly DocumentChunk[];
  componentKind: ComponentKind;
  transport: ModelTransport;
}

export interface AnalyzePartInput extends Omit<AnalysisInput, "transport"> {
  selectedOrderingCode: string;
}

export interface AnalysisResult {
  envelope: ExtractionEnvelope;
  evidenceIssues: EvidenceIssue[];
  usedChunks: readonly DocumentChunk[];
}

export interface CompareInput extends Omit<ReplacementInput, "original" | "candidate"> {
  original: AnalysisResult;
  candidate: AnalysisResult;
}

export type AnalysisErrorCode =
  | "EXTRACTION_INVALID"
  | "ORDERING_CODE_DISCOVERY_FAILED"
  | "ORDERING_CODE_REQUIRED"
  | "UNSUPPORTED_COMPONENT";

export class AnalysisError extends Error {
  constructor(public readonly code: AnalysisErrorCode) {
    super(code);
    this.name = "AnalysisError";
  }
}

function assertSupported(kind: string): asserts kind is ComponentKind {
  if (kind !== "mlcc" && kind !== "shielded-power-inductor") throw new AnalysisError("UNSUPPORTED_COMPONENT");
}

function containsExactOrderingCode(text: string, orderingCode: string): boolean {
  const escaped = orderingCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^A-Za-z0-9_-])${escaped}(?:$|[^A-Za-z0-9_-])`, "i").test(text);
}

function parseOptions(value: unknown, expectedKind: ComponentKind, chunks: readonly DocumentChunk[]): PartOption[] {
  if (typeof value !== "object" || value === null || !("options" in value) || !Array.isArray(value.options)) {
    throw new AnalysisError("ORDERING_CODE_DISCOVERY_FAILED");
  }
  const options: PartOption[] = [];
  for (const option of value.options) {
    if (typeof option !== "object" || option === null) continue;
    const source = option as Record<string, unknown>;
    if (typeof source.orderingCode !== "string" || source.orderingCode.trim() === "") continue;
    if (typeof source.manufacturer !== "string" || source.manufacturer.trim() === "") continue;
    if (source.componentKind !== expectedKind) continue;
    if (!chunks.some(({ text }) => containsExactOrderingCode(text, source.orderingCode as string))) continue;
    if (!options.some(({ orderingCode }) => orderingCode === source.orderingCode)) {
      options.push({ orderingCode: source.orderingCode, manufacturer: source.manufacturer, componentKind: expectedKind });
    }
  }
  if (options.length === 0) throw new AnalysisError("ORDERING_CODE_DISCOVERY_FAILED");
  return options;
}

export async function discoverPartOptions(input: AnalysisInput): Promise<PartOption[]> {
  assertSupported(input.componentKind);
  const selected = searchDocumentChunks(input.chunks, {
    componentKind: input.componentKind,
    purpose: "identity",
    fields: ["ordering_code"],
    limit: 8,
  });
  const response = await input.transport({
    operation: "discover",
    prompt: buildDiscoveryPrompt(input.componentKind, selected),
    chunks: selected,
  });
  return parseOptions(response, input.componentKind, selected);
}

function refreshMissingFields(envelope: ExtractionEnvelope): ExtractionEnvelope {
  const missingFields = requiredFieldsFor(envelope.componentKind)
    .filter(({ requiredForReplacement }) => requiredForReplacement)
    .map(({ id }) => id)
    .filter((field) => !envelope.part.specifications.some((value) => value.field === field && value.status === "extracted"));
  return { ...envelope, missingFields };
}

export async function analyzeDatasheet(
  input: AnalyzePartInput,
  transport: ModelTransport,
  onProgress: ProgressListener = () => undefined,
): Promise<AnalysisResult> {
  assertSupported(input.componentKind);
  if (!input.selectedOrderingCode.trim()) throw new AnalysisError("ORDERING_CODE_REQUIRED");
  onProgress("parsing");
  onProgress("retrieving");
  const fields = requiredFieldsFor(input.componentKind).map(({ id }) => id);
  const replacementChunks = searchDocumentChunks(input.chunks, {
    componentKind: input.componentKind,
    purpose: "replacement",
    fields,
    limit: 20,
  });
  const identityChunks = searchDocumentChunks(input.chunks, { componentKind: input.componentKind, purpose: "identity", fields: ["ordering_code"], limit: 4 });
  if (!identityChunks.some(({ text }) => containsExactOrderingCode(text, input.selectedOrderingCode))) throw new AnalysisError("ORDERING_CODE_REQUIRED");
  const selected = [...identityChunks, ...replacementChunks].filter((chunk, index, all) => all.findIndex(({ id }) => id === chunk.id) === index);
  onProgress("extracting");
  let raw = await transport({
    operation: "extract",
    prompt: buildExtractionPrompt(input.componentKind, input.selectedOrderingCode, selected),
    chunks: selected,
  });
  let parsed = parseExtractionEnvelope(raw);
  if (!parsed.ok) {
    raw = await transport({
      operation: "repair",
      prompt: buildRepairPrompt(input.componentKind, input.selectedOrderingCode, raw, parsed.errors, selected),
      chunks: selected,
    });
    parsed = parseExtractionEnvelope(raw);
  }
  if (!parsed.ok
    || parsed.value.componentKind !== input.componentKind
    || parsed.value.selectedOrderingCode !== input.selectedOrderingCode
    || parsed.value.part.orderingCode !== input.selectedOrderingCode) {
    throw new AnalysisError("EXTRACTION_INVALID");
  }
  onProgress("verifying");
  const trustedEnvelope: ExtractionEnvelope = {
    ...parsed.value,
    document: {
      documentId: input.document.sha256,
      fileName: input.document.fileName,
      sha256: input.document.sha256,
      title: parsed.value.document.title,
      revision: parsed.value.document.revision,
      publishedAt: parsed.value.document.publishedAt,
    },
  };
  const verification = verifyEvidence(trustedEnvelope, selected);
  onProgress("comparing");
  onProgress("complete");
  return {
    envelope: refreshMissingFields(verification.envelope),
    evidenceIssues: verification.issues,
    usedChunks: selected,
  };
}

export async function compareDatasheets(input: CompareInput): Promise<ReplacementReport> {
  return evaluateReplacement({
    original: input.original.envelope,
    candidate: input.candidate.envelope,
    conditions: input.conditions,
    footprintCompatible: input.footprintCompatible,
    externalChangesRequired: input.externalChangesRequired,
    processChangesRequired: input.processChangesRequired,
  });
}

