import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPage } from "@/components/pages/AboutPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeFromSegment, localePath } from "@/lib/i18n/locales";

interface Props { params: Promise<{ locale: string }> }
function resolve(segment: string) { const locale = localeFromSegment(segment); if (!locale || locale === "zh-TW") notFound(); return locale; }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const locale = resolve((await params).locale); const dictionary = getDictionary(locale); return { title: dictionary.about.title, description: dictionary.about.metadataDescription, alternates: { canonical: localePath(locale, "/about") } }; }
export default async function LocalizedAboutRoute({ params }: Props) { return <AboutPage locale={resolve((await params).locale)} />; }
