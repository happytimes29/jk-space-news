import type { Metadata } from "next";
import { NoteDetailPage } from "@/components/pages/NoteDetailPage";
import { contentVisibility, getTranslationAvailability } from "@/lib/content/translations";
import { getAllNotes, getNoteBySlug } from "@/lib/notes";
import { buildLocalizedMetadata } from "@/lib/seo";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getAllNotes({ locale: "zh-TW", visibility: contentVisibility() })).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const visibility = contentVisibility();
  const note = await getNoteBySlug((await params).slug, { locale: "zh-TW", visibility });
  if (!note) return { title: "找不到筆記", robots: { index: false, follow: false } };
  return buildLocalizedMetadata({ locale: "zh-TW", pathname: `/notes/${encodeURIComponent(note.slug)}`, title: note.title, description: note.summary, availableLocales: getTranslationAvailability("notes", note.slug, visibility), type: "note", publishedTime: note.publishedAt, modifiedTime: note.updatedAt, authors: [note.author] });
}

export default async function NotePage({ params }: Props) {
  return NoteDetailPage({ locale: "zh-TW", slug: (await params).slug, visibility: contentVisibility() });
}
