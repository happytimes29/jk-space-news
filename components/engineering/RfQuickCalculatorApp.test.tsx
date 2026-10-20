import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { RfQuickCalculatorApp, type RfQuickCalculatorCopy } from "./RfQuickCalculatorApp";

const copy: RfQuickCalculatorCopy = {
  propagationTab: "Propagation",
  impedanceTab: "Impedance and reflection",
  inputTitle: "Inputs",
  resultTitle: "Results",
  frequencyLabel: "Frequency",
  permittivityLabel: "Effective relative permittivity εeff",
  permittivityGuidance: "Use the transmission line's effective permittivity, not the raw substrate value.",
  velocityFactorLabel: "Velocity factor",
  lengthLabel: "Physical length",
  resistanceLabel: "Resistance",
  reactanceLabel: "Reactance",
  referenceLabel: "Reference impedance",
  velocityLabel: "Propagation velocity",
  wavelengthLabel: "Wavelength",
  halfWavelengthLabel: "Half wavelength",
  quarterWavelengthLabel: "Quarter wavelength",
  delayLabel: "Propagation delay",
  electricalAngleLabel: "Electrical angle",
  impedanceResultLabel: "Impedance Z",
  admittanceLabel: "Admittance Y",
  gammaLabel: "Reflection coefficient Γ",
  s11Label: "S11",
  vswrLabel: "VSWR",
  returnLossLabel: "Return loss",
  mismatchLossLabel: "Mismatch loss",
  invalidInput: "Enter finite positive values.",
  conflictingMedium: "Use permittivity or velocity factor, not both.",
  infinityLabel: "∞",
  propagationInputLabel: "Convert from",
  angleInputLabel: "Electrical angle input",
  delayInputLabel: "Propagation delay input",
  impedanceInputLabel: "Convert from RF quantity",
  zInputLabel: "Impedance Z",
  yInputLabel: "Admittance Y",
  gammaInputLabel: "Reflection coefficient Γ",
  conductanceLabel: "Conductance G",
  susceptanceLabel: "Susceptance B",
  gammaRealLabel: "Γ real",
  gammaImagLabel: "Γ imaginary",
  normalizedLabel: "Normalized z / y",
  shortCircuitLabel: "Short circuit",
  openCircuitLabel: "Open circuit",
  propagationDiagramLabel: "Propagation diagram",
  propagationDiagramDescription: "A travelling wave with wavelength and physical-length markers.",
  waveDirectionLabel: "Wave direction",
  mediumLabel: "Medium",
  freeSpaceLabel: "Free space",
  lastValidResultLabel: "Showing the last valid result.",
};

beforeEach(() => window.history.replaceState({}, "", "/tools/rf-calculator/app"));

