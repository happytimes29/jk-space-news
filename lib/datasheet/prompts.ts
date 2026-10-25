import { requiredFieldsFor } from "./component-fields";
import type { ComponentKind, ValidationIssue } from "./types";
import type { DocumentChunk } from "./pdf/types";

function chunkPayload(chunks: readonly DocumentChunk[]): string {
  return JSON.stringify(chunks.map(({ id, documentId, page, section, text, chunkHash }) => ({
    id,
    documentId,
    page,
    section,
    text,
    chunkHash,
  })));
}

export function buildDiscoveryPrompt(kind: ComponentKind, chunks: readonly DocumentChunk[]): string {
  return [
    "Find exact manufacturer ordering codes only in the supplied datasheet chunks.",
    `Supported component kind: ${kind}.`,
    "Return JSON: {\"options\":[{\"orderingCode\":string,\"manufacturer\":string,\"componentKind\":string}]}",
    "Do not infer suffixes or values that are not explicitly printed.",
    `Chunks: ${chunkPayload(chunks)}`,
  ].join("\n");
}

export function buildExtractionPrompt(kind: ComponentKind, orderingCode: string, chunks: readonly DocumentChunk[]): string {
  const fields = requiredFieldsFor(kind).map(({ id }) => id).join(", ");
  return [
    "Extract a single exact part into the supplied JSON contract.",
    `Component kind: ${kind}.`,
    `Selected Ordering Code: ${orderingCode}. Do not use values belonging to another ordering code.`,
    `Fields: ${fields}.`,
    "For every value include rawValue, min/typical/max when stated, units, test conditions, and evidence with documentId, one-based page, exact quote and supplied chunkHash.",
    "Classify data as identity, absolute-maximum, operating, typical, or package. Do not treat typical values as guaranteed limits.",
    "Do not interpolate values from curves, plots, scanned tables or images. Set manualReview true and leave numeric values missing when only a graph supports them.",
    "Use status missing or ambiguous instead of guessing. Cite only the supplied chunks.",
    `Chunks: ${chunkPayload(chunks)}`,
  ].join("\n");
}

export function buildRepairPrompt(
  kind: ComponentKind,
  orderingCode: string,
  invalidOutput: unknown,
  issues: readonly ValidationIssue[],
  chunks: readonly DocumentChunk[],
): string {
  return [
    buildExtractionPrompt(kind, orderingCode, chunks),
    "Repair the previous JSON once. Return only a complete corrected JSON object.",
    `Validation issues: ${JSON.stringify(issues)}`,
    `Previous output: ${JSON.stringify(invalidOutput)}`,
  ].join("\n");
}

