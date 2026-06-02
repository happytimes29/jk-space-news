import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content/interviews");

export interface InterviewItem {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  interviewee: string;
  role: string;
  tags: string[];
  coverImage: string;
  author: string;
  readingTime: number;
  content: string;
  url?: string;
}

function estimateReadingTime(text: string): number {
  const wordsPerMin = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMin));
}

export async function getAllInterviews(): Promise<InterviewItem[]> {
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
      interviewee: data.interviewee || "",
      role: data.role || "",
      tags: data.tags || [],
      coverImage: data.coverImage || "/images/default-cover.svg",
      author: data.author || "JK Space News",
      readingTime: estimateReadingTime(content),
      content,
      url: data.url || undefined,
    } satisfies InterviewItem;
  });
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getInterviewBySlug(slug: string): Promise<InterviewItem | null> {
  const all = await getAllInterviews();
  return all.find((i) => i.slug === slug) ?? null;
}
