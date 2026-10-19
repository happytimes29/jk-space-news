import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolDetailPage } from "@/components/pages/ToolDetailPage";
import { contentVisibility } from "@/lib/content/translations";
import { localeConfig, localeFromSegment, localePath, type Locale } from "@/lib/i18n/locales";
import { getSiteConfig } from "@/lib/site-config";
import { getAllTools, getToolBySlug } from "@/lib/tools";

interface Props { params: Promise<{ locale: string; slug: string }> }
interface ParentParams { params: { locale: string } }

function resolve(segment: string): Exclude<Locale, "zh-TW"> {
  const locale = localeFromSegment(segment);
  if (!locale || locale === "zh-TW") notFound();
  return locale;
}

export async function generateStaticParams({ params }: ParentParams) {
  const locale = resolve(params.locale);
  return (await getAllTools({ locale, visibility: contentVisibility() })).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: segment, slug } = await params;
  const locale = resolve(segment);
  const tool = await getToolBySlug(slug, { locale, visibility: contentVisibility() });
  if (!tool) return { title: locale === "en" ? "Tool not found" : "找不到工具", robots: { index: false, follow: false } };
  const url = localePath(locale, `/tools/${encodeURIComponent(tool.slug)}`);
  return {
    title: tool.title, description: tool.summary,
    alternates: { canonical: url },
    openGraph: {
      siteName: getSiteConfig(locale).name, locale: localeConfig(locale).ogLocale,
      title: tool.title, description: tool.summary, type: "website", url,
      images: [{ url: `/api/og?${new URLSearchParams({ type: "tool", title: tool.title })}`, width: 1200, height: 630, alt: tool.title }],
    },
  };
}

export default async function LocalizedToolSlugPage({ params }: Props) {
  const { locale: segment, slug } = await params;
  return ToolDetailPage({ locale: resolve(segment), slug, visibility: contentVisibility() });
}
