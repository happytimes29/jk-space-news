"use client";

import { useEffect, useState } from "react";
import { CalculatorField } from "./CalculatorField";
import { ResultPanel } from "./ResultPanel";
import { complexAdd, complexDivide, complexMagnitude, complexPhaseDegrees, complexReciprocal, type Complex } from "@/lib/engineering/complex";
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
  propagationInputLabel: string;
  angleInputLabel: string;
  delayInputLabel: string;
  impedanceInputLabel: string;
  zInputLabel: string;
  yInputLabel: string;
  gammaInputLabel: string;
  conductanceLabel: string;
  susceptanceLabel: string;
  gammaRealLabel: string;
  gammaImagLabel: string;
  normalizedLabel: string;
  shortCircuitLabel: string;
  openCircuitLabel: string;
}

type Mode = "propagation" | "impedance";
type PropagationInput = "length" | "angle" | "delay";
type ImpedanceInput = "z" | "y" | "gamma";
interface PropagationResult { velocity: number; wavelength: number; half: number; quarter: number; length: number; delay: number; angle: number }
interface ImpedanceResult { z: Complex | null; y: Complex | null; gamma: Complex; reference: number; limit: "finite" | "short" | "open"; magnitude: number; phase: number; s11: number; vswr: number; returnLoss: number; mismatchLoss: number }
const STATE_KEYS = ["mode", "propagationInput", "frequency", "er", "velocityFactor", "length", "angle", "delay", "impedanceInput", "real", "imaginary", "z0"] as const;

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
  return { velocity: result.value.velocityMps, wavelength: result.value.wavelengthM, half: result.value.halfM, quarter: result.value.quarterM, length: 0.1, delay: 0.1 * result.value.delaySecondsPerM, angle: 0.1 / result.value.wavelengthM * 360 };
}

function defaultImpedance(): ImpedanceResult {
  return { z: { re: 50, im: 0 }, y: { re: 0.02, im: 0 }, gamma: { re: 0, im: 0 }, reference: 50, limit: "finite", magnitude: 0, phase: 0, s11: Number.NEGATIVE_INFINITY, vswr: 1, returnLoss: Number.POSITIVE_INFINITY, mismatchLoss: 0 };
}

