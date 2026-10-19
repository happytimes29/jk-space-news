import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EngineeringToolAppPage } from "@/components/engineering/EngineeringToolAppPage";
import { contentVisibility, getTranslationAvailability } from "@/lib/content/translations";
import { isEngineeringToolSlug } from "@/lib/engineering/tool-registry";
import { localeFromSegment, type Locale } from "@/lib/i18n/locales";
import { buildLocalizedMetadata } from "@/lib/seo";
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
  return (await getAllTools({ locale, visibility: contentVisibility() })).filter((tool) => tool.localizedApp && isEngineeringToolSlug(tool.slug)).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: segment, slug } = await params;
  const locale = resolve(segment);
  const visibility = contentVisibility();
  const tool = await getToolBySlug(slug, { locale, visibility });
  if (!tool?.localizedApp) return { title: locale === "en" ? "Tool not found" : "找不到工具", robots: { index: false, follow: false } };
  return buildLocalizedMetadata({ locale, pathname: `/tools/${encodeURIComponent(tool.slug)}/app`, title: tool.title, description: tool.summary, availableLocales: getTranslationAvailability("tools", tool.slug, visibility), type: "tool" });
}

export default async function LocalizedEngineeringToolPage({ params }: Props) {
  const { locale: segment, slug } = await params;
  return EngineeringToolAppPage({ locale: resolve(segment), slug, visibility: contentVisibility() });
}
