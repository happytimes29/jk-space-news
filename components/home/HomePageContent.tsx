import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { selectHomeContent } from "@/lib/home";
import type { NowItem } from "@/lib/now";
import type { SiteDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { noteTypeLabels } from "@/app/notes/notes-view";
import { ContentMeta } from "@/components/content/ContentMeta";
import { StatusBadge } from "@/components/content/StatusBadge";
import { HomeSignalField } from "@/components/home/HomeSignalField";

type Props = ReturnType<typeof selectHomeContent> & { now: NowItem; locale: Locale; dictionary: SiteDictionary };

export function HomePageContent({ featuredProjects, featuredTool, recentNotes, now, locale, dictionary }: Props) {
  const localizedNoteTypes = noteTypeLabels(locale);
  const areas = [
    { number: "01", title: dictionary.home.focusHardwareTitle, summary: dictionary.home.focusHardwareText, href: "/projects?area=hardware" },
    { number: "02", title: dictionary.home.focusAutomationTitle, summary: dictionary.home.focusAutomationText, href: "/projects?area=automation" },
    { number: "03", title: dictionary.home.focusProductTitle, summary: dictionary.home.focusProductText, href: "/projects?area=product" },
  ];

  return (
    <div className="v2-editorial-page v2-home">
      <div className="v2-home__shell">
        <section aria-labelledby="v2-home-hero-title" className="v2-home-hero">
          <div className="v2-home-hero__meta"><span>JK SPACE / ENGINEERING FIELD NOTES</span><span>TAIPEI · {now.updatedAt.slice(0, 4)}</span></div>
          <div className="v2-home-hero__layout">
            <div className="v2-home-hero__copy"><p className="v2-home-index">ISSUE 01 — INDEPENDENT ENGINEERING</p><h1 id="v2-home-hero-title">{dictionary.home.heroTitle}</h1><p className="v2-home-hero__eyebrow">{dictionary.home.eyebrow}</p></div>
            <div className="v2-home-hero__aside"><p>{dictionary.home.intro}</p><div className="v2-home-actions"><Link href={localePath(locale, "/tools")}>{dictionary.common.useTools}<ArrowRight aria-hidden="true" size={16} /></Link><Link href={localePath(locale, "/projects")}>{dictionary.common.viewProjects}<ArrowUpRight aria-hidden="true" size={16} /></Link></div></div>
          </div>
          <HomeSignalField label={dictionary.home.signalFieldLabel} />
        </section>

        <section aria-labelledby="v2-home-orientation-title" className="v2-home-orientation">
          <div className="v2-home-section-mark"><span>01</span><span>IN 30 SECONDS</span></div>
          <div className="v2-home-orientation__body"><h2 id="v2-home-orientation-title">{dictionary.home.orientationTitle}</h2><p>{dictionary.home.intro}</p><nav aria-label={dictionary.home.orientationTitle}><Link href={localePath(locale, "/tools")}>{dictionary.navigation.tools} <ArrowUpRight aria-hidden="true" size={15} /></Link><Link href={localePath(locale, "/projects")}>{dictionary.navigation.projects} <ArrowUpRight aria-hidden="true" size={15} /></Link><Link href={localePath(locale, "/notes")}>{dictionary.navigation.notes} <ArrowUpRight aria-hidden="true" size={15} /></Link></nav></div>
        </section>

        <section aria-labelledby="v2-home-focus-title" className="v2-home-practice">
          <div className="v2-home-section-mark"><span>02</span><span>PRACTICE</span></div><h2 id="v2-home-focus-title">{dictionary.home.focusTitle}</h2>
          <div className="v2-home-practice__list">{areas.map((area) => <Link key={area.href} href={localePath(locale, area.href)} className="v2-home-practice__item"><span>{area.number}</span><h3>{area.title}</h3><p>{area.summary}</p><ArrowUpRight aria-hidden="true" size={17} /></Link>)}</div>
        </section>

        <section aria-labelledby="v2-home-tool-title" className="v2-home-tool">
          <div className="v2-home-section-mark"><span>03</span><span>TOOLS / SELECTED WORK</span></div><h2 id="v2-home-tool-title">{dictionary.home.featuredToolTitle}</h2>
          {featuredTool ? <div className="v2-home-tool__layout">
            <div className="v2-home-tool__copy"><p className="v2-home-label">BROWSER TOOL · LOCAL FIRST</p><h3>{featuredTool.title}</h3><StatusBadge status={featuredTool.status} locale={locale} /><p>{featuredTool.summary}</p><dl><div><dt>{dictionary.home.toolAudienceLabel}</dt><dd>{dictionary.home.toolAudience}</dd></div><div><dt>PRIVACY</dt><dd>{featuredTool.privacy}</dd></div></dl><div className="v2-home-actions">{featuredTool.appUrl && <Link href={featuredTool.localizedApp ? localePath(locale, featuredTool.appUrl) : featuredTool.appUrl}>{dictionary.home.toolUseNow}<ArrowRight aria-hidden="true" size={16} /></Link>}<Link href={localePath(locale, `/tools/${featuredTool.slug}`)}>{dictionary.home.toolDetails}<ArrowUpRight aria-hidden="true" size={16} /></Link></div></div>
            {featuredTool.coverImage && <figure className="v2-home-tool__visual"><Image src={featuredTool.coverImage} alt={`${featuredTool.title}${dictionary.home.toolImageAltSuffix}`} width={1191} height={730} sizes="(max-width: 899px) 100vw, 58vw" /><figcaption><span>FIG. 01</span>{dictionary.home.toolCaption}</figcaption></figure>}
          </div> : <p className="v2-home-empty">{dictionary.home.toolEmpty}</p>}
        </section>

        <section aria-labelledby="v2-home-projects-title" className="v2-home-projects">
          <div className="v2-home-section-mark"><span>04</span><span>PROJECT INDEX</span></div><div className="v2-home-section-title"><h2 id="v2-home-projects-title">{dictionary.home.featuredProjectsTitle}</h2><Link href={localePath(locale, "/projects")}>{dictionary.common.allProjects}<ArrowUpRight aria-hidden="true" size={16} /></Link></div>
          <div className="v2-home-projects__list">{featuredProjects.map((project, index) => <article key={project.slug} aria-label={project.title} className="v2-home-project"><span className="v2-home-project__number">{String(index + 1).padStart(2, "0")}</span><div><h3><Link href={localePath(locale, `/projects/${project.slug}`)}>{project.title}</Link></h3><p>{project.summary}</p></div><div className="v2-home-project__meta"><StatusBadge status={project.status} locale={locale} /><ContentMeta locale={locale} role={project.role} updatedAt={project.updatedAt} />{project.outcome && <p><span>{dictionary.common.outcome}：</span>{project.outcome}</p>}</div></article>)}</div>
        </section>

        <section aria-labelledby="v2-home-notes-title" className="v2-home-notes">
          <div className="v2-home-section-mark"><span>05</span><span>FIELD NOTES</span></div><div className="v2-home-section-title"><h2 id="v2-home-notes-title">{dictionary.home.recentNotesTitle}</h2><Link href={localePath(locale, "/notes")}>{dictionary.common.allNotes}<ArrowUpRight aria-hidden="true" size={16} /></Link></div>
          {recentNotes.length === 0 ? <p className="v2-home-empty">{dictionary.home.notesEmpty}</p> : <div className="v2-home-notes__list">{recentNotes.map((note, index) => <article key={note.slug} aria-label={note.title}><span className="v2-home-note__number">N.{String(index + 1).padStart(2, "0")}</span><p className="v2-home-note__meta"><span>{localizedNoteTypes[note.type]}</span><time dateTime={note.publishedAt}>{note.publishedAt.slice(0, 10)}</time><span>{note.readingTime} {dictionary.common.minutes}</span></p><h3><Link href={localePath(locale, `/notes/${encodeURIComponent(note.slug)}`)}>{note.title}</Link></h3><p>{note.summary}</p></article>)}</div>}
        </section>

        <section aria-labelledby="v2-home-now-title" className="v2-home-now">
          <div className="v2-home-section-mark"><span>06</span><span>CURRENTLY</span></div><div className="v2-home-now__layout"><h2 id="v2-home-now-title">{dictionary.home.nowTitle}</h2><div><p className="v2-home-now__date">{dictionary.home.nowUpdatedLabel} <time dateTime={now.updatedAt}>{now.updatedAt.slice(0, 10)}</time></p><p>{now.content.trim()}</p></div></div>
        </section>

        <section aria-labelledby="v2-home-contact-title" className="v2-home-contact">
          <div className="v2-home-section-mark"><span>07</span><span>OPEN BRIEF</span></div><div className="v2-home-contact__layout"><h2 id="v2-home-contact-title">{dictionary.home.collaborationTitle}</h2><div><p>{dictionary.home.collaborationText}</p><Link href={localePath(locale, "/contact")}>{dictionary.common.contactMe}<ArrowRight aria-hidden="true" size={18} /></Link></div></div>
        </section>
      </div>
    </div>
  );
}
