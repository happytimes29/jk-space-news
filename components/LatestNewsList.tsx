import Link from "next/link";
import Image from "next/image";
import { NewsItem } from "@/lib/news";
import { Clock } from "lucide-react";

interface LatestNewsListProps {
  articles: NewsItem[];
}

export function LatestNewsList({ articles }: LatestNewsListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--color-muted)] text-sm">
        文章即將上線，敬請期待。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((news) => (
        <Link
          key={news.slug}
          href={`/news/${news.slug}`}
          className="group flex items-center gap-5 p-3 rounded-2xl hover:bg-[var(--color-card-hover)] transition-all border border-transparent hover:border-[var(--color-border)]"
        >
          {/* Left: thumbnail */}
          <div className="relative w-[120px] h-[80px] sm:w-[140px] sm:h-[90px] flex-shrink-0 rounded-xl overflow-hidden bg-[var(--color-carbon)]">
            <Image
              src={news.coverImage}
              alt={news.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="140px"
            />
          </div>

          {/* Right: content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full border border-[#0070F3]/30 text-[#0070F3] bg-[#0070F3]/10 dark:bg-[#0070F3]/15 dark:text-[#60a5fa]">
                {news.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
                <Clock size={10} />
                {news.readingTime} 分鐘
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-[#1a1a1a] dark:text-[#EDEDED] group-hover:text-[#0070F3] transition-colors line-clamp-2 leading-snug">
              {news.title}
            </h3>
            <p className="text-xs text-[#6e6e73] dark:text-[var(--color-muted)] mt-1.5 line-clamp-1 hidden sm:block">
              {news.excerpt}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}