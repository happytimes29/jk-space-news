import type { Metadata } from "next";
import { ToolDetailPage } from "@/components/pages/ToolDetailPage";
import { contentVisibility, getTranslationAvailability } from "@/lib/content/translations";
import { getAllTools, getToolBySlug } from "@/lib/tools";
import { buildLocalizedMetadata } from "@/lib/seo";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getAllTools({ locale: "zh-TW", visibility: contentVisibility() })).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const visibility = contentVisibility();
  const tool = await getToolBySlug((await params).slug, { locale: "zh-TW", visibility });
  if (!tool) return { title: "找不到工具" };
  return buildLocalizedMetadata({ locale: "zh-TW", pathname: `/tools/${encodeURIComponent(tool.slug)}`, title: tool.title, description: tool.summary, availableLocales: getTranslationAvailability("tools", tool.slug, visibility), type: "tool" });
}

export default async function ToolSlugPage({ params }: Props) {
  return ToolDetailPage({ locale: "zh-TW", slug: (await params).slug, visibility: contentVisibility() });
}
