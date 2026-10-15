import type { ProjectItem } from "./projects";
import type { ToolItem } from "./tools";
import type { NoteItem } from "./notes";

export interface SearchItem {
  title: string;
  href: string;
  type: "project" | "tool" | "note";
  label: string;
}

export function buildSearchItems(projects: ProjectItem[], tools: ToolItem[], notes: NoteItem[]): SearchItem[] {
  return [
    ...projects.map((project): SearchItem => ({
      title: project.title, href: `/projects/${project.slug}`, type: "project", label: project.tags.join(" · "),
    })),
    ...tools.map((tool): SearchItem => ({
      title: tool.title, href: `/tools/${tool.slug}`, type: "tool", label: tool.inputTypes.join(" · "),
    })),
    ...notes.map((note): SearchItem => ({
      title: note.title, href: `/notes/${note.slug}`, type: "note", label: note.tags.join(" · "),
    })),
  ];
}

export function filterSearchItems(items: SearchItem[], query: string, limit?: number): SearchItem[] {
  const normalized = query.trim().toLowerCase();
  const matches = normalized
    ? items.filter((item) => [item.title, item.label, item.type].some((value) => value.toLowerCase().includes(normalized)))
    : items;
  return matches.slice(0, normalized ? (limit ?? 10) : Math.min(limit ?? 7, 7));
}
