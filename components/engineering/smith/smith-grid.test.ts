import { describe, expect, it } from "vitest";
import { buildSmithGrid } from "./smith-grid";

describe("Smith grid geometry", () => {
  it.each(["impedance", "admittance"] as const)("builds a finite clipped %s grid", (mode) => {
    const grid = buildSmithGrid(mode);
    const paths = grid.filter((primitive) => primitive.kind === "path");
    expect(paths.length).toBeGreaterThan(10);
    for (const path of paths) {
      expect(path.points.length).toBeGreaterThan(1);
      for (const point of path.points) {
        expect(Number.isFinite(point.x) && Number.isFinite(point.y)).toBe(true);
        expect(Math.hypot(point.x, point.y)).toBeLessThanOrEqual(1.000000001);
      }
    }
    expect(grid.filter((primitive) => primitive.kind === "label").map(({ role }) => role)).toEqual(expect.arrayContaining(["center", "open", "short"]));
  });

  it("is symmetric about the real axis", () => {
    const paths = buildSmithGrid("impedance").filter((primitive) => primitive.kind === "path");
    for (const magnitude of [0.2, 0.5, 1, 2, 5]) {
      const positive = paths.find(({ id }) => id === `reactance-${magnitude}`)!;
      const negative = paths.find(({ id }) => id === `reactance-${-magnitude}`)!;
      expect(positive.points).toHaveLength(negative.points.length);
      positive.points.forEach((point, index) => {
        const mirror = negative.points[index];
        expect(point.x).toBeCloseTo(mirror.x, 10);
        expect(point.y).toBeCloseTo(-mirror.y, 10);
      });
    }
  });

  it("adds labeled major curves and fainter minor curves to the detailed grid", () => {
    const detailed = buildSmithGrid("impedance", "detailed");
    const compact = buildSmithGrid("impedance", "compact");
    const detailedPaths = detailed.filter((primitive) => primitive.kind === "path");
    const compactPaths = compact.filter((primitive) => primitive.kind === "path");
    const detailedLabels = detailed.filter((primitive) => primitive.kind === "value-label");

    expect(detailedPaths.map(({ id }) => id)).toEqual(expect.arrayContaining([
      "resistance-0.1",
      "resistance-10",
      "reactance-0.1",
      "reactance--10",
    ]));
    expect(detailedPaths.find(({ id }) => id === "resistance-0.1")).toMatchObject({ major: false });
    expect(detailedPaths.find(({ id }) => id === "resistance-10")).toMatchObject({ major: true });
    expect(detailedPaths.length).toBeGreaterThan(compactPaths.length);
    expect(detailedLabels.map(({ id }) => id)).toEqual(expect.arrayContaining([
      "resistance-label-0.2",
      "reactance-label-0.2",
      "reactance-label--0.2",
    ]));
    expect(compact.some((primitive) => primitive.kind === "value-label")).toBe(false);
  });
});
