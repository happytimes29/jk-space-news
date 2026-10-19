import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotesPage } from "@/components/pages/NotesPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCALES, localeFromSegment } from "@/lib/i18n/locales";
import { buildLocalizedMetadata } from "@/lib/seo";

interface Props { params: Promise<{ locale: string }>; searchParams: Promise<{ type?: string | string[] }> }
function resolve(segment: string) { const locale = localeFromSegment(segment); if (!locale || locale === "zh-TW") notFound(); return locale; }
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> { const locale = resolve((await params).locale); const copy = getDictionary(locale).collections; return buildLocalizedMetadata({ locale, pathname: "/notes", title: copy.notesTitle, description: copy.notesDescription, availableLocales: LOCALES }); }
export default async function LocalizedNotesRoute({ params, searchParams }: Props) { return NotesPage({ locale: resolve((await params).locale), searchParams }); }
