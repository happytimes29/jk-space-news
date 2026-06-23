import { NewsItem } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";

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
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
      {articles.map((news) => (
        <NewsCard key={news.slug} news={news} />
      ))}
    </div>
  );
}
