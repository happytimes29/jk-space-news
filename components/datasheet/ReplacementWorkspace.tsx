"use client";

import { useMemo, useState } from "react";
import { compareDatasheets, type AnalysisResult } from "@/lib/datasheet/analysis";
import { evaluateReplacement } from "@/lib/datasheet/replacement";
import type { Locale } from "@/lib/i18n/locales";
import type { ReplacementReport } from "@/lib/datasheet/types";
import { ComparisonMatrix } from "./ComparisonMatrix";
import { ReportExport, type ReportDownloader } from "./ReportExport";
import { buildWorkConditions, conditionDraftIssues, emptyConditionDraft, WorkConditionsForm } from "./WorkConditionsForm";

const COPY: Record<Locale, {
  differences: string;
  noConditions: string;
  evaluate: string;
  kindError: string;
  codeError: string;
  verdict: string;
  blockers: string;
  risks: string;
  footprint: string;
  external: string;
  process: string;
  verdicts: Record<ReplacementReport["verdict"], string>;
}> = {
  en: {
    differences: "Specification differences",
    noConditions: "Add at least one real work condition before asking for a replacement verdict.",
    evaluate: "Evaluate replacement",
    kindError: "Both PDFs must use the same supported component type.",
    codeError: "Select an exact Ordering Code for both PDFs before evaluation.",
    verdict: "Replacement verdict",
    blockers: "Blockers",
    risks: "Conditional risks",
    footprint: "Footprint and terminal layout are compatible",
    external: "External component changes are required",
    process: "Assembly process changes are required",
    verdicts: { "direct-replacement": "✓ Direct replacement", conditional: "△ Conditional replacement", "not-recommended": "✕ Not recommended", "insufficient-evidence": "? Evidence incomplete" },
  },
  "zh-TW": {
    differences: "規格差異",
    noConditions: "請至少加入一項真實工作條件，才能要求替代結論。",
    evaluate: "評估替代料",
    kindError: "兩份 PDF 必須是相同且受支援的元件類型。",
    codeError: "評估前，兩份 PDF 都必須選定完整 Ordering Code。",
    verdict: "替代結論",
    blockers: "阻擋項目",
    risks: "條件式風險",
    footprint: "封裝焊盤與端點配置相容",
    external: "需要修改外部元件",
    process: "需要修改組裝製程",
    verdicts: { "direct-replacement": "✓ 可直接替代", conditional: "△ 條件式可替代", "not-recommended": "✕ 不建議替代", "insufficient-evidence": "? 證據不足" },
  },
  "zh-CN": {
    differences: "规格差异",
    noConditions: "请至少加入一项真实工作条件，才能要求替代结论。",
    evaluate: "评估替代料",
    kindError: "两份 PDF 必须是相同且受支持的元件类型。",
    codeError: "评估前，两份 PDF 都必须选定完整 Ordering Code。",
    verdict: "替代结论",
    blockers: "阻挡项目",
    risks: "条件式风险",
    footprint: "封装焊盘与端点配置兼容",
    external: "需要修改外部元件",
    process: "需要修改组装制程",
    verdicts: { "direct-replacement": "✓ 可直接替代", conditional: "△ 条件式可替代", "not-recommended": "✕ 不建议替代", "insufficient-evidence": "? 证据不足" },
  },
};

export function VerdictBanner({ locale, report }: { locale: Locale; report: ReplacementReport }) {
  const copy = COPY[locale];
  return <section className={`datasheet-verdict verdict-${report.verdict}`} aria-labelledby="datasheet-verdict-title">
    <h2 id="datasheet-verdict-title">{copy.verdict}</h2>
    <p className="datasheet-verdict__label">{copy.verdicts[report.verdict]}</p>
  </section>;
}

