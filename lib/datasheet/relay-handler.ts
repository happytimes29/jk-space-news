import { getProviderAdapter, sanitizeUpstreamError, type ProviderKind, type ProviderOperation } from "./providers";
import { defaultHostResolver, RelaySecurityError, validateRelayTarget, type HostResolver } from "./relay-security";
import { Agent, fetch as undiciFetch } from "undici";
import type { LookupFunction } from "node:net";
import type { ResolvedHost } from "./relay-security";

const MAX_BODY_BYTES = 512 * 1024;
const MAX_REDIRECTS = 2;
const DEFAULT_TIMEOUT_MS = 60_000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const PROVIDERS = new Set<ProviderKind>(["openai-compatible", "anthropic", "gemini"]);
const OPERATIONS = new Set<ProviderOperation>(["connect", "discover", "extract", "repair", "explain", "question"]);

interface RelayBody {
  provider: ProviderKind;
  model: string;
  operation: ProviderOperation;
  prompt: string;
  baseUrl?: string;
}

interface RelayLogger {
  error(event: Readonly<Record<string, string | number | boolean>>): void;
}

interface RelayDependencies {
  resolver?: HostResolver;
  fetcher?: (url: string | URL, init?: RequestInit) => Promise<Response>;
  logger?: RelayLogger;
  timeoutMs?: number;
}

class RelayRouteError extends Error {
  constructor(public readonly code: string, public readonly status: number) {
    super(code);
    this.name = "RelayRouteError";
  }
}

function responseHeaders(): HeadersInit {
  return {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: responseHeaders() });
}

async function readLimitedBody(request: Request): Promise<string> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && Number(declaredLength) > MAX_BODY_BYTES) throw new RelayRouteError("request_too_large", 413);
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RelayRouteError("request_too_large", 413);
    }
    body += decoder.decode(value, { stream: true });
  }
  return body + decoder.decode();
}

async function readLimitedJson(response: Response): Promise<unknown> {
  const declaredLength = response.headers.get("content-length");
  if (declaredLength && Number(declaredLength) > MAX_RESPONSE_BYTES) {
    await response.body?.cancel();
    throw new RelayRouteError("provider_response_too_large", 502);
  }
  if (!response.body) throw new RelayRouteError("invalid_provider_response", 502);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new RelayRouteError("provider_response_too_large", 502);
    }
    body += decoder.decode(value, { stream: true });
  }
  try {
    return JSON.parse(body + decoder.decode()) as unknown;
  } catch {
    throw new RelayRouteError("invalid_provider_response", 502);
  }
}

export function createPinnedLookup(addresses: readonly ResolvedHost[]): LookupFunction {
  let cursor = 0;
  return (_hostname, options, callback) => {
    const ordered = addresses.map((entry, index) => addresses[(cursor + index) % addresses.length]);
    cursor = (cursor + 1) % addresses.length;
    if (options.all) callback(null, ordered.map(({ address, family }) => ({ address, family })));
    else callback(null, ordered[0].address, ordered[0].family);
  };
}

function parseBody(value: unknown): RelayBody {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new RelayRouteError("invalid_request", 400);
  const source = value as Record<string, unknown>;
  if (typeof source.provider !== "string" || !PROVIDERS.has(source.provider as ProviderKind)) throw new RelayRouteError("invalid_request", 400);
  if (typeof source.operation !== "string" || !OPERATIONS.has(source.operation as ProviderOperation)) throw new RelayRouteError("invalid_request", 400);
  if (typeof source.model !== "string" || source.model.trim() === "" || source.model.length > 200) throw new RelayRouteError("invalid_request", 400);
  if (typeof source.prompt !== "string" || source.prompt.trim() === "" || source.prompt.length > 450_000) throw new RelayRouteError("invalid_request", 400);
  if (source.baseUrl !== undefined && (source.provider !== "openai-compatible" || typeof source.baseUrl !== "string")) throw new RelayRouteError("invalid_request", 400);
  return {
    provider: source.provider as ProviderKind,
    operation: source.operation as ProviderOperation,
    model: source.model,
    prompt: source.prompt,
    baseUrl: typeof source.baseUrl === "string" ? source.baseUrl : undefined,
  };
}

