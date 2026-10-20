import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PropagationDiagram } from "./PropagationDiagram";

const labels = {
  frequency: "Frequency", wavelength: "Wavelength", half: "Half wavelength", quarter: "Quarter wavelength",
  length: "Physical length", delay: "Delay", angle: "Electrical angle", medium: "Medium", waveDirection: "Wave direction",
};

describe("PropagationDiagram", () => {
  it("renders formatted propagation values and a repeated-wave marker in a fixed viewport", () => {
    render(<PropagationDiagram
      label="Propagation diagram"
      description="A travelling wave with wavelength markers."
      values={{ frequency: "1 GHz", wavelength: "299.792 mm", half: "149.896 mm", quarter: "74.9481 mm", length: "100 mm", delay: "333.564 ps", angle: "120.083°", medium: "Free space", repeated: true }}
      labels={labels}
      stale={false}
      staleLabel="Showing the last valid result."
    />);
    const diagram = screen.getByRole("img", { name: "Propagation diagram" });
    for (const text of ["1 GHz", "λ 299.792 mm", "λ/2 149.896 mm", "λ/4 74.9481 mm", "100 mm", "120.083°", "333.564 ps", "Free space"]) {
      expect(diagram).toHaveTextContent(text);
    }
    expect(within(diagram).getByTestId("propagation-repeat-marker")).toHaveTextContent("…");
    expect(diagram).toHaveAttribute("viewBox", "0 0 720 360");
  });
});
