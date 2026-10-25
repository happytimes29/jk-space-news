"use client";

import type { Locale } from "@/lib/i18n/locales";
import type { ComparisonRow } from "@/lib/datasheet/types";
import { SourceEvidencePanel } from "./SourceEvidencePanel";

const LABELS: Record<Locale, { original: string; candidate: string; result: string }> = {
  en: { original: "Original", candidate: "Candidate", result: "Result" },
  "zh-TW": { original: "原料", candidate: "候選料", result: "結果" },
  "zh-CN": { original: "原料", candidate: "候选料", result: "结果" },
};

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
            <SourceEvidencePanel locale={locale} evidence={row.original?.evidence ?? []} file={originalFile} defaultOpen={row.reasonCode === "manual_curve_review_required"} />
          </section>
          <section>
            <h4>{labels.candidate}</h4>
            <p>{row.candidate?.rawValue ?? "—"}</p>
            <SourceEvidencePanel locale={locale} evidence={row.candidate?.evidence ?? []} file={candidateFile} defaultOpen={row.reasonCode === "manual_curve_review_required"} />
          </section>
        </div>
      </article>)}
    </div>
  );
}
