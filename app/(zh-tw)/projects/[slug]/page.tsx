import type { Metadata } from "next";
import { ProjectDetailPage } from "@/components/pages/ProjectDetailPage";
import { contentVisibility, getTranslationAvailability } from "@/lib/content/translations";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { buildLocalizedMetadata } from "@/lib/seo";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getAllProjects({ locale: "zh-TW", visibility: contentVisibility() })).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const visibility = contentVisibility();
  const project = await getProjectBySlug((await params).slug, { locale: "zh-TW", visibility });
  if (!project) return { title: "找不到專案" };
  return buildLocalizedMetadata({ locale: "zh-TW", pathname: `/projects/${encodeURIComponent(project.slug)}`, title: project.title, description: project.summary, availableLocales: getTranslationAvailability("projects", project.slug, visibility), type: "project" });
}

export default async function ProjectSlugPage({ params }: Props) {
  return ProjectDetailPage({ locale: "zh-TW", slug: (await params).slug, visibility: contentVisibility() });
}
