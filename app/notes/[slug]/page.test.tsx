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

function fixture(type: "engineering" | "commentary") {
  const root = fixtureDirectory();
  directories.push(root);
  const dir = path.join(root, "content/notes");
  fs.mkdirSync(dir, { recursive: true });
  writeContent(dir, "note.md", {
    ...noteData, type, relatedProjects: ["pcb-test-point-comparison"], relatedTools: ["pcb-test-point"],
    ...(type === "commentary" ? { sourceTitle: "原始工程報導", sourceUrl: "https://example.com/report", sourcePublishedAt: "2026-10-12" } : {}),
  }, type === "commentary" ? "## 事件摘要\n\n原始報導的事實。\n\n## 我的觀點\n\n我的工程判斷。" : "## 工程紀錄\n\n實際驗證過的筆記。");
  vi.spyOn(process, "cwd").mockReturnValue(root);
  return { params: Promise.resolve({ slug: "test-note" }) };
}

describe("Note detail", () => {
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
    const metadata = await generateMetadata(fixture("commentary"));
    expect(metadata).toMatchObject({ title: "測試筆記", description: "筆記摘要", alternates: { canonical: "/notes/test-note" }, openGraph: { type: "article", publishedTime: "2026-10-13T00:00:00.000Z", modifiedTime: "2026-10-14T00:00:00.000Z", authors: ["JK Space"] } });
    expect(metadata.openGraph).not.toHaveProperty("publishers");
  });

  it("generates no placeholder route and rejects a missing note", async () => {
    expect(await generateStaticParams()).toEqual([]);
    await expect(NotePage({ params: Promise.resolve({ slug: "missing" }) })).rejects.toThrow(/404/);
    expect(await generateMetadata({ params: Promise.resolve({ slug: "missing" }) })).toMatchObject({ robots: { index: false, follow: false } });
  });
});
