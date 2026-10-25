// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectDetailPage } from "./ProjectDetailPage";
import { ToolDetailPage } from "./ToolDetailPage";
import { NoteDetailPage } from "./NoteDetailPage";
import { fixtureDirectory, noteData, projectData, toolData, writeContent, writeTranslation } from "@/lib/content/test-fixtures";
import { generateStaticParams as projectStaticParams } from "@/app/[locale]/projects/[slug]/page";

const { notFound } = vi.hoisted(() => ({ notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }) }));
vi.mock("next/navigation", () => ({ notFound }));

let root: string;
beforeEach(() => {
  root = fixtureDirectory();
  vi.spyOn(process, "cwd").mockReturnValue(root);
  for (const collection of ["projects", "tools", "notes"]) fs.mkdirSync(path.join(root, "content", collection), { recursive: true });
  notFound.mockClear();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  fs.rmSync(root, { recursive: true });
});

async function html(page: React.ReactNode) {
  return new Response(await renderToReadableStream(page)).text();
}

function projectTranslation(slug: string, status: "draft" | "reviewed" | "published", title = "English project") {
  return { ...projectData, slug, title, summary: "English summary", role: "Design and implementation", outcome: "Verified workflow", locale: "en", translationOf: slug, translationStatus: status, translatedAt: "2026-10-19" };
}

describe("localized detail pages", () => {
  it("renders visible English title, body, image alt text, and localized breadcrumb", async () => {
    const projects = path.join(root, "content/projects");
    writeContent(projects, "test-project.md", projectData);
    writeTranslation(projects, "en", "test-project.md", projectTranslation("test-project", "published"), "## Result\n\nEnglish engineering body.\n\n![English interface](/images/example.png)");
    const markup = await html(await ProjectDetailPage({ locale: "en", slug: "test-project", visibility: "production" }));
    expect(markup).toContain('class="editorial-page editorial-detail');
    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toContain("English project");
    expect(markup).toContain("English engineering body.");
    expect(markup).toContain('alt="English interface"');
    expect(markup).toContain('href="/en/projects"');
    expect(markup).not.toContain("測試專案");
    expect(markup).not.toContain("editorial-detail__cover");
  });

  it("renders an editorial tool detail with its real image, app action, and no absent optional links", async () => {
    const tools = path.join(root, "content/tools");
    writeContent(tools, "test-tool.md", toolData);
    writeTranslation(tools, "en", "test-tool.md", {
      ...toolData,
      title: "English tool",
      summary: "English tool summary",
      privacy: "Processed locally.",
      coverImage: "/images/tool-preview.png",
      locale: "en",
      translationOf: "test-tool",
      translationStatus: "published",
      translatedAt: "2026-10-19",
    }, "## Workflow\n\nTool body.");

    const markup = await html(await ToolDetailPage({ locale: "en", slug: "test-tool", visibility: "production" }));
    expect(markup).toContain('class="editorial-page editorial-detail');
    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toContain('href="/en/tools"');
    expect(markup).toContain('href="/tools/test-tool/app"');
    expect(markup).toContain('alt="English tool interface"');
    expect(markup).not.toContain("editorial-detail-links");
  });

  it.each([
    ["absent", null, "preview"],
    ["draft", "draft", "preview"],
    ["reviewed in production", "reviewed", "production"],
  ] as const)("calls notFound for %s translation", async (_case, status, visibility) => {
    const projects = path.join(root, "content/projects");
    writeContent(projects, "test-project.md", projectData);
    if (status) writeTranslation(projects, "en", "test-project.md", projectTranslation("test-project", status));
    await expect(ProjectDetailPage({ locale: "en", slug: "test-project", visibility })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledOnce();
  });

  it("generates localized static params only for content visible in that environment", async () => {
    const projects = path.join(root, "content/projects");
    for (const [slug, status] of [["published", "published"], ["reviewed", "reviewed"], ["draft", "draft"]] as const) {
      writeContent(projects, `${slug}.md`, { ...projectData, slug });
      writeTranslation(projects, "en", `${slug}.md`, projectTranslation(slug, status));
    }
    vi.stubEnv("CONTENT_PREVIEW", "1");
    expect(await projectStaticParams({ params: { locale: "en" } })).toEqual([{ slug: "published" }, { slug: "reviewed" }]);
    vi.stubEnv("CONTENT_PREVIEW", "0");
    expect(await projectStaticParams({ params: { locale: "en" } })).toEqual([{ slug: "published" }]);
  });

  it("marks a related project as the Traditional Chinese original until its English translation exists", async () => {
    const projects = path.join(root, "content/projects");
    writeContent(projects, "source-only.md", { ...projectData, slug: "source-only" });
    const notes = path.join(root, "content/notes");
    writeContent(notes, "linked-note.md", { ...noteData, slug: "linked-note", relatedProjects: ["source-only"] });
    writeTranslation(notes, "en", "linked-note.md", { ...noteData, slug: "linked-note", title: "Linked note", relatedProjects: ["source-only"], locale: "en", translationOf: "linked-note", translationStatus: "published", translatedAt: "2026-10-19" }, "English note body.");

    let markup = await html(await NoteDetailPage({ locale: "en", slug: "linked-note", visibility: "production" }));
    expect(markup).toContain('class="editorial-page editorial-detail');
    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toContain('href="/projects/source-only"');
    expect(markup).toContain("Traditional Chinese original");

    writeTranslation(projects, "en", "source-only.md", projectTranslation("source-only", "published", "Translated project"));
    markup = await html(await NoteDetailPage({ locale: "en", slug: "linked-note", visibility: "production" }));
    expect(markup).toContain('href="/en/projects/source-only"');
    expect(markup).not.toContain("Traditional Chinese original");
  });
});
