import fs from "node:fs";
import path from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectsPage } from "./ProjectsPage";
import { ToolsPage } from "./ToolsPage";
import { NotesPage } from "./NotesPage";
import { fixtureDirectory, noteData, projectData, toolData, writeContent, writeTranslation } from "@/lib/content/test-fixtures";

let root: string;
beforeEach(() => {
  root = fixtureDirectory();
  vi.spyOn(process, "cwd").mockReturnValue(root);
  for (const collection of ["projects", "tools", "notes"]) fs.mkdirSync(path.join(root, "content", collection), { recursive: true });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  fs.rmSync(root, { recursive: true });
});

function translated(data: Record<string, unknown>, locale: "en" | "zh-CN", status = "published") {
  return { ...data, locale, translationOf: data.slug, translationStatus: status, translatedAt: "2026-10-19" };
}

describe("localized collection pages", () => {
  it("renders English headings, links, filters, and only English visible items", async () => {
    const projects = path.join(root, "content/projects");
    writeContent(projects, "test-project.md", projectData);
    writeTranslation(projects, "en", "test-project.md", translated({ ...projectData, title: "English project", summary: "English summary" }, "en"));
    const tools = path.join(root, "content/tools");
    writeContent(tools, "test-tool.md", toolData);
    writeTranslation(tools, "en", "test-tool.md", translated({ ...toolData, title: "English tool", summary: "English tool summary", privacy: "Processed in your browser." }, "en"));
    const notes = path.join(root, "content/notes");
    writeContent(notes, "test-note.md", noteData);
    writeTranslation(notes, "en", "test-note.md", translated({ ...noteData, title: "English note", summary: "English note summary" }, "en"));

    render(await ProjectsPage({ locale: "en", searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Projects");
    expect(screen.getByRole("link", { name: "English project" })).toHaveAttribute("href", "/en/projects/test-project");
    expect(screen.queryByText("測試專案")).not.toBeInTheDocument();
    expect(screen.getByRole("form")).toHaveAttribute("action", "/en/projects");
    cleanup();

    render(await ToolsPage({ locale: "en" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tools");
    expect(screen.getByRole("link", { name: "English tool" })).toHaveAttribute("href", "/en/tools/test-tool");
    expect(screen.queryByText("測試工具")).not.toBeInTheDocument();
    cleanup();

    render(await NotesPage({ locale: "en", searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Notes & Perspectives");
    expect(screen.getByRole("link", { name: "English note" })).toHaveAttribute("href", "/en/notes/test-note");
    expect(screen.queryByText("測試筆記")).not.toBeInTheDocument();
  });

  it("renders translated empty states without falling back to Traditional Chinese", async () => {
    render(await ProjectsPage({ locale: "zh-CN", searchParams: Promise.resolve({}) }));
    expect(screen.getByText("此语言目前没有可显示的项目。")).toBeVisible();
    expect(screen.queryByText(projectData.title)).not.toBeInTheDocument();
    cleanup();
    render(await ToolsPage({ locale: "zh-CN" }));
    expect(screen.getByText("此语言目前没有可显示的工具。")).toBeVisible();
    cleanup();
    render(await NotesPage({ locale: "zh-CN", searchParams: Promise.resolve({}) }));
    expect(screen.getByText("此语言目前没有可显示的笔记。")).toBeVisible();
  });
});
