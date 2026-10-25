import type { ComponentKind } from "./types";

export interface FieldDefinition {
  id: string;
  requiredForSummary: boolean;
  requiredForReplacement: boolean;
  manualCurveReview?: boolean;
}

const MLCC_FIELDS: readonly FieldDefinition[] = [
  { id: "capacitance", requiredForSummary: true, requiredForReplacement: true },
  { id: "tolerance", requiredForSummary: true, requiredForReplacement: true },
  { id: "rated_voltage", requiredForSummary: true, requiredForReplacement: true },
  { id: "dielectric", requiredForSummary: true, requiredForReplacement: true },
  { id: "operating_temperature", requiredForSummary: true, requiredForReplacement: true },
  { id: "dimensions", requiredForSummary: true, requiredForReplacement: true },
  { id: "termination", requiredForSummary: false, requiredForReplacement: true },
  { id: "esr", requiredForSummary: false, requiredForReplacement: false },
  { id: "impedance", requiredForSummary: false, requiredForReplacement: false },
  { id: "ripple_current", requiredForSummary: false, requiredForReplacement: false, manualCurveReview: true },
  { id: "dissipation_factor", requiredForSummary: false, requiredForReplacement: false },
  { id: "leakage_current", requiredForSummary: false, requiredForReplacement: false },
  { id: "dc_bias", requiredForSummary: false, requiredForReplacement: false, manualCurveReview: true },
] as const;

const POWER_INDUCTOR_FIELDS: readonly FieldDefinition[] = [
  { id: "inductance", requiredForSummary: true, requiredForReplacement: true },
  { id: "tolerance", requiredForSummary: true, requiredForReplacement: true },
  { id: "test_frequency", requiredForSummary: true, requiredForReplacement: true },
  { id: "rated_current", requiredForSummary: true, requiredForReplacement: true },
  { id: "saturation_current", requiredForSummary: true, requiredForReplacement: true },
  { id: "dcr", requiredForSummary: true, requiredForReplacement: true },
  { id: "operating_temperature", requiredForSummary: true, requiredForReplacement: true },
  { id: "dimensions", requiredForSummary: true, requiredForReplacement: true },
  { id: "shielding", requiredForSummary: true, requiredForReplacement: true },
  { id: "rms_current", requiredForSummary: false, requiredForReplacement: false },
  { id: "srf", requiredForSummary: false, requiredForReplacement: false },
  { id: "q", requiredForSummary: false, requiredForReplacement: false },
  { id: "temperature_rise", requiredForSummary: false, requiredForReplacement: false, manualCurveReview: true },
  { id: "inductance_vs_current", requiredForSummary: false, requiredForReplacement: false, manualCurveReview: true },
] as const;

export function requiredFieldsFor(kind: ComponentKind): readonly FieldDefinition[] {
  return kind === "mlcc" ? MLCC_FIELDS : POWER_INDUCTOR_FIELDS;
}

