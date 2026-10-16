import type { ProjectItem } from "./projects";
import type { ToolItem } from "./tools";
import type { NoteItem } from "./notes";

export function selectHomeContent(projects: ProjectItem[], tools: ToolItem[], notes: NoteItem[]) {
  return {
    featuredProjects: projects.filter((project) => project.featured).slice(0, 4),
    featuredTool: tools.find((tool) => tool.status === "available") ?? null,
    recentNotes: [...notes].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 3),
  };
}
