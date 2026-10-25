import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

interface Props {
  locale: Locale;
  role?: string;
  year?: number;
  updatedAt: string;
}

export function ContentMeta({ locale, role, year, updatedAt }: Props) {
  const copy = getDictionary(locale).common;
  return (
    <dl className="editorial-content-meta">
      {role && <div><dt className="font-medium">{copy.role}</dt><dd>{role}</dd></div>}
      {year && <div><dt className="font-medium">{copy.year}</dt><dd>{year}</dd></div>}
      <div><dt className="font-medium">{copy.lastUpdated}</dt><dd><time dateTime={updatedAt}>{updatedAt.slice(0, 10)}</time></dd></div>
    </dl>
  );
}
