import type { NoteItem, NoteType } from "@/lib/notes";

export const noteTypeLabels: Record<NoteType, string> = {
  engineering: "工程筆記", automation: "AI 與自動化", "project-log": "專案紀錄", commentary: "新聞觀點",
};

export function filterNotes(items: NoteItem[], type?: NoteType): NoteItem[] {
  return items.filter((note) => !type || note.type === type)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
