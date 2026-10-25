export type QuantityDimension =
  | "capacitance"
  | "current"
  | "frequency"
  | "inductance"
  | "length"
  | "resistance"
  | "temperature"
  | "voltage";

export interface ParsedQuantity {
  rawValue: string;
  dimension: QuantityDimension;
  unit: string;
  min?: number;
  typical?: number;
  max?: number;
}

export interface NormalizedParsedQuantity extends Omit<ParsedQuantity, "unit"> {
  unit: string;
}

export type QuantityNormalizationError =
  | { code: "unit_dimension_mismatch"; dimension: QuantityDimension; unit: string }
  | { code: "non_finite_quantity"; field: "min" | "typical" | "max" }
  | { code: "quantity_value_required" };

export type QuantityNormalizationResult =
  | { ok: true; value: NormalizedParsedQuantity }
  | { ok: false; error: QuantityNormalizationError };

interface UnitDefinition {
  dimension: QuantityDimension;
  baseUnit: string;
  factor: number;
}

const UNITS: Readonly<Record<string, UnitDefinition>> = {
  pF: { dimension: "capacitance", baseUnit: "F", factor: 1e-12 },
  nF: { dimension: "capacitance", baseUnit: "F", factor: 1e-9 },
  µF: { dimension: "capacitance", baseUnit: "F", factor: 1e-6 },
  F: { dimension: "capacitance", baseUnit: "F", factor: 1 },
  nH: { dimension: "inductance", baseUnit: "H", factor: 1e-9 },
  µH: { dimension: "inductance", baseUnit: "H", factor: 1e-6 },
  mH: { dimension: "inductance", baseUnit: "H", factor: 1e-3 },
  H: { dimension: "inductance", baseUnit: "H", factor: 1 },
  "mΩ": { dimension: "resistance", baseUnit: "Ω", factor: 1e-3 },
  "Ω": { dimension: "resistance", baseUnit: "Ω", factor: 1 },
  Hz: { dimension: "frequency", baseUnit: "Hz", factor: 1 },
  kHz: { dimension: "frequency", baseUnit: "Hz", factor: 1e3 },
  MHz: { dimension: "frequency", baseUnit: "Hz", factor: 1e6 },
  GHz: { dimension: "frequency", baseUnit: "Hz", factor: 1e9 },
  mA: { dimension: "current", baseUnit: "A", factor: 1e-3 },
  A: { dimension: "current", baseUnit: "A", factor: 1 },
  mV: { dimension: "voltage", baseUnit: "V", factor: 1e-3 },
  V: { dimension: "voltage", baseUnit: "V", factor: 1 },
  "°C": { dimension: "temperature", baseUnit: "°C", factor: 1 },
  µm: { dimension: "length", baseUnit: "m", factor: 1e-6 },
  mm: { dimension: "length", baseUnit: "m", factor: 1e-3 },
  cm: { dimension: "length", baseUnit: "m", factor: 1e-2 },
  m: { dimension: "length", baseUnit: "m", factor: 1 },
};

function canonicalUnit(unit: string): string {
  return unit.replaceAll("μ", "µ").replace(/^u(?=[FHm])/, "µ");
}

function scale(value: number, factor: number): number {
  return Number.parseFloat((value * factor).toPrecision(15));
}

export function normalizeQuantity(input: ParsedQuantity): QuantityNormalizationResult {
  const unit = canonicalUnit(input.unit.trim());
  const definition = UNITS[unit];
  if (!definition || definition.dimension !== input.dimension) {
    return { ok: false, error: { code: "unit_dimension_mismatch", dimension: input.dimension, unit: input.unit } };
  }

  const values = ["min", "typical", "max"] as const;
  if (values.every((field) => input[field] === undefined)) {
    return { ok: false, error: { code: "quantity_value_required" } };
  }
  for (const field of values) {
    const value = input[field];
    if (value !== undefined && !Number.isFinite(value)) {
      return { ok: false, error: { code: "non_finite_quantity", field } };
    }
  }

  const normalized: NormalizedParsedQuantity = {
    rawValue: input.rawValue,
    dimension: input.dimension,
    unit: definition.baseUnit,
  };
  for (const field of values) {
    const value = input[field];
    if (value !== undefined) normalized[field] = scale(value, definition.factor);
  }
  return { ok: true, value: normalized };
}

