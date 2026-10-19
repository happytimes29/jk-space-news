import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailPage } from "@/components/pages/ProjectDetailPage";
import { contentVisibility } from "@/lib/content/translations";
import { localeConfig, localeFromSegment, localePath, type Locale } from "@/lib/i18n/locales";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { getSiteConfig } from "@/lib/site-config";

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
  const project = await getProjectBySlug(slug, { locale, visibility: contentVisibility() });
  if (!project) return { title: locale === "en" ? "Project not found" : "找不到项目", robots: { index: false, follow: false } };
  const url = localePath(locale, `/projects/${encodeURIComponent(project.slug)}`);
  return {
    title: project.title, description: project.summary,
    alternates: { canonical: url },
    openGraph: {
      siteName: getSiteConfig(locale).name, locale: localeConfig(locale).ogLocale,
      title: project.title, description: project.summary, type: "article", url,
      images: [{ url: `/api/og?${new URLSearchParams({ type: "project", title: project.title })}`, width: 1200, height: 630, alt: project.title }],
    },
  };
}

export default async function LocalizedProjectSlugPage({ params }: Props) {
  const { locale: segment, slug } = await params;
  return ProjectDetailPage({ locale: resolve(segment), slug, visibility: contentVisibility() });
}
