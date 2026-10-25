import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SourceEvidencePanel } from "./SourceEvidencePanel";

it("opens_a_source_with_page_section_table_quote_and_pdf_page_action", () => {
  const onOpenPage = vi.fn();
  render(<SourceEvidencePanel
    locale="zh-TW"
    evidence={[{
      documentId: "doc-1",
      page: 7,
      section: "Electrical Characteristics",
      table: "Table 3",
      quote: "Rated voltage: 50 V",
      chunkHash: "a".repeat(64),
    }]}
    onOpenPage={onOpenPage}
  />);

  fireEvent.click(screen.getByRole("button", { name: "顯示來源（1）" }));
  expect(screen.getByText("第 7 頁")).toBeInTheDocument();
  expect(screen.getByText("Electrical Characteristics")).toBeInTheDocument();
  expect(screen.getByText("Table 3")).toBeInTheDocument();
  expect(screen.getByText("Rated voltage: 50 V")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "查看 PDF 第 7 頁" }));
  expect(onOpenPage).toHaveBeenCalledWith(7);
});

