import type { Metadata } from "next";
import { NoteDetailPage } from "@/components/pages/NoteDetailPage";
import { contentVisibility } from "@/lib/content/translations";
import { getAllNotes, getNoteBySlug } from "@/lib/notes";
import { siteConfig } from "@/lib/site-config";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getAllNotes({ locale: "zh-TW", visibility: contentVisibility() })).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await getNoteBySlug((await params).slug, { locale: "zh-TW", visibility: contentVisibility() });
  if (!note) return { title: "找不到筆記", robots: { index: false, follow: false } };
  const url = `/notes/${encodeURIComponent(note.slug)}`;
  return {
    title: note.title, description: note.summary,
    alternates: { canonical: url },
    openGraph: {
      siteName: siteConfig.name, locale: "zh_TW",
      title: note.title, description: note.summary, type: "article", url,
      publishedTime: note.publishedAt, modifiedTime: note.updatedAt, authors: [note.author],
      images: [{ url: `/api/og?${new URLSearchParams({ type: "note", title: note.title })}`, width: 1200, height: 630, alt: note.title }],
    },
  };
}

export default async function NotePage({ params }: Props) {
  return NoteDetailPage({ locale: "zh-TW", slug: (await params).slug, visibility: contentVisibility() });
}
