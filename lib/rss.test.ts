import { afterEach, describe, expect, it, vi } from "vitest";
import type { NoteItem } from "./notes";
import { getSiteConfig, siteConfig } from "./site-config";
import { buildNotesRss } from "./rss";

afterEach(() => vi.unstubAllEnvs());
const note: NoteItem = {
  title: `PCB & <工具> "筆記" '測試'`, slug: "pcb-check", summary: "A < B & C > D", type: "engineering", author: "作者", tags: [], featured: false,
  publishedAt: "2026-10-13T00:00:00.000Z", updatedAt: "2026-10-14T00:00:00.000Z", readingTime: 1, content: "正文",
  locale: "zh-TW", translationOf: "pcb-check", translationStatus: "published",
};

function parse(xml: string) {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  expect(document.querySelector("parsererror")).toBeNull();
  return document;
}

describe("buildNotesRss", () => {
  it("publishes a valid empty channel using site identity without fake contact details", () => {
    const xml = buildNotesRss([], siteConfig);
    const document = parse(xml!);
    expect(document.documentElement?.getAttribute("version")).toBe("2.0");
    expect(document.getElementsByTagName("channel")).toHaveLength(1);
    expect(document.getElementsByTagName("title")[0].textContent).toBe("JK Space");
    expect(document.getElementsByTagName("description")[0].textContent).toBe("硬體研發、AI 自動化、工程工具與技術觀點。");
    expect(document.getElementsByTagName("item")).toHaveLength(0);
    expect(xml).not.toMatch(/news@jk-space\.com|tech@jk-space\.com|\/news\//);
  });

  it("keeps the default feed in zh-TW and disables an empty localized feed", () => {
    const xml = buildNotesRss([], siteConfig, "zh-TW");
    expect(xml).not.toBeNull();
    expect(parse(xml!).querySelector("language")?.textContent).toBe("zh-TW");
    expect(buildNotesRss([], getSiteConfig("en"), "en")).toBeNull();
  });

  it("can build a localized feed once that locale has a published note", () => {
    const englishNote: NoteItem = { ...note, locale: "en", title: "PCB note", summary: "Verified result", translationStatus: "published" };
    const xml = buildNotesRss([englishNote], getSiteConfig("en"), "en");
    const document = parse(xml!);
    expect(document.querySelector("language")?.textContent).toBe("en");
    expect(document.querySelector("item > link")?.textContent).toBe("https://jk-space.com/en/notes/pcb-check");
    expect(document.querySelector('atom\\:link, link[rel="self"]')?.getAttribute("href")).toBe("https://jk-space.com/en/feed.xml");
  });

  it("escapes text and URL attributes while emitting only original note item links", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://lab.example.com/r&d/");
    const xml = buildNotesRss([note], { ...siteConfig, name: "JK & Space", description: "工程 < 觀點" });
    const document = parse(xml!);
    const item = document.getElementsByTagName("item")[0];
    expect(item.getElementsByTagName("title")[0].textContent).toBe(`PCB & <工具> "筆記" '測試'`);
    expect(item.getElementsByTagName("description")[0].textContent).toBe("A < B & C > D");
    expect(item.getElementsByTagName("link")[0].textContent).toBe("https://lab.example.com/r&d/notes/pcb-check");
    expect(item.getElementsByTagName("guid")[0].textContent).toBe("https://lab.example.com/r&d/notes/pcb-check");
    expect(document.getElementsByTagNameNS("http://www.w3.org/2005/Atom", "link")[0].getAttribute("href")).toBe("https://lab.example.com/r&d/feed.xml");
    expect(item.getElementsByTagName("pubDate")[0].textContent).toBe("Tue, 13 Oct 2026 00:00:00 GMT");
    expect(document.getElementsByTagName("title")[0].textContent).toBe("JK & Space");
    expect(document.getElementsByTagName("description")[0].textContent).toBe("工程 < 觀點");
    expect(xml).not.toMatch(/\/news\/|<author>|managingEditor|webMaster/);
    expect(xml).toContain("&quot;筆記&quot; &apos;測試&apos;");
  });
});
