import { expect, it } from "vitest";
import { parseDXF } from "./parseDXF";

function drawing(layer: string) {
  return `0\nSECTION\n2\nENTITIES\n0\nLINE\n8\n${layer}\n10\n1\n20\n2\n11\n3\n21\n4\n0\nCIRCLE\n8\nDrills\n10\n2\n20\n3\n40\n1\n0\nENDSEC\n0\nEOF`;
}

it("selects recognized outline layers and preserves parsed diagnostics", () => {
  expect(parseDXF(drawing("Edge.Cuts"), "board.dxf")).toEqual({ fileName: "board.dxf", totalParsed: 2, entities: [{ type: "line", layer: "Edge.Cuts", x1: 1, y1: 2, x2: 3, y2: 4 }] });
});

it("falls back to non-circle geometry when no outline layer is recognized", () => {
  expect(parseDXF(drawing("Custom"), "fallback.dxf")).toEqual({ fileName: "fallback.dxf", totalParsed: 2, entities: [{ type: "line", layer: "Custom", x1: 1, y1: 2, x2: 3, y2: 4 }] });
});
