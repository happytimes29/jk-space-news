import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { getSiteConfig } from "@/lib/site-config";

export function PrivacyPage({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const config = getSiteConfig(locale);
  const copy = dictionary.privacy;
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-[var(--color-text)] sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{copy.title}</h1>
      <p className="mt-4 text-xs text-[var(--color-muted)]">{copy.updatedLabel}：<time dateTime={copy.updatedDate}>{copy.updatedDate}</time></p>
      <div className="mt-10 space-y-8 text-sm leading-7 text-[var(--color-muted)]">
        <p>{copy.intro.replace("JK Space", config.name)}</p>
        <section aria-labelledby="privacy-site"><h2 id="privacy-site" className="mb-3 text-xl font-semibold text-[var(--color-text)]">{copy.siteTitle}</h2><p>{copy.siteTextOne}</p><p className="mt-3">{copy.siteTextTwo}</p></section>
        <section aria-labelledby="privacy-hosting"><h2 id="privacy-hosting" className="mb-3 text-xl font-semibold text-[var(--color-text)]">{copy.hostingTitle}</h2><p>{copy.hostingTextOne}</p><p className="mt-3">{copy.hostingTextTwo}</p><p className="mt-3">{copy.preferenceText}</p></section>
        <section aria-labelledby="privacy-pcb"><h2 id="privacy-pcb" className="mb-3 text-xl font-semibold text-[var(--color-text)]">{copy.pcbTitle}</h2><p>{copy.pcbTextOne}</p><p className="mt-3">{copy.pcbTextTwo}</p></section>
        <section aria-labelledby="privacy-updates"><h2 id="privacy-updates" className="mb-3 text-xl font-semibold text-[var(--color-text)]">{copy.updatesTitle}</h2><p>{copy.updatesBeforeLink} <Link href={localePath(locale, "/contact")} className="text-[var(--color-accent)] underline underline-offset-4">{copy.updatesLink}</Link> {copy.updatesAfterLink}</p></section>
      </div>
    </div>
  );
}
