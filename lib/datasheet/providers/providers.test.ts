import { describe, expect, it } from "vitest";
import { getProviderAdapter, sanitizeUpstreamError } from "./index";

const input = {
  apiKey: "secret-provider-key",
  model: "fixture-model",
  prompt: "Return a JSON object with sourced values.",
  operation: "extract" as const,
};

function body(request: ReturnType<ReturnType<typeof getProviderAdapter>["buildRequest"]>): Record<string, unknown> {
  return JSON.parse(String(request.init.body)) as Record<string, unknown>;
}

describe("provider adapters", () => {
  it("builds_an_openai_compatible_json_request_and_parses_assistant_json", () => {
    const adapter = getProviderAdapter("openai-compatible");
    const request = adapter.buildRequest({ ...input, baseUrl: "https://models.example.com/v1" });

    expect(request.url).toBe("https://models.example.com/v1/chat/completions");
    expect(request.init.headers).toEqual(expect.objectContaining({ Authorization: "Bearer secret-provider-key" }));
    expect(body(request)).toEqual(expect.objectContaining({
      model: "fixture-model",
      response_format: { type: "json_object" },
    }));
    expect(adapter.parseResponse({ choices: [{ message: { content: "{\"version\":1}" } }] })).toEqual({ version: 1 });
  });

  it("builds_an_anthropic_messages_request_and_parses_a_text_block", () => {
    const adapter = getProviderAdapter("anthropic");
    const request = adapter.buildRequest(input);

    expect(request.url).toBe("https://api.anthropic.com/v1/messages");
    expect(request.init.headers).toEqual(expect.objectContaining({
      "x-api-key": "secret-provider-key",
      "anthropic-version": "2023-06-01",
    }));
    expect(body(request)).toEqual(expect.objectContaining({ model: "fixture-model", max_tokens: 4096 }));
    expect(adapter.parseResponse({ content: [{ type: "text", text: "{\"version\":1}" }] })).toEqual({ version: 1 });
  });

  it("builds_a_gemini_json_request_without_putting_the_key_in_the_url", () => {
    const adapter = getProviderAdapter("gemini");
    const request = adapter.buildRequest(input);

    expect(request.url).toBe("https://generativelanguage.googleapis.com/v1beta/models/fixture-model:generateContent");
    expect(request.url).not.toContain("secret-provider-key");
    expect(request.init.headers).toEqual(expect.objectContaining({ "x-goog-api-key": "secret-provider-key" }));
    expect(body(request)).toEqual(expect.objectContaining({
      generationConfig: expect.objectContaining({ responseMimeType: "application/json" }),
    }));
    expect(adapter.parseResponse({ candidates: [{ content: { parts: [{ text: "{\"version\":1}" }] } }] })).toEqual({ version: 1 });
  });

  it("returns_unknown_json_instead_of_casting_it_to_the_extraction_schema", () => {
    const adapter = getProviderAdapter("openai-compatible");

    expect(adapter.parseResponse({ choices: [{ message: { content: "{\"unexpected\":true}" } }] })).toEqual({ unexpected: true });
  });

  it("sanitizes_upstream_errors_without_echoing_the_key_prompt_or_body", () => {
    const error = sanitizeUpstreamError("anthropic", 429, {
      error: { message: "secret-provider-key Return a JSON object with sourced values." },
    });

    expect(error).toEqual({ code: "provider_error", provider: "anthropic", status: 429, retryable: true });
    expect(JSON.stringify(error)).not.toContain("secret-provider-key");
    expect(JSON.stringify(error)).not.toContain("sourced values");
  });
});
