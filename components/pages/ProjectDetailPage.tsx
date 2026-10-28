import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProjectBySlug } from "@/lib/projects";
import type { ContentVisibility } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { getSiteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd, projectJsonLd } from "@/lib/seo";
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
    <article className="v2-editorial-page v2-detail v2-project-detail">
      <div className="v2-page-shell v2-detail-shell">
        <JsonLd data={projectJsonLd(project, locale, config)} />
        <JsonLd data={breadcrumbJsonLd(locale, [{ name: dictionary.collections.projectsTitle, pathname: "/projects" }, { name: project.title, pathname: `/projects/${project.slug}` }], config)} />
        <nav aria-label={dictionary.content.breadcrumbsLabel} className="v2-breadcrumb"><Link href={localePath(locale, "/projects")}>{dictionary.content.backProjects}</Link></nav>
        <header className="v2-detail-hero">
          <div className="v2-detail-hero__main">
            <div className="v2-detail-hero__labels"><StatusBadge status={project.status} locale={locale} />{project.areas.map((area) => <span key={area}>{areas[area]}</span>)}</div>
            <h1>{project.title}</h1>
            <p className="v2-detail-hero__summary">{project.summary}</p>
          </div>
          <aside className="v2-detail-hero__aside">
            <ContentMeta locale={locale} role={project.role} year={project.year} updatedAt={project.updatedAt} />
            {project.tags.length > 0 && <ul aria-label={dictionary.collections.projectTagLabel} className="v2-tag-list">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
            {project.outcome && <p className="v2-outcome">{dictionary.common.outcome}：{project.outcome}</p>}
          </aside>
        </header>
        {project.coverImage && <figure className="v2-detail__cover"><Image src={project.coverImage} alt={`${project.title}${dictionary.content.imageAltSuffix}`} fill sizes="(max-width: 768px) 100vw, 1280px" className="object-contain" priority /></figure>}
        <div className="v2-prose prose max-w-none break-words"><MDXRenderer source={project.content} /></div>
      </div>
    </article>
  );
}
