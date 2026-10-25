"use client";

import type { Locale } from "@/lib/i18n/locales";
import type { ComparisonRow } from "@/lib/datasheet/types";
import { SourceEvidencePanel } from "./SourceEvidencePanel";

const LABELS: Record<Locale, { original: string; candidate: string; result: string; normalized: string; conditions: string }> = {
  en: { original: "Original", candidate: "Candidate", result: "Result", normalized: "Normalized", conditions: "Conditions" },
  "zh-TW": { original: "原料", candidate: "候選料", result: "結果", normalized: "標準化數值", conditions: "條件" },
  "zh-CN": { original: "原料", candidate: "候选料", result: "结果", normalized: "标准化数值", conditions: "条件" },
};

function formatNormalized(value: ComparisonRow["original"]): string | undefined {
  if (!value?.normalized) return undefined;
  const { min, typical, max, unit } = value.normalized;
  return [min === undefined ? undefined : `min ${min}`, typical === undefined ? undefined : `typ ${typical}`, max === undefined ? undefined : `max ${max}`]
    .filter(Boolean).join(" · ") + ` ${unit}`;
}

export function ComparisonMatrix({ locale, rows, originalFile, candidateFile }: {
  locale: Locale;
  rows: readonly ComparisonRow[];
  originalFile?: File;
  candidateFile?: File;
}) {
  const labels = LABELS[locale];
  return (
    <div className="datasheet-comparison-matrix">
      {rows.map((row) => <article key={row.field} data-testid={`comparison-${row.field}`} className={`datasheet-comparison-row status-${row.status}`}>
        <header>
          <h3>{row.field.replaceAll("_", " ")}</h3>
          <span className="datasheet-comparison-status">{row.status === "pass" ? "✓" : row.status === "soft-difference" ? "△" : row.status === "fail" ? "✕" : "?"} {row.reasonCode}</span>
        </header>
        <div className="datasheet-comparison-sides">
          <section>
            <h4>{labels.original}</h4>
            <p>{row.original?.rawValue ?? "—"}</p>
            {formatNormalized(row.original) && <p><strong>{labels.normalized}:</strong> {formatNormalized(row.original)}</p>}
            {row.original?.conditions.length ? <p><strong>{labels.conditions}:</strong> {row.original.conditions.join(" · ")}</p> : null}
            <SourceEvidencePanel locale={locale} evidence={row.original?.evidence ?? []} file={originalFile} defaultOpen={row.reasonCode === "manual_curve_review_required"} />
          </section>
          <section>
            <h4>{labels.candidate}</h4>
            <p>{row.candidate?.rawValue ?? "—"}</p>
            {formatNormalized(row.candidate) && <p><strong>{labels.normalized}:</strong> {formatNormalized(row.candidate)}</p>}
            {row.candidate?.conditions.length ? <p><strong>{labels.conditions}:</strong> {row.candidate.conditions.join(" · ")}</p> : null}
            <SourceEvidencePanel locale={locale} evidence={row.candidate?.evidence ?? []} file={candidateFile} defaultOpen={row.reasonCode === "manual_curve_review_required"} />
          </section>
        </div>
      </article>)}
    </div>
  );
}
