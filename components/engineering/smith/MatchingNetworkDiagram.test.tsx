import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MatchSolution } from "@/lib/engineering/matching";
import type { NetworkStep } from "@/lib/engineering/network";
import { MatchingNetworkDiagram } from "./MatchingNetworkDiagram";

function solution(id: string, steps: [NetworkStep, NetworkStep], scale = 1): MatchSolution {
  return { id, character: steps.find((step) => step.connection === "series")?.component === "L" ? "low-pass" : "high-pass", steps: steps.map((step) => ({ ...step, value: step.value * scale })) as [NetworkStep, NetworkStep], matchedImpedance: { re: 50, im: 0 }, residualGammaMagnitude: 0 };
}

describe("MatchingNetworkDiagram", () => {
  it.each([
    [[{ id: "1", connection: "series", component: "L", value: 10e-9 }, { id: "2", connection: "shunt", component: "C", value: 2e-12 }], ["series", "shunt"], ["L", "C"]],
    [[{ id: "1", connection: "series", component: "C", value: 2e-12 }, { id: "2", connection: "shunt", component: "L", value: 10e-9 }], ["series", "shunt"], ["C", "L"]],
    [[{ id: "1", connection: "shunt", component: "C", value: 2e-12 }, { id: "2", connection: "series", component: "L", value: 10e-9 }], ["shunt", "series"], ["C", "L"]],
    [[{ id: "1", connection: "shunt", component: "L", value: 10e-9 }, { id: "2", connection: "series", component: "C", value: 2e-12 }], ["shunt", "series"], ["L", "C"]],
  ] as const)("draws the supplied two-step topology in order", (steps, connections, components) => {
    const ideal = solution("ideal", steps as unknown as [NetworkStep, NetworkStep]);
    const rounded = solution("rounded", steps as unknown as [NetworkStep, NetworkStep], 1.2);
    render(<MatchingNetworkDiagram label="Matching network" description="Two-component L match" ideal={ideal} rounded={rounded} sourceLabel="Source" loadLabel="Load" idealLabel="Ideal" roundedLabel="Rounded" />);
    const diagram = screen.getByRole("img", { name: "Matching network" });
    expect(diagram).toHaveTextContent("Source");
    expect(diagram).toHaveTextContent("Load");
    connections.forEach((connection, index) => {
      const group = within(diagram).getByTestId(`matching-step-${index}`);
      expect(group).toHaveAttribute("data-connection", connection);
      expect(group).toHaveAttribute("data-component", components[index]);
      if (connection === "shunt") expect(within(group).getByTestId(`matching-step-${index}-ground`)).toBeInTheDocument();
      expect(within(diagram).getByTestId(`matching-step-${index}-ideal`)).not.toHaveTextContent("—");
      expect(within(diagram).getByTestId(`matching-step-${index}-rounded`).textContent).not.toBe(within(diagram).getByTestId(`matching-step-${index}-ideal`).textContent);
    });
  });
});
