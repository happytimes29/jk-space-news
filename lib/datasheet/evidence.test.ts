import { describe, expect, it } from "vitest";
import { mlccRecord } from "@/tests/fixtures/datasheets/mlcc-record";
import type { DocumentChunk } from "./pdf/types";
import { verifyEvidence } from "./evidence";

function fixture() {
  const envelope = structuredClone(mlccRecord);
  envelope.part.specifications = [envelope.part.specifications[0]];
  envelope.part.specifications[0].evidence = [{
    documentId: "fixture-mlcc",
    page: 2,
    section: "Specifications",
    quote: "Capacitance: 0.1 µF",
    chunkHash: "c".repeat(64),
  }];
  const chunks: DocumentChunk[] = [{
    id: "fixture-mlcc:p2:c1",
    documentId: "fixture-mlcc",
    page: 2,
    section: "Specifications",
    text: "Electrical specifications Capacitance: 0.1 µF at 1 kHz.",
    chunkHash: "c".repeat(64),
  }];
  return { envelope, chunks };
}

describe("verifyEvidence", () => {
  it("accepts_a_quote_that_matches_the_supplied_page_and_chunk", () => {
    const { envelope, chunks } = fixture();

    const result = verifyEvidence(envelope, chunks);

    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.envelope.part.specifications[0].status).toBe("extracted");
  });

  it.each([
    ["unknown_chunk", { chunkHash: "d".repeat(64) }],
    ["page_mismatch", { page: 9 }],
    ["document_mismatch", { documentId: "another-document" }],
    ["quote_mismatch", { quote: "Capacitance: 9.9 µF" }],
  ])("rejects_%s_and_marks_the_field_ambiguous", (code, evidenceChange) => {
    const { envelope, chunks } = fixture();
    Object.assign(envelope.part.specifications[0].evidence[0], evidenceChange);

    const result = verifyEvidence(envelope, chunks);

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([expect.objectContaining({ field: "capacitance", code })]));
    expect(result.envelope.part.specifications[0].status).toBe("ambiguous");
  });

  it("rejects_duplicate_values_for_the_same_field", () => {
    const { envelope, chunks } = fixture();
    const duplicate = structuredClone(envelope.part.specifications[0]);
    duplicate.rawValue = "0.22 µF";
    envelope.part.specifications.push(duplicate);

    const result = verifyEvidence(envelope, chunks);

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual({ field: "capacitance", code: "duplicate_field" });
    expect(result.envelope.part.specifications.map(({ status }) => status)).toEqual(["ambiguous", "ambiguous"]);
  });

  it("does_not_allow_a_model_declared_conflict_into_the_comparison_engine", () => {
    const { envelope, chunks } = fixture();
    envelope.part.specifications[0].status = "conflicting";

    const result = verifyEvidence(envelope, chunks);

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual({ field: "capacitance", code: "conflicting_value" });
    expect(result.envelope.part.specifications[0].status).toBe("ambiguous");
  });

  it("rejects_a_normalized_number_not_supported_by_the_quoted_raw_value", () => {
    const { envelope, chunks } = fixture();
    envelope.part.specifications[0].rawValue = "0.1 µF";
    envelope.part.specifications[0].normalized = { typical: 5e-4, unit: "F" };

    const result = verifyEvidence(envelope, chunks);

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual({ field: "capacitance", code: "value_mismatch" });
    expect(result.envelope.part.specifications[0].normalized).toBeUndefined();
  });

  it("rejects_a_value_even_when_the_quote_exists_but_supports_a_different_number", () => {
    const { envelope, chunks } = fixture();
    chunks[0].text += " Alternate capacitance: 0.22 µF.";
    envelope.part.specifications[0].evidence[0].quote = "Alternate capacitance: 0.22 µF";

    const result = verifyEvidence(envelope, chunks);

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual({ field: "capacitance", code: "value_mismatch" });
    expect(result.envelope.part.specifications[0].status).toBe("ambiguous");
  });
});
