import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DiagramStatusNotice,
  EngineeringDiagramFrame,
} from "./EngineeringDiagramFrame";
import {
  CapacitorSymbol,
  GroundSymbol,
  InductorSymbol,
  ResistorSymbol,
} from "./CircuitSymbols";

describe("EngineeringDiagramFrame", () => {
  it("exposes a localized accessible title and description", () => {
    render(
      <EngineeringDiagramFrame
        label="Voltage divider diagram"
        title="Voltage divider"
        description="R1 is above R2 and Vout is measured across R2."
        viewBox="0 0 400 200"
        stale={false}
        staleLabel="Showing the last valid values"
      >
        <ResistorSymbol x1={20} y1={40} x2={120} y2={40} testId="resistor" />
        <InductorSymbol x1={140} y1={40} x2={240} y2={40} testId="inductor" />
        <CapacitorSymbol x1={280} y1={20} x2={280} y2={80} orientation="vertical" testId="capacitor" />
        <GroundSymbol x={340} y={90} testId="ground" />
      </EngineeringDiagramFrame>,
    );

    const image = screen.getByRole("img", { name: "Voltage divider diagram" });
    expect(image).toHaveTextContent("Voltage divider");
    expect(image).toHaveTextContent("R1 is above R2 and Vout is measured across R2.");
    expect(image).not.toHaveAttribute("data-stale");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    for (const testId of ["resistor", "inductor", "capacitor", "ground"]) {
      expect(image).toContainElement(screen.getByTestId(testId));
    }
  });

  it("marks stale graphics while keeping the notice outside the SVG", () => {
    render(
      <EngineeringDiagramFrame
        label="RF diagram"
        title="RF result"
        description="Last valid result"
        viewBox="0 0 400 200"
        stale
        staleLabel="Showing the last valid values"
      >
        <circle cx="10" cy="10" r="5" />
      </EngineeringDiagramFrame>,
    );

    const image = screen.getByRole("img", { name: "RF diagram" });
    const notice = screen.getByRole("status");
    expect(image).toHaveAttribute("data-stale", "true");
    expect(notice).toHaveTextContent("Showing the last valid values");
    expect(image).not.toContainElement(notice);
  });
});

describe("DiagramStatusNotice", () => {
  it("renders only for stale diagrams", () => {
    const { rerender } = render(<DiagramStatusNotice stale={false} label="Last valid" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    rerender(<DiagramStatusNotice stale label="Last valid" />);
    expect(screen.getByRole("status")).toHaveTextContent("Last valid");
  });
});
