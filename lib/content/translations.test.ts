import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ContentValidationError } from "@/lib/content/shared";
import { fixtureDirectory, projectData, toolData, writeContent, writeTranslation } from "@/lib/content/test-fixtures";
import {
  buildTranslationAvailability,
  contentVisibility,
  getTranslationAvailability,
  translationDirectory,
} from "@/lib/content/translations";
import { loadProjects } from "@/lib/projects";

const directories: string[] = [];
function directory() {
  const dir = fixtureDirectory();
  directories.push(dir);
  return dir;
}

afterEach(() => {
  directories.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true }));
});

function translatedProject(slug: string, status: string, overrides: Record<string, unknown> = {}) {
  return {
    ...projectData,
    title: `${slug} translation`,
    slug,
    locale: "en",
    translationOf: slug,
    translationStatus: status,
    translatedAt: "2026-10-19",
    ...overrides,
  };
}

describe("translation state", () => {
  it("derives translation directories from the exact locale segment", () => {
    expect(translationDirectory("/content/projects", "zh-TW")).toBe("/content/projects");
    expect(translationDirectory("/content/projects", "zh-CN")).toBe("/content/projects/zh-cn");
    expect(translationDirectory("/content/projects", "en")).toBe("/content/projects/en");
  });

  it.each([
    [{ VERCEL_ENV: "preview" }, "preview"],
    [{ CONTENT_PREVIEW: "1" }, "preview"],
    [{ VERCEL_ENV: "production", CONTENT_PREVIEW: "0" }, "production"],
    [{}, "production"],
  ] as const)("maps deployment variables to %s visibility", (env, expected) => {
    expect(contentVisibility(env)).toBe(expected);
  });

  it("publishes only published translations and exposes reviewed copy in Preview", () => {
    const dir = directory();
    for (const slug of ["published", "reviewed", "draft"]) {
      writeContent(dir, `${slug}.md`, { ...projectData, slug });
      writeTranslation(dir, "en", `${slug}.md`, translatedProject(slug, slug));
    }

    expect(loadProjects(dir, { locale: "en", visibility: "production" }).map((item) => item.slug)).toEqual(["published"]);
    expect(loadProjects(dir, { locale: "en", visibility: "preview" }).map((item) => item.slug).sort()).toEqual(["published", "reviewed"]);
    expect(loadProjects(dir, { locale: "zh-TW", visibility: "production" })[0]).toMatchObject({
      locale: "zh-TW",
      translationOf: "draft",
      translationStatus: "published",
    });
  });

  it.each([
    ["orphan", "orphan.md", translatedProject("orphan", "published")],
    ["mismatched slug", "test-project.md", translatedProject("different", "published")],
    ["invalid locale", "test-project.md", translatedProject("test-project", "published", { locale: "fr" })],
    ["invalid status", "test-project.md", translatedProject("test-project", "ready")],
    ["invalid date", "test-project.md", translatedProject("test-project", "published", { translatedAt: "2026-02-30" })],
  ])("rejects a %s translation", (_name, filename, data) => {
    const dir = directory();
    if (_name !== "orphan") writeContent(dir, "test-project.md", projectData);
    writeTranslation(dir, "en", filename, data);
    expect(() => loadProjects(dir, { locale: "en", visibility: "preview" })).toThrow(ContentValidationError);
  });

  it("rejects duplicate translations for one locale and original", () => {
    const dir = directory();
    writeContent(dir, "test-project.md", projectData);
    const translation = translatedProject("test-project", "published");
    writeTranslation(dir, "en", "test-project.md", translation);
    writeTranslation(dir, "en", "test-project.mdx", translation);
    expect(() => loadProjects(dir, { locale: "en", visibility: "preview" })).toThrow(/duplicate slug/);
  });

  it("builds availability only from validated and visible content", () => {
    const root = directory();
    const projects = path.join(root, "projects");
    const tools = path.join(root, "tools");
    const notes = path.join(root, "notes");
    writeContent(projects, "test-project.md", projectData);
    writeTranslation(projects, "zh-cn", "test-project.md", translatedProject("test-project", "published", { locale: "zh-CN", title: "简体项目" }));
    writeTranslation(projects, "en", "test-project.md", translatedProject("test-project", "reviewed"));
    writeContent(tools, "test-tool.md", toolData);

    const roots = { projects, tools, notes };
    expect(getTranslationAvailability("projects", "test-project", "production", roots)).toEqual(["zh-TW", "zh-CN"]);
    expect(getTranslationAvailability("projects", "test-project", "preview", roots)).toEqual(["zh-TW", "zh-CN", "en"]);

    const availability = buildTranslationAvailability("production", roots);
    expect(availability["/about"]).toEqual(["zh-TW", "zh-CN", "en"]);
    expect(availability["/projects/test-project"]).toEqual(["zh-TW", "zh-CN"]);
    expect(availability["/tools/test-tool"]).toEqual(["zh-TW"]);
  });
});
