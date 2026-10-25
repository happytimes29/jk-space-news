import { describe, expect, it } from "vitest";
import { PUBLIC_DATASHEET_GOLDEN_CASES } from "@/tests/fixtures/datasheets/public-golden-corpus";
import type { ExtractionEnvelope } from "./types";
import { verifyEvidence } from "./evidence";

describe("public manufacturer datasheet golden corpus", () => {
  it.each(PUBLIC_DATASHEET_GOLDEN_CASES)("fails closed for unitless multi-column rows from $manufacturer", (fixture) => {
    const chunkHash = fixture.sourceSha256;
    const envelope: ExtractionEnvelope = {
      version: 1,
      document: { documentId: fixture.sourceSha256, fileName: "family-datasheet.pdf", sha256: fixture.sourceSha256 },
      componentKind: "shielded-power-inductor",
      selectedOrderingCode: fixture.orderingCode,
      part: {
        manufacturer: fixture.manufacturer,
        orderingCode: fixture.orderingCode,
        specifications: [{
          field: "dcr",
          rawValue: fixture.expected.dcrMax,
          normalized: { max: Number.parseFloat(fixture.expected.dcrMax) / 1_000, unit: "Ω" },
          category: "absolute-maximum",
          conditions: [],
          evidence: [{
            documentId: fixture.sourceSha256,
            page: fixture.page,
            table: fixture.tableHeader,
            quote: fixture.exactRowText,
            chunkHash,
          }],
          status: "extracted",
        }],
      },
      missingFields: [],
    };

    const result = verifyEvidence(envelope, [{
      id: `${fixture.sourceSha256}:p${fixture.page}:c1`,
      documentId: fixture.sourceSha256,
      page: fixture.page,
      section: "Electrical specifications",
      text: `${fixture.tableHeader}\n${fixture.exactRowText}`,
      chunkHash,
    }]);

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual({ field: "dcr", code: "value_mismatch" });
    expect(result.envelope.part.specifications[0].status).toBe("ambiguous");
  });
});
