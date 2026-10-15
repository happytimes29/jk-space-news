import Link from "next/link";
import Image from "next/image";
import { getAllTools } from "@/lib/tools";
import { StatusBadge } from "@/components/content/StatusBadge";
import { OpenToolLink } from "@/components/tools/OpenToolLink";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  route: "/tools",
  title: "我做的工具",
  description: "JK Space 開發的工程工具：用途、格式、限制與資料處理方式。",
});

export default async function ToolsPage() {
  const tools = await getAllTools();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">我做的工具</h1>
        <p className="mt-3 text-[var(--color-muted)]">從工程現場的問題出發，做成可以直接使用的工具。先了解格式與限制，再帶入自己的資料。</p>
      </header>
      {tools.length === 0 ? <p>工具準備中。</p> : (
        <div className="grid gap-6">
          {tools.map((tool) => (
            <article key={tool.slug} aria-label={tool.title} className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] md:grid md:grid-cols-2">
              {tool.coverImage && <div className="relative aspect-video"><Image src={tool.coverImage} alt={`${tool.title}操作畫面`} fill className="object-cover" /></div>}
              <div className="p-6">
                <StatusBadge status={tool.status} />
                <h2 className="mt-4 text-xl font-semibold"><Link href={`/tools/${tool.slug}`}>{tool.title}</Link></h2>
                <p className="mt-3 leading-relaxed text-[var(--color-muted)]">{tool.summary}</p>
                <dl className="my-5 space-y-3 text-sm">
                  <div><dt className="font-medium">資料處理</dt><dd>{tool.privacy}</dd></div>
                  <div><dt className="font-medium">輸入格式</dt><dd>{tool.inputTypes.join("、")}</dd></div>
                  <div><dt className="font-medium">輸出結果</dt><dd>{tool.outputTypes.join("、")}</dd></div>
                </dl>
                <div className="flex flex-wrap items-center gap-4">
                  {tool.appUrl && <OpenToolLink slug={tool.slug} href={tool.appUrl}>開啟工具</OpenToolLink>}
                  <Link href={`/tools/${tool.slug}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">工具介紹</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
