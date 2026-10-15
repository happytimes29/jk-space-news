import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects";
import { getAllTools } from "@/lib/tools";
import { getAllNotes } from "@/lib/notes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jk-space.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, tools, notes] = await Promise.all([getAllProjects(), getAllTools(), getAllNotes()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/contact",
    "/privacy",
    "/projects",
    "/tools",
    "/notes",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const contentRoutes: MetadataRoute.Sitemap = [
    ...projects.map((item) => ({ url: `${siteUrl}/projects/${item.slug}`, lastModified: new Date(item.updatedAt) })),
    ...tools.map((item) => ({ url: `${siteUrl}/tools/${item.slug}`, lastModified: new Date(item.updatedAt) })),
    ...notes.map((item) => ({ url: `${siteUrl}/notes/${item.slug}`, lastModified: new Date(item.updatedAt) })),
  ];

  return [...staticRoutes, ...contentRoutes];
}