function readApiKey(request: Request): string {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer ([^\s]{1,4096})$/);
  if (!match) throw new RelayRouteError("authorization_required", 401);
  return match[1];
}

function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) throw new RelayRouteError("origin_forbidden", 403);
}

async function fetchWithValidatedRedirects(
  provider: ProviderKind,
  initialUrl: string,
  init: RequestInit,
  resolver: HostResolver,
  fetcher?: (url: string | URL, init?: RequestInit) => Promise<Response>,
): Promise<{ response: Response; close: () => Promise<void> }> {
  let currentUrl = new URL(initialUrl);
  const initialOrigin = currentUrl.origin;
  for (let redirects = 0; ; redirects += 1) {
    const validated = await validateRelayTarget({ url: currentUrl.href, provider }, resolver);
    const dispatcher = fetcher ? undefined : new Agent({ connect: { lookup: createPinnedLookup(validated.addresses) } });
    let response: Response;
    try {
      response = fetcher
        ? await fetcher(currentUrl, { ...init, redirect: "manual" })
        : await undiciFetch(currentUrl, { ...init, redirect: "manual", dispatcher } as Parameters<typeof undiciFetch>[1]) as unknown as Response;
    } catch (error) {
      await dispatcher?.close();
      throw error;
    }
    if (response.status < 300 || response.status >= 400) return { response, close: async () => { await dispatcher?.close(); } };
    await response.body?.cancel();
    await dispatcher?.close();
    const location = response.headers.get("location");
    if (!location) return { response, close: async () => undefined };
    if (redirects >= MAX_REDIRECTS) throw new RelayRouteError("provider_redirect_limit", 502);
    const nextUrl = new URL(location, currentUrl);
    if (nextUrl.origin !== initialOrigin) throw new RelaySecurityError("RELAY_TARGET_BLOCKED");
    currentUrl = nextUrl;
  }
}

export function createRelayHandler(dependencies: RelayDependencies = {}) {
  const resolver = dependencies.resolver ?? defaultHostResolver;
  const fetcher = dependencies.fetcher;
  const logger = dependencies.logger ?? { error: () => undefined };
  const timeoutMs = dependencies.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return async function relayHandler(request: Request): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const cancelForCaller = () => controller.abort();
    request.signal.addEventListener("abort", cancelForCaller, { once: true });
    let closeDispatcher: () => Promise<void> = async () => undefined;
    try {
      assertSameOrigin(request);
      const apiKey = readApiKey(request);
      const rawBody = await readLimitedBody(request);
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawBody) as unknown;
      } catch {
        throw new RelayRouteError("invalid_request", 400);
      }
      const body = parseBody(parsed);
      const adapter = getProviderAdapter(body.provider);
      const upstream = adapter.buildRequest({ ...body, apiKey });
      upstream.init.signal = controller.signal;
      const outbound = await fetchWithValidatedRedirects(body.provider, upstream.url, upstream.init, resolver, fetcher);
      const upstreamResponse = outbound.response;
      closeDispatcher = outbound.close;
      if (!upstreamResponse.ok) {
        await upstreamResponse.body?.cancel();
        const error = sanitizeUpstreamError(body.provider, upstreamResponse.status, undefined);
        logger.error({ event: "datasheet_provider_error", provider: body.provider, status: upstreamResponse.status });
        return json({ error }, upstreamResponse.status);
      }
      const upstreamJson = await readLimitedJson(upstreamResponse);
      return json({ data: adapter.parseResponse(upstreamJson) });
    } catch (error) {
      if (controller.signal.aborted) return json({ error: { code: "provider_timeout" } }, 504);
      if (error instanceof RelaySecurityError) return json({ error: { code: "relay_target_blocked" } }, 400);
      if (error instanceof RelayRouteError) return json({ error: { code: error.code } }, error.status);
      logger.error({ event: "datasheet_relay_failure" });
      return json({ error: { code: "relay_failure" } }, 502);
    } finally {
      await closeDispatcher();
      clearTimeout(timeout);
      request.signal.removeEventListener("abort", cancelForCaller);
    }
  };
}
