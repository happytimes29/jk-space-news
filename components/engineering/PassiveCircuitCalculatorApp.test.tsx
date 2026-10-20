import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { PassiveCircuitCalculatorApp, type PassiveCircuitCopy } from "./PassiveCircuitCalculatorApp";

const copy: PassiveCircuitCopy = {
  dividerTab: "Divider",
  dividerDiagramLabel: "Voltage divider circuit diagram",
  rcDiagramLabel: "RC low-pass circuit diagram",
  lcDiagramLabel: "LC resonant tank circuit diagram",
  rlcDiagramLabel: "RLC circuit diagram",
  reactanceDiagramLabel: "Inductive and capacitive reactance diagram",
  attenuatorDiagramLabel: "Attenuator circuit diagram",
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
    expect((await screen.findAllByText(/1\.59155 kHz/)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/100 µs/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("tab", { name: "LC" }));
    expect((await screen.findAllByText(/1\.59155 GHz/)).length).toBeGreaterThan(0);
  });

  it("updates the RC low-pass diagram values while the user types", async () => {
    render(<PassiveCircuitCalculatorApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "RC" }));

    const diagram = await screen.findByRole("img", { name: "RC low-pass circuit diagram" });
    expect(within(diagram).getByTestId("rc-diagram-r")).toHaveTextContent("1 kΩ");
    expect(within(diagram).getByTestId("rc-diagram-c")).toHaveTextContent("100 nF");
    expect(within(diagram).getByTestId("rc-diagram-cutoff")).toHaveTextContent("1.59155 kHz");
    expect(within(diagram).getByTestId("rc-diagram-time")).toHaveTextContent("100 µs");

    fireEvent.change(screen.getByLabelText("Resistance"), { target: { value: "2k" } });
    await waitFor(() => {
      expect(within(diagram).getByTestId("rc-diagram-r")).toHaveTextContent("2 kΩ");
      expect(within(diagram).getByTestId("rc-diagram-cutoff")).toHaveTextContent("795.775 Hz");
      expect(within(diagram).getByTestId("rc-diagram-time")).toHaveTextContent("200 µs");
    });
  });

  it("updates the LC resonant tank diagram values while the user types", async () => {
    render(<PassiveCircuitCalculatorApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "LC" }));

    const diagram = await screen.findByRole("img", { name: "LC resonant tank circuit diagram" });
    expect(within(diagram).getByTestId("lc-diagram-l")).toHaveTextContent("10 nH");
    expect(within(diagram).getByTestId("lc-diagram-c")).toHaveTextContent("1 pF");
    expect(within(diagram).getByTestId("lc-diagram-resonance")).toHaveTextContent("1.59155 GHz");

    fireEvent.change(screen.getByLabelText("Inductance"), { target: { value: "40n" } });
    await waitFor(() => {
      expect(within(diagram).getByTestId("lc-diagram-l")).toHaveTextContent("40 nH");
      expect(within(diagram).getByTestId("lc-diagram-resonance")).toHaveTextContent("795.775 MHz");
    });
  });

  it("switches the live RLC diagram between series and parallel topologies", async () => {
    render(<PassiveCircuitCalculatorApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "RLC" }));

    const diagram = await screen.findByRole("img", { name: "RLC circuit diagram" });
    expect(within(diagram).getByTestId("rlc-diagram-topology")).toHaveTextContent("Series");
    expect(within(diagram).getByTestId("rlc-diagram-r")).toHaveTextContent("10 Ω");
    expect(within(diagram).getByTestId("rlc-diagram-l")).toHaveTextContent("10 µH");
    expect(within(diagram).getByTestId("rlc-diagram-c")).toHaveTextContent("100 nF");
    expect(within(diagram).getByTestId("rlc-diagram-resonance")).toHaveTextContent("159.155 kHz");

    fireEvent.change(screen.getByLabelText("Resistance"), { target: { value: "20" } });
    await waitFor(() => expect(within(diagram).getByTestId("rlc-diagram-q")).toHaveTextContent("Q 500 m"));

    fireEvent.change(screen.getByLabelText("Circuit type"), { target: { value: "parallel" } });
    await waitFor(() => {
      expect(within(diagram).getByTestId("rlc-diagram-topology")).toHaveTextContent("Parallel");
      expect(within(diagram).getByTestId("rlc-diagram-q")).toHaveTextContent("Q 2");
      expect(within(diagram).getByTestId("rlc-diagram-bandwidth")).toHaveTextContent("79.5775 kHz");
    });
  });

  it("updates both reactance paths from the shared frequency", async () => {
    render(<PassiveCircuitCalculatorApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "Reactance" }));

    const diagram = await screen.findByRole("img", { name: "Inductive and capacitive reactance diagram" });
    expect(within(diagram).getByTestId("reactance-diagram-frequency")).toHaveTextContent("1 GHz");
    expect(within(diagram).getByTestId("reactance-diagram-l")).toHaveTextContent("10 nH");
    expect(within(diagram).getByTestId("reactance-diagram-c")).toHaveTextContent("1 pF");
    expect(within(diagram).getByTestId("reactance-diagram-xl")).toHaveTextContent("Xₗ 62.8319 Ω");
    expect(within(diagram).getByTestId("reactance-diagram-xc")).toHaveTextContent("X꜀ 159.155 Ω");

    fireEvent.change(screen.getByLabelText("Frequency"), { target: { value: "2G" } });
    await waitFor(() => {
      expect(within(diagram).getByTestId("reactance-diagram-frequency")).toHaveTextContent("2 GHz");
      expect(within(diagram).getByTestId("reactance-diagram-xl")).toHaveTextContent("Xₗ 125.664 Ω");
      expect(within(diagram).getByTestId("reactance-diagram-xc")).toHaveTextContent("X꜀ 79.5775 Ω");
    });
  });

  it("calculates positive finite tee and pi attenuator values", async () => {
    render(<PassiveCircuitCalculatorApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "Attenuator" }));
    const result = screen.getByRole("region", { name: "Results" });
    expect((await within(result).findAllByText(/T network/)).length).toBeGreaterThan(0);
    expect(within(result).getAllByText(/Ω/).length).toBeGreaterThan(1);

    fireEvent.change(screen.getByLabelText("Topology"), { target: { value: "pi" } });
    expect((await within(result).findAllByText(/Pi network/)).length).toBeGreaterThan(0);
    expect(within(result).getAllByText(/Ω/).every((node) => !node.textContent?.includes("NaN"))).toBe(true);
    expect(within(result).getByText("Total resistor dissipation")).toBeInTheDocument();
    expect(within(result).getByText("Per-resistor dissipation")).toBeInTheDocument();
  });

  it("switches the live attenuator diagram between tee and pi networks", async () => {
    render(<PassiveCircuitCalculatorApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "Attenuator" }));

    const diagram = await screen.findByRole("img", { name: "Attenuator circuit diagram" });
    expect(within(diagram).getByTestId("attenuator-diagram-topology")).toHaveTextContent("T network");
    expect(within(diagram).getByTestId("attenuator-diagram-attenuation")).toHaveTextContent("6 dB");
    expect(within(diagram).getByTestId("attenuator-diagram-impedance")).toHaveTextContent("50 Ω");
    expect(within(diagram).getByTestId("attenuator-diagram-r1")).toHaveTextContent("R1 16.6139 Ω");
    expect(within(diagram).getByTestId("attenuator-diagram-r2")).toHaveTextContent("R2 66.931 Ω");
    expect(within(diagram).getByTestId("attenuator-diagram-r3")).toHaveTextContent("R3 16.6139 Ω");

    fireEvent.change(screen.getByLabelText("Topology"), { target: { value: "pi" } });
    await waitFor(() => {
      expect(within(diagram).getByTestId("attenuator-diagram-topology")).toHaveTextContent("Pi network");
      expect(within(diagram).getByTestId("attenuator-diagram-r1")).toHaveTextContent("R1 150.476 Ω");
      expect(within(diagram).getByTestId("attenuator-diagram-r2")).toHaveTextContent("R2 37.3519 Ω");
      expect(within(diagram).getByTestId("attenuator-diagram-r3")).toHaveTextContent("R3 150.476 Ω");
    });
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
    await waitFor(() => expect(within(result).getAllByText(/1\.65 V/).length).toBeGreaterThan(0));
  });

  it("updates the divider circuit diagram values while the user types", async () => {
    render(<PassiveCircuitCalculatorApp copy={copy} />);
    fireEvent.change(screen.getByLabelText("Divider workflow"), { target: { value: "evaluate" } });

    fireEvent.change(screen.getByLabelText("Input voltage"), { target: { value: "12" } });
    fireEvent.change(screen.getByLabelText("Top resistance R1"), { target: { value: "10k" } });
    fireEvent.change(screen.getByLabelText("Bottom resistance R2"), { target: { value: "20k" } });

    const diagram = await screen.findByRole("img", { name: "Voltage divider circuit diagram" });
    await waitFor(() => {
      expect(within(diagram).getByTestId("divider-diagram-vin")).toHaveTextContent("12 V");
      expect(within(diagram).getByTestId("divider-diagram-r1")).toHaveTextContent("10 kΩ");
      expect(within(diagram).getByTestId("divider-diagram-r2")).toHaveTextContent("20 kΩ");
      expect(within(diagram).getByTestId("divider-diagram-vout")).toHaveTextContent("8 V");
    });

    fireEvent.click(screen.getByLabelText("Include load"));
    expect(await within(diagram).findByTestId("divider-diagram-load")).toHaveTextContent("100 kΩ");
    await waitFor(() => expect(within(diagram).getByTestId("divider-diagram-vout")).toHaveTextContent("7.5 V"));
  });

  it("hydrates direct divider share URLs before emitting default state", async () => {
    window.history.replaceState({}, "", "/tools/passive-circuit-calculator/app?mode=divider&dividerMode=evaluate&vin=12&rTop=10k&rBottom=20k&tolerance=5");
    render(<PassiveCircuitCalculatorApp copy={copy} />);

    expect(await screen.findByLabelText("Divider workflow")).toHaveValue("evaluate");
    expect(screen.getByLabelText("Input voltage")).toHaveValue("12");
    expect(screen.getByLabelText("Top resistance R1")).toHaveValue("10k");
    expect(screen.getByLabelText("Bottom resistance R2")).toHaveValue("20k");
    await waitFor(() => expect(new URL(window.location.href).searchParams.get("dividerMode")).toBe("evaluate"));
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
