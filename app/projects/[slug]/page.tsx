import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { MDXRenderer } from "@/components/MDXRenderer";
import { Calendar, User, Tag, ChevronLeft, Clock } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "找不到專案" };
  return {
    title: project.title,
    description: project.excerpt,
    openGraph: {
      title: project.title,
      description: project.excerpt,
      type: "article",
    },
  };
}

export default async function ProjectSlugPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-xs text-[#6e6e73] dark:text-[#888888] hover:text-[#0070F3] transition-colors mb-8 group"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        返回個人頁
      </Link>

      {/* Category badge */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#0070F3]/10 dark:bg-[#0070F3]/20 text-[#0070F3] dark:text-[#60a5fa] font-medium">
          🛠️ {project.category}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] dark:text-[#EDEDED] leading-tight tracking-tight mb-6">
        {project.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[#6e6e73] dark:text-[#888888] mb-8 pb-8 border-b border-[#e5e5e7] dark:border-[#1a1a1a]">
        <span className="flex items-center gap-1.5">
          <User size={12} />
          {project.author}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar size={12} />
          {new Date(project.date).toLocaleDateString("zh-TW")}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={12} />
          {project.readingTime} 分鐘閱讀
        </span>
        {project.tags.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Tag size={12} />
            {project.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded border border-[#e5e5e7] dark:border-[#1a1a1a] text-[10px]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cover */}
      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-10 border border-[#e5e5e7] dark:border-[#1a1a1a]">
        <Image src={project.coverImage} alt={project.title} fill className="object-contain p-2" priority />
      </div>

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none">
        <MDXRenderer source={project.content} />
      </div>
    </article>
  );
}
