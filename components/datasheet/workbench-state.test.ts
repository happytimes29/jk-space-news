import { describe, expect, it } from "vitest";
import { initialWorkbenchState, abortActiveRun, workbenchReducer } from "./workbench-state";
import type { ParsedPdf } from "@/lib/datasheet/pdf/types";
import { mlccRecord } from "@/tests/fixtures/datasheets/mlcc-record";

describe("workbenchReducer", () => {
  it("keeps_the_api_key_only_in_ephemeral_provider_state_and_clears_it_explicitly", () => {
    const configured = workbenchReducer(initialWorkbenchState, {
      type: "provider/configure",
      provider: { kind: "anthropic", model: "claude-fixture", baseUrl: "", apiKey: "memory-only-key" },
    });

    expect(configured.provider.apiKey).toBe("memory-only-key");
    expect(configured.persistablePreferences).toEqual({ kind: "anthropic", model: "claude-fixture", baseUrl: "" });
    expect(JSON.stringify(configured.persistablePreferences)).not.toContain("memory-only-key");

    const cleared = workbenchReducer(configured, { type: "privacy/clear" });
    expect(cleared.provider.apiKey).toBe("");
    expect(cleared.documents).toEqual({});
    expect(cleared.result).toBeUndefined();
  });

  it("switching_mode_aborts_the_active_run_and_clears_document_derived_state", () => {
    const controller = new AbortController();
    const running = workbenchReducer(initialWorkbenchState, { type: "run/start", id: "run-1", controller });
    const withResult = workbenchReducer(running, { type: "result/set", result: { kind: "quick-read", value: "fixture" } });

    abortActiveRun(withResult);
    const switched = workbenchReducer(withResult, { type: "mode/set", mode: "replacement" });

    expect(controller.signal.aborted).toBe(true);
    expect(switched.mode).toBe("replacement");
    expect(switched.activeRun).toBeUndefined();
    expect(switched.documents).toEqual({});
    expect(switched.result).toBeUndefined();
  });

  it("removing_a_pdf_aborts_work_and_clears_only_results_derived_from_that_slot", () => {
    const file = new File(["pdf"], "part.pdf", { type: "application/pdf" });
    const controller = new AbortController();
    let state = workbenchReducer(initialWorkbenchState, { type: "document/select", slot: "original", file });
    state = workbenchReducer(state, { type: "run/start", id: "run-2", controller });
    state = workbenchReducer(state, { type: "result/set", result: { kind: "quick-read", value: "fixture" } });

    abortActiveRun(state);
    const removed = workbenchReducer(state, { type: "document/remove", slot: "original" });

    expect(controller.signal.aborted).toBe(true);
    expect(removed.documents.original).toBeUndefined();
    expect(removed.result).toBeUndefined();
    expect(removed.activeRun).toBeUndefined();
  });

  it("unmount_cleanup_aborts_the_current_controller", () => {
    const controller = new AbortController();
    const state = workbenchReducer(initialWorkbenchState, { type: "run/start", id: "run-3", controller });

    abortActiveRun(state);

    expect(controller.signal.aborted).toBe(true);
  });

  it("ignores_late_results_from_a_replaced_document_or_selection", () => {
    const oldFile = new File(["old"], "old.pdf", { type: "application/pdf" });
    const newFile = new File(["new"], "new.pdf", { type: "application/pdf" });
    const oldParsed: ParsedPdf = { fileName: "old.pdf", fileSize: 3, sha256: "a".repeat(64), pageCount: 1, pages: [{ page: 1, text: "old" }] };
    const newParsed: ParsedPdf = { fileName: "new.pdf", fileSize: 3, sha256: "b".repeat(64), pageCount: 1, pages: [{ page: 1, text: "new" }] };
    let state = workbenchReducer(initialWorkbenchState, { type: "document/select", slot: "original", file: oldFile });
    state = workbenchReducer(state, { type: "document/select", slot: "original", file: newFile });

    const afterLateParse = workbenchReducer(state, { type: "document/parsed", slot: "original", file: oldFile, parsed: oldParsed, chunks: [] });
    expect(afterLateParse.documents.original?.parsed).toBeUndefined();

    state = workbenchReducer(state, { type: "document/parsed", slot: "original", file: newFile, parsed: newParsed, chunks: [] });
    state = workbenchReducer(state, { type: "document/kind", slot: "original", componentKind: "shielded-power-inductor" });
    const afterLateOptions = workbenchReducer(state, { type: "document/options", slot: "original", documentId: oldParsed.sha256, options: [], componentKind: "mlcc" });
    expect(afterLateOptions.documents.original?.options).toBeUndefined();

    state = workbenchReducer(state, { type: "document/ordering-code", slot: "original", orderingCode: "NEW-CODE" });
    const analysis = { envelope: structuredClone(mlccRecord), evidenceIssues: [], usedChunks: [] };
    const afterLateAnalysis = workbenchReducer(state, { type: "document/analysis", slot: "original", documentId: newParsed.sha256, orderingCode: "OLD-CODE", analysis });
    expect(afterLateAnalysis.documents.original?.analysis).toBeUndefined();
  });
});
