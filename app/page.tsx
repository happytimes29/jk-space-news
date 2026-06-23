import { getAllNews, getHotNews } from "@/lib/news";
import { LatestNewsList } from "@/components/LatestNewsList";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // ISR every 60s

export default async function HomePage() {
  const [allNews, hotNews] = await Promise.all([getAllNews(), getHotNews()]);

  // Latest news: all articles sorted by date, newest first
  const latestNews = allNews
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);
  // Carousel: top 5 most recent articles
  const carouselArticles = latestNews.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ─── Hero section label ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <p className="mb-2 text-xs font-semibold text-[var(--color-accent)]">24H 科技熱點頭條</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text)]">
            JK Space News
          </h1>
        </div>
        <Link
          href="/trending"
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors group"
        >
          查看全部趨勢
          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ─── Hero Carousel ─── */}
      <div className="mb-12">
        <HeroCarousel articles={carouselArticles} autoPlayInterval={5} />
      </div>

      {/* ─── Latest news grid ─── */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold text-[var(--color-accent)] mb-1">Latest</p>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">最新情報</h2>
          </div>
          <span className="text-xs text-[var(--color-muted)]">{allNews.length} 篇文章</span>
        </div>

        <LatestNewsList articles={latestNews} />
      </section>

      {/* ─── Bottom CTA ─── */}
      {allNews.length > 7 && (
        <div className="mt-12 text-center">
          <Link
            href="/trending"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--color-border)] text-xs text-[var(--color-muted)] hover:border-[var(--color-accent)]/30 hover:text-[var(--color-accent)] transition-colors duration-200 bg-[var(--color-card)]"
          >
            查看所有 {allNews.length} 篇文章
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
