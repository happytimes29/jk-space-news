import type { MetadataRoute } from "next";
import type { ProjectItem } from "./projects";
import type { ToolItem } from "./tools";
import type { NoteItem } from "./notes";
import type { SiteConfig } from "./site-config";

function absoluteUrl(baseUrl: string, route: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${route}`;
}

export function buildSitemapEntries({ baseUrl, projects, tools, notes }: {
  baseUrl: string;
  projects: ProjectItem[];
  tools: ToolItem[];
  notes: NoteItem[];
}): MetadataRoute.Sitemap {
  const staticEntries = ["/", "/projects", "/tools", "/notes", "/about", "/contact", "/privacy"].map((route) => ({ url: absoluteUrl(baseUrl, route) }));
  const contentEntries = [
    ...projects.map((item) => ({ route: `/projects/${encodeURIComponent(item.slug)}`, updatedAt: item.updatedAt })),
    ...tools.map((item) => ({ route: `/tools/${encodeURIComponent(item.slug)}`, updatedAt: item.updatedAt })),
    ...notes.map((item) => ({ route: `/notes/${encodeURIComponent(item.slug)}`, updatedAt: item.updatedAt })),
  ].map(({ route, updatedAt }) => ({ url: absoluteUrl(baseUrl, route), lastModified: new Date(updatedAt) }));
  return [...staticEntries, ...contentEntries];
}

export function personJsonLd(config: SiteConfig) {
  return {
    "@context": "https://schema.org", "@type": "Person",
    "@id": absoluteUrl(config.url, "/#person"), name: config.name,
    url: absoluteUrl(config.url, "/about"),
    sameAs: config.contacts.filter((contact) => contact.kind !== "email").map((contact) => contact.href),
  };
}

export function websiteJsonLd(config: SiteConfig) {
  return {
    "@context": "https://schema.org", "@type": "WebSite",
    "@id": absoluteUrl(config.url, "/#website"), name: config.name,
    url: absoluteUrl(config.url, "/"), description: config.description,
    inLanguage: "zh-Hant-TW", publisher: { "@id": absoluteUrl(config.url, "/#person") },
  };
}

export function projectJsonLd(project: ProjectItem, config: SiteConfig) {
  return {
    "@context": "https://schema.org", "@type": "CreativeWork",
    name: project.title, description: project.summary,
    url: absoluteUrl(config.url, `/projects/${encodeURIComponent(project.slug)}`),
    dateModified: project.updatedAt, inLanguage: "zh-Hant-TW",
    creator: { "@id": absoluteUrl(config.url, "/#person") },
    ...(project.coverImage ? { image: new URL(project.coverImage, `${config.url}/`).href } : {}),
  };
}

export function toolJsonLd(tool: ToolItem, config: SiteConfig) {
  return {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    name: tool.title, description: tool.summary,
    url: absoluteUrl(config.url, `/tools/${encodeURIComponent(tool.slug)}`),
    dateModified: tool.updatedAt, applicationCategory: "DeveloperApplication", operatingSystem: "Web browser",
    creator: { "@id": absoluteUrl(config.url, "/#person") },
    ...(tool.appUrl ? { installUrl: new URL(tool.appUrl, `${config.url}/`).href } : {}),
    ...(tool.coverImage ? { image: new URL(tool.coverImage, `${config.url}/`).href } : {}),
  };
}

export function articleJsonLd(note: NoteItem, config: SiteConfig) {
  const url = absoluteUrl(config.url, `/notes/${encodeURIComponent(note.slug)}`);
  return {
    "@context": "https://schema.org", "@type": "Article",
    headline: note.title, description: note.summary, url, mainEntityOfPage: url,
    datePublished: note.publishedAt, dateModified: note.updatedAt, inLanguage: "zh-Hant-TW",
    author: { "@type": "Person", name: note.author },
    publisher: { "@id": absoluteUrl(config.url, "/#person") },
    ...(note.coverImage ? { image: new URL(note.coverImage, `${config.url}/`).href } : {}),
    ...(note.type === "commentary" ? { citation: { "@type": "CreativeWork", name: note.sourceTitle, url: note.sourceUrl, datePublished: note.sourcePublishedAt } } : {}),
  };
}

export function ogTypeLabel(type: string | null): string {
  switch (type) {
    case "project": return "專案";
    case "tool": return "工具";
    case "note": return "筆記與觀點";
    default: return "JK Space";
  }
}
