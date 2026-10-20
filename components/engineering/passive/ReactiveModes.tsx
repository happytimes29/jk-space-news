"use client";

import { useEffect, useState } from "react";
import { CalculatorField } from "../CalculatorField";
import { formatEngineering } from "@/lib/engineering/quantity";
import {
  capacitiveReactanceOhms,
  inductiveReactanceOhms,
  lcResonanceHz,
  parallelRlc,
  rcCutoffHz,
  rcTimeConstantSeconds,
  seriesRlc,
} from "@/lib/engineering/passive";
import { ModeLayout, parsed, ResultRow, SelectField } from "./shared";
import { RcDiagram } from "./RcDiagram";
import { LcDiagram } from "./LcDiagram";
import { RlcDiagram } from "./RlcDiagram";
import type { PassiveCircuitCopy, PassiveMode, PassiveModeProps } from "./types";

function Fields({ copy, values, set, error, mode }: { copy: PassiveCircuitCopy; values: Record<string, string>; set: (key: string, value: string) => void; error?: string; mode: PassiveMode }) {
  return <>
    {(mode === "rc" || mode === "rlc") && <CalculatorField id={`${mode}-r`} label={copy.resistanceLabel} value={values.r} onChange={(event) => set("r", event.target.value)} unit="Ω" error={error} />}
    {(mode === "lc" || mode === "rlc" || mode === "reactance") && <CalculatorField id={`${mode}-l`} label={copy.inductanceLabel} value={values.l} onChange={(event) => set("l", event.target.value)} unit="H" error={error} />}
    {(mode === "rc" || mode === "lc" || mode === "rlc" || mode === "reactance") && <CalculatorField id={`${mode}-c`} label={copy.capacitanceLabel} value={values.c} onChange={(event) => set("c", event.target.value)} unit="F" error={error} />}
    {mode === "reactance" && <CalculatorField id="reactance-f" label={copy.frequencyLabel} value={values.f} onChange={(event) => set("f", event.target.value)} unit="Hz" error={error} />}
  </>;
}

