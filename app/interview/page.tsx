import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllInterviews } from "@/lib/interviews";
import { Mic, Calendar, ArrowRight, Clock } from "lucide-react";

export const metadata = {
  title: "訪談",
  description: "與科技創業者、工程師、分析師的深度對話 — JK Space News",
};

export const revalidate = 60;

export default async function InterviewPage() {
  const interviews = await getAllInterviews();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Mic size={20} className="text-[#0070F3]" />
          <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-[#EDEDED]">訪談</h1>
        </div>
        <p className="text-sm text-[#6e6e73] dark:text-[#888888]">
          與科技創業者、工程師、分析師的深度對話 — 共 {interviews.length} 篇
        </p>
      </div>

      {/* List */}
      {interviews.length === 0 ? (
        <div className="text-center py-20 text-[#6e6e73] dark:text-[#888888] text-sm border border-[#e5e5e7] dark:border-[#1a1a1a] rounded-2xl">
          <Mic size={32} className="mx-auto mb-3 opacity-30" />
          <p>訪談文章準備中，敬請期待。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {interviews.map((item) => (
            <Link
              key={item.slug}
              href={`/interview/${item.slug}`}
              className="block group"
            >
              <article className="flex flex-col sm:flex-row gap-5 p-6 rounded-xl border border-[#e5e5e7] dark:border-[#1a1a1a] bg-[var(--color-card)] hover:border-[#0070F3]/30 transition-all duration-300">
                {/* Cover */}
                <div className="relative w-full sm:w-48 aspect-[16/10] sm:aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {item.interviewee && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#0070F3]/10 dark:bg-[#0070F3]/20 text-[#0070F3] dark:text-[#60a5fa] font-medium">
                        🎙️ {item.interviewee}
                      </span>
                    )}
                    {item.role && (
                      <span className="text-[10px] text-[#6e6e73] dark:text-[#888888]">
                        {item.role}
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-[#1a1a1a] dark:text-[#EDEDED] leading-snug mb-2 group-hover:text-[#0070F3] dark:group-hover:text-[#60a5fa] transition-colors line-clamp-2">
                    {item.title}
                  </h2>

                  <p className="text-xs text-[#6e6e73] dark:text-[#888888] leading-relaxed line-clamp-2 mb-3">
                    {item.excerpt}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-[#6e6e73] dark:text-[#888888]">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(item.date).toLocaleDateString("zh-TW")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {item.readingTime} 分鐘
                    </span>
                    <span className="flex items-center gap-1 ml-auto text-[#0070F3] dark:text-[#60a5fa] text-[10px] group-hover:underline">
                      閱讀全文
                      <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
