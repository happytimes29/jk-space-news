"use client";

import { useEffect, useReducer, useRef } from "react";
import { analyzeDatasheet, discoverPartOptions, type ModelRequest, type ModelTransport } from "@/lib/datasheet/analysis";
import { buildDocumentChunks } from "@/lib/datasheet/pdf/chunks";
import { parsePdfFile } from "@/lib/datasheet/pdf/browser-parser";
import type { DocumentChunk, ParsedPdf } from "@/lib/datasheet/pdf/types";
import type { Locale } from "@/lib/i18n/locales";
import { ModeSwitcher } from "./ModeSwitcher";
import { PdfDropzone, type PdfDropzoneCopy } from "./PdfDropzone";
import { ProviderSetup, type ProviderSetupCopy } from "./ProviderSetup";
import { QuickReadWorkspace } from "./QuickReadWorkspace";
import { ReplacementWorkspace } from "./ReplacementWorkspace";
import {
  abortActiveRun,
  initialWorkbenchState,
  workbenchReducer,
  type DocumentSlot,
  type ProviderConfiguration,
  type WorkbenchState,
} from "./workbench-state";

export interface WorkbenchServices {
  parsePdf: (file: File, signal?: AbortSignal) => Promise<ParsedPdf>;
  buildChunks: (document: ParsedPdf) => Promise<DocumentChunk[]>;
  fetcher: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

interface WorkbenchCopy {
  quickMode: string;
  replacementMode: string;
  provider: ProviderSetupCopy;
  pdf: PdfDropzoneCopy;
  findParts: string;
  analyze: string;
  cancel: string;
  clear: string;
  statusTesting: string;
  statusParsing: string;
  statusRetrieving: string;
  statusExtracting: string;
  statusVerifying: string;
  statusComparing: string;
  statusComplete: string;
  pdfOnly: string;
  pdfSize: string;
  requestFailed: string;
  selectOrderingCode: string;
}

const COPY: Record<Locale, WorkbenchCopy> = {
  en: {
    quickMode: "Quick read",
    replacementMode: "Replacement check",
    provider: {
      title: "Model provider",
      disclosure: "Your API key passes through the JK Space relay for this request and is never stored.",
      disclosureDetail: "Relevant PDF text is sent to the selected provider. Upload public datasheets only.",
      provider: "Provider",
      model: "Model",
      baseUrl: "OpenAI-compatible base URL",
      apiKey: "API key",
      test: "Test connection",
      connected: "Connection verified",
    },
    pdf: {
      original: "Original datasheet PDF",
      candidate: "Candidate datasheet PDF",
      choose: "Choose PDF",
      remove: "Remove PDF",
      componentType: "Component type",
      chooseType: "Choose a supported type",
      mlcc: "MLCC ceramic capacitor",
      inductor: "Shielded power inductor",
      estimate: (pages, characters, calls) => `${pages} pages · ${characters} characters · about ${calls} API calls`,
    },
    findParts: "Find exact part numbers",
    analyze: "Analyze datasheet",
    cancel: "Cancel",
    clear: "Clear files and API key",
    statusTesting: "Testing provider connection…",
    statusParsing: "Parsing PDF locally…",
    statusRetrieving: "Selecting relevant sections…",
    statusExtracting: "Extracting sourced values…",
    statusVerifying: "Verifying citations…",
    statusComparing: "Applying deterministic rules…",
    statusComplete: "Analysis complete",
    pdfOnly: "Only PDF files are supported.",
    pdfSize: "PDF must be 25 MiB or smaller.",
    requestFailed: "The request could not be completed.",
    selectOrderingCode: "Exact Ordering Code",
  },
  "zh-TW": {
    quickMode: "快速讀懂 Datasheet",
    replacementMode: "替代料評估",
    provider: {
      title: "模型供應商",
      disclosure: "API Key 僅於本次請求經過 JK Space Relay，不會儲存。",
      disclosureDetail: "相關 PDF 文字會傳送給選定的模型供應商；請只上傳公開 Datasheet。",
      provider: "供應商", model: "模型", baseUrl: "OpenAI-compatible API 位址", apiKey: "API Key", test: "測試連線", connected: "連線已驗證",
    },
    pdf: {
      original: "原料 Datasheet PDF", candidate: "候選料 Datasheet PDF", choose: "選擇 PDF", remove: "移除 PDF", componentType: "元件類型", chooseType: "選擇支援類型", mlcc: "MLCC 陶瓷電容", inductor: "屏蔽型功率電感",
      estimate: (pages, characters, calls) => `${pages} 頁 · ${characters} 字元 · 約 ${calls} 次 API 呼叫`,
    },
    findParts: "尋找完整料號", analyze: "分析 Datasheet", cancel: "取消", clear: "清除檔案與 API Key", statusTesting: "正在測試模型連線…", statusParsing: "正在本機解析 PDF…", statusRetrieving: "正在選取相關章節…", statusExtracting: "正在抽取有來源的規格…", statusVerifying: "正在驗證引用…", statusComparing: "正在執行確定性規則…", statusComplete: "分析完成", pdfOnly: "只支援 PDF 檔案。", pdfSize: "PDF 不得超過 25 MiB。", requestFailed: "無法完成本次請求。", selectOrderingCode: "完整 Ordering Code",
  },
  "zh-CN": {
    quickMode: "快速读懂 Datasheet",
    replacementMode: "替代料评估",
    provider: {
      title: "模型供应商",
      disclosure: "API Key 仅在本次请求经过 JK Space Relay，不会储存。",
      disclosureDetail: "相关 PDF 文字会传送给选定的模型供应商；请只上传公开 Datasheet。",
      provider: "供应商", model: "模型", baseUrl: "OpenAI-compatible API 地址", apiKey: "API Key", test: "测试连接", connected: "连接已验证",
    },
    pdf: {
      original: "原料 Datasheet PDF", candidate: "候选料 Datasheet PDF", choose: "选择 PDF", remove: "移除 PDF", componentType: "元件类型", chooseType: "选择支持类型", mlcc: "MLCC 陶瓷电容", inductor: "屏蔽型功率电感",
      estimate: (pages, characters, calls) => `${pages} 页 · ${characters} 字符 · 约 ${calls} 次 API 调用`,
    },
    findParts: "寻找完整料号", analyze: "分析 Datasheet", cancel: "取消", clear: "清除文件与 API Key", statusTesting: "正在测试模型连接…", statusParsing: "正在本地解析 PDF…", statusRetrieving: "正在选择相关章节…", statusExtracting: "正在抽取有来源的规格…", statusVerifying: "正在验证引用…", statusComparing: "正在执行确定性规则…", statusComplete: "分析完成", pdfOnly: "仅支持 PDF 文件。", pdfSize: "PDF 不得超过 25 MiB。", requestFailed: "无法完成本次请求。", selectOrderingCode: "完整 Ordering Code",
  },
};

const DEFAULT_SERVICES: WorkbenchServices = {
  parsePdf: parsePdfFile,
  buildChunks: buildDocumentChunks,
  fetcher: (input, init) => fetch(input, init),
};

function runId(): string {
  return `datasheet-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function DatasheetWorkbenchApp({ locale, services = DEFAULT_SERVICES }: { locale: Locale; services?: WorkbenchServices }) {
  const copy = COPY[locale];
  const [state, dispatch] = useReducer(workbenchReducer, initialWorkbenchState);
  const stateRef = useRef<WorkbenchState>(state);
  stateRef.current = state;

  useEffect(() => () => abortActiveRun(stateRef.current), []);

  const startRun = () => {
    abortActiveRun(stateRef.current);
    const id = runId();
    const controller = new AbortController();
    dispatch({ type: "run/start", id, controller });
    return { id, controller };
  };

  const providerHeaders = (provider: ProviderConfiguration) => ({
    "content-type": "application/json",
    authorization: `Bearer ${provider.apiKey}`,
  });

  const sendRelay = async (request: ModelRequest, provider: ProviderConfiguration, signal?: AbortSignal) => {
    const response = await services.fetcher("/api/datasheet/relay", {
      method: "POST",
      headers: providerHeaders(provider),
      signal,
      body: JSON.stringify({
        provider: provider.kind,
        model: provider.model,
        baseUrl: provider.kind === "openai-compatible" && provider.baseUrl ? provider.baseUrl : undefined,
        operation: request.operation,
        prompt: request.prompt,
      }),
    });
    const payload = await response.json() as { data?: unknown; error?: { code?: string } };
    if (!response.ok || !("data" in payload)) throw new Error(payload.error?.code ?? "relay_failure");
    return payload.data;
  };
  const relayTransport: ModelTransport = (request, signal) => sendRelay(request, stateRef.current.provider, signal);

  const selectFile = async (slot: DocumentSlot, file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      dispatch({ type: "error/set", error: copy.pdfOnly });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      dispatch({ type: "error/set", error: copy.pdfSize });
      return;
    }
    const { id, controller } = startRun();
    dispatch({ type: "document/select", slot, file });
    dispatch({ type: "run/stage", stage: "parsing" });
    try {
      const parsed = await services.parsePdf(file, controller.signal);
      const chunks = await services.buildChunks(parsed);
      dispatch({ type: "document/parsed", slot, file, parsed, chunks });
    } catch (error) {
      if (!controller.signal.aborted) dispatch({ type: "error/set", error: error instanceof Error ? error.message : copy.requestFailed });
    } finally {
      dispatch({ type: "run/end", id });
    }
  };

  const testConnection = async () => {
    const { id, controller } = startRun();
    dispatch({ type: "provider/connection", status: "testing" });
    dispatch({ type: "run/stage", stage: "testing-provider" });
    try {
      const provider = stateRef.current.provider;
      const response = await services.fetcher("/api/datasheet/relay", {
        method: "POST",
        headers: providerHeaders(provider),
        signal: controller.signal,
        body: JSON.stringify({ provider: provider.kind, model: provider.model, baseUrl: provider.baseUrl || undefined, operation: "connect", prompt: "Return JSON {\"ok\":true}." }),
      });
      if (!response.ok) throw new Error("connection_failed");
      const payload = await response.json() as { data?: { ok?: unknown } };
      if (payload.data?.ok !== true) throw new Error("connection_failed");
      dispatch({ type: "provider/connection", status: "connected" });
    } catch {
      if (!controller.signal.aborted) dispatch({ type: "provider/connection", status: "failed" });
    } finally {
      dispatch({ type: "run/end", id });
    }
  };

  const requiredSlots: DocumentSlot[] = state.mode === "quick-read" ? ["original"] : ["original", "candidate"];
  const readyDocuments = requiredSlots.every((slot) => state.documents[slot]?.parsed && state.documents[slot]?.chunks && state.documents[slot]?.componentKind);
  const replacementKindsMatch = state.mode !== "replacement"
    || !state.documents.original?.componentKind
    || !state.documents.candidate?.componentKind
    || state.documents.original.componentKind === state.documents.candidate.componentKind;
  const needsDiscovery = requiredSlots.some((slot) => !state.documents[slot]?.options);
  const canAnalyze = state.providerConnection === "connected" && readyDocuments && replacementKindsMatch && !state.activeRun;

  const analyze = async () => {
    const { id, controller } = startRun();
    const provider = stateRef.current.provider;
    const runTransport: ModelTransport = (request, signal) => sendRelay(request, provider, signal ?? controller.signal);
    try {
      if (needsDiscovery) {
        dispatch({ type: "run/stage", stage: "retrieving" });
        for (const slot of requiredSlots) {
          const document = stateRef.current.documents[slot];
          if (!document?.parsed || !document.chunks || !document.componentKind || document.options) continue;
          const options = await discoverPartOptions({ document: document.parsed, chunks: document.chunks, componentKind: document.componentKind, transport: runTransport });
          dispatch({ type: "document/options", slot, documentId: document.parsed.sha256, options, componentKind: document.componentKind });
        }
        return;
      }
      for (const slot of requiredSlots) {
        const document = stateRef.current.documents[slot];
        if (!document?.parsed || !document.chunks || !document.componentKind || !document.selectedOrderingCode) {
          dispatch({ type: "error/set", error: copy.selectOrderingCode });
          return;
        }
        const result = await analyzeDatasheet({
          document: document.parsed,
          chunks: document.chunks,
          componentKind: document.componentKind,
          selectedOrderingCode: document.selectedOrderingCode,
        }, runTransport, (stage) => dispatch({ type: "run/stage", stage }));
        dispatch({ type: "document/analysis", slot, documentId: document.parsed.sha256, orderingCode: document.selectedOrderingCode, analysis: result });
        if (state.mode === "quick-read") dispatch({ type: "result/set", result: { kind: "quick-read", value: result } });
      }
    } catch (error) {
      if (!controller.signal.aborted) dispatch({ type: "error/set", error: error instanceof Error ? error.message : copy.requestFailed });
    } finally {
      dispatch({ type: "run/end", id });
    }
  };

  const statusLabels: Partial<Record<NonNullable<WorkbenchState["stage"]>, string>> = {
    "testing-provider": copy.statusTesting,
    parsing: copy.statusParsing,
    retrieving: copy.statusRetrieving,
    extracting: copy.statusExtracting,
    verifying: copy.statusVerifying,
    comparing: copy.statusComparing,
    complete: copy.statusComplete,
  };

  return (
    <div className="datasheet-workbench">
      <ModeSwitcher mode={state.mode} quickLabel={copy.quickMode} replacementLabel={copy.replacementMode} onChange={(mode) => {
        abortActiveRun(stateRef.current);
        dispatch({ type: "mode/set", mode });
      }} />
      <ProviderSetup
        copy={copy.provider}
        configuration={state.provider}
        connection={state.providerConnection}
        disabled={Boolean(state.activeRun)}
        onChange={(provider: ProviderConfiguration) => dispatch({ type: "provider/configure", provider })}
        onTest={testConnection}
      />
      <div className="datasheet-document-grid">
        {requiredSlots.map((slot) => <div key={slot}>
          <PdfDropzone
            slot={slot}
            document={state.documents[slot]}
            copy={copy.pdf}
            disabled={Boolean(state.activeRun)}
            onSelect={(file) => void selectFile(slot, file)}
            onRemove={() => {
              abortActiveRun(stateRef.current);
              dispatch({ type: "document/remove", slot });
            }}
            onKind={(componentKind) => dispatch({ type: "document/kind", slot, componentKind })}
          />
          {state.documents[slot]?.options && <label>{copy.selectOrderingCode}
            <select value={state.documents[slot]?.selectedOrderingCode ?? ""} onChange={(event) => dispatch({ type: "document/ordering-code", slot, orderingCode: event.target.value })}>
              <option value="">—</option>
              {state.documents[slot]?.options?.map(({ orderingCode }) => <option key={orderingCode} value={orderingCode}>{orderingCode}</option>)}
            </select>
          </label>}
        </div>)}
      </div>
      {!replacementKindsMatch && <p role="alert">Both PDFs must use the same supported component type.</p>}
      {state.error && <p role="alert">{state.error}</p>}
      {state.stage && statusLabels[state.stage] && <p role="status">{statusLabels[state.stage]}</p>}
      <div className="datasheet-primary-actions">
        <button type="button" disabled={!canAnalyze} onClick={() => void analyze()}>{needsDiscovery ? copy.findParts : copy.analyze}</button>
        {state.activeRun && <button type="button" onClick={() => {
          const id = stateRef.current.activeRun?.id;
          abortActiveRun(stateRef.current);
          dispatch({ type: "run/end", id });
        }}>{copy.cancel}</button>}
        <button type="button" onClick={() => {
          abortActiveRun(stateRef.current);
          dispatch({ type: "privacy/clear" });
        }}>{copy.clear}</button>
      </div>
      {state.result?.kind === "quick-read" && state.documents.original?.analysis && (
        <QuickReadWorkspace
          locale={locale}
          result={state.documents.original.analysis}
          transport={relayTransport}
          file={state.documents.original.file}
        />
      )}
      {state.mode === "replacement" && state.documents.original?.analysis && state.documents.candidate?.analysis && (
        <ReplacementWorkspace
          locale={locale}
          original={state.documents.original.analysis}
          candidate={state.documents.candidate.analysis}
          originalFile={state.documents.original.file}
          candidateFile={state.documents.candidate.file}
        />
      )}
    </div>
  );
}

