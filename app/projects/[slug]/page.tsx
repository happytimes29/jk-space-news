import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { MDXRenderer } from "@/components/MDXRenderer";
import { ContentMeta } from "@/components/content/ContentMeta";
import { StatusBadge } from "@/components/content/StatusBadge";
import { projectAreaLabels } from "../projects-view";
import { JsonLd } from "@/components/JsonLd";
import { projectJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getAllProjects()).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug((await params).slug);
  if (!project) return { title: "找不到專案" };
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${encodeURIComponent(project.slug)}` },
    openGraph: {
      siteName: siteConfig.name, locale: "zh_TW",
      title: project.title, description: project.summary, type: "article", url: `/projects/${encodeURIComponent(project.slug)}`,
      images: [{ url: `/api/og?${new URLSearchParams({ type: "project", title: project.title })}`, width: 1200, height: 630, alt: project.title }],
    },
  };
}

export default async function ProjectSlugPage({ params }: Props) {
  const project = await getProjectBySlug((await params).slug);
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={projectJsonLd(project, siteConfig)} />
      <nav aria-label="麵包屑" className="mb-8 text-sm">
        <Link href="/projects" className="text-blue-700 underline underline-offset-4 dark:text-blue-300">返回專案列表</Link>
      </nav>
      <header className="mb-10 space-y-6 border-b border-[#d4d4d8] pb-8 dark:border-[#303036]">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={project.status} />
          {project.areas.map((area) => <span key={area} className="text-sm text-[#55555b] dark:text-[#a1a1aa]">{projectAreaLabels[area]}</span>)}
        </div>
        <h1 className="break-words text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{project.title}</h1>
        <p className="leading-8 text-[#55555b] dark:text-[#a1a1aa]">{project.summary}</p>
        <ContentMeta role={project.role} year={project.year} updatedAt={project.updatedAt} />
        {project.tags.length > 0 && <ul aria-label="技術標籤" className="flex flex-wrap gap-2 text-xs text-[#55555b] dark:text-[#a1a1aa]">{project.tags.map((tag) => <li key={tag} className="rounded border border-[#d4d4d8] px-2 py-1 dark:border-[#303036]">{tag}</li>)}</ul>}
        {project.outcome && <p className="rounded-lg bg-blue-50 p-4 text-sm leading-7 text-blue-900 dark:bg-blue-950 dark:text-blue-200">成果：{project.outcome}</p>}
      </header>
      {project.coverImage && (
        <div className="relative mb-10 aspect-video overflow-hidden rounded-xl border border-[#d4d4d8] dark:border-[#303036]">
          <Image src={project.coverImage} alt={`${project.title}操作畫面`} fill sizes="(max-width: 768px) 100vw, 704px" className="object-contain p-2" priority />
        </div>
      )}
      <div className="prose max-w-none break-words dark:prose-invert">
        <MDXRenderer source={project.content} />
      </div>
    </article>
  );
}
