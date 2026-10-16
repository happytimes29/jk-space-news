import path from "node:path";
import { ContentFields, estimateReadingTime, loadContentCollection } from "./content/shared";

export type ProjectStatus = "active" | "completed" | "maintained" | "archived";
export type ProjectArea = "hardware" | "automation" | "product";

export interface ProjectItem {
  title: string;
  slug: string;
  summary: string;
  year: number;
  status: ProjectStatus;
  areas: ProjectArea[];
  role: string;
  tags: string[];
  featured: boolean;
  updatedAt: string;
  coverImage?: string;
  gallery?: string[];
  demoUrl?: string;
  repositoryUrl?: string;
  relatedTools?: string[];
  relatedNotes?: string[];
  outcome?: string;
  readingTime: number;
  content: string;
}

export function loadProjects(directory = path.join(process.cwd(), "content/projects")): ProjectItem[] {
  return loadContentCollection(directory, ({ file, data, content }) => {
    const fields = new ContentFields(file, data);
    return {
      title: fields.string("title"), slug: fields.string("slug"), summary: fields.string("summary"),
      year: fields.year("year"), status: fields.enum("status", ["active", "completed", "maintained", "archived"]),
      areas: fields.enums("areas", ["hardware", "automation", "product"]), role: fields.string("role"),
      tags: fields.strings("tags"), featured: fields.boolean("featured"), updatedAt: fields.date("updatedAt"),
      coverImage: fields.optionalUrl("coverImage", true), gallery: fields.optionalStrings("gallery"),
      demoUrl: fields.optionalUrl("demoUrl", true), repositoryUrl: fields.optionalUrl("repositoryUrl"),
      relatedTools: fields.optionalStrings("relatedTools"), relatedNotes: fields.optionalStrings("relatedNotes"),
      outcome: fields.optionalString("outcome"), readingTime: estimateReadingTime(content), content,
    } satisfies ProjectItem;
  }).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function getAllProjects(): Promise<ProjectItem[]> {
  return loadProjects();
}

export async function getFeaturedProjects(limit = 4): Promise<ProjectItem[]> {
  return (await getAllProjects()).filter((project) => project.featured).slice(0, limit);
}

export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
  return (await getAllProjects()).find((project) => project.slug === slug) ?? null;
}
