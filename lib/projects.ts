import path from "node:path";
import { ContentFields, estimateReadingTime, type ContentFile } from "./content/shared";
import {
  loadLocalizedContentCollection,
  type ContentQuery,
  type LocalizedContent,
  type WithoutLocalization,
} from "./content/translations";

export type ProjectStatus = "active" | "completed" | "maintained" | "archived";
export type ProjectArea = "hardware" | "automation" | "product";

export interface ProjectItem extends LocalizedContent {
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

function parseProject({ file, data, content }: ContentFile): WithoutLocalization<ProjectItem> {
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
    };
}

export function loadProjects(
  directory = path.join(process.cwd(), "content/projects"),
  query: ContentQuery = {},
): ProjectItem[] {
  return loadLocalizedContentCollection({ directory, query, parse: parseProject })
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function getAllProjects(query: ContentQuery = {}): Promise<ProjectItem[]> {
  return loadProjects(undefined, query);
}

export async function getFeaturedProjects(limit = 4, query: ContentQuery = {}): Promise<ProjectItem[]> {
  return (await getAllProjects(query)).filter((project) => project.featured).slice(0, limit);
}

export async function getProjectBySlug(slug: string, query: ContentQuery = {}): Promise<ProjectItem | null> {
  return (await getAllProjects(query)).find((project) => project.slug === slug) ?? null;
}
