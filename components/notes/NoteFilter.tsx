import Link from "next/link";
import type { NoteType } from "@/lib/notes";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";

export function NoteFilter({ type, locale, labels }: { type?: NoteType; locale: Locale; labels: Record<NoteType, string> }) {
  const copy = getDictionary(locale).collections;
  return (
    <nav aria-label={copy.noteFilterLabel} className="mb-8 flex flex-wrap gap-2">
      {[{ value: undefined, label: copy.allLabel }, ...Object.entries(labels).map(([value, label]) => ({ value, label }))].map(({ value, label }) => (
        <Link key={value ?? "all"} href={localePath(locale, value ? `/notes?type=${value}` : "/notes")} aria-current={type === value ? "page" : undefined}
          className={`rounded-lg border px-4 py-2 text-sm ${type === value ? "border-blue-700 bg-blue-700 text-white" : "border-[#d4d4d8] hover:border-blue-600 dark:border-[#55555b]"}`}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
