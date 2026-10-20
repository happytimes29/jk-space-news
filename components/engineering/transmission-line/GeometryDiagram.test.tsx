import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GeometryDiagram } from "./GeometryDiagram";

describe("GeometryDiagram", () => {
  const labels = {
    width: "W", thickness: "t", height: "h", planes: "b", gap: "s",
    conductor: "Conductor", dielectric: "Dielectric", ground: "Ground",
    impedance: "Z0", electricalAngle: "Angle",
  };
  const values = {
    width: "3 mm", thickness: "0.035 mm", heightOrPlanes: "1.6 mm", gap: "0.2 mm",
    permittivity: "εr 4.3", impedance: "49.2 Ω", electricalAngle: "120°",
  };

  it.each([
    ["microstrip", ["W", "t", "h"]],
    ["stripline", ["W", "t", "b"]],
    ["cpwg", ["W", "t", "h", "s"]],
  ] as const)("labels %s geometry with live values", (kind, expectedLabels) => {
    render(<GeometryDiagram kind={kind} title={`${kind} geometry`} description="Live geometry values" labels={labels} values={values} stale={false} staleLabel="Last valid result" />);
    const image = screen.getByRole("img", { name: `${kind} geometry` });
    for (const label of expectedLabels) expect(image).toHaveTextContent(label);
    for (const value of [values.width, values.thickness, values.heightOrPlanes, values.permittivity, values.impedance, values.electricalAngle]) expect(image).toHaveTextContent(value);
    for (const legend of [labels.conductor, labels.dielectric, labels.ground]) expect(image).toHaveTextContent(legend);
    if (kind === "cpwg") expect(image).toHaveTextContent(values.gap);
    expect(image).toHaveAccessibleDescription(`${kind} geometry Live geometry values`);
  });

  it("marks a stale snapshot and explains that it is the last valid result", () => {
    render(<GeometryDiagram kind="microstrip" title="Geometry" description="Live geometry values" labels={labels} values={values} stale staleLabel="Last valid result" />);
    expect(screen.getByRole("img", { name: "Geometry" })).toHaveAttribute("data-stale", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Last valid result");
  });
});
