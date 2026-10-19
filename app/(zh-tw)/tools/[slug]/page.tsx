import type { Metadata } from "next";
import { ToolDetailPage } from "@/components/pages/ToolDetailPage";
import { contentVisibility } from "@/lib/content/translations";
import { getAllTools, getToolBySlug } from "@/lib/tools";
import { siteConfig } from "@/lib/site-config";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getAllTools({ locale: "zh-TW", visibility: contentVisibility() })).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getToolBySlug((await params).slug, { locale: "zh-TW", visibility: contentVisibility() });
  if (!tool) return { title: "找不到工具" };
  const url = `/tools/${encodeURIComponent(tool.slug)}`;
  return {
    title: tool.title, description: tool.summary,
    alternates: { canonical: url },
    openGraph: {
      siteName: siteConfig.name, locale: "zh_TW",
      title: tool.title, description: tool.summary, type: "website", url,
      images: [{ url: `/api/og?${new URLSearchParams({ type: "tool", title: tool.title })}`, width: 1200, height: 630, alt: tool.title }],
    },
  };
}

export default async function ToolSlugPage({ params }: Props) {
  return ToolDetailPage({ locale: "zh-TW", slug: (await params).slug, visibility: contentVisibility() });
}
