import { describe, expect, it } from "vitest";
import { loadProjects, type ProjectItem } from "./projects";
import { loadTools, type ToolItem } from "./tools";
import type { NoteItem } from "./notes";
import { siteConfig } from "./site-config";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  buildLanguageAlternates,
  buildLocalizedMetadata,
  buildSitemapEntries,
  ogTypeLabel,
  personJsonLd,
  projectJsonLd,
  toolJsonLd,
  websiteJsonLd,
} from "./seo";

const note: NoteItem = {
  title: "工程取捨", slug: "engineering tradeoffs", summary: "可重現的判斷", type: "engineering", author: "JK Space",
  publishedAt: "2026-10-13T00:00:00.000Z", updatedAt: "2026-10-14T00:00:00.000Z", tags: [], featured: false, readingTime: 1, content: "原創內容",
  locale: "zh-TW", translationOf: "engineering tradeoffs", translationStatus: "published",
};
const config = { ...siteConfig, url: "https://lab.example.com" };

describe("localized metadata", () => {
  it("publishes a self-canonical URL and reciprocal absolute language alternates", () => {
    expect(buildLanguageAlternates("/about", ["zh-TW", "zh-CN", "en"])).toEqual({
      "zh-Hant-TW": "https://jk-space.com/about",
      "zh-Hans-CN": "https://jk-space.com/zh-cn/about",
      en: "https://jk-space.com/en/about",
      "x-default": "https://jk-space.com/about",
    });
    const metadata = buildLocalizedMetadata({
      locale: "en", pathname: "/about", title: "About", description: "Engineering profile",
      availableLocales: ["zh-TW", "zh-CN", "en"], type: "website", imageTitle: `About </script> & "work"`,
    });
    expect(metadata.alternates).toEqual({
      canonical: "/en/about",
      languages: {
        "zh-Hant-TW": "https://jk-space.com/about",
        "zh-Hans-CN": "https://jk-space.com/zh-cn/about",
        en: "https://jk-space.com/en/about",
        "x-default": "https://jk-space.com/about",
      },
    });
    expect(metadata.openGraph).toMatchObject({ locale: "en_US", url: "/en/about", title: "About </script> & \"work\" | JK Space" });
    expect(metadata.openGraph).toMatchObject({ images: [{ url: "/api/og?title=About+%3C%2Fscript%3E+%26+%22work%22+%7C+JK+Space" }] });
  });

  it("never advertises a translation that is not available", () => {
    expect(buildLanguageAlternates("/projects/example", ["zh-TW", "en"])).toEqual({
      "zh-Hant-TW": "https://jk-space.com/projects/example",
      en: "https://jk-space.com/en/projects/example",
      "x-default": "https://jk-space.com/projects/example",
    });
  });
});

describe("portfolio GEO schemas", () => {
  it("keeps stable entity IDs while localizing visible identity and expertise", () => {
    expect(personJsonLd("en", config)).toMatchObject({
      "@context": "https://schema.org", "@type": "Person", "@id": "https://lab.example.com/#person",
      name: "JK Space", url: "https://lab.example.com/en/about", inLanguage: "en",
      sameAs: ["https://github.com/happytimes29", "https://t.me/JK_Sapce"],
      knowsAbout: ["Hardware systems and RF circuits", "AI automation workflows", "Independent product experiments"],
    });
    expect(websiteJsonLd("en", config)).toMatchObject({
      "@type": "WebSite", "@id": "https://lab.example.com/#website", name: "JK Space",
      url: "https://lab.example.com/en", inLanguage: "en", publisher: { "@id": "https://lab.example.com/#person" },
    });
    expect(personJsonLd("zh-TW", { ...config, contacts: [] }).sameAs).toEqual([]);
  });

  it("uses the active canonical URL and exact language for project, tool, article, and breadcrumb", () => {
    const originalProject = loadProjects().find((item) => item.slug === "pcb-test-point-comparison")!;
    const project: ProjectItem = { ...originalProject, locale: "en", title: "PCB comparison", translationStatus: "published" };
    const originalTool = loadTools().find((item) => item.slug === "pcb-test-point")!;
    const tool: ToolItem = { ...originalTool, locale: "en", title: "PCB comparison tool", translationStatus: "published" };
    const localizedTool: ToolItem = { ...tool, slug: "engineering-converter", appUrl: "/tools/engineering-converter/app", localizedApp: true };
    const translatedNote: NoteItem = { ...note, locale: "en", title: "Engineering tradeoffs", translationStatus: "published" };

    expect(projectJsonLd(project, "en", config)).toMatchObject({ "@type": "CreativeWork", url: "https://lab.example.com/en/projects/pcb-test-point-comparison", inLanguage: "en", creator: { "@id": "https://lab.example.com/#person" } });
    expect(toolJsonLd(tool, "en", config)).toMatchObject({ "@type": "SoftwareApplication", url: "https://lab.example.com/en/tools/pcb-test-point", installUrl: "https://lab.example.com/tools/pcb-test-point/app", inLanguage: "en" });
    expect(toolJsonLd(localizedTool, "en", config)).toMatchObject({ installUrl: "https://lab.example.com/en/tools/engineering-converter/app" });
    expect(articleJsonLd(translatedNote, "en", config)).toMatchObject({ "@type": "Article", url: "https://lab.example.com/en/notes/engineering%20tradeoffs", mainEntityOfPage: "https://lab.example.com/en/notes/engineering%20tradeoffs", inLanguage: "en" });
    expect(breadcrumbJsonLd("en", [{ name: "Projects", pathname: "/projects" }, { name: "PCB comparison", pathname: "/projects/pcb-test-point-comparison" }], config)).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        { position: 1, name: "Projects", item: "https://lab.example.com/en/projects" },
        { position: 2, name: "PCB comparison", item: "https://lab.example.com/en/projects/pcb-test-point-comparison" },
      ],
    });
  });

  it("keeps authored commentary separate from its citation", () => {
    const commentary = { ...note, type: "commentary" as const, sourceTitle: "原始規格", sourceUrl: "https://example.com/spec", sourcePublishedAt: "2026-10-12T00:00:00.000Z" };
    expect(articleJsonLd(commentary, "zh-TW", config)).toMatchObject({
      "@type": "Article", headline: "工程取捨", datePublished: "2026-10-13T00:00:00.000Z",
      citation: { "@type": "CreativeWork", name: "原始規格", url: "https://example.com/spec", datePublished: "2026-10-12T00:00:00.000Z" },
    });
    expect(articleJsonLd(note, "zh-TW", config)).not.toHaveProperty("citation");
  });
});

