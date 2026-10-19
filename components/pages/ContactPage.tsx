import { ContactLinks } from "@/app/contact/ContactLinks";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { getEnabledContactLinks, getSiteConfig } from "@/lib/site-config";

export function ContactPage({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const config = getSiteConfig(locale);
  const copy = dictionary.contact;
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-[var(--color-text)] sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="mb-3 font-mono text-xs text-[var(--color-accent)]">{config.name} / Contact</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-5 leading-relaxed text-[var(--color-muted)]">{copy.intro}</p>
      </header>
      <section aria-labelledby="contact-topics" className="mb-10">
        <h2 id="contact-topics" className="text-xl font-semibold">{copy.topicsTitle}</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-[var(--color-muted)]">
          {[copy.topicTechnical, copy.topicFeedback, copy.topicCollaboration].map((topic) => <li key={topic}>{topic}</li>)}
        </ul>
        <p className="mt-5 text-sm leading-relaxed text-[var(--color-muted)]">{copy.privacyReminder}</p>
      </section>
      <ContactLinks links={getEnabledContactLinks(config)} />
    </div>
  );
}
