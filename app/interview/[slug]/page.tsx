import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllInterviews, getInterviewBySlug } from "@/lib/interviews";
import { MDXRenderer } from "@/components/MDXRenderer";
import { Calendar, Clock, User, Tag, ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const interviews = await getAllInterviews();
  return interviews.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getInterviewBySlug(slug);
  if (!item) return { title: "找不到文章" };
  return {
    title: item.title,
    description: item.excerpt,
    openGraph: {
      title: item.title,
      description: item.excerpt,
      type: "article",
    },
  };
}

export default async function InterviewSlugPage({ params }: Props) {
  const { slug } = await params;
  const item = await getInterviewBySlug(slug);
  if (!item) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/interview"
        className="inline-flex items-center gap-1.5 text-xs text-[#6e6e73] dark:text-[#888888] hover:text-[#0070F3] transition-colors mb-8 group"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        返回訪談列表
      </Link>

      {/* Interviewee badge */}
      <div className="flex items-center gap-3 mb-5">
        {item.interviewee && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#0070F3]/10 dark:bg-[#0070F3]/20 text-[#0070F3] dark:text-[#60a5fa] font-medium flex items-center gap-1.5">
            🎙️ {item.interviewee}
          </span>
        )}
        {item.role && (
          <span className="text-xs text-[#6e6e73] dark:text-[#888888]">{item.role}</span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] dark:text-[#EDEDED] leading-tight tracking-tight mb-6">
        {item.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[#6e6e73] dark:text-[#888888] mb-8 pb-8 border-b border-[#e5e5e7] dark:border-[#1a1a1a]">
        <span className="flex items-center gap-1.5">
          <User size={12} />
          {item.author}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar size={12} />
          {new Date(item.date).toLocaleDateString("zh-TW")}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={12} />
          {item.readingTime} 分鐘閱讀
        </span>
        {item.tags.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Tag size={12} />
            {item.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded border border-[#e5e5e7] dark:border-[#1a1a1a] text-[10px]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cover */}
      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-10 border border-[#e5e5e7] dark:border-[#1a1a1a]">
        <Image src={item.coverImage} alt={item.title} fill className="object-cover" priority />
      </div>

      {/* Content */}
      <div className="prose">
        <MDXRenderer source={item.content} />
      </div>
    </article>
  );
}
