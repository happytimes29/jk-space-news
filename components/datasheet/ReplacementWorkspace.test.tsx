import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { inductorRecord } from "@/tests/fixtures/datasheets/inductor-record";
import { mlccRecord } from "@/tests/fixtures/datasheets/mlcc-record";
import type { AnalysisResult } from "@/lib/datasheet/analysis";
import type { ReplacementReport } from "@/lib/datasheet/types";
import { ReplacementWorkspace, VerdictBanner } from "./ReplacementWorkspace";

function result(envelope = mlccRecord): AnalysisResult {
  return { envelope: structuredClone(envelope), evidenceIssues: [], usedChunks: [] };
}

describe("ReplacementWorkspace", () => {
  it("shows_differences_without_a_verdict_until_work_conditions_exist", () => {
    render(<ReplacementWorkspace locale="en" original={result()} candidate={result()} />);

    expect(screen.getByRole("heading", { name: "Specification differences" })).toBeInTheDocument();
    expect(screen.getByText("Add at least one real work condition before asking for a replacement verdict.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Replacement verdict" })).not.toBeInTheDocument();

    const voltageRow = screen.getByTestId("comparison-rated_voltage");
    expect(within(voltageRow).getAllByRole("button", { name: /Show sources/ })).toHaveLength(2);
  });

  it("blocks_mixed_component_kinds_and_missing_exact_ordering_codes", () => {
    const { rerender } = render(<ReplacementWorkspace locale="en" original={result()} candidate={result(inductorRecord)} />);
    expect(screen.getByRole("alert")).toHaveTextContent("same supported component type");

    const missingCode = structuredClone(mlccRecord);
    missingCode.selectedOrderingCode = undefined;
    missingCode.part.orderingCode = undefined;
    rerender(<ReplacementWorkspace locale="en" original={result()} candidate={result(missingCode)} />);
    expect(screen.getByRole("alert")).toHaveTextContent("exact Ordering Code");
  });

  it("changes_the_deterministic_outcome_when_a_requirement_switches_priority", async () => {
    render(<ReplacementWorkspace locale="en" original={result()} candidate={result()} />);

    fireEvent.change(screen.getByLabelText("Ripple current"), { target: { value: "1 A" } });
    fireEvent.click(screen.getByRole("button", { name: "Evaluate replacement" }));
    expect(await screen.findByText("? Evidence incomplete")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Ripple current priority"), { target: { value: "preference" } });
    fireEvent.click(screen.getByRole("button", { name: "Evaluate replacement" }));
    expect(await screen.findByText("△ Conditional replacement")).toBeInTheDocument();
  });

  it("orders_blockers_before_soft_risks_and_links_curve_only_sources", async () => {
    const original = result();
    const candidate = result();
    const curve = {
      field: "dc_bias",
      rawValue: "See curve",
      conditions: ["25 VDC"],
      evidence: [{ documentId: "fixture-mlcc", page: 4, quote: "DC bias characteristics", chunkHash: "4".repeat(64) }],
      status: "extracted" as const,
      manualReview: true,
    };
    original.envelope.part.specifications.push(curve);
    candidate.envelope.part.specifications.push(structuredClone(curve));

    render(<ReplacementWorkspace locale="en" original={original} candidate={candidate} />);
    fireEvent.change(screen.getByLabelText("DC bias retention"), { target: { value: "80 %" } });
    fireEvent.click(screen.getByRole("button", { name: "Evaluate replacement" }));

    const resultPanel = await screen.findByTestId("replacement-result");
    expect(within(resultPanel).getByRole("heading", { name: "Blockers" })).toBeInTheDocument();
    expect(resultPanel.textContent?.indexOf("Blockers")).toBeLessThan(resultPanel.textContent?.indexOf("Conditional risks") ?? -1);
    expect(within(screen.getByTestId("comparison-dc_bias")).getAllByRole("button", { name: /View PDF page 4/ })).toHaveLength(2);
  });

  it("downloads_the_Task_6_markdown_and_json_without_credentials", async () => {
    const download = vi.fn();
    render(<ReplacementWorkspace locale="en" original={result()} candidate={result()} download={download} />);
    fireEvent.change(screen.getByLabelText("DC voltage"), { target: { value: "25 V" } });
    fireEvent.click(screen.getByRole("button", { name: "Evaluate replacement" }));
    fireEvent.click(await screen.findByRole("button", { name: "Download Markdown" }));
    fireEvent.click(screen.getByRole("button", { name: "Download JSON" }));

    expect(download).toHaveBeenCalledTimes(2);
    expect(download.mock.calls[0][1]).toContain("# Datasheet Workbench Report");
    expect(download.mock.calls[1][1]).toContain('"schemaVersion": 1');
    expect(JSON.stringify(download.mock.calls)).not.toContain("apiKey");
  });
});

describe("VerdictBanner", () => {
  it.each([
    ["direct-replacement", "✓ Direct replacement"],
    ["conditional", "△ Conditional replacement"],
    ["not-recommended", "✕ Not recommended"],
    ["insufficient-evidence", "? Evidence incomplete"],
  ] as const)("renders_%s_with_a_non_color_cue", (verdict, label) => {
    const report: ReplacementReport = { verdict, reasonCodes: [], comparisons: [] };
    render(<VerdictBanner locale="en" report={report} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
