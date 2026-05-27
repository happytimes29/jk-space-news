import Link from "next/link";
import Image from "next/image";
import { Clock, Tag } from "lucide-react";
import { NewsItem, timeAgo } from "@/lib/news";

interface NewsCardProps {
  news: NewsItem;
  featured?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  "AI": "text-[#0070F3] border-[#0070F3]/30 bg-[#0070F3]/5",
  "硬體": "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
  "數位創業": "text-purple-400 border-purple-400/30 bg-purple-400/5",
  "科技": "text-amber-400 border-amber-400/30 bg-amber-400/5",
};

function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category] || "text-[var(--color-muted)] border-[var(--color-border)] bg-[var(--color-card)]";
}

export function NewsCard({ news, featured = false }: NewsCardProps) {
  if (featured) {
    return (
      <Link href={`/news/${news.slug}`} className="block group">
        <article
          className={`relative overflow-hidden rounded-2xl bg-[var(--color-card)] transition-all duration-300 ${
            news.hot ? "hot-card-glow" : "border border-[var(--color-border)] hover:border-[#333]"
          }`}
        >
          {/* Cover image */}
          <div className="relative aspect-[16/7] w-full overflow-hidden">
            <Image
              src={news.coverImage}
              alt={news.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            {/* Hot badge */}
            {news.hot && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-[#0070F3]/30 backdrop-blur-sm">
                <span className="pulse-dot" />
                <span className="text-xs text-[#0070F3] font-medium">重大突破</span>
              </div>
            )}

            {/* Category */}
            <div className="absolute top-4 right-4">
              <span
                className={`text-xs px-2.5 py-1 rounded-full border ${getCategoryStyle(news.category)}`}
              >
                {news.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-3 text-xs text-[var(--color-muted)] mb-3">
              <span>{timeAgo(news.date)}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {news.readingTime} 分鐘閱讀
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] leading-tight mb-3 group-hover:text-white transition-colors flex items-start gap-3">
              {news.hot && (
                <span className="pulse-dot mt-2 flex-shrink-0" />
              )}
              {news.title}
            </h2>

            <p className="text-[var(--color-muted)] text-sm leading-relaxed line-clamp-2 mb-4">
              {news.excerpt}
            </p>

            {/* TL;DR preview */}
            {news.tldr.length > 0 && (
              <div className="border border-[#0070F3]/20 bg-[#0070F3]/5 rounded-lg p-4 space-y-1.5">
                <p className="text-[10px] text-[#0070F3] uppercase tracking-wider font-medium mb-2">
                  TL;DR — 快速摘要
                </p>
                {news.tldr.slice(0, 2).map((point, i) => (
                  <p key={i} className="text-xs text-[var(--color-text)] flex items-start gap-2">
                    <span className="text-[#0070F3] font-bold mt-0.5">·</span>
                    {point}
                  </p>
                ))}
              </div>
            )}
          </div>
        </article>
      </Link>
    );
  }

  // Grid card
  return (
    <Link href={`/news/${news.slug}`} className="block group">
      <article className="h-full rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[#0070F3]/30 transition-all duration-300 overflow-hidden flex flex-col">
        {/* Cover */}
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={news.coverImage}
            alt={news.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />

          {news.hot && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/80 border border-[#0070F3]/30">
              <span className="pulse-dot w-1.5 h-1.5" />
              <span className="text-[10px] text-[#0070F3]">熱點</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-[10px] px-2 py-0.5 rounded border ${getCategoryStyle(news.category)}`}
            >
              {news.category}
            </span>
            <span className="text-[10px] text-[var(--color-muted)] flex items-center gap-1">
              <Clock size={10} />
              {news.readingTime} 分鐘
            </span>
          </div>

          <h3 className="font-semibold text-sm text-[var(--color-text)] leading-snug mb-2 group-hover:text-white transition-colors line-clamp-2 flex-1">
            {news.title}
          </h3>

          <p className="text-xs text-[var(--color-muted)] line-clamp-2 mb-3 leading-relaxed">
            {news.excerpt}
          </p>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--color-border)]">
            <span className="text-[10px] text-[var(--color-muted)]">{timeAgo(news.date)}</span>
            {news.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag size={10} className="text-[var(--color-muted)]" />
                <span className="text-[10px] text-[var(--color-muted)]">{news.tags[0]}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
