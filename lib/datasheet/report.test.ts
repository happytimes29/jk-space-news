import { describe, expect, it } from "vitest";
import { mlccRecord } from "@/tests/fixtures/datasheets/mlcc-record";
import type { AnalysisResult } from "./analysis";
import type { ReplacementReport, WorkConditions } from "./types";
import { serializeJson, serializeMarkdown, type WorkbenchReport } from "./report";

function analysis(documentId: string, orderingCode: string): AnalysisResult {
  const envelope = structuredClone(mlccRecord);
  envelope.document.documentId = documentId;
  envelope.document.fileName = `${orderingCode}.pdf`;
  envelope.selectedOrderingCode = orderingCode;
  envelope.part.orderingCode = orderingCode;
  envelope.missingFields = ["dc_bias"];
  envelope.part.specifications[0].manualReview = true;
  envelope.part.specifications[0].evidence = [{
    documentId,
    page: documentId === "original-doc" ? 2 : 7,
    quote: "Capacitance 0.1 µF",
    chunkHash: documentId === "original-doc" ? "a".repeat(64) : "b".repeat(64),
  }];
  return {
    envelope,
    evidenceIssues: [],
    usedChunks: [{
      id: `${documentId}:unrelated`,
      documentId,
      page: 99,
      text: "UNRELATED PRIVATE CHUNK",
      chunkHash: "f".repeat(64),
    }],
  };
}

const conditions: WorkConditions = {
  componentKind: "mlcc",
  pcbChangeAllowed: false,
  requirements: [{ field: "rated_voltage", rawValue: "25 V", normalized: { typical: 25, unit: "V" }, priority: "mandatory" }],
};

const replacement: ReplacementReport = {
  verdict: "conditional",
  reasonCodes: ["manual_curve_review_required: dc_bias"],
  comparisons: [],
};

function report(): WorkbenchReport & { apiKey: string; rawPrompt: string } {
  return {
    schemaVersion: 1,
    mode: "replacement",
    original: analysis("original-doc", "GRM188R71H104KA93D"),
    candidate: analysis("candidate-doc", "GRM188R71H104KA93A"),
    conditions,
    replacement,
    apiKey: "secret-key-must-not-export",
    rawPrompt: "secret prompt must not export",
  };
}

describe("serializeMarkdown", () => {
  it("exports_codes_conditions_verdict_missing_fields_and_both_source_pages", () => {
    const markdown = serializeMarkdown(report());

    expect(markdown).toContain("GRM188R71H104KA93D");
    expect(markdown).toContain("GRM188R71H104KA93A");
    expect(markdown).toContain("conditional");
    expect(markdown).toContain("manual_curve_review_required: dc_bias");
    expect(markdown).toContain("rated_voltage: 25 V (mandatory)");
    expect(markdown).toContain("Missing fields: dc_bias");
    expect(markdown).toContain("original-doc, page 2");
    expect(markdown).toContain("candidate-doc, page 7");
    expect(markdown).not.toContain("secret-key-must-not-export");
    expect(markdown).not.toContain("secret prompt must not export");
    expect(markdown).not.toContain("UNRELATED PRIVATE CHUNK");
  });
});

describe("serializeJson", () => {
  it("exports_only_the_normalized_report_model_in_stable_field_order", () => {
    const json = serializeJson(report());
    const parsed = JSON.parse(json) as Record<string, unknown>;

    expect(Object.keys(parsed)).toEqual(["schemaVersion", "mode", "original", "candidate", "conditions", "replacement"]);
    expect(json).toContain('"orderingCode": "GRM188R71H104KA93D"');
    expect(json).toContain('"page": 7');
    expect(json).not.toContain("apiKey");
    expect(json).not.toContain("rawPrompt");
    expect(json).not.toContain("UNRELATED PRIVATE CHUNK");
  });
});
