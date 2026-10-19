import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/pages/HomePage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeFromSegment, localePath } from "@/lib/i18n/locales";

interface Props { params: Promise<{ locale: string }> }
function resolve(segment: string) { const locale = localeFromSegment(segment); if (!locale || locale === "zh-TW") notFound(); return locale; }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const locale = resolve((await params).locale); const dictionary = getDictionary(locale); return { title: dictionary.metadata.homeTitle, description: dictionary.metadata.homeDescription, alternates: { canonical: localePath(locale, "/") } }; }
export default async function LocalizedHomeRoute({ params }: Props) { return HomePage({ locale: resolve((await params).locale) }); }
