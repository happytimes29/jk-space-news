import type { ExtractionEnvelope, SpecificationValue } from "@/lib/datasheet/types";

function specification(field: string, rawValue: string, page: number, normalized?: SpecificationValue["normalized"]): SpecificationValue {
  return {
    field,
    rawValue,
    normalized,
    conditions: [],
    evidence: [{ documentId: "fixture-inductor", page, quote: `${field}: ${rawValue}`, chunkHash: `${page}`.padStart(64, "f") }],
    status: "extracted",
  };
}

export const inductorRecord: ExtractionEnvelope = {
  version: 1,
  document: { documentId: "fixture-inductor", fileName: "fixture-inductor.pdf", sha256: "2".repeat(64) },
  componentKind: "shielded-power-inductor",
  selectedOrderingCode: "IND-4R7-SH",
  part: {
    manufacturer: "Fixture Magnetics",
    family: "IND",
    orderingCode: "IND-4R7-SH",
    specifications: [
      specification("inductance", "4.7 µH", 1, { typical: 4.7e-6, unit: "H" }),
      specification("tolerance", "±20%", 1),
      specification("test_frequency", "100 kHz", 1, { typical: 100_000, unit: "Hz" }),
      specification("rated_current", "2.0 A", 2, { max: 2, unit: "A" }),
      specification("saturation_current", "2.5 A", 2, { max: 2.5, unit: "A" }),
      specification("dcr", "80 mΩ", 2, { max: 0.08, unit: "Ω" }),
      specification("operating_temperature", "-40 °C to 125 °C", 2, { min: -40, max: 125, unit: "°C" }),
      specification("dimensions", "4.0 × 4.0 mm", 3),
      specification("shielding", "magnetically shielded", 3),
    ],
  },
  missingFields: [],
};

