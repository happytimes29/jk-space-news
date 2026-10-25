import { anthropicAdapter } from "./anthropic";
import { geminiAdapter } from "./gemini";
import { openAiCompatibleAdapter } from "./openai-compatible";
import type { ProviderAdapter, ProviderKind, SanitizedProviderError } from "./types";

const ADAPTERS: Record<ProviderKind, ProviderAdapter> = {
  "openai-compatible": openAiCompatibleAdapter,
  anthropic: anthropicAdapter,
  gemini: geminiAdapter,
};

export function getProviderAdapter(kind: ProviderKind): ProviderAdapter {
  return ADAPTERS[kind];
}

export function sanitizeUpstreamError(provider: ProviderKind, status: number, _body: unknown): SanitizedProviderError {
  return {
    code: "provider_error",
    provider,
    status,
    retryable: status === 408 || status === 429 || status >= 500,
  };
}

export type { AdapterInput, ProviderAdapter, ProviderKind, ProviderOperation, SanitizedProviderError, UpstreamRequest } from "./types";

