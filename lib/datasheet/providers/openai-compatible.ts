import { jsonRequest, parseJsonText, ProviderResponseError, type ProviderAdapter } from "./types";

function endpoint(baseUrl?: string): string {
  const base = (baseUrl ?? "https://api.openai.com/v1").replace(/\/+$/, "");
  return base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
}

export const openAiCompatibleAdapter: ProviderAdapter = {
  kind: "openai-compatible",
  buildRequest(input) {
    return jsonRequest(endpoint(input.baseUrl), { Authorization: `Bearer ${input.apiKey}` }, {
      model: input.model,
      messages: [{ role: "user", content: input.prompt }],
      response_format: { type: "json_object" },
      temperature: 0,
    });
  },
  parseResponse(response) {
    if (typeof response !== "object" || response === null || !("choices" in response) || !Array.isArray(response.choices)) {
      throw new ProviderResponseError("invalid_provider_response");
    }
    const first = response.choices[0];
    if (typeof first !== "object" || first === null || !("message" in first) || typeof first.message !== "object" || first.message === null || !("content" in first.message)) {
      throw new ProviderResponseError("invalid_provider_response");
    }
    return parseJsonText(first.message.content);
  },
};

