import { TestPoint, CompareResult } from "./types";

const EPSILON = 1e-6;

export function compareTestPoints(
  oldPoints: TestPoint[],
  newPoints: TestPoint[],
  targetList?: Set<string>
): CompareResult[] {
  // Pre-filter by target list if provided
  const filter = (pts: TestPoint[]) =>
    targetList && targetList.size > 0
      ? pts.filter((p) => targetList.has(p.refDes))
      : pts;

  const filteredOld = filter(oldPoints);
  const filteredNew = filter(newPoints);

  const oldMap = new Map(filteredOld.map((p) => [p.refDes, p]));
  const newMap = new Map(filteredNew.map((p) => [p.refDes, p]));

  const results: CompareResult[] = [];
  const allKeys = new Set([...oldMap.keys(), ...newMap.keys()]);

  for (const refDes of allKeys) {
    const oldPt = oldMap.get(refDes);
    const newPt = newMap.get(refDes);

    if (oldPt && newPt) {
      const dx = newPt.x - oldPt.x;
      const dy = newPt.y - oldPt.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const moved = Math.abs(dx) > EPSILON || Math.abs(dy) > EPSILON;

      results.push({
        refDes,
        status: moved ? "moved" : "unchanged",
        oldX: oldPt.x,
        oldY: oldPt.y,
        newX: newPt.x,
        newY: newPt.y,
        deltaX: moved ? dx : 0,
        deltaY: moved ? dy : 0,
        distance: moved ? dist : 0,
      });
    } else if (!oldPt && newPt) {
      results.push({
        refDes,
        status: "added",
        newX: newPt.x,
        newY: newPt.y,
      });
    } else if (oldPt && !newPt) {
      results.push({
        refDes,
        status: "removed",
        oldX: oldPt.x,
        oldY: oldPt.y,
      });
    }
  }

  // Sort: moved first, then added, removed, unchanged
  const order: Record<string, number> = { moved: 0, added: 1, removed: 2, unchanged: 3 };
  results.sort((a, b) => {
    const diff = (order[a.status] ?? 9) - (order[b.status] ?? 9);
    if (diff !== 0) return diff;
    return a.refDes.localeCompare(b.refDes);
  });

  return results;
}
