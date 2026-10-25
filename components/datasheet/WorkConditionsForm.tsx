"use client";

import type { ChangeEvent } from "react";
import type { ComponentKind, RequirementPriority, WorkConditions, WorkRequirement } from "@/lib/datasheet/types";
import { normalizeQuantity, type QuantityDimension } from "@/lib/datasheet/units";

interface ConditionField {
  field: string;
  label: string;
  placeholder: string;
  dimension?: QuantityDimension;
  lockedMandatory?: boolean;
  required?: boolean;
}

const FIELDS: Record<ComponentKind, ConditionField[]> = {
  mlcc: [
    { field: "capacitance", label: "Capacitance", placeholder: "0.1 µF", dimension: "capacitance", lockedMandatory: true, required: true },
    { field: "rated_voltage", label: "DC voltage", placeholder: "25 V", dimension: "voltage", lockedMandatory: true, required: true },
    { field: "test_frequency", label: "Ripple frequency", placeholder: "100 kHz", dimension: "frequency", required: true },
    { field: "ripple_current", label: "Ripple current", placeholder: "1 A", dimension: "current", required: true },
    { field: "operating_temperature", label: "Ambient temperature", placeholder: "-40 to 85 °C", dimension: "temperature", lockedMandatory: true, required: true },
    { field: "dielectric", label: "Dielectric", placeholder: "X7R", lockedMandatory: true, required: true },
    { field: "dimensions", label: "Allowed dimensions", placeholder: "1.6 × 0.8 mm", lockedMandatory: true, required: true },
    { field: "dc_bias", label: "DC bias retention", placeholder: "80 %" },
  ],
  "shielded-power-inductor": [
    { field: "inductance", label: "Inductance", placeholder: "4.7 µH", dimension: "inductance", lockedMandatory: true, required: true },
    { field: "rms_current", label: "RMS current", placeholder: "2 A", dimension: "current", lockedMandatory: true, required: true },
    { field: "saturation_current", label: "Peak current", placeholder: "2.5 A", dimension: "current", lockedMandatory: true, required: true },
    { field: "test_frequency", label: "Operating frequency", placeholder: "100 kHz", dimension: "frequency", required: true },
    { field: "operating_temperature", label: "Ambient temperature", placeholder: "-40 to 85 °C", dimension: "temperature", lockedMandatory: true, required: true },
    { field: "dcr", label: "Maximum DCR", placeholder: "80 mΩ", dimension: "resistance", lockedMandatory: true, required: true },
    { field: "dimensions", label: "Allowed dimensions", placeholder: "4.0 × 4.0 mm", lockedMandatory: true, required: true },
  ],
};

interface ConditionDraft {
  values: Record<string, string>;
  priorities: Record<string, RequirementPriority>;
}

export function emptyConditionDraft(): ConditionDraft {
  return { values: {}, priorities: {} };
}

function parseNormalized(rawValue: string, dimension?: QuantityDimension): WorkRequirement["normalized"] {
  if (!dimension) return undefined;
  const unit = rawValue.match(/(pF|nF|[µμu]F|F|nH|[µμu]H|mH|H|mΩ|Ω|Hz|kHz|MHz|GHz|mA|A|mV|V|°C|µm|mm|cm|m)\s*$/)?.[1];
  const numbers = rawValue.match(/[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi)?.map(Number) ?? [];
  if (!unit || numbers.length === 0) return undefined;
  const input = numbers.length >= 2
    ? { rawValue, dimension, unit, min: numbers[0], max: numbers[1] }
    : { rawValue, dimension, unit, typical: numbers[0] };
  const result = normalizeQuantity(input);
  if (!result.ok) return undefined;
  const { min, typical, max } = result.value;
  return { ...(min === undefined ? {} : { min }), ...(typical === undefined ? {} : { typical }), ...(max === undefined ? {} : { max }), unit: result.value.unit };
}

export function buildWorkConditions(kind: ComponentKind, draft: ConditionDraft): WorkConditions {
  const definitions = new Map(FIELDS[kind].map((field) => [field.field, field]));
  const requirements = Object.entries(draft.values)
    .filter(([, value]) => value.trim() !== "")
    .map(([field, rawValue]): WorkRequirement => {
      const definition = definitions.get(field);
      return {
        field,
        rawValue: rawValue.trim(),
        normalized: parseNormalized(rawValue, definition?.dimension),
        priority: definition?.lockedMandatory ? "mandatory" : (draft.priorities[field] ?? "mandatory"),
      };
    });
  return { componentKind: kind, pcbChangeAllowed: false, requirements };
}

export function conditionDraftIssues(kind: ComponentKind, draft: ConditionDraft): string[] {
  return FIELDS[kind].flatMap((definition) => {
    const rawValue = draft.values[definition.field]?.trim() ?? "";
    if (definition.required && !rawValue) return [`${definition.field}: required`];
    if (rawValue && definition.dimension && !parseNormalized(rawValue, definition.dimension)) return [`${definition.field}: invalid quantity`];
    return [];
  });
}

export function WorkConditionsForm({ kind, draft, onChange }: {
  kind: ComponentKind;
  draft: ConditionDraft;
  onChange: (draft: ConditionDraft) => void;
}) {
  const setValue = (field: string) => (event: ChangeEvent<HTMLInputElement>) => onChange({
    ...draft,
    values: { ...draft.values, [field]: event.target.value },
  });
  const setPriority = (field: string) => (event: ChangeEvent<HTMLSelectElement>) => onChange({
    ...draft,
    priorities: { ...draft.priorities, [field]: event.target.value as RequirementPriority },
  });

  return (
    <section className="datasheet-conditions" aria-labelledby="datasheet-conditions-title">
      <h2 id="datasheet-conditions-title">Work conditions</h2>
      <p>Enter the conditions that matter in the real circuit. Safety, ratings, package and temperature stay mandatory.</p>
      <div className="datasheet-form-grid">
        {FIELDS[kind].map((definition) => <div className="datasheet-condition" key={definition.field}>
          <label>{definition.label}
            <input value={draft.values[definition.field] ?? ""} placeholder={definition.placeholder} onChange={setValue(definition.field)} />
          </label>
          <label>{definition.label} priority
            <select
              aria-label={`${definition.label} priority`}
              value={definition.lockedMandatory ? "mandatory" : (draft.priorities[definition.field] ?? "mandatory")}
              disabled={definition.lockedMandatory}
              onChange={setPriority(definition.field)}
            >
              <option value="mandatory">Mandatory</option>
              <option value="preference">Preference</option>
            </select>
          </label>
        </div>)}
      </div>
    </section>
  );
}

export type { ConditionDraft };
