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
  it("gives a tool without a cover the explicit full-width layout", async () => {
    writeContent(path.join(root, "content/tools"), "test-tool.md", { ...toolData, coverImage: undefined });
    render(await ToolsPage({ locale: "zh-TW" }));
    const row = screen.getByRole("article", { name: toolData.title });
    expect(row).toHaveClass("editorial-tool-row--no-cover");
    expect(row.querySelector("figure")).toBeNull();
    expect(row.querySelector(".editorial-tool-row__body")).toHaveTextContent(toolData.title);
  });

  it("renders English headings, links, filters, and only English visible items", async () => {
    const projects = path.join(root, "content/projects");
    writeContent(projects, "test-project.md", projectData);
    writeTranslation(projects, "en", "test-project.md", translated({ ...projectData, title: "English project", summary: "English summary" }, "en"));
    const tools = path.join(root, "content/tools");
    writeContent(tools, "test-tool.md", toolData);
    writeTranslation(tools, "en", "test-tool.md", translated({ ...toolData, title: "English tool", summary: "English tool summary", privacy: "Processed in your browser.", coverImage: "/images/tool-preview.png" }, "en"));
    const notes = path.join(root, "content/notes");
    writeContent(notes, "test-note.md", noteData);
    writeTranslation(notes, "en", "test-note.md", translated({ ...noteData, title: "English note", summary: "English note summary" }, "en"));

    let view = render(await ProjectsPage({ locale: "en", searchParams: Promise.resolve({}) }));
    expect(view.container.firstElementChild).toHaveClass("editorial-page", "editorial-collection");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Projects");
    expect(screen.getByRole("link", { name: "English project" })).toHaveAttribute("href", "/en/projects/test-project");
    expect(screen.getByRole("article", { name: "English project" })).toBeInTheDocument();
    expect(screen.queryByText("測試專案")).not.toBeInTheDocument();
    expect(screen.getByRole("form")).toHaveAttribute("action", "/en/projects");
    cleanup();

    view = render(await ToolsPage({ locale: "en" }));
    expect(view.container.firstElementChild).toHaveClass("editorial-page", "editorial-collection");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tools");
    expect(screen.getByRole("link", { name: "English tool" })).toHaveAttribute("href", "/en/tools/test-tool");
    expect(screen.getByRole("article", { name: "English tool" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "English tool interface" })).toHaveAttribute("src");
    expect(screen.getByRole("link", { name: "Open tool" })).toHaveAttribute("href", "/tools/test-tool/app");
    expect(screen.getByRole("link", { name: "Tool overview" })).toHaveAttribute("href", "/en/tools/test-tool");
    expect(screen.queryByText("測試工具")).not.toBeInTheDocument();
    cleanup();

    view = render(await NotesPage({ locale: "en", searchParams: Promise.resolve({}) }));
    expect(view.container.firstElementChild).toHaveClass("editorial-page", "editorial-collection");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Notes & Perspectives");
    expect(screen.getByRole("link", { name: "English note" })).toHaveAttribute("href", "/en/notes/test-note");
    expect(screen.getByRole("article", { name: "English note" })).toBeInTheDocument();
    expect(screen.queryByText("測試筆記")).not.toBeInTheDocument();
  });

  it("keeps localized reset behavior when active filters have no matches", async () => {
    const projects = path.join(root, "content/projects");
    writeContent(projects, "test-project.md", projectData);
    writeTranslation(projects, "en", "test-project.md", translated({ ...projectData, title: "English project", areas: ["hardware"] }, "en"));

    const view = render(await ProjectsPage({ locale: "en", searchParams: Promise.resolve({ area: "automation" }) }));
    expect(view.container.firstElementChild).toHaveClass("editorial-page", "editorial-collection");
    expect(screen.getByText("No projects match these filters.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute("href", "/en/projects");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("renders translated empty states without falling back to Traditional Chinese", async () => {
    let view = render(await ProjectsPage({ locale: "zh-CN", searchParams: Promise.resolve({}) }));
    expect(view.container.firstElementChild).toHaveClass("editorial-page", "editorial-collection");
    expect(screen.getByText("此语言目前没有可显示的项目。")).toBeVisible();
    expect(screen.queryByText(projectData.title)).not.toBeInTheDocument();
    cleanup();
    view = render(await ToolsPage({ locale: "zh-CN" }));
    expect(view.container.firstElementChild).toHaveClass("editorial-page", "editorial-collection");
    expect(screen.getByText("此语言目前没有可显示的工具。")).toBeVisible();
    cleanup();
    view = render(await NotesPage({ locale: "zh-CN", searchParams: Promise.resolve({}) }));
    expect(view.container.firstElementChild).toHaveClass("editorial-page", "editorial-collection");
    expect(screen.getByText("此语言目前没有可显示的笔记。")).toBeVisible();
  });
});
