export type ProviderKind = "openai-compatible" | "anthropic" | "gemini";
export type ProviderOperation = "connect" | "discover" | "extract" | "repair" | "explain" | "question";

export interface AdapterInput {
  apiKey: string;
  model: string;
  prompt: string;
  operation: ProviderOperation;
  baseUrl?: string;
}

export interface UpstreamRequest {
  url: string;
  init: RequestInit & { headers: Record<string, string>; body: string; redirect: "manual" };
}

export interface ProviderAdapter {
  readonly kind: ProviderKind;
  buildRequest(input: AdapterInput): UpstreamRequest;
  parseResponse(response: unknown): unknown;
}

export interface SanitizedProviderError {
  code: "provider_error";
  provider: ProviderKind;
  status: number;
  retryable: boolean;
}

export class ProviderResponseError extends Error {
  constructor(public readonly code: "invalid_provider_response" | "invalid_provider_json") {
    super(code);
    this.name = "ProviderResponseError";
  }
}

export function parseJsonText(value: unknown): unknown {
  if (typeof value !== "string" || value.trim() === "") throw new ProviderResponseError("invalid_provider_response");
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return { invalidJson: value };
  }
}

export function jsonRequest(url: string, headers: Record<string, string>, body: unknown): UpstreamRequest {
  return {
    url,
    init: {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      redirect: "manual",
      cache: "no-store",
    },
  };
}

