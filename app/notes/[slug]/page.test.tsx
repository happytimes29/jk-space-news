import fs from "node:fs";
import path from "node:path";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fixtureDirectory, noteData, writeContent } from "@/lib/content/test-fixtures";
import NotePage, { generateMetadata, generateStaticParams } from "./page";

const directories: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  directories.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true }));
});

function fixture(type: "engineering" | "commentary", content?: string) {
  const root = fixtureDirectory();
  directories.push(root);
  const dir = path.join(root, "content/notes");
  fs.mkdirSync(dir, { recursive: true });
  writeContent(dir, "note.md", {
    ...noteData, type, relatedProjects: ["pcb-test-point-comparison"], relatedTools: ["pcb-test-point"],
    ...(type === "commentary" ? { sourceTitle: "原始工程報導", sourceUrl: "https://example.com/report", sourcePublishedAt: "2026-10-12" } : {}),
  }, content ?? (type === "commentary" ? "## 事件摘要\n\n原始報導的事實。\n\n## 我的觀點\n\n我的工程判斷。" : "## 工程紀錄\n\n實際驗證過的筆記。"));
  vi.spyOn(process, "cwd").mockReturnValue(root);
  return { params: Promise.resolve({ slug: "test-note" }) };
}

describe("Note detail", () => {
  it.each([
    ["blockquote", "> [report]: <https://example.com/first?x=1&y=2>\n>   \"第一份來源\""],
    ["list", "- [report]: <https://example.com/first?x=1&y=2>\n    \"第一份來源\""],
  ])("preserves the first reference definition nested in a %s", async (_container, definition) => {
    const props = fixture("commentary", `## 事件摘要\n\n根據[事件來源][report]整理事實。\n\n${definition}\n\n## 我的觀點\n\n重新閱讀[完整來源][report]後的判斷。\n\n[report]: https://example.com/later \"後來的定義\"`);
    const html = await new Response(await renderToReadableStream(await NotePage(props))).text();
    const document = new DOMParser().parseFromString(html, "text/html");
    const sections = [...document.querySelectorAll("article section")];
    expect(sections.map((section) => section.querySelector("h2")?.textContent)).toEqual(["事件摘要", "我的觀點"]);
    for (const section of sections) {
      expect(section.querySelector("a")?.getAttribute("href")).toBe("https://example.com/first?x=1&y=2");
      expect(section.querySelector("a")?.getAttribute("title")).toBe("第一份來源");
      expect(section.querySelector('a[href="https://example.com/later"]')).toBeNull();
    }
    expect(document.querySelector('aside[aria-label="原始來源"] a')?.textContent).toBe("原始工程報導");
  });

  it("resolves document-wide reference links across both commentary sections", async () => {
    const props = fixture("commentary", "## 事件摘要\n\n依據[原始報導][report]整理事件。\n\n[method]: https://example.com/method \"工程方法\"\n\n## 我的觀點\n\n參照[驗證方法][method]作出判斷。\n\n[report]: https://example.com/report \"完整報導\"\n\n[method]: https://example.com/ignored \"重複定義不覆蓋前文\"");
    const html = await new Response(await renderToReadableStream(await NotePage(props))).text();
    const document = new DOMParser().parseFromString(html, "text/html");
    const sections = [...document.querySelectorAll("article section")];
    expect(sections.map((section) => section.querySelector("h2")?.textContent)).toEqual(["事件摘要", "我的觀點"]);
    expect(sections[0].querySelector('a[href="https://example.com/report"]')?.textContent).toBe("原始報導");
    expect(sections[0].querySelector('a[href="https://example.com/report"]')?.getAttribute("title")).toBe("完整報導");
    expect(sections[1].querySelector('a[href="https://example.com/method"]')?.textContent).toBe("驗證方法");
    expect(sections[1].querySelector('a[href="https://example.com/method"]')?.getAttribute("title")).toBe("工程方法");
    expect(document.querySelector('aside[aria-label="原始來源"] a')?.textContent).toBe("原始工程報導");
  });

  it("renders commentary as explicit fact and opinion sections with the original source", async () => {
    const props = fixture("commentary");
    const html = await new Response(await renderToReadableStream(await NotePage(props))).text();
    const document = new DOMParser().parseFromString(html, "text/html");
    expect(document.querySelector("h1")?.textContent).toBe("測試筆記");
    expect([...document.querySelectorAll("article h2")].map((heading) => heading.textContent)).toContain("事件摘要");
    expect([...document.querySelectorAll("article h2")].map((heading) => heading.textContent)).toContain("我的觀點");
    expect(document.querySelector('section[aria-labelledby="event-summary"]')?.textContent).toContain("原始報導的事實。");
    expect(document.querySelector('section[aria-labelledby="event-summary"]')?.textContent).not.toContain("我的工程判斷。");
    expect(document.querySelector('section[aria-labelledby="my-opinion"]')?.textContent).toContain("我的工程判斷。");
    expect(document.querySelector('a[href="https://example.com/report"]')?.textContent).toBe("原始工程報導");
    expect(document.querySelector('time[datetime="2026-10-12T00:00:00.000Z"]')?.textContent).toBe("2026-10-12");
    expect(document.querySelector('a[href="/notes"]')?.textContent).toBe("返回筆記列表");
    expect(document.querySelector('a[href="/projects/pcb-test-point-comparison"]')).not.toBeNull();
    expect(document.querySelector('a[href="/tools/pcb-test-point"]')).not.toBeNull();
    expect(document.querySelector('a[href^="/news"]')).toBeNull();
  });

  it("renders standard notes without presenting an external reporting source", async () => {
    const props = fixture("engineering");
    const html = await new Response(await renderToReadableStream(await NotePage(props))).text();
    const document = new DOMParser().parseFromString(html, "text/html");
    expect(document.querySelector("h2")?.textContent).toBe("工程紀錄");
    expect(document.querySelector("article")?.textContent).toContain("實際驗證過的筆記。");
    expect(document.querySelector("article")?.textContent).toContain("工程筆記");
    expect(document.querySelector("article")?.textContent).toContain("JK Space");
    expect(document.querySelector("article")?.textContent).toContain("1 分鐘");
    expect(document.querySelector('a[href="https://example.com/report"]')).toBeNull();
  });

  it("describes authored content as an article without claiming a news publisher", async () => {
    const props = fixture("commentary");
    const metadata = await generateMetadata(props);
    expect(metadata).toMatchObject({ title: "測試筆記", description: "筆記摘要", alternates: { canonical: "/notes/test-note" }, openGraph: { type: "article", publishedTime: "2026-10-13T00:00:00.000Z", modifiedTime: "2026-10-14T00:00:00.000Z", authors: ["JK Space"] } });
    expect(metadata.openGraph).not.toHaveProperty("publishers");
    expect(metadata.openGraph).toMatchObject({ url: "/notes/test-note", images: [{ url: "/api/og?type=note&title=%E6%B8%AC%E8%A9%A6%E7%AD%86%E8%A8%98" }] });
    const html = await new Response(await renderToReadableStream(await NotePage(props))).text();
    const document = new DOMParser().parseFromString(html, "text/html");
    expect(JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent ?? "null")).toMatchObject({ "@type": "Article", headline: "測試筆記", url: "https://jk-space.com/notes/test-note", citation: { url: "https://example.com/report" } });
  });

  it("generates no placeholder route and rejects a missing note", async () => {
    const root = fixtureDirectory();
    directories.push(root);
    fs.mkdirSync(path.join(root, "content/notes"), { recursive: true });
    vi.spyOn(process, "cwd").mockReturnValue(root);
    expect(await generateStaticParams()).toEqual([]);
    await expect(NotePage({ params: Promise.resolve({ slug: "missing" }) })).rejects.toThrow(/404/);
    expect(await generateMetadata({ params: Promise.resolve({ slug: "missing" }) })).toMatchObject({ robots: { index: false, follow: false } });
  });
});
