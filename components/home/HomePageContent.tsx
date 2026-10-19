import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
  return (
    <div className="bg-zinc-50 text-zinc-900 dark:bg-[#0c0e12] dark:text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <section aria-labelledby="hero-title" className="relative -mx-4 mb-12 border-b border-zinc-300 px-4 py-12 dark:border-zinc-700 sm:-mx-6 sm:mb-16 sm:px-6 sm:py-20 lg:-mx-8 lg:px-8" style={{ backgroundImage: "linear-gradient(rgba(126,160,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(126,160,255,0.07) 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
          <p className="mb-5 font-mono text-sm tracking-widest text-blue-700 dark:text-blue-300">{config.name}</p>
          <p className="mb-5 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">{dictionary.home.eyebrow}</p>
          <h1 id="hero-title" className="max-w-4xl text-balance text-3xl font-semibold leading-[1.35] tracking-tight sm:text-5xl lg:text-6xl">{config.tagline}</h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">{dictionary.home.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={localePath(locale, "/projects")} className="inline-flex items-center gap-3 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700">{dictionary.common.viewProjects}<ArrowRight aria-hidden="true" size={16} /></Link>
            <Link href={localePath(locale, "/tools")} className="inline-flex items-center rounded-lg border border-zinc-400 bg-white px-5 py-3 text-sm font-medium hover:border-blue-500 dark:border-zinc-600 dark:bg-[#11151b]">{dictionary.common.useTools}</Link>
          </div>
        </section>

        <div className="space-y-14 sm:space-y-20">
          <FocusAreas locale={locale} dictionary={dictionary} />
          <FeaturedTool tool={featuredTool} locale={locale} dictionary={dictionary} />
          <section aria-labelledby="projects-title" className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="projects-title" className="text-2xl font-semibold tracking-tight">{dictionary.home.featuredProjectsTitle}</h2>
              <Link href={localePath(locale, "/projects")} className="text-sm text-blue-700 underline underline-offset-4 dark:text-blue-300">{dictionary.common.allProjects}</Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {featuredProjects.map((project) => (
                <article key={project.slug} aria-label={project.title} className="min-w-0 space-y-5 rounded-2xl border border-zinc-300 bg-white p-5 sm:p-7 dark:border-zinc-700 dark:bg-[#11151b]">
                  <StatusBadge status={project.status} />
                  <h3 className="text-xl font-semibold leading-snug"><Link href={localePath(locale, `/projects/${project.slug}`)} className="hover:text-blue-600 dark:hover:text-blue-300">{project.title}</Link></h3>
                  <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">{project.summary}</p>
                  <ContentMeta role={project.role} updatedAt={project.updatedAt} />
                  {project.outcome && <p className="border-t border-zinc-300 pt-4 text-sm leading-7 dark:border-zinc-700">{dictionary.common.outcome}：{project.outcome}</p>}
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="notes-title" className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="notes-title" className="text-2xl font-semibold tracking-tight">{dictionary.home.recentNotesTitle}</h2>
              <Link href={localePath(locale, "/notes")} className="text-sm text-blue-700 underline underline-offset-4 dark:text-blue-300">{dictionary.common.allNotes}</Link>
            </div>
            {recentNotes.length === 0 ? <p className="text-sm text-zinc-600 dark:text-zinc-400">{dictionary.home.notesEmpty}</p> : (
              <div className="divide-y divide-zinc-300 dark:divide-zinc-700">
                {recentNotes.map((note) => (
                  <article key={note.slug} aria-label={note.title} className="space-y-3 py-5 first:pt-0">
                    <div className="flex flex-wrap gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                      <span>{noteTypeLabels[note.type]}</span>
                      <time dateTime={note.publishedAt}>{note.publishedAt.slice(0, 10)}</time>
                      <span>{note.readingTime} {dictionary.common.minutes}</span>
                    </div>
                    <h3 className="text-lg font-semibold"><Link href={localePath(locale, `/notes/${encodeURIComponent(note.slug)}`)} className="hover:text-blue-600 dark:hover:text-blue-300">{note.title}</Link></h3>
                    <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">{note.summary}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
          <NowCard now={now} dictionary={dictionary} />
          <section aria-labelledby="collaboration-title" className="max-w-2xl space-y-5">
            <h2 id="collaboration-title" className="text-2xl font-semibold tracking-tight">{dictionary.home.collaborationTitle}</h2>
            <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">{dictionary.home.collaborationText}</p>
            <Link href={localePath(locale, "/contact")} className="inline-flex items-center gap-3 rounded-lg border border-zinc-400 px-5 py-3 text-sm font-medium hover:border-blue-500 dark:border-zinc-600">{dictionary.common.contactMe}<ArrowRight aria-hidden="true" size={16} /></Link>
          </section>
        </div>
      </div>
    </div>
  );
}
