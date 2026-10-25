import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { mlccRecord } from "@/tests/fixtures/datasheets/mlcc-record";
import type { AnalysisResult, ModelTransport } from "@/lib/datasheet/analysis";
import { QuickReadWorkspace } from "./QuickReadWorkspace";

function result(): AnalysisResult {
  const envelope = structuredClone(mlccRecord);
  envelope.part.specifications[0].category = "operating";
  envelope.part.specifications[1].category = "typical";
  envelope.part.specifications[2].category = "absolute-maximum";
  envelope.part.specifications[3].category = "typical";
  envelope.part.specifications[3].status = "conflicting";
  envelope.part.specifications[4].category = "operating";
  envelope.part.specifications[5].category = "package";
  envelope.part.specifications[6].category = "package";
  envelope.part.specifications.push({
    field: "dc_bias",
    rawValue: "See graph",
    category: "typical",
    conditions: ["25 VDC"],
    evidence: [{ documentId: "fixture-mlcc", page: 9, section: "DC Bias", quote: "DC bias characteristics", chunkHash: "9".repeat(64) }],
    status: "extracted",
    manualReview: true,
  });
  envelope.missingFields = ["ripple_current"];
  return { envelope, evidenceIssues: [{ field: "dielectric", code: "conflicting_value" }], usedChunks: [] };
}

it("renders_identity_grouped_specifications_limitations_and_checklist", () => {
  const transport = vi.fn() as unknown as ModelTransport;
  render(<QuickReadWorkspace locale="zh-TW" result={result()} transport={transport} />);

  expect(screen.getByRole("heading", { name: "GRM188R71H104KA93D" })).toBeInTheDocument();
  expect(screen.getByText(/Fixture Components/)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "絕對最大值" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "操作條件" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "典型特性" })).toBeInTheDocument();
  expect(screen.getByText("0.1 µF")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "限制與待確認項目" })).toBeInTheDocument();
  expect(screen.getByText(/ripple_current/)).toBeInTheDocument();
  expect(screen.getByText(/dielectric.*conflicting_value/)).toBeInTheDocument();
  expect(screen.getByText(/dc_bias.*人工查看曲線/)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "設計檢查清單" })).toBeInTheDocument();
  expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(2);
  expect(screen.getByRole("heading", { name: "工程問答" })).toBeInTheDocument();
});
