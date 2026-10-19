"use client";

import { useEffect, useState } from "react";
import { CalculatorField } from "./CalculatorField";
import { ResultPanel } from "./ResultPanel";
import { GeometryDiagram, type GeometryLabels } from "./transmission-line/GeometryDiagram";
import { analyzeTransmissionLine, solveTransmissionLineWidth, type TransmissionLineInput, type TransmissionLineKind } from "@/lib/engineering/transmission-line-solver";
import type { TransmissionLineResult } from "@/lib/engineering/transmission-line";
import { formatEngineering, parseEngineeringNumber } from "@/lib/engineering/quantity";
import { decodeToolState, encodeToolState } from "@/lib/engineering/query-state";

export interface TransmissionLineCopy {
  inputTitle: string; modelLabel: string; microstripLabel: string; striplineLabel: string; cpwgLabel: string;
  modeLabel: string; forwardLabel: string; targetModeLabel: string; unitLabel: string; widthLabel: string; heightLabel: string;
  planeLabel: string; gapLabel: string; thicknessLabel: string; permittivityLabel: string; frequencyLabel: string; lengthLabel: string;
  targetLabel: string; solveLabel: string; solvedWidthLabel: string; resultTitle: string; impedanceLabel: string;
  effectivePermittivityLabel: string; velocityLabel: string; wavelengthLabel: string; delayLabel: string; angleLabel: string;
  warningLabel: string; invalidInput: string; noSolution: string; formulaMicrostrip: string; formulaStripline: string; formulaCpwg: string;
  privacyNote: string; diagramTitle: string; diagram: GeometryLabels;
}

type DisplayUnit = "mm" | "mil" | "um";
type Mode = "forward" | "target";
const FACTOR: Record<DisplayUnit, number> = { mm: 1e-3, mil: 25.4e-6, um: 1e-6 };
const STATE_KEYS = ["kind", "mode", "unit", "widthM", "heightM", "gapM", "thicknessM", "er", "frequency", "lengthM", "target"] as const;

function parsed(text: string): number | undefined {
  const result = parseEngineeringNumber(text);
  return result.ok ? result.value : undefined;
}

function text(value: number): string { return Number(value.toPrecision(12)).toString(); }
function fromMetres(value: number, unit: DisplayUnit): string { return text(value / FACTOR[unit]); }
function canonicalMetres(value: number): string { return String(Math.round(value * 1e12) / 1e12); }

function defaultResult(): TransmissionLineResult {
  const result = analyzeTransmissionLine({ kind: "microstrip", widthM: 3e-3, substrateHeightM: 1.6e-3, conductorThicknessM: 35e-6, relativePermittivity: 4.3, frequencyHz: 1e9, lengthM: 0.1 });
  if (!result.ok) throw new Error("Invalid transmission-line defaults");
  return result.value;
}

