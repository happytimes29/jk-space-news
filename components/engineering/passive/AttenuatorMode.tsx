"use client";

import { useEffect, useState } from "react";
import { CalculatorField } from "../CalculatorField";
import { formatEngineering } from "@/lib/engineering/quantity";
import { symmetricAttenuator, type AttenuatorResult } from "@/lib/engineering/passive";
import { ModeLayout, parsed, ResultRow, SelectField } from "./shared";
import { AttenuatorDiagram } from "./AttenuatorDiagram";
import type { PassiveModeProps } from "./types";

function initialResult(): AttenuatorResult {
  const result = symmetricAttenuator({ topology: "tee", attenuationDb: 6, impedanceOhms: 50 });
  if (!result.ok) throw new Error("invalid attenuator example");
  return result.value;
}

export function AttenuatorMode({ copy, initial, onStateChange }: PassiveModeProps) {
  const [attenuation, setAttenuation] = useState(initial.attenuation ?? "6");
  const [z0, setZ0] = useState(initial.z0 ?? "50");
  const [topology, setTopology] = useState<"tee" | "pi">(initial.topology === "pi" ? "pi" : "tee");
  const [inputPower, setInputPower] = useState(initial.inputPower ?? "1");
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<AttenuatorResult>(initialResult);

  useEffect(() => {
    onStateChange({ attenuation, z0, topology, inputPower });
    const attenuationDb = parsed(attenuation);
    const impedanceOhms = parsed(z0);
    const inputPowerWatts = parsed(inputPower);
    if (attenuationDb === undefined || impedanceOhms === undefined || inputPowerWatts === undefined) {
      setError(copy.errorLabel);
      return;
    }
    const next = symmetricAttenuator({ topology, attenuationDb, impedanceOhms, inputPowerWatts });
    if (!next.ok) {
      setError(copy.errorLabel);
      return;
    }
    setError(undefined);
    setResult(next.value);
  }, [attenuation, copy.errorLabel, inputPower, onStateChange, topology, z0]);

  const diagramValue = (value: string, unit: string) => {
    const parsedValue = parsed(value);
    return parsedValue === undefined ? "—" : formatEngineering(parsedValue, { unit });
  };
  const seriesResistance = result.topology === "tee" ? result.resistorsOhms.seriesEach : result.resistorsOhms.series;
  const shuntResistance = result.topology === "tee" ? result.resistorsOhms.shunt : result.resistorsOhms.shuntEach;
  const r1 = result.topology === "tee" ? seriesResistance : shuntResistance;
  const r2 = result.topology === "tee" ? shuntResistance : seriesResistance;
  const r3 = r1;

  return <ModeLayout inputTitle={copy.inputTitle} resultTitle={copy.resultTitle} inputs={<>
    <CalculatorField id="attenuation-db" label={copy.attenuationLabel} value={attenuation} onChange={(event) => setAttenuation(event.target.value)} unit="dB" error={error} />
    <CalculatorField id="attenuator-z0" label={copy.impedanceLabel} value={z0} onChange={(event) => setZ0(event.target.value)} unit="Ω" error={error} />
    <CalculatorField id="attenuator-power" label={copy.inputPowerLabel} value={inputPower} onChange={(event) => setInputPower(event.target.value)} unit="W" error={error} />
    <SelectField label={copy.topologyLabel} value={topology} onChange={(value) => setTopology(value as "tee" | "pi")}><option value="tee">{copy.teeLabel}</option><option value="pi">{copy.piLabel}</option></SelectField>
  </>} results={<div className="space-y-4"><AttenuatorDiagram
    label={copy.attenuatorDiagramLabel}
    topology={result.topology}
    topologyLabel={result.topology === "tee" ? copy.teeLabel : copy.piLabel}
    attenuation={diagramValue(attenuation, "dB")}
    impedance={diagramValue(z0, "Ω")}
    r1={formatEngineering(r1, { unit: "Ω" })}
    r2={formatEngineering(r2, { unit: "Ω" })}
    r3={formatEngineering(r3, { unit: "Ω" })}
  /><p className="font-semibold">{result.topology === "tee" ? copy.teeLabel : copy.piLabel}</p><dl className="space-y-4">
    {result.topology === "tee" ? <><ResultRow label="R series × 2">{formatEngineering(result.resistorsOhms.seriesEach, { unit: "Ω" })}</ResultRow><ResultRow label="R shunt">{formatEngineering(result.resistorsOhms.shunt, { unit: "Ω" })}</ResultRow></> : <><ResultRow label="R shunt × 2">{formatEngineering(result.resistorsOhms.shuntEach, { unit: "Ω" })}</ResultRow><ResultRow label="R series">{formatEngineering(result.resistorsOhms.series, { unit: "Ω" })}</ResultRow></>}
    {result.estimatedTotalDissipationW !== undefined && <ResultRow label={copy.totalDissipationLabel}>{formatEngineering(result.estimatedTotalDissipationW, { unit: "W" })}</ResultRow>}
    {result.resistorDissipationW && <ResultRow label={copy.resistorPowerLabel}>{Object.entries(result.resistorDissipationW).map(([name, watts]) => `${name}: ${formatEngineering(watts, { unit: "W" })}`).join(" · ")}</ResultRow>}
  </dl></div>} />;
}
