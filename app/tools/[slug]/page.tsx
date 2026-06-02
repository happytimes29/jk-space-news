import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllTools, getToolBySlug } from "@/lib/tools";
import { MDXRenderer } from "@/components/MDXRenderer";
import { Calendar, Clock, User, Tag, ChevronLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const tools = await getAllTools();
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return { title: "找不到文章" };
  return {
    title: tool.title,
    description: tool.excerpt,
    openGraph: {
      title: tool.title,
      description: tool.excerpt,
      type: "article",
    },
  };
}

export default async function ToolSlugPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/tools"
        className="inline-flex items-center gap-1.5 text-xs text-[#6e6e73] dark:text-[#888888] hover:text-[#0070F3] transition-colors mb-8 group"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        返回工具列表
      </Link>

      {/* Category badge */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#f59e0b]/10 dark:bg-[#f59e0b]/20 text-[#f59e0b] dark:text-[#fbbf24] font-medium">
          🛠️ {tool.category}
        </span>
        {tool.pricing && (
          <span className="text-xs px-2.5 py-1 rounded-full border border-[#e5e5e7] dark:border-[#1a1a1a] text-[#6e6e73] dark:text-[#888888]">
            {tool.pricing}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] dark:text-[#EDEDED] leading-tight tracking-tight mb-6">
        {tool.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[#6e6e73] dark:text-[#888888] mb-8 pb-8 border-b border-[#e5e5e7] dark:border-[#1a1a1a]">
        <span className="flex items-center gap-1.5">
          <User size={12} />
          {tool.author}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar size={12} />
          {new Date(tool.date).toLocaleDateString("zh-TW")}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={12} />
          {tool.readingTime} 分鐘閱讀
        </span>
        {tool.tags.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Tag size={12} />
            {tool.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded border border-[#e5e5e7] dark:border-[#1a1a1a] text-[10px]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cover */}
      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-10 border border-[#e5e5e7] dark:border-[#1a1a1a]">
        <Image src={tool.coverImage} alt={tool.title} fill className="object-cover" priority />
      </div>

      {/* Content */}
      <div className="prose">
        <MDXRenderer source={tool.content} />
      </div>

      {/* Source link */}
      {tool.url && (
        <div className="mt-10 py-6 border-t border-[#e5e5e7] dark:border-[#1a1a1a]">
          <p className="text-xs text-[#6e6e73] dark:text-[#888888] mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <ExternalLink size={12} />
            官方連結
          </p>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#0070F3] dark:text-[#60a5fa] hover:underline"
          >
            {tool.url}
          </a>
        </div>
      )}
    </article>
  );
}
