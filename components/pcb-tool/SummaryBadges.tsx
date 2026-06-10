"use client";

import { CompareResult, ChangeStatus } from "@/lib/pcb-tool/types";

interface Props {
  results: CompareResult[];
  activeFilter: ChangeStatus | "all";
  onFilter: (f: ChangeStatus | "all") => void;
}

const FILTERS: { key: ChangeStatus | "all"; label: string; colorVar: string }[] = [
  { key: "all",       label: "All",       colorVar: "var(--tech-blue)" },
  { key: "moved",     label: "Moved",     colorVar: "var(--moved)" },
  { key: "added",     label: "Added",     colorVar: "var(--added)" },
  { key: "removed",   label: "Removed",   colorVar: "var(--removed)" },
  { key: "unchanged", label: "Unchanged", colorVar: "var(--unchanged)" },
];

export default function SummaryBadges({ results, activeFilter, onFilter }: Props) {
  const counts: Record<string, number> = {
    all: results.length,
    moved: results.filter((r) => r.status === "moved").length,
    added: results.filter((r) => r.status === "added").length,
    removed: results.filter((r) => r.status === "removed").length,
    unchanged: results.filter((r) => r.status === "unchanged").length,
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ key, label, colorVar }) => {
        const isActive = activeFilter === key;
        return (
          <button
            key={key}
            onClick={() => onFilter(key)}
            style={
              isActive
                ? { borderColor: colorVar, color: colorVar, backgroundColor: colorVar + "20" }
                : {}
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all
              ${isActive
                ? "border-current"
                : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
              }`}
          >
            <span>{label}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-mono"
              style={{ backgroundColor: isActive ? colorVar + "30" : "var(--surface-2)" }}
            >
              {counts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
