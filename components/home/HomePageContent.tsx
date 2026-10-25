import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { selectHomeContent } from "@/lib/home";
import type { NowItem } from "@/lib/now";
import { getSiteConfig } from "@/lib/site-config";
import type { SiteDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { noteTypeLabels } from "@/app/notes/notes-view";
import { ContentMeta } from "@/components/content/ContentMeta";
import { StatusBadge } from "@/components/content/StatusBadge";
import { EditorialSignalPanel } from "./EditorialSignalPanel";

type Props = ReturnType<typeof selectHomeContent> & { now: NowItem; locale: Locale; dictionary: SiteDictionary };

export function HomePageContent({ featuredProjects, featuredTool, recentNotes, now, locale, dictionary }: Props) {
  const config = getSiteConfig(locale);
  const localizedNoteTypes = noteTypeLabels(locale);
  const areas = [
    { number: "01", title: dictionary.home.focusHardwareTitle, summary: dictionary.home.focusHardwareText, href: "/projects?area=hardware" },
    { number: "02", title: dictionary.home.focusAutomationTitle, summary: dictionary.home.focusAutomationText, href: "/projects?area=automation" },
    { number: "03", title: dictionary.home.focusProductTitle, summary: dictionary.home.focusProductText, href: "/projects?area=product" },
  ];

  return (
    <div className="editorial-home">
      <div className="editorial-shell">
        <section aria-labelledby="hero-title" className="editorial-hero">
          <div className="editorial-kicker">
            <span>JK SPACE / ENGINEERING FIELD NOTES</span>
            <span>TAIPEI · {now.updatedAt.slice(0, 4)}</span>
          </div>
          <div className="editorial-hero__grid">
            <div className="editorial-hero__copy">
              <p className="editorial-index">ISSUE 01 — INDEPENDENT ENGINEERING</p>
              <h1 id="hero-title">{config.tagline}</h1>
              <p className="editorial-eyebrow">{dictionary.home.eyebrow}</p>
            </div>
            <div className="editorial-hero__aside">
              <p>{dictionary.home.intro}</p>
              <div className="editorial-actions">
                <Link href={localePath(locale, "/tools")}>
                  {dictionary.common.useTools}<ArrowRight aria-hidden="true" size={17} />
                </Link>
                <Link href={localePath(locale, "/projects")}>
                  {dictionary.common.viewProjects}<ArrowUpRight aria-hidden="true" size={17} />
                </Link>
              </div>
            </div>
          </div>
          <EditorialSignalPanel />
        </section>

        <div className="editorial-sections">
          <section aria-labelledby="tool-title" className="editorial-tool">
            <div className="editorial-section-head">
              <span>01 / SELECTED WORK</span>
              <h2 id="tool-title">{dictionary.home.featuredToolTitle}</h2>
            </div>
            {featuredTool ? (
              <div className="editorial-tool__grid">
                <div className="editorial-tool__copy">
                  <p className="editorial-label">BROWSER TOOL · LOCAL FIRST</p>
                  <h3>{featuredTool.title}</h3>
                  <StatusBadge status={featuredTool.status} locale={locale} />
                  <p>{featuredTool.summary}</p>
                  <dl>
                    <div><dt>{dictionary.home.toolAudienceLabel}</dt><dd>{dictionary.home.toolAudience}</dd></div>
                    <div><dt>PRIVACY</dt><dd>{featuredTool.privacy}</dd></div>
                  </dl>
                  <div className="editorial-inline-links">
                    {featuredTool.appUrl && (
                      <Link href={featuredTool.localizedApp ? localePath(locale, featuredTool.appUrl) : featuredTool.appUrl}>
                        {dictionary.home.toolUseNow}<ArrowRight aria-hidden="true" size={16} />
                      </Link>
                    )}
                    <Link href={localePath(locale, `/tools/${featuredTool.slug}`)}>
                      {dictionary.home.toolDetails}<ArrowUpRight aria-hidden="true" size={16} />
                    </Link>
                  </div>
                </div>
                {featuredTool.coverImage && (
                  <figure className="editorial-tool__visual">
                    <Image src={featuredTool.coverImage} alt={`${featuredTool.title}${dictionary.home.toolImageAltSuffix}`} width={1191} height={730} sizes="(max-width: 899px) 100vw, 62vw" />
                    <figcaption><span>FIG. 01</span>{dictionary.home.toolCaption}</figcaption>
                  </figure>
                )}
              </div>
            ) : <p>{dictionary.home.toolEmpty}</p>}
          </section>

          <section aria-labelledby="focus-title" className="editorial-focus">
            <div className="editorial-section-head">
              <span>02 / PRACTICE</span>
              <h2 id="focus-title">{dictionary.home.focusTitle}</h2>
            </div>
            <div className="editorial-focus__grid">
              {areas.map((area) => (
                <Link key={area.href} href={localePath(locale, area.href)} className="editorial-focus__item">
                  <span>{area.number}</span>
                  <h3>{area.title}</h3>
                  <p>{area.summary}</p>
                  <ArrowUpRight aria-hidden="true" size={18} />
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="projects-title" className="editorial-projects">
            <div className="editorial-section-head">
              <span>03 / PROJECT INDEX</span>
              <h2 id="projects-title">{dictionary.home.featuredProjectsTitle}</h2>
              <Link href={localePath(locale, "/projects")}>{dictionary.common.allProjects}<ArrowUpRight aria-hidden="true" size={16} /></Link>
            </div>
            <div className="editorial-projects__list">
              {featuredProjects.map((project, index) => (
                <article key={project.slug} aria-label={project.title} className="editorial-project">
                  <span className="editorial-project__number">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3><Link href={localePath(locale, `/projects/${project.slug}`)}>{project.title}</Link></h3>
                    <p>{project.summary}</p>
                  </div>
                  <div className="editorial-project__meta">
                    <StatusBadge status={project.status} locale={locale} />
                    <ContentMeta locale={locale} role={project.role} updatedAt={project.updatedAt} />
                    {project.outcome && <p><span>{dictionary.common.outcome}：</span>{project.outcome}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="editorial-reading-grid">
            <section aria-labelledby="notes-title" className="editorial-notes">
              <div className="editorial-section-head">
                <span>04 / FIELD NOTES</span>
                <h2 id="notes-title">{dictionary.home.recentNotesTitle}</h2>
                <Link href={localePath(locale, "/notes")}>{dictionary.common.allNotes}<ArrowUpRight aria-hidden="true" size={16} /></Link>
              </div>
              {recentNotes.length === 0 ? <p>{dictionary.home.notesEmpty}</p> : (
                <div className="editorial-notes__list">
                  {recentNotes.map((note, index) => (
                    <article key={note.slug} aria-label={note.title}>
                      <span className="editorial-note-number">N.{String(index + 1).padStart(2, "0")}</span>
                      <div className="editorial-note-meta">
                        <span>{localizedNoteTypes[note.type]}</span>
                        <time dateTime={note.publishedAt}>{note.publishedAt.slice(0, 10)}</time>
                        <span>{note.readingTime} {dictionary.common.minutes}</span>
                      </div>
                      <h3><Link href={localePath(locale, `/notes/${encodeURIComponent(note.slug)}`)}>{note.title}</Link></h3>
                      <p>{note.summary}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
            <section aria-labelledby="now-title" className="editorial-now">
              <span>05 / CURRENTLY</span>
              <h2 id="now-title">{dictionary.home.nowTitle}</h2>
              <p className="editorial-now__date">{dictionary.home.nowUpdatedLabel} <time dateTime={now.updatedAt}>{now.updatedAt.slice(0, 10)}</time></p>
              <p className="editorial-now__copy">{now.content.trim()}</p>
            </section>
          </div>

          <section aria-labelledby="collaboration-title" className="editorial-contact">
            <span>06 / OPEN BRIEF</span>
            <div className="editorial-contact__grid">
              <h2 id="collaboration-title">{dictionary.home.collaborationTitle}</h2>
              <div>
                <p>{dictionary.home.collaborationText}</p>
                <Link href={localePath(locale, "/contact")}>
                  {dictionary.common.contactMe}<ArrowRight aria-hidden="true" size={18} />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
