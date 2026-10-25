import type { DocumentChunk, ParsedPdf, RetrievalQuery } from "./types";

const MAX_CHUNK_CHARACTERS = 1_200;
const HEADING_TERMS = /^(overview|summary|features|applications?|ordering (information|code)|part number|specifications?|electrical (characteristics|specifications)|characteristics|dimensions?|package|ratings?|absolute maximum|recommended operating)/i;

const COMPONENT_TERMS: Record<RetrievalQuery["componentKind"], readonly string[]> = {
  mlcc: ["capacitance", "rated voltage", "dielectric", "x5r", "x7r", "dc bias", "ripple", "dissipation factor", "termination"],
  "shielded-power-inductor": ["inductance", "rated current", "rms current", "saturation current", "dcr", "self resonant", "shielded", "temperature rise"],
};

const FIELD_ALIASES: Readonly<Record<string, readonly string[]>> = {
  rated_voltage: ["rated voltage", "voltage rating"],
  dc_bias: ["dc bias", "capacitance change"],
  saturation_current: ["saturation current", "isat", "inductance drop"],
  rated_current: ["rated current", "current rating"],
  rms_current: ["rms current", "temperature rise current", "irms"],
  dcr: ["dcr", "dc resistance"],
  operating_temperature: ["operating temperature", "temperature range"],
  ordering_code: ["ordering information", "ordering code", "part number"],
};

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function isHeading(line: string): boolean {
  const value = line.trim();
  if (value.length === 0 || value.length > 100) return false;
  return HEADING_TERMS.test(value) || (/^[A-Z][A-Z\d /&-]+$/.test(value) && value.split(/\s+/).length <= 8);
}

export async function hashChunk(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(normalizeText(text));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

interface PendingChunk {
  page: number;
  section?: string;
  text: string;
}

function splitPage(page: number, rawText: string): PendingChunk[] {
  const lines = rawText.split(/\r?\n/).map((line) => normalizeText(line)).filter(Boolean);
  if (lines.length === 0) return [];
  const result: PendingChunk[] = [];
  let section: string | undefined;
  let buffer: string[] = [];

  const flush = () => {
    const text = normalizeText(buffer.join(" "));
    if (text) {
      let remaining = text;
      while (remaining.length > MAX_CHUNK_CHARACTERS) {
        const candidate = remaining.slice(0, MAX_CHUNK_CHARACTERS + 1);
        const boundary = candidate.lastIndexOf(" ");
        const splitAt = boundary > 0 ? boundary : MAX_CHUNK_CHARACTERS;
        result.push({ page, section, text: remaining.slice(0, splitAt).trim() });
        remaining = remaining.slice(splitAt).trim();
      }
      if (remaining) result.push({ page, section, text: remaining });
    }
    buffer = [];
  };

  for (const line of lines) {
    if (isHeading(line)) {
      flush();
      section = line;
      continue;
    }
    const nextLength = normalizeText([...buffer, line].join(" ")).length;
    if (buffer.length > 0 && nextLength > MAX_CHUNK_CHARACTERS) flush();
    buffer.push(line);
  }
  flush();
  if (result.length === 0 && section) result.push({ page, section, text: section });
  return result;
}

export async function buildDocumentChunks(document: ParsedPdf): Promise<DocumentChunk[]> {
  const pending = document.pages.flatMap(({ page, text }) => splitPage(page, text));
  return Promise.all(pending.map(async (chunk, index) => ({
    id: `${document.sha256}:p${chunk.page}:c${index + 1}`,
    documentId: document.sha256,
    page: chunk.page,
    section: chunk.section,
    text: chunk.text,
    chunkHash: await hashChunk(chunk.text),
  })));
}

function queryTerms(query: RetrievalQuery): string[] {
  const terms = new Set<string>();
  if (query.purpose === "identity") {
    ["ordering information", "ordering code", "part number"].forEach((term) => terms.add(term));
  } else {
    COMPONENT_TERMS[query.componentKind].forEach((term) => terms.add(term));
  }
  query.fields?.forEach((field) => {
    terms.add(field.replaceAll("_", " ").toLowerCase());
    FIELD_ALIASES[field]?.forEach((term) => terms.add(term));
  });
  query.question?.toLowerCase().match(/[a-z\dµμΩ°-]{3,}/g)?.forEach((term) => terms.add(term));
  return [...terms];
}

export function searchDocumentChunks(chunks: readonly DocumentChunk[], query: RetrievalQuery): DocumentChunk[] {
  const terms = queryTerms(query);
  const scored = chunks.map((chunk, index) => {
    const text = `${chunk.section ?? ""} ${chunk.text}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (!text.includes(term)) continue;
      score += chunk.section?.toLowerCase().includes(term) ? 8 : 3;
    }
    if (query.purpose === "identity" && chunk.section?.toLowerCase().includes("ordering")) score += 20;
    return { chunk, score, index };
  });
  return scored
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.chunk.page - right.chunk.page || left.index - right.index)
    .slice(0, query.limit ?? 12)
    .map(({ chunk }) => chunk);
}

