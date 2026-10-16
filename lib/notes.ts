import path from "node:path";
import { ContentFields, estimateReadingTime, loadContentCollection } from "./content/shared";
import { parseCommentaryContent } from "./notes-content";

export type NoteType = "engineering" | "automation" | "project-log" | "commentary";

export interface BaseNote {
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

export function loadNotes(directory = path.join(process.cwd(), "content/notes")): NoteItem[] {
  return loadContentCollection(directory, ({ file, data, content }): NoteItem => {
    const fields = new ContentFields(file, data);
    const type = fields.enum("type", ["engineering", "automation", "project-log", "commentary"]);
    const base: BaseNote = {
      title: fields.string("title"), slug: fields.string("slug"), summary: fields.string("summary"),
      publishedAt: fields.date("publishedAt"), updatedAt: fields.date("updatedAt"), tags: fields.strings("tags"),
      author: fields.string("author"), featured: fields.boolean("featured"), coverImage: fields.optionalUrl("coverImage", true),
      relatedProjects: fields.optionalStrings("relatedProjects"), relatedTools: fields.optionalStrings("relatedTools"),
      readingTime: estimateReadingTime(content), content,
    };
    if (type === "commentary") {
      const note: CommentaryNote = {
        ...base, type, sourceTitle: fields.string("sourceTitle"), sourceUrl: fields.url("sourceUrl"),
        sourcePublishedAt: fields.date("sourcePublishedAt"),
      };
      parseCommentaryContent(content, file);
      return note;
    }
    return { ...base, type };
  }, { allowMissingDirectory: true }).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export async function getAllNotes(): Promise<NoteItem[]> {
  return loadNotes();
}

export async function getRecentNotes(limit = 3): Promise<NoteItem[]> {
  return (await getAllNotes()).slice(0, limit);
}

export async function getNoteBySlug(slug: string): Promise<NoteItem | null> {
  return (await getAllNotes()).find((note) => note.slug === slug) ?? null;
}
