import type { MetadataRoute } from "next";
import { getAllNews } from "@/lib/news";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jk-space.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const news = await getAllNews();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/contact",
    "/interview",
    "/privacy",
    "/tools",
    "/trending",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const newsRoutes: MetadataRoute.Sitemap = news.map((item) => ({
    url: `${siteUrl}/news/${item.slug}`,
    lastModified: new Date(item.date),
  }));

  return [...staticRoutes, ...newsRoutes];
}
