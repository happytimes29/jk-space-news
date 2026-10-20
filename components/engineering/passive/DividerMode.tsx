"use client";

import { useEffect, useState } from "react";
import { CalculatorField } from "../CalculatorField";
import { formatEngineering } from "@/lib/engineering/quantity";
import { dividerWorstCase, loadedDivider, suggestDivider, type DividerCandidate, type DividerResult } from "@/lib/engineering/passive";
import type { ESeries } from "@/lib/engineering/standard-values";
import { ModeLayout, parsed, ResultRow, SelectField } from "./shared";
import { DividerDiagram } from "./DividerDiagram";
import type { PassiveModeProps } from "./types";

function initialCandidates(): DividerCandidate[] {
  const result = suggestDivider({ vin: 3.3, targetVout: 1.8, series: 24 });
  return result.ok ? result.value : [];
}

export function DividerMode({ copy, initial, onStateChange }: PassiveModeProps) {
  const [dividerMode, setDividerMode] = useState<"design" | "evaluate">(initial.dividerMode === "evaluate" ? "evaluate" : "design");
  const [vin, setVin] = useState(initial.vin ?? "3.3");
  const [target, setTarget] = useState(initial.target ?? "1.8");
  const [rTop, setRTop] = useState(initial.rTop ?? "15k");
  const [rBottom, setRBottom] = useState(initial.rBottom ?? "18k");
  const [tolerance, setTolerance] = useState(initial.tolerance ?? "1");
  const [series, setSeries] = useState<ESeries>([12, 24, 48, 96].includes(Number(initial.series)) ? Number(initial.series) as ESeries : 24);
  const [loadEnabled, setLoadEnabled] = useState(Boolean(initial.load));
  const [load, setLoad] = useState(initial.load ?? "100k");
  const [error, setError] = useState<string>();
  const [candidates, setCandidates] = useState(initialCandidates);
  const [operating, setOperating] = useState<DividerResult>(() => {
    const result = loadedDivider({ vin: 3.3, rTopOhms: 15e3, rBottomOhms: 18e3 });
    if (!result.ok) throw new Error("invalid divider defaults");
    return result.value;
  });
  const [worstCase, setWorstCase] = useState({ minVout: 1.782, maxVout: 1.818 });

  useEffect(() => {
    onStateChange({ dividerMode, vin, target, rTop, rBottom, tolerance, series, ...(loadEnabled ? { load } : {}) });
    const vinValue = parsed(vin);
    const targetValue = parsed(target), topValue = parsed(rTop), bottomValue = parsed(rBottom), toleranceValue = parsed(tolerance);
    const loadValue = loadEnabled ? parsed(load) : undefined;
    if (vinValue === undefined || toleranceValue === undefined || (loadEnabled && loadValue === undefined)
      || (dividerMode === "design" ? targetValue === undefined : topValue === undefined || bottomValue === undefined)) {
      setError(copy.errorLabel);
      return;
    }
    let selectedTop = topValue, selectedBottom = bottomValue;
    if (dividerMode === "design") {
      const suggested = suggestDivider({ vin: vinValue, targetVout: targetValue!, series, loadOhms: loadValue });
      if (!suggested.ok || suggested.value.length === 0) {
        setError(suggested.ok ? copy.noSolutionLabel : copy.errorLabel);
        return;
      }
      setCandidates(suggested.value);
      selectedTop = suggested.value[0].rTopOhms;
      selectedBottom = suggested.value[0].rBottomOhms;
    }
    const next = loadedDivider({ vin: vinValue, rTopOhms: selectedTop!, rBottomOhms: selectedBottom!, loadOhms: loadValue });
    const limits = dividerWorstCase({ vin: vinValue, rTopOhms: selectedTop!, rBottomOhms: selectedBottom!, tolerancePercent: toleranceValue, loadOhms: loadValue });
    if (!next.ok || !limits.ok) {
      setError(copy.errorLabel);
      return;
    }
    setError(undefined);
    setOperating(next.value);
    setWorstCase(limits.value);
  }, [copy.errorLabel, copy.noSolutionLabel, dividerMode, load, loadEnabled, onStateChange, rBottom, rTop, series, target, tolerance, vin]);

  const best = candidates[0];
  const diagramTop = dividerMode === "design" ? best.rTopOhms : parsed(rTop);
  const diagramBottom = dividerMode === "design" ? best.rBottomOhms : parsed(rBottom);
  const diagramLoad = loadEnabled ? parsed(load) : undefined;
  const diagramValue = (value: number | undefined, unit: string) => value === undefined ? "—" : formatEngineering(value, { unit });
  return <ModeLayout inputTitle={copy.inputTitle} resultTitle={copy.resultTitle} inputs={<>
    <SelectField label={copy.dividerModeLabel} value={dividerMode} onChange={(value) => setDividerMode(value as "design" | "evaluate")}><option value="design">{copy.designLabel}</option><option value="evaluate">{copy.evaluateLabel}</option></SelectField>
    <CalculatorField id="divider-vin" label={copy.vinLabel} value={vin} onChange={(event) => setVin(event.target.value)} unit="V" />
    {dividerMode === "design" ? <><CalculatorField id="divider-target" label={copy.targetVoutLabel} value={target} onChange={(event) => setTarget(event.target.value)} unit="V" error={error} />
    <SelectField label={copy.seriesLabel} value={String(series)} onChange={(value) => setSeries(Number(value) as ESeries)}>{[12, 24, 48, 96].map((value) => <option key={value} value={value}>E{value}</option>)}</SelectField></> : <><CalculatorField id="divider-top" label={copy.topResistanceLabel} value={rTop} onChange={(event) => setRTop(event.target.value)} unit="Ω" error={error} /><CalculatorField id="divider-bottom" label={copy.bottomResistanceLabel} value={rBottom} onChange={(event) => setRBottom(event.target.value)} unit="Ω" error={error} /></>}
    <CalculatorField id="divider-tolerance" label={copy.toleranceLabel} value={tolerance} onChange={(event) => setTolerance(event.target.value)} unit="%" />
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={loadEnabled} onChange={(event) => setLoadEnabled(event.target.checked)} />{copy.enableLoadLabel}</label>
    {loadEnabled && <CalculatorField id="divider-load" label={copy.loadLabel} value={load} onChange={(event) => setLoad(event.target.value)} unit="Ω" error={error} />}
  </>} results={<>
    <DividerDiagram
      label={copy.dividerDiagramLabel}
      vin={diagramValue(parsed(vin), "V")}
      rTop={diagramValue(diagramTop, "Ω")}
      rBottom={diagramValue(diagramBottom, "Ω")}
      vout={formatEngineering(operating.vout, { unit: "V" })}
      load={diagramLoad === undefined ? undefined : diagramValue(diagramLoad, "Ω")}
    />
    <dl className="space-y-4">
    {dividerMode === "design" && <><ResultRow label={copy.targetVoutLabel}>{target} V · E{series}</ResultRow>
    <ResultRow label={copy.bestCandidateLabel}><span data-testid="best-divider">{formatEngineering(best.rTopOhms, { unit: "Ω" })} / {formatEngineering(best.rBottomOhms, { unit: "Ω" })}</span></ResultRow>
    <ResultRow label={copy.relativeErrorLabel}>{formatEngineering(best.relativeVoltageError * 100, { unit: "%" })}</ResultRow></>}
    <ResultRow label={copy.actualOutputLabel}>{formatEngineering(operating.vout, { unit: "V" })}</ResultRow>
    <ResultRow label={copy.branchCurrentLabel}>{formatEngineering(operating.branchCurrentA, { unit: "A" })}</ResultRow>
    <ResultRow label={copy.topPowerLabel}>{formatEngineering(operating.rTopPowerW, { unit: "W" })}</ResultRow>
    <ResultRow label={copy.bottomPowerLabel}>{formatEngineering(operating.rBottomPowerW, { unit: "W" })}</ResultRow>
    <ResultRow label={copy.worstCaseLabel}>{formatEngineering(worstCase.minVout, { unit: "V" })} – {formatEngineering(worstCase.maxVout, { unit: "V" })}</ResultRow>
    {dividerMode === "design" && <ResultRow label={copy.candidateListLabel}><ol className="space-y-1">{candidates.slice(0, 5).map((candidate) => <li key={`${candidate.rTopOhms}:${candidate.rBottomOhms}`}>{formatEngineering(candidate.rTopOhms, { unit: "Ω" })} / {formatEngineering(candidate.rBottomOhms, { unit: "Ω" })} · {formatEngineering(candidate.vout, { unit: "V" })} · {formatEngineering(candidate.relativeVoltageError * 100, { unit: "%" })}</li>)}</ol></ResultRow>}
    </dl>
  </>} />;
}
