import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import { contentVisibility } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { ContentCard } from "@/components/content/ContentCard";
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-4"><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{copy.projectsTitle}</h1><p className="max-w-2xl leading-7 text-[#55555b] dark:text-[#a1a1aa]">{copy.projectsDescription}</p></header>
      <form aria-label={dictionary.common.filters} action={localePath(locale, "/projects")} method="get" className="mb-8 flex flex-wrap items-end gap-4">
        <label className="flex min-w-0 flex-col gap-2 text-sm">{copy.projectAreaLabel}<select name="area" defaultValue={area} className="rounded-lg border border-[#a1a1aa] bg-white p-2 dark:border-[#55555b] dark:bg-[#111113]"><option value="">{copy.projectAllAreas}</option>{Object.entries(areaLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="flex min-w-0 flex-col gap-2 text-sm">{copy.projectStatusLabel}<select name="status" defaultValue={status} className="rounded-lg border border-[#a1a1aa] bg-white p-2 dark:border-[#55555b] dark:bg-[#111113]"><option value="">{copy.projectAllStatuses}</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">{copy.projectApplyFilters}</button>
      </form>
      {projects.length > 0 ? <div className="grid gap-6 md:grid-cols-2">{projects.map((project) => (
        <ContentCard key={project.slug} href={localePath(locale, `/projects/${project.slug}`)} title={project.title} summary={project.summary}>
          <div className="flex flex-wrap items-center gap-2"><StatusBadge status={project.status} locale={locale} />{project.areas.map((projectArea) => <span key={projectArea} className="text-xs text-[#55555b] dark:text-[#a1a1aa]">{areaLabels[projectArea]}</span>)}</div>
          <ContentMeta locale={locale} role={project.role} year={project.year} updatedAt={project.updatedAt} />
          {project.tags.length > 0 && <ul aria-label={copy.projectTagLabel} className="flex flex-wrap gap-2 text-xs text-[#55555b] dark:text-[#a1a1aa]">{project.tags.map((tag) => <li key={tag} className="rounded border border-[#d4d4d8] px-2 py-1 dark:border-[#303036]">{tag}</li>)}</ul>}
          {project.outcome && <p className="border-t border-[#d4d4d8] pt-4 text-sm leading-7 dark:border-[#303036]">{dictionary.common.outcome}：{project.outcome}</p>}
        </ContentCard>
      ))}</div> : <div className="space-y-4 rounded-xl border border-[#d4d4d8] p-6 dark:border-[#303036]"><p>{allProjects.length === 0 ? copy.projectsEmpty : copy.projectNoMatch}</p>{allProjects.length > 0 && <Link href={localePath(locale, "/projects")} className="inline-block text-blue-700 underline underline-offset-4 dark:text-blue-300">{dictionary.common.clearFilters}</Link>}</div>}
    </div>
  );
}
