import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeFromSegment, localePath } from "@/lib/i18n/locales";

interface Props { params: Promise<{ locale: string }> }
function resolve(segment: string) { const locale = localeFromSegment(segment); if (!locale || locale === "zh-TW") notFound(); return locale; }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const locale = resolve((await params).locale); const dictionary = getDictionary(locale); return { title: dictionary.privacy.title, description: dictionary.privacy.metadataDescription, alternates: { canonical: localePath(locale, "/privacy") } }; }
export default async function LocalizedPrivacyRoute({ params }: Props) { return <PrivacyPage locale={resolve((await params).locale)} />; }
