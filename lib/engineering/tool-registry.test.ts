import { describe, expect, it } from "vitest";
import {
  ENGINEERING_TOOL_SLUGS,
  getEngineeringToolDefinition,
  isEngineeringToolSlug,
} from "./tool-registry";

describe("engineering tool registry", () => {
  it("registers only the initial three application slugs", () => {
    expect(ENGINEERING_TOOL_SLUGS).toEqual([
      "engineering-converter",
      "passive-circuit-calculator",
      "rf-calculator",
    ]);
    for (const slug of ENGINEERING_TOOL_SLUGS) {
      expect(isEngineeringToolSlug(slug)).toBe(true);
      expect(getEngineeringToolDefinition(slug)).toMatchObject({ slug });
    }
  });

  it("does not resolve arbitrary or prototype-derived keys", () => {
    for (const slug of ["smith-chart", "pcb-test-point", "constructor", "__proto__", ""]) {
      expect(isEngineeringToolSlug(slug)).toBe(false);
      expect(getEngineeringToolDefinition(slug)).toBeUndefined();
    }
  });
});
