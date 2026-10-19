import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects";
import { getAllTools } from "@/lib/tools";
import { getAllNotes } from "@/lib/notes";
import { siteConfig } from "@/lib/site-config";
import { buildSitemapEntries } from "@/lib/seo";
import { LOCALES } from "@/lib/i18n/locales";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projectsByLocale = Object.fromEntries(await Promise.all(LOCALES.map(async (locale) => [locale, await getAllProjects({ locale, visibility: "production" })])));
  const toolsByLocale = Object.fromEntries(await Promise.all(LOCALES.map(async (locale) => [locale, await getAllTools({ locale, visibility: "production" })])));
  const notesByLocale = Object.fromEntries(await Promise.all(LOCALES.map(async (locale) => [locale, await getAllNotes({ locale, visibility: "production" })])));

  return buildSitemapEntries({ baseUrl: siteConfig.url, projectsByLocale, toolsByLocale, notesByLocale });
}
