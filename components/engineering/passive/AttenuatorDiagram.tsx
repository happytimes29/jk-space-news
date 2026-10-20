import { GroundSymbol, ResistorSymbol } from "../diagrams/CircuitSymbols";
import { EngineeringDiagramFrame } from "../diagrams/EngineeringDiagramFrame";

interface AttenuatorDiagramProps {
  label: string; description: string; topology: "tee" | "pi"; topologyLabel: string;
  attenuation: string; impedance: string; r1: string; r2: string; r3: string;
  r1Power: string; r2Power: string; r3Power: string; inputPower: string;
  outputPower: string; totalDissipation: string; inputPortLabel: string;
  outputPortLabel: string; groundLabel: string; outputPowerLabel: string;
  stale: boolean; staleLabel: string;
}

export function AttenuatorDiagram(props: AttenuatorDiagramProps) {
  return (
    <EngineeringDiagramFrame label={props.label} title={props.topologyLabel} description={props.description} viewBox="0 0 600 390" stale={props.stale} staleLabel={props.staleLabel} minWidthClassName="min-w-[520px]">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3">
        <path d="M35 120H90 M510 120H565" />
        <circle cx="35" cy="120" r="5" fill="var(--color-card)" /><circle cx="565" cy="120" r="5" fill="var(--color-card)" />
      </g>
      {props.topology === "tee" ? (
        <g data-testid="attenuator-tee-network">
          <ResistorSymbol x1={90} y1={120} x2={220} y2={120} testId="attenuator-r1-symbol" />
          <path d="M220 120H380" fill="none" stroke="currentColor" strokeWidth="3" />
          <ResistorSymbol x1={380} y1={120} x2={510} y2={120} testId="attenuator-r3-symbol" />
          <ResistorSymbol x1={300} y1={120} x2={300} y2={250} orientation="vertical" testId="attenuator-r2-symbol" />
          <path d="M300 250V275" fill="none" stroke="currentColor" strokeWidth="3" /><GroundSymbol x={300} y={275} />
        </g>
      ) : (
        <g data-testid="attenuator-pi-network">
          <path d="M90 120H220 M380 120H510" fill="none" stroke="currentColor" strokeWidth="3" />
          <ResistorSymbol x1={220} y1={120} x2={380} y2={120} testId="attenuator-r2-symbol" />
          <ResistorSymbol x1={145} y1={120} x2={145} y2={250} orientation="vertical" testId="attenuator-r1-symbol" />
          <ResistorSymbol x1={455} y1={120} x2={455} y2={250} orientation="vertical" testId="attenuator-r3-symbol" />
          <path d="M145 250V275 M455 250V275" fill="none" stroke="currentColor" strokeWidth="3" /><GroundSymbol x={145} y={275} /><GroundSymbol x={455} y={275} />
        </g>
      )}
      <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="13">
        <text x="300" y="26" textAnchor="middle" fill="var(--color-accent)" fontWeight="700" data-testid="attenuator-diagram-topology">{props.topologyLabel}</text>
        <text x="35" y="96" data-testid="attenuator-diagram-input-power">{props.inputPortLabel} · {props.inputPower}</text>
        <text x="565" y="96" textAnchor="end" data-testid="attenuator-diagram-output-power">{props.outputPowerLabel} · {props.outputPower}</text>
        <text x="565" y="142" textAnchor="end">{props.outputPortLabel}</text>
        {props.topology === "tee" ? <>
          <text x="155" y="82" textAnchor="middle" data-testid="attenuator-diagram-r1">R1 {props.r1}</text><text x="322" y="178" data-testid="attenuator-diagram-r2">R2 {props.r2}</text><text x="445" y="82" textAnchor="middle" data-testid="attenuator-diagram-r3">R3 {props.r3}</text>
          <text x="155" y="62" textAnchor="middle" data-testid="attenuator-diagram-r1-power">R1 · {props.r1Power}</text><text x="322" y="198" data-testid="attenuator-diagram-r2-power">R2 · {props.r2Power}</text><text x="445" y="62" textAnchor="middle" data-testid="attenuator-diagram-r3-power">R3 · {props.r3Power}</text>
        </> : <>
          <text x="125" y="178" textAnchor="end" data-testid="attenuator-diagram-r1">R1 {props.r1}</text><text x="300" y="82" textAnchor="middle" data-testid="attenuator-diagram-r2">R2 {props.r2}</text><text x="475" y="178" data-testid="attenuator-diagram-r3">R3 {props.r3}</text>
          <text x="125" y="198" textAnchor="end" data-testid="attenuator-diagram-r1-power">R1 · {props.r1Power}</text><text x="300" y="62" textAnchor="middle" data-testid="attenuator-diagram-r2-power">R2 · {props.r2Power}</text><text x="475" y="198" data-testid="attenuator-diagram-r3-power">R3 · {props.r3Power}</text>
        </>}
        <text x="300" y="318" textAnchor="middle">{props.groundLabel}</text>
        <text x="55" y="360" data-testid="attenuator-diagram-attenuation">A {props.attenuation}</text><text x="220" y="360" data-testid="attenuator-diagram-impedance">Z₀ {props.impedance}</text><text x="390" y="360" data-testid="attenuator-diagram-total-power">Σ {props.totalDissipation}</text>
      </g>
    </EngineeringDiagramFrame>
  );
}
