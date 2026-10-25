import { describe, expect, it, vi } from "vitest";
import { mlccRecord } from "@/tests/fixtures/datasheets/mlcc-record";
import type { AnalysisResult, ModelRequest, ModelTransport } from "./analysis";
import { askDatasheet } from "./question-answering";

function result(): AnalysisResult {
  const envelope = structuredClone(mlccRecord);
  const verified = {
    id: "fixture-mlcc:p2:c1",
    documentId: "fixture-mlcc",
    page: 2,
    text: "Rated voltage is 50 V under the stated operating conditions.",
    chunkHash: "v".repeat(64),
  };
  envelope.part.specifications = [envelope.part.specifications.find(({ field }) => field === "rated_voltage")!];
  envelope.part.specifications[0].evidence = [{
    documentId: verified.documentId,
    page: verified.page,
    quote: "Rated voltage is 50 V",
    chunkHash: verified.chunkHash,
  }];
  return {
    envelope,
    evidenceIssues: [],
    usedChunks: [
      verified,
      { id: "fixture-mlcc:p99:c1", documentId: "fixture-mlcc", page: 99, text: "UNRELATED PRIVATE CHUNK", chunkHash: "x".repeat(64) },
    ],
  };
}

function transport(response: unknown) {
  const requests: ModelRequest[] = [];
  const send = (async (request: ModelRequest) => {
    requests.push(request);
    return response;
  }) as ModelTransport & { requests: ModelRequest[] };
  send.requests = requests;
  return send;
}

describe("askDatasheet", () => {
  it("sends_only_verified_chunks_and_accepts_a_sentence_with_a_valid_citation", async () => {
    const send = transport({
      answer: "此元件的額定電壓為 50 V。[1]",
      citations: [{ chunkHash: "v".repeat(64), page: 2, quote: "Rated voltage is 50 V" }],
    });

    const answer = await askDatasheet("額定電壓是多少？", result(), send);

    expect(answer.status).toBe("grounded");
    expect(answer.answer).toBe("此元件的額定電壓為 50 V。[1]");
    expect(answer.citations[0]).toEqual(expect.objectContaining({ page: 2, chunkHash: "v".repeat(64) }));
    expect(send.requests[0].operation).toBe("question");
    expect(send.requests[0].chunks.map(({ id }) => id)).toEqual(["fixture-mlcc:p2:c1"]);
    expect(send.requests[0].prompt).not.toContain("UNRELATED PRIVATE CHUNK");
  });

  it("rejects_an_invented_citation_and_returns_the_insufficient_evidence_message", async () => {
    const send = transport({
      answer: "額定電壓為 500 V。[1]",
      citations: [{ chunkHash: "z".repeat(64), page: 2, quote: "Rated voltage is 500 V" }],
    });

    const answer = await askDatasheet("額定電壓是多少？", result(), send);

    expect(answer).toEqual({ status: "insufficient-evidence", answer: "文件沒有足夠證據", citations: [] });
  });

  it("rejects_an_answer_sentence_without_citation_markers", async () => {
    const send = transport({
      answer: "額定電壓為 50 V。",
      citations: [{ chunkHash: "v".repeat(64), page: 2, quote: "Rated voltage is 50 V" }],
    });

    expect(await askDatasheet("額定電壓是多少？", result(), send)).toEqual({
      status: "insufficient-evidence",
      answer: "文件沒有足夠證據",
      citations: [],
    });
  });

  it("does_not_call_the_model_when_no_verified_chunk_supports_the_question", async () => {
    const analysis = result();
    analysis.envelope.part.specifications[0].status = "ambiguous";
    const send = vi.fn() as unknown as ModelTransport;

    const answer = await askDatasheet("額定電壓是多少？", analysis, send);

    expect(answer.status).toBe("insufficient-evidence");
    expect(send).not.toHaveBeenCalled();
  });
});
