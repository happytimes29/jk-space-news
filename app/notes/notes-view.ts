import type { NoteItem, NoteType } from "@/lib/notes";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

export function noteTypeLabels(locale: Locale): Record<NoteType, string> {
  const copy = getDictionary(locale).collections;
  return {
    engineering: copy.noteTypeEngineering,
    automation: copy.noteTypeAutomation,
    "project-log": copy.noteTypeProjectLog,
    commentary: copy.noteTypeCommentary,
  };
}

export function filterNotes(items: NoteItem[], type?: NoteType): NoteItem[] {
  return items.filter((note) => !type || note.type === type)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
