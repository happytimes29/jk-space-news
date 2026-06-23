import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { NewsItem, timeAgo } from "@/lib/news";

interface NewsCardProps {
  news: NewsItem;
  featured?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  "AI": "text-[#2E5BFF] dark:text-[#7EA0FF] border-[#2E5BFF]/25 dark:border-[#7EA0FF]/25 bg-[#2E5BFF]/10 dark:bg-[#7EA0FF]/10",
  "科技": "text-[#7D4CFF] dark:text-[#B59CFF] border-[#7D4CFF]/25 dark:border-[#B59CFF]/25 bg-[#7D4CFF]/10 dark:bg-[#B59CFF]/10",
  "金融": "text-[#23845F] dark:text-[#70D6A5] border-[#23845F]/25 dark:border-[#70D6A5]/25 bg-[#23845F]/10 dark:bg-[#70D6A5]/10",
  "金融理財": "text-[#23845F] dark:text-[#70D6A5] border-[#23845F]/25 dark:border-[#70D6A5]/25 bg-[#23845F]/10 dark:bg-[#70D6A5]/10",
  "創業": "text-[#FF7A1C] dark:text-[#FF9A4D] border-[#FF7A1C]/25 dark:border-[#FF9A4D]/25 bg-[#FF7A1C]/10 dark:bg-[#FF9A4D]/10",
  "隨機": "text-[#FF7A1C] dark:text-[#FF9A4D] border-[#FF7A1C]/25 dark:border-[#FF9A4D]/25 bg-[#FF7A1C]/10 dark:bg-[#FF9A4D]/10",
};

function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category] || "text-[var(--color-muted)] border-[var(--color-border)] bg-[var(--color-card-hover)]";
}

function CategoryPill({ category }: { category: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none ${getCategoryStyle(category)}`}
    >
      {category}
    </span>
  );
}

export function NewsCard({ news, featured = false }: NewsCardProps) {
  if (featured) {
    return (
      <Link href={`/news/${news.slug}`} className="block group">
        <article
          className={`relative overflow-hidden rounded-2xl bg-[var(--color-card)] transition-colors duration-300 ${
            news.hot ? "hot-card-glow" : "border border-[var(--color-border)] hover:border-[var(--color-accent)]/30"
          }`}
        >
          {/* Cover image */}
          <div className="relative aspect-[16/7] w-full overflow-hidden">
            <Image
              src={news.coverImage}
              alt={news.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1280px) 100vw, 1152px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            {/* Hot badge */}
            {news.hot && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-card)]/85 border border-[var(--color-border)] backdrop-blur-sm">
                <span className="pulse-dot" />
                <span className="text-xs text-[var(--color-accent)] font-medium">重大突破</span>
              </div>
            )}

            {/* Category */}
            <div className="absolute top-4 right-4">
              <CategoryPill category={news.category} />
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

            <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] leading-tight mb-3 group-hover:text-[var(--color-accent)] transition-colors flex items-start gap-3">
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
              <div className="border border-[var(--color-border)] bg-[var(--color-card-hover)] rounded-2xl p-4 space-y-1.5">
                <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-medium mb-2">
                  TL;DR — 快速摘要
                </p>
                {news.tldr.slice(0, 2).map((point, i) => (
                  <p key={i} className="text-xs text-[var(--color-text)] flex items-start gap-2">
                    <span className="text-[var(--color-muted)] font-bold mt-0.5">•</span>
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
    <Link href={`/news/${news.slug}`} className="mb-5 block break-inside-avoid group">
      <article className="overflow-hidden rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] transition-colors duration-300 hover:border-[var(--color-accent)]/35">
        {/* Cover */}
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={news.coverImage}
            alt={news.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 288px"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          {news.hot && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-card)]/85 border border-[var(--color-border)] backdrop-blur-sm">
              <span className="pulse-dot w-1.5 h-1.5" />
              <span className="text-[10px] text-[var(--color-accent)] font-medium">熱點</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5">
          <div className="mb-3">
            <CategoryPill category={news.category} />
          </div>

          <h3 className="font-semibold text-[15px] text-[var(--color-text)] leading-snug mb-2 group-hover:text-[var(--color-accent)] transition-colors">
            {news.title}
          </h3>

          <p className="text-sm text-[var(--color-muted)] line-clamp-3 mb-4 leading-relaxed">
            {news.excerpt}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-[var(--text-more-muted)]">
            <span>{timeAgo(news.date)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {news.readingTime} 分鐘
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
