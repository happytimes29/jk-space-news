import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllTools, getToolBySlug } from "@/lib/tools";
import { MDXRenderer } from "@/components/MDXRenderer";
import { StatusBadge } from "@/components/content/StatusBadge";
import { OpenToolLink } from "@/components/tools/OpenToolLink";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { toolJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getAllTools()).map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getToolBySlug((await params).slug);
  if (!tool) return { title: "找不到工具" };
  return {
    title: tool.title, description: tool.summary,
    alternates: { canonical: `/tools/${encodeURIComponent(tool.slug)}` },
    openGraph: {
      siteName: siteConfig.name, locale: "zh_TW",
      title: tool.title, description: tool.summary, type: "website", url: `/tools/${encodeURIComponent(tool.slug)}`,
      images: [{ url: `/api/og?${new URLSearchParams({ type: "tool", title: tool.title })}`, width: 1200, height: 630, alt: tool.title }],
    },
  };
}

export default async function ToolSlugPage({ params }: Props) {
  const tool = await getToolBySlug((await params).slug);
  if (!tool) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={toolJsonLd(tool, siteConfig)} />
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">返回工具列表</Link>
      <header className="mb-8 mt-8">
        <StatusBadge status={tool.status} locale="zh-TW" />
        <h1 className="mt-4 text-3xl font-bold leading-tight">{tool.title}</h1>
        <p className="mt-4 leading-relaxed text-[var(--color-muted)]">{tool.summary}</p>
        <p className="mt-4 text-sm">最後更新：<time dateTime={tool.updatedAt}>{tool.updatedAt.slice(0, 10)}</time></p>
        <dl className="my-6 space-y-3 rounded-xl border border-[var(--color-border)] p-5 text-sm">
          <div><dt className="font-semibold">資料處理與隱私</dt><dd>{tool.privacy}</dd></div>
          <div><dt className="font-semibold">輸入格式</dt><dd>{tool.inputTypes.join("、")}</dd></div>
          <div><dt className="font-semibold">輸出結果</dt><dd>{tool.outputTypes.join("、")}</dd></div>
        </dl>
        {tool.appUrl && <OpenToolLink slug={tool.slug} href={tool.appUrl}>開啟工具</OpenToolLink>}
      </header>
      {tool.coverImage && <div className="relative mb-10 aspect-video overflow-hidden rounded-xl border border-[var(--color-border)]"><Image src={tool.coverImage} alt={`${tool.title}操作畫面`} fill className="object-cover" priority /></div>}
      <div className="prose"><MDXRenderer source={tool.content} /></div>
      <footer className="mt-10 flex flex-wrap gap-5 border-t border-[var(--color-border)] pt-6 text-sm text-blue-600 dark:text-blue-400">
        {tool.relatedProject && <Link href={`/projects/${tool.relatedProject}`} className="hover:underline">相關專案</Link>}
        {tool.sampleUrl && <a href={tool.sampleUrl} className="hover:underline">下載範例</a>}
        {tool.repositoryUrl && <a href={tool.repositoryUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">原始碼</a>}
        <Link href="/contact" className="hover:underline">工具回饋</Link>
      </footer>
    </article>
  );
}
