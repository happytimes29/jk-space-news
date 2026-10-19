"use client";

import { useEffect, useMemo, useState } from "react";
import { CalculatorField } from "./CalculatorField";
import { ResultPanel } from "./ResultPanel";
import { parseEngineeringNumber } from "@/lib/engineering/quantity";
import { powerWattsFromDbm, rfVoltageFromPower } from "@/lib/engineering/rf";
import { decodeToolState, encodeToolState } from "@/lib/engineering/query-state";

export interface EngineeringConverterCopy {
  generalTab: string;
  rfTab: string;
  valueLabel: string;
  fromUnitLabel: string;
  toUnitLabel: string;
  impedanceLabel: string;
  resultTitle: string;
  canonicalValueLabel: string;
  convertedValueLabel: string;
  powerLabel: string;
  voltageLabel: string;
  currentLabel: string;
  resetLabel: string;
  invalidNumber: string;
  invalidImpedance: string;
  incompatibleUnits: string;
}

type Mode = "general" | "rf";
type Dimension = "voltage" | "current" | "resistance" | "capacitance" | "inductance" | "frequency" | "time" | "power" | "length";

interface UnitDefinition {
  value: string;
  label: string;
  dimension: Dimension;
  factor: number;
  baseLabel: string;
}

const GENERAL_UNITS: readonly UnitDefinition[] = [
  { value: "V", label: "V", dimension: "voltage", factor: 1, baseLabel: "V" },
  { value: "mV", label: "mV", dimension: "voltage", factor: 1e-3, baseLabel: "V" },
  { value: "uV", label: "µV", dimension: "voltage", factor: 1e-6, baseLabel: "V" },
  { value: "A", label: "A", dimension: "current", factor: 1, baseLabel: "A" },
  { value: "mA", label: "mA", dimension: "current", factor: 1e-3, baseLabel: "A" },
  { value: "uA", label: "µA", dimension: "current", factor: 1e-6, baseLabel: "A" },
  { value: "ohm", label: "Ω", dimension: "resistance", factor: 1, baseLabel: "Ω" },
  { value: "kohm", label: "kΩ", dimension: "resistance", factor: 1e3, baseLabel: "Ω" },
  { value: "Mohm", label: "MΩ", dimension: "resistance", factor: 1e6, baseLabel: "Ω" },
  { value: "F", label: "F", dimension: "capacitance", factor: 1, baseLabel: "F" },
  { value: "uF", label: "µF", dimension: "capacitance", factor: 1e-6, baseLabel: "F" },
  { value: "nF", label: "nF", dimension: "capacitance", factor: 1e-9, baseLabel: "F" },
  { value: "pF", label: "pF", dimension: "capacitance", factor: 1e-12, baseLabel: "F" },
  { value: "H", label: "H", dimension: "inductance", factor: 1, baseLabel: "H" },
  { value: "mH", label: "mH", dimension: "inductance", factor: 1e-3, baseLabel: "H" },
  { value: "uH", label: "µH", dimension: "inductance", factor: 1e-6, baseLabel: "H" },
  { value: "nH", label: "nH", dimension: "inductance", factor: 1e-9, baseLabel: "H" },
  { value: "Hz", label: "Hz", dimension: "frequency", factor: 1, baseLabel: "Hz" },
  { value: "kHz", label: "kHz", dimension: "frequency", factor: 1e3, baseLabel: "Hz" },
  { value: "MHz", label: "MHz", dimension: "frequency", factor: 1e6, baseLabel: "Hz" },
  { value: "GHz", label: "GHz", dimension: "frequency", factor: 1e9, baseLabel: "Hz" },
  { value: "s", label: "s", dimension: "time", factor: 1, baseLabel: "s" },
  { value: "ms", label: "ms", dimension: "time", factor: 1e-3, baseLabel: "s" },
  { value: "us", label: "µs", dimension: "time", factor: 1e-6, baseLabel: "s" },
  { value: "ns", label: "ns", dimension: "time", factor: 1e-9, baseLabel: "s" },
  { value: "W", label: "W", dimension: "power", factor: 1, baseLabel: "W" },
  { value: "mW", label: "mW", dimension: "power", factor: 1e-3, baseLabel: "W" },
  { value: "kW", label: "kW", dimension: "power", factor: 1e3, baseLabel: "W" },
  { value: "m", label: "m", dimension: "length", factor: 1, baseLabel: "m" },
  { value: "mm", label: "mm", dimension: "length", factor: 1e-3, baseLabel: "m" },
  { value: "um", label: "µm", dimension: "length", factor: 1e-6, baseLabel: "m" },
  { value: "mil", label: "mil", dimension: "length", factor: 25.4e-6, baseLabel: "m" },
  { value: "in", label: "in", dimension: "length", factor: 0.0254, baseLabel: "m" },
] as const;

