import type { Metadata, MetadataRoute } from "next";
import type { ProjectItem } from "./projects";
import type { ToolItem } from "./tools";
import type { NoteItem } from "./notes";
import { getDictionary } from "./i18n/dictionaries";
import { DEFAULT_LOCALE, LOCALES, localeConfig, localePath, type Locale } from "./i18n/locales";
import { siteConfig, type SiteConfig } from "./site-config";

export type MetadataContentType = "website" | "project" | "tool" | "note";
type LocaleItems<T> = Partial<Record<Locale, T[]>>;

function absoluteUrl(baseUrl: string, route: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${route}`;
}

export function buildLanguageAlternates(
  pathname: string,
  availableLocales: readonly Locale[],
  baseUrl = siteConfig.url,
): Record<string, string> {
  const languages = Object.fromEntries(
    availableLocales.map((locale) => [
      localeConfig(locale).hreflang,
      absoluteUrl(baseUrl, localePath(locale, pathname)),
    ]),
  );
  if (availableLocales.includes(DEFAULT_LOCALE)) {
    languages["x-default"] = absoluteUrl(baseUrl, localePath(DEFAULT_LOCALE, pathname));
  }
  return languages;
}

export function buildLocalizedMetadata({
  locale,
  pathname,
  title,
  description,
  availableLocales,
  type = "website",
  imageTitle = title,
  publishedTime,
  modifiedTime,
  authors,
}: {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
  availableLocales: readonly Locale[];
  type?: MetadataContentType;
  imageTitle?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}): Metadata {
  const config = siteConfig;
  const canonical = localePath(locale, pathname);
  const shareTitle = type === "website" ? `${imageTitle} | ${config.name}` : imageTitle;
  const imageQuery = new URLSearchParams({
    ...(type === "website" ? {} : { type }),
    title: shareTitle,
  });
  const openGraphType = type === "project" || type === "note" ? "article" : "website";
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(pathname, availableLocales),
    },
    openGraph: {
      type: openGraphType,
      locale: localeConfig(locale).ogLocale,
      siteName: config.name,
      url: canonical,
      title: shareTitle,
      description,
      ...(openGraphType === "article" ? { publishedTime, modifiedTime, authors } : {}),
      images: [{ url: `/api/og?${imageQuery}`, width: 1200, height: 630, alt: shareTitle }],
    },
  };
}

export function buildSitemapEntries({ baseUrl, projectsByLocale, toolsByLocale, notesByLocale }: {
  baseUrl: string;
  projectsByLocale: LocaleItems<ProjectItem>;
  toolsByLocale: LocaleItems<ToolItem>;
  notesByLocale: LocaleItems<NoteItem>;
}): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const corePaths = ["/", "/projects", "/tools", "/notes", "/about", "/contact", "/privacy"] as const;

  for (const pathname of corePaths) {
    const languages = buildLanguageAlternates(pathname, LOCALES, baseUrl);
    for (const locale of LOCALES) {
      entries.push({ url: absoluteUrl(baseUrl, localePath(locale, pathname)), alternates: { languages } });
    }
  }

  function appendContent<T extends { slug: string; updatedAt: string }>(collection: "projects" | "tools" | "notes", byLocale: LocaleItems<T>) {
    const slugs = new Set(LOCALES.flatMap((locale) => (byLocale[locale] ?? []).map(({ slug }) => slug)));
    for (const slug of slugs) {
      const availableLocales = LOCALES.filter((locale) => (byLocale[locale] ?? []).some((item) => item.slug === slug));
      const pathname = `/${collection}/${encodeURIComponent(slug)}`;
      const languages = buildLanguageAlternates(pathname, availableLocales, baseUrl);
      for (const locale of availableLocales) {
        const item = (byLocale[locale] ?? []).find((candidate) => candidate.slug === slug)!;
        entries.push({
          url: absoluteUrl(baseUrl, localePath(locale, pathname)),
          lastModified: new Date(item.updatedAt),
          alternates: { languages },
        });
      }
    }
  }

  appendContent("projects", projectsByLocale);
  appendContent("tools", toolsByLocale);
  appendContent("notes", notesByLocale);
  return entries;
}

export function personJsonLd(locale: Locale, config: SiteConfig) {
  const about = getDictionary(locale).about;
  return {
    "@context": "https://schema.org", "@type": "Person",
    "@id": absoluteUrl(config.url, "/#person"), name: config.name,
    url: absoluteUrl(config.url, localePath(locale, "/about")),
    inLanguage: localeConfig(locale).htmlLang,
    sameAs: config.contacts.filter((contact) => contact.kind !== "email").map((contact) => contact.href),
    knowsAbout: [about.expertiseHardwareTitle, about.expertiseAutomationTitle, about.expertiseProductTitle],
  };
}

export function websiteJsonLd(locale: Locale, config: SiteConfig) {
  return {
    "@context": "https://schema.org", "@type": "WebSite",
    "@id": absoluteUrl(config.url, "/#website"), name: config.name,
    url: absoluteUrl(config.url, localePath(locale, "/")), description: config.description,
    inLanguage: localeConfig(locale).htmlLang,
    availableLanguage: LOCALES.map((supportedLocale) => localeConfig(supportedLocale).htmlLang),
    publisher: { "@id": absoluteUrl(config.url, "/#person") },
  };
}

export function projectJsonLd(project: ProjectItem, locale: Locale, config: SiteConfig) {
  return {
    "@context": "https://schema.org", "@type": "CreativeWork",
    name: project.title, description: project.summary,
    url: absoluteUrl(config.url, localePath(locale, `/projects/${encodeURIComponent(project.slug)}`)),
    dateModified: project.updatedAt, inLanguage: localeConfig(locale).htmlLang,
    creator: { "@id": absoluteUrl(config.url, "/#person") },
    ...(project.coverImage ? { image: new URL(project.coverImage, `${config.url}/`).href } : {}),
  };
}

export function toolJsonLd(tool: ToolItem, locale: Locale, config: SiteConfig) {
  return {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    name: tool.title, description: tool.summary,
    url: absoluteUrl(config.url, localePath(locale, `/tools/${encodeURIComponent(tool.slug)}`)),
    dateModified: tool.updatedAt, inLanguage: localeConfig(locale).htmlLang,
    applicationCategory: "DeveloperApplication", operatingSystem: "Web browser",
    creator: { "@id": absoluteUrl(config.url, "/#person") },
    ...(tool.appUrl ? {
      installUrl: new URL(
        tool.localizedApp && tool.appUrl.startsWith("/") && !tool.appUrl.startsWith("//")
          ? localePath(locale, tool.appUrl)
          : tool.appUrl,
        `${config.url}/`,
      ).href,
    } : {}),
    ...(tool.coverImage ? { image: new URL(tool.coverImage, `${config.url}/`).href } : {}),
  };
}

export function articleJsonLd(note: NoteItem, locale: Locale, config: SiteConfig) {
  const url = absoluteUrl(config.url, localePath(locale, `/notes/${encodeURIComponent(note.slug)}`));
  return {
    "@context": "https://schema.org", "@type": "Article",
    headline: note.title, description: note.summary, url, mainEntityOfPage: url,
    datePublished: note.publishedAt, dateModified: note.updatedAt, inLanguage: localeConfig(locale).htmlLang,
    author: { "@type": "Person", name: note.author, "@id": absoluteUrl(config.url, "/#person") },
    publisher: { "@id": absoluteUrl(config.url, "/#person") },
    ...(note.coverImage ? { image: new URL(note.coverImage, `${config.url}/`).href } : {}),
    ...(note.type === "commentary" ? { citation: { "@type": "CreativeWork", name: note.sourceTitle, url: note.sourceUrl, datePublished: note.sourcePublishedAt } } : {}),
  };
}

export function breadcrumbJsonLd(
  locale: Locale,
  items: Array<{ name: string; pathname: string }>,
  config: SiteConfig = siteConfig,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(config.url, localePath(locale, item.pathname)),
    })),
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
