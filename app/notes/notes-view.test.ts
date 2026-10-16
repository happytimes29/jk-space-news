import { describe, expect, it } from "vitest";
import type { NoteItem, NoteType } from "@/lib/notes";
import { filterNotes } from "./notes-view";

const base = { summary: "原創筆記", publishedAt: "2026-10-14", updatedAt: "2026-10-15", tags: [], author: "JK Space", featured: false, readingTime: 1, content: "正文" };
const items: NoteItem[] = [
  { ...base, type: "engineering", slug: "engineering", title: "工程", publishedAt: "2026-10-10" },
  { ...base, type: "automation", slug: "automation", title: "自動化" },
  { ...base, type: "project-log", slug: "project-log", title: "專案", publishedAt: "2026-10-12" },
  { ...base, type: "commentary", slug: "commentary", title: "觀點", sourceTitle: "來源", sourceUrl: "https://example.com/report", sourcePublishedAt: "2026-10-13", publishedAt: "2026-10-13" },
];

describe("filterNotes", () => {
  // Catches returning unrelated types or dropping one supported category.
  it.each<NoteType>(["engineering", "automation", "project-log", "commentary"])("selects only %s notes", (type) => {
    expect(filterNotes(items, type).map((note) => note.slug)).toEqual([type]);
  });

  it("sorts by publication date without mutating the input", () => {
    expect(filterNotes(items).map((note) => note.slug)).toEqual(["automation", "commentary", "project-log", "engineering"]);
    expect(items.map((note) => note.slug)).toEqual(["engineering", "automation", "project-log", "commentary"]);
  });

  it("keeps an empty collection empty", () => {
    expect(filterNotes([])).toEqual([]);
  });
});
