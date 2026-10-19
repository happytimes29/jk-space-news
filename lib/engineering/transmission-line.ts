import { failure, success, type EngineeringResult, type EngineeringWarning } from "./types";
import { completeEllipticKModulus } from "./numerics";

const SPEED_OF_LIGHT_MPS = 299_792_458;
const FREE_SPACE_IMPEDANCE = 376.730313668;

export interface TransmissionLineResult {
  impedanceOhms: number;
  effectivePermittivity: number;
  phaseVelocityMps: number;
  wavelengthM: number;
  delaySecondsPerM: number;
  electricalLengthDegrees: number;
  warnings: EngineeringWarning[];
}

interface PropagationInput { effectivePermittivity: number; impedanceOhms: number; frequencyHz: number; lengthM: number; warnings: EngineeringWarning[] }

function propagation(input: PropagationInput): EngineeringResult<TransmissionLineResult> {
  const phaseVelocityMps = SPEED_OF_LIGHT_MPS / Math.sqrt(input.effectivePermittivity);
  const wavelengthM = phaseVelocityMps / input.frequencyHz;
  const value = {
    impedanceOhms: input.impedanceOhms,
    effectivePermittivity: input.effectivePermittivity,
    phaseVelocityMps,
    wavelengthM,
    delaySecondsPerM: 1 / phaseVelocityMps,
    electricalLengthDegrees: input.lengthM / wavelengthM * 360,
    warnings: input.warnings,
  };
  return Object.values(value).slice(0, 6).every(Number.isFinite) ? success(value, input.warnings) : failure("non_finite");
}

function hjEffectivePermittivity(normalizedWidth: number, relativePermittivity: number): number {
  const fourth = normalizedWidth ** 4;
  const a = 1 + Math.log((fourth + (normalizedWidth / 52) ** 2) / (fourth + 0.432)) / 49
    + Math.log(1 + (normalizedWidth / 18.1) ** 3) / 18.7;
  const b = 0.564 * ((relativePermittivity - 0.9) / (relativePermittivity + 3)) ** 0.053;
  return (relativePermittivity + 1) / 2 + (relativePermittivity - 1) / 2 * (1 + 10 / normalizedWidth) ** (-a * b);
}

function hjAirImpedance(normalizedWidth: number): number {
  const f = 6 + (2 * Math.PI - 6) * Math.exp(-((30.666 / normalizedWidth) ** 0.7528));
  return FREE_SPACE_IMPEDANCE / (2 * Math.PI) * Math.log(f / normalizedWidth + Math.sqrt(1 + (2 / normalizedWidth) ** 2));
}

export function microstripHammerstadJensen(input: {
  widthM: number;
  substrateHeightM: number;
  conductorThicknessM: number;
  relativePermittivity: number;
  frequencyHz: number;
  lengthM: number;
}): EngineeringResult<TransmissionLineResult> {
  const values = Object.values(input);
  if (!values.every(Number.isFinite)) return failure("non_finite");
  if (input.widthM <= 0 || input.substrateHeightM <= 0 || input.conductorThicknessM <= 0 || input.frequencyHz <= 0 || input.lengthM < 0) return failure("non_positive");
  if (input.relativePermittivity < 1) return failure("out_of_range", "relativePermittivity");
  if (input.conductorThicknessM >= input.widthM) return failure("unsupported_geometry", "conductorThicknessM");

  // Qucs Technical Guide Ch. 11 notation: u=w/h, t=t/h, Δu1 in air, Δur in dielectric.
  const u = input.widthM / input.substrateHeightM;
  const t = input.conductorThicknessM / input.substrateHeightM;
  const cothArgument = Math.sqrt(6.517 * u);
  const coth = 1 / Math.tanh(cothArgument);
  const deltaU1 = t / Math.PI * Math.log(1 + 4 * Math.E / (t * coth ** 2));
  const deltaUr = deltaU1 * (1 + 1 / Math.cosh(Math.sqrt(input.relativePermittivity - 1))) / 2;
  const u1 = u + deltaU1;
  const ur = u + deltaUr;
  const effectivePermittivity = hjEffectivePermittivity(ur, input.relativePermittivity);
  const impedanceOhms = hjAirImpedance(u1) / Math.sqrt(effectivePermittivity);
  const warnings: EngineeringWarning[] = u < 0.01 || u > 100 ? [{ code: "model_range", field: "widthM", details: { ratio: u } }] : [];
  return propagation({ effectivePermittivity, impedanceOhms, frequencyHz: input.frequencyHz, lengthM: input.lengthM, warnings });
}

