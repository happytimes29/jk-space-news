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
  text: "GRM188R71H104KA93D capacitance: 0.1 µF; GRM188R71H104KA93D tolerance: ±10%; GRM188R71H104KA93D rated_voltage: 50 V; GRM188R71H104KA93D dielectric: X7R; GRM188R71H104KA93D operating_temperature: -55 °C to 125 °C; GRM188R71H104KA93D dimensions: 1.6 × 0.8 mm; GRM188R71H104KA93D termination: Ni/Sn",
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
      quote: `GRM188R71H104KA93D ${item.field}: ${item.rawValue}`,
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

  it("rejects_a_model_discovered_code_that_is_not_printed_in_the_identity_chunks", async () => {
    const transport = sequenceTransport([{ options: [{ orderingCode: "INVENTED-123", manufacturer: "Murata", componentKind: "mlcc" }] }]);

    await expect(discoverPartOptions({ document, chunks, componentKind: "mlcc", transport })).rejects.toMatchObject({ code: "ORDERING_CODE_DISCOVERY_FAILED" });
  });

  it("does_not_accept_a_substring_of_a_longer_ordering_code", async () => {
    const transport = sequenceTransport([{ options: [{ orderingCode: "GRM188R71H104KA93", manufacturer: "Murata", componentKind: "mlcc" }] }]);

    await expect(discoverPartOptions({ document, chunks, componentKind: "mlcc", transport })).rejects.toMatchObject({ code: "ORDERING_CODE_DISCOVERY_FAILED" });
  });

  it("treats_hyphen_and_underscore_as_part_of_an_ordering_code_token", async () => {
    const hyphenChunk = { ...identity, text: "Ordering code XAL4020-472M or XAL4020_222M" };
    const transport = sequenceTransport([{ options: [{ orderingCode: "XAL4020", manufacturer: "Fixture", componentKind: "mlcc" }] }]);

    await expect(discoverPartOptions({ document, chunks: [hyphenChunk], componentKind: "mlcc", transport })).rejects.toMatchObject({ code: "ORDERING_CODE_DISCOVERY_FAILED" });
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

  it("rejects_a_selected_ordering_code_that_is_only_a_substring", async () => {
    const transport = vi.fn() as unknown as ModelTransport;

    await expect(analyzeDatasheet({ document, chunks, componentKind: "mlcc", selectedOrderingCode: "GRM188R71H104KA93" }, transport)).rejects.toMatchObject({ code: "ORDERING_CODE_REQUIRED" });
    expect(transport).not.toHaveBeenCalled();
  });

  it("repairs_invalid_structured_output_exactly_once_and_reports_progress", async () => {
    const transport = sequenceTransport([{ invalidJson: "{not-json" }, sourcedEnvelope()]);
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
    expect(transport.requests[0].prompt).toContain('"version": 1');
    expect(result.envelope.document).toMatchObject({ documentId: "doc-mlcc", fileName: "family.pdf", sha256: "doc-mlcc" });
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
    original.envelope.part.specifications.push({
      field: "test_frequency", rawValue: "100 kHz", normalized: { typical: 100_000, unit: "Hz" }, category: "operating", conditions: [],
      evidence: [{ documentId: "doc-mlcc", page: 3, quote: "test_frequency: 100 kHz", chunkHash: specificationChunk.chunkHash }], status: "extracted",
    });
    original.envelope.part.specifications.push({
      field: "ripple_current", rawValue: "1 A", normalized: { max: 1, unit: "A" }, category: "absolute-maximum", conditions: [],
      evidence: [{ documentId: "doc-mlcc", page: 3, quote: "ripple_current: 1 A", chunkHash: specificationChunk.chunkHash }], status: "extracted",
    });
    const candidate = structuredClone(original);

    const report = await compareDatasheets({
      original,
      candidate,
      conditions: {
        componentKind: "mlcc",
        pcbChangeAllowed: false,
        requirements: [
          { field: "capacitance", rawValue: "0.1 µF", normalized: { typical: 1e-7, unit: "F" }, priority: "mandatory" },
          { field: "rated_voltage", rawValue: "25 V", normalized: { typical: 25, unit: "V" }, priority: "mandatory" },
          { field: "test_frequency", rawValue: "100 kHz", normalized: { typical: 100_000, unit: "Hz" }, priority: "mandatory" },
          { field: "ripple_current", rawValue: "1 A", normalized: { typical: 1, unit: "A" }, priority: "mandatory" },
          { field: "operating_temperature", rawValue: "-40 to 85 °C", normalized: { min: -40, max: 85, unit: "°C" }, priority: "mandatory" },
          { field: "dielectric", rawValue: "X7R", priority: "mandatory" },
          { field: "dimensions", rawValue: "1.6 × 0.8 mm", priority: "mandatory" },
        ],
      },
      footprintCompatible: true,
    });

    expect(report.verdict).toBe("direct-replacement");
  });
});
