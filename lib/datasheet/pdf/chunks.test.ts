import { describe, expect, it } from "vitest";
import type { ParsedPdf } from "./types";
import { buildDocumentChunks, hashChunk, searchDocumentChunks } from "./chunks";

const document: ParsedPdf = {
  fileName: "family.pdf",
  fileSize: 1200,
  sha256: "a".repeat(64),
  pageCount: 3,
  pages: [
    { page: 1, text: "Overview\nGeneral purpose multilayer ceramic capacitors." },
    { page: 2, text: "Ordering Information\nGRM188R71H104KA93D 0.1 uF 50 V X7R 0603\nGRM188R71H104KA93A 0.1 uF 50 V X7R 0603" },
    { page: 3, text: "Electrical Characteristics\nCapacitance: 0.1 uF\nRated voltage: 50 V\nDC bias characteristics: see graph." },
  ],
};

describe("buildDocumentChunks", () => {
  it("never_creates_a_chunk_that_spans_pdf_pages", async () => {
    const chunks = await buildDocumentChunks(document);

    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks.every((chunk) => Number.isInteger(chunk.page) && !chunk.text.includes("\f"))).toBe(true);
    expect(new Set(chunks.map(({ page }) => page))).toEqual(new Set([1, 2, 3]));
  });

  it("keeps_section_hints_with_their_content", async () => {
    const chunks = await buildDocumentChunks(document);
    const ordering = chunks.find(({ text }) => text.includes("GRM188R71H104KA93D"));
    const electrical = chunks.find(({ text }) => text.includes("Rated voltage"));

    expect(ordering?.section).toBe("Ordering Information");
    expect(electrical?.section).toBe("Electrical Characteristics");
  });

  it("assigns_a_stable_sha256_to_normalized_chunk_text", async () => {
    expect(await hashChunk("  Rated   voltage: 50 V\n")).toBe(await hashChunk("Rated voltage: 50 V"));
    const [chunk] = await buildDocumentChunks({ ...document, pages: [{ page: 1, text: "Summary\nRated voltage: 50 V" }], pageCount: 1 });
    expect(chunk.chunkHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("hard_splits_a_flattened_oversized_page", async () => {
    const words = Array.from({ length: 2_500 }, (_, index) => `value${index}`).join(" ");
    const chunks = await buildDocumentChunks({ ...document, pageCount: 1, pages: [{ page: 1, text: words }] });

    expect(chunks.length).toBeGreaterThan(1);
    expect(Math.max(...chunks.map(({ text }) => text.length))).toBeLessThanOrEqual(1_200);
  });
});

describe("searchDocumentChunks", () => {
  it("ranks_ordering_information_first_for_identity_discovery", async () => {
    const chunks = await buildDocumentChunks(document);

    const result = searchDocumentChunks(chunks, { componentKind: "mlcc", purpose: "identity", limit: 2 });

    expect(result[0].page).toBe(2);
    expect(result[0].section).toBe("Ordering Information");
  });

  it("finds_mlcc_fields_without_an_embedding_service", async () => {
    const chunks = await buildDocumentChunks(document);

    const result = searchDocumentChunks(chunks, { componentKind: "mlcc", purpose: "replacement", fields: ["rated_voltage", "dc_bias"], limit: 1 });

    expect(result).toHaveLength(1);
    expect(result[0].page).toBe(3);
  });

  it("finds_power_inductor_specific_terms", async () => {
    const inductorDocument: ParsedPdf = {
      ...document,
      pages: [{ page: 1, text: "Electrical Specifications\nInductance 4.7 uH\nSaturation current 2.5 A\nDCR 80 mOhm\nMagnetically shielded" }],
      pageCount: 1,
    };
    const chunks = await buildDocumentChunks(inductorDocument);

    const result = searchDocumentChunks(chunks, { componentKind: "shielded-power-inductor", purpose: "replacement", fields: ["saturation_current", "dcr"], limit: 1 });

    expect(result[0].text).toContain("Saturation current");
    expect(result[0].text).toContain("DCR");
  });
});
