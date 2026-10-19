import { notFound } from "next/navigation";
import { ToolsPage } from "@/components/pages/ToolsPage";
import { localeFromSegment } from "@/lib/i18n/locales";

interface Props { params: Promise<{ locale: string }> }
export default async function LocalizedToolsRoute({ params }: Props) { const locale = localeFromSegment((await params).locale); if (!locale || locale === "zh-TW") notFound(); return ToolsPage({ locale }); }
