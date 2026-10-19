import { describe, expect, it } from "vitest";
import { nearestStandardValues } from "./standard-values";

describe("preferred component values", () => {
  it("returns deterministic E12 neighbors across adjacent decades", () => {
    expect(nearestStandardValues(4_700, 12, 3)).toEqual([4_700, 3_900, 5_600]);
    expect(nearestStandardValues(9.5, 12, 4)).toEqual([10, 8.2, 12, 6.8]);
  });

  it("supports the four declared IEC series", () => {
    expect(nearestStandardValues(4_990, 96, 1)).toEqual([4_990]);
    expect(nearestStandardValues(4_870, 48, 1)).toEqual([4_870]);
    expect(nearestStandardValues(5_100, 24, 1)).toEqual([5_100]);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])("returns no candidates for %s", (value) => {
    expect(nearestStandardValues(value, 24)).toEqual([]);
  });
});
