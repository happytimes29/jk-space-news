import { PdfParseError, type ParsedPdf, type ParsedPdfPage } from "./types";

const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MAX_PDF_PAGES = 100;

function assertNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new PdfParseError("PDF_ABORTED", "PDF parsing was cancelled");
}

async function readFile(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === "function") return file.arrayBuffer();
  return new Response(file).arrayBuffer();
}

async function sha256(bytes: ArrayBuffer): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizePageText(items: readonly unknown[]): string {
  return items
    .map((item) => {
      if (typeof item !== "object" || item === null || !("str" in item)) return "";
      return typeof item.str === "string" ? item.str : "";
    })
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function mapPdfError(error: unknown): PdfParseError {
  if (error instanceof PdfParseError) return error;
  const name = error instanceof Error ? error.name : "";
  if (name === "PasswordException") return new PdfParseError("PDF_PASSWORD_REQUIRED", "Password-protected PDFs are not supported");
  return new PdfParseError("PDF_CORRUPT", "The PDF could not be read");
}

export async function parsePdfFile(file: File, signal?: AbortSignal): Promise<ParsedPdf> {
  assertNotAborted(signal);
  if (file.size > MAX_PDF_BYTES) throw new PdfParseError("PDF_SIZE_LIMIT", "PDF exceeds the 25 MiB limit");

  try {
    const bytes = await readFile(file);
    assertNotAborted(signal);
    const documentHash = await sha256(bytes.slice(0));
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
    }
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(bytes) });
    const abort = () => loadingTask.destroy();
    signal?.addEventListener("abort", abort, { once: true });
    try {
      const document = await loadingTask.promise;
      assertNotAborted(signal);
      if (document.numPages > MAX_PDF_PAGES) {
        throw new PdfParseError("PDF_PAGE_LIMIT", "PDF exceeds the 100 page limit");
      }
      const pages: ParsedPdfPage[] = [];
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        assertNotAborted(signal);
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        pages.push({ page: pageNumber, text: normalizePageText(content.items) });
      }
      if (!pages.some(({ text }) => text.length > 0)) {
        throw new PdfParseError("PDF_TEXT_LAYER_REQUIRED", "PDF does not contain a readable text layer");
      }
      return {
        fileName: file.name,
        fileSize: file.size,
        sha256: documentHash,
        pageCount: document.numPages,
        pages,
      };
    } finally {
      signal?.removeEventListener("abort", abort);
      await loadingTask.destroy();
    }
  } catch (error) {
    throw mapPdfError(error);
  }
}