export function ReactiveMode({ copy, initial, onStateChange, mode }: PassiveModeProps & { mode: "rc" | "lc" | "rlc" | "reactance" }) {
  const defaults: Record<string, string> = mode === "rc" ? { r: "1k", c: "100n" }
    : mode === "lc" ? { l: "10n", c: "1p" }
      : mode === "rlc" ? { r: "10", l: "10u", c: "100n", circuit: "series" }
        : { f: "1G", l: "10n", c: "1p" };
  const [values, setValues] = useState<Record<string, string>>({ ...defaults, ...Object.fromEntries(Object.keys(defaults).flatMap((key) => initial[key] ? [[key, initial[key]]] : [])) });
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<Record<string, number>>(() => calculate(mode, defaults) ?? {});

  useEffect(() => {
    onStateChange(values);
    const calculated = calculate(mode, values);
    if (!calculated) {
      setError(copy.errorLabel);
      return;
    }
    setError(undefined);
    setResult(calculated);
  }, [copy.errorLabel, mode, onStateChange, values]);

  const set = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const diagramValue = (value: number | undefined, unit: string) => value === undefined ? "—" : formatEngineering(value, { unit });
  return <ModeLayout inputTitle={copy.inputTitle} resultTitle={copy.resultTitle} inputs={<>
    <Fields copy={copy} values={values} set={set} error={error} mode={mode} />
    {mode === "rlc" && <SelectField label={copy.circuitTypeLabel} value={values.circuit} onChange={(value) => set("circuit", value)}><option value="series">{copy.seriesCircuitLabel}</option><option value="parallel">{copy.parallelCircuitLabel}</option></SelectField>}
  </>} results={<>
    {mode === "rc" && <RcDiagram
      label={copy.rcDiagramLabel}
      resistance={diagramValue(parsed(values.r), "Ω")}
      capacitance={diagramValue(parsed(values.c), "F")}
      cutoff={formatEngineering(result.cutoff, { unit: "Hz" })}
      timeConstant={formatEngineering(result.time, { unit: "s" })}
    />}
    {mode === "lc" && <LcDiagram
      label={copy.lcDiagramLabel}
      inductance={diagramValue(parsed(values.l), "H")}
      capacitance={diagramValue(parsed(values.c), "F")}
      resonance={formatEngineering(result.resonance, { unit: "Hz" })}
    />}
    {mode === "rlc" && <RlcDiagram
      label={copy.rlcDiagramLabel}
      topology={values.circuit === "parallel" ? "parallel" : "series"}
      topologyLabel={values.circuit === "parallel" ? copy.parallelCircuitLabel : copy.seriesCircuitLabel}
      resistance={diagramValue(parsed(values.r), "Ω")}
      inductance={diagramValue(parsed(values.l), "H")}
      capacitance={diagramValue(parsed(values.c), "F")}
      resonance={formatEngineering(result.resonance, { unit: "Hz" })}
      quality={formatEngineering(result.q)}
      bandwidth={formatEngineering(result.bandwidth, { unit: "Hz" })}
    />}
    <dl className="space-y-4">
    {mode === "rc" && <><ResultRow label={copy.cutoffLabel}>{formatEngineering(result.cutoff, { unit: "Hz" })}</ResultRow><ResultRow label={copy.timeConstantLabel}>{formatEngineering(result.time, { unit: "s" })}</ResultRow></>}
    {(mode === "lc" || mode === "rlc") && <ResultRow label={copy.resonanceLabel}>{formatEngineering(result.resonance, { unit: "Hz" })}</ResultRow>}
    {mode === "rlc" && <><ResultRow label={copy.qualityLabel}>{formatEngineering(result.q)}</ResultRow><ResultRow label={copy.bandwidthLabel}>{formatEngineering(result.bandwidth, { unit: "Hz" })}</ResultRow></>}
    {mode === "reactance" && <><ResultRow label={copy.inductiveReactanceLabel}>{formatEngineering(result.xl, { unit: "Ω" })}</ResultRow><ResultRow label={copy.capacitiveReactanceLabel}>{formatEngineering(result.xc, { unit: "Ω" })}</ResultRow></>}
    </dl>
  </>} />;
}

function calculate(mode: "rc" | "lc" | "rlc" | "reactance", values: Record<string, string>): Record<string, number> | null {
  const r = values.r === undefined ? undefined : parsed(values.r);
  const l = values.l === undefined ? undefined : parsed(values.l);
  const c = values.c === undefined ? undefined : parsed(values.c);
  const f = values.f === undefined ? undefined : parsed(values.f);
  if (mode === "rc") {
    if (r === undefined || c === undefined) return null;
    const cutoff = rcCutoffHz({ resistanceOhms: r, capacitanceF: c });
    const time = rcTimeConstantSeconds({ resistanceOhms: r, capacitanceF: c });
    return cutoff.ok && time.ok ? { cutoff: cutoff.value, time: time.value } : null;
  }
  if (mode === "lc") {
    if (l === undefined || c === undefined) return null;
    const resonance = lcResonanceHz({ inductanceH: l, capacitanceF: c });
    return resonance.ok ? { resonance: resonance.value } : null;
  }
  if (mode === "rlc") {
    if (r === undefined || l === undefined || c === undefined) return null;
    const calculation = values.circuit === "parallel" ? parallelRlc : seriesRlc;
    const rlc = calculation({ resistanceOhms: r, inductanceH: l, capacitanceF: c });
    return rlc.ok ? { resonance: rlc.value.resonanceHz, q: rlc.value.q, bandwidth: rlc.value.bandwidthHz } : null;
  }
  if (f === undefined || l === undefined || c === undefined) return null;
  const xl = inductiveReactanceOhms({ frequencyHz: f, inductanceH: l });
  const xc = capacitiveReactanceOhms({ frequencyHz: f, capacitanceF: c });
  return xl.ok && xc.ok ? { xl: xl.value, xc: xc.value } : null;
}
