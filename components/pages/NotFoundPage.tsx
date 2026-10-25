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
    <section className="editorial-page editorial-utility editorial-not-found">
      <div className="editorial-page__shell editorial-not-found__grid">
        <p className="editorial-not-found__code" aria-hidden="true">404</p>
        <div><p className="editorial-page__kicker">Signal lost / Page not found</p><h1>{copy.title}</h1><p className="editorial-not-found__description">{copy.description}</p></div>
        <nav aria-label={copy.navigationLabel}>{links.map(([label, href], index) => <Link key={href} href={localePath(locale, href)}><span aria-hidden="true">0{index + 1}</span>{label}</Link>)}</nav>
      </div>
    </section>
  );
}
