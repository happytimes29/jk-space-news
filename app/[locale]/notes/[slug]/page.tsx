import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoteDetailPage } from "@/components/pages/NoteDetailPage";
import { contentVisibility } from "@/lib/content/translations";
import { localeConfig, localeFromSegment, localePath, type Locale } from "@/lib/i18n/locales";
import { getAllNotes, getNoteBySlug } from "@/lib/notes";
import { getSiteConfig } from "@/lib/site-config";

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
  const note = await getNoteBySlug(slug, { locale, visibility: contentVisibility() });
  if (!note) return { title: locale === "en" ? "Note not found" : "找不到笔记", robots: { index: false, follow: false } };
  const url = localePath(locale, `/notes/${encodeURIComponent(note.slug)}`);
  return {
    title: note.title, description: note.summary,
    alternates: { canonical: url },
    openGraph: {
      siteName: getSiteConfig(locale).name, locale: localeConfig(locale).ogLocale,
      title: note.title, description: note.summary, type: "article", url,
      publishedTime: note.publishedAt, modifiedTime: note.updatedAt, authors: [note.author],
      images: [{ url: `/api/og?${new URLSearchParams({ type: "note", title: note.title })}`, width: 1200, height: 630, alt: note.title }],
    },
  };
}

export default async function LocalizedNotePage({ params }: Props) {
  const { locale: segment, slug } = await params;
  return NoteDetailPage({ locale: resolve(segment), slug, visibility: contentVisibility() });
}
