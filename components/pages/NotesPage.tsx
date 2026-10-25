import Link from "next/link";
import { getAllNotes, type NoteType } from "@/lib/notes";
import { contentVisibility } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
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
    <div className="editorial-page editorial-collection">
      <div className="editorial-page__shell">
        <header className="editorial-page__intro">
          <div><p className="editorial-page__kicker">03 / {dictionary.navigation.notes}</p><h1>{copy.notesTitle}</h1></div>
          <p className="editorial-page__lede">{copy.notesDescription}</p>
        </header>
        <NoteFilter type={type} locale={locale} labels={labels} />
        {notes.length ? <div className="editorial-notes-index">{notes.map((note, index) => (
          <article key={note.slug} aria-label={note.title} className="editorial-note-row">
            <span className="editorial-note-row__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <p className="editorial-note-row__meta"><span>{labels[note.type]}</span><time dateTime={note.publishedAt}>{note.publishedAt.slice(0, 10)}</time><span>{note.readingTime} {dictionary.common.minutes}</span></p>
            <h2><Link href={localePath(locale, `/notes/${encodeURIComponent(note.slug)}`)}>{note.title}</Link></h2>
            <p className="editorial-note-row__summary">{note.summary}</p>
            {note.tags.length > 0 && <ul aria-label={copy.noteTagLabel} className="editorial-tag-list">{note.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
          </article>
        ))}</div> : <div className="editorial-empty"><p>{allNotes.length === 0 ? copy.notesEmpty : copy.notesNoMatch}</p>{allNotes.length > 0 && <Link href={localePath(locale, "/notes")}>{copy.notesViewAll}</Link>}</div>}
      </div>
    </div>
  );
}
