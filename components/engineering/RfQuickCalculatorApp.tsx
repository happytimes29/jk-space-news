"use client";

import { useEffect, useMemo, useState } from "react";
import { CalculatorField } from "./CalculatorField";
import { ResultPanel } from "./ResultPanel";
import { complexMagnitude, complexPhaseDegrees, type Complex } from "@/lib/engineering/complex";
import { formatEngineering, parseEngineeringNumber } from "@/lib/engineering/quantity";
import { impedanceToAdmittance, reflectionCoefficient, reflectionMetrics, wavelength } from "@/lib/engineering/rf";
import { decodeToolState, encodeToolState } from "@/lib/engineering/query-state";

export interface RfQuickCalculatorCopy {
  propagationTab: string;
  impedanceTab: string;
  inputTitle: string;
  resultTitle: string;
  frequencyLabel: string;
  permittivityLabel: string;
  velocityFactorLabel: string;
  lengthLabel: string;
  resistanceLabel: string;
  reactanceLabel: string;
  referenceLabel: string;
  velocityLabel: string;
  wavelengthLabel: string;
  halfWavelengthLabel: string;
  quarterWavelengthLabel: string;
  delayLabel: string;
  electricalAngleLabel: string;
  impedanceResultLabel: string;
  admittanceLabel: string;
  gammaLabel: string;
  s11Label: string;
  vswrLabel: string;
  returnLossLabel: string;
  mismatchLossLabel: string;
  invalidInput: string;
  conflictingMedium: string;
  infinityLabel: string;
}

type Mode = "propagation" | "impedance";
interface PropagationResult { velocity: number; wavelength: number; half: number; quarter: number; delay: number; angle: number }
interface ImpedanceResult { z: Complex; y: Complex; gamma: Complex; magnitude: number; phase: number; s11: number; vswr: number; returnLoss: number; mismatchLoss: number }
const STATE_KEYS = ["mode", "frequency", "er", "velocityFactor", "length", "real", "imaginary", "z0"] as const;

function savedState() {
  if (typeof window === "undefined") return {};
  return decodeToolState(window.location.search, STATE_KEYS);
}

function parsed(text: string): number | undefined {
  const result = parseEngineeringNumber(text);
  return result.ok ? result.value : undefined;
}

function decimal(value: number, significantDigits = 6): string {
  if (Object.is(value, -0) || value === 0) return "0";
  if (!Number.isFinite(value)) return value > 0 ? "∞" : "−∞";
  return Number(value.toPrecision(significantDigits)).toString();
}

function complexText(value: Complex, unit = ""): string {
  const suffix = unit ? ` ${unit}` : "";
  const sign = value.im < 0 ? "−" : "+";
  return `${decimal(value.re)} ${sign} j${decimal(Math.abs(value.im))}${suffix} · ${decimal(complexMagnitude(value))} ∠ ${decimal(complexPhaseDegrees(value))}°${suffix}`;
}

function defaultPropagation(): PropagationResult {
  const result = wavelength({ frequencyHz: 1e9 });
  if (!result.ok) throw new Error("invalid propagation example");
  return { velocity: result.value.velocityMps, wavelength: result.value.wavelengthM, half: result.value.halfM, quarter: result.value.quarterM, delay: 0.1 * result.value.delaySecondsPerM, angle: 0.1 / result.value.wavelengthM * 360 };
}

function defaultImpedance(): ImpedanceResult {
  return { z: { re: 50, im: 0 }, y: { re: 0.02, im: 0 }, gamma: { re: 0, im: 0 }, magnitude: 0, phase: 0, s11: Number.NEGATIVE_INFINITY, vswr: 1, returnLoss: Number.POSITIVE_INFINITY, mismatchLoss: 0 };
}

