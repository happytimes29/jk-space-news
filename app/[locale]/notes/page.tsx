import { notFound } from "next/navigation";
import { NotesPage } from "@/components/pages/NotesPage";
import { localeFromSegment } from "@/lib/i18n/locales";

interface Props { params: Promise<{ locale: string }>; searchParams: Promise<{ type?: string | string[] }> }
export default async function LocalizedNotesRoute({ params, searchParams }: Props) { const locale = localeFromSegment((await params).locale); if (!locale || locale === "zh-TW") notFound(); return NotesPage({ locale, searchParams }); }
