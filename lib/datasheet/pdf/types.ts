import type { ComponentKind } from "../types";

export interface ParsedPdfPage {
  page: number;
  text: string;
}

export interface ParsedPdf {
  fileName: string;
  fileSize: number;
  sha256: string;
  pageCount: number;
  pages: ParsedPdfPage[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  page: number;
  section?: string;
  text: string;
  chunkHash: string;
}

export interface RetrievalQuery {
  componentKind: ComponentKind;
  fields?: readonly string[];
  purpose: "identity" | "summary" | "replacement" | "question";
  question?: string;
  limit?: number;
}

export type PdfParseErrorCode =
  | "PDF_ABORTED"
  | "PDF_CORRUPT"
  | "PDF_PAGE_LIMIT"
  | "PDF_PASSWORD_REQUIRED"
  | "PDF_SIZE_LIMIT"
  | "PDF_TEXT_LAYER_REQUIRED";

export class PdfParseError extends Error {
  constructor(public readonly code: PdfParseErrorCode, message: string) {
    super(message);
    this.name = "PdfParseError";
  }
}

