import { getAllNews, getHotNews } from "@/lib/news";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const allNews = await getAllNews();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ─── Hero section label ─── */}
      <div className="flex items-center justify-between mb-10">
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

      {/* ─── Center CTA ─── */}
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0070F3]/10 mb-6">
          <Zap size={28} className="text-[#0070F3]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] dark:text-[#EDEDED] mb-3">
          JK Space News
        </h1>
        <p className="text-sm text-[#6e6e73] dark:text-[#888888] mb-8 max-w-md mx-auto">
          科技、金融、自我成長 — 每日精選三篇深度濃縮。目前共 {allNews.length} 篇文章。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/trending"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0070F3] text-white text-sm font-medium hover:bg-[#0070F3]/90 transition-colors shadow-[0_0_20px_rgba(0,112,243,0.4)]"
          >
            <Zap size={14} />
            瀏覽趨勢
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/interview"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#e5e5e7] dark:border-[#1a1a1a] text-xs text-[#6e6e73] dark:text-[#888888] hover:border-[#0070F3]/30 hover:text-[#0070F3] transition-all duration-200 bg-white dark:bg-[#0A0A0A]"
          >
            訪談
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#e5e5e7] dark:border-[#1a1a1a] text-xs text-[#6e6e73] dark:text-[#888888] hover:border-[#0070F3]/30 hover:text-[#0070F3] transition-all duration-200 bg-white dark:bg-[#0A0A0A]"
          >
            工具推薦
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
