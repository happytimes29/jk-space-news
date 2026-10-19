import { describe, expect, it } from "vitest";
import type { ProjectItem } from "@/lib/projects";
import { filterProjects } from "./projects-view";

const project = (slug: string, overrides: Partial<Omit<ProjectItem, "locale" | "translationOf" | "translationStatus">>): ProjectItem => ({
  slug, title: slug, summary: "工程案例", year: 2026, status: "completed",
  areas: ["hardware"], role: "設計與實作", tags: [], featured: false,
  updatedAt: "2026-01-01", readingTime: 1, content: "案例正文", ...overrides,
  locale: "zh-TW", translationOf: slug, translationStatus: "published",
});
const items = [
  project("newest", { updatedAt: "2026-10-14", areas: ["product"] }),
  project("featured-old", { featured: true, status: "maintained", areas: ["hardware", "product"] }),
  project("older", { updatedAt: "2026-03-01", areas: ["automation"], status: "archived" }),
  project("featured-new", { featured: true, updatedAt: "2026-06-10", status: "archived", areas: ["automation", "product"] }),
];

describe("filterProjects", () => {
  it("puts featured projects first and orders each group by latest update without mutating input", () => {
    expect(filterProjects(items, {}).map((item) => item.slug)).toEqual(["featured-new", "featured-old", "newest", "older"]);
    expect(items.map((item) => item.slug)).toEqual(["newest", "featured-old", "older", "featured-new"]);
  });

  it.each([
    [{ area: "hardware" }, ["featured-old"]],
    [{ status: "archived" }, ["featured-new", "older"]],
    [{ area: "product", status: "archived" }, ["featured-new"]],
    [{ area: "hardware", status: "archived" }, []],
    [{ area: "unknown" }, []],
    [{ status: "unknown" }, []],
    [{ area: "", status: "" }, ["featured-new", "featured-old", "newest", "older"]],
  ])("applies the requested filters %j", (filters, slugs) => {
    expect(filterProjects(items, filters).map((item) => item.slug)).toEqual(slugs);
  });
});
