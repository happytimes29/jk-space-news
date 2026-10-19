"use client";

import { useEffect, useState } from "react";
import { CalculatorField } from "../CalculatorField";
import { formatEngineering } from "@/lib/engineering/quantity";
import { suggestDivider, type DividerCandidate } from "@/lib/engineering/passive";
import type { ESeries } from "@/lib/engineering/standard-values";
import { ModeLayout, parsed, ResultRow, SelectField } from "./shared";
import type { PassiveModeProps } from "./types";

function initialCandidates(): DividerCandidate[] {
  const result = suggestDivider({ vin: 3.3, targetVout: 1.8, series: 24 });
  return result.ok ? result.value : [];
}

export function DividerMode({ copy, initial, onStateChange }: PassiveModeProps) {
  const [vin, setVin] = useState(initial.vin ?? "3.3");
  const [target, setTarget] = useState(initial.target ?? "1.8");
  const [series, setSeries] = useState<ESeries>([12, 24, 48, 96].includes(Number(initial.series)) ? Number(initial.series) as ESeries : 24);
  const [loadEnabled, setLoadEnabled] = useState(Boolean(initial.load));
  const [load, setLoad] = useState(initial.load ?? "100k");
  const [error, setError] = useState<string>();
  const [candidates, setCandidates] = useState(initialCandidates);

  useEffect(() => {
    onStateChange({ vin, target, series, ...(loadEnabled ? { load } : {}) });
    const vinValue = parsed(vin);
    const targetValue = parsed(target);
    const loadValue = loadEnabled ? parsed(load) : undefined;
    if (vinValue === undefined || targetValue === undefined || (loadEnabled && loadValue === undefined)) {
      setError(copy.errorLabel);
      return;
    }
    const result = suggestDivider({ vin: vinValue, targetVout: targetValue, series, loadOhms: loadValue });
    if (!result.ok || result.value.length === 0) {
      setError(result.ok ? copy.noSolutionLabel : copy.errorLabel);
      return;
    }
    setError(undefined);
    setCandidates(result.value);
  }, [copy.errorLabel, copy.noSolutionLabel, load, loadEnabled, onStateChange, series, target, vin]);

  const best = candidates[0];
  return <ModeLayout inputTitle={copy.inputTitle} resultTitle={copy.resultTitle} inputs={<>
    <CalculatorField id="divider-vin" label={copy.vinLabel} value={vin} onChange={(event) => setVin(event.target.value)} unit="V" />
    <CalculatorField id="divider-target" label={copy.targetVoutLabel} value={target} onChange={(event) => setTarget(event.target.value)} unit="V" error={error} />
    <SelectField label={copy.seriesLabel} value={String(series)} onChange={(value) => setSeries(Number(value) as ESeries)}>{[12, 24, 48, 96].map((value) => <option key={value} value={value}>E{value}</option>)}</SelectField>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={loadEnabled} onChange={(event) => setLoadEnabled(event.target.checked)} />{copy.enableLoadLabel}</label>
    {loadEnabled && <CalculatorField id="divider-load" label={copy.loadLabel} value={load} onChange={(event) => setLoad(event.target.value)} unit="Ω" error={error} />}
  </>} results={<dl className="space-y-4">
    <ResultRow label={copy.targetVoutLabel}>{target} V · E{series}</ResultRow>
    <ResultRow label={copy.bestCandidateLabel}><span data-testid="best-divider">{formatEngineering(best.rTopOhms, { unit: "Ω" })} / {formatEngineering(best.rBottomOhms, { unit: "Ω" })}</span></ResultRow>
    <ResultRow label={copy.actualOutputLabel}>{formatEngineering(best.vout, { unit: "V" })}</ResultRow>
  </dl>} />;
}
