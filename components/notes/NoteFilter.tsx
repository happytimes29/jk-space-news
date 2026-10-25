import Link from "next/link";
import type { NoteType } from "@/lib/notes";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";

export function NoteFilter({ type, locale, labels }: { type?: NoteType; locale: Locale; labels: Record<NoteType, string> }) {
  const copy = getDictionary(locale).collections;
  return (
    <nav aria-label={copy.noteFilterLabel} className="editorial-note-filter">
      {[{ value: undefined, label: copy.allLabel }, ...Object.entries(labels).map(([value, label]) => ({ value, label }))].map(({ value, label }) => (
        <Link key={value ?? "all"} href={localePath(locale, value ? `/notes?type=${value}` : "/notes")} aria-current={type === value ? "page" : undefined}
          className={type === value ? "editorial-note-filter__link is-active" : "editorial-note-filter__link"}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
