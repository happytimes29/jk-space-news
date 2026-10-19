import { describe, expect, it } from "vitest";
import { decodeToolState, encodeToolState } from "./query-state";

describe("engineering tool query state", () => {
  it("serializes keys lexicographically and preserves supported scalar values", () => {
    expect(encodeToolState({ z: true, value: "4k7", count: 2, a: false })).toBe("a=false&count=2&value=4k7&z=true");
  });

  it("allows only known keys and drops oversized values", () => {
    expect(decodeToolState("?mode=rf&value=4k7&secret=hidden&notes=" + "x".repeat(201), ["mode", "value", "notes"]))
      .toEqual({ mode: "rf", value: "4k7" });
  });

  it("returns an empty safe state for malformed percent encoding", () => {
    expect(decodeToolState("?mode=%E0%A4%A&value=50", ["mode", "value"])).toEqual({});
    expect(decodeToolState("?%ZZ=value", ["mode"])).toEqual({});
  });

  it("does not expose prototype-derived state", () => {
    const state = decodeToolState("?constructor=bad&__proto__=bad&mode=general", ["constructor", "__proto__", "mode"]);
    expect(state).toEqual({ mode: "general" });
    expect(Object.getPrototypeOf(state)).toBe(Object.prototype);
  });
});
