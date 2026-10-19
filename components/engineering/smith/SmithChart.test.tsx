import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { smithPoint, smithReadout } from "@/lib/engineering/smith";
import { SmithChart, type SmithChartLabels } from "./SmithChart";
import { SmithReadoutTable } from "./SmithReadoutTable";

const labels: SmithChartLabels = {
  title: "Smith chart",
  description: "Normalized impedance and matching path",
  load: "Load",
  target: "Target",
  center: "Match",
  open: "Open",
  short: "Short",
  pathTableTitle: "Path values",
  pointLabel: "Point",
  startLabel: "Start",
  endLabel: "End",
};

function point(re: number, im: number) {
  const result = smithPoint({ re, im }, 50);
  if (!result.ok) throw new Error("expected Smith point");
  return result.value;
}

describe("SmithChart", () => {
  it("renders accessible vector marks, non-color path labels, and a numeric table", () => {
    const active = point(50, 50);
    const target = point(50, 0);
    render(<SmithChart mode="impedance" activePoint={active} targetPoint={target} paths={[{ id: "step-1", label: "Step 1 · series L 4 nH", points: [active, target] }]} labels={labels} />);
    const svg = screen.getByRole("img", { name: "Smith chart" });
    expect(svg).toHaveAttribute("viewBox", "-1.08 -1.08 2.16 2.16");
    expect(within(svg).getByText(labels.description)).toBeInTheDocument();
    expect(svg.querySelector('[data-marker="load"]')?.tagName).toBe("circle");
    expect(svg.querySelector('[data-marker="target"]')?.tagName).toBe("rect");
    expect(within(svg).getByText("Step 1 · series L 4 nH")).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Path values" });
    expect(within(table).getByRole("row", { name: /Step 1 · series L 4 nH/ })).toBeInTheDocument();
    expect(table).toHaveTextContent("0.2");
  });

  it("serializes grid coordinates at stable cross-runtime precision", () => {
    render(<SmithChart mode="impedance" activePoint={point(25, 0)} targetPoint={point(50, 0)} paths={[]} labels={labels} />);
    for (const path of screen.getByRole("img", { name: "Smith chart" }).querySelectorAll("path")) {
      expect(path.getAttribute("d")).not.toMatch(/\.\d{13}/);
    }
  });

  it("renders the full numeric readout outside the chart", () => {
    const active = point(25, 25);
    const readout = smithReadout(active);
    if (!readout.ok) throw new Error("expected readout");
    render(<SmithReadoutTable readout={readout.value} labels={{ table: "RF readout", impedance: "Z", admittance: "Y", gamma: "Gamma", s11: "S11", vswr: "VSWR", returnLoss: "Return loss", mismatchLoss: "Mismatch loss" }} />);
    const table = screen.getByRole("table", { name: "RF readout" });
    for (const label of ["Z", "Y", "Gamma", "S11", "VSWR", "Return loss", "Mismatch loss"]) expect(within(table).getByText(label)).toBeInTheDocument();
    expect(table).not.toHaveTextContent("NaN");
  });
});
