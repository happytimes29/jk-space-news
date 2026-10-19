export interface SmithHistory<T> {
  past: T[];
  present: T;
  future: T[];
}

export function createHistory<T>(initial: T): SmithHistory<T> {
  return { past: [], present: initial, future: [] };
}

export function pushHistory<T>(history: SmithHistory<T>, next: T): SmithHistory<T> {
  return { past: [...history.past, history.present], present: next, future: [] };
}

export function undoHistory<T>(history: SmithHistory<T>): SmithHistory<T> {
  if (history.past.length === 0) return history;
  return { past: history.past.slice(0, -1), present: history.past.at(-1)!, future: [history.present, ...history.future] };
}

export function redoHistory<T>(history: SmithHistory<T>): SmithHistory<T> {
  if (history.future.length === 0) return history;
  return { past: [...history.past, history.present], present: history.future[0], future: history.future.slice(1) };
}
