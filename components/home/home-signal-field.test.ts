import { describe, expect, it } from "vitest";
import { computeSignalFrame, selectSignalFieldMode } from "./home-signal-field";

describe("signal field capability selection", () => {
  it.each([
    ["reduced motion", { reducedMotion: true, coarsePointer: false, canvasAvailable: true }],
    ["coarse pointer", { reducedMotion: false, coarsePointer: true, canvasAvailable: true }],
    ["missing canvas", { reducedMotion: false, coarsePointer: false, canvasAvailable: false }],
  ] as const)("uses the static end state for %s", (_reason, input) => {
    expect(selectSignalFieldMode(input)).toBe("static");
  });

  it("uses the interactive field only when every capability is present", () => {
    expect(selectSignalFieldMode({ reducedMotion: false, coarsePointer: false, canvasAvailable: true })).toBe("interactive");
  });
});

describe("signal field frame", () => {
  it("clamps progress and finishes at the brass match point with the JK mark visible", () => {
    const frame = computeSignalFrame({ progress: 2, pointer: null, width: 1000, height: 600 });

    expect(frame.progress).toBe(1);
    expect(frame.signalPath.at(-1)).toEqual(frame.matchPoint);
    expect(frame.matchPoint).toEqual({ x: 680, y: 264 });
    expect(frame.jkMark).toMatchObject({ x: 500, y: 300, opacity: 1 });
    expect(frame.smithArcs.length).toBeGreaterThanOrEqual(4);
  });

  it("returns a safe empty frame when the drawing surface has no area", () => {
    const frame = computeSignalFrame({ progress: 0.5, pointer: { x: 0, y: 0 }, width: 0, height: -1 });

    expect(frame.nodes).toEqual([]);
    expect(frame.traces).toEqual([]);
    expect(frame.smithArcs).toEqual([]);
    expect(frame.signalPath).toEqual([]);
    expect(frame.matchPoint).toBeNull();
    expect(frame.jkMark).toBeNull();
  });

  it("limits pointer disturbance to nearby nodes", () => {
    const still = computeSignalFrame({ progress: 0.4, pointer: null, width: 1000, height: 600 });
    const moved = computeSignalFrame({ progress: 0.4, pointer: { x: 220, y: 180 }, width: 1000, height: 600 });
    const deltas = moved.nodes.map((node, index) => Math.hypot(node.x - still.nodes[index].x, node.y - still.nodes[index].y));

    expect(deltas.some((delta) => delta > 0)).toBe(true);
    expect(deltas.some((delta) => delta === 0)).toBe(true);
  });
});
