import { ContactLinks } from "@/app/contact/ContactLinks";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { getEnabledContactLinks, getSiteConfig } from "@/lib/site-config";
import { EditorialSectionHeading } from "@/components/editorial/EditorialSectionHeading";

export function ContactPage({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const config = getSiteConfig(locale);
  const copy = dictionary.contact;
  return (
    <div className="editorial-page editorial-utility editorial-contact-page">
      <div className="editorial-page__shell">
        <header className="editorial-utility-hero editorial-contact-hero">
          <p className="editorial-page__kicker">{config.name} / Contact</p>
          <h1>{copy.title}</h1>
          <p className="editorial-utility-hero__tagline">{copy.intro}</p>
        </header>
        <section aria-label={copy.topicsTitle}>
          <EditorialSectionHeading index="01" title={copy.topicsTitle} />
          <div className="editorial-contact-grid">
            <ul>{[copy.topicTechnical, copy.topicFeedback, copy.topicCollaboration].map((topic, index) => <li key={topic}><span aria-hidden="true">0{index + 1}</span><p>{topic}</p></li>)}</ul>
            <p className="editorial-contact-privacy">{copy.privacyReminder}</p>
          </div>
        </section>
        <section aria-label={dictionary.footer.contactChannels}><EditorialSectionHeading index="02" title={dictionary.footer.contactChannels} /><ContactLinks links={getEnabledContactLinks(config)} /></section>
      </div>
    </div>
  );
}
