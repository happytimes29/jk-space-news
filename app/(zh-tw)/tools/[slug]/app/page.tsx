import type { Metadata } from "next";
import { EngineeringToolAppPage } from "@/components/engineering/EngineeringToolAppPage";
import { contentVisibility, getTranslationAvailability } from "@/lib/content/translations";
import { isEngineeringToolSlug } from "@/lib/engineering/tool-registry";
import { buildLocalizedMetadata } from "@/lib/seo";
import { getAllTools, getToolBySlug } from "@/lib/tools";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getAllTools({ locale: "zh-TW", visibility: contentVisibility() })).filter((tool) => tool.localizedApp && isEngineeringToolSlug(tool.slug)).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const visibility = contentVisibility();
  const tool = await getToolBySlug((await params).slug, { locale: "zh-TW", visibility });
  if (!tool?.localizedApp) return { title: "找不到工具", robots: { index: false, follow: false } };
  return buildLocalizedMetadata({ locale: "zh-TW", pathname: `/tools/${encodeURIComponent(tool.slug)}/app`, title: tool.title, description: tool.summary, availableLocales: getTranslationAvailability("tools", tool.slug, visibility), type: "tool" });
}

export default async function EngineeringToolPage({ params }: Props) {
  return EngineeringToolAppPage({ locale: "zh-TW", slug: (await params).slug, visibility: contentVisibility() });
}
