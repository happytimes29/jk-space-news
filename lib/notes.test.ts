import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadNotes, getAllNotes, getRecentNotes, getNoteBySlug } from "./notes";
import { fixtureDirectory, noteData, writeContent, writeTranslation } from "./content/test-fixtures";

const directories: string[] = [];
function directory() { const dir = fixtureDirectory(); directories.push(dir); return dir; }
afterEach(() => {
  vi.restoreAllMocks();
  directories.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true }));
});
const source = { sourceTitle: "原始報導", sourceUrl: "https://example.com/report", sourcePublishedAt: "2026-10-12" };
const commentaryContent = "## 事件摘要\n\n來源報導的事實。\n\n## 我的觀點\n\n我的工程判斷。";

describe("notes", () => {
  it.each(["engineering", "automation", "project-log"])("loads an original %s note", (type) => {
    const dir = directory();
    writeContent(dir, "note.mdx", { ...noteData, type, relatedProjects: ["pcb-test-point-comparison"], relatedTools: [] });
    expect(loadNotes(dir)[0]).toMatchObject({ ...noteData, type, publishedAt: "2026-10-13T00:00:00.000Z", updatedAt: "2026-10-14T00:00:00.000Z", relatedProjects: ["pcb-test-point-comparison"], relatedTools: [], readingTime: 1, locale: "zh-TW", translationOf: "test-note", translationStatus: "published" });
  });

  it("loads a localized note without falling back to Traditional Chinese", () => {
    const dir = directory();
    writeContent(dir, "test-note.md", noteData);
    writeTranslation(dir, "en", "test-note.md", { ...noteData, title: "Test note", locale: "en", translationOf: "test-note", translationStatus: "published", translatedAt: "2026-10-19" });
    expect(loadNotes(dir, { locale: "en", visibility: "production" })).toMatchObject([{ title: "Test note", locale: "en", translationStatus: "published" }]);
  });

  it("loads a commentary note with its mandatory source disclosure", () => {
    const dir = directory();
    writeContent(dir, "commentary.md", { ...noteData, ...source, type: "commentary" }, commentaryContent);
    expect(loadNotes(dir)[0]).toMatchObject({ type: "commentary", sourceTitle: "原始報導", sourceUrl: "https://example.com/report", sourcePublishedAt: "2026-10-12T00:00:00.000Z" });
  });

  it.each(["sourceTitle", "sourceUrl", "sourcePublishedAt"])("refuses commentary without %s", (field) => {
    const dir = directory();
    writeContent(dir, "missing-source.md", { ...noteData, ...source, type: "commentary", [field]: undefined });
    expect(() => loadNotes(dir)).toThrow(new RegExp(`missing-source\\.md.*${field}`));
  });

  // Catches publishing source metadata while the actual article lacks its required sections.
  it.each([
    ["missing summary", "## 我的觀點\n個人評論。"],
    ["missing opinion", "## 事件摘要\n報導事實。"],
    ["reversed sections", "## 我的觀點\n評論。\n## 事件摘要\n事實。"],
    ["duplicate section", `${commentaryContent}\n## 我的觀點\n重複。`],
    ["empty summary", "## 事件摘要\n\n## 我的觀點\n評論。"],
    ["headings only inside a fence", "```md\n## 事件摘要\n事實。\n## 我的觀點\n評論。\n```"],
    ["headings only inside a quote", "> ## 事件摘要\n> 事實。\n> ## 我的觀點\n> 評論。"],
    ["headings only inside a comment", "<!--\n## 事件摘要\n事實。\n## 我的觀點\n評論。\n-->"],
  ])("refuses commentary content with %s", (_case, content) => {
    const dir = directory();
    writeContent(dir, "invalid-sections.md", { ...noteData, ...source, type: "commentary" }, content);
    expect(() => loadNotes(dir)).toThrow(/invalid-sections\.md.*content.*事件摘要.*我的觀點/);
  });

  it.each([["type", "news"], ["publishedAt", undefined], ["updatedAt", "invalid"], ["author", ""], ["featured", 1], ["tags", null]])("rejects invalid note %s", (field, value) => {
    const dir = directory();
    writeContent(dir, "invalid.md", { ...noteData, [field]: value });
    expect(() => loadNotes(dir)).toThrow(new RegExp(`invalid\\.md.*${field}`));
  });

  it("requires an external HTTP source link", () => {
    const dir = directory();
    writeContent(dir, "invalid.md", { ...noteData, ...source, type: "commentary", sourceUrl: "/notes/self" });
    expect(() => loadNotes(dir)).toThrow(/sourceUrl/);
  });

  it("sorts by publication date rather than subsequent edits", () => {
    const dir = directory();
    writeContent(dir, "a.md", { ...noteData, slug: "old-edited", publishedAt: "2026-01-01", updatedAt: "2026-10-15" });
    writeContent(dir, "b.md", { ...noteData, slug: "new" });
    expect(loadNotes(dir).map((item) => item.slug)).toEqual(["new", "old-edited"]);
  });

  it("limits recent notes and finds a note by its explicit slug", async () => {
    const root = directory();
    const dir = path.join(root, "content/notes");
    fs.mkdirSync(dir, { recursive: true });
    for (const [slug, publishedAt] of [["first", "2026-01-01"], ["second", "2026-02-01"], ["third", "2026-03-01"], ["fourth", "2026-04-01"]]) {
      writeContent(dir, `${slug}.md`, { ...noteData, slug, publishedAt });
    }
    vi.spyOn(process, "cwd").mockReturnValue(root);
    expect((await getRecentNotes()).map((item) => item.slug)).toEqual(["fourth", "third", "second"]);
    expect((await getRecentNotes(1)).map((item) => item.slug)).toEqual(["fourth"]);
    expect(await getRecentNotes(0)).toEqual([]);
    expect(await getNoteBySlug("second")).toMatchObject({ slug: "second", publishedAt: "2026-02-01T00:00:00.000Z" });
  });

  it("accepts an empty notes directory and publishes no placeholder notes", async () => {
    const root = directory();
    const dir = path.join(root, "content/notes");
    fs.mkdirSync(dir, { recursive: true });
    vi.spyOn(process, "cwd").mockReturnValue(root);
    expect(loadNotes(dir)).toEqual([]);
    expect(await getAllNotes()).toEqual([]);
    expect(await getRecentNotes()).toEqual([]);
    expect(await getNoteBySlug("missing")).toBeNull();
  });

  it("treats a missing notes directory as an empty collection in production bundles", async () => {
    const root = directory();
    const dir = path.join(root, "content/notes");
    vi.spyOn(process, "cwd").mockReturnValue(root);
    expect(fs.existsSync(dir)).toBe(false);
    expect(loadNotes(dir)).toEqual([]);
    expect(await getAllNotes()).toEqual([]);
  });
});