const RF_UNITS = ["dBm", "dBW", "W", "mW", "Vrms", "Vpeak", "Vpp", "Irms"] as const;
type RfUnit = (typeof RF_UNITS)[number];

interface GeneralResult {
  canonical: number;
  converted: number;
  baseLabel: string;
  outputLabel: string;
}

interface RfResult {
  watts: number;
  dbm: number;
  dbw: number;
  vrms: number;
  vpeak: number;
  vpp: number;
  irms: number;
}

const DEFAULT_GENERAL = { value: "4k7", from: "ohm", to: "kohm" };
const DEFAULT_RF = { value: "0", from: "dBm" as RfUnit, impedance: "50" };
const STATE_KEYS = ["mode", "value", "from", "to", "impedance"] as const;

function unit(value: string): UnitDefinition | undefined {
  return GENERAL_UNITS.find((candidate) => candidate.value === value);
}

function decimal(value: number, significantDigits = 9): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  return Number(value.toPrecision(significantDigits)).toString();
}

function initialState() {
  if (typeof window === "undefined") return {};
  return decodeToolState(window.location.search, STATE_KEYS);
}

function rfWatts(value: number, inputUnit: RfUnit, impedanceOhms: number): number | null {
  switch (inputUnit) {
    case "dBm": {
      const result = powerWattsFromDbm(value);
      return result.ok ? result.value : null;
    }
    case "dBW": return 10 ** (value / 10);
    case "W": return value > 0 ? value : null;
    case "mW": return value > 0 ? value / 1_000 : null;
    case "Vrms": return value > 0 ? value ** 2 / impedanceOhms : null;
    case "Vpeak": return value > 0 ? value ** 2 / (2 * impedanceOhms) : null;
    case "Vpp": return value > 0 ? value ** 2 / (8 * impedanceOhms) : null;
    case "Irms": return value > 0 ? value ** 2 * impedanceOhms : null;
  }
}

