import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectsPage } from "@/components/pages/ProjectsPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCALES, localeFromSegment } from "@/lib/i18n/locales";
import { buildLocalizedMetadata } from "@/lib/seo";

interface Props { params: Promise<{ locale: string }>; searchParams: Promise<{ area?: string; status?: string }> }
function resolve(segment: string) { const locale = localeFromSegment(segment); if (!locale || locale === "zh-TW") notFound(); return locale; }
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> { const locale = resolve((await params).locale); const copy = getDictionary(locale).collections; return buildLocalizedMetadata({ locale, pathname: "/projects", title: copy.projectsTitle, description: copy.projectsDescription, availableLocales: LOCALES }); }
export default async function LocalizedProjectsRoute({ params, searchParams }: Props) { return ProjectsPage({ locale: resolve((await params).locale), searchParams }); }
