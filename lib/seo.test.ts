import { describe, expect, it } from "vitest";
import { loadProjects } from "./projects";
import { loadTools } from "./tools";
import type { NoteItem } from "./notes";
import { siteConfig } from "./site-config";
import { articleJsonLd, buildSitemapEntries, ogTypeLabel, personJsonLd, projectJsonLd, toolJsonLd, websiteJsonLd } from "./seo";

const note: NoteItem = {
  title: "工程取捨", slug: "engineering tradeoffs", summary: "可重現的判斷", type: "engineering", author: "JK Space",
  publishedAt: "2026-10-13T00:00:00.000Z", updatedAt: "2026-10-14T00:00:00.000Z", tags: [], featured: false, readingTime: 1, content: "原創內容",
  locale: "zh-TW", translationOf: "engineering tradeoffs", translationStatus: "published",
};
const config = { ...siteConfig, url: "https://lab.example.com" };

describe("portfolio SEO", () => {
  // Catches omitted details, accidental app/retired routes, malformed slugs and duplicated URL separators.
  it("lists exactly the public entries and each supplied content detail", () => {
    const entries = buildSitemapEntries({ baseUrl: "https://lab.example.com/", projects: loadProjects(), tools: loadTools(), notes: [note] });
    expect(entries.map((entry) => entry.url)).toEqual([
      "https://lab.example.com/", "https://lab.example.com/projects", "https://lab.example.com/tools", "https://lab.example.com/notes", "https://lab.example.com/about", "https://lab.example.com/contact", "https://lab.example.com/privacy",
      "https://lab.example.com/projects/jk-space-news-automation", "https://lab.example.com/projects/pcb-test-point-comparison", "https://lab.example.com/tools/pcb-test-point", "https://lab.example.com/notes/engineering%20tradeoffs",
    ]);
    expect(entries.at(-1)?.lastModified).toEqual(new Date("2026-10-14T00:00:00.000Z"));
    expect(buildSitemapEntries({ baseUrl: "https://lab.example.com", projects: [], tools: [], notes: [] })).toHaveLength(7);
  });

  // Catches person/profile confusion and contacts or branding being dropped from the public graph.
  it("connects the personal site to the configured person and public profiles", () => {
    expect(personJsonLd(config)).toMatchObject({ "@context": "https://schema.org", "@type": "Person", "@id": "https://lab.example.com/#person", name: "JK Space", url: "https://lab.example.com/about", sameAs: ["https://github.com/happytimes29", "https://t.me/JK_Sapce"] });
    expect(websiteJsonLd(config)).toMatchObject({ "@type": "WebSite", "@id": "https://lab.example.com/#website", name: "JK Space", url: "https://lab.example.com/", description: "硬體研發、AI 自動化、工程工具與技術觀點。", publisher: { "@id": "https://lab.example.com/#person" } });
    expect(personJsonLd({ ...config, contacts: [] }).sameAs).toEqual([]);
  });

  // Catches exposing a project as an article or giving it the wrong canonical identity.
  it("describes a project as the owner's creative work", () => {
    const project = loadProjects().find((item) => item.slug === "pcb-test-point-comparison")!;
    expect(projectJsonLd(project, config)).toMatchObject({ "@type": "CreativeWork", name: "PCB 測試點自動比對工具", url: "https://lab.example.com/projects/pcb-test-point-comparison", dateModified: "2026-06-10T00:00:00.000Z", creator: { "@id": "https://lab.example.com/#person" } });
  });

  // Catches losing the app entry point or inventing prices/ratings absent from authored tool data.
  it("describes a browser tool as software with its real launch URL", () => {
    expect(toolJsonLd(loadTools()[0], config)).toMatchObject({ "@type": "SoftwareApplication", name: "PCB 測試點自動比對工具", url: "https://lab.example.com/tools/pcb-test-point", installUrl: "https://lab.example.com/tools/pcb-test-point/app", operatingSystem: "Web browser", applicationCategory: "DeveloperApplication" });
    expect(toolJsonLd(loadTools()[0], config)).not.toHaveProperty("aggregateRating");
    expect(toolJsonLd(loadTools()[0], config)).not.toHaveProperty("offers");
  });

  // Catches original notes being represented as news or taking the external source's identity/date.
  it("keeps commentary an authored Article and cites the original source separately", () => {
    expect(articleJsonLd(note, config)).toMatchObject({ "@type": "Article", headline: "工程取捨", url: "https://lab.example.com/notes/engineering%20tradeoffs", datePublished: "2026-10-13T00:00:00.000Z", dateModified: "2026-10-14T00:00:00.000Z", author: { "@type": "Person", name: "JK Space" } });
    expect(articleJsonLd({ ...note, type: "commentary", sourceTitle: "原始規格", sourceUrl: "https://example.com/spec", sourcePublishedAt: "2026-10-12T00:00:00.000Z" }, config)).toMatchObject({ "@type": "Article", headline: "工程取捨", datePublished: "2026-10-13T00:00:00.000Z", citation: { "@type": "CreativeWork", name: "原始規格", url: "https://example.com/spec", datePublished: "2026-10-12T00:00:00.000Z" } });
    expect(articleJsonLd(note, config)).not.toHaveProperty("citation");
  });

  // Catches reflecting arbitrary query values (including prototype property names) as OG category labels.
  it.each([["project", "專案"], ["tool", "工具"], ["note", "筆記與觀點"], [null, "JK Space"], ["news", "JK Space"], ["<script>", "JK Space"], ["constructor", "JK Space"]])("maps OG type %s to a safe label", (type, label) => {
    expect(ogTypeLabel(type)).toBe(label);
  });
});
