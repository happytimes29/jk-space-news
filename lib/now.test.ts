import fs from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { loadNow } from "./now";
import { fixtureDirectory, writeContent } from "./content/test-fixtures";

const directories: string[] = [];
function directory() { const dir = fixtureDirectory(); directories.push(dir); return dir; }
afterEach(() => directories.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true })));

describe("Now", () => {
  it("loads a dated update with its Markdown body", () => {
    const file = writeContent(directory(), "now.md", { updatedAt: "2026-10-14" }, "正在整理工程專案。");
    expect(loadNow(file)).toEqual({ updatedAt: "2026-10-14T00:00:00.000Z", content: "正在整理工程專案。\n" });
  });

  it("rejects a missing date", () => {
    const file = writeContent(directory(), "now.md", {});
    expect(() => loadNow(file)).toThrow(/now\.md.*updatedAt/);
  });

  it("rejects an empty update body", () => {
    const file = writeContent(directory(), "now.md", { updatedAt: "2026-10-14" }, " ");
    expect(() => loadNow(file)).toThrow(/now\.md.*content/);
  });

  it("loads the real engineering-lab migration update", () => {
    expect(loadNow()).toMatchObject({ updatedAt: "2026-10-14T00:00:00.000Z" });
    expect(loadNow().content).toContain("個人工程實驗室");
  });
});
