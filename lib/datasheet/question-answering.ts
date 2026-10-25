import type { AnalysisResult, ModelTransport } from "./analysis";
import type { DocumentChunk } from "./pdf/types";
import type { SourceEvidence } from "./types";

export interface GroundedAnswer {
  status: "grounded" | "insufficient-evidence";
  answer: string;
  citations: SourceEvidence[];
}

const INSUFFICIENT: GroundedAnswer = {
  status: "insufficient-evidence",
  answer: "文件沒有足夠證據",
  citations: [],
};

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function verifiedChunks(result: AnalysisResult): DocumentChunk[] {
  const evidence = result.envelope.part.specifications
    .filter(({ status }) => status === "extracted")
    .flatMap((specification) => specification.evidence);
  return result.usedChunks.filter((chunk) => evidence.some((source) =>
    source.documentId === chunk.documentId
    && source.page === chunk.page
    && source.chunkHash === chunk.chunkHash
    && normalize(chunk.text).includes(normalize(source.quote))));
}

function parseGroundedResponse(value: unknown, chunks: readonly DocumentChunk[]): GroundedAnswer | null {
  if (typeof value !== "object" || value === null) return null;
  const source = value as Record<string, unknown>;
  if (typeof source.answer !== "string" || !Array.isArray(source.citations) || source.citations.length === 0) return null;
  const citations: SourceEvidence[] = [];
  for (let index = 0; index < source.citations.length; index += 1) {
    const candidate = source.citations[index];
    if (typeof candidate !== "object" || candidate === null) return null;
    const citation = candidate as Record<string, unknown>;
    if (typeof citation.chunkHash !== "string" || !Number.isInteger(citation.page) || typeof citation.quote !== "string") return null;
    const chunk = chunks.find(({ chunkHash, page }) => chunkHash === citation.chunkHash && page === citation.page);
    if (!chunk || !normalize(chunk.text).includes(normalize(citation.quote))) return null;
    if (!source.answer.includes(`[${index + 1}]`)) return null;
    citations.push({
      documentId: chunk.documentId,
      page: chunk.page,
      section: chunk.section,
      quote: citation.quote,
      chunkHash: chunk.chunkHash,
    });
  }
  return { status: "grounded", answer: source.answer, citations };
}

export async function askDatasheet(question: string, result: AnalysisResult, transport: ModelTransport): Promise<GroundedAnswer> {
  const chunks = verifiedChunks(result);
  if (!question.trim() || chunks.length === 0) return INSUFFICIENT;
  const prompt = [
    "Answer only from the supplied verified datasheet chunks.",
    "Every factual sentence must end with citation markers [1], [2], matching the citations array order.",
    "If the chunks do not answer the question, return an empty citations array instead of guessing.",
    "Return JSON: {\"answer\":string,\"citations\":[{\"chunkHash\":string,\"page\":number,\"quote\":string}]}",
    `Question: ${question}`,
    `Verified chunks: ${JSON.stringify(chunks.map(({ id, documentId, page, section, text, chunkHash }) => ({ id, documentId, page, section, text, chunkHash })))}`,
  ].join("\n");
  const response = await transport({ operation: "question", prompt, chunks });
  return parseGroundedResponse(response, chunks) ?? INSUFFICIENT;
}

