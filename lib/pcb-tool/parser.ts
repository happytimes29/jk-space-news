import { TestPoint } from "./types";

const REFDES_CANDIDATES = ["refdes", "ref des", "ref_des", "component", "name", "ref"];
const X_CANDIDATES = ["sym_x", "x_loc", "x", "x_coord", "x coordinate", "x-coord", "xcoord", "x(mm)", "x (mm)"];
const Y_CANDIDATES = ["sym_y", "y_loc", "y", "y_coord", "y coordinate", "y-coord", "ycoord", "y(mm)", "y (mm)"];

function matchHeader(header: string, candidates: string[]): boolean {
  const h = header.trim().toLowerCase();
  return candidates.some((c) => h === c || h.startsWith(c));
}

/**
 * Parse OrCAD HTML test-point report.
 * Finds the first <table> whose headers contain RefDes, X, Y (case-insensitive).
 * Falls back to scanning every table until one matches.
 */
export function parseHTML(content: string): TestPoint[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const tables = Array.from(doc.querySelectorAll("table"));

  for (const table of tables) {
    const result = tryParseTable(table);
    if (result !== null) return result;
  }

  console.warn("[parser] No matching table found in HTML. Tables found:", tables.length);
  return [];
}

function tryParseTable(table: HTMLTableElement): TestPoint[] | null {
  // Use table.rows to get only this table's own rows (not rows in nested tables).
  // Scan every row to find the column header row — OrCAD HTML often has a
  // title/report-info row above the actual column headers, so we can't assume
  // the first row is always the header.
  const allRows = Array.from(table.rows);

  let headerRowIdx = -1;
  let refDesIdx = -1;
  let xIdx = -1;
  let yIdx = -1;
  let matchedHeaders: string[] = [];

  for (let i = 0; i < allRows.length; i++) {
    const cells = Array.from(allRows[i].cells).map(
      (el) => el.textContent?.trim() ?? ""
    );
    const ri = cells.findIndex((h) => matchHeader(h, REFDES_CANDIDATES));
    const xi = cells.findIndex((h) => matchHeader(h, X_CANDIDATES));
    const yi = cells.findIndex((h) => matchHeader(h, Y_CANDIDATES));
    if (ri !== -1 && xi !== -1 && yi !== -1) {
      headerRowIdx = i;
      refDesIdx = ri;
      xIdx = xi;
      yIdx = yi;
      matchedHeaders = cells;
      break;
    }
  }

  if (headerRowIdx === -1) {
    // Emit diagnostics so the dev can see exactly what headers were found
    if (allRows.length > 0) {
      const firstCells = Array.from(allRows[0].cells).map(
        (el) => `"${el.textContent?.trim()}"`
      );
      console.warn("[parser] Header scan failed. First-row cells:", firstCells.join(", "));
    }
    return null;
  }

  console.log(
    `[parser] Matched header at row ${headerRowIdx} —`,
    `RefDes:"${matchedHeaders[refDesIdx]}"`,
    `X:"${matchedHeaders[xIdx]}"`,
    `Y:"${matchedHeaders[yIdx]}"`
  );

  const dataRows = allRows.slice(headerRowIdx + 1);

  const points: TestPoint[] = [];

  for (const row of dataRows) {
    const cells = Array.from(row.cells).map(
      (el) => el.textContent?.trim() ?? ""
    );
    if (cells.length === 0) continue;

    const refDes = cells[refDesIdx]?.trim();
    const xRaw = cells[xIdx]?.trim();
    const yRaw = cells[yIdx]?.trim();

    if (!refDes || !xRaw || !yRaw) continue;

    const x = parseFloat(xRaw.replace(/,/g, ""));
    const y = parseFloat(yRaw.replace(/,/g, ""));

    if (isNaN(x) || isNaN(y)) {
      console.warn(`[parser] Non-numeric X/Y for "${refDes}": x="${xRaw}" y="${yRaw}"`);
      continue;
    }

    points.push({ refDes, x, y });
  }

  return points;
}

export function parseTargetList(text: string): Set<string> {
  const result = new Set<string>();
  const lines = text.split(/[\r\n,]+/);
  for (const line of lines) {
    const t = line.trim();
    if (t) result.add(t);
  }
  return result;
}
