const MAX_VALUE_LENGTH = 200;
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function encodeToolState(state: Record<string, string | number | boolean>): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(state).sort()) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    const value = String(state[key]);
    if (value.length > MAX_VALUE_LENGTH) continue;
    params.set(key, value);
  }
  return params.toString();
}

export function decodeToolState(search: string, allowedKeys: readonly string[]): Record<string, string> {
  const state: Record<string, string> = {};
  const allowed = new Set(allowedKeys.filter((key) => !FORBIDDEN_KEYS.has(key)));
  const query = search.startsWith("?") ? search.slice(1) : search;
  if (!query) return state;

  try {
    for (const pair of query.split("&")) {
      const separator = pair.indexOf("=");
      const rawKey = separator < 0 ? pair : pair.slice(0, separator);
      const rawValue = separator < 0 ? "" : pair.slice(separator + 1);
      const key = decodeURIComponent(rawKey.replace(/\+/g, " "));
      const value = decodeURIComponent(rawValue.replace(/\+/g, " "));
      if (!allowed.has(key) || value.length > MAX_VALUE_LENGTH) continue;
      state[key] = value;
    }
  } catch {
    return {};
  }
  return state;
}