describe("localized sitemap", () => {
  it("lists three-language core pages and only real published content variants", () => {
    const project = loadProjects().find((item) => item.slug === "pcb-test-point-comparison")!;
    const translatedProject: ProjectItem = { ...project, locale: "en", title: "PCB comparison", translationStatus: "published" };
    const entries = buildSitemapEntries({
      baseUrl: "https://lab.example.com/",
      projectsByLocale: { "zh-TW": [project], "zh-CN": [], en: [translatedProject] },
      toolsByLocale: { "zh-TW": [], "zh-CN": [], en: [] },
      notesByLocale: { "zh-TW": [note], "zh-CN": [], en: [] },
    });
    expect(entries).toHaveLength(24); // 7 core pages × 3 locales + 2 project variants + 1 note.
    expect(entries.map(({ url }) => url)).toEqual(expect.arrayContaining([
      "https://lab.example.com/about", "https://lab.example.com/zh-cn/about", "https://lab.example.com/en/about",
      "https://lab.example.com/projects/pcb-test-point-comparison", "https://lab.example.com/en/projects/pcb-test-point-comparison",
      "https://lab.example.com/notes/engineering%20tradeoffs",
    ]));
    expect(entries.map(({ url }) => url)).not.toContain("https://lab.example.com/zh-cn/projects/pcb-test-point-comparison");
    const translatedEntry = entries.find(({ url }) => url.endsWith("/en/projects/pcb-test-point-comparison"));
    expect(translatedEntry?.alternates?.languages).toEqual({
      "zh-Hant-TW": "https://lab.example.com/projects/pcb-test-point-comparison",
      en: "https://lab.example.com/en/projects/pcb-test-point-comparison",
      "x-default": "https://lab.example.com/projects/pcb-test-point-comparison",
    });
  });

  it("adds app URLs only for visible localized applications", () => {
    const original = loadTools()[0];
    const localized: ToolItem = { ...original, slug: "engineering-converter", localizedApp: true, appUrl: "/tools/engineering-converter/app" };
    const entries = buildSitemapEntries({
      baseUrl: "https://lab.example.com",
      projectsByLocale: {}, notesByLocale: {},
      toolsByLocale: { "zh-TW": [localized], en: [{ ...localized, locale: "en" }] },
    });
    expect(entries.map(({ url }) => url)).toEqual(expect.arrayContaining([
      "https://lab.example.com/tools/engineering-converter/app",
      "https://lab.example.com/en/tools/engineering-converter/app",
    ]));
    expect(entries.find(({ url }) => url.endsWith("/en/tools/engineering-converter/app"))?.alternates?.languages).toMatchObject({
      "zh-Hant-TW": "https://lab.example.com/tools/engineering-converter/app",
      en: "https://lab.example.com/en/tools/engineering-converter/app",
    });
  });
});

describe("OG labels", () => {
  it.each([["project", "專案"], ["tool", "工具"], ["note", "筆記與觀點"], [null, "JK Space"], ["news", "JK Space"], ["<script>", "JK Space"], ["constructor", "JK Space"]])("maps OG type %s to a safe label", (type, label) => {
    expect(ogTypeLabel(type)).toBe(label);
  });
});