describe("RfQuickCalculatorApp", () => {
  it("shows free-space, half, and quarter wavelength at 1 GHz", () => {
    render(<RfQuickCalculatorApp copy={copy} />);
    const result = screen.getByRole("region", { name: "Results" });
    expect(within(result).getAllByText(/299\.792 mm/).length).toBeGreaterThan(0);
    expect(within(result).getAllByText(/149\.896 mm/).length).toBeGreaterThan(0);
    expect(within(result).getAllByText(/74\.9481 mm/).length).toBeGreaterThan(0);
  });

  it("changes propagation velocity and wavelength for a dielectric", async () => {
    render(<RfQuickCalculatorApp copy={copy} />);
    const result = screen.getByRole("region", { name: "Results" });
    fireEvent.change(screen.getByLabelText("Effective relative permittivity εeff"), { target: { value: "4" } });
    await waitFor(() => expect(within(result).getAllByText(/149\.896 mm/).length).toBeGreaterThan(0));
    expect(within(result).getByText(/149\.896 Mm\/s/)).toBeInTheDocument();
  });

  it("converts electrical angle and delay back to physical length", async () => {
    render(<RfQuickCalculatorApp copy={copy} />);
    fireEvent.change(screen.getByLabelText("Convert from"), { target: { value: "angle" } });
    fireEvent.change(screen.getByLabelText("Electrical angle input"), { target: { value: "180" } });
    expect((await within(screen.getByRole("region", { name: "Results" })).findAllByText(/149\.896 mm/)).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText("Convert from"), { target: { value: "delay" } });
    fireEvent.change(screen.getByLabelText("Propagation delay input"), { target: { value: "1n" } });
    expect((await within(screen.getByRole("region", { name: "Results" })).findAllByText(/299\.792 mm/)).length).toBeGreaterThan(0);
  });

  it("shows the matched ideal limits and finite mismatch metrics", async () => {
    render(<RfQuickCalculatorApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "Impedance and reflection" }));
    const result = screen.getByRole("region", { name: "Results" });
    expect(await within(result).findByText(/0 \+ j0 · 0 ∠ 0°/)).toBeInTheDocument();
    expect(within(result).getByText("1")).toBeInTheDocument();
    expect(within(result).getAllByText(/∞/).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("Resistance"), { target: { value: "25" } });
    fireEvent.change(screen.getByLabelText("Reactance"), { target: { value: "25" } });
    await waitFor(() => expect(within(result).getByText(/25 \+ j25 Ω/)).toBeInTheDocument());
    for (const label of ["Admittance Y", "Reflection coefficient Γ", "S11", "Return loss", "Mismatch loss"]) {
      expect(within(result).getByText(label)).toBeInTheDocument();
    }
    expect(result).not.toHaveTextContent("NaN");
  });

  it("accepts admittance and reflection coefficient as reverse inputs", async () => {
    render(<RfQuickCalculatorApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "Impedance and reflection" }));
    fireEvent.change(screen.getByLabelText("Convert from RF quantity"), { target: { value: "y" } });
    expect(await within(screen.getByRole("region", { name: "Results" })).findByText(/50 \+ j0 Ω/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Convert from RF quantity"), { target: { value: "gamma" } });
    fireEvent.change(screen.getByLabelText("Γ real"), { target: { value: "-0.3333333333" } });
    expect(await within(screen.getByRole("region", { name: "Results" })).findByText(/25 \+ j0 Ω/)).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Results" })).getByText("Normalized z / y")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Reference impedance"), { target: { value: "50R" } });
    await waitFor(() => expect(screen.getByRole("region", { name: "Results" })).not.toHaveTextContent("NaN"));
  });

  it("renders ideal short and open limits instead of stale matched results", async () => {
    render(<RfQuickCalculatorApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "Impedance and reflection" }));
    const result = screen.getByRole("region", { name: "Results" });

    fireEvent.change(screen.getByLabelText("Resistance"), { target: { value: "0" } });
    expect(await within(result).findByText(/-1 \+ j0 · 1 ∠ 180°/)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Convert from RF quantity"), { target: { value: "gamma" } });
    fireEvent.change(screen.getByLabelText("Γ real"), { target: { value: "-1" } });
    expect(await within(result).findByText(/-1 \+ j0 · 1 ∠ 180°/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Γ real"), { target: { value: "1" } });
    expect(await within(result).findByText(/1 \+ j0 · 1 ∠ 0°/)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("rejects conflicting medium inputs and preserves the last valid result", async () => {
    render(<RfQuickCalculatorApp copy={copy} />);
    const result = screen.getByRole("region", { name: "Results" });
    fireEvent.change(screen.getByLabelText("Effective relative permittivity εeff"), { target: { value: "4" } });
    await waitFor(() => expect(within(result).getAllByText(/149\.896 mm/).length).toBeGreaterThan(0));
    fireEvent.change(screen.getByLabelText("Velocity factor"), { target: { value: "0.8" } });
    expect(await screen.findAllByRole("alert")).toHaveLength(2);
    expect(within(result).getAllByText(/149\.896 mm/).length).toBeGreaterThan(0);
  });

  it("keeps one live propagation diagram across input modes and marks invalid medium state stale", async () => {
    render(<RfQuickCalculatorApp copy={copy} />);
    const diagram = screen.getByRole("img", { name: "Propagation diagram" });
    for (const text of ["1 GHz", "λ 299.792 mm", "λ/2 149.896 mm", "λ/4 74.9481 mm", "100 mm", "120.083°", "333.564 ps"]) {
      expect(diagram).toHaveTextContent(text);
    }

    fireEvent.change(screen.getByLabelText("Convert from"), { target: { value: "angle" } });
    fireEvent.change(screen.getByLabelText("Electrical angle input"), { target: { value: "180" } });
    await waitFor(() => expect(within(diagram).getByTestId("propagation-length")).toHaveTextContent("149.896 mm"));
    fireEvent.change(screen.getByLabelText("Convert from"), { target: { value: "delay" } });
    fireEvent.change(screen.getByLabelText("Propagation delay input"), { target: { value: "1n" } });
    await waitFor(() => expect(within(diagram).getByTestId("propagation-length")).toHaveTextContent("299.792 mm"));

    fireEvent.change(screen.getByLabelText("Effective relative permittivity εeff"), { target: { value: "4" } });
    await waitFor(() => expect(within(diagram).getByTestId("propagation-medium")).toHaveTextContent("εeff = 4"));
    fireEvent.change(screen.getByLabelText("Velocity factor"), { target: { value: "0.8" } });
    expect(await screen.findAllByRole("alert")).toHaveLength(2);
    expect(screen.getByLabelText("Effective relative permittivity εeff")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Velocity factor")).toHaveAttribute("aria-invalid", "true");
    expect(diagram).toHaveAttribute("data-stale", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Showing the last valid result.");
    fireEvent.change(screen.getByLabelText("Velocity factor"), { target: { value: "" } });
    await waitFor(() => expect(diagram).not.toHaveAttribute("data-stale"));
  });
});
