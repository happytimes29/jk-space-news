import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";

export function NotFoundPage({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const copy = dictionary.notFound;
  const links = [
    [copy.home, "/"],
    [dictionary.navigation.projects, "/projects"],
    [dictionary.navigation.tools, "/tools"],
    [dictionary.navigation.notes, "/notes"],
  ];
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center text-[var(--color-text)]">
      <p className="mb-6 font-mono text-6xl font-bold text-[var(--color-accent)]" aria-hidden="true">404</p>
      <h1 className="mb-3 text-2xl font-bold">{copy.title}</h1>
      <p className="mb-8 max-w-md text-sm leading-7 text-[var(--color-muted)]">{copy.description}</p>
      <nav aria-label={copy.navigationLabel} className="flex max-w-lg flex-wrap justify-center gap-3">
        {links.map(([label, href]) => <Link key={href} href={localePath(locale, href)} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm font-medium hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">{label}</Link>)}
      </nav>
    </section>
  );
}
