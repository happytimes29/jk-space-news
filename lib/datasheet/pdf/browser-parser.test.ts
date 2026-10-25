import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createTextLayerPdf, textLayerPdfBase64 } from "@/tests/fixtures/datasheets/text-layer-pdf";
import { parsePdfFile } from "./browser-parser";

function pdfFile(bytes: Uint8Array, name = "fixture.pdf"): File {
  return new File([bytes as BlobPart], name, { type: "application/pdf" });
}

describe("parsePdfFile", () => {
  it("extracts_one_based_pages_and_a_stable_document_hash", async () => {
    const bytes = Uint8Array.from(Buffer.from(textLayerPdfBase64, "base64"));
    const parsed = await parsePdfFile(pdfFile(bytes));

    expect(parsed.fileName).toBe("fixture.pdf");
    expect(parsed.pageCount).toBe(2);
    expect(parsed.pages).toEqual([
      { page: 1, text: "Ordering Information GRM188R71H104KA93D" },
      { page: 2, text: "Specifications Capacitance 0.1 uF Rated Voltage 50 V" },
    ]);
    expect(parsed.sha256).toBe(createHash("sha256").update(bytes).digest("hex"));
  });

  it("honors_an_already_aborted_signal", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(parsePdfFile(pdfFile(createTextLayerPdf(["page"])), controller.signal)).rejects.toMatchObject({ code: "PDF_ABORTED" });
  });

  it("rejects_files_larger_than_25_mib_before_parsing", async () => {
    const oversized = new Uint8Array(25 * 1024 * 1024 + 1);

    await expect(parsePdfFile(pdfFile(oversized))).rejects.toMatchObject({ code: "PDF_SIZE_LIMIT" });
  });

  it("rejects_documents_over_100_pages", async () => {
    const pages = Array.from({ length: 101 }, (_, index) => `Page ${index + 1}`);

    await expect(parsePdfFile(pdfFile(createTextLayerPdf(pages)))).rejects.toMatchObject({ code: "PDF_PAGE_LIMIT" });
  });

  it("rejects_a_pdf_without_a_text_layer", async () => {
    await expect(parsePdfFile(pdfFile(createTextLayerPdf([""])))).rejects.toMatchObject({ code: "PDF_TEXT_LAYER_REQUIRED" });
  });
});
