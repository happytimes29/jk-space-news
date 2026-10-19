import { describe, expect, it } from "vitest";
import { analyzeTransmissionLine, solveTransmissionLineWidth, type TransmissionLineInput, type TransmissionLineSolveInput } from "./transmission-line-solver";

const cases: TransmissionLineInput[] = [
  { kind: "microstrip", widthM: 3e-3, substrateHeightM: 1.6e-3, conductorThicknessM: 35e-6, relativePermittivity: 4.3, frequencyHz: 1e9, lengthM: 0.1 },
  { kind: "stripline", widthM: 0.75e-3, planeSeparationM: 1.6e-3, conductorThicknessM: 35e-6, relativePermittivity: 4.3, frequencyHz: 1e9, lengthM: 0.1 },
  { kind: "cpwg", widthM: 3e-3, gapM: 0.2e-3, substrateHeightM: 1.6e-3, conductorThicknessM: 35e-6, relativePermittivity: 4.3, frequencyHz: 1e9, lengthM: 0.1 },
];

function omitWidth<T extends { widthM: number }>(input: T): Omit<T, "widthM"> {
  const copy: Partial<T> = { ...input };
  delete copy.widthM;
  return copy as Omit<T, "widthM">;
}

describe("transmission-line width synthesis", () => {
  it.each(cases)("round-trips a $kind forward result", (input) => {
    const forward = analyzeTransmissionLine(input);
    expect(forward.ok).toBe(true);
    if (!forward.ok) return;
    const withoutWidth = omitWidth(input);
    const solved = solveTransmissionLineWidth({ ...withoutWidth, targetImpedanceOhms: forward.value.impedanceOhms } as TransmissionLineSolveInput);
    if (!solved.ok) throw new Error(JSON.stringify(solved));
    expect(Math.abs(solved.value.widthM - input.widthM) / input.widthM).toBeLessThan(1e-6);
    expect(solved.value.result.impedanceOhms).toBeCloseTo(forward.value.impedanceOhms, 6);
  });

  it.each(cases)("has lower impedance at greater $kind width", (input) => {
    const narrow = analyzeTransmissionLine({ ...input, widthM: input.widthM * 0.8 });
    const wide = analyzeTransmissionLine({ ...input, widthM: input.widthM * 1.2 });
    expect(narrow.ok && wide.ok && narrow.value.impedanceOhms).toBeGreaterThan(wide.ok ? wide.value.impedanceOhms : 0);
  });

  it("reports no bracket without returning a stale result", () => {
    const input = omitWidth(cases[0]);
    const result = solveTransmissionLineWidth({ ...input, targetImpedanceOhms: 0.001, minWidthM: 1e-3, maxWidthM: 2e-3 } as TransmissionLineSolveInput);
    expect(result).toEqual({ ok: false, error: { code: "no_bracket" } });
    expect(result).not.toHaveProperty("value");
  });

  it("validates fixed geometry before iteration", () => {
    const cpwg = cases[2] as Extract<TransmissionLineInput, { kind: "cpwg" }>;
    const input = omitWidth(cpwg);
    expect(solveTransmissionLineWidth({ ...input, gapM: 0, targetImpedanceOhms: 50 })).toMatchObject({ ok: false });
  });
});
