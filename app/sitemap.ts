import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects";
import { getAllTools } from "@/lib/tools";
import { getAllNotes } from "@/lib/notes";
import { siteConfig } from "@/lib/site-config";
import { buildSitemapEntries } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, tools, notes] = await Promise.all([getAllProjects(), getAllTools(), getAllNotes()]);

  return buildSitemapEntries({ baseUrl: siteConfig.url, projects, tools, notes });
}
