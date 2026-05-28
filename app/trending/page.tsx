import { Suspense } from "react";
import { getAllNews } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { TrendingUp } from "lucide-react";

export const metadata = {
  title: "趨勢",
  description: "依 科技、金融理財、創業分類的科技趨勢新聞",
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

  const stats = {
    科技: allNews.filter((n) => n.category === "科技").length,
    金融理財: allNews.filter((n) => n.category === "金融理財").length,
    創業: allNews.filter((n) => n.category === "創業").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp size={20} className="text-[#0070F3]" />
          <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-[#EDEDED]">科技趨勢</h1>
        </div>
        <p className="text-sm text-[#6e6e73] dark:text-[#888888] mb-6">
          依分類篩選 科技、金融理財、創業 最新動態
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mb-8">
          {Object.entries(stats).map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-2 text-xs text-[#6e6e73] dark:text-[#888888]">
              <span className="font-medium text-[#1a1a1a] dark:text-[#EDEDED]">{count}</span>
              <span>{cat}</span>
            </div>
          ))}
        </div>

        {/* Filter */}
        <Suspense fallback={<div className="h-10" />}>
          <CategoryFilter />
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
        顯示 {filtered.length} / {allNews.length} 篇文章
      </div>
    </div>
  );
}