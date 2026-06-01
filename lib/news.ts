import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content/news");

export interface NewsItem {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  tags: string[];
  hot: boolean;
  coverImage: string;
  audioUrl?: string;
  author: string;
  readingTime: number;
  tldr: string[];
  content: string;
  url?: string;
  source?: string;
}

function estimateReadingTime(text: string): number {
  const wordsPerMin = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMin));
}

export async function getAllNews(): Promise<NewsItem[]> {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  const news = files.map((filename) => {
    const slug = filename.replace(/\.mdx?$/, "");
    const filePath = path.join(CONTENT_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return {
      slug,
      title: data.title || "無標題",
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      excerpt: data.excerpt || content.slice(0, 120).replace(/[#*\[\]]/g, "") + "…",
      category: data.category || "科技",
      tags: data.tags || [],
      hot: data.hot === true,
      coverImage: data.coverImage || `/images/default-cover.svg`,
      audioUrl: data.audioUrl || undefined,
      author: data.author || "JK Space News",
      readingTime: estimateReadingTime(content),
      tldr: data.tldr || [],
      url: data.url || undefined,
      source: data.source || undefined,
      content,
    } satisfies NewsItem;
  });

  // Sort by date descending
  return news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const all = await getAllNews();
  return all.find((n) => n.slug === slug) ?? null;
}

export async function getNewsByCategory(category: string): Promise<NewsItem[]> {
  const all = await getAllNews();
  if (category === "all") return all;
  return all.filter((n) => n.category === category);
}

export async function getAdjacentNews(slug: string): Promise<{ prev: NewsItem | null; next: NewsItem | null }> {
  const all = await getAllNews();
  const idx = all.findIndex((n) => n.slug === slug);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

export async function getHotNews(): Promise<NewsItem[]> {
  const all = await getAllNews();
  return all.filter((n) => n.hot);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "剛剛";
  if (mins < 60) return `${mins} 分鐘前`;
  if (hours < 24) return `${hours} 小時前`;
  if (days < 7) return `${days} 天前`;
  return formatDate(iso);
}
