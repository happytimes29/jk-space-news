import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { PassiveCircuitCalculatorApp, type PassiveCircuitCopy } from "./PassiveCircuitCalculatorApp";

const copy: PassiveCircuitCopy = {
  dividerTab: "Divider",
  rcTab: "RC",
  lcTab: "LC",
  rlcTab: "RLC",
  reactanceTab: "Reactance",
  attenuatorTab: "Attenuator",
  inputTitle: "Inputs",
  resultTitle: "Results",
  vinLabel: "Input voltage",
  targetVoutLabel: "Target output",
  seriesLabel: "Preferred series",
  enableLoadLabel: "Include load",
  loadLabel: "Load resistance",
  resistanceLabel: "Resistance",
  capacitanceLabel: "Capacitance",
  inductanceLabel: "Inductance",
  frequencyLabel: "Frequency",
  circuitTypeLabel: "Circuit type",
  seriesCircuitLabel: "Series",
  parallelCircuitLabel: "Parallel",
  attenuationLabel: "Attenuation",
  impedanceLabel: "System impedance",
  topologyLabel: "Topology",
  teeLabel: "T network",
  piLabel: "Pi network",
  cutoffLabel: "Cutoff frequency",
  timeConstantLabel: "Time constant",
  resonanceLabel: "Resonance",
  qualityLabel: "Q factor",
  bandwidthLabel: "Bandwidth",
  capacitiveReactanceLabel: "Capacitive reactance",
  inductiveReactanceLabel: "Inductive reactance",
  bestCandidateLabel: "Best candidate",
  actualOutputLabel: "Actual output",
  errorLabel: "Check the highlighted input values.",
  noSolutionLabel: "No practical solution for these inputs.",
  dividerModeLabel: "Divider workflow",
  designLabel: "Design values",
  evaluateLabel: "Evaluate R1/R2",
  topResistanceLabel: "Top resistance R1",
  bottomResistanceLabel: "Bottom resistance R2",
  toleranceLabel: "Resistance tolerance",
  branchCurrentLabel: "Branch current",
  topPowerLabel: "R1 power",
  bottomPowerLabel: "R2 power",
  worstCaseLabel: "Worst-case output",
  relativeErrorLabel: "Relative error",
  candidateListLabel: "Ranked candidates",
  inputPowerLabel: "Input power",
  totalDissipationLabel: "Total resistor dissipation",
  resistorPowerLabel: "Per-resistor dissipation",
};

beforeEach(() => window.history.replaceState({}, "", "/tools/passive-circuit-calculator/app"));

describe("PassiveCircuitCalculatorApp", () => {
  it("suggests deterministic divider values and responds to load and E-series changes", async () => {
    render(<PassiveCircuitCalculatorApp copy={copy} />);
    const result = screen.getByRole("region", { name: "Results" });
    expect(within(result).getAllByText(/1\.8 V/).length).toBeGreaterThan(0);
    expect(within(result).getByText(/E24/)).toBeInTheDocument();
    const unloaded = within(result).getByTestId("best-divider").textContent;

    fireEvent.click(screen.getByLabelText("Include load"));
    await waitFor(() => expect(within(result).getByTestId("best-divider").textContent).not.toBe(unloaded));

    fireEvent.change(screen.getByLabelText("Preferred series"), { target: { value: "12" } });
    await waitFor(() => expect(within(result).getByText(/E12/)).toBeInTheDocument());
  });

  it("calculates RC cutoff and LC resonance examples", async () => {
    render(<PassiveCircuitCalculatorApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "RC" }));
    expect(await screen.findByText(/1\.59155 kHz/)).toBeInTheDocument();
    expect(screen.getByText(/100 µs/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "LC" }));
    expect(await screen.findByText(/1\.59155 GHz/)).toBeInTheDocument();
  });

  it("calculates positive finite tee and pi attenuator values", async () => {
    render(<PassiveCircuitCalculatorApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "Attenuator" }));
    const result = screen.getByRole("region", { name: "Results" });
    expect(await within(result).findByText(/T network/)).toBeInTheDocument();
    expect(within(result).getAllByText(/Ω/).length).toBeGreaterThan(1);

    fireEvent.change(screen.getByLabelText("Topology"), { target: { value: "pi" } });
    expect(await within(result).findByText(/Pi network/)).toBeInTheDocument();
    expect(within(result).getAllByText(/Ω/).every((node) => !node.textContent?.includes("NaN"))).toBe(true);
    expect(within(result).getByText("Total resistor dissipation")).toBeInTheDocument();
    expect(within(result).getByText("Per-resistor dissipation")).toBeInTheDocument();
  });

  it("evaluates entered divider resistors with current, power, and tolerance range", async () => {
    render(<PassiveCircuitCalculatorApp copy={copy} />);
    fireEvent.change(screen.getByLabelText("Divider workflow"), { target: { value: "evaluate" } });
    const result = screen.getByRole("region", { name: "Results" });
    for (const label of ["Actual output", "Branch current", "R1 power", "R2 power", "Worst-case output"]) {
      expect(await within(result).findByText(label)).toBeInTheDocument();
    }
    fireEvent.change(screen.getByLabelText("Top resistance R1"), { target: { value: "10k" } });
    fireEvent.change(screen.getByLabelText("Bottom resistance R2"), { target: { value: "10k" } });
    await waitFor(() => expect(within(result).getByText(/1\.65 V/)).toBeInTheDocument());
  });

  it("shows localized errors without replacing the last valid divider result", async () => {
    render(<PassiveCircuitCalculatorApp copy={copy} />);
    const result = screen.getByRole("region", { name: "Results" });
    const previous = within(result).getByTestId("best-divider").textContent;
    fireEvent.change(screen.getByLabelText("Target output"), { target: { value: "5" } });
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.errorLabel);
    expect(within(result).getByTestId("best-divider")).toHaveTextContent(previous ?? "");
  });
});
