import { NextResponse } from "next/server";
import { getAllNews } from "@/lib/news";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jkspacenews.com";
const SITE_NAME = "JK Space News";
const SITE_DESCRIPTION = "專注於 AI 應用、科技熱點與數位創業的極速情報站。";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const news = await getAllNews();

  const rssItems = news
    .slice(0, 20)
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${SITE_URL}/news/${item.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/news/${item.slug}</guid>
      <description>${escapeXml(item.excerpt)}</description>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <category>${escapeXml(item.category)}</category>
      <author>${escapeXml(item.author)}</author>
      ${item.hot ? "<jk:hot>true</jk:hot>" : ""}
      ${
        item.tldr.length > 0
          ? `<jk:tldr>${escapeXml(item.tldr.join(" | "))}</jk:tldr>`
          : ""
      }
      ${
        item.coverImage && !item.coverImage.startsWith("/images/default")
          ? `<enclosure url="${SITE_URL}${item.coverImage}" type="image/jpeg" length="0" />`
          : ""
      }
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:jk="https://jkspacenews.com/rss/extensions">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-TW</language>
    <managingEditor>news@jkspacenews.com (${SITE_NAME})</managingEditor>
    <webMaster>tech@jkspacenews.com (${SITE_NAME})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>${SITE_URL}/icons/icon.svg</url>
      <title>${escapeXml(SITE_NAME)}</title>
      <link>${SITE_URL}</link>
    </image>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
