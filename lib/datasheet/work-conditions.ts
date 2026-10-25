import type { ComponentKind, NormalizedQuantity, WorkConditions } from "./types";
import { normalizeQuantity, type QuantityDimension } from "./units";

export const CONDITION_DIMENSIONS: Readonly<Record<string, QuantityDimension>> = {
  capacitance: "capacitance",
  rated_voltage: "voltage",
  test_frequency: "frequency",
  ripple_current: "current",
  operating_temperature: "temperature",
  inductance: "inductance",
  rms_current: "current",
  saturation_current: "current",
  dcr: "resistance",
};

export const REQUIRED_CONDITION_FIELDS: Readonly<Record<ComponentKind, readonly string[]>> = {
  mlcc: ["capacitance", "rated_voltage", "test_frequency", "ripple_current", "operating_temperature", "dielectric", "dimensions"],
  "shielded-power-inductor": ["inductance", "rms_current", "saturation_current", "test_frequency", "operating_temperature", "dcr", "dimensions"],
};

export function parseConditionQuantity(rawValue: string, dimension: QuantityDimension): NormalizedQuantity | undefined {
  const number = "[-+]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[-+]?\\d+)?";
  const unit = "pF|nF|[µμu]F|F|nH|[µμu]H|mH|H|mΩ|Ω|Hz|kHz|MHz|GHz|mA|A|mV|V|°C|[µμu]m|mm|cm|m";
  const single = rawValue.match(new RegExp(`^\\s*(${number})\\s*(${unit})\\s*$`, "i"));
  const range = rawValue.match(new RegExp(`^\\s*(${number})\\s*(?:(${unit})\\s*)?(?:to|–|—|~)\\s*(${number})\\s*(${unit})\\s*$`, "i"));
  if (!single && !range) return undefined;
  const input = range
    ? { rawValue, dimension, unit: range[4], min: Number(range[1]), max: Number(range[3]) }
    : { rawValue, dimension, unit: single![2], typical: Number(single![1]) };
  const result = normalizeQuantity(input);
  if (!result.ok) return undefined;
  const { min, typical, max } = result.value;
  if (range?.[2]) {
    const first = normalizeQuantity({ rawValue, dimension, unit: range[2], typical: Number(range[1]) });
    if (!first.ok || first.value.unit !== result.value.unit || first.value.typical !== min) return undefined;
  }
  if (min !== undefined && max !== undefined && min > max) return undefined;
  if (dimension !== "temperature" && [min, typical, max].some((value) => value !== undefined && value <= 0)) return undefined;
  if (dimension === "temperature" && (min === undefined || max === undefined)) return undefined;
  return { ...(min === undefined ? {} : { min }), ...(typical === undefined ? {} : { typical }), ...(max === undefined ? {} : { max }), unit: result.value.unit };
}

function sameQuantity(left: NormalizedQuantity | undefined, right: NormalizedQuantity | undefined): boolean {
  return Boolean(left && right
    && left.unit === right.unit
    && left.min === right.min
    && left.typical === right.typical
    && left.max === right.max);
}

export function workConditionsAreValid(conditions: WorkConditions): boolean {
  const fields = conditions.requirements.map(({ field }) => field);
  if (new Set(fields).size !== fields.length) return false;
  if (REQUIRED_CONDITION_FIELDS[conditions.componentKind].some((field) => !fields.includes(field))) return false;
  return conditions.requirements.every((requirement) => {
    if (!requirement.rawValue.trim()) return false;
    const dimension = CONDITION_DIMENSIONS[requirement.field];
    if (!dimension) return true;
    return sameQuantity(parseConditionQuantity(requirement.rawValue, dimension), requirement.normalized);
  });
}
