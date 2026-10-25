import type { CommentaryNote } from "@/lib/notes";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

export function SourceDisclosure({ note, locale }: { note: CommentaryNote; locale: Locale }) {
  const copy = getDictionary(locale).content;
  return (
    <aside aria-label={copy.sourceAria} className="editorial-source-disclosure">
      <p>{copy.sourceIntro}</p>
      <p>{copy.sourceLabel}：<a href={note.sourceUrl} target="_blank" rel="noopener noreferrer">{note.sourceTitle}</a></p>
      <p>{copy.sourceDateLabel}：<time dateTime={note.sourcePublishedAt}>{note.sourcePublishedAt.slice(0, 10)}</time></p>
    </aside>
  );
}