export function ReplacementWorkspace({ locale, original, candidate, originalFile, candidateFile, download }: {
  locale: Locale;
  original: AnalysisResult;
  candidate: AnalysisResult;
  originalFile?: File;
  candidateFile?: File;
  download?: ReportDownloader;
}) {
  const copy = COPY[locale];
  const [draft, setDraft] = useState(emptyConditionDraft);
  const [footprintCompatible, setFootprintCompatible] = useState(false);
  const [externalChangesRequired, setExternalChangesRequired] = useState(false);
  const [processChangesRequired, setProcessChangesRequired] = useState(false);
  const [report, setReport] = useState<ReplacementReport>();
  const sameKind = original.envelope.componentKind === candidate.envelope.componentKind;
  const exactCodes = Boolean(original.envelope.selectedOrderingCode && candidate.envelope.selectedOrderingCode);
  const conditions = useMemo(
    () => buildWorkConditions(original.envelope.componentKind, draft),
    [draft, original.envelope.componentKind],
  );
  const conditionIssues = useMemo(() => conditionDraftIssues(original.envelope.componentKind, draft), [draft, original.envelope.componentKind]);
  const baseline = useMemo(() => evaluateReplacement({
    original: original.envelope,
    candidate: candidate.envelope,
    conditions: { componentKind: original.envelope.componentKind, pcbChangeAllowed: false, requirements: [] },
    footprintCompatible: true,
  }), [candidate.envelope, original.envelope]);

  if (!sameKind) return <p role="alert">{copy.kindError}</p>;
  if (!exactCodes) return <p role="alert">{copy.codeError}</p>;

  const evaluate = async () => {
    if (conditionIssues.length > 0) return;
    setReport(await compareDatasheets({
      original,
      candidate,
      conditions,
      footprintCompatible,
      externalChangesRequired,
      processChangesRequired,
    }));
  };
  const activeRows = report?.comparisons ?? baseline.comparisons;
  const blockers = report?.comparisons.filter(({ status }) => status === "fail" || status === "insufficient-evidence") ?? [];
  const risks = report?.comparisons.filter(({ status }) => status === "soft-difference") ?? [];

  return <section className="datasheet-replacement-workspace">
    <WorkConditionsForm kind={original.envelope.componentKind} draft={draft} onChange={(next) => { setDraft(next); setReport(undefined); }} />
    <fieldset className="datasheet-replacement-switches">
      <label><input type="checkbox" checked={footprintCompatible} onChange={(event) => { setFootprintCompatible(event.target.checked); setReport(undefined); }} /> {copy.footprint}</label>
      <label><input type="checkbox" checked={externalChangesRequired} onChange={(event) => { setExternalChangesRequired(event.target.checked); setReport(undefined); }} /> {copy.external}</label>
      <label><input type="checkbox" checked={processChangesRequired} onChange={(event) => { setProcessChangesRequired(event.target.checked); setReport(undefined); }} /> {copy.process}</label>
    </fieldset>
    {conditionIssues.length > 0 && conditions.requirements.length > 0 && <p role="alert">Complete or correct all required work conditions.</p>}
    <button type="button" disabled={conditionIssues.length > 0} onClick={() => void evaluate()}>{copy.evaluate}</button>

    {!report && <p>{copy.noConditions}</p>}
    {report && <div data-testid="replacement-result">
      <VerdictBanner locale={locale} report={report} />
      <section><h2>{copy.blockers}</h2>{blockers.length === 0 ? <p>—</p> : <ul>{blockers.map((row) => <li key={row.field}>{row.field}: {row.reasonCode}</li>)}</ul>}</section>
      <section><h2>{copy.risks}</h2>{risks.length === 0 ? <p>—</p> : <ul>{risks.map((row) => <li key={row.field}>{row.field}: {row.reasonCode}</li>)}</ul>}</section>
      <ReportExport report={{ schemaVersion: 1, mode: "replacement", original, candidate, conditions, replacement: report }} download={download} />
    </div>}

    <section aria-labelledby="datasheet-differences-title">
      <h2 id="datasheet-differences-title">{copy.differences}</h2>
      <ComparisonMatrix locale={locale} rows={activeRows} originalFile={originalFile} candidateFile={candidateFile} />
    </section>
  </section>;
}
