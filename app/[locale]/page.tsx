import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/pages/HomePage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCALES, localeFromSegment } from "@/lib/i18n/locales";
import { buildLocalizedMetadata } from "@/lib/seo";

interface Props { params: Promise<{ locale: string }> }
function resolve(segment: string) { const locale = localeFromSegment(segment); if (!locale || locale === "zh-TW") notFound(); return locale; }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const locale = resolve((await params).locale); const dictionary = getDictionary(locale); return buildLocalizedMetadata({ locale, pathname: "/", title: dictionary.metadata.homeTitle, description: dictionary.metadata.homeDescription, availableLocales: LOCALES }); }
export default async function LocalizedHomeRoute({ params }: Props) { return HomePage({ locale: resolve((await params).locale) }); }
