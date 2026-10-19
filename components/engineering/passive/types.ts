export type PassiveMode = "divider" | "rc" | "lc" | "rlc" | "reactance" | "attenuator";

export interface PassiveCircuitCopy {
  dividerTab: string;
  rcTab: string;
  lcTab: string;
  rlcTab: string;
  reactanceTab: string;
  attenuatorTab: string;
  inputTitle: string;
  resultTitle: string;
  vinLabel: string;
  targetVoutLabel: string;
  seriesLabel: string;
  enableLoadLabel: string;
  loadLabel: string;
  resistanceLabel: string;
  capacitanceLabel: string;
  inductanceLabel: string;
  frequencyLabel: string;
  circuitTypeLabel: string;
  seriesCircuitLabel: string;
  parallelCircuitLabel: string;
  attenuationLabel: string;
  impedanceLabel: string;
  topologyLabel: string;
  teeLabel: string;
  piLabel: string;
  cutoffLabel: string;
  timeConstantLabel: string;
  resonanceLabel: string;
  qualityLabel: string;
  bandwidthLabel: string;
  capacitiveReactanceLabel: string;
  inductiveReactanceLabel: string;
  bestCandidateLabel: string;
  actualOutputLabel: string;
  errorLabel: string;
  noSolutionLabel: string;
}

export interface PassiveModeProps {
  copy: PassiveCircuitCopy;
  initial: Record<string, string>;
  onStateChange: (state: Record<string, string | number | boolean>) => void;
}
