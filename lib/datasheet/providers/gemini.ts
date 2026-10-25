import { jsonRequest, parseJsonText, ProviderResponseError, type ProviderAdapter } from "./types";

export const geminiAdapter: ProviderAdapter = {
  kind: "gemini",
  buildRequest(input) {
    const model = encodeURIComponent(input.model);
    return jsonRequest(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      "x-goog-api-key": input.apiKey,
    }, {
      contents: [{ role: "user", parts: [{ text: input.prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    });
  },
  parseResponse(response) {
    if (typeof response !== "object" || response === null || !("candidates" in response) || !Array.isArray(response.candidates)) {
      throw new ProviderResponseError("invalid_provider_response");
    }
    const candidate = response.candidates[0];
    if (typeof candidate !== "object" || candidate === null || !("content" in candidate) || typeof candidate.content !== "object" || candidate.content === null || !("parts" in candidate.content) || !Array.isArray(candidate.content.parts)) {
      throw new ProviderResponseError("invalid_provider_response");
    }
    const parts: unknown[] = candidate.content.parts;
    const text = parts
      .filter((part: unknown): part is { text: string } => typeof part === "object" && part !== null && "text" in part && typeof part.text === "string")
      .map(({ text: value }) => value)
      .join("");
    return parseJsonText(text);
  },
};

