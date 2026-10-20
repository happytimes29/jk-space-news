import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { selectHomeContent } from "@/lib/home";
import type { NowItem } from "@/lib/now";
import { getSiteConfig } from "@/lib/site-config";
import type { SiteDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { noteTypeLabels } from "@/app/notes/notes-view";
import { ContentMeta } from "@/components/content/ContentMeta";
import { StatusBadge } from "@/components/content/StatusBadge";
import { FocusAreas } from "./FocusAreas";
import { FeaturedTool } from "./FeaturedTool";
import { NowCard } from "./NowCard";

type Props = ReturnType<typeof selectHomeContent> & { now: NowItem; locale: Locale; dictionary: SiteDictionary };

export function HomePageContent({ featuredProjects, featuredTool, recentNotes, now, locale, dictionary }: Props) {
  const config = getSiteConfig(locale);
  const localizedNoteTypes = noteTypeLabels(locale);
  const heroType = locale === "en"
    ? "text-[clamp(1.25rem,7vw,6.5rem)] tracking-[-0.055em]"
    : "text-[clamp(2rem,9vw,8rem)] tracking-[-0.075em]";

  return (
    <div className="home-preview bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-[86rem] px-5 pb-8 sm:px-8 lg:px-12">
        <section aria-labelledby="hero-title" className="home-enter flex min-h-[calc(100svh-5rem)] flex-col justify-center py-16 sm:py-24 lg:py-28">
          <h1 id="hero-title" className={`max-w-6xl font-semibold leading-[0.98] max-[360px]:-mr-4 ${heroType}`}>
            {config.tagline}
          </h1>
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,29rem)] lg:items-end">
            <p className="max-w-xl text-lg font-medium leading-8 text-[var(--color-muted)] sm:text-xl sm:leading-9">
              {dictionary.home.eyebrow}
            </p>
            <div>
              <p className="text-base leading-8 text-[var(--color-muted)]">{dictionary.home.intro}</p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href={localePath(locale, "/tools")} className="inline-flex min-h-12 items-center gap-3 rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700">
                  {dictionary.common.useTools}<ArrowRight aria-hidden="true" size={18} />
                </Link>
                <Link href={localePath(locale, "/projects")} className="group inline-flex min-h-12 items-center gap-2 py-3 text-base font-semibold text-[var(--color-text)]">
                  {dictionary.common.viewProjects}<ArrowUpRight aria-hidden="true" size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-24 sm:space-y-32 lg:space-y-40">
          <FeaturedTool tool={featuredTool} locale={locale} dictionary={dictionary} />
          <FocusAreas locale={locale} dictionary={dictionary} />

          <section aria-labelledby="projects-title" className="grid gap-10 lg:grid-cols-[minmax(14rem,0.55fr)_minmax(0,1.45fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 id="projects-title" className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">{dictionary.home.featuredProjectsTitle}</h2>
              <Link href={localePath(locale, "/projects")} className="group mt-6 inline-flex items-center gap-2 text-base font-semibold text-blue-700 dark:text-blue-300">
                {dictionary.common.allProjects}<ArrowUpRight aria-hidden="true" size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="space-y-5">
              {featuredProjects.map((project) => (
                <article key={project.slug} aria-label={project.title} className="min-w-0 rounded-[1.75rem] bg-[var(--color-card)] p-6 sm:p-9">
                  <h3 className="max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">
                    <Link href={localePath(locale, `/projects/${project.slug}`)} className="transition-colors hover:text-blue-600 dark:hover:text-blue-300">{project.title}</Link>
                  </h3>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <StatusBadge status={project.status} locale={locale} />
                    <ContentMeta locale={locale} role={project.role} updatedAt={project.updatedAt} />
                  </div>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">{project.summary}</p>
                  {project.outcome && <p className="mt-7 max-w-2xl text-base font-medium leading-8"><span className="text-[var(--color-muted)]">{dictionary.common.outcome}：</span>{project.outcome}</p>}
                </article>
              ))}
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:items-start">
            <section aria-labelledby="notes-title" className="rounded-[2rem] bg-[var(--color-carbon)] p-6 sm:p-9 lg:p-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id="notes-title" className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{dictionary.home.recentNotesTitle}</h2>
                <Link href={localePath(locale, "/notes")} className="group inline-flex items-center gap-2 text-base font-semibold text-blue-700 dark:text-blue-300">
                  {dictionary.common.allNotes}<ArrowUpRight aria-hidden="true" size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
              {recentNotes.length === 0 ? <p className="mt-8 text-base text-[var(--color-muted)]">{dictionary.home.notesEmpty}</p> : (
                <div className="mt-8 space-y-8">
                  {recentNotes.map((note) => (
                    <article key={note.slug} aria-label={note.title} className="group">
                      <div className="flex flex-wrap gap-4 text-sm text-[var(--color-muted)]">
                        <span>{localizedNoteTypes[note.type]}</span>
                        <time dateTime={note.publishedAt}>{note.publishedAt.slice(0, 10)}</time>
                        <span>{note.readingTime} {dictionary.common.minutes}</span>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.02em] sm:text-2xl">
                        <Link href={localePath(locale, `/notes/${encodeURIComponent(note.slug)}`)} className="transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-300">{note.title}</Link>
                      </h3>
                      <p className="mt-3 text-base leading-8 text-[var(--color-muted)]">{note.summary}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
            <NowCard now={now} dictionary={dictionary} />
          </div>

          <section aria-labelledby="collaboration-title" className="home-enter-delay rounded-[2.25rem] bg-blue-600 px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-end">
              <h2 id="collaboration-title" className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-5xl">{dictionary.home.collaborationTitle}</h2>
              <div>
                <p className="text-base leading-8 text-white sm:text-lg">{dictionary.home.collaborationText}</p>
                <Link href={localePath(locale, "/contact")} className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 py-3 text-base font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50">
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
