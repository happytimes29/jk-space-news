import Link from "next/link";
import { ContactLinks } from "@/app/contact/ContactLinks";
import { contentVisibility, getTranslationAvailability } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { DEFAULT_LOCALE, localePath, type Locale } from "@/lib/i18n/locales";
import { getEnabledContactLinks, getSiteConfig } from "@/lib/site-config";
import { EditorialSectionHeading } from "@/components/editorial/EditorialSectionHeading";

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
    <div className="v2-editorial-page v2-utility v2-about">
      <div className="v2-page-shell">
        <header className="v2-utility-hero">
          <p className="v2-page-kicker">{config.name} / {copy.kicker}</p>
          <h1>{copy.title}</h1>
          <p className="v2-utility-hero__tagline">{config.tagline}</p>
        </header>
        <section aria-labelledby="about-intro" className="v2-about-intro">
          <h2 id="about-intro">{copy.introTitle}</h2>
          <div><p>{copy.introOne}</p><p>{copy.introTwoBefore} <Link href={localePath(featuredProjectLocale, featuredProjectPath)} className={linkClass}>{featuredProjectLabel}</Link> {copy.introTwoAfter}</p></div>
        </section>
        <section aria-label={copy.expertiseTitle}>
          <EditorialSectionHeading index="01" title={copy.expertiseTitle} />
          <div className="v2-expertise-grid">{expertise.map(([title, text], index) => <article key={title}><span aria-hidden="true">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>
        <section aria-label={copy.methodTitle}>
          <EditorialSectionHeading index="02" title={copy.methodTitle} />
          <ol className="v2-method-list">{[copy.methodOne, copy.methodTwo, copy.methodThree].map((method, index) => <li key={method}><span aria-hidden="true">0{index + 1}</span><p>{method}</p></li>)}</ol>
        </section>
        <section aria-label={copy.timelineTitle}>
          <EditorialSectionHeading index="03" title={copy.timelineTitle} />
          <ol className="v2-timeline">{timeline.map(([title, text], index) => <li key={title}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
        </section>
        <section aria-label={copy.focusTitle}>
          <EditorialSectionHeading index="04" title={copy.focusTitle} />
          <div className="v2-focus-copy"><p>{copy.focusText}</p><div className="v2-inline-actions"><Link href={localePath(locale, "/projects")}>{dictionary.common.viewProjects}</Link><Link href={localePath(locale, "/tools")}>{dictionary.common.useTools}</Link><Link href={localePath(locale, "/contact")}>{dictionary.common.contactMe}</Link></div></div>
        </section>
        {config.contacts.length > 0 && <section aria-label={copy.externalLinksTitle}><EditorialSectionHeading index="05" title={copy.externalLinksTitle} /><ContactLinks links={getEnabledContactLinks(config)} /></section>}
      </div>
    </div>
  );
}
