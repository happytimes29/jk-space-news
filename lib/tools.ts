import path from "node:path";
import { ContentFields, estimateReadingTime, loadContentCollection } from "./content/shared";

export type ToolStatus = "available" | "experimental" | "maintenance" | "archived";

export interface ToolItem {
  title: string;
  slug: string;
  summary: string;
  status: ToolStatus;
  privacy: string;
  inputTypes: string[];
  outputTypes: string[];
  updatedAt: string;
  appUrl?: string;
  coverImage?: string;
  sampleUrl?: string;
  repositoryUrl?: string;
  relatedProject?: string;
  readingTime: number;
  content: string;
}

export function loadTools(directory = path.join(process.cwd(), "content/tools")): ToolItem[] {
  return loadContentCollection(directory, ({ file, data, content }) => {
    const fields = new ContentFields(file, data);
    return {
      title: fields.string("title"), slug: fields.string("slug"), summary: fields.string("summary"),
      status: fields.enum("status", ["available", "experimental", "maintenance", "archived"]),
      privacy: fields.string("privacy"), inputTypes: fields.strings("inputTypes", true), outputTypes: fields.strings("outputTypes", true),
      updatedAt: fields.date("updatedAt"), appUrl: fields.optionalUrl("appUrl", true),
      coverImage: fields.optionalUrl("coverImage", true), sampleUrl: fields.optionalUrl("sampleUrl", true),
      repositoryUrl: fields.optionalUrl("repositoryUrl"), relatedProject: fields.optionalString("relatedProject"),
      readingTime: estimateReadingTime(content), content,
    } satisfies ToolItem;
  }).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function getAllTools(): Promise<ToolItem[]> {
  return loadTools();
}

export async function getFeaturedTool(): Promise<ToolItem | null> {
  return (await getAllTools()).find((tool) => tool.status === "available") ?? null;
}

export async function getToolBySlug(slug: string): Promise<ToolItem | null> {
  return (await getAllTools()).find((tool) => tool.slug === slug) ?? null;
}
