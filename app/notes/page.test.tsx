import fs from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fixtureDirectory, noteData, writeContent } from "@/lib/content/test-fixtures";
import NotesPage from "./page";

const directories: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  directories.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true }));
});

describe("NotesPage", () => {
  it("shows the honest empty collection without placeholder or legacy article links", async () => {
    render(await NotesPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("筆記與觀點");
    expect(screen.getByText("筆記正在整理中")).toBeVisible();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link").some((link) => link.getAttribute("href")?.startsWith("/news"))).toBe(false);
    for (const label of ["工程筆記", "AI 與自動化", "專案紀錄", "新聞觀點"]) {
      expect(screen.getByRole("link", { name: label })).toBeVisible();
    }
  });

  it("uses the query category and presents publication context for real loaded fixtures", async () => {
    const root = fixtureDirectory();
    directories.push(root);
    const dir = path.join(root, "content/notes");
    fs.mkdirSync(dir, { recursive: true });
    writeContent(dir, "engineering.md", noteData);
    writeContent(dir, "automation.md", { ...noteData, title: "工作流程筆記", slug: "workflow", type: "automation", tags: ["AI"] });
    vi.spyOn(process, "cwd").mockReturnValue(root);
    render(await NotesPage({ searchParams: Promise.resolve({ type: "automation" }) }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    const article = screen.getByRole("article", { name: "工作流程筆記" });
    expect(within(article).getByRole("link", { name: "工作流程筆記" })).toHaveAttribute("href", "/notes/workflow");
    expect(article).toHaveTextContent("2026-10-13");
    expect(article).toHaveTextContent("AI 與自動化");
    expect(article).toHaveTextContent("1 分鐘");
    expect(article).toHaveTextContent("AI");
    expect(screen.getByRole("link", { name: "AI 與自動化" })).toHaveAttribute("aria-current", "page");
  });

  it("treats unsupported query categories as the full original collection", async () => {
    render(await NotesPage({ searchParams: Promise.resolve({ type: "news" }) }));
    expect(screen.getByRole("link", { name: "全部" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("筆記正在整理中")).toBeVisible();
  });
});
