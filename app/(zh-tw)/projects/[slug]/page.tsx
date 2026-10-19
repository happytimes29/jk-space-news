import type { Metadata } from "next";
import { ProjectDetailPage } from "@/components/pages/ProjectDetailPage";
import { contentVisibility } from "@/lib/content/translations";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getAllProjects({ locale: "zh-TW", visibility: contentVisibility() })).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug((await params).slug, { locale: "zh-TW", visibility: contentVisibility() });
  if (!project) return { title: "找不到專案" };
  const url = `/projects/${encodeURIComponent(project.slug)}`;
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: {
      siteName: siteConfig.name, locale: "zh_TW",
      title: project.title, description: project.summary, type: "article", url,
      images: [{ url: `/api/og?${new URLSearchParams({ type: "project", title: project.title })}`, width: 1200, height: 630, alt: project.title }],
    },
  };
}

export default async function ProjectSlugPage({ params }: Props) {
  return ProjectDetailPage({ locale: "zh-TW", slug: (await params).slug, visibility: contentVisibility() });
}
