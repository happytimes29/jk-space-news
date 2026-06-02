import { Suspense } from "react";
import { getAllNews } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { TrendingUp } from "lucide-react";
import type { FilterOption } from "@/components/CategoryFilter";

export const metadata = {
  title: "趨勢",
  description: "依分類篩選科技、金融理財最新動態",
};

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ cat?: string; tag?: string }>;
}

export default async function TrendingPage({ searchParams }: Props) {
  const { cat, tag } = await searchParams;
  const category = cat || "all";
  const selectedTag = tag || null;

  const allNews = await getAllNews();
  const filtered = allNews.filter((n) => {
    const matchCat = category === "all" || n.category === category;
    const matchTag = !selectedTag || n.tags.includes(selectedTag);
    return matchCat && matchTag;
  });

  // Dynamic categories from actual articles
  const catCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  for (const n of allNews) {
    catCounts[n.category] = (catCounts[n.category] || 0) + 1;
    for (const t of n.tags) {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
  }

  // Skip generic tags that appear on everything
  const GENERIC_TAGS = new Set(["AI", "科技", "趨勢"]);
  const categories: FilterOption[] = Object.entries(catCounts)
    .filter(([_, count]) => count > 0)
    .map(([cat, count]) => ({
      value: cat,
      label: cat,
      count,
      type: "category" as const,
    }))
    .sort((a, b) => b.count - a.count);

  const topTags: FilterOption[] = Object.entries(tagCounts)
    .filter(([tag, count]) => !GENERIC_TAGS.has(tag) && count >= 2)
    .map(([tag, count]) => ({
      value: tag,
      label: tag,
      count,
      type: "tag" as const,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // top 10 non-generic tags

  // Total articles count across all categories
  const totalArticles = allNews.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp size={20} className="text-[#0070F3]" />
          <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-[#EDEDED]">科技趨勢</h1>
        </div>
        <p className="text-sm text-[#6e6e73] dark:text-[#888888] mb-6">
          分類瀏覽最新文章 — 共 {totalArticles} 篇
        </p>

        {/* Filter */}
        <Suspense fallback={<div className="h-24" />}>
          <CategoryFilter categories={categories} topTags={topTags} />
        </Suspense>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#6e6e73] dark:text-[#888888] text-sm border border-[#e5e5e7] dark:border-[#1a1a1a] rounded-2xl">
          此分類暫無文章。
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((news) => (
            <NewsCard key={news.slug} news={news} />
          ))}
        </div>
      )}

      {/* Count */}
      <div className="mt-8 text-center text-xs text-[#6e6e73] dark:text-[#888888]">
        顯示 {filtered.length} / {totalArticles} 篇文章
      </div>
    </div>
  );
}
