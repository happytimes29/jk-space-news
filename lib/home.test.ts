import { describe, expect, it } from "vitest";
import type { ProjectItem } from "./projects";
import type { ToolItem } from "./tools";
import type { NoteItem } from "./notes";
import { selectHomeContent } from "./home";

const project: ProjectItem = { title: "工程案例", slug: "project", summary: "實際問題", year: 2026, status: "maintained", areas: ["hardware"], role: "設計", tags: [], featured: true, updatedAt: "2026-10-14", readingTime: 1, content: "正文" };
const tool: ToolItem = { title: "工程工具", slug: "tool", summary: "用途", status: "available", privacy: "瀏覽器內處理", inputTypes: ["HTML"], outputTypes: ["CSV"], updatedAt: "2026-10-14", readingTime: 1, content: "正文" };
const note: NoteItem = { title: "工程筆記", slug: "note", summary: "摘要", type: "engineering", publishedAt: "2026-10-14", updatedAt: "2026-10-14", author: "JK Space", tags: [], featured: false, readingTime: 1, content: "正文" };

describe("selectHomeContent", () => {
  // Catches leaking unfeatured work, date-sorting the curated order, or exceeding the homepage limit.
  it("keeps at most four featured projects in their supplied order", () => {
    const projects = [
      { ...project, slug: "hidden", featured: false },
      ...["first", "second", "third", "fourth", "fifth"].map((slug, index) => ({ ...project, slug, updatedAt: `2026-10-${10 + index}` })),
    ];
    expect(selectHomeContent(projects, [], []).featuredProjects.map((item) => item.slug)).toEqual(["first", "second", "third", "fourth"]);
    expect(projects.map((item) => item.slug)).toEqual(["hidden", "first", "second", "third", "fourth", "fifth"]);
  });

  // Catches selecting an unusable tool or taking the last available one.
  it("features the first available tool", () => {
    expect(selectHomeContent([], [
      { ...tool, slug: "experiment", status: "experimental" },
      { ...tool, slug: "first" }, { ...tool, slug: "second" },
    ], []).featuredTool?.slug).toBe("first");
    expect(selectHomeContent([], [{ ...tool, status: "archived" }], []).featuredTool).toBeNull();
  });

  // Catches using update dates, taking too many notes, or mutating the collection.
  it("takes the three most recently published notes without changing the input", () => {
    const notes: NoteItem[] = [
      { ...note, slug: "old", publishedAt: "2026-10-01", updatedAt: "2026-10-15" },
      { ...note, slug: "third", publishedAt: "2026-10-12" },
      { ...note, slug: "newest", publishedAt: "2026-10-14" },
      { ...note, slug: "second", publishedAt: "2026-10-13" },
    ];
    expect(selectHomeContent([], [], notes).recentNotes.map((item) => item.slug)).toEqual(["newest", "second", "third"]);
    expect(notes.map((item) => item.slug)).toEqual(["old", "third", "newest", "second"]);
  });

  it("preserves honest empty collections", () => {
    expect(selectHomeContent([], [], [])).toEqual({ featuredProjects: [], featuredTool: null, recentNotes: [] });
  });
});
