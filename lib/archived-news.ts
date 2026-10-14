import fs from "fs";
import path from "path";
import { cache } from "react";

const ARCHIVED_NEWS_PATH = path.join(process.cwd(), "content/archived-news.json");

export interface ArchivedNewsItem {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  source: string;
  archivePath: string;
}

export const getArchivedNews = cache(async function getArchivedNews(): Promise<ArchivedNewsItem[]> {
  if (!fs.existsSync(ARCHIVED_NEWS_PATH)) return [];

  try {
    const parsed = JSON.parse(fs.readFileSync(ARCHIVED_NEWS_PATH, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("[archived-news] Invalid archived-news.json:", error);
    return [];
  }
});

export async function getArchivedNewsBySlug(slug: string): Promise<ArchivedNewsItem | null> {
  const archived = await getArchivedNews();
  return archived.find((item) => item.slug === slug) ?? null;
}
