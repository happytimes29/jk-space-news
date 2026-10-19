import { describe, expect, it } from "vitest";
import { formatEngineering, parseEngineeringNumber } from "./quantity";

describe("engineering quantity parsing", () => {
  it.each([
    ["4k7", 4_700],
    ["2R2", 2.2],
    ["100n", 100e-9],
    ["3p3", 3.3e-12],
    ["1µ", 1e-6],
    ["1u", 1e-6],
    ["1m", 1e-3],
    ["1M", 1e6],
    ["  -4k7  ", -4_700],
  ])("parses %s without changing prefix case", (input, expected) => {
    expect(parseEngineeringNumber(input)).toEqual({ ok: true, value: expected, warnings: [] });
  });

  it.each(["", " ", "NaN", "Infinity", "1kk", "1k2x", "1e"])("rejects malformed input %j", (input) => {
    expect(parseEngineeringNumber(input)).toMatchObject({ ok: false, error: { code: "invalid_number" } });
  });

  it("distinguishes finite syntax from numeric overflow", () => {
    expect(parseEngineeringNumber("1e309")).toMatchObject({ ok: false, error: { code: "non_finite" } });
  });
});

describe("engineering quantity formatting", () => {
  it("normalizes signed zero and formats a finite engineering value", () => {
    expect(formatEngineering(-0)).toBe("0");
    expect(formatEngineering(4_700, { unit: "Ω", significantDigits: 4 })).toBe("4.7 kΩ");
  });

  it("never presents non-finite values as normal numeric output", () => {
    expect(formatEngineering(Number.NaN)).toBe("—");
    expect(formatEngineering(Number.POSITIVE_INFINITY)).toBe("—");
  });
});
