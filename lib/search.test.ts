import { describe, expect, it } from "vitest";
import { buildSearchItems, filterSearchItems, type SearchItem } from "./search";
import { loadProjects } from "./projects";
import { loadTools } from "./tools";
import type { NoteItem } from "./notes";

describe("buildSearchItems", () => {
  it("indexes each collection at its public detail route", () => {
    const note: NoteItem = {
      slug: "test-method", title: "測試方法", summary: "可重現的流程",
      publishedAt: "2026-10-14T00:00:00.000Z", updatedAt: "2026-10-14T00:00:00.000Z",
      type: "engineering", tags: ["量測"], author: "JK", featured: false,
      content: "測試內容", readingTime: 1,
      locale: "zh-TW", translationOf: "test-method", translationStatus: "published",
    };
    const projects = loadProjects();
    const items = buildSearchItems([
      projects.find((project) => project.slug === "pcb-test-point-comparison")!,
      projects.find((project) => project.slug === "jk-space-news-automation")!,
    ], loadTools(), [note], "zh-TW");

    expect(items.map(({ href, type }) => ({ href, type }))).toEqual([
      { href: "/projects/pcb-test-point-comparison", type: "project" },
      { href: "/projects/jk-space-news-automation", type: "project" },
      { href: "/tools/engineering-converter", type: "tool" },
      { href: "/tools/passive-circuit-calculator", type: "tool" },
      { href: "/tools/rf-calculator", type: "tool" },
      { href: "/tools/pcb-test-point", type: "tool" },
      { href: "/notes/test-method", type: "note" },
    ]);
    expect(items.at(-1)).toMatchObject({ title: "測試方法", label: expect.stringContaining("量測") });
  });

  it("accepts genuinely empty collections", () => {
    expect(buildSearchItems([], [], [], "en")).toEqual([]);
  });

  it("prefixes every English result and never invents fallback items", () => {
    const project = loadProjects()[0];
    expect(buildSearchItems([project], [], [], "en")).toEqual([{
      title: project.title,
      href: `/en/projects/${project.slug}`,
      type: "project",
      label: project.tags.join(" · "),
    }]);
  });
});

describe("filterSearchItems", () => {
  const items: SearchItem[] = [
    { title: "PCB Comparison", href: "/projects/pcb", type: "project", label: "硬體" },
    { title: "報表比較", href: "/tools/report", type: "tool", label: "CSV" },
    { title: "量測方法", href: "/notes/testing", type: "note", label: "工程筆記" },
  ];

  it.each([
    [" pcb ", "/projects/pcb"],
    ["csv", "/tools/report"],
    ["NOTE", "/notes/testing"],
  ])("matches a normalized query %s against title, label, or type", (query, href) => {
    expect(filterSearchItems(items, query).map((item) => item.href)).toEqual([href]);
  });

  it("limits an empty or whitespace query to seven results", () => {
    const many = Array.from({ length: 12 }, (_, index) => ({ ...items[0], href: `/projects/${index}` }));
    expect(filterSearchItems(many, "")).toHaveLength(7);
    expect(filterSearchItems(many, "  ")).toHaveLength(7);
    expect(filterSearchItems(many, "", 12)).toHaveLength(7);
  });

  it("limits matching queries to ten results by default and honors an explicit limit", () => {
    const many = Array.from({ length: 12 }, (_, index) => ({ ...items[0], href: `/projects/${index}` }));
    expect(filterSearchItems(many, "PCB")).toHaveLength(10);
    expect(filterSearchItems(many, "PCB", 2).map((item) => item.href)).toEqual(["/projects/0", "/projects/1"]);
    expect(filterSearchItems(many, "PCB", 0)).toEqual([]);
  });

  it("returns no results when the query does not match", () => {
    expect(filterSearchItems(items, "missing")).toEqual([]);
  });
});
