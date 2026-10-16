import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ContentValidationError, ContentFields, readContentFile, loadContentCollection, estimateReadingTime } from "./shared";
import { fixtureDirectory, writeContent } from "./test-fixtures";

const directories: string[] = [];
function directory() { const dir = fixtureDirectory(); directories.push(dir); return dir; }
afterEach(() => directories.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true })));

describe("strict frontmatter validation", () => {
  it.each([undefined, "", "   ", 42])("rejects a missing or invalid required string: %s", (title) => {
    const fields = new ContentFields("broken.md", { title });
    expect(() => fields.string("title")).toThrow(ContentValidationError);
    expect(() => fields.string("title")).toThrow(/broken\.md.*title/);
  });

  it.each([undefined, "yesterday", "2026-02-30", "2026-13-01", "2026-10-14T25:00:00Z", 123])("rejects an invalid date: %s", (updatedAt) => {
    expect(() => new ContentFields("bad-date.md", { updatedAt }).date("updatedAt")).toThrow(/bad-date\.md.*updatedAt/);
  });

  it("normalizes dates to ISO without depending on the current clock", () => {
    expect(new ContentFields("valid.md", { date: "2026-10-14" }).date("date")).toBe("2026-10-14T00:00:00.000Z");
    expect(new ContentFields("valid.md", { date: "2026-10-14T08:30:00+08:00" }).date("date")).toBe("2026-10-14T00:30:00.000Z");
  });

  it.each(["2026-02-30", '"2026-02-30"'])("does not let YAML roll impossible dates forward: %s", (date) => {
    const file = path.join(directory(), "invalid.md");
    fs.writeFileSync(file, `---\nupdatedAt: ${date}\n---\nBody`);
    const parsed = readContentFile(file);
    expect(() => new ContentFields(file, parsed.data).date("updatedAt")).toThrow(/invalid\.md.*updatedAt/);
  });

  it("rejects invalid enum values with file and field context", () => {
    expect(() => new ContentFields("status.md", { status: "unknown" }).enum("status", ["active", "archived"])).toThrow(/status\.md.*status/);
  });

  it("wraps malformed YAML in a content validation error", () => {
    const file = path.join(directory(), "malformed.md");
    fs.writeFileSync(file, "---\ntitle: [broken\n---\nBody");
    expect(() => readContentFile(file)).toThrow(ContentValidationError);
    expect(() => readContentFile(file)).toThrow(/malformed\.md.*frontmatter/);
  });

  it("loads Markdown and MDX, ignoring non-content files", () => {
    const dir = directory();
    writeContent(dir, "a.md", { slug: "a" });
    writeContent(dir, "b.mdx", { slug: "b" }, "<Component />");
    fs.writeFileSync(path.join(dir, ".gitkeep"), "");
    expect(loadContentCollection(dir, ({ file, data, content }) => ({ slug: new ContentFields(file, data).string("slug"), content }))).toEqual([
      { slug: "a", content: "測試正文。\n" }, { slug: "b", content: "<Component />\n" },
    ]);
  });

  it("rejects duplicate frontmatter slugs across different filenames", () => {
    const dir = directory();
    writeContent(dir, "a.md", { slug: "duplicate" });
    writeContent(dir, "b.mdx", { slug: "duplicate" });
    expect(() => loadContentCollection(dir, ({ file, data }) => ({ slug: new ContentFields(file, data).string("slug") }))).toThrow(/b\.mdx.*slug.*duplicate/);
  });

  it("accepts an empty directory", () => {
    expect(loadContentCollection(directory(), () => ({ slug: "unused" }))).toEqual([]);
  });

  it("counts Chinese characters and Latin words for reading time", () => {
    expect(estimateReadingTime("" )).toBe(1);
    expect(estimateReadingTime("測".repeat(401))).toBe(3);
    expect(estimateReadingTime("word ".repeat(201))).toBe(2);
  });
});
