import { notFound } from "next/navigation";
import { ProjectsPage } from "@/components/pages/ProjectsPage";
import { localeFromSegment } from "@/lib/i18n/locales";

interface Props { params: Promise<{ locale: string }>; searchParams: Promise<{ area?: string; status?: string }> }
export default async function LocalizedProjectsRoute({ params, searchParams }: Props) { const locale = localeFromSegment((await params).locale); if (!locale || locale === "zh-TW") notFound(); return ProjectsPage({ locale, searchParams }); }
