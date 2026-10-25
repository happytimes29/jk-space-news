import { afterEach, describe, expect, it, vi } from "vitest";
import type { HostResolver } from "@/lib/datasheet/relay-security";
import { createRelayHandler } from "@/lib/datasheet/relay-handler";

const publicResolver: HostResolver = async () => [{ address: "93.184.216.34", family: 4 }];

function relayRequest(body: unknown, options: { origin?: string; authorization?: string; contentLength?: string } = {}): Request {
  const serialized = JSON.stringify(body);
  const headers = new Headers({
    "content-type": "application/json",
    origin: options.origin ?? "https://jk-space.com",
    authorization: options.authorization ?? "Bearer browser-secret-key",
  });
  if (options.contentLength) headers.set("content-length", options.contentLength);
  return new Request("https://jk-space.com/api/datasheet/relay", { method: "POST", headers, body: serialized });
}

const validBody = {
  provider: "anthropic",
  model: "claude-fixture",
  operation: "extract",
  prompt: "PDF private fragment fixture",
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("datasheet relay route", () => {
  it("translates_the_ephemeral_browser_key_and_returns_no_store_json_without_secrets", async () => {
    let upstream: { url: string; init: RequestInit } | undefined;
    const fetcher = vi.fn(async (url: string | URL, init?: RequestInit) => {
      upstream = { url: String(url), init: init ?? {} };
      return new Response(JSON.stringify({ content: [{ type: "text", text: "{\"version\":1}" }] }), { status: 200 });
    });
    const handler = createRelayHandler({ resolver: publicResolver, fetcher });

    const response = await handler(relayRequest(validBody));
    const responseText = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.has("set-cookie")).toBe(false);
    expect(upstream?.url).toBe("https://api.anthropic.com/v1/messages");
    expect(new Headers(upstream?.init.headers).get("x-api-key")).toBe("browser-secret-key");
    expect(responseText).toBe("{\"data\":{\"version\":1}}");
    expect(responseText).not.toContain("browser-secret-key");
    expect(responseText).not.toContain("PDF private fragment fixture");
  });

  it("rejects_cross_origin_posts_before_contacting_a_provider", async () => {
    const fetcher = vi.fn();
    const handler = createRelayHandler({ resolver: publicResolver, fetcher });

    const response = await handler(relayRequest(validBody, { origin: "https://attacker.example" }));

    expect(response.status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejects_a_body_over_512_kib_before_json_parsing", async () => {
    const fetcher = vi.fn();
    const handler = createRelayHandler({ resolver: publicResolver, fetcher });

    const response = await handler(relayRequest(validBody, { contentLength: String(512 * 1024 + 1) }));

    expect(response.status).toBe(413);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("aborts_an_upstream_request_after_60_seconds", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn((_url: string | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
    }));
    const handler = createRelayHandler({ resolver: publicResolver, fetcher });

    const pending = handler(relayRequest(validBody));
    await vi.advanceTimersByTimeAsync(60_000);
    const response = await pending;

    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({ error: { code: "provider_timeout" } });
  });

  it("follows_at_most_two_same_origin_redirects", async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 302, headers: { location: "/next" } }));
    const handler = createRelayHandler({ resolver: publicResolver, fetcher });

    const response = await handler(relayRequest({ ...validBody, provider: "openai-compatible", baseUrl: "https://models.example.com/v1" }));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: { code: "provider_redirect_limit" } });
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("revalidates_and_blocks_a_redirect_to_a_private_address", async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 302, headers: { location: "https://169.254.169.254/latest/meta-data" } }));
    const handler = createRelayHandler({ resolver: publicResolver, fetcher });

    const response = await handler(relayRequest({ ...validBody, provider: "openai-compatible", baseUrl: "https://models.example.com/v1" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: { code: "relay_target_blocked" } });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("sanitizes_provider_errors_and_logger_events", async () => {
    const logger = { error: vi.fn() };
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ error: "browser-secret-key PDF private fragment fixture" }), { status: 429 }));
    const handler = createRelayHandler({ resolver: publicResolver, fetcher, logger });

    const response = await handler(relayRequest(validBody));
    const serialized = JSON.stringify(await response.json());
    const logs = JSON.stringify(logger.error.mock.calls);

    expect(response.status).toBe(429);
    expect(serialized).toBe('{"error":{"code":"provider_error","provider":"anthropic","status":429,"retryable":true}}');
    expect(`${serialized}${logs}`).not.toContain("browser-secret-key");
    expect(`${serialized}${logs}`).not.toContain("PDF private fragment fixture");
  });

  it("rejects_operations_outside_the_fixed_allowlist", async () => {
    const handler = createRelayHandler({ resolver: publicResolver, fetcher: vi.fn() });

    const response = await handler(relayRequest({ ...validBody, operation: "delete-account" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: { code: "invalid_request" } });
  });
});
