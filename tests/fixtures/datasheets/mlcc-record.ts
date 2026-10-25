import type { ExtractionEnvelope, SpecificationValue } from "@/lib/datasheet/types";

function specification(field: string, rawValue: string, page: number, normalized?: SpecificationValue["normalized"]): SpecificationValue {
  return {
    field,
    rawValue,
    normalized,
    conditions: [],
    evidence: [{ documentId: "fixture-mlcc", page, quote: `${field}: ${rawValue}`, chunkHash: `${page}`.padStart(64, "0") }],
    status: "extracted",
  };
}

export const mlccRecord: ExtractionEnvelope = {
  version: 1,
  document: { documentId: "fixture-mlcc", fileName: "fixture-mlcc.pdf", sha256: "1".repeat(64) },
  componentKind: "mlcc",
  selectedOrderingCode: "GRM188R71H104KA93D",
  part: {
    manufacturer: "Fixture Components",
    family: "GRM",
    orderingCode: "GRM188R71H104KA93D",
    specifications: [
      specification("capacitance", "0.1 µF", 1, { typical: 1e-7, unit: "F" }),
      specification("tolerance", "±10%", 1),
      specification("rated_voltage", "50 V", 1, { max: 50, unit: "V" }),
      specification("dielectric", "X7R", 1),
      specification("operating_temperature", "-55 °C to 125 °C", 2, { min: -55, max: 125, unit: "°C" }),
      specification("dimensions", "1.6 × 0.8 mm", 2),
      specification("termination", "Ni/Sn", 2),
    ],
  },
  missingFields: [],
};

