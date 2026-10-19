"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { CalculatorField } from "./CalculatorField";
import { SmithChart, type SmithChartLabels, type SmithPath } from "./smith/SmithChart";
import { SmithReadoutTable, type SmithReadoutLabels } from "./smith/SmithReadoutTable";
import { exportSmithChartPng } from "./smith/export";
import { createHistory, pushHistory, redoHistory, undoHistory } from "./smith/history";
import { solveLMatch, roundMatchSolution, type MatchSolution } from "@/lib/engineering/matching";
import { applyNetworkStep, sampleNetworkStep, type NetworkStep } from "@/lib/engineering/network";
import { formatEngineering, parseEngineeringNumber } from "@/lib/engineering/quantity";
import { decodeToolState, encodeToolState } from "@/lib/engineering/query-state";
import { smithPoint, smithReadout, type SmithPoint, type SmithReadout } from "@/lib/engineering/smith";
import type { Complex } from "@/lib/engineering/complex";
import type { SmithChartMode } from "./smith/smith-grid";

export interface SmithChartCopy {
  inputTitle: string;
  frequencyLabel: string;
  referenceLabel: string;
  resistanceLabel: string;
  reactanceLabel: string;
  chartModeLabel: string;
  impedanceMode: string;
  admittanceMode: string;
  connectionLabel: string;
  seriesLabel: string;
  shuntLabel: string;
  componentLabel: string;
  valueLabel: string;
  addStepLabel: string;
  undoLabel: string;
  redoLabel: string;
  resetLabel: string;
  solveLabel: string;
  solutionsLabel: string;
  lowPassLabel: string;
  highPassLabel: string;
  idealLabel: string;
  roundedLabel: string;
  preferredSeriesLabel: string;
  selectSolutionLabel: string;
  exportLabel: string;
  copyUrlLabel: string;
  invalidInput: string;
  idealLimitNote: string;
  stepLabel: string;
  chart: SmithChartLabels;
  readout: SmithReadoutLabels;
}

interface VisualState {
  activePoint: SmithPoint;
  targetPoint: SmithPoint;
  paths: SmithPath[];
  readout: SmithReadout;
  impedance: Complex;
}

interface MatchView {
  ideal: MatchSolution;
  rounded: MatchSolution;
}

type Connection = NetworkStep["connection"];
type Component = NetworkStep["component"];

const STEP_KEYS = Array.from({ length: 20 }, (_, index) => `step${index}`);
const STATE_KEYS = ["mode", "frequency", "reference", "r", "x", ...STEP_KEYS] as const;

function parse(text: string): number | undefined {
  const result = parseEngineeringNumber(text);
  return result.ok ? result.value : undefined;
}

function decodeStep(value: string | undefined, index: number): NetworkStep | undefined {
  if (!value) return undefined;
  const [connection, component, rawValue] = value.split(",");
  const parsed = Number(rawValue);
  if ((connection !== "series" && connection !== "shunt") || !["R", "L", "C"].includes(component) || !Number.isFinite(parsed) || parsed <= 0) return undefined;
  return { id: `shared-${index}`, connection, component: component as Component, value: parsed };
}

function savedState() {
  if (typeof window === "undefined") return { values: {}, steps: [] as NetworkStep[] };
  const values = decodeToolState(window.location.search, STATE_KEYS);
  const steps = STEP_KEYS.flatMap((key, index) => {
    const step = decodeStep(values[key], index);
    return step ? [step] : [];
  });
  return { values, steps };
}

function encodeStep(step: NetworkStep): string {
  return `${step.connection},${step.component},${step.value}`;
}

function buildVisual(load: Complex, reference: number, frequency: number, steps: readonly NetworkStep[], labels = { series: "Series", shunt: "Shunt" }): VisualState | undefined {
  const loadPoint = smithPoint(load, reference);
  const targetPoint = smithPoint({ re: reference, im: 0 }, reference);
  if (!loadPoint.ok || !targetPoint.ok) return undefined;
  let impedance = load;
  const paths: SmithPath[] = [];
  for (const [index, step] of steps.entries()) {
    const sampled = sampleNetworkStep(impedance, step, frequency, reference);
    const applied = applyNetworkStep(impedance, step, frequency);
    if (!sampled.ok || !applied.ok) return undefined;
    paths.push({ id: step.id, label: `${index + 1}. ${step.connection === "series" ? labels.series : labels.shunt} ${step.component}`, points: sampled.value });
    impedance = applied.value;
  }
  const activePoint = smithPoint(impedance, reference);
  if (!activePoint.ok) return undefined;
  const readout = smithReadout(activePoint.value);
  if (!readout.ok) return undefined;
  return { activePoint: activePoint.value, targetPoint: targetPoint.value, paths, readout: readout.value, impedance };
}

function componentUnit(component: Component): string {
  if (component === "R") return "Ω";
  return component === "L" ? "H" : "F";
}

function stepText(step: NetworkStep, labels: { seriesLabel: string; shuntLabel: string }): string {
  return `${step.connection === "series" ? labels.seriesLabel : labels.shuntLabel} ${step.component} ${formatEngineering(step.value, { unit: componentUnit(step.component), significantDigits: 4 })}`;
}

