import Link from "next/link";
import { getAllNotes, type NoteType } from "@/lib/notes";
import { contentVisibility } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { ContentCard } from "@/components/content/ContentCard";
import { NoteFilter } from "@/components/notes/NoteFilter";
import { filterNotes, noteTypeLabels } from "@/app/notes/notes-view";

interface Props { locale: Locale; searchParams: Promise<{ type?: string | string[] }> }

export async function NotesPage({ locale, searchParams }: Props) {
  const dictionary = getDictionary(locale);
  const copy = dictionary.collections;
  const labels = noteTypeLabels(locale);
  const query = (await searchParams).type;
  const type = typeof query === "string" && Object.hasOwn(labels, query) ? query as NoteType : undefined;
  const allNotes = await getAllNotes({ locale, visibility: contentVisibility() });
  const notes = filterNotes(allNotes, type);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-4"><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{copy.notesTitle}</h1><p className="max-w-2xl leading-7 text-[#55555b] dark:text-[#a1a1aa]">{copy.notesDescription}</p></header>
      <NoteFilter type={type} locale={locale} labels={labels} />
      {notes.length ? <div className="grid gap-6 md:grid-cols-2">{notes.map((note) => (
        <ContentCard key={note.slug} href={localePath(locale, `/notes/${encodeURIComponent(note.slug)}`)} title={note.title} summary={note.summary}>
          <p className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#55555b] dark:text-[#a1a1aa]"><span>{labels[note.type]}</span><time dateTime={note.publishedAt}>{note.publishedAt.slice(0, 10)}</time><span>{note.readingTime} {dictionary.common.minutes}</span></p>
          {note.tags.length > 0 && <ul aria-label={copy.noteTagLabel} className="flex flex-wrap gap-2 text-xs text-[#55555b] dark:text-[#a1a1aa]">{note.tags.map((tag) => <li key={tag} className="rounded border border-[#d4d4d8] px-2 py-1 dark:border-[#303036]">{tag}</li>)}</ul>}
        </ContentCard>
      ))}</div> : <div className="space-y-4 rounded-xl border border-[#d4d4d8] p-6 dark:border-[#303036]"><p>{allNotes.length === 0 ? copy.notesEmpty : copy.notesNoMatch}</p>{allNotes.length > 0 && <Link href={localePath(locale, "/notes")} className="text-blue-700 underline underline-offset-4 dark:text-blue-300">{copy.notesViewAll}</Link>}</div>}
    </div>
  );
}