export function symmetricStriplineFiniteThickness(input: {
  widthM: number;
  planeSeparationM: number;
  conductorThicknessM: number;
  relativePermittivity: number;
  frequencyHz: number;
  lengthM: number;
}): EngineeringResult<TransmissionLineResult> {
  if (!Object.values(input).every(Number.isFinite)) return failure("non_finite");
  if (input.widthM <= 0 || input.planeSeparationM <= 0 || input.conductorThicknessM <= 0 || input.frequencyHz <= 0 || input.lengthM < 0) return failure("non_positive");
  if (input.relativePermittivity < 1) return failure("out_of_range", "relativePermittivity");
  if (input.conductorThicknessM >= input.planeSeparationM) return failure("unsupported_geometry", "conductorThicknessM");
  // Steer, Microwave and RF Design II, eqs. 3.42–3.44: centered
  // homogeneous stripline with finite conductor thickness.
  const normalizedWidth = input.widthM / input.planeSeparationM;
  const normalizedThickness = input.conductorThicknessM / input.planeSeparationM;
  const effectiveNormalizedWidth = normalizedWidth < 0.35
    ? normalizedWidth - (0.35 - normalizedWidth) ** 2 / (1 + 12 * normalizedThickness)
    : normalizedWidth;
  const fringeCapacitance = 2 / Math.PI * Math.log(1 / (1 - normalizedThickness) + 1)
    - normalizedThickness / Math.PI * Math.log(1 / (1 - normalizedThickness) ** 2 - 1);
  const impedanceOhms = 30 * Math.PI / Math.sqrt(input.relativePermittivity)
    * (1 - normalizedThickness) / (effectiveNormalizedWidth + fringeCapacitance);
  const widthToClearance = input.widthM / (input.planeSeparationM - input.conductorThicknessM);
  const warnings: EngineeringWarning[] = widthToClearance <= 0.05 || normalizedThickness >= 0.025
    ? [{ code: "model_range", field: widthToClearance <= 0.05 ? "widthM" : "conductorThicknessM", details: { widthToClearance, normalizedThickness } }]
    : [];
  return propagation({ effectivePermittivity: input.relativePermittivity, impedanceOhms, frequencyHz: input.frequencyHz, lengthM: input.lengthM, warnings });
}

function ellipticRatio(modulus: number): EngineeringResult<number> {
  if (!Number.isFinite(modulus) || modulus < 0 || modulus >= 1) return failure("out_of_range", "ellipticModulus");
  const direct = completeEllipticKModulus(modulus);
  const complement = completeEllipticKModulus(Math.sqrt(1 - modulus * modulus));
  if (!direct.ok) return direct;
  if (!complement.ok) return complement;
  return success(direct.value / complement.value);
}

export function groundedCoplanarWaveguideQucs(input: {
  widthM: number;
  gapM: number;
  substrateHeightM: number;
  conductorThicknessM: number;
  relativePermittivity: number;
  frequencyHz: number;
  lengthM: number;
}): EngineeringResult<TransmissionLineResult> {
  if (!Object.values(input).every(Number.isFinite)) return failure("non_finite");
  if (input.widthM <= 0 || input.gapM <= 0 || input.substrateHeightM <= 0 || input.conductorThicknessM < 0 || input.frequencyHz <= 0 || input.lengthM < 0) return failure("non_positive");
  if (input.relativePermittivity < 1) return failure("out_of_range", "relativePermittivity");
  if (input.conductorThicknessM >= input.gapM) return failure("unsupported_geometry", "conductorThicknessM");

  const k1 = input.widthM / (input.widthM + 2 * input.gapM);
  // Qucs (12.12): backside-ground modulus.
  const k3 = Math.tanh(Math.PI * input.widthM / (4 * input.substrateHeightM))
    / Math.tanh(Math.PI * (input.widthM + 2 * input.gapM) / (4 * input.substrateHeightM));
  const q1 = ellipticRatio(k1);
  const q3 = ellipticRatio(k3);
  if (!q1.ok) return q1;
  if (!q3.ok) return q3;
  let impedanceRatio = q1.value;
  // Qucs (12.11) and (12.10).
  const fillingFactor = q3.value / (q1.value + q3.value);
  const zeroThicknessPermittivity = 1 + fillingFactor * (input.relativePermittivity - 1);
  let effectivePermittivity = zeroThicknessPermittivity;

  if (input.conductorThicknessM > 0) {
    // Qucs (12.14)–(12.17): first-order effective gap and width.
    const delta = 1.25 * input.conductorThicknessM / Math.PI
      * (1 + Math.log(4 * Math.PI * input.widthM / input.conductorThicknessM));
    const effectiveGap = input.gapM - delta;
    const effectiveWidth = input.widthM + delta;
    if (!Number.isFinite(delta) || effectiveGap <= 0 || effectiveWidth <= 0) return failure("unsupported_geometry", "conductorThicknessM");
    const effectiveModulus = effectiveWidth / (effectiveWidth + 2 * effectiveGap);
    const effectiveRatio = ellipticRatio(effectiveModulus);
    if (!effectiveRatio.ok) return effectiveRatio;
    impedanceRatio = effectiveRatio.value;
    // Qucs (12.18) corrects the zero-thickness permittivity from (12.10)–(12.12).
    effectivePermittivity = zeroThicknessPermittivity
      - 0.7 * (zeroThicknessPermittivity - 1) * input.conductorThicknessM / input.gapM
      / (q1.value + 0.7 * input.conductorThicknessM / input.gapM);
  }

  // Qucs (12.13); no dispersion terms from (12.19) onward are used.
  const impedanceOhms = 60 * Math.PI / Math.sqrt(effectivePermittivity) / (impedanceRatio + q3.value);
  return propagation({ effectivePermittivity, impedanceOhms, frequencyHz: input.frequencyHz, lengthM: input.lengthM, warnings: [] });
}
