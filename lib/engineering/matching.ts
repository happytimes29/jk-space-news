import { complexMagnitude, complexReciprocal, type Complex } from "./complex";
import { applyNetwork, type NetworkStep } from "./network";
import { reflectionCoefficient } from "./rf";
import { nearestStandardValues, type ESeries } from "./standard-values";
import { failure, success, type EngineeringResult } from "./types";

export interface MatchSolution {
  id: string;
  character: "low-pass" | "high-pass";
  steps: [NetworkStep, NetworkStep];
  matchedImpedance: Complex;
  residualGammaMagnitude: number;
}

interface SignedCandidate {
  topology: "series-shunt" | "shunt-series";
  seriesReactance: number;
  shuntSusceptance: number;
}

const MATCH_TOLERANCE = 1e-9;

function seriesStep(reactance: number, omega: number, id: string): NetworkStep | null {
  if (!Number.isFinite(reactance) || Math.abs(reactance) < 1e-15) return null;
  return reactance > 0
    ? { id, connection: "series", component: "L", value: reactance / omega }
    : { id, connection: "series", component: "C", value: -1 / (omega * reactance) };
}

function shuntStep(susceptance: number, omega: number, id: string): NetworkStep | null {
  if (!Number.isFinite(susceptance) || Math.abs(susceptance) < 1e-15) return null;
  return susceptance > 0
    ? { id, connection: "shunt", component: "C", value: susceptance / omega }
    : { id, connection: "shunt", component: "L", value: -1 / (omega * susceptance) };
}

function gammaMagnitude(impedance: Complex, targetOhms: number): number {
  const gamma = reflectionCoefficient(impedance, targetOhms);
  return gamma.ok ? complexMagnitude(gamma.value) : Number.POSITIVE_INFINITY;
}

function makeSolution(candidate: SignedCandidate, load: Complex, targetOhms: number, frequencyHz: number, index: number): MatchSolution | null {
  const omega = 2 * Math.PI * frequencyHz;
  const series = seriesStep(candidate.seriesReactance, omega, `${candidate.topology}-${index}-series`);
  const shunt = shuntStep(candidate.shuntSusceptance, omega, `${candidate.topology}-${index}-shunt`);
  if (!series || !shunt) return null;
  const steps: [NetworkStep, NetworkStep] = candidate.topology === "series-shunt" ? [series, shunt] : [shunt, series];
  const matched = applyNetwork(load, steps, frequencyHz);
  if (!matched.ok || matched.value.re <= 0) return null;
  const residualGammaMagnitude = gammaMagnitude(matched.value, targetOhms);
  if (!Number.isFinite(residualGammaMagnitude) || residualGammaMagnitude >= MATCH_TOLERANCE) return null;
  return {
    id: `${candidate.topology}-${index}`,
    character: series.component === "L" ? "low-pass" : "high-pass",
    steps,
    matchedImpedance: matched.value,
    residualGammaMagnitude,
  };
}

function relativeEqual(left: number, right: number): boolean {
  return Math.abs(left - right) <= 1e-9 * Math.max(1e-30, Math.abs(left), Math.abs(right));
}

function sameNetwork(left: MatchSolution, right: MatchSolution): boolean {
  return left.steps.every((step, index) => {
    const other = right.steps[index];
    return step.connection === other.connection && step.component === other.component && relativeEqual(step.value, other.value);
  });
}

export function solveLMatch(input: { load: Complex; targetOhms: number; frequencyHz: number }): EngineeringResult<MatchSolution[]> {
  const { load, targetOhms, frequencyHz } = input;
  if (![load.re, load.im, targetOhms, frequencyHz].every(Number.isFinite)) return failure("non_finite");
  if (targetOhms <= 0) return failure("non_positive", "targetOhms");
  if (frequencyHz <= 0) return failure("non_positive", "frequencyHz");
  if (load.re <= 0) return load.re < 0 ? failure("out_of_range", "load") : failure("no_solution", "load");
  if (gammaMagnitude(load, targetOhms) < 1e-12) return success([], [{ code: "already_matched" }]);

  const candidates: SignedCandidate[] = [];
  const seriesRadicand = load.re * (targetOhms - load.re);
  if (seriesRadicand >= 0) {
    const totalReactanceMagnitude = Math.sqrt(seriesRadicand);
    for (const totalReactance of [totalReactanceMagnitude, -totalReactanceMagnitude]) {
      candidates.push({
        topology: "series-shunt",
        seriesReactance: totalReactance - load.im,
        shuntSusceptance: totalReactance / (load.re * targetOhms),
      });
    }
  }

  const loadAdmittance = complexReciprocal(load);
  if (loadAdmittance.ok) {
    const { re: conductance, im: loadSusceptance } = loadAdmittance.value;
    const shuntRadicand = conductance * (1 / targetOhms - conductance);
    if (shuntRadicand >= 0) {
      const totalSusceptanceMagnitude = Math.sqrt(shuntRadicand);
      for (const totalSusceptance of [totalSusceptanceMagnitude, -totalSusceptanceMagnitude]) {
        const denominator = conductance ** 2 + totalSusceptance ** 2;
        candidates.push({
          topology: "shunt-series",
          seriesReactance: totalSusceptance / denominator,
          shuntSusceptance: totalSusceptance - loadSusceptance,
        });
      }
    }
  }

  const solutions: MatchSolution[] = [];
  candidates.forEach((candidate, index) => {
    const solution = makeSolution(candidate, load, targetOhms, frequencyHz, index);
    if (solution && !solutions.some((existing) => sameNetwork(existing, solution))) solutions.push(solution);
  });
  if (solutions.length === 0) return failure("no_solution");
  solutions.sort((left, right) => left.character.localeCompare(right.character) || left.id.localeCompare(right.id));
  return success(solutions);
}

export function roundMatchSolution(
  solution: MatchSolution,
  series: ESeries,
  load: Complex,
  targetOhms: number,
  frequencyHz: number,
): EngineeringResult<MatchSolution> {
  if (![load.re, load.im, targetOhms, frequencyHz].every(Number.isFinite) || targetOhms <= 0 || frequencyHz <= 0) return failure("out_of_range");
  const firstValues = nearestStandardValues(solution.steps[0].value, series, 7);
  const secondValues = nearestStandardValues(solution.steps[1].value, series, 7);
  let best: MatchSolution | null = null;
  let bestTotal = Number.POSITIVE_INFINITY;
  for (const first of firstValues) {
    for (const second of secondValues) {
      const steps: [NetworkStep, NetworkStep] = [
        { ...solution.steps[0], id: `${solution.steps[0].id}-E${series}`, value: first },
        { ...solution.steps[1], id: `${solution.steps[1].id}-E${series}`, value: second },
      ];
      const evaluated = applyNetwork(load, steps, frequencyHz);
      if (!evaluated.ok || evaluated.value.re <= 0) continue;
      const residualGammaMagnitude = gammaMagnitude(evaluated.value, targetOhms);
      const total = first + second;
      if (!best || residualGammaMagnitude < best.residualGammaMagnitude - 1e-15 || (Math.abs(residualGammaMagnitude - best.residualGammaMagnitude) <= 1e-15 && total < bestTotal)) {
        best = { id: `${solution.id}-E${series}`, character: solution.character, steps, matchedImpedance: evaluated.value, residualGammaMagnitude };
        bestTotal = total;
      }
    }
  }
  return best ? success(best) : failure("no_solution");
}
