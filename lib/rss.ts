import type { NoteItem } from "./notes";
import type { SiteConfig } from "./site-config";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function buildNotesRss(items: NoteItem[], config: SiteConfig): string {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://jk-space.com").replace(/\/+$/, "");
  const rssItems = items.map((note) => {
    const url = escapeXml(`${siteUrl}/notes/${encodeURIComponent(note.slug)}`);
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
    <link>${escapeXml(`${siteUrl}/notes`)}</link>
    <description>${escapeXml(config.description)}</description>
    <language>zh-TW</language>
    <atom:link href="${escapeXml(`${siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;
}
