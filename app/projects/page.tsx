import Link from "next/link";
import type { Metadata } from "next";
import { getAllProjects } from "@/lib/projects";
import { ContentCard } from "@/components/content/ContentCard";
import { ContentMeta } from "@/components/content/ContentMeta";
import { StatusBadge } from "@/components/content/StatusBadge";
import { filterProjects, projectAreaLabels } from "./projects-view";

export const metadata: Metadata = {
  title: "專案",
  description: "JK Space 的工程案例：記錄實際問題、角色、限制、關鍵決策與成果。",
};

interface Props {
  searchParams: Promise<{ area?: string; status?: string }>;
}

export default async function ProjectsPage({ searchParams }: Props) {
  const { area = "", status = "" } = await searchParams;
  const projects = filterProjects(await getAllProjects(), { area, status });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">專案</h1>
        <p className="max-w-2xl leading-7 text-[#55555b] dark:text-[#a1a1aa]">不只展示成品，也記錄工程問題、我的角色、做過的選擇與實際結果。</p>
      </header>
      <form action="/projects" method="get" className="mb-8 flex flex-wrap items-end gap-4">
        <label className="flex min-w-0 flex-col gap-2 text-sm">
          領域
          <select name="area" defaultValue={area} className="rounded-lg border border-[#a1a1aa] bg-white p-2 dark:border-[#55555b] dark:bg-[#111113]">
            <option value="">所有領域</option>
            {Object.entries(projectAreaLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-2 text-sm">
          狀態
          <select name="status" defaultValue={status} className="rounded-lg border border-[#a1a1aa] bg-white p-2 dark:border-[#55555b] dark:bg-[#111113]">
            <option value="">所有狀態</option>
            <option value="active">進行中</option>
            <option value="completed">已完成</option>
            <option value="maintained">維護中</option>
            <option value="archived">已封存</option>
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">套用篩選</button>
      </form>
      {projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <ContentCard key={project.slug} href={`/projects/${project.slug}`} title={project.title} summary={project.summary}>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={project.status} />
                {project.areas.map((area) => <span key={area} className="text-xs text-[#55555b] dark:text-[#a1a1aa]">{projectAreaLabels[area]}</span>)}
              </div>
              <ContentMeta role={project.role} year={project.year} updatedAt={project.updatedAt} />
              {project.tags.length > 0 && <ul aria-label="技術標籤" className="flex flex-wrap gap-2 text-xs text-[#55555b] dark:text-[#a1a1aa]">{project.tags.map((tag) => <li key={tag} className="rounded border border-[#d4d4d8] px-2 py-1 dark:border-[#303036]">{tag}</li>)}</ul>}
              {project.outcome && <p className="border-t border-[#d4d4d8] pt-4 text-sm leading-7 dark:border-[#303036]">成果：{project.outcome}</p>}
            </ContentCard>
          ))}
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-[#d4d4d8] p-6 dark:border-[#303036]">
          <p>沒有符合篩選條件的專案</p>
          <Link href="/projects" className="inline-block text-blue-700 underline underline-offset-4 dark:text-blue-300">清除篩選</Link>
        </div>
      )}
    </div>
  );
}
