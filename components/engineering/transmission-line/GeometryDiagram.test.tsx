import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GeometryDiagram } from "./GeometryDiagram";

describe("GeometryDiagram", () => {
  it.each([
    ["microstrip", ["W", "t", "h"]],
    ["stripline", ["W", "t", "b"]],
    ["cpwg", ["W", "t", "h", "s"]],
  ] as const)("labels %s geometry", (kind, labels) => {
    render(<GeometryDiagram kind={kind} title={`${kind} geometry`} labels={{ width: "W", thickness: "t", height: "h", planes: "b", gap: "s" }} />);
    const image = screen.getByRole("img", { name: `${kind} geometry` });
    for (const label of labels) expect(image).toHaveTextContent(label);
  });
});
