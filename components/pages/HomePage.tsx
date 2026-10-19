import { getFeaturedProjects } from "@/lib/projects";
import { getFeaturedTool } from "@/lib/tools";
import { getRecentNotes } from "@/lib/notes";
import { loadNow } from "@/lib/now";
import { selectHomeContent } from "@/lib/home";
import { contentVisibility } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { getSiteConfig } from "@/lib/site-config";
import { HomePageContent } from "@/components/home/HomePageContent";
import { JsonLd } from "@/components/JsonLd";
import { personJsonLd, websiteJsonLd } from "@/lib/seo";

export async function HomePage({ locale }: { locale: Locale }) {
  const visibility = contentVisibility();
  const dictionary = getDictionary(locale);
  const config = getSiteConfig(locale);
  const query = { locale, visibility } as const;
  const [projects, tool, notes] = await Promise.all([
    getFeaturedProjects(4, query),
    getFeaturedTool(query),
    getRecentNotes(3, query),
  ]);
  const authoredNow = loadNow();
  const now = {
    updatedAt: authoredNow.updatedAt,
    content: locale === "zh-TW" ? authoredNow.content : dictionary.home.nowContent,
  };

  return (
    <>
      <JsonLd data={personJsonLd(config)} />
      <JsonLd data={websiteJsonLd(config)} />
      <HomePageContent
        {...selectHomeContent(projects, tool ? [tool] : [], notes)}
        now={now}
        locale={locale}
        dictionary={dictionary}
      />
    </>
  );
}
