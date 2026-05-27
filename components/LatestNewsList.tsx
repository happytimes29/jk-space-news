import Link from "next/link";
import Image from "next/image";
import { NewsItem } from "@/lib/news";
import { Clock, Calendar } from "lucide-react";

interface LatestNewsListProps {
  articles: NewsItem[];
}

export function LatestNewsList({ articles }: LatestNewsListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-[#6e6e73] text-sm">
        文章即將上線，敬請期待。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((news) => (
        <Link
          key={news.slug}
          href={`/news/${news.slug}`}
          className="group flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-[#0A0A0A] hover:bg-[#f5f5f7] dark:hover:bg-[#111111] transition-all border border-[#e5e5e7] dark:border-[#1a1a1a]"
        >
          {/* Left: thumbnail */}
          <div className="relative w-[110px] h-[72px] sm:w-[130px] sm:h-[84px] flex-shrink-0 rounded-xl overflow-hidden bg-[#f0f0f0] dark:bg-[#050505]">
            <Image
              src={news.coverImage}
              alt={news.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="130px"
            />
          </div>

          {/* Right: content */}
          <div className="flex-1 min-w-0">
            {/* Category + reading time row */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#0070F3]/10 text-[#0070F3] dark:text-[#60a5fa] dark:bg-[#0070F3]/20 font-medium">
                {news.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#6e6e73] dark:text-[#888888]">
                <Clock size={10} />
                {news.readingTime} 分鐘
              </span>
              <span className="flex items-center gap-1 text-xs text-[#6e6e73] dark:text-[#888888]">
                <Calendar size={10} />
                {news.date}
              </span>
            </div>
            {/* Title - follows theme */}
            <h3 className="text-sm sm:text-base font-semibold text-[#1a1a1a] dark:text-[#EDEDED] group-hover:text-[#0070F3] transition-colors line-clamp-2 leading-snug">
              {news.title}
            </h3>
            {/* Excerpt */}
            <p className="text-xs text-[#6e6e73] dark:text-[#888888] mt-1 line-clamp-1 hidden sm:block">
              {news.excerpt}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}