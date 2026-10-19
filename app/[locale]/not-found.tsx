"use client";

import { useParams } from "next/navigation";
import { NotFoundPage } from "@/components/pages/NotFoundPage";
import { localeFromSegment } from "@/lib/i18n/locales";

export default function LocalizedNotFound() {
  const segment = useParams<{ locale?: string }>().locale ?? "en";
  const locale = localeFromSegment(segment);
  return <NotFoundPage locale={locale && locale !== "zh-TW" ? locale : "en"} />;
}