export function RfQuickCalculatorApp({ copy }: { copy: RfQuickCalculatorCopy }) {
  const [mode, setMode] = useState<Mode>("propagation");
  const [frequency, setFrequency] = useState("1G");
  const [er, setEr] = useState("");
  const [velocityFactor, setVelocityFactor] = useState("");
  const [length, setLength] = useState("0.1");
  const [angle, setAngle] = useState("120.083");
  const [delay, setDelay] = useState("333.564p");
  const [propagationInput, setPropagationInput] = useState<PropagationInput>("length");
  const [impedanceInput, setImpedanceInput] = useState<ImpedanceInput>("z");
  const [real, setReal] = useState("50");
  const [imaginary, setImaginary] = useState("0");
  const [z0, setZ0] = useState("50");
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string>();
  const [propagation, setPropagation] = useState<PropagationResult>(defaultPropagation);
  const [impedance, setImpedance] = useState<ImpedanceResult>(defaultImpedance);

  useEffect(() => {
    const saved = decodeToolState(window.location.search, STATE_KEYS);
    const savedMode: Mode = saved.mode === "impedance" ? "impedance" : "propagation";
    setMode(savedMode);
    if (savedMode === "propagation") {
      if (["length", "angle", "delay"].includes(saved.propagationInput)) setPropagationInput(saved.propagationInput as PropagationInput);
      if (saved.frequency) setFrequency(saved.frequency);
      setEr(saved.er ?? "");
      setVelocityFactor(saved.velocityFactor ?? "");
      if (saved.length) setLength(saved.length);
      if (saved.angle) setAngle(saved.angle);
      if (saved.delay) setDelay(saved.delay);
    } else {
      if (["z", "y", "gamma"].includes(saved.impedanceInput)) setImpedanceInput(saved.impedanceInput as ImpedanceInput);
      if (saved.real) setReal(saved.real);
      if (saved.imaginary) setImaginary(saved.imaginary);
      if (saved.z0) setZ0(saved.z0);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (mode !== "propagation") return;
    if (er.trim() && velocityFactor.trim()) {
      setError(copy.conflictingMedium);
      return;
    }
    const frequencyHz = parsed(frequency);
    const inputValue = parsed(propagationInput === "length" ? length : propagationInput === "angle" ? angle : delay);
    const relativePermittivity = er.trim() ? parsed(er) : undefined;
    const factor = velocityFactor.trim() ? parsed(velocityFactor) : undefined;
    if (frequencyHz === undefined || inputValue === undefined || inputValue < 0 || (er.trim() && relativePermittivity === undefined) || (velocityFactor.trim() && factor === undefined)) {
      setError(copy.invalidInput);
      return;
    }
    const result = wavelength({ frequencyHz, relativePermittivity, velocityFactor: factor });
    if (!result.ok) {
      setError(copy.invalidInput);
      return;
    }
    const lengthM = propagationInput === "length" ? inputValue : propagationInput === "angle" ? inputValue / 360 * result.value.wavelengthM : inputValue * result.value.velocityMps;
    setError(undefined);
    setPropagation({ velocity: result.value.velocityMps, wavelength: result.value.wavelengthM, half: result.value.halfM, quarter: result.value.quarterM, length: lengthM, delay: lengthM * result.value.delaySecondsPerM, angle: lengthM / result.value.wavelengthM * 360 });
  }, [angle, copy.conflictingMedium, copy.invalidInput, delay, er, frequency, length, mode, propagationInput, velocityFactor]);

  useEffect(() => {
    if (mode !== "impedance") return;
    const re = parsed(real), im = parsed(imaginary), reference = parsed(z0);
    if (re === undefined || im === undefined || reference === undefined || reference <= 0 || (impedanceInput !== "gamma" && re < 0)) {
      setError(copy.invalidInput);
      return;
    }
    let z: Complex | null = null;
    let y: Complex | null = null;
    let gamma: Complex;
    let limit: ImpedanceResult["limit"] = "finite";
    if (impedanceInput === "z") {
      z = { re, im };
      if (re === 0 && im === 0) {
        limit = "short";
        gamma = { re: -1, im: 0 };
      } else {
        const converted = impedanceToAdmittance(z);
        const reflected = reflectionCoefficient(z, reference);
        if (!converted.ok || !reflected.ok) { setError(copy.invalidInput); return; }
        y = converted.value;
        gamma = reflected.value;
      }
    } else if (impedanceInput === "y") {
      y = { re, im };
      if (re === 0 && im === 0) {
        limit = "open";
        gamma = { re: 1, im: 0 };
      } else {
        const converted = complexReciprocal(y);
        if (!converted.ok) { setError(copy.invalidInput); return; }
        z = converted.value;
        const reflected = reflectionCoefficient(z, reference);
        if (!reflected.ok) { setError(copy.invalidInput); return; }
        gamma = reflected.value;
      }
    } else {
      gamma = { re, im };
      if (complexMagnitude(gamma) > 1) { setError(copy.invalidInput); return; }
      if (gamma.im === 0 && gamma.re === 1) {
        limit = "open";
        y = { re: 0, im: 0 };
      } else if (gamma.im === 0 && gamma.re === -1) {
        limit = "short";
        z = { re: 0, im: 0 };
      } else {
        const normalized = complexDivide(complexAdd({ re: 1, im: 0 }, gamma), { re: 1 - gamma.re, im: -gamma.im });
        if (!normalized.ok) { setError(copy.invalidInput); return; }
        z = { re: normalized.value.re * reference, im: normalized.value.im * reference };
        const converted = impedanceToAdmittance(z);
        if (!converted.ok) { setError(copy.invalidInput); return; }
        y = converted.value;
      }
    }
    const metrics = reflectionMetrics(gamma);
    if (!metrics.ok) {
      setError(copy.invalidInput);
      return;
    }
    setError(undefined);
    setImpedance({ z, y, gamma, reference, limit, magnitude: metrics.value.magnitude, phase: metrics.value.phaseDegrees, s11: metrics.value.s11Db, vswr: metrics.value.vswr, returnLoss: metrics.value.returnLossDb, mismatchLoss: metrics.value.mismatchLossDb });
  }, [copy.invalidInput, imaginary, impedanceInput, mode, real, z0]);

  useEffect(() => {
    if (!hydrated) return;
    const query = mode === "propagation"
      ? encodeToolState({ mode, propagationInput, frequency, er, velocityFactor, length, angle, delay })
      : encodeToolState({ mode, impedanceInput, real, imaginary, z0 });
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?${query}${window.location.hash}`);
  }, [angle, delay, er, frequency, hydrated, imaginary, impedanceInput, length, mode, propagationInput, real, velocityFactor, z0]);

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
          <label className="block space-y-2 text-sm font-medium">{copy.propagationInputLabel}<select aria-label={copy.propagationInputLabel} value={propagationInput} onChange={(event) => setPropagationInput(event.target.value as PropagationInput)} className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2"><option value="length">{copy.lengthLabel}</option><option value="angle">{copy.angleInputLabel}</option><option value="delay">{copy.delayInputLabel}</option></select></label>
          <CalculatorField id="rf-frequency" label={copy.frequencyLabel} value={frequency} onChange={(event) => setFrequency(event.target.value)} unit="Hz" />
          <CalculatorField id="rf-er" label={copy.permittivityLabel} value={er} onChange={(event) => setEr(event.target.value)} />
          <CalculatorField id="rf-vf" label={copy.velocityFactorLabel} value={velocityFactor} onChange={(event) => setVelocityFactor(event.target.value)} error={error} />
          {propagationInput === "length" && <CalculatorField id="rf-length" label={copy.lengthLabel} value={length} onChange={(event) => setLength(event.target.value)} unit="m" />}
          {propagationInput === "angle" && <CalculatorField id="rf-angle" label={copy.angleInputLabel} value={angle} onChange={(event) => setAngle(event.target.value)} unit="°" />}
          {propagationInput === "delay" && <CalculatorField id="rf-delay" label={copy.delayInputLabel} value={delay} onChange={(event) => setDelay(event.target.value)} unit="s" />}
        </> : <>
          <label className="block space-y-2 text-sm font-medium">{copy.impedanceInputLabel}<select aria-label={copy.impedanceInputLabel} value={impedanceInput} onChange={(event) => { const next = event.target.value as ImpedanceInput; setImpedanceInput(next); setReal(next === "z" ? "50" : next === "y" ? "0.02" : "0"); setImaginary("0"); }} className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2"><option value="z">{copy.zInputLabel}</option><option value="y">{copy.yInputLabel}</option><option value="gamma">{copy.gammaInputLabel}</option></select></label>
          <CalculatorField id="rf-real" label={impedanceInput === "z" ? copy.resistanceLabel : impedanceInput === "y" ? copy.conductanceLabel : copy.gammaRealLabel} value={real} onChange={(event) => setReal(event.target.value)} unit={impedanceInput === "z" ? "Ω" : impedanceInput === "y" ? "S" : undefined} />
          <CalculatorField id="rf-imaginary" label={impedanceInput === "z" ? copy.reactanceLabel : impedanceInput === "y" ? copy.susceptanceLabel : copy.gammaImagLabel} value={imaginary} onChange={(event) => setImaginary(event.target.value)} unit={impedanceInput === "z" ? "Ω" : impedanceInput === "y" ? "S" : undefined} />
          <CalculatorField id="rf-z0" label={copy.referenceLabel} value={z0} onChange={(event) => setZ0(event.target.value)} unit="Ω" error={error} />
        </>}
      </section>
      <ResultPanel title={copy.resultTitle}>
        {mode === "propagation" ? <dl className="space-y-4">
          <Result label={copy.velocityLabel}>{formatEngineering(propagation.velocity, { unit: "m/s" })}</Result>
          <Result label={copy.wavelengthLabel}>{formatEngineering(propagation.wavelength, { unit: "m" })}</Result>
          <Result label={copy.halfWavelengthLabel}>{formatEngineering(propagation.half, { unit: "m" })}</Result>
          <Result label={copy.quarterWavelengthLabel}>{formatEngineering(propagation.quarter, { unit: "m" })}</Result>
          <Result label={copy.lengthLabel}>{formatEngineering(propagation.length, { unit: "m" })}</Result>
          <Result label={copy.delayLabel}>{formatEngineering(propagation.delay, { unit: "s" })}</Result>
          <Result label={copy.electricalAngleLabel}>{decimal(propagation.angle)}°</Result>
        </dl> : <dl className="space-y-4">
          <Result label={copy.impedanceResultLabel}>{impedance.z ? <>{impedance.limit === "short" && `${copy.shortCircuitLabel} · `}{complexText(impedance.z, "Ω")}</> : `${copy.openCircuitLabel} · ${copy.infinityLabel} Ω`}</Result>
          <Result label={copy.admittanceLabel}>{impedance.y ? <>{impedance.limit === "open" && `${copy.openCircuitLabel} · `}{complexText(impedance.y, "S")}</> : `${copy.shortCircuitLabel} · ${copy.infinityLabel} S`}</Result>
          <Result label={copy.gammaLabel}>{complexText(impedance.gamma)}</Result>
          <Result label={copy.normalizedLabel}>{impedance.limit === "open" ? `z = ${copy.infinityLabel} · y = 0` : impedance.limit === "short" ? `z = 0 · y = ${copy.infinityLabel}` : <>z = {complexText({ re: impedance.z!.re / impedance.reference, im: impedance.z!.im / impedance.reference })} · y = {complexText({ re: impedance.y!.re * impedance.reference, im: impedance.y!.im * impedance.reference })}</>}</Result>
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
