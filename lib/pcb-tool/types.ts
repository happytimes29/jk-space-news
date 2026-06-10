export interface TestPoint {
  refDes: string;
  x: number;
  y: number;
  /** Original row data for debugging */
  raw?: Record<string, string>;
}

export type ChangeStatus = "unchanged" | "moved" | "added" | "removed";

export interface CompareResult {
  refDes: string;
  status: ChangeStatus;
  oldX?: number;
  oldY?: number;
  newX?: number;
  newY?: number;
  deltaX?: number;
  deltaY?: number;
  distance?: number;
}

// ── DXF board outline types ──────────────────────────────────────────────────

export interface DXFLine {
  type: "line";
  layer: string;
  x1: number; y1: number;
  x2: number; y2: number;
}

export interface DXFArc {
  type: "arc";
  layer: string;
  cx: number; cy: number;
  r: number;
  /** degrees, counter-clockwise from +X axis (DXF convention) */
  startAngle: number;
  endAngle: number;
}

export interface DXFCircle {
  type: "circle";
  layer: string;
  cx: number; cy: number;
  r: number;
}

export interface DXFPolyline {
  type: "polyline";
  layer: string;
  vertices: Array<{ x: number; y: number }>;
  closed: boolean;
}

export type DXFEntity = DXFLine | DXFArc | DXFCircle | DXFPolyline;

export interface DXFData {
  entities: DXFEntity[];
  fileName: string;
  /** Number of entities before layer filtering — for diagnostics */
  totalParsed: number;
}
