import Link from "next/link";
import { NewsItem } from "@/lib/news";
import { Clock, Tag } from "lucide-react";

interface LatestNewsListProps {
  articles: NewsItem[];
}

export function LatestNewsList({ articles }: LatestNewsListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-[#888888] text-sm">
        文章即將上線，敬請期待。
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {articles.map((news) => (
        <Link
          key={news.slug}
          href={`/news/${news.slug}`}
          className="group flex items-start gap-4 px-4 py-4 rounded-xl hover:bg-[#0f0f0f] transition-colors"
        >
          {/* Left: date column */}
          <div className="flex flex-col items-center min-w-[48px] pt-0.5">
            <span className="text-xs text-[#555555] font-mono">
              {new Date(news.date).toLocaleDateString("zh-TW", {
                month: "2-digit",
                day: "2-digit",
              })}
            </span>
            <span className="text-lg font-bold text-[#333333] leading-none mt-0.5">
              {new Date(news.date).getFullYear() === new Date().getFullYear()
                ? ""
                : new Date(news.date).getFullYear()}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px bg-[#1a1a1a] self-stretch" />

          {/* Right: content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full border border-[#0070F3]/30 text-[#0070F3] bg-[#0070F3]/5">
                {news.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#555555]">
                <Clock size={10} />
                {news.readingTime} 分鐘
              </span>
            </div>
            <h3 className="text-sm font-medium text-[#EDEDED] group-hover:text-[#0070F3] transition-colors line-clamp-2 leading-snug">
              {news.title}
            </h3>
            <p className="text-xs text-[#555555] mt-1 line-clamp-1 hidden sm:block">
              {news.excerpt}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
