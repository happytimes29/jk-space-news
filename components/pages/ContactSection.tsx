import { ContactLinks } from "@/app/contact/ContactLinks";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { getEnabledContactLinks, getSiteConfig } from "@/lib/site-config";
export function ContactSection({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const config = getSiteConfig(locale);
  const links = getEnabledContactLinks(config);
  const copy = dictionary.contact;
  return (
    <section id="contact" aria-labelledby="about-contact-title" className="signal-contact">
      <h2 id="about-contact-title">{copy.title}</h2>
      <p className="signal-contact__intro">{copy.intro}</p>
      <h3>{copy.topicsTitle}</h3>
      <div className="v2-contact-grid">
        <ul>{[copy.topicTechnical, copy.topicFeedback, copy.topicCollaboration].map((topic, index) => <li key={topic}><span aria-hidden="true">0{index + 1}</span><p>{topic}</p></li>)}</ul>
        <p className="v2-contact-privacy">{copy.privacyReminder}</p>
      </div>
      {links.length > 0 && (
        <section className="signal-contact__links" aria-labelledby="contact-channels-title">
          <h3 id="contact-channels-title">{dictionary.footer.contactChannels}</h3>
          <ContactLinks links={links} />
        </section>
      )}
    </section>
  );
}
