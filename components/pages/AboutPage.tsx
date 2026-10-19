import Link from "next/link";
import { ContactLinks } from "@/app/contact/ContactLinks";
import { contentVisibility, getTranslationAvailability } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { DEFAULT_LOCALE, localePath, type Locale } from "@/lib/i18n/locales";
import { getEnabledContactLinks, getSiteConfig } from "@/lib/site-config";

const linkClass = "text-[var(--color-accent)] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

export function AboutPage({ locale, featuredProjectAvailable }: { locale: Locale; featuredProjectAvailable?: boolean }) {
  const dictionary = getDictionary(locale);
  const config = getSiteConfig(locale);
  const copy = dictionary.about;
  const featuredProjectPath = "/projects/pcb-test-point-comparison";
  const hasFeaturedProjectTranslation = featuredProjectAvailable ?? getTranslationAvailability(
    "projects",
    "pcb-test-point-comparison",
    contentVisibility(),
  ).includes(locale);
  const featuredProjectLocale = hasFeaturedProjectTranslation ? locale : DEFAULT_LOCALE;
  const featuredProjectLabel = hasFeaturedProjectTranslation
    ? copy.introToolLink
    : `${copy.introToolLink} (${dictionary.content.traditionalOriginal})`;
  const expertise = [
    [copy.expertiseHardwareTitle, copy.expertiseHardwareText],
    [copy.expertiseAutomationTitle, copy.expertiseAutomationText],
    [copy.expertiseProductTitle, copy.expertiseProductText],
  ];
  const timeline = [
    [copy.timelineHardwareTitle, copy.timelineHardwareText],
    [copy.timelineAutomationTitle, copy.timelineAutomationText],
    [copy.timelineCurrentTitle, copy.timelineCurrentText],
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-[var(--color-text)] sm:px-6 lg:px-8">
      <header className="mb-12 border-b border-[var(--color-border)] pb-10">
        <p className="mb-3 font-mono text-xs text-[var(--color-accent)]">{config.name} / {copy.kicker}</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-5 max-w-2xl text-balance text-lg leading-relaxed">{config.tagline}</p>
      </header>
      <div className="space-y-12">
        <section aria-labelledby="about-intro">
          <h2 id="about-intro" className="text-xl font-semibold">{copy.introTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{copy.introOne}</p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            {copy.introTwoBefore} <Link href={localePath(featuredProjectLocale, featuredProjectPath)} className={linkClass}>{featuredProjectLabel}</Link> {copy.introTwoAfter}
          </p>
        </section>
        <section aria-labelledby="about-expertise">
          <h2 id="about-expertise" className="text-xl font-semibold">{copy.expertiseTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {expertise.map(([title, text]) => <article key={title} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5"><h3 className="font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{text}</p></article>)}
          </div>
        </section>
        <section aria-labelledby="about-method">
          <h2 id="about-method" className="text-xl font-semibold">{copy.methodTitle}</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-[var(--color-muted)]">
            {[copy.methodOne, copy.methodTwo, copy.methodThree].map((method) => <li key={method}>{method}</li>)}
          </ol>
        </section>
        <section aria-labelledby="about-timeline">
          <h2 id="about-timeline" className="text-xl font-semibold">{copy.timelineTitle}</h2>
          <ol className="mt-5 space-y-6 border-l border-[var(--color-border)] pl-5">
            {timeline.map(([title, text]) => <li key={title}><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">{text}</p></li>)}
          </ol>
        </section>
        <section aria-labelledby="about-focus">
          <h2 id="about-focus" className="text-xl font-semibold">{copy.focusTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{copy.focusText}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm">
            <Link href={localePath(locale, "/projects")} className={linkClass}>{dictionary.common.viewProjects}</Link>
            <Link href={localePath(locale, "/tools")} className={linkClass}>{dictionary.common.useTools}</Link>
            <Link href={localePath(locale, "/contact")} className={linkClass}>{dictionary.common.contactMe}</Link>
          </div>
        </section>
        {config.contacts.length > 0 && <section aria-labelledby="about-links"><h2 id="about-links" className="mb-5 text-xl font-semibold">{copy.externalLinksTitle}</h2><ContactLinks links={getEnabledContactLinks(config)} /></section>}
      </div>
    </div>
  );
}
