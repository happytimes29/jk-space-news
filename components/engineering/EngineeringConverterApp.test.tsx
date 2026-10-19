import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EngineeringConverterApp, type EngineeringConverterCopy } from "./EngineeringConverterApp";

const copy: EngineeringConverterCopy = {
  generalTab: "General units",
  rfTab: "RF power",
  valueLabel: "Value",
  fromUnitLabel: "From unit",
  toUnitLabel: "To unit",
  impedanceLabel: "System impedance",
  resultTitle: "Results",
  canonicalValueLabel: "Canonical SI",
  convertedValueLabel: "Converted value",
  powerLabel: "Power",
  voltageLabel: "Voltage",
  currentLabel: "Current",
  resetLabel: "Reset example",
  invalidNumber: "Enter a valid engineering number.",
  invalidImpedance: "Impedance must be positive.",
  incompatibleUnits: "Choose units for the same quantity.",
};

describe("EngineeringConverterApp", () => {
  it("accepts engineering notation and changes display units without changing the SI value", async () => {
    render(<EngineeringConverterApp copy={copy} />);
    const results = screen.getByRole("region", { name: "Results" });
    expect(within(results).getByText("4700 Ω")).toBeInTheDocument();
    expect(within(results).getByText("4.7 kΩ")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "2R2" } });
    await waitFor(() => expect(within(results).getByText("2.2 Ω")).toBeInTheDocument());
    expect(within(results).getByText("0.0022 kΩ")).toBeInTheDocument();
  });

  it("converts RF power at the selected impedance", async () => {
    render(<EngineeringConverterApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "RF power" }));

    const results = screen.getByRole("region", { name: "Results" });
    expect(within(results).getByText("1 mW")).toBeInTheDocument();
    expect(within(results).getByText(/223\.607 mVrms/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("System impedance"), { target: { value: "75" } });
    await waitFor(() => expect(within(results).getByText(/273\.861 mVrms/)).toBeInTheDocument());
    expect(within(results).getByText("1 mW")).toBeInTheDocument();
  });

  it("associates invalid input with an alert and preserves the last valid result", async () => {
    render(<EngineeringConverterApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "RF power" }));
    const results = screen.getByRole("region", { name: "Results" });
    expect(within(results).getByText("1 mW")).toBeInTheDocument();

    const value = screen.getByLabelText("Value");
    fireEvent.change(value, { target: { value: "not-a-number" } });
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.invalidNumber);
    expect(value).toHaveAttribute("aria-invalid", "true");
    expect(within(results).getByText("1 mW")).toBeInTheDocument();
  });

  it("resets the active mode to its documented example", async () => {
    render(<EngineeringConverterApp copy={copy} />);
    fireEvent.click(screen.getByRole("tab", { name: "RF power" }));
    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("System impedance"), { target: { value: "75" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset example" }));
    await waitFor(() => expect(screen.getByLabelText("Value")).toHaveValue("0"));
    expect(screen.getByLabelText("System impedance")).toHaveValue("50");
    expect(within(screen.getByRole("region", { name: "Results" })).getByText("1 mW")).toBeInTheDocument();
  });
});
