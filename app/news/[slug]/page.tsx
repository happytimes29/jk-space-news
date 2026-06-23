import { notFound } from "next/navigation";
import Image from "next/image";
import { getAllNews, getNewsBySlug, getAdjacentNews, formatDate } from "@/lib/news";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TldrBlock } from "@/components/TldrBlock";
import { MDXRenderer } from "@/components/MDXRenderer";
import { Clock, Calendar, Tag, User, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jk-space.com";

export async function generateStaticParams() {
  const news = await getAllNews();
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) return { title: "找不到文章" };

  const ogUrl = `/api/og?title=${encodeURIComponent(news.title)}&category=${encodeURIComponent(news.category)}`;

  return {
    title: news.title,
    description: news.excerpt,
    alternates: {
      canonical: `${siteUrl}/news/${slug}`,
    },
    openGraph: {
      title: news.title,
      description: news.excerpt,
      url: `${siteUrl}/news/${slug}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      type: "article",
      publishedTime: news.date,
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description: news.excerpt,
      images: [ogUrl],
    },
  };
}

export default async function NewsPage({ params }: Props) {
  const { slug } = await params;
  const [news, { prev, next }] = await Promise.all([
    getNewsBySlug(slug),
    getAdjacentNews(slug),
  ]);

  if (!news) notFound();

  return (
    <>
      <ReadingProgress />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors mb-8 group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          返回首頁
        </Link>

        {/* Category + Hot badge */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-tag-bg)] text-[var(--color-tag-text)] font-medium">
            {news.category}
          </span>
          {news.hot && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)]">
              <span className="pulse-dot" />
              <span className="text-xs text-[var(--color-accent)]">重大突破</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] leading-tight tracking-tight mb-6">
          {news.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted)] mb-8 pb-8 border-b border-[var(--color-border)]">
          <span className="flex items-center gap-1.5">
            <User size={12} />
            {news.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {formatDate(news.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {news.readingTime} 分鐘閱讀
          </span>
          {news.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag size={12} />
              {news.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-muted)] bg-[var(--color-card)] text-[10px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cover image */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-10 border border-[var(--color-border)]">
          <Image
            src={news.coverImage}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* TL;DR */}
        {news.tldr.length > 0 && (
          <TldrBlock points={news.tldr} audioUrl={news.audioUrl} />
        )}

        {/* Article body */}
        <div className="prose">
          <MDXRenderer source={news.content} />
        </div>

        {/* Source link */}
        {news.url && (
          <div className="mt-10 py-6 border-t border-b border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-muted)] mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <ExternalLink size={12} />
              來源連結
            </p>
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-accent)] transition-colors break-all hover:underline"
            >
              {news.url}
            </a>
          </div>
        )}

        {/* Tags footer */}
        {news.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-muted)] mb-3 uppercase tracking-wider">標籤</p>
            <div className="flex flex-wrap gap-2">
              {news.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs rounded-full border border-[var(--color-border)] text-[var(--color-muted)] bg-[var(--color-card)] hover:border-[var(--color-accent)]/30 hover:text-[var(--color-accent)] transition-colors cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Previous / Next navigation */}
        <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              {prev && (
                <Link
                  href={`/news/${prev.slug}`}
                  className="group inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform flex-shrink-0" />
                  <span className="truncate">{prev.title}</span>
                </Link>
              )}
            </div>
            <div className="flex-1 text-right">
              {next && (
                <Link
                  href={`/news/${next.slug}`}
                  className="group inline-flex items-center justify-end gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
                >
                  <span className="truncate">{next.title}</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
