import { describe, expect, it } from "vitest";
import { requiredFieldsFor } from "./component-fields";
import { parseExtractionEnvelope } from "./validation";

const sourcedMlcc = {
  version: 1,
  document: {
    documentId: "doc-mlcc",
    fileName: "GRM188R71H104KA93.pdf",
    sha256: "a".repeat(64),
  },
  componentKind: "mlcc",
  selectedOrderingCode: "GRM188R71H104KA93D",
  part: {
    manufacturer: "Murata",
    family: "GRM",
    orderingCode: "GRM188R71H104KA93D",
    specifications: [
      {
        field: "capacitance",
        rawValue: "0.1 µF",
        normalized: { typical: 1e-7, unit: "F" },
        conditions: ["1 kHz, 1 Vrms"],
        evidence: [{ documentId: "doc-mlcc", page: 2, section: "Specifications", quote: "Capacitance 0.1 µF", chunkHash: "b".repeat(64) }],
        status: "extracted",
      },
      ...["tolerance", "rated_voltage", "dielectric", "operating_temperature", "dimensions", "termination"].map((field, index) => ({
        field,
        rawValue: `fixture-${field}`,
        conditions: [],
        evidence: [{ documentId: "doc-mlcc", page: index + 3, quote: `fixture ${field}`, chunkHash: String(index + 1).repeat(64) }],
        status: "extracted",
      })),
    ],
  },
};

describe("parseExtractionEnvelope", () => {
  it("accepts_a_sourced_mlcc_record", () => {
    const result = parseExtractionEnvelope(sourcedMlcc);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.componentKind).toBe("mlcc");
    expect(result.value.part.orderingCode).toBe("GRM188R71H104KA93D");
    expect(result.value.part.specifications[0].evidence[0]).toEqual(expect.objectContaining({
      page: 2,
      quote: "Capacitance 0.1 µF",
      chunkHash: "b".repeat(64),
    }));
    expect(result.value.missingFields).toEqual([]);
  });

  it("rejects_an_unsupported_component_kind", () => {
    const result = parseExtractionEnvelope({ ...sourcedMlcc, componentKind: "mosfet" });

    expect(result).toEqual({
      ok: false,
      errors: [{ path: "componentKind", code: "unsupported_component_kind", message: "Expected mlcc or shielded-power-inductor" }],
    });
  });

  it("rejects_a_value_without_page_quote_and_chunk_hash", () => {
    const result = parseExtractionEnvelope({
      ...sourcedMlcc,
      part: {
        ...sourcedMlcc.part,
        specifications: [{
          field: "capacitance",
          rawValue: "0.1 µF",
          conditions: [],
          evidence: [{ documentId: "doc-mlcc" }],
          status: "extracted",
        }],
      },
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map(({ path }) => path)).toEqual(expect.arrayContaining([
      "part.specifications[0].evidence[0].page",
      "part.specifications[0].evidence[0].quote",
      "part.specifications[0].evidence[0].chunkHash",
    ]));
  });

  it("marks_missing_required_fields_without_inventing_values", () => {
    const result = parseExtractionEnvelope({
      ...sourcedMlcc,
      part: { ...sourcedMlcc.part, specifications: sourcedMlcc.part.specifications.slice(0, 1) },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.part.specifications).toHaveLength(1);
    expect(result.value.missingFields).toEqual([
      "tolerance",
      "rated_voltage",
      "dielectric",
      "operating_temperature",
      "dimensions",
      "termination",
    ]);
    expect(requiredFieldsFor("mlcc").filter((field) => field.requiredForReplacement).map(({ id }) => id)).toContain("rated_voltage");
  });
});
