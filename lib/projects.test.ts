import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadProjects, getAllProjects, getFeaturedProjects, getProjectBySlug } from "./projects";
import { ContentValidationError } from "./content/shared";
import { fixtureDirectory, projectData, writeContent, writeTranslation } from "./content/test-fixtures";

const directories: string[] = [];
function directory() { const dir = fixtureDirectory(); directories.push(dir); return dir; }
afterEach(() => {
  vi.restoreAllMocks();
  directories.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true }));
});

describe("projects", () => {
  it("loads the PRD model and optional project relationships", () => {
    const dir = directory();
    writeContent(dir, "not-the-slug.mdx", { ...projectData, gallery: ["/images/pcb.png"], demoUrl: "/tools/pcb-test-point", repositoryUrl: "https://example.com/repo", relatedTools: ["pcb-test-point"], relatedNotes: [], outcome: "可檢查差異" });
    expect(loadProjects(dir)[0]).toMatchObject({ ...projectData, updatedAt: "2026-10-14T00:00:00.000Z", gallery: ["/images/pcb.png"], relatedTools: ["pcb-test-point"], relatedNotes: [], outcome: "可檢查差異", content: "測試正文。\n", locale: "zh-TW", translationOf: "test-project", translationStatus: "published" });
  });

  it("loads a visible localized project without mixing in originals", () => {
    const dir = directory();
    writeContent(dir, "test-project.md", projectData);
    writeTranslation(dir, "en", "test-project.md", { ...projectData, title: "Test project", locale: "en", translationOf: "test-project", translationStatus: "reviewed", translatedAt: "2026-10-19" });
    expect(loadProjects(dir, { locale: "en", visibility: "preview" })).toMatchObject([{ title: "Test project", locale: "en", translationOf: "test-project", translationStatus: "reviewed", translatedAt: "2026-10-19T00:00:00.000Z" }]);
    expect(loadProjects(dir, { locale: "en", visibility: "production" })).toEqual([]);
  });

  it("sorts projects by update date, independent of featured status", () => {
    const dir = directory();
    writeContent(dir, "a.md", { ...projectData, slug: "older", updatedAt: "2026-01-01" });
    writeContent(dir, "b.md", { ...projectData, slug: "newer", featured: false });
    expect(loadProjects(dir).map((item) => item.slug)).toEqual(["newer", "older"]);
  });

  it("filters featured projects before applying the requested limit", async () => {
    const root = directory();
    const dir = path.join(root, "content/projects");
    fs.mkdirSync(dir, { recursive: true });
    writeContent(dir, "a.md", { ...projectData, slug: "ordinary-newest", featured: false, updatedAt: "2026-10-15" });
    writeContent(dir, "b.md", { ...projectData, slug: "featured-newer" });
    writeContent(dir, "c.md", { ...projectData, slug: "featured-older", updatedAt: "2026-01-01" });
    vi.spyOn(process, "cwd").mockReturnValue(root);
    expect((await getFeaturedProjects(1)).map((item) => item.slug)).toEqual(["featured-newer"]);
    expect(await getFeaturedProjects(0)).toEqual([]);
  });

  it.each([
    ["title", ""], ["slug", undefined], ["summary", ""], ["year", "2026"], ["year", 2026.5],
    ["status", "maintenance"], ["areas", ["software"]], ["areas", []], ["role", ""],
    ["tags", "PCB"], ["tags", [""]], ["featured", "true"], ["updatedAt", undefined],
    ["gallery", "image.png"], ["demoUrl", "javascript:alert(1)"], ["relatedTools", [42]],
  ])("rejects invalid project %s", (field, value) => {
    const dir = directory();
    writeContent(dir, "invalid.md", { ...projectData, [field]: value });
    expect(() => loadProjects(dir)).toThrow(ContentValidationError);
    expect(() => loadProjects(dir)).toThrow(new RegExp(`invalid\\.md.*${field}`));
  });

  it("loads only the two real projects and selects explicit featured projects", async () => {
    const all = await getAllProjects();
    expect(all).toHaveLength(2);
    expect(all.map((item) => item.slug).sort()).toEqual(["jk-space-news-automation", "pcb-test-point-comparison"]);
    expect(await getProjectBySlug("pcb-test-point-comparison")).toMatchObject({ year: 2026, status: "maintained", areas: ["hardware", "product"], role: "設計與實作", featured: true });
    expect(await getProjectBySlug("jk-space-news-automation")).toMatchObject({ status: "archived" });
    expect((await getFeaturedProjects()).map((item) => item.slug)).toEqual(["jk-space-news-automation", "pcb-test-point-comparison"]);
    expect(await getFeaturedProjects(1)).toHaveLength(1);
    expect(await getProjectBySlug("missing")).toBeNull();
  });
});
