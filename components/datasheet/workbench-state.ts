import type { AnalysisResult, AnalysisStage, PartOption } from "@/lib/datasheet/analysis";
import type { DocumentChunk, ParsedPdf } from "@/lib/datasheet/pdf/types";
import type { ProviderKind } from "@/lib/datasheet/providers";

export type WorkbenchMode = "quick-read" | "replacement";
export type DocumentSlot = "original" | "candidate";

export interface ProviderConfiguration {
  kind: ProviderKind;
  model: string;
  baseUrl: string;
  apiKey: string;
}

export type ProviderPreferences = Omit<ProviderConfiguration, "apiKey">;

export interface WorkbenchDocument {
  file: File;
  parsed?: ParsedPdf;
  chunks?: DocumentChunk[];
  componentKind?: "mlcc" | "shielded-power-inductor";
  options?: PartOption[];
  selectedOrderingCode?: string;
  analysis?: AnalysisResult;
}

export interface ActiveRun {
  id: string;
  controller: AbortController;
}

export interface WorkbenchResult {
  kind: WorkbenchMode;
  value: unknown;
}

export interface WorkbenchState {
  mode: WorkbenchMode;
  provider: ProviderConfiguration;
  persistablePreferences: ProviderPreferences;
  providerConnection: "untested" | "testing" | "connected" | "failed";
  documents: Partial<Record<DocumentSlot, WorkbenchDocument>>;
  activeRun?: ActiveRun;
  stage?: AnalysisStage | "testing-provider";
  result?: WorkbenchResult;
  error?: string;
}

const blankProvider: ProviderConfiguration = {
  kind: "openai-compatible",
  model: "",
  baseUrl: "",
  apiKey: "",
};

export const initialWorkbenchState: WorkbenchState = {
  mode: "quick-read",
  provider: blankProvider,
  persistablePreferences: { kind: blankProvider.kind, model: "", baseUrl: "" },
  providerConnection: "untested",
  documents: {},
};

export type WorkbenchAction =
  | { type: "mode/set"; mode: WorkbenchMode }
  | { type: "provider/configure"; provider: ProviderConfiguration }
  | { type: "provider/connection"; status: WorkbenchState["providerConnection"] }
  | { type: "document/select"; slot: DocumentSlot; file: File }
  | { type: "document/parsed"; slot: DocumentSlot; file: File; parsed: ParsedPdf; chunks: DocumentChunk[] }
  | { type: "document/kind"; slot: DocumentSlot; componentKind: NonNullable<WorkbenchDocument["componentKind"]> }
  | { type: "document/options"; slot: DocumentSlot; documentId: string; options: PartOption[]; componentKind: WorkbenchDocument["componentKind"] }
  | { type: "document/ordering-code"; slot: DocumentSlot; orderingCode: string }
  | { type: "document/analysis"; slot: DocumentSlot; documentId: string; orderingCode: string; analysis: AnalysisResult }
  | { type: "document/remove"; slot: DocumentSlot }
  | { type: "run/start"; id: string; controller: AbortController }
  | { type: "run/stage"; stage: NonNullable<WorkbenchState["stage"]> }
  | { type: "run/end"; id?: string }
  | { type: "result/set"; result: WorkbenchResult }
  | { type: "error/set"; error?: string }
  | { type: "privacy/clear" };

export function abortActiveRun(state: WorkbenchState): void {
  state.activeRun?.controller.abort();
}

export function workbenchReducer(state: WorkbenchState, action: WorkbenchAction): WorkbenchState {
  switch (action.type) {
    case "mode/set":
      return { ...state, mode: action.mode, documents: {}, activeRun: undefined, stage: undefined, result: undefined, error: undefined };
    case "provider/configure":
      return {
        ...state,
        provider: action.provider,
        persistablePreferences: { kind: action.provider.kind, model: action.provider.model, baseUrl: action.provider.baseUrl },
        providerConnection: "untested",
      };
    case "provider/connection":
      return { ...state, providerConnection: action.status };
    case "document/select":
      return {
        ...state,
        documents: { ...state.documents, [action.slot]: { file: action.file } },
        result: undefined,
        error: undefined,
      };
    case "document/parsed": {
      const current = state.documents[action.slot];
      if (!current || current.file !== action.file) return state;
      return { ...state, documents: { ...state.documents, [action.slot]: { ...current, parsed: action.parsed, chunks: action.chunks } } };
    }
    case "document/kind": {
      const current = state.documents[action.slot];
      if (!current) return state;
      return { ...state, documents: { ...state.documents, [action.slot]: { ...current, componentKind: action.componentKind, options: undefined, selectedOrderingCode: undefined, analysis: undefined } }, result: undefined };
    }
    case "document/options": {
      const current = state.documents[action.slot];
      if (!current || current.parsed?.sha256 !== action.documentId) return state;
      return { ...state, documents: { ...state.documents, [action.slot]: { ...current, options: action.options, componentKind: action.componentKind } } };
    }
    case "document/ordering-code": {
      const current = state.documents[action.slot];
      if (!current) return state;
      return { ...state, documents: { ...state.documents, [action.slot]: { ...current, selectedOrderingCode: action.orderingCode, analysis: undefined } }, result: undefined };
    }
    case "document/analysis": {
      const current = state.documents[action.slot];
      if (!current || current.parsed?.sha256 !== action.documentId || current.selectedOrderingCode !== action.orderingCode) return state;
      return { ...state, documents: { ...state.documents, [action.slot]: { ...current, analysis: action.analysis } } };
    }
    case "document/remove": {
      const documents = { ...state.documents };
      delete documents[action.slot];
      return { ...state, documents, activeRun: undefined, stage: undefined, result: undefined, error: undefined };
    }
    case "run/start":
      return { ...state, activeRun: { id: action.id, controller: action.controller }, error: undefined };
    case "run/stage":
      return { ...state, stage: action.stage };
    case "run/end":
      if (action.id && state.activeRun?.id !== action.id) return state;
      return { ...state, activeRun: undefined, stage: undefined };
    case "result/set":
      return { ...state, result: action.result };
    case "error/set":
      return { ...state, error: action.error };
    case "privacy/clear":
      return { ...initialWorkbenchState, mode: state.mode };
  }
}

