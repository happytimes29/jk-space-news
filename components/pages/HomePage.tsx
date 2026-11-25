import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { getSiteConfig } from "@/lib/site-config";
import { SignalHome } from "@/components/home/SignalHome";
import { JsonLd } from "@/components/JsonLd";
import { personJsonLd, websiteJsonLd } from "@/lib/seo";
import { getProjectBySlug } from "@/lib/projects";
import { getAllTools } from "@/lib/tools";

export async function HomePage({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const config = getSiteConfig(locale);
  const query = { locale, visibility: "production" } as const;
  const [tools, pcbProject] = await Promise.all([
    getAllTools(query),
    getProjectBySlug("pcb-test-point-comparison", query),
  ]);

  return (
    <>
      <JsonLd data={personJsonLd(locale, config)} />
      <JsonLd data={websiteJsonLd(locale, config)} />
      <SignalHome locale={locale} dictionary={dictionary} tools={tools} pcbProject={pcbProject} />
    </>
  );
}
