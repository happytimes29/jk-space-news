import type { Complex } from "@/lib/engineering/complex";

export interface PropagationResult {
  frequencyHz: number;
  velocityMps: number;
  wavelengthM: number;
  halfM: number;
  quarterM: number;
  lengthM: number;
  delaySeconds: number;
  angleDegrees: number;
  medium:
    | { kind: "free-space" }
    | { kind: "effective-permittivity"; value: number }
    | { kind: "velocity-factor"; value: number };
}

export interface ImpedanceResult {
  z: Complex | null;
  y: Complex | null;
  gamma: Complex;
  reference: number;
  limit: "finite" | "short" | "open";
  magnitude: number;
  phase: number;
  s11: number;
  vswr: number;
  returnLoss: number;
  mismatchLoss: number;
}