function initialVisual(): VisualState {
  const value = buildVisual({ re: 25, im: 0 }, 50, 1e9, []);
  if (!value) throw new Error("Invalid Smith chart defaults");
  return value;
}

export function SmithChartApp({ copy }: { copy: SmithChartCopy }) {
  const [frequency, setFrequency] = useState("1G");
  const [reference, setReference] = useState("50");
  const [resistance, setResistance] = useState("25");
  const [reactance, setReactance] = useState("0");
  const [mode, setMode] = useState<SmithChartMode>("impedance");
  const [connection, setConnection] = useState<Connection>("series");
  const [component, setComponent] = useState<Component>("L");
  const [componentValue, setComponentValue] = useState("4n");
  const [history, setHistory] = useState(() => createHistory<NetworkStep[]>([]));
  const [hydrated, setHydrated] = useState(false);
  const [visual, setVisual] = useState(initialVisual);
  const [error, setError] = useState<string>();
  const [matches, setMatches] = useState<MatchView[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = savedState();
    setFrequency(saved.values.frequency ?? "1G");
    setReference(saved.values.reference ?? "50");
    setResistance(saved.values.r ?? "25");
    setReactance(saved.values.x ?? "0");
    setMode(saved.values.mode === "admittance" ? "admittance" : "impedance");
    setHistory(createHistory(saved.steps));
    setHydrated(true);
  }, []);

  useEffect(() => {
    const frequencyHz = parse(frequency);
    const referenceOhms = parse(reference);
    const re = parse(resistance);
    const im = parse(reactance);
    if (frequencyHz === undefined || referenceOhms === undefined || re === undefined || im === undefined || frequencyHz <= 0 || referenceOhms <= 0 || re < 0) {
      setError(copy.invalidInput);
      return;
    }
    const next = buildVisual({ re, im }, referenceOhms, frequencyHz, history.present, { series: copy.seriesLabel, shunt: copy.shuntLabel });
    if (!next) {
      setError(copy.invalidInput);
      return;
    }
    setError(undefined);
    setVisual(next);
  }, [copy.invalidInput, copy.seriesLabel, copy.shuntLabel, frequency, history.present, reactance, reference, resistance]);

  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) return;
    const state: Record<string, string> = { mode, frequency, reference, r: resistance, x: reactance };
    history.present.slice(0, 20).forEach((step, index) => { state[`step${index}`] = encodeStep(step); });
    const query = encodeToolState(state);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?${query}${window.location.hash}`);
  }, [frequency, history.present, hydrated, mode, reactance, reference, resistance]);

  function addStep() {
    const value = parse(componentValue);
    if (value === undefined || value <= 0 || history.present.length >= 20) {
      setError(copy.invalidInput);
      return;
    }
    const step: NetworkStep = { id: `manual-${Date.now()}-${history.present.length}`, connection, component, value };
    setHistory((current) => pushHistory(current, [...current.present, step]));
    setMatches([]);
  }

  function reset() {
    setFrequency("1G");
    setReference("50");
    setResistance("25");
    setReactance("0");
    setMode("impedance");
    setConnection("series");
    setComponent("L");
    setComponentValue("4n");
    setHistory(createHistory([]));
    setMatches([]);
  }

  function solve() {
    const frequencyHz = parse(frequency);
    const referenceOhms = parse(reference);
    const re = parse(resistance);
    const im = parse(reactance);
    if (frequencyHz === undefined || referenceOhms === undefined || re === undefined || im === undefined || re <= 0 || frequencyHz <= 0 || referenceOhms <= 0) {
      setError(copy.invalidInput);
      return;
    }
    const result = solveLMatch({ load: { re, im }, targetOhms: referenceOhms, frequencyHz });
    if (!result.ok) {
      setError(copy.invalidInput);
      return;
    }
    const views = result.value.flatMap((ideal) => {
      const rounded = roundMatchSolution(ideal, 24, { re, im }, referenceOhms, frequencyHz);
      return rounded.ok ? [{ ideal, rounded: rounded.value }] : [];
    });
    setMatches(views);
    setError(undefined);
  }

  function applySolution(solution: MatchSolution) {
    const steps = solution.steps.map((step, index) => ({ ...step, id: `match-${Date.now()}-${index}` }));
    setHistory((current) => pushHistory(current, steps));
  }

  async function exportPng() {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;
    await exportSmithChartPng(svg, {
      title: copy.chart.title,
      frequency: `${frequency} Hz`,
      reference: `${reference} Ω`,
      result: `${formatEngineering(visual.impedance.re, { unit: "Ω" })} ${visual.impedance.im < 0 ? "−" : "+"} j${formatEngineering(Math.abs(visual.impedance.im), { unit: "Ω" })}`,
    }, "smith-chart.png");
    track("Engineering Tool Action", { slug: "smith-chart", action: "export_png" });
  }

  async function copyUrl() {
    if (typeof navigator !== "undefined" && navigator.clipboard) await navigator.clipboard.writeText(window.location.href);
  }

  return <div className="space-y-6">
    <div className="grid gap-6 xl:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
      <section aria-label={copy.inputTitle} className="space-y-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <h2 className="text-lg font-semibold">{copy.inputTitle}</h2>
        <CalculatorField id="smith-frequency" label={copy.frequencyLabel} value={frequency} onChange={(event) => setFrequency(event.target.value)} unit="Hz" />
        <CalculatorField id="smith-reference" label={copy.referenceLabel} value={reference} onChange={(event) => setReference(event.target.value)} unit="Ω" />
        <CalculatorField id="smith-resistance" label={copy.resistanceLabel} value={resistance} onChange={(event) => setResistance(event.target.value)} unit="Ω" error={error} />
        <CalculatorField id="smith-reactance" label={copy.reactanceLabel} value={reactance} onChange={(event) => setReactance(event.target.value)} unit="Ω" />
        <label className="block space-y-2 text-sm font-medium">{copy.chartModeLabel}<select aria-label={copy.chartModeLabel} value={mode} onChange={(event) => setMode(event.target.value as SmithChartMode)} className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2">
          <option value="impedance">{copy.impedanceMode}</option><option value="admittance">{copy.admittanceMode}</option>
        </select></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-2 text-sm font-medium">{copy.connectionLabel}<select aria-label={copy.connectionLabel} value={connection} onChange={(event) => setConnection(event.target.value as Connection)} className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2"><option value="series">{copy.seriesLabel}</option><option value="shunt">{copy.shuntLabel}</option></select></label>
          <label className="space-y-2 text-sm font-medium">{copy.componentLabel}<select aria-label={copy.componentLabel} value={component} onChange={(event) => setComponent(event.target.value as Component)} className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2"><option value="R">R</option><option value="L">L</option><option value="C">C</option></select></label>
        </div>
        <CalculatorField id="smith-component-value" label={copy.valueLabel} value={componentValue} onChange={(event) => setComponentValue(event.target.value)} unit={componentUnit(component)} />
        <button type="button" onClick={addStep} className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2 font-medium text-white">{copy.addStepLabel}</button>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" disabled={!history.past.length} onClick={() => setHistory(undoHistory)} className="rounded-lg border border-[var(--color-border)] px-3 py-2 disabled:opacity-40">{copy.undoLabel}</button>
          <button type="button" disabled={!history.future.length} onClick={() => setHistory(redoHistory)} className="rounded-lg border border-[var(--color-border)] px-3 py-2 disabled:opacity-40">{copy.redoLabel}</button>
          <button type="button" onClick={reset} className="rounded-lg border border-[var(--color-border)] px-3 py-2">{copy.resetLabel}</button>
        </div>
        {history.present.length > 0 && <ol className="space-y-2 text-sm">{history.present.map((step, index) => <li key={step.id} className="rounded-lg bg-[var(--color-input-bg)] px-3 py-2">{copy.stepLabel} {index + 1} · {stepText(step, copy)}</li>)}</ol>}
        <button type="button" onClick={solve} className="w-full rounded-lg border border-[var(--color-accent)] px-4 py-2 font-medium text-[var(--color-accent)]">{copy.solveLabel}</button>
        <p className="text-xs text-[var(--color-muted)]">{copy.idealLimitNote}</p>
      </section>

      <div className="space-y-6">
        <section ref={chartRef} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <SmithChart mode={mode} paths={visual.paths} activePoint={visual.activePoint} targetPoint={visual.targetPoint} labels={copy.chart} />
        </section>
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5"><SmithReadoutTable readout={visual.readout} labels={copy.readout} /></section>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={exportPng} className="rounded-lg border border-[var(--color-border)] px-4 py-2">{copy.exportLabel}</button>
          <button type="button" onClick={copyUrl} className="rounded-lg border border-[var(--color-border)] px-4 py-2">{copy.copyUrlLabel}</button>
        </div>
      </div>
    </div>

    {matches.length > 0 && <section aria-label={copy.solutionsLabel} className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
      <h2 className="text-lg font-semibold">{copy.solutionsLabel}</h2>
      <div className="grid gap-4 md:grid-cols-2">{matches.map(({ ideal, rounded }) => <article key={ideal.id} className="space-y-3 rounded-xl border border-[var(--color-border)] p-4">
        <h3 className="font-semibold">{ideal.character === "low-pass" ? copy.lowPassLabel : copy.highPassLabel}</h3>
        <div><strong>{copy.idealLabel}</strong><ol className="mt-1 text-sm">{ideal.steps.map((step) => <li key={step.id}>{stepText(step, copy)}</li>)}</ol></div>
        <div><strong>{copy.roundedLabel}</strong><span className="ml-2 text-xs text-[var(--color-muted)]">{copy.preferredSeriesLabel}: E24</span><ol className="mt-1 text-sm">{rounded.steps.map((step) => <li key={step.id}>{stepText(step, copy)}</li>)}</ol></div>
        <button type="button" onClick={() => applySolution(rounded)} className="rounded-lg bg-[var(--color-accent)] px-4 py-2 font-medium text-white">{copy.selectSolutionLabel}</button>
      </article>)}</div>
    </section>}
  </div>;
}
