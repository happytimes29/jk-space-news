export type ESeries = 12 | 24 | 48 | 96;

const SERIES: Record<ESeries, readonly number[]> = {
  12: [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2],
  24: [1, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2, 2.2, 2.4, 2.7, 3, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1],
  48: [100, 105, 110, 115, 121, 127, 133, 140, 147, 154, 162, 169, 178, 187, 196, 205, 215, 226, 237, 249, 261, 274, 287, 301, 316, 332, 348, 365, 383, 402, 422, 442, 464, 487, 511, 536, 562, 590, 619, 649, 681, 715, 750, 787, 825, 866, 909, 953].map((value) => value / 100),
  96: [100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 133, 137, 140, 143, 147, 150, 154, 158, 162, 165, 169, 174, 178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232, 237, 243, 249, 255, 261, 267, 274, 280, 287, 294, 301, 309, 316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412, 422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549, 562, 576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732, 750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953, 976].map((value) => value / 100),
};

export function nearestStandardValues(value: number, series: ESeries, count = 5): number[] {
  if (!Number.isFinite(value) || value <= 0 || count <= 0) return [];
  const decade = Math.floor(Math.log10(value));
  const candidates = new Set<number>();
  for (let offset = -1; offset <= 1; offset += 1) {
    const multiplier = 10 ** (decade + offset);
    for (const mantissa of SERIES[series]) candidates.add(mantissa * multiplier);
  }
  return [...candidates]
    .filter((candidate) => Number.isFinite(candidate) && candidate > 0)
    .sort((left, right) => {
      const error = Math.abs(left - value) / value - Math.abs(right - value) / value;
      return error || left - right;
    })
    .slice(0, Math.floor(count));
}
