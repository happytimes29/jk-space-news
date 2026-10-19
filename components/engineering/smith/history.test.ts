import { describe, expect, it } from "vitest";
import { createHistory, pushHistory, redoHistory, undoHistory } from "./history";

describe("immutable Smith history", () => {
  it("supports undo and redo without mutating previous snapshots", () => {
    const initial = createHistory([{ id: "a" }]);
    const changed = pushHistory(initial, [{ id: "a" }, { id: "b" }]);
    const undone = undoHistory(changed);
    const redone = redoHistory(undone);
    expect(initial).toEqual({ past: [], present: [{ id: "a" }], future: [] });
    expect(undone.present).toEqual([{ id: "a" }]);
    expect(redone.present).toEqual([{ id: "a" }, { id: "b" }]);
  });

  it("clears redo when a new edit follows undo", () => {
    const history = pushHistory(pushHistory(createHistory<number[]>([]), [1]), [1, 2]);
    const undone = undoHistory(history);
    const edited = pushHistory(undone, [1, 3]);
    expect(edited.future).toEqual([]);
    expect(redoHistory(edited)).toBe(edited);
  });
});
