import type { MatchSolution } from "@/lib/engineering/matching";
import type { NetworkStep } from "@/lib/engineering/network";
import { formatEngineering } from "@/lib/engineering/quantity";
import { CapacitorSymbol, GroundSymbol, InductorSymbol, ResistorSymbol } from "../diagrams/CircuitSymbols";
import { EngineeringDiagramFrame } from "../diagrams/EngineeringDiagramFrame";

interface MatchingNetworkDiagramProps {
  label: string;
  description: string;
  ideal: MatchSolution;
  rounded: MatchSolution;
  sourceLabel: string;
  loadLabel: string;
  idealLabel: string;
  roundedLabel: string;
  stale?: boolean;
  staleLabel?: string;
}

function valueText(step: NetworkStep) {
  return formatEngineering(step.value, { unit: step.component === "L" ? "H" : step.component === "C" ? "F" : "Ω", significantDigits: 4 });
}

function Symbol({ step, x, index }: { step: NetworkStep; x: number; index: number }) {
  const common = step.connection === "series"
    ? { x1: x - 55, y1: 120, x2: x + 55, y2: 120, testId: `matching-step-${index}-symbol` }
    : { x1: x, y1: 120, x2: x, y2: 225, orientation: "vertical" as const, testId: `matching-step-${index}-symbol` };
  if (step.component === "L") return <InductorSymbol {...common} />;
  if (step.component === "C") return <CapacitorSymbol {...common} />;
  return <ResistorSymbol {...common} />;
}

export function MatchingNetworkDiagram({ label, description, ideal, rounded, sourceLabel, loadLabel, idealLabel, roundedLabel, stale = false, staleLabel = "" }: MatchingNetworkDiagramProps) {
  return (
    <EngineeringDiagramFrame label={label} title={label} description={description} viewBox="0 0 640 350" stale={stale} staleLabel={staleLabel} minWidthClassName="min-w-[500px]">
      <g fill="none" stroke="currentColor" strokeWidth="3"><path d="M55 120H585" /><circle cx="55" cy="120" r="5" fill="var(--color-card)" /><circle cx="585" cy="120" r="5" fill="var(--color-card)" /></g>
      {ideal.steps.map((step, index) => {
        const x = index === 0 ? 225 : 415;
        return <g key={step.id} data-testid={`matching-step-${index}`} data-connection={step.connection} data-component={step.component}>
          <Symbol step={step} x={x} index={index} />
          {step.connection === "shunt" && <><path d={`M${x} 225V250`} stroke="currentColor" strokeWidth="3" /><GroundSymbol x={x} y={250} testId={`matching-step-${index}-ground`} /></>}
          <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="13">
            <text x={x} y="290" textAnchor="middle" data-testid={`matching-step-${index}-ideal`}>{idealLabel}: {step.component} {valueText(step)}</text>
            <text x={x} y="315" textAnchor="middle" fill="var(--color-accent)" data-testid={`matching-step-${index}-rounded`}>{roundedLabel}: {rounded.steps[index].component} {valueText(rounded.steps[index])}</text>
          </g>
        </g>;
      })}
      <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="14"><text x="55" y="92">{sourceLabel}</text><text x="585" y="92" textAnchor="end">{loadLabel}</text></g>
    </EngineeringDiagramFrame>
  );
}
