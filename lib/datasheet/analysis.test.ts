import { describe, expect, it, vi } from "vitest";
import { mlccRecord } from "@/tests/fixtures/datasheets/mlcc-record";
import type { ExtractionEnvelope } from "./types";
import type { DocumentChunk, ParsedPdf } from "./pdf/types";
import {
  analyzeDatasheet,
  compareDatasheets,
  discoverPartOptions,
  type ModelRequest,
  type ModelTransport,
} from "./analysis";

const document: ParsedPdf = {
  fileName: "family.pdf",
  fileSize: 2048,
  sha256: "doc-mlcc",
  pageCount: 3,
  pages: [],
};

const irrelevant: DocumentChunk = {
  id: "doc-mlcc:p1:c1",
  documentId: "doc-mlcc",
  page: 1,
  section: "Legal",
  text: "Copyright and corporate address only.",
  chunkHash: "1".repeat(64),
};
const identity: DocumentChunk = {
  id: "doc-mlcc:p2:c1",
  documentId: "doc-mlcc",
  page: 2,
  section: "Ordering Information",
  text: "Ordering code GRM188R71H104KA93D or GRM188R71H104KA93A",
  chunkHash: "2".repeat(64),
};
const specificationChunk: DocumentChunk = {
  id: "doc-mlcc:p3:c1",
  documentId: "doc-mlcc",
  page: 3,
  section: "Specifications",
  text: "capacitance: 0.1 µF; tolerance: ±10%; rated_voltage: 50 V; dielectric: X7R; operating_temperature: -55 °C to 125 °C; dimensions: 1.6 × 0.8 mm; termination: Ni/Sn",
  chunkHash: "3".repeat(64),
};
const chunks = [irrelevant, identity, specificationChunk];

function sourcedEnvelope(): ExtractionEnvelope {
  const envelope = structuredClone(mlccRecord);
  envelope.document = { documentId: "doc-mlcc", fileName: "family.pdf", sha256: "a".repeat(64) };
  envelope.part.specifications.forEach((item) => {
    item.evidence = [{
      documentId: "doc-mlcc",
      page: 3,
      section: "Specifications",
      quote: `${item.field}: ${item.rawValue}`,
      chunkHash: specificationChunk.chunkHash,
    }];
  });
  return envelope;
}

function sequenceTransport(responses: unknown[]): ModelTransport & { requests: ModelRequest[] } {
  const requests: ModelRequest[] = [];
  const transport = (async (request: ModelRequest) => {
    requests.push(request);
    if (responses.length === 0) throw new Error("No fixture response");
    return responses.shift();
  }) as ModelTransport & { requests: ModelRequest[] };
  transport.requests = requests;
  return transport;
}

describe("discoverPartOptions", () => {
  it("returns_selectable_exact_ordering_codes_from_only_identity_chunks", async () => {
    const transport = sequenceTransport([{ options: [
      { orderingCode: "GRM188R71H104KA93D", manufacturer: "Murata", componentKind: "mlcc" },
      { orderingCode: "GRM188R71H104KA93A", manufacturer: "Murata", componentKind: "mlcc" },
    ] }]);

    const options = await discoverPartOptions({ document, chunks, componentKind: "mlcc", transport });

    expect(options.map(({ orderingCode }) => orderingCode)).toEqual(["GRM188R71H104KA93D", "GRM188R71H104KA93A"]);
    expect(transport.requests).toHaveLength(1);
    expect(transport.requests[0].operation).toBe("discover");
    expect(transport.requests[0].chunks.map(({ id }) => id)).toEqual([identity.id]);
  });
});

describe("analyzeDatasheet", () => {
  it("stops_an_unsupported_component_kind_before_calling_the_model", async () => {
    const transport = vi.fn() as unknown as ModelTransport;

    await expect(analyzeDatasheet({ document, chunks, componentKind: "mosfet" as "mlcc", selectedOrderingCode: "X" }, transport)).rejects.toMatchObject({ code: "UNSUPPORTED_COMPONENT" });
    expect(transport).not.toHaveBeenCalled();
  });

  it("requires_an_exact_ordering_code_before_extraction", async () => {
    const transport = vi.fn() as unknown as ModelTransport;

    await expect(analyzeDatasheet({ document, chunks, componentKind: "mlcc", selectedOrderingCode: "" }, transport)).rejects.toMatchObject({ code: "ORDERING_CODE_REQUIRED" });
    expect(transport).not.toHaveBeenCalled();
  });

  it("repairs_invalid_structured_output_exactly_once_and_reports_progress", async () => {
    const transport = sequenceTransport([{ unexpected: true }, sourcedEnvelope()]);
    const progress: string[] = [];

    const result = await analyzeDatasheet(
      { document, chunks, componentKind: "mlcc", selectedOrderingCode: "GRM188R71H104KA93D" },
      transport,
      (stage) => progress.push(stage),
    );

    expect(transport.requests.map(({ operation }) => operation)).toEqual(["extract", "repair"]);
    expect(progress).toEqual(["parsing", "retrieving", "extracting", "verifying", "comparing", "complete"]);
    expect(result.envelope.part.orderingCode).toBe("GRM188R71H104KA93D");
    expect(result.evidenceIssues).toEqual([]);
    expect(transport.requests[0].chunks.map(({ id }) => id)).not.toContain(irrelevant.id);
    expect(transport.requests[0].prompt).toContain("GRM188R71H104KA93D");
    expect(transport.requests[0].prompt).toContain("Do not interpolate values from curves");
    expect(transport.requests[0].prompt).toContain("absolute-maximum");
  });

  it("fails_safely_when_the_single_repair_is_still_invalid", async () => {
    const transport = sequenceTransport([{ bad: 1 }, { stillBad: 2 }]);

    await expect(analyzeDatasheet({ document, chunks, componentKind: "mlcc", selectedOrderingCode: "GRM188R71H104KA93D" }, transport)).rejects.toMatchObject({ code: "EXTRACTION_INVALID" });
    expect(transport.requests.map(({ operation }) => operation)).toEqual(["extract", "repair"]);
  });

  it("rejects_an_invented_citation_before_it_reaches_comparison", async () => {
    const envelope = sourcedEnvelope();
    envelope.part.specifications[0].evidence[0].quote = "capacitance: 9.9 µF";
    const transport = sequenceTransport([envelope]);

    const result = await analyzeDatasheet({ document, chunks, componentKind: "mlcc", selectedOrderingCode: "GRM188R71H104KA93D" }, transport);

    expect(result.evidenceIssues).toEqual(expect.arrayContaining([expect.objectContaining({ field: "capacitance", code: "quote_mismatch" })]));
    expect(result.envelope.part.specifications[0].status).toBe("ambiguous");
  });
});

describe("compareDatasheets", () => {
  it("delegates_the_final_verdict_to_the_deterministic_engine", async () => {
    const original = { envelope: sourcedEnvelope(), evidenceIssues: [], usedChunks: [specificationChunk] };
    const candidate = structuredClone(original);

    const report = await compareDatasheets({
      original,
      candidate,
      conditions: {
        componentKind: "mlcc",
        pcbChangeAllowed: false,
        requirements: [{ field: "rated_voltage", rawValue: "25 V", normalized: { typical: 25, unit: "V" }, priority: "mandatory" }],
      },
      footprintCompatible: true,
    });

    expect(report.verdict).toBe("direct-replacement");
  });
});
