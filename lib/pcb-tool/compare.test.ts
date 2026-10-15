import { describe, expect, it } from "vitest";
import { compareTestPoints } from "./compare";

const oldPoints = [{ refDes: "TP1", x: 0, y: 0 }, { refDes: "TP2", x: 10, y: 20 }, { refDes: "TP3", x: 4, y: 5 }];
const newPoints = [{ refDes: "TP1", x: 3, y: 4 }, { refDes: "TP2", x: 10, y: 20 }, { refDes: "TP4", x: 6, y: 7 }];

describe("test point comparison", () => {
  it("reports all four states with coordinates and movement distance in status order", () => {
    expect(compareTestPoints(oldPoints, newPoints)).toEqual([
      { refDes: "TP1", status: "moved", oldX: 0, oldY: 0, newX: 3, newY: 4, deltaX: 3, deltaY: 4, distance: 5 },
      { refDes: "TP4", status: "added", newX: 6, newY: 7 },
      { refDes: "TP3", status: "removed", oldX: 4, oldY: 5 },
      { refDes: "TP2", status: "unchanged", oldX: 10, oldY: 20, newX: 10, newY: 20, deltaX: 0, deltaY: 0, distance: 0 },
    ]);
  });
  it("filters both revisions by Target List while an empty list retains every point", () => {
    expect(compareTestPoints(oldPoints, newPoints, new Set(["TP3", "TP4"]))).toEqual([
      { refDes: "TP4", status: "added", newX: 6, newY: 7 },
      { refDes: "TP3", status: "removed", oldX: 4, oldY: 5 },
    ]);
    expect(compareTestPoints(oldPoints, newPoints, new Set())).toHaveLength(4);
  });
  it("ignores sub-epsilon movement", () => {
    expect(compareTestPoints([{ refDes: "TP1", x: 0, y: 0 }], [{ refDes: "TP1", x: 0.0000005, y: 0 }])[0]).toMatchObject({ status: "unchanged", distance: 0, deltaX: 0 });
  });
});
