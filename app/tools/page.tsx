import Link from "next/link";
import Image from "next/image";
import { getAllTools } from "@/lib/tools";
import { Wrench, Calendar, ArrowRight, Clock, Tag } from "lucide-react";

export const metadata = {
  title: "工具推薦",
  description: "開發工具、AI 工具、效率工具評測與推薦 — JK Space News",
};

export const revalidate = 60;

export default async function ToolsPage() {
  const tools = await getAllTools();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Wrench size={20} className="text-[#0070F3]" />
          <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-[#EDEDED]">工具推薦</h1>
        </div>
        <p className="text-sm text-[#6e6e73] dark:text-[#888888]">
          AI 工具、開發工具、效率工具評測與推薦 — 共 {tools.length} 篇
        </p>
      </div>

      {/* Grid */}
      {tools.length === 0 ? (
        <div className="text-center py-20 text-[#6e6e73] dark:text-[#888888] text-sm border border-[#e5e5e7] dark:border-[#1a1a1a] rounded-2xl">
          <Wrench size={32} className="mx-auto mb-3 opacity-30" />
          <p>工具文章準備中，敬請期待。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`} className="block group">
              <article className="h-full rounded-xl bg-[var(--color-card)] border border-[#e5e5e7] dark:border-[#1a1a1a] hover:border-[#0070F3]/30 transition-all duration-300 overflow-hidden flex flex-col">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={tool.coverImage}
                    alt={tool.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] px-2 py-0.5 rounded border text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/5">
                      {tool.category}
                    </span>
                    {tool.pricing && (
                      <span className="text-[10px] text-[#6e6e73] dark:text-[#888888]">
                        {tool.pricing}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--color-text)] leading-snug mb-2 group-hover:text-white transition-colors line-clamp-2 flex-1">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] line-clamp-2 mb-3 leading-relaxed">
                    {tool.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--color-border)]">
                    <span className="text-[10px] text-[var(--color-muted)] flex items-center gap-1">
                      <Clock size={10} />
                      {tool.readingTime} 分鐘
                    </span>
                    {tool.tags.length > 0 && (
                      <span className="text-[10px] text-[var(--color-muted)] flex items-center gap-1">
                        <Tag size={10} />
                        {tool.tags[0]}
                      </span>
                    )}
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
