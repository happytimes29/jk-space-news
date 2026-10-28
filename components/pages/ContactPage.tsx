import { ContactLinks } from "@/app/contact/ContactLinks";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { getEnabledContactLinks, getSiteConfig } from "@/lib/site-config";
import { EditorialSectionHeading } from "@/components/editorial/EditorialSectionHeading";

export function ContactPage({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const config = getSiteConfig(locale);
  const links = getEnabledContactLinks(config);
  const copy = dictionary.contact;
  return (
    <div className="v2-editorial-page v2-utility v2-contact-page">
      <div className="v2-page-shell">
        <header className="v2-utility-hero v2-contact-hero">
          <p className="v2-page-kicker">{config.name} / Contact</p>
          <h1>{copy.title}</h1>
          <p className="v2-utility-hero__tagline">{copy.intro}</p>
        </header>
        <section aria-label={copy.topicsTitle}>
          <EditorialSectionHeading index="01" title={copy.topicsTitle} />
          <div className="v2-contact-grid">
            <ul>{[copy.topicTechnical, copy.topicFeedback, copy.topicCollaboration].map((topic, index) => <li key={topic}><span aria-hidden="true">0{index + 1}</span><p>{topic}</p></li>)}</ul>
            <p className="v2-contact-privacy">{copy.privacyReminder}</p>
          </div>
        </section>
        {links.length > 0 && <section aria-label={dictionary.footer.contactChannels}><EditorialSectionHeading index="02" title={dictionary.footer.contactChannels} /><ContactLinks links={links} /></section>}
      </div>
    </div>
  );
}
