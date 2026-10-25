import { jsonRequest, parseJsonText, ProviderResponseError, type ProviderAdapter } from "./types";

export const anthropicAdapter: ProviderAdapter = {
  kind: "anthropic",
  buildRequest(input) {
    return jsonRequest("https://api.anthropic.com/v1/messages", {
      "x-api-key": input.apiKey,
      "anthropic-version": "2023-06-01",
    }, {
      model: input.model,
      max_tokens: 4096,
      temperature: 0,
      messages: [{ role: "user", content: input.prompt }],
    });
  },
  parseResponse(response) {
    if (typeof response !== "object" || response === null || !("content" in response) || !Array.isArray(response.content)) {
      throw new ProviderResponseError("invalid_provider_response");
    }
    const text = response.content
      .filter((block): block is { type: string; text: string } => typeof block === "object" && block !== null && "type" in block && block.type === "text" && "text" in block && typeof block.text === "string")
      .map(({ text: value }) => value)
      .join("");
    return parseJsonText(text);
  },
};