export function EngineeringConverterApp({ copy }: { copy: EngineeringConverterCopy }) {
  const saved = useMemo(initialState, []);
  const initialMode: Mode = saved.mode === "rf" ? "rf" : "general";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [generalValue, setGeneralValue] = useState(initialMode === "general" && saved.value ? saved.value : DEFAULT_GENERAL.value);
  const [fromUnit, setFromUnit] = useState(initialMode === "general" && unit(saved.from) ? saved.from : DEFAULT_GENERAL.from);
  const [toUnit, setToUnit] = useState(initialMode === "general" && unit(saved.to) ? saved.to : DEFAULT_GENERAL.to);
  const [rfValue, setRfValue] = useState(initialMode === "rf" && saved.value ? saved.value : DEFAULT_RF.value);
  const [rfUnit, setRfUnit] = useState<RfUnit>(initialMode === "rf" && RF_UNITS.includes(saved.from as RfUnit) ? saved.from as RfUnit : DEFAULT_RF.from);
  const [impedance, setImpedance] = useState(initialMode === "rf" && saved.impedance ? saved.impedance : DEFAULT_RF.impedance);
  const [valueError, setValueError] = useState<string>();
  const [impedanceError, setImpedanceError] = useState<string>();
  const [generalResult, setGeneralResult] = useState<GeneralResult>({ canonical: 4_700, converted: 4.7, baseLabel: "Ω", outputLabel: "kΩ" });
  const [rfResult, setRfResult] = useState<RfResult>({ watts: 0.001, dbm: 0, dbw: -30, vrms: Math.sqrt(0.05), vpeak: Math.sqrt(0.1), vpp: 2 * Math.sqrt(0.1), irms: Math.sqrt(0.001 / 50) });

  useEffect(() => {
    if (mode !== "general") return;
    const parsed = parseEngineeringNumber(generalValue);
    const from = unit(fromUnit);
    const to = unit(toUnit);
    if (!parsed.ok) {
      setValueError(copy.invalidNumber);
      return;
    }
    if (!from || !to || from.dimension !== to.dimension) {
      setValueError(copy.incompatibleUnits);
      return;
    }
    setValueError(undefined);
    const canonical = parsed.value * from.factor;
    setGeneralResult({ canonical, converted: canonical / to.factor, baseLabel: from.baseLabel, outputLabel: to.label });
  }, [copy.incompatibleUnits, copy.invalidNumber, fromUnit, generalValue, mode, toUnit]);

  useEffect(() => {
    if (mode !== "rf") return;
    const parsedValue = parseEngineeringNumber(rfValue);
    const parsedImpedance = parseEngineeringNumber(impedance);
    setValueError(parsedValue.ok ? undefined : copy.invalidNumber);
    setImpedanceError(parsedImpedance.ok && parsedImpedance.value > 0 ? undefined : copy.invalidImpedance);
    if (!parsedValue.ok || !parsedImpedance.ok || parsedImpedance.value <= 0) return;
    const watts = rfWatts(parsedValue.value, rfUnit, parsedImpedance.value);
    if (watts === null || !Number.isFinite(watts) || watts <= 0) {
      setValueError(copy.invalidNumber);
      return;
    }
    const voltage = rfVoltageFromPower({ watts, impedanceOhms: parsedImpedance.value });
    if (!voltage.ok) return;
    setRfResult({
      watts,
      dbm: 10 * Math.log10(watts) + 30,
      dbw: 10 * Math.log10(watts),
      vrms: voltage.value.vrms,
      vpeak: voltage.value.vPeak,
      vpp: voltage.value.vPeakToPeak,
      irms: voltage.value.iRms,
    });
  }, [copy.invalidImpedance, copy.invalidNumber, impedance, mode, rfUnit, rfValue]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = mode === "general"
      ? encodeToolState({ mode, value: generalValue, from: fromUnit, to: toUnit })
      : encodeToolState({ mode, value: rfValue, from: rfUnit, impedance });
    const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", next);
  }, [fromUnit, generalValue, impedance, mode, rfUnit, rfValue, toUnit]);

  function reset() {
    setValueError(undefined);
    setImpedanceError(undefined);
    if (mode === "general") {
      setGeneralValue(DEFAULT_GENERAL.value);
      setFromUnit(DEFAULT_GENERAL.from);
      setToUnit(DEFAULT_GENERAL.to);
    } else {
      setRfValue(DEFAULT_RF.value);
      setRfUnit(DEFAULT_RF.from);
      setImpedance(DEFAULT_RF.impedance);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="space-y-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div role="tablist" className="grid grid-cols-2 rounded-lg bg-[var(--color-input-bg)] p-1">
          <button type="button" role="tab" aria-selected={mode === "general"} onClick={() => setMode("general")} className={`rounded-md px-3 py-2 text-sm font-medium ${mode === "general" ? "bg-[var(--color-card)] shadow-sm" : "text-[var(--color-muted)]"}`}>{copy.generalTab}</button>
          <button type="button" role="tab" aria-selected={mode === "rf"} onClick={() => setMode("rf")} className={`rounded-md px-3 py-2 text-sm font-medium ${mode === "rf" ? "bg-[var(--color-card)] shadow-sm" : "text-[var(--color-muted)]"}`}>{copy.rfTab}</button>
        </div>

        {mode === "general" ? <>
          <CalculatorField id="converter-value" label={copy.valueLabel} value={generalValue} onChange={(event) => setGeneralValue(event.target.value)} error={valueError} inputMode="decimal" />
          <label className="block space-y-2 text-sm font-medium">{copy.fromUnitLabel}
            <select aria-label={copy.fromUnitLabel} value={fromUnit} onChange={(event) => setFromUnit(event.target.value)} className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2">
              {GENERAL_UNITS.map((candidate) => <option key={candidate.value} value={candidate.value}>{candidate.label}</option>)}
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium">{copy.toUnitLabel}
            <select aria-label={copy.toUnitLabel} value={toUnit} onChange={(event) => setToUnit(event.target.value)} className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2">
              {GENERAL_UNITS.map((candidate) => <option key={candidate.value} value={candidate.value}>{candidate.label}</option>)}
            </select>
          </label>
        </> : <>
          <CalculatorField id="rf-converter-value" label={copy.valueLabel} value={rfValue} onChange={(event) => setRfValue(event.target.value)} error={valueError} inputMode="decimal" />
          <label className="block space-y-2 text-sm font-medium">{copy.fromUnitLabel}
            <select aria-label={copy.fromUnitLabel} value={rfUnit} onChange={(event) => setRfUnit(event.target.value as RfUnit)} className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2">
              {RF_UNITS.map((candidate) => <option key={candidate}>{candidate}</option>)}
            </select>
          </label>
          <CalculatorField id="rf-impedance" label={copy.impedanceLabel} value={impedance} onChange={(event) => setImpedance(event.target.value)} error={impedanceError} unit="Ω" inputMode="decimal" />
        </>}
        <button type="button" onClick={reset} className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-card-hover)]">{copy.resetLabel}</button>
      </section>

      <ResultPanel title={copy.resultTitle}>
        {mode === "general" ? (
          <dl className="space-y-4">
            <div><dt className="text-sm text-[var(--color-muted)]">{copy.canonicalValueLabel}</dt><dd className="mt-1 font-mono text-lg">{decimal(generalResult.canonical)} {generalResult.baseLabel}</dd></div>
            <div><dt className="text-sm text-[var(--color-muted)]">{copy.convertedValueLabel}</dt><dd className="mt-1 font-mono text-lg">{decimal(generalResult.converted)} {generalResult.outputLabel}</dd></div>
          </dl>
        ) : (
          <dl className="space-y-4">
            <div><dt className="text-sm text-[var(--color-muted)]">{copy.powerLabel}</dt><dd className="mt-1 space-y-1 font-mono"><span className="block">{decimal(rfResult.watts * 1_000)} mW</span><span className="block">{decimal(rfResult.watts)} W · {decimal(rfResult.dbm)} dBm · {decimal(rfResult.dbw)} dBW</span></dd></div>
            <div><dt className="text-sm text-[var(--color-muted)]">{copy.voltageLabel}</dt><dd className="mt-1 font-mono">{decimal(rfResult.vrms * 1_000, 6)} mVrms · {decimal(rfResult.vpeak * 1_000, 6)} mVpeak · {decimal(rfResult.vpp * 1_000, 6)} mVpp</dd></div>
            <div><dt className="text-sm text-[var(--color-muted)]">{copy.currentLabel}</dt><dd className="mt-1 font-mono">{decimal(rfResult.irms * 1_000, 6)} mArms</dd></div>
          </dl>
        )}
      </ResultPanel>
    </div>
  );
}
