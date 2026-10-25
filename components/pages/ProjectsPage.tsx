import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import { contentVisibility } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { ContentMeta } from "@/components/content/ContentMeta";
import { StatusBadge } from "@/components/content/StatusBadge";
import { filterProjects, projectAreaLabels, projectStatusLabels } from "@/app/projects/projects-view";

interface Props { locale: Locale; searchParams: Promise<{ area?: string; status?: string }> }

export async function ProjectsPage({ locale, searchParams }: Props) {
  const dictionary = getDictionary(locale);
  const copy = dictionary.collections;
  const { area = "", status = "" } = await searchParams;
  const allProjects = await getAllProjects({ locale, visibility: contentVisibility() });
  const projects = filterProjects(allProjects, { area, status });
  const areaLabels = projectAreaLabels(locale);
  const statusLabels = projectStatusLabels(locale);
  return (
    <div className="editorial-page editorial-collection">
      <div className="editorial-page__shell">
        <header className="editorial-page__intro">
          <div><p className="editorial-page__kicker">01 / {dictionary.navigation.projects}</p><h1>{copy.projectsTitle}</h1></div>
          <p className="editorial-page__lede">{copy.projectsDescription}</p>
        </header>
        <form aria-label={dictionary.common.filters} action={localePath(locale, "/projects")} method="get" className="editorial-filter">
          <label>{copy.projectAreaLabel}<select name="area" defaultValue={area} className="editorial-filter__control"><option value="">{copy.projectAllAreas}</option>{Object.entries(areaLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>{copy.projectStatusLabel}<select name="status" defaultValue={status} className="editorial-filter__control"><option value="">{copy.projectAllStatuses}</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <button type="submit" className="editorial-filter__submit">{copy.projectApplyFilters}</button>
        </form>
        {projects.length > 0 ? <div className="editorial-index-list">{projects.map((project, index) => (
          <article key={project.slug} aria-label={project.title} className="editorial-project-row">
            <span className="editorial-project-row__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div className="editorial-project-row__body">
              <div className="editorial-project-row__labels"><StatusBadge status={project.status} locale={locale} />{project.areas.map((projectArea) => <span key={projectArea}>{areaLabels[projectArea]}</span>)}</div>
              <h2><Link href={localePath(locale, `/projects/${project.slug}`)}>{project.title}</Link></h2>
              <p>{project.summary}</p>
            </div>
            <div className="editorial-project-row__details">
              <ContentMeta locale={locale} role={project.role} year={project.year} updatedAt={project.updatedAt} />
              {project.tags.length > 0 && <ul aria-label={copy.projectTagLabel} className="editorial-tag-list">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
              {project.outcome && <p className="editorial-outcome">{dictionary.common.outcome}：{project.outcome}</p>}
            </div>
          </article>
        ))}</div> : <div className="editorial-empty"><p>{allProjects.length === 0 ? copy.projectsEmpty : copy.projectNoMatch}</p>{allProjects.length > 0 && <Link href={localePath(locale, "/projects")}>{dictionary.common.clearFilters}</Link>}</div>}
      </div>
    </div>
  );
}
