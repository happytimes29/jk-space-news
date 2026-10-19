import { failure, success, type EngineeringResult } from "./types";

const PREFIX_EXPONENTS: Record<string, number> = {
  p: -12,
  n: -9,
  u: -6,
  "µ": -6,
  "μ": -6,
  m: -3,
  R: 0,
  k: 3,
  M: 6,
  G: 9,
};

const DISPLAY_PREFIXES: Array<[number, string]> = [
  [9, "G"],
  [6, "M"],
  [3, "k"],
  [0, ""],
  [-3, "m"],
  [-6, "µ"],
  [-9, "n"],
  [-12, "p"],
];

export function parseEngineeringNumber(input: string): EngineeringResult<number> {
  const text = input.trim();
  if (!text) return failure("invalid_number");

  const embedded = /^([+-]?)(\d+)([pnuµμmRkMG])(\d+)$/.exec(text);
  if (embedded) {
    const [, sign, whole, prefix, fraction] = embedded;
    const value = Number(`${sign}${whole}.${fraction}e${PREFIX_EXPONENTS[prefix]}`);
    return Number.isFinite(value) ? success(value) : failure("non_finite");
  }

  const suffixed = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))([pnuµμmRkMG])?$/.exec(text);
  if (suffixed) {
    const value = Number(`${suffixed[1]}e${suffixed[2] ? PREFIX_EXPONENTS[suffixed[2]] : 0}`);
    return Number.isFinite(value) ? success(value) : failure("non_finite");
  }

  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)[eE][+-]?\d+$/.test(text)) {
    const value = Number(text);
    return Number.isFinite(value) ? success(value) : failure("non_finite");
  }

  return failure("invalid_number");
}

function trimDecimal(text: string): string {
  if (!text.includes(".")) return text;
  return text.replace(/\.?0+$/, "");
}

export function formatEngineering(
  value: number,
  options: { unit?: string; significantDigits?: number } = {},
): string {
  if (!Number.isFinite(value)) return "—";
  const normalized = Object.is(value, -0) ? 0 : value;
  const unit = options.unit ?? "";
  if (normalized === 0) return unit ? `0 ${unit}` : "0";

  const magnitude = Math.log10(Math.abs(normalized));
  const [exponent, prefix] = DISPLAY_PREFIXES.find(([candidate]) => magnitude >= candidate) ?? DISPLAY_PREFIXES.at(-1)!;
  const scaled = normalized / 10 ** exponent;
  const significantDigits = Math.min(15, Math.max(1, options.significantDigits ?? 6));
  const numeric = trimDecimal(scaled.toPrecision(significantDigits));
  return `${numeric}${prefix || unit ? " " : ""}${prefix}${unit}`;
}
