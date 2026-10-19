import path from "node:path";
import { ContentFields, estimateReadingTime, type ContentFile } from "./content/shared";
import {
  loadLocalizedContentCollection,
  type ContentQuery,
  type LocalizedContent,
  type WithoutLocalization,
} from "./content/translations";

export type ToolStatus = "available" | "experimental" | "maintenance" | "archived";

export interface ToolItem extends LocalizedContent {
  title: string;
  slug: string;
  summary: string;
  status: ToolStatus;
  privacy: string;
  inputTypes: string[];
  outputTypes: string[];
  updatedAt: string;
  appUrl?: string;
  localizedApp: boolean;
  coverImage?: string;
  sampleUrl?: string;
  repositoryUrl?: string;
  relatedProject?: string;
  readingTime: number;
  content: string;
}

function parseTool({ file, data, content }: ContentFile): WithoutLocalization<ToolItem> {
    const fields = new ContentFields(file, data);
    return {
      title: fields.string("title"), slug: fields.string("slug"), summary: fields.string("summary"),
      status: fields.enum("status", ["available", "experimental", "maintenance", "archived"]),
      privacy: fields.string("privacy"), inputTypes: fields.strings("inputTypes", true), outputTypes: fields.strings("outputTypes", true),
      updatedAt: fields.date("updatedAt"), appUrl: fields.optionalUrl("appUrl", true), localizedApp: fields.optionalBoolean("localizedApp") ?? false,
      coverImage: fields.optionalUrl("coverImage", true), sampleUrl: fields.optionalUrl("sampleUrl", true),
      repositoryUrl: fields.optionalUrl("repositoryUrl"), relatedProject: fields.optionalString("relatedProject"),
      readingTime: estimateReadingTime(content), content,
    };
}

export function loadTools(
  directory = path.join(process.cwd(), "content/tools"),
  query: ContentQuery = {},
): ToolItem[] {
  return loadLocalizedContentCollection({ directory, query, parse: parseTool })
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function getAllTools(query: ContentQuery = {}): Promise<ToolItem[]> {
  return loadTools(undefined, query);
}

export async function getFeaturedTool(query: ContentQuery = {}): Promise<ToolItem | null> {
  return (await getAllTools(query)).find((tool) => tool.status === "available") ?? null;
}

export async function getToolBySlug(slug: string, query: ContentQuery = {}): Promise<ToolItem | null> {
  return (await getAllTools(query)).find((tool) => tool.slug === slug) ?? null;
}
