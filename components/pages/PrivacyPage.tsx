import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { getSiteConfig } from "@/lib/site-config";

export function PrivacyPage({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const config = getSiteConfig(locale);
  const copy = dictionary.privacy;
  return (
    <div className="editorial-page editorial-utility editorial-privacy">
      <div className="editorial-page__shell editorial-reading-shell">
        <header className="editorial-utility-hero">
          <p className="editorial-page__kicker">{config.name} / Privacy</p>
          <h1>{copy.title}</h1>
          <p className="editorial-privacy-date">{copy.updatedLabel}：<time dateTime={copy.updatedDate}>{copy.updatedDate}</time></p>
        </header>
        <div className="editorial-legal">
          <p className="editorial-legal__intro">{copy.intro.replace("JK Space", config.name)}</p>
          <section aria-labelledby="privacy-site"><span aria-hidden="true">01</span><div><h2 id="privacy-site">{copy.siteTitle}</h2><p>{copy.siteTextOne}</p><p>{copy.siteTextTwo}</p></div></section>
          <section aria-labelledby="privacy-hosting"><span aria-hidden="true">02</span><div><h2 id="privacy-hosting">{copy.hostingTitle}</h2><p>{copy.hostingTextOne}</p><p>{copy.hostingTextTwo}</p><p>{copy.preferenceText}</p></div></section>
          <section aria-labelledby="privacy-pcb"><span aria-hidden="true">03</span><div><h2 id="privacy-pcb">{copy.pcbTitle}</h2><p>{copy.pcbTextOne}</p><p>{copy.pcbTextTwo}</p></div></section>
          <section aria-labelledby="privacy-updates"><span aria-hidden="true">04</span><div><h2 id="privacy-updates">{copy.updatesTitle}</h2><p>{copy.updatesBeforeLink} <Link href={localePath(locale, "/contact")}>{copy.updatesLink}</Link> {copy.updatesAfterLink}</p></div></section>
        </div>
      </div>
    </div>
  );
}