export function TransmissionLineApp({ copy }: { copy: TransmissionLineCopy }) {
  const [kind, setKind] = useState<TransmissionLineKind>("microstrip");
  const [mode, setMode] = useState<Mode>("forward");
  const [unit, setUnit] = useState<DisplayUnit>("mm");
  const [width, setWidth] = useState("3");
  const [height, setHeight] = useState("1.6");
  const [gap, setGap] = useState("0.2");
  const [thickness, setThickness] = useState("0.035");
  const [permittivity, setPermittivity] = useState("4.3");
  const [frequency, setFrequency] = useState("1G");
  const [length, setLength] = useState("100");
  const [target, setTarget] = useState("50");
  const [result, setResult] = useState(defaultResult);
  const [warning, setWarning] = useState(false);
  const [error, setError] = useState<string>();
  const [solvedWidth, setSolvedWidth] = useState<number>();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = decodeToolState(window.location.search, STATE_KEYS);
    const savedKind: TransmissionLineKind = ["microstrip", "stripline", "cpwg"].includes(saved.kind) ? saved.kind as TransmissionLineKind : "microstrip";
    const savedUnit: DisplayUnit = ["mm", "mil", "um"].includes(saved.unit) ? saved.unit as DisplayUnit : "mm";
    setKind(savedKind); setMode(saved.mode === "target" ? "target" : "forward"); setUnit(savedUnit);
    if (saved.widthM && Number.isFinite(Number(saved.widthM))) setWidth(fromMetres(Number(saved.widthM), savedUnit));
    if (saved.heightM && Number.isFinite(Number(saved.heightM))) setHeight(fromMetres(Number(saved.heightM), savedUnit));
    if (saved.gapM && Number.isFinite(Number(saved.gapM))) setGap(fromMetres(Number(saved.gapM), savedUnit));
    if (saved.thicknessM && Number.isFinite(Number(saved.thicknessM))) setThickness(fromMetres(Number(saved.thicknessM), savedUnit));
    if (saved.lengthM && Number.isFinite(Number(saved.lengthM))) setLength(fromMetres(Number(saved.lengthM), savedUnit));
    if (saved.er) setPermittivity(saved.er); if (saved.frequency) setFrequency(saved.frequency); if (saved.target) setTarget(saved.target);
    setHydrated(true);
  }, []);

  function input(): TransmissionLineInput | undefined {
    const widthM = parsed(width), heightM = parsed(height), gapM = parsed(gap), thicknessM = parsed(thickness), er = parsed(permittivity), frequencyHz = parsed(frequency), lengthM = parsed(length);
    if ([widthM, heightM, thicknessM, er, frequencyHz, lengthM].some((value) => value === undefined)) return undefined;
    const common = { widthM: widthM! * FACTOR[unit], conductorThicknessM: thicknessM! * FACTOR[unit], relativePermittivity: er!, frequencyHz: frequencyHz!, lengthM: lengthM! * FACTOR[unit] };
    if (kind === "microstrip") return { kind, ...common, substrateHeightM: heightM! * FACTOR[unit] };
    if (kind === "stripline") return { kind, ...common, planeSeparationM: heightM! * FACTOR[unit] };
    if (gapM === undefined) return undefined;
    return { kind, ...common, gapM: gapM * FACTOR[unit], substrateHeightM: heightM! * FACTOR[unit] };
  }

  useEffect(() => {
    const current = input();
    const analyzed = current ? analyzeTransmissionLine(current) : undefined;
    if (!analyzed?.ok) { setError(copy.invalidInput); setSolvedWidth(undefined); return; }
    setError(undefined); setResult(analyzed.value); setWarning(analyzed.warnings.some(({ code }) => code === "model_range"));
  // Primitive fields deliberately drive recalculation; input() is a local projection.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copy.invalidInput, frequency, gap, height, kind, length, permittivity, thickness, unit, width]);

  useEffect(() => {
    if (!hydrated) return;
    const current = input();
    if (!current) return;
    const state: Record<string, string> = { kind, mode, unit, widthM: canonicalMetres(current.widthM), thicknessM: canonicalMetres(current.conductorThicknessM), er: permittivity, frequency, lengthM: canonicalMetres(current.lengthM), target };
    state.heightM = canonicalMetres(current.kind === "stripline" ? current.planeSeparationM : current.substrateHeightM);
    if (current.kind === "cpwg") state.gapM = canonicalMetres(current.gapM);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?${encodeToolState(state)}${window.location.hash}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frequency, gap, height, hydrated, kind, length, mode, permittivity, target, thickness, unit, width]);

  function changeUnit(next: DisplayUnit) {
    const ratio = FACTOR[unit] / FACTOR[next];
    const convert = (value: string) => { const number = parsed(value); return number === undefined ? value : text(number * ratio); };
    setWidth(convert(width)); setHeight(convert(height)); setGap(convert(gap)); setThickness(convert(thickness)); setLength(convert(length)); setUnit(next);
  }

  function changeKind(next: TransmissionLineKind) {
    setKind(next); setSolvedWidth(undefined);
    const widthM = next === "stripline" ? 0.75e-3 : 3e-3;
    setWidth(fromMetres(widthM, unit)); setHeight(fromMetres(1.6e-3, unit)); setGap(fromMetres(0.2e-3, unit)); setThickness(fromMetres(35e-6, unit));
  }

  function solve() {
    const current = input();
    const targetImpedanceOhms = parsed(target);
    if (!current || targetImpedanceOhms === undefined) { setError(copy.invalidInput); setSolvedWidth(undefined); return; }
    const common = { conductorThicknessM: current.conductorThicknessM, relativePermittivity: current.relativePermittivity, frequencyHz: current.frequencyHz, lengthM: current.lengthM, targetImpedanceOhms };
    const solveInput: Parameters<typeof solveTransmissionLineWidth>[0] = current.kind === "microstrip"
      ? { kind: current.kind, ...common, substrateHeightM: current.substrateHeightM }
      : current.kind === "stripline"
        ? { kind: current.kind, ...common, planeSeparationM: current.planeSeparationM }
        : { kind: current.kind, ...common, gapM: current.gapM, substrateHeightM: current.substrateHeightM };
    const solved = solveTransmissionLineWidth(solveInput);
    if (!solved.ok) { setError(copy.noSolution); setSolvedWidth(undefined); return; }
    setError(undefined); setWidth(fromMetres(solved.value.widthM, unit)); setSolvedWidth(solved.value.widthM); setResult(solved.value.result); setWarning(solved.value.result.warnings.some(({ code }) => code === "model_range"));
  }

  const formula = kind === "microstrip" ? copy.formulaMicrostrip : kind === "stripline" ? copy.formulaStripline : copy.formulaCpwg;
  return <div className="space-y-6">
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-label={copy.inputTitle} className="space-y-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <h2 className="text-lg font-semibold">{copy.inputTitle}</h2>
        <Select label={copy.modelLabel} value={kind} onChange={(value) => changeKind(value as TransmissionLineKind)} options={[["microstrip", copy.microstripLabel], ["stripline", copy.striplineLabel], ["cpwg", copy.cpwgLabel]]} />
        <Select label={copy.modeLabel} value={mode} onChange={(value) => { setMode(value as Mode); setSolvedWidth(undefined); }} options={[["forward", copy.forwardLabel], ["target", copy.targetModeLabel]]} />
        <Select label={copy.unitLabel} value={unit} onChange={(value) => changeUnit(value as DisplayUnit)} options={[["mm", "mm"], ["mil", "mil"], ["um", "µm"]]} />
        <GeometryDiagram kind={kind} title={copy.diagramTitle} labels={copy.diagram} />
        <div className="grid gap-4 sm:grid-cols-2">
          <CalculatorField id="tl-width" label={copy.widthLabel} value={width} onChange={(event) => { setWidth(event.target.value); setSolvedWidth(undefined); }} unit={unit === "um" ? "µm" : unit} error={error} />
          <CalculatorField id="tl-height" label={kind === "stripline" ? copy.planeLabel : copy.heightLabel} value={height} onChange={(event) => { setHeight(event.target.value); setSolvedWidth(undefined); }} unit={unit === "um" ? "µm" : unit} />
          {kind === "cpwg" && <CalculatorField id="tl-gap" label={copy.gapLabel} value={gap} onChange={(event) => { setGap(event.target.value); setSolvedWidth(undefined); }} unit={unit === "um" ? "µm" : unit} />}
          <CalculatorField id="tl-thickness" label={copy.thicknessLabel} value={thickness} onChange={(event) => { setThickness(event.target.value); setSolvedWidth(undefined); }} unit={unit === "um" ? "µm" : unit} />
          <CalculatorField id="tl-er" label={copy.permittivityLabel} value={permittivity} onChange={(event) => { setPermittivity(event.target.value); setSolvedWidth(undefined); }} />
          <CalculatorField id="tl-frequency" label={copy.frequencyLabel} value={frequency} onChange={(event) => { setFrequency(event.target.value); setSolvedWidth(undefined); }} unit="Hz" />
          <CalculatorField id="tl-length" label={copy.lengthLabel} value={length} onChange={(event) => { setLength(event.target.value); setSolvedWidth(undefined); }} unit={unit === "um" ? "µm" : unit} />
          {mode === "target" && <CalculatorField id="tl-target" label={copy.targetLabel} value={target} onChange={(event) => { setTarget(event.target.value); setSolvedWidth(undefined); }} unit="Ω" />}
        </div>
        {mode === "target" && <button type="button" onClick={solve} className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2 font-medium text-white">{copy.solveLabel}</button>}
        {solvedWidth !== undefined && <p className="font-medium">{copy.solvedWidthLabel}: {fromMetres(solvedWidth, unit)} {unit === "um" ? "µm" : unit}</p>}
        {warning && <p role="status" className="text-amber-700 dark:text-amber-300">{copy.warningLabel}</p>}
        <p className="text-sm text-[var(--color-muted)]">{formula}</p><p className="text-xs text-[var(--color-muted)]">{copy.privacyNote}</p>
      </section>
      <ResultPanel title={copy.resultTitle}><dl className="space-y-4">
        <Result label={copy.impedanceLabel}><span data-testid="impedance-value">{Number(result.impedanceOhms.toPrecision(8))} Ω</span></Result>
        <Result label={copy.effectivePermittivityLabel}>{Number(result.effectivePermittivity.toPrecision(8))}</Result>
        <Result label={copy.velocityLabel}>{formatEngineering(result.phaseVelocityMps, { unit: "m/s" })}</Result>
        <Result label={copy.wavelengthLabel}>{formatEngineering(result.wavelengthM, { unit: "m" })}</Result>
        <Result label={copy.delayLabel}>{formatEngineering(result.delaySecondsPerM, { unit: "s/m" })}</Result>
        <Result label={copy.angleLabel}>{Number(result.electricalLengthDegrees.toPrecision(8))}°</Result>
      </dl></ResultPanel>
    </div>
  </div>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <label className="block space-y-2 text-sm font-medium">{label}<select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2">{options.map(([option, text]) => <option key={option} value={option}>{text}</option>)}</select></label>;
}
function Result({ label, children }: { label: string; children: React.ReactNode }) { return <div><dt className="text-sm text-[var(--color-muted)]">{label}</dt><dd className="mt-1 font-mono">{children}</dd></div>; }
