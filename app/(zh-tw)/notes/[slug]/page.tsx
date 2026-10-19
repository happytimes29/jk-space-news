import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllNotes, getNoteBySlug } from "@/lib/notes";
import { parseCommentaryContent } from "@/lib/notes-content";
import { MDXRenderer } from "@/components/MDXRenderer";
import { SourceDisclosure } from "@/components/notes/SourceDisclosure";
import { noteTypeLabels } from "@/app/notes/notes-view";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getAllNotes()).map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await getNoteBySlug((await params).slug);
  if (!note) return { title: "找不到筆記", robots: { index: false, follow: false } };
  return {
    title: note.title, description: note.summary,
    alternates: { canonical: `/notes/${encodeURIComponent(note.slug)}` },
    openGraph: {
      siteName: siteConfig.name, locale: "zh_TW",
      title: note.title, description: note.summary, type: "article",
      url: `/notes/${encodeURIComponent(note.slug)}`,
      publishedTime: note.publishedAt, modifiedTime: note.updatedAt, authors: [note.author],
      images: [{ url: `/api/og?${new URLSearchParams({ type: "note", title: note.title })}`, width: 1200, height: 630, alt: note.title }],
    },
  };
}

export default async function NotePage({ params }: Props) {
  const note = await getNoteBySlug((await params).slug);
  if (!note) notFound();
  const commentary = note.type === "commentary" ? parseCommentaryContent(note.content, note.slug) : undefined;
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={articleJsonLd(note, siteConfig)} />
      <nav aria-label="麵包屑" className="mb-8 text-sm"><Link href="/notes" className="text-blue-700 underline underline-offset-4 dark:text-blue-300">返回筆記列表</Link></nav>
      <header className="mb-8 space-y-5 border-b border-[#d4d4d8] pb-8 dark:border-[#303036]">
        <p className="text-sm text-blue-700 dark:text-blue-300">{noteTypeLabels[note.type]}</p>
        <h1 className="break-words text-3xl font-bold leading-tight sm:text-4xl">{note.title}</h1>
        <p className="leading-8 text-[#55555b] dark:text-[#a1a1aa]">{note.summary}</p>
        <dl className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#55555b] dark:text-[#a1a1aa]">
          <div><dt>作者</dt><dd>{note.author}</dd></div>
          <div><dt>發布日期</dt><dd><time dateTime={note.publishedAt}>{note.publishedAt.slice(0, 10)}</time></dd></div>
          <div><dt>最後更新</dt><dd><time dateTime={note.updatedAt}>{note.updatedAt.slice(0, 10)}</time></dd></div>
          <div><dt>閱讀時間</dt><dd>{note.readingTime} 分鐘</dd></div>
        </dl>
        {note.tags.length > 0 && <ul aria-label="文章標籤" className="flex flex-wrap gap-2 text-xs">{note.tags.map((tag) => <li key={tag} className="rounded border border-[#d4d4d8] px-2 py-1 dark:border-[#303036]">{tag}</li>)}</ul>}
      </header>
      {note.type === "commentary" && <SourceDisclosure note={note} />}
      <div className="prose max-w-none break-words dark:prose-invert">
        {commentary ? <>
          <section aria-labelledby="event-summary"><h2 id="event-summary">事件摘要</h2><MDXRenderer source={commentary.summary} /></section>
          <section aria-labelledby="my-opinion"><h2 id="my-opinion">我的觀點</h2><MDXRenderer source={commentary.opinion} /></section>
        </> : <MDXRenderer source={note.content} />}
      </div>
      {!!(note.relatedProjects?.length || note.relatedTools?.length) && (
        <aside aria-label="相關內容" className="mt-10 space-y-4 border-t border-[#d4d4d8] pt-6 dark:border-[#303036]">
          <h2 className="text-xl font-semibold">相關內容</h2>
          <ul className="space-y-3 break-words text-sm">
            {note.relatedProjects?.map((slug) => <li key={`project-${slug}`}><Link href={`/projects/${encodeURIComponent(slug)}`} className="text-blue-700 underline underline-offset-4 dark:text-blue-300">專案：{slug}</Link></li>)}
            {note.relatedTools?.map((slug) => <li key={`tool-${slug}`}><Link href={`/tools/${encodeURIComponent(slug)}`} className="text-blue-700 underline underline-offset-4 dark:text-blue-300">工具：{slug}</Link></li>)}
          </ul>
        </aside>
      )}
    </article>
  );
}
