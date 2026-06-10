"use client";

import { CompareResult, ChangeStatus } from "@/lib/pcb-tool/types";

interface Props {
  results: CompareResult[];
  filter: ChangeStatus | "all";
}

const STATUS_STYLES: Record<ChangeStatus, { label: string; color: string; bg: string }> = {
  moved:     { label: "Moved",     color: "var(--moved)",     bg: "rgba(240,136,62,0.1)" },
  added:     { label: "Added",     color: "var(--tech-blue)", bg: "rgba(88,166,255,0.1)" },
  removed:   { label: "Removed",   color: "var(--removed)",   bg: "rgba(248,81,73,0.1)" },
  unchanged: { label: "Unchanged", color: "var(--unchanged)", bg: "transparent" },
};

function fmt(n?: number): string {
  if (n === undefined || n === null) return "—";
  return n.toFixed(4);
}

function fmtDelta(n?: number): string {
  if (n === undefined || n === null || n === 0) return "—";
  return (n > 0 ? "+" : "") + n.toFixed(4);
}

export default function ResultTable({ results, filter }: Props) {
  const filtered = filter === "all" ? results : results.filter((r) => r.status === filter);

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-[var(--foreground-muted)] text-sm">
        無符合條件的資料
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {["RefDes", "狀態", "Old X", "Old Y", "New X", "New Y", "ΔX", "ΔY", "距離"].map((h) => (
              <th
                key={h}
                className="py-2 px-3 text-left font-medium text-[var(--foreground-muted)] whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => {
            const style = STATUS_STYLES[row.status];
            return (
              <tr
                key={row.refDes}
                className="border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors"
                style={{ backgroundColor: style.bg }}
              >
                <td className="py-2 px-3 font-mono font-medium text-[var(--foreground)]">
                  {row.refDes}
                </td>
                <td className="py-2 px-3">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: style.color, border: `1px solid ${style.color}40`, backgroundColor: style.bg }}
                  >
                    {style.label}
                  </span>
                </td>
                <td className="py-2 px-3 font-mono text-[var(--foreground-muted)]">{fmt(row.oldX)}</td>
                <td className="py-2 px-3 font-mono text-[var(--foreground-muted)]">{fmt(row.oldY)}</td>
                <td className="py-2 px-3 font-mono text-[var(--foreground-muted)]">{fmt(row.newX)}</td>
                <td className="py-2 px-3 font-mono text-[var(--foreground-muted)]">{fmt(row.newY)}</td>
                <td className="py-2 px-3 font-mono" style={{ color: row.deltaX ? style.color : "var(--foreground-muted)" }}>
                  {fmtDelta(row.deltaX)}
                </td>
                <td className="py-2 px-3 font-mono" style={{ color: row.deltaY ? style.color : "var(--foreground-muted)" }}>
                  {fmtDelta(row.deltaY)}
                </td>
                <td className="py-2 px-3 font-mono" style={{ color: row.distance ? style.color : "var(--foreground-muted)" }}>
                  {row.distance ? row.distance.toFixed(4) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
