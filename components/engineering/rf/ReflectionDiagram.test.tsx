import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReflectionDiagram } from "./ReflectionDiagram";

const labels = { incident: "Incident wave", reflected: "Reflected wave", load: "Load", zeroReflection: "No reflected wave" };
const baseValues = { z0: "50 Ω", zLoad: "50 + j0 Ω", gamma: "0 + j0", vswr: "1", returnLoss: "∞ dB", magnitude: 0 };

describe("ReflectionDiagram", () => {
  it.each([
    ["finite", baseValues, "finite-load"],
    ["short", { ...baseValues, zLoad: "0 Ω", gamma: "−1 + j0", magnitude: 1 }, "short-load"],
    ["open", { ...baseValues, zLoad: "∞ Ω", gamma: "1 + j0", magnitude: 1 }, "open-load"],
  ] as const)("renders the %s termination explicitly", (limit, values, marker) => {
    render(<ReflectionDiagram label="Reflection diagram" description="Incident and reflected waves at a load." values={values} labels={labels} limit={limit} stale={false} staleLabel="Last valid" />);
    const diagram = screen.getByRole("img", { name: "Reflection diagram" });
    expect(within(diagram).getByTestId(marker)).toBeInTheDocument();
    expect(diagram).toHaveTextContent(values.gamma);
  });

  it("keeps a unit-magnitude imaginary reflection finite", () => {
    render(<ReflectionDiagram label="Reflection diagram" description="Incident and reflected waves at a load." values={{ ...baseValues, gamma: "0 + j1", magnitude: 1, vswr: "∞" }} labels={labels} limit="finite" stale={false} staleLabel="Last valid" />);
    const diagram = screen.getByRole("img", { name: "Reflection diagram" });
    expect(within(diagram).getByTestId("finite-load")).toBeInTheDocument();
    expect(within(diagram).queryByTestId("open-load")).not.toBeInTheDocument();
    expect(within(diagram).queryByTestId("short-load")).not.toBeInTheDocument();
  });
});
