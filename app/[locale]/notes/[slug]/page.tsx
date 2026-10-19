import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoteDetailPage } from "@/components/pages/NoteDetailPage";
import { contentVisibility, getTranslationAvailability } from "@/lib/content/translations";
import { localeFromSegment, type Locale } from "@/lib/i18n/locales";
import { getAllNotes, getNoteBySlug } from "@/lib/notes";
import { buildLocalizedMetadata } from "@/lib/seo";

interface Props { params: Promise<{ locale: string; slug: string }> }
interface ParentParams { params: { locale: string } }

function resolve(segment: string): Exclude<Locale, "zh-TW"> {
  const locale = localeFromSegment(segment);
  if (!locale || locale === "zh-TW") notFound();
  return locale;
}

export async function generateStaticParams({ params }: ParentParams) {
  const locale = resolve(params.locale);
  return (await getAllNotes({ locale, visibility: contentVisibility() })).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: segment, slug } = await params;
  const locale = resolve(segment);
  const visibility = contentVisibility();
  const note = await getNoteBySlug(slug, { locale, visibility });
  if (!note) return { title: locale === "en" ? "Note not found" : "找不到笔记", robots: { index: false, follow: false } };
  return buildLocalizedMetadata({ locale, pathname: `/notes/${encodeURIComponent(note.slug)}`, title: note.title, description: note.summary, availableLocales: getTranslationAvailability("notes", note.slug, visibility), type: "note", publishedTime: note.publishedAt, modifiedTime: note.updatedAt, authors: [note.author] });
}

export default async function LocalizedNotePage({ params }: Props) {
  const { locale: segment, slug } = await params;
  return NoteDetailPage({ locale: resolve(segment), slug, visibility: contentVisibility() });
}
