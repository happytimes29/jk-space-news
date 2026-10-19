import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SmithChartApp, type SmithChartCopy } from "./SmithChartApp";
import { track } from "@vercel/analytics";

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));
vi.mock("./smith/export", () => ({ exportSmithChartPng: vi.fn(async () => undefined) }));

const copy: SmithChartCopy = {
  inputTitle: "Inputs", frequencyLabel: "Frequency", referenceLabel: "Reference impedance", resistanceLabel: "Load resistance", reactanceLabel: "Load reactance", chartModeLabel: "Chart mode", impedanceMode: "Impedance", admittanceMode: "Admittance", connectionLabel: "Connection", seriesLabel: "Series", shuntLabel: "Shunt", componentLabel: "Component", valueLabel: "Component value", addStepLabel: "Add component", undoLabel: "Undo", redoLabel: "Redo", resetLabel: "Reset", solveLabel: "Solve L match", solutionsLabel: "Matching solutions", lowPassLabel: "Low-pass", highPassLabel: "High-pass", idealLabel: "Ideal", roundedLabel: "E24 rounded", preferredSeriesLabel: "Preferred values", selectSolutionLabel: "Apply solution", exportLabel: "Export PNG", copyUrlLabel: "Copy share URL", invalidInput: "Enter a passive finite load and positive settings.", idealLimitNote: "Ideal single-frequency model.", stepLabel: "Step",
  chart: { title: "Smith chart", description: "Single-frequency impedance and matching path", load: "Load", target: "Target", center: "Match", open: "Open", short: "Short", pathTableTitle: "Path values", pointLabel: "Point", startLabel: "Start", endLabel: "End" },
  readout: { table: "RF readout", impedance: "Z", admittance: "Y", gamma: "Gamma", s11: "S11", vswr: "VSWR", returnLoss: "Return loss", mismatchLoss: "Mismatch loss" },
};

beforeEach(() => {
  window.history.replaceState({}, "", "/tools/smith-chart/app");
  vi.mocked(track).mockClear();
});

describe("SmithChartApp", () => {
  it("starts with the documented load and updates the readout from manual complex input", async () => {
    render(<SmithChartApp copy={copy} />);
    expect(screen.getByLabelText("Frequency")).toHaveValue("1G");
    expect(screen.getByLabelText("Reference impedance")).toHaveValue("50");
    expect(screen.getByLabelText("Load resistance")).toHaveValue("25");
    expect(screen.getByLabelText("Load reactance")).toHaveValue("0");
    fireEvent.change(screen.getByLabelText("Load resistance"), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText("Load reactance"), { target: { value: "50" } });
    await waitFor(() => expect(screen.getByRole("table", { name: "RF readout" })).toHaveTextContent("50 + j50 Ω"));
  });

  it("adds labeled series and shunt paths and supports undo/redo", async () => {
    render(<SmithChartApp copy={copy} />);
    fireEvent.click(screen.getByRole("button", { name: "Add component" }));
    expect(await screen.findByText(/Step 1 · Series L/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Connection"), { target: { value: "shunt" } });
    fireEvent.change(screen.getByLabelText("Component"), { target: { value: "C" } });
    fireEvent.change(screen.getByLabelText("Component value"), { target: { value: "3p3" } });
    fireEvent.click(screen.getByRole("button", { name: "Add component" }));
    expect(await screen.findByText(/Step 2 · Shunt C/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.queryByText(/Step 2 · Shunt C/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(await screen.findByText(/Step 2 · Shunt C/)).toBeInTheDocument();
  });

  it("localizes connection names in the visible network steps", async () => {
    render(<SmithChartApp copy={{ ...copy, stepLabel: "步驟", seriesLabel: "串聯", shuntLabel: "並聯" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Add component" }));
    expect(await screen.findByText(/步驟 1 · 串聯 L/)).toBeInTheDocument();
  });

  it("preserves the last valid chart for invalid input and changes normalization at 75 ohms", async () => {
    render(<SmithChartApp copy={copy} />);
    const table = screen.getByRole("table", { name: "Path values" });
    const before = within(table).getByRole("row", { name: /Load/ }).textContent;
    fireEvent.change(screen.getByLabelText("Load resistance"), { target: { value: "-1" } });
    expect(await screen.findByText(copy.invalidInput)).toBeVisible();
    expect(within(table).getByRole("row", { name: /Load/ }).textContent).toBe(before);
    fireEvent.change(screen.getByLabelText("Load resistance"), { target: { value: "25" } });
    fireEvent.change(screen.getByLabelText("Reference impedance"), { target: { value: "75" } });
    await waitFor(() => expect(within(table).getByRole("row", { name: /Load/ }).textContent).not.toBe(before));
  });

  it("retains the physical network when toggling admittance mode", async () => {
    render(<SmithChartApp copy={copy} />);
    fireEvent.click(screen.getByRole("button", { name: "Add component" }));
    fireEvent.change(screen.getByLabelText("Chart mode"), { target: { value: "admittance" } });
    expect(screen.getByText(/Step 1 · Series L/)).toBeInTheDocument();
    expect(screen.getByLabelText("Chart mode")).toHaveValue("admittance");
  });

  it("lists and applies both ideal matches, shows E24 separately, and exports only public analytics", async () => {
    render(<SmithChartApp copy={copy} />);
    fireEvent.click(screen.getByRole("button", { name: "Solve L match" }));
    expect(await screen.findByText("Low-pass")).toBeInTheDocument();
    expect(screen.getByText("High-pass")).toBeInTheDocument();
    expect(screen.getAllByText("Ideal").length).toBeGreaterThan(0);
    expect(screen.getAllByText("E24 rounded").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Apply solution" })[0]);
    expect(await screen.findByText(/Step 2/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Export PNG" }));
    await waitFor(() => expect(track).toHaveBeenCalledWith("Engineering Tool Action", { slug: "smith-chart", action: "export_png" }));
  });
});
