import type { CommentaryNote } from "@/lib/notes";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

export function SourceDisclosure({ note, locale }: { note: CommentaryNote; locale: Locale }) {
  const copy = getDictionary(locale).content;
  return (
    <aside aria-label={copy.sourceAria} className="my-8 space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm leading-7 dark:border-blue-900 dark:bg-blue-950">
      <p>{copy.sourceIntro}</p>
      <p>{copy.sourceLabel}：<a href={note.sourceUrl} className="break-words text-blue-700 underline underline-offset-4 dark:text-blue-300" target="_blank" rel="noopener noreferrer">{note.sourceTitle}</a></p>
      <p>{copy.sourceDateLabel}：<time dateTime={note.sourcePublishedAt}>{note.sourcePublishedAt.slice(0, 10)}</time></p>
    </aside>
  );
}
