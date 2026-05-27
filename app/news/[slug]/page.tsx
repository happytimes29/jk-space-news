import { notFound } from "next/navigation";
import Image from "next/image";
import { getAllNews, getNewsBySlug, formatDate } from "@/lib/news";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TldrBlock } from "@/components/TldrBlock";
import { MDXRenderer } from "@/components/MDXRenderer";
import { Clock, Calendar, Tag, User, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

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
    openGraph: {
      title: news.title,
      description: news.excerpt,
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
  const news = await getNewsBySlug(slug);

  if (!news) notFound();

  return (
    <>
      <ReadingProgress />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#888888] hover:text-[#0070F3] transition-colors mb-8 group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          返回首頁
        </Link>

        {/* Category + Hot badge */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs px-2.5 py-1 rounded-full border border-[#0070F3]/30 text-[#0070F3] bg-[#0070F3]/5">
            {news.category}
          </span>
          {news.hot && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#0070F3]/30 bg-black">
              <span className="pulse-dot" />
              <span className="text-xs text-[#0070F3]">重大突破</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-[#EDEDED] leading-tight tracking-tight mb-6">
          {news.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#888888] mb-8 pb-8 border-b border-[#1a1a1a]">
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
                  className="px-2 py-0.5 rounded border border-[#1a1a1a] text-[#888888] bg-[#0A0A0A] text-[10px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cover image */}
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-10 border border-[#1a1a1a]">
          <Image
            src={news.coverImage}
            alt={news.title}
            fill
            className="object-cover grayscale"
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
          <div className="mt-10 py-6 border-t border-b border-[#1a1a1a]">
            <p className="text-xs text-[#888888] mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <ExternalLink size={12} />
              來源連結
            </p>
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#0070F3] hover:text-[#00c8ff] transition-colors break-all hover:underline"
            >
              {news.url}
            </a>
          </div>
        )}

        {/* Tags footer */}
        {news.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#1a1a1a]">
            <p className="text-xs text-[#888888] mb-3 uppercase tracking-wider">標籤</p>
            <div className="flex flex-wrap gap-2">
              {news.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs rounded-full border border-[#1a1a1a] text-[#888888] bg-[#0A0A0A] hover:border-[#0070F3]/30 hover:text-[#0070F3] transition-colors cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
