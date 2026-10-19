import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProjectBySlug } from "@/lib/projects";
import type { ContentVisibility } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { getSiteConfig } from "@/lib/site-config";
import { projectJsonLd } from "@/lib/seo";
import { projectAreaLabels } from "@/app/projects/projects-view";
import { MDXRenderer } from "@/components/MDXRenderer";
import { ContentMeta } from "@/components/content/ContentMeta";
import { StatusBadge } from "@/components/content/StatusBadge";
import { JsonLd } from "@/components/JsonLd";

export async function ProjectDetailPage({ locale, slug, visibility }: { locale: Locale; slug: string; visibility: ContentVisibility }) {
  const project = await getProjectBySlug(slug, { locale, visibility });
  if (!project) notFound();
  const dictionary = getDictionary(locale);
  const areas = projectAreaLabels(locale);
  const config = getSiteConfig(locale);
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={projectJsonLd(project, config)} />
      <nav aria-label={dictionary.content.breadcrumbsLabel} className="mb-8 text-sm"><Link href={localePath(locale, "/projects")} className="text-blue-700 underline underline-offset-4 dark:text-blue-300">{dictionary.content.backProjects}</Link></nav>
      <header className="mb-10 space-y-6 border-b border-[#d4d4d8] pb-8 dark:border-[#303036]">
        <div className="flex flex-wrap items-center gap-3"><StatusBadge status={project.status} locale={locale} />{project.areas.map((area) => <span key={area} className="text-sm text-[#55555b] dark:text-[#a1a1aa]">{areas[area]}</span>)}</div>
        <h1 className="break-words text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{project.title}</h1>
        <p className="leading-8 text-[#55555b] dark:text-[#a1a1aa]">{project.summary}</p>
        <ContentMeta locale={locale} role={project.role} year={project.year} updatedAt={project.updatedAt} />
        {project.tags.length > 0 && <ul aria-label={dictionary.collections.projectTagLabel} className="flex flex-wrap gap-2 text-xs text-[#55555b] dark:text-[#a1a1aa]">{project.tags.map((tag) => <li key={tag} className="rounded border border-[#d4d4d8] px-2 py-1 dark:border-[#303036]">{tag}</li>)}</ul>}
        {project.outcome && <p className="rounded-lg bg-blue-50 p-4 text-sm leading-7 text-blue-900 dark:bg-blue-950 dark:text-blue-200">{dictionary.common.outcome}：{project.outcome}</p>}
      </header>
      {project.coverImage && <div className="relative mb-10 aspect-video overflow-hidden rounded-xl border border-[#d4d4d8] dark:border-[#303036]"><Image src={project.coverImage} alt={`${project.title}${dictionary.content.imageAltSuffix}`} fill sizes="(max-width: 768px) 100vw, 704px" className="object-contain p-2" priority /></div>}
      <div className="prose max-w-none break-words dark:prose-invert"><MDXRenderer source={project.content} /></div>
    </article>
  );
}
