import { getAllNews, getHotNews } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";
import { ArrowRight, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // ISR every 60s

export default async function HomePage() {
  const [allNews, hotNews] = await Promise.all([getAllNews(), getHotNews()]);

  const headline = hotNews[0] ?? allNews[0];
  const gridNews = allNews.filter((n) => n.slug !== headline?.slug).slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ─── Hero section label ─── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0070F3]/30 bg-[#0070F3]/5">
            <span className="pulse-dot" />
            <span className="text-xs text-[#0070F3] font-medium">24H 科技熱點頭條</span>
          </div>
        </div>
        <Link
          href="/trending"
          className="flex items-center gap-1.5 text-xs text-[#888888] hover:text-[#0070F3] transition-colors group"
        >
          查看全部趨勢
          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ─── Featured / Hot headline ─── */}
      {headline ? (
        <div className="mb-12">
          <NewsCard news={headline} featured />
        </div>
      ) : (
        <div className="mb-12 rounded-2xl border border-[#1a1a1a] bg-[#0A0A0A] p-12 text-center">
          <p className="text-[#888888] text-sm">尚無文章，請新增 content/news/ 下的 Markdown 檔案</p>
        </div>
      )}

      {/* ─── Latest news grid ─── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp size={16} className="text-[#0070F3]" />
          <h2 className="font-semibold text-[#EDEDED]">最新情報</h2>
          <div className="flex-1 h-px bg-[#1a1a1a]" />
          <span className="text-xs text-[#888888]">{allNews.length} 篇文章</span>
        </div>

        {gridNews.length === 0 ? (
          <div className="text-center py-16 text-[#888888] text-sm">
            文章即將上線，敬請期待。
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gridNews.map((news) => (
              <NewsCard key={news.slug} news={news} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Bottom CTA ─── */}
      {allNews.length > 7 && (
        <div className="mt-12 text-center">
          <Link
            href="/trending"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#1a1a1a] text-sm text-[#888888] hover:text-[#EDEDED] hover:border-[#333] transition-all duration-200 bg-[#0A0A0A]"
          >
            <Zap size={14} className="text-[#0070F3]" />
            查看所有 {allNews.length} 篇文章
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