export function RfQuickCalculatorApp({ copy }: { copy: RfQuickCalculatorCopy }) {
  const saved = useMemo(savedState, []);
  const initialMode: Mode = saved.mode === "impedance" ? "impedance" : "propagation";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [frequency, setFrequency] = useState(initialMode === "propagation" && saved.frequency ? saved.frequency : "1G");
  const [er, setEr] = useState(initialMode === "propagation" ? saved.er ?? "" : "");
  const [velocityFactor, setVelocityFactor] = useState(initialMode === "propagation" ? saved.velocityFactor ?? "" : "");
  const [length, setLength] = useState(initialMode === "propagation" && saved.length ? saved.length : "0.1");
  const [real, setReal] = useState(initialMode === "impedance" && saved.real ? saved.real : "50");
  const [imaginary, setImaginary] = useState(initialMode === "impedance" && saved.imaginary ? saved.imaginary : "0");
  const [z0, setZ0] = useState(initialMode === "impedance" && saved.z0 ? saved.z0 : "50");
  const [error, setError] = useState<string>();
  const [propagation, setPropagation] = useState<PropagationResult>(defaultPropagation);
  const [impedance, setImpedance] = useState<ImpedanceResult>(defaultImpedance);

  useEffect(() => {
    if (mode !== "propagation") return;
    if (er.trim() && velocityFactor.trim()) {
      setError(copy.conflictingMedium);
      return;
    }
    const frequencyHz = parsed(frequency);
    const lengthM = parsed(length);
    const relativePermittivity = er.trim() ? parsed(er) : undefined;
    const factor = velocityFactor.trim() ? parsed(velocityFactor) : undefined;
    if (frequencyHz === undefined || lengthM === undefined || lengthM < 0 || (er.trim() && relativePermittivity === undefined) || (velocityFactor.trim() && factor === undefined)) {
      setError(copy.invalidInput);
      return;
    }
    const result = wavelength({ frequencyHz, relativePermittivity, velocityFactor: factor });
    if (!result.ok) {
      setError(copy.invalidInput);
      return;
    }
    setError(undefined);
    setPropagation({ velocity: result.value.velocityMps, wavelength: result.value.wavelengthM, half: result.value.halfM, quarter: result.value.quarterM, delay: lengthM * result.value.delaySecondsPerM, angle: lengthM / result.value.wavelengthM * 360 });
  }, [copy.conflictingMedium, copy.invalidInput, er, frequency, length, mode, velocityFactor]);

  useEffect(() => {
    if (mode !== "impedance") return;
    const re = parsed(real), im = parsed(imaginary), reference = parsed(z0);
    if (re === undefined || im === undefined || reference === undefined || re < 0) {
      setError(copy.invalidInput);
      return;
    }
    const z = { re, im };
    const y = impedanceToAdmittance(z);
    const gamma = reflectionCoefficient(z, reference);
    if (!y.ok || !gamma.ok) {
      setError(copy.invalidInput);
      return;
    }
    const metrics = reflectionMetrics(gamma.value);
    if (!metrics.ok) {
      setError(copy.invalidInput);
      return;
    }
    setError(undefined);
    setImpedance({ z, y: y.value, gamma: gamma.value, magnitude: metrics.value.magnitude, phase: metrics.value.phaseDegrees, s11: metrics.value.s11Db, vswr: metrics.value.vswr, returnLoss: metrics.value.returnLossDb, mismatchLoss: metrics.value.mismatchLossDb });
  }, [copy.invalidInput, imaginary, mode, real, z0]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = mode === "propagation"
      ? encodeToolState({ mode, frequency, er, velocityFactor, length })
      : encodeToolState({ mode, real, imaginary, z0 });
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?${query}${window.location.hash}`);
  }, [er, frequency, imaginary, length, mode, real, velocityFactor, z0]);

  const finiteOrInfinity = (value: number, unit = "") => `${Number.isFinite(value) ? decimal(value) : value < 0 ? `−${copy.infinityLabel}` : copy.infinityLabel}${unit ? ` ${unit}` : ""}`;
  return <div className="space-y-6">
    <div role="tablist" className="grid grid-cols-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-2">
      <button type="button" role="tab" aria-selected={mode === "propagation"} onClick={() => setMode("propagation")} className={`rounded-lg px-3 py-2 text-sm font-medium ${mode === "propagation" ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-muted)]"}`}>{copy.propagationTab}</button>
      <button type="button" role="tab" aria-selected={mode === "impedance"} onClick={() => setMode("impedance")} className={`rounded-lg px-3 py-2 text-sm font-medium ${mode === "impedance" ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-muted)]"}`}>{copy.impedanceTab}</button>
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-label={copy.inputTitle} className="space-y-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <h2 className="text-lg font-semibold">{copy.inputTitle}</h2>
        {mode === "propagation" ? <>
          <CalculatorField id="rf-frequency" label={copy.frequencyLabel} value={frequency} onChange={(event) => setFrequency(event.target.value)} unit="Hz" />
          <CalculatorField id="rf-er" label={copy.permittivityLabel} value={er} onChange={(event) => setEr(event.target.value)} />
          <CalculatorField id="rf-vf" label={copy.velocityFactorLabel} value={velocityFactor} onChange={(event) => setVelocityFactor(event.target.value)} error={error} />
          <CalculatorField id="rf-length" label={copy.lengthLabel} value={length} onChange={(event) => setLength(event.target.value)} unit="m" />
        </> : <>
          <CalculatorField id="rf-real" label={copy.resistanceLabel} value={real} onChange={(event) => setReal(event.target.value)} unit="Ω" />
          <CalculatorField id="rf-imaginary" label={copy.reactanceLabel} value={imaginary} onChange={(event) => setImaginary(event.target.value)} unit="Ω" />
          <CalculatorField id="rf-z0" label={copy.referenceLabel} value={z0} onChange={(event) => setZ0(event.target.value)} unit="Ω" error={error} />
        </>}
      </section>
      <ResultPanel title={copy.resultTitle}>
        {mode === "propagation" ? <dl className="space-y-4">
          <Result label={copy.velocityLabel}>{formatEngineering(propagation.velocity, { unit: "m/s" })}</Result>
          <Result label={copy.wavelengthLabel}>{formatEngineering(propagation.wavelength, { unit: "m" })}</Result>
          <Result label={copy.halfWavelengthLabel}>{formatEngineering(propagation.half, { unit: "m" })}</Result>
          <Result label={copy.quarterWavelengthLabel}>{formatEngineering(propagation.quarter, { unit: "m" })}</Result>
          <Result label={copy.delayLabel}>{formatEngineering(propagation.delay, { unit: "s" })}</Result>
          <Result label={copy.electricalAngleLabel}>{decimal(propagation.angle)}°</Result>
        </dl> : <dl className="space-y-4">
          <Result label={copy.impedanceResultLabel}>{complexText(impedance.z, "Ω")}</Result>
          <Result label={copy.admittanceLabel}>{complexText(impedance.y, "S")}</Result>
          <Result label={copy.gammaLabel}>{complexText(impedance.gamma)}</Result>
          <Result label={copy.s11Label}>{finiteOrInfinity(impedance.s11, "dB")}</Result>
          <Result label={copy.vswrLabel}>{finiteOrInfinity(impedance.vswr)}</Result>
          <Result label={copy.returnLossLabel}>{finiteOrInfinity(impedance.returnLoss, "dB")}</Result>
          <Result label={copy.mismatchLossLabel}>{finiteOrInfinity(impedance.mismatchLoss, "dB")}</Result>
        </dl>}
      </ResultPanel>
    </div>
  </div>;
}

function Result({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><dt className="text-sm text-[var(--color-muted)]">{label}</dt><dd className="mt-1 font-mono">{children}</dd></div>;
}
