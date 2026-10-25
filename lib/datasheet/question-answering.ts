import type { AnalysisResult, ModelTransport } from "./analysis";
import type { DocumentChunk } from "./pdf/types";
import type { SourceEvidence } from "./types";
import type { Locale } from "@/lib/i18n/locales";

export interface GroundedAnswer {
  status: "grounded" | "insufficient-evidence";
  answer: string;
  citations: SourceEvidence[];
}

const INSUFFICIENT: Record<Locale, GroundedAnswer> = {
  "zh-TW": { status: "insufficient-evidence", answer: "文件沒有足夠證據", citations: [] },
  "zh-CN": { status: "insufficient-evidence", answer: "文件没有足够证据", citations: [] },
  en: { status: "insufficient-evidence", answer: "The document does not contain enough evidence.", citations: [] },
};

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function numericTokens(value: string): string[] {
  const pattern = /[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?\s*(?:pF|nF|[µμu]F|F|nH|[µμu]H|mH|H|mΩ|Ω|Hz|kHz|MHz|GHz|mA|A|mV|V|°C|%)(?![A-Za-zµμΩ])/gi;
  return [...value.matchAll(pattern)].map(([token]) => token.toLowerCase().replaceAll("μ", "µ").replace(/^([^a-z]*?)u(?=[fhm])/i, "$1µ").replace(/\s+/g, ""));
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
    if (typeof citation.chunkHash !== "string" || !Number.isInteger(citation.page) || typeof citation.quote !== "string" || !citation.quote.trim()) return null;
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
  const decimalSafeAnswer = source.answer.replace(/(?<=\d)\.(?=\d)/g, "∯");
  const factualSegments = decimalSafeAnswer.match(/[^.!?。！？]+[.!?。！？]?(?:\s*\[\d+\])*/g) ?? [];
  if (factualSegments.some((segment) => /[\p{L}\p{N}]/u.test(segment) && !/\[\d+\]/.test(segment))) return null;
  const markers = [...source.answer.matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1]));
  if (markers.some((marker) => marker < 1 || marker > citations.length)) return null;
  for (const segment of factualSegments) {
    const claim = segment.replaceAll("∯", ".");
    const claimNumbers = numericTokens(claim);
    const citedIndexes = [...segment.matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1]) - 1);
    const citedNumbers = citedIndexes.flatMap((index) => numericTokens(citations[index]?.quote ?? ""));
    if (claimNumbers.some((token) => !citedNumbers.includes(token))) return null;
  }
  return { status: "grounded", answer: source.answer, citations };
}

export async function askDatasheet(
  question: string,
  result: AnalysisResult,
  transport: ModelTransport,
  options: { locale?: Locale; signal?: AbortSignal } = {},
): Promise<GroundedAnswer> {
  const insufficient = INSUFFICIENT[options.locale ?? "zh-TW"];
  const chunks = verifiedChunks(result);
  if (!question.trim() || chunks.length === 0) return insufficient;
  const prompt = [
    "Answer only from the supplied verified datasheet chunks.",
    `Answer language: ${options.locale ?? "zh-TW"}.`,
    "Every factual sentence must end with citation markers [1], [2], matching the citations array order.",
    "If the chunks do not answer the question, return an empty citations array instead of guessing.",
    "Return JSON: {\"answer\":string,\"citations\":[{\"chunkHash\":string,\"page\":number,\"quote\":string}]}",
    `Question: ${question}`,
    `Verified chunks: ${JSON.stringify(chunks.map(({ id, documentId, page, section, text, chunkHash }) => ({ id, documentId, page, section, text, chunkHash })))}`,
  ].join("\n");
  const response = await transport({ operation: "question", prompt, chunks }, options.signal);
  return parseGroundedResponse(response, chunks) ?? insufficient;
}

