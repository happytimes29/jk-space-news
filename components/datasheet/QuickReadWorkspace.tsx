"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AnalysisResult, ModelTransport } from "@/lib/datasheet/analysis";
import type { Locale } from "@/lib/i18n/locales";
import { askDatasheet, type GroundedAnswer } from "@/lib/datasheet/question-answering";
import { SourceEvidencePanel } from "./SourceEvidencePanel";
import { SpecificationTable } from "./SpecificationTable";

const COPY: Record<Locale, {
  identity: string; limitations: string; noLimitations: string; manual: string; checklist: string; question: string; ask: string; placeholder: string; modelNote: string;
}> = {
  "zh-TW": { identity: "元件識別", limitations: "限制與待確認項目", noLimitations: "目前沒有已知缺失。", manual: "人工查看曲線", checklist: "設計檢查清單", question: "工程問答", ask: "詢問", placeholder: "例如：這顆料在 25 V 下可用嗎？", modelNote: "以下說明由模型根據已驗證來源產生。" },
  "zh-CN": { identity: "元件识别", limitations: "限制与待确认项目", noLimitations: "目前没有已知缺失。", manual: "人工查看曲线", checklist: "设计检查清单", question: "工程问答", ask: "询问", placeholder: "例如：这颗料在 25 V 下可用吗？", modelNote: "以下说明由模型根据已验证来源生成。" },
  en: { identity: "Part identity", limitations: "Limits and items to confirm", noLimitations: "No known missing items.", manual: "manual curve review", checklist: "Design checklist", question: "Engineering Q&A", ask: "Ask", placeholder: "For example: Is this part suitable at 25 V?", modelNote: "The following explanation is generated from verified sources." },
};

export function QuickReadWorkspace({ locale, result, transport, file }: {
  locale: Locale;
  result: AnalysisResult;
  transport: ModelTransport;
  file?: File;
}) {
  const copy = COPY[locale];
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<GroundedAnswer>();
  const [asking, setAsking] = useState(false);
  const questionAbortRef = useRef<AbortController | undefined>(undefined);
  useEffect(() => () => questionAbortRef.current?.abort(), []);
  const { envelope } = result;
  const manual = envelope.part.specifications.filter(({ manualReview }) => manualReview);
  const limitations = [
    ...envelope.missingFields.map((field) => `${field}: missing`),
    ...result.evidenceIssues.map(({ field, code }) => `${field}: ${code}`),
    ...manual.map(({ field }) => `${field}: ${copy.manual}`),
  ];
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    questionAbortRef.current?.abort();
    const controller = new AbortController();
    questionAbortRef.current = controller;
    setAsking(true);
    try {
      const nextAnswer = await askDatasheet(question, result, transport, { locale, signal: controller.signal });
      if (!controller.signal.aborted) setAnswer(nextAnswer);
    } catch (error) {
      if (!controller.signal.aborted) throw error;
    } finally {
      if (questionAbortRef.current === controller) setAsking(false);
    }
  };
  return (
    <section className="datasheet-quick-read" aria-labelledby="datasheet-quick-title">
      <header>
        <p>{copy.identity}</p>
        <h2 id="datasheet-quick-title">{envelope.part.orderingCode ?? envelope.selectedOrderingCode}</h2>
        <p>{envelope.part.manufacturer}{envelope.part.family ? ` · ${envelope.part.family}` : ""}</p>
      </header>
      <SpecificationTable locale={locale} specifications={envelope.part.specifications} file={file} />
      <section className="datasheet-limitations">
        <h3>{copy.limitations}</h3>
        {limitations.length > 0 ? <ul>{limitations.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p>{copy.noLimitations}</p>}
      </section>
      <section className="datasheet-checklist">
        <h3>{copy.checklist}</h3>
        <ul>{envelope.part.specifications.filter(({ status }) => status === "extracted").map((specification) => <li key={specification.field}>
          <label><input type="checkbox" />{specification.field}: {specification.rawValue}</label>
          <SourceEvidencePanel locale={locale} evidence={specification.evidence} file={file} />
        </li>)}</ul>
      </section>
      <section className="datasheet-question">
        <h3>{copy.question}</h3>
        <form onSubmit={(event) => void submit(event)}>
          <label><span className="sr-only">{copy.question}</span><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={copy.placeholder} /></label>
          <button type="submit" disabled={asking || !question.trim()}>{copy.ask}</button>
        </form>
        {answer && <div className={`datasheet-answer is-${answer.status}`}><p>{copy.modelNote}</p><p>{answer.answer}</p><SourceEvidencePanel locale={locale} evidence={answer.citations} file={file} /></div>}
      </section>
    </section>
  );
}

