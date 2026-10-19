import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPage } from "@/components/pages/ContactPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeFromSegment, localePath } from "@/lib/i18n/locales";

interface Props { params: Promise<{ locale: string }> }
function resolve(segment: string) { const locale = localeFromSegment(segment); if (!locale || locale === "zh-TW") notFound(); return locale; }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const locale = resolve((await params).locale); const dictionary = getDictionary(locale); return { title: dictionary.contact.title, description: dictionary.contact.metadataDescription, alternates: { canonical: localePath(locale, "/contact") } }; }
export default async function LocalizedContactRoute({ params }: Props) { return <ContactPage locale={resolve((await params).locale)} />; }
