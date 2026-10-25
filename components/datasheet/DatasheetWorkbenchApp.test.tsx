import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ParsedPdf, DocumentChunk } from "@/lib/datasheet/pdf/types";
import { mlccRecord } from "@/tests/fixtures/datasheets/mlcc-record";
import { DatasheetWorkbenchApp, type WorkbenchServices } from "./DatasheetWorkbenchApp";

const parsed: ParsedPdf = {
  fileName: "part.pdf",
  fileSize: 4096,
  sha256: "a".repeat(64),
  pageCount: 2,
  pages: [
    { page: 1, text: "Ordering Information GRM188R71H104KA93D" },
    { page: 2, text: "Specifications Capacitance 0.1 uF Rated Voltage 50 V" },
  ],
};
const chunks: DocumentChunk[] = [{
  id: `${parsed.sha256}:p1:c1`,
  documentId: parsed.sha256,
  page: 1,
  text: parsed.pages[0].text,
  chunkHash: "b".repeat(64),
}];

function services(fetcher: WorkbenchServices["fetcher"] = vi.fn(async () => new Response(JSON.stringify({ data: { ok: true } }), { status: 200 }))): WorkbenchServices {
  return {
    parsePdf: vi.fn(async () => parsed),
    buildChunks: vi.fn(async () => chunks),
    fetcher,
  };
}

async function uploadValidPdf() {
  const file = new File(["%PDF fixture"], "part.pdf", { type: "application/pdf" });
  fireEvent.change(screen.getByLabelText("Original datasheet PDF"), { target: { files: [file] } });
  await screen.findByText(/2 pages · 91 characters · about 2 API calls/);
}

describe("DatasheetWorkbenchApp", () => {
  it("shows_two_prominent_modes_and_the_provider_disclosure", () => {
    render(<DatasheetWorkbenchApp locale="en" services={services()} />);

    expect(screen.getByRole("tab", { name: "Quick read" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Replacement check" })).toBeInTheDocument();
    expect(screen.getByText(/API key passes through the JK Space relay.*never stored/i)).toBeInTheDocument();
    expect(screen.getByText(/Relevant PDF text is sent to the selected provider/i)).toBeInTheDocument();
  });

  it("rejects_non_pdf_and_oversized_files_before_parsing", async () => {
    const appServices = services();
    render(<DatasheetWorkbenchApp locale="en" services={appServices} />);
    const input = screen.getByLabelText("Original datasheet PDF");

    fireEvent.change(input, { target: { files: [new File(["x"], "part.txt", { type: "text/plain" })] } });
    expect(await screen.findByRole("alert")).toHaveTextContent("Only PDF files are supported.");
    const tooLarge = new File(["x"], "large.pdf", { type: "application/pdf" });
    Object.defineProperty(tooLarge, "size", { value: 25 * 1024 * 1024 + 1 });
    fireEvent.change(input, { target: { files: [tooLarge] } });
    expect(await screen.findByRole("alert")).toHaveTextContent("PDF must be 25 MiB or smaller.");
    expect(appServices.parsePdf).not.toHaveBeenCalled();
  });

  it("shows_local_parse_estimates_and_enables_analysis_only_after_provider_validation", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    render(<DatasheetWorkbenchApp locale="en" services={services()} />);
    await uploadValidPdf();

    fireEvent.change(screen.getByLabelText("Component type"), { target: { value: "mlcc" } });
    expect(screen.getByRole("button", { name: "Find exact part numbers" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "claude-fixture" } });
    fireEvent.change(screen.getByLabelText("API key"), { target: { value: "memory-only-key" } });
    expect(screen.getByLabelText("API key")).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Test connection" }));

    await waitFor(() => expect(screen.getByText("Connection verified")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Find exact part numbers" })).toBeEnabled();
    expect(setItem).not.toHaveBeenCalled();
    expect(window.location.search).toBe("");
    setItem.mockRestore();
  });

  it("shows_progress_allows_cancel_and_clears_sensitive_state", async () => {
    const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
    }));
    render(<DatasheetWorkbenchApp locale="en" services={services(fetcher)} />);
    await uploadValidPdf();
    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "model" } });
    fireEvent.change(screen.getByLabelText("API key"), { target: { value: "temporary-key" } });
    fireEvent.click(screen.getByRole("button", { name: "Test connection" }));

    expect(await screen.findByText("Testing provider connection…")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByText("Testing provider connection…")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Clear files and API key" }));

    expect(screen.getByLabelText("API key")).toHaveValue("");
    expect(screen.queryByText(/2 pages/)).not.toBeInTheDocument();
  });

  it("renders_the_quick_read_workspace_after_a_sourced_analysis", async () => {
    const envelope = structuredClone(mlccRecord);
    const fetcher = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body)) as { operation: string };
      if (request.operation === "connect") return new Response(JSON.stringify({ data: { ok: true } }), { status: 200 });
      if (request.operation === "discover") return new Response(JSON.stringify({ data: { options: [{ orderingCode: "GRM188R71H104KA93D", manufacturer: "Fixture Components", componentKind: "mlcc" }] } }), { status: 200 });
      return new Response(JSON.stringify({ data: envelope }), { status: 200 });
    });
    render(<DatasheetWorkbenchApp locale="en" services={services(fetcher)} />);
    await uploadValidPdf();
    fireEvent.change(screen.getByLabelText("Component type"), { target: { value: "mlcc" } });
    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "model" } });
    fireEvent.change(screen.getByLabelText("API key"), { target: { value: "key" } });
    fireEvent.click(screen.getByRole("button", { name: "Test connection" }));
    await screen.findByText("Connection verified");
    fireEvent.click(screen.getByRole("button", { name: "Find exact part numbers" }));
    const ordering = await screen.findByLabelText("Exact Ordering Code");
    fireEvent.change(ordering, { target: { value: "GRM188R71H104KA93D" } });
    fireEvent.click(screen.getByRole("button", { name: "Analyze datasheet" }));

    expect(await screen.findByRole("heading", { name: "GRM188R71H104KA93D" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Engineering Q&A" })).toBeInTheDocument();
  });
});
