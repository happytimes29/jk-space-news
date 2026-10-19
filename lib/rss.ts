import type { NoteItem } from "./notes";
import { DEFAULT_LOCALE, localePath, type Locale } from "./i18n/locales";
import type { SiteConfig } from "./site-config";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function buildNotesRss(items: NoteItem[], config: SiteConfig, locale: Locale = DEFAULT_LOCALE): string | null {
  if (locale !== DEFAULT_LOCALE && items.length === 0) return null;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://jk-space.com").replace(/\/+$/, "");
  const rssItems = items.map((note) => {
    const url = escapeXml(`${siteUrl}${localePath(locale, `/notes/${encodeURIComponent(note.slug)}`)}`);
    return `<item>
      <title>${escapeXml(note.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(note.summary)}</description>
      <pubDate>${new Date(note.publishedAt).toUTCString()}</pubDate>
      <category>${escapeXml(note.type)}</category>
    </item>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.name)}</title>
    <link>${escapeXml(`${siteUrl}${localePath(locale, "/notes")}`)}</link>
    <description>${escapeXml(config.description)}</description>
    <language>${locale}</language>
    <atom:link href="${escapeXml(`${siteUrl}${localePath(locale, "/feed.xml")}`)}" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;
}
