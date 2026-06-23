"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { NewsItem } from "@/lib/news";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";

interface HeroCarouselProps {
  articles: NewsItem[];
  autoPlayInterval?: number; // seconds
}

export function HeroCarousel({ articles, autoPlayInterval = 5 }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % articles.length);
  }, [articles.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + articles.length) % articles.length);
  }, [articles.length]);

  useEffect(() => {
    if (articles.length <= 1) return;
    const timer = setInterval(next, autoPlayInterval * 1000);
    return () => clearInterval(timer);
  }, [articles.length, autoPlayInterval, next]);

  if (articles.length === 0) return null;

  const news = articles[current];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
      {/* Image area */}
      <div className="relative aspect-[16/7] w-full">
        <Image
          src={news.coverImage}
          alt={news.title}
          fill
          className="object-cover transition-opacity duration-500"
          sizes="(max-width: 1280px) 100vw, 1152px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Category */}
        <div className="absolute top-4 right-4">
          <span className="text-xs px-2.5 py-1 rounded-full border border-white/20 text-white bg-black/35 backdrop-blur-sm">
            {news.category}
          </span>
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-2 leading-tight">
            {news.title}
          </h2>
          <p className="text-sm text-gray-300 mb-3 line-clamp-1">{news.excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(news.date).toLocaleDateString("zh-TW")}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {news.readingTime} 分鐘
            </span>
            {news.source && (
              <span className="text-white">{news.source}</span>
            )}
          </div>
        </div>
      </div>

      {/* Click to article - only covers content area, not buttons */}
      <Link href={`/news/${news.slug}`} className="absolute inset-0 z-10" aria-label={news.title} />

      {/* Navigation arrows */}
      {articles.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 border border-white/15 text-white/80 hover:text-white hover:bg-black/70 transition-all backdrop-blur-sm z-20"
            aria-label="上一篇"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 border border-white/15 text-white/80 hover:text-white hover:bg-black/70 transition-all backdrop-blur-sm z-20"
            aria-label="下一篇"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots pagination */}
      {articles.length > 1 && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? "w-5 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`第 ${i + 1} 篇`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
