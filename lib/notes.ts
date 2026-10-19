import path from "node:path";
import { ContentFields, estimateReadingTime, type ContentFile } from "./content/shared";
import {
  loadLocalizedContentCollection,
  type ContentQuery,
  type LocalizedContent,
  type WithoutLocalization,
} from "./content/translations";
import { parseCommentaryContent } from "./notes-content";

export type NoteType = "engineering" | "automation" | "project-log" | "commentary";

export interface BaseNote extends LocalizedContent {
  title: string;
  slug: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  author: string;
  featured: boolean;
  coverImage?: string;
  relatedProjects?: string[];
  relatedTools?: string[];
  readingTime: number;
  content: string;
}

export interface StandardNote extends BaseNote {
  type: Exclude<NoteType, "commentary">;
}

export interface CommentaryNote extends BaseNote {
  type: "commentary";
  sourceTitle: string;
  sourceUrl: string;
  sourcePublishedAt: string;
}

export type NoteItem = StandardNote | CommentaryNote;

function parseNote({ file, data, content }: ContentFile): WithoutLocalization<NoteItem> {
    const fields = new ContentFields(file, data);
    const type = fields.enum("type", ["engineering", "automation", "project-log", "commentary"]);
    const base: WithoutLocalization<BaseNote> = {
      title: fields.string("title"), slug: fields.string("slug"), summary: fields.string("summary"),
      publishedAt: fields.date("publishedAt"), updatedAt: fields.date("updatedAt"), tags: fields.strings("tags"),
      author: fields.string("author"), featured: fields.boolean("featured"), coverImage: fields.optionalUrl("coverImage", true),
      relatedProjects: fields.optionalStrings("relatedProjects"), relatedTools: fields.optionalStrings("relatedTools"),
      readingTime: estimateReadingTime(content), content,
    };
    if (type === "commentary") {
      const note: WithoutLocalization<CommentaryNote> = {
        ...base, type, sourceTitle: fields.string("sourceTitle"), sourceUrl: fields.url("sourceUrl"),
        sourcePublishedAt: fields.date("sourcePublishedAt"),
      };
      parseCommentaryContent(content, file);
      return note;
    }
    return { ...base, type };
}

export function loadNotes(
  directory = path.join(process.cwd(), "content/notes"),
  query: ContentQuery = {},
): NoteItem[] {
  return loadLocalizedContentCollection({ directory, query, parse: parseNote, allowMissingBase: true })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export async function getAllNotes(query: ContentQuery = {}): Promise<NoteItem[]> {
  return loadNotes(undefined, query);
}

export async function getRecentNotes(limit = 3, query: ContentQuery = {}): Promise<NoteItem[]> {
  return (await getAllNotes(query)).slice(0, limit);
}

export async function getNoteBySlug(slug: string, query: ContentQuery = {}): Promise<NoteItem | null> {
  return (await getAllNotes(query)).find((note) => note.slug === slug) ?? null;
}
