"use client";

import { useEffect, useState } from "react";
import { CalculatorField } from "../CalculatorField";
import { formatEngineering } from "@/lib/engineering/quantity";
import { symmetricAttenuator, type AttenuatorResult } from "@/lib/engineering/passive";
import { ModeLayout, parsed, ResultRow } from "./shared";
import { AttenuatorDiagram } from "./AttenuatorDiagram";
import { AttenuatorTopologyPicker } from "./AttenuatorTopologyPicker";
import type { PassiveModeProps } from "./types";

type ErrorField = "attenuationDb" | "impedanceOhms" | "inputPowerWatts";
interface ValidSnapshot { attenuationDb: number; impedanceOhms: number; inputPowerWatts: number; }

function initialCalculation() {
  const result = symmetricAttenuator({ topology: "tee", attenuationDb: 6, impedanceOhms: 50, inputPowerWatts: 1 });
  if (!result.ok) throw new Error("invalid attenuator example");
  return result.value;
}

export function AttenuatorMode({ copy, initial, onStateChange }: PassiveModeProps) {
  const [attenuation, setAttenuation] = useState(initial.attenuation ?? "6");
  const [z0, setZ0] = useState(initial.z0 ?? "50");
  const [topology, setTopology] = useState<"tee" | "pi">(initial.topology === "pi" ? "pi" : "tee");
  const [inputPower, setInputPower] = useState(initial.inputPower ?? "1");
  const [errorField, setErrorField] = useState<ErrorField>();
  const [result, setResult] = useState<AttenuatorResult>(initialCalculation);
  const [snapshot, setSnapshot] = useState<ValidSnapshot>({ attenuationDb: 6, impedanceOhms: 50, inputPowerWatts: 1 });
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    onStateChange({ attenuation, z0, topology, inputPower });
    const attenuationDb = parsed(attenuation);
    if (attenuationDb === undefined) { setErrorField("attenuationDb"); setIsStale(true); return; }
    const impedanceOhms = parsed(z0);
    if (impedanceOhms === undefined) { setErrorField("impedanceOhms"); setIsStale(true); return; }
    const inputPowerWatts = parsed(inputPower);
    if (inputPowerWatts === undefined) { setErrorField("inputPowerWatts"); setIsStale(true); return; }
    const next = symmetricAttenuator({ topology, attenuationDb, impedanceOhms, inputPowerWatts });
    if (!next.ok) { setErrorField(next.error.field as ErrorField); setIsStale(true); return; }
    setErrorField(undefined); setIsStale(false); setResult(next.value); setSnapshot({ attenuationDb, impedanceOhms, inputPowerWatts });
  }, [attenuation, inputPower, onStateChange, topology, z0]);

  const resistance = result.topology === "tee" ? [result.resistorsOhms.seriesEach, result.resistorsOhms.shunt, result.resistorsOhms.seriesEach] : [result.resistorsOhms.shuntEach, result.resistorsOhms.series, result.resistorsOhms.shuntEach];
  const power = result.topology === "tee" ? [result.resistorDissipationW?.inputSeries, result.resistorDissipationW?.shunt, result.resistorDissipationW?.outputSeries] : [result.resistorDissipationW?.inputShunt, result.resistorDissipationW?.series, result.resistorDissipationW?.outputShunt];
  const formatted = (value: number | undefined, unit: string) => value === undefined ? "—" : formatEngineering(value, { unit });

  return <ModeLayout inputTitle={copy.inputTitle} resultTitle={copy.resultTitle} inputs={<>
    <CalculatorField id="attenuation-db" label={copy.attenuationLabel} value={attenuation} onChange={(event) => setAttenuation(event.target.value)} unit="dB" error={errorField === "attenuationDb" ? copy.errorLabel : undefined} />
    <CalculatorField id="attenuator-z0" label={copy.impedanceLabel} value={z0} onChange={(event) => setZ0(event.target.value)} unit="Ω" error={errorField === "impedanceOhms" ? copy.errorLabel : undefined} />
    <CalculatorField id="attenuator-power" label={copy.inputPowerLabel} value={inputPower} onChange={(event) => setInputPower(event.target.value)} unit="W" error={errorField === "inputPowerWatts" ? copy.errorLabel : undefined} />
    <AttenuatorTopologyPicker value={topology} onChange={setTopology} label={copy.topologyLabel} hint={copy.topologyHint} teeLabel={copy.teeLabel} piLabel={copy.piLabel} />
  </>} results={<div className="space-y-4"><AttenuatorDiagram
    label={copy.attenuatorDiagramLabel} description={copy.attenuatorDiagramDescription} topology={result.topology} topologyLabel={result.topology === "tee" ? copy.teeLabel : copy.piLabel}
    attenuation={formatEngineering(snapshot.attenuationDb, { unit: "dB" })} impedance={formatEngineering(snapshot.impedanceOhms, { unit: "Ω" })}
    r1={formatted(resistance[0], "Ω")} r2={formatted(resistance[1], "Ω")} r3={formatted(resistance[2], "Ω")} r1Power={formatted(power[0], "W")} r2Power={formatted(power[1], "W")} r3Power={formatted(power[2], "W")}
    inputPower={formatted(result.inputPowerW, "W")} outputPower={formatted(result.outputPowerW, "W")} totalDissipation={formatted(result.estimatedTotalDissipationW, "W")}
    inputPortLabel={copy.inputPortLabel} outputPortLabel={copy.outputPortLabel} groundLabel={copy.groundLabel} outputPowerLabel={copy.outputPowerLabel} stale={isStale} staleLabel={copy.lastValidResultLabel}
  /><p className="font-semibold">{result.topology === "tee" ? copy.teeLabel : copy.piLabel}</p><dl className="space-y-4">
    {result.topology === "tee" ? <><ResultRow label="R series × 2">{formatted(result.resistorsOhms.seriesEach, "Ω")}</ResultRow><ResultRow label="R shunt">{formatted(result.resistorsOhms.shunt, "Ω")}</ResultRow></> : <><ResultRow label="R shunt × 2">{formatted(result.resistorsOhms.shuntEach, "Ω")}</ResultRow><ResultRow label="R series">{formatted(result.resistorsOhms.series, "Ω")}</ResultRow></>}
    {result.outputPowerW !== undefined && <ResultRow label={copy.outputPowerLabel}>{formatted(result.outputPowerW, "W")}</ResultRow>}
    {result.estimatedTotalDissipationW !== undefined && <ResultRow label={copy.totalDissipationLabel}>{formatted(result.estimatedTotalDissipationW, "W")}</ResultRow>}
    {result.resistorDissipationW && <ResultRow label={copy.resistorPowerLabel}>{power.map((watts, index) => `R${index + 1}: ${formatted(watts, "W")}`).join(" · ")}</ResultRow>}
  </dl></div>} />;
}
