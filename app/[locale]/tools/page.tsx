import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolsPage } from "@/components/pages/ToolsPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCALES, localeFromSegment } from "@/lib/i18n/locales";
import { buildLocalizedMetadata } from "@/lib/seo";

interface Props { params: Promise<{ locale: string }> }
function resolve(segment: string) { const locale = localeFromSegment(segment); if (!locale || locale === "zh-TW") notFound(); return locale; }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const locale = resolve((await params).locale); const copy = getDictionary(locale).collections; return buildLocalizedMetadata({ locale, pathname: "/tools", title: copy.toolsTitle, description: copy.toolsDescription, availableLocales: LOCALES }); }
export default async function LocalizedToolsRoute({ params }: Props) { return ToolsPage({ locale: resolve((await params).locale) }); }
