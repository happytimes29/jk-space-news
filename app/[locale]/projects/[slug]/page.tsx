import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailPage } from "@/components/pages/ProjectDetailPage";
import { contentVisibility, getTranslationAvailability } from "@/lib/content/translations";
import { localeFromSegment, type Locale } from "@/lib/i18n/locales";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { buildLocalizedMetadata } from "@/lib/seo";

interface Props { params: Promise<{ locale: string; slug: string }> }
interface ParentParams { params: { locale: string } }

function resolve(segment: string): Exclude<Locale, "zh-TW"> {
  const locale = localeFromSegment(segment);
  if (!locale || locale === "zh-TW") notFound();
  return locale;
}

export async function generateStaticParams({ params }: ParentParams) {
  const locale = resolve(params.locale);
  return (await getAllProjects({ locale, visibility: contentVisibility() })).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: segment, slug } = await params;
  const locale = resolve(segment);
  const visibility = contentVisibility();
  const project = await getProjectBySlug(slug, { locale, visibility });
  if (!project) return { title: locale === "en" ? "Project not found" : "找不到项目", robots: { index: false, follow: false } };
  return buildLocalizedMetadata({ locale, pathname: `/projects/${encodeURIComponent(project.slug)}`, title: project.title, description: project.summary, availableLocales: getTranslationAvailability("projects", project.slug, visibility), type: "project" });
}

export default async function LocalizedProjectSlugPage({ params }: Props) {
  const { locale: segment, slug } = await params;
  return ProjectDetailPage({ locale: resolve(segment), slug, visibility: contentVisibility() });
}
