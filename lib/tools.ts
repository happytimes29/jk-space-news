import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content/tools");

export interface ToolItem {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  tags: string[];
  coverImage: string;
  author: string;
  readingTime: number;
  content: string;
  url?: string;
  pricing?: string;
}

function estimateReadingTime(text: string): number {
  const wordsPerMin = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMin));
}

export async function getAllTools(): Promise<ToolItem[]> {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const items = files.map((filename) => {
    const slug = filename.replace(/\.mdx?$/, "");
    const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf-8");
    const { data, content } = matter(raw);
    return {
      slug,
      title: data.title || "無標題",
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      excerpt: data.excerpt || content.slice(0, 120).replace(/[#*\[\]]/g, "") + "…",
      category: data.category || "工具",
      tags: data.tags || [],
      coverImage: data.coverImage || "/images/default-cover.svg",
      author: data.author || "JK Space News",
      readingTime: estimateReadingTime(content),
      content,
      url: data.url || undefined,
      pricing: data.pricing || undefined,
    } satisfies ToolItem;
  });
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getToolBySlug(slug: string): Promise<ToolItem | null> {
  const all = await getAllTools();
  return all.find((t) => t.slug === slug) ?? null;
}
