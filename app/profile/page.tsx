import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Bot,
  Cpu,
  RadioTower,
  Sparkles,
  Zap,
  ExternalLink,
  Newspaper,
  HardDrive,
  Workflow,
  Blocks,
  Microchip,
} from "lucide-react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jk-space.com";

export const metadata: Metadata = {
  title: "JK Space — 個人頁",
  description:
    "15+ 年高頻電路與系統架構經驗，聚焦 AI 自動化、n8n、Dify 與獨立產品實驗。",
  alternates: {
    canonical: `${siteUrl}/profile`,
  },
  openGraph: {
    title: "JK Space — Hardware R&D × AI Automation",
    description: "解構硬體邊界，賦能 AI 自動化未來。",
    url: `${siteUrl}/profile`,
    type: "profile",
  },
};

const stats = [
  { value: "15+", label: "年硬體研發" },
  { value: "AI", label: "自動化工作流" },
  { value: "4+", label: "核心技術領域" },
];

const projects = [
  {
    icon: Newspaper,
    title: "JK Space News",
    desc: "AI 驅動的新聞聚合平台。自動爬取、DeepSeek 改寫、圖像生成，每 30 分鐘一篇文章，全自動部署至 Vercel。",
    tags: ["Next.js", "DeepSeek", "ComfyUI", "Vercel", "n8n"],
    href: "https://jk-space.com",
  },
  {
    icon: HardDrive,
    title: "TIFA 加密備份系統",
    desc: "macOS 每日自動加密 USB 備份。FileVault 驗證、rsync 差異同步、自動輪替保留最近 3 次備份。",
    tags: ["Shell", "rsync", "FileVault", "cron"],
  },
  {
    icon: Workflow,
    title: "TrendRadar Pipeline",
    desc: "完整的新聞生產線。RSS 監控 → SQLite 儲存 → DeepSeek 摘要 → Agnes/ComfyUI 配圖 → git push → Vercel 部署。",
    tags: ["Python", "DeepSeek", "SQLite", "Agnes AI"],
  },
  {
    icon: Blocks,
    title: "n8n 自動化工作流",
    desc: "多套跨平台自動化：YT→Sheet 同步、Telegram 通知代理、RSS 排程擷取、Google Sheets 日報生產線。",
    tags: ["n8n", "Python", "Google Sheets", "Telegram"],
  },
  {
    icon: Microchip,
    title: "PCB 測試點自動比對工具",
    desc: "硬體改版時，比對新舊 OrCAD 報表中的測試點座標，自動標示 Unchanged / Moved / Added / Removed。支援 DXF 板框疊圖、白名單篩選、mil↔mm 座標對齊。完全在瀏覽器端運算，確保 CAD 資料不外流。",
    tags: ["Next.js", "OrCAD", "DXF", "Canvas", "Claude Code"],
    detail: "在 AI (Claude Code) 協助開發的過程中，克服了幾個硬體領域的經典課題：報表結構解析、全板資料過濾、DXF 座標系對齊（mil vs mm 縮放 39.37x）、以及開發環境的無痛化。專案完全 client-side 運作，所有 CAD 資料不出瀏覽器。",
    images: ["/images/pcb-tool-1.png", "/images/pcb-tool-2.png"],
  },
];

const focusAreas = [
  {
    icon: RadioTower,
    title: "硬體系統與高頻電路",
    text: "從 RF、BMS 到系統架構，把硬體邊界條件轉成可落地的工程決策。",
  },
  {
    icon: Bot,
    title: "AI 自動化工作流",
    text: "以 n8n、Dify、代理式工具串接資料、內容、流程與產品原型。",
  },
  {
    icon: Cpu,
    title: "獨立產品實驗",
    text: "用快速原型驗證需求，將技術洞察轉成可持續迭代的數位服務。",
  },
];

export default function ProfilePage() {
  return (
    <div className="bg-black text-[#EDEDED]">
      <section className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-70" />
        <div className="absolute left-1/2 top-20 h-80 w-[min(760px,90vw)] -translate-x-1/2 rounded-full bg-[#0070F3]/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center py-24 text-center sm:py-32">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#0070F3]/30 bg-[#0070F3]/10 px-4 py-1.5 text-xs font-medium text-[#60a5fa]">
            <Sparkles size={13} />
            Hardware R&D × AI Automation
          </div>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
            解構硬體邊界，
            <br />
            <span className="bg-gradient-to-r from-[#60a5fa] to-[#00e5ff] bg-clip-text text-transparent">
              賦能 AI 自動化未來
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#a1a1aa] sm:text-lg">
            15+ 年高頻電路與系統架構淬鍊，聚焦 n8n / Dify 智慧代理網絡，
            探索獨立商業化與技術變現的數位空間。
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-[#0070F3] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(0,112,243,0.35)] transition hover:bg-[#1a7ff5]"
            >
              聯絡合作
            </Link>
          </div>

          <div className="mt-16 grid w-full max-w-2xl grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-mono text-2xl font-bold text-[#60a5fa] sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-[#888888] sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center gap-3">
            <Zap size={16} className="text-[#0070F3]" />
            <h2 className="text-lg font-semibold">核心領域</h2>
            <div className="h-px flex-1 bg-[#1a1a1a]" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {focusAreas.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-lg border border-[#1a1a1a] bg-[#0A0A0A] p-6 transition hover:border-[#0070F3]/40 hover:bg-[#111111]"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-[#0070F3]/25 bg-[#0070F3]/10 text-[#60a5fa]">
                  <Icon size={18} />
                </div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#888888]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 實作專案 */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center gap-3">
            <ExternalLink size={16} className="text-[#0070F3]" />
            <h2 className="text-lg font-semibold">實作專案</h2>
            <div className="h-px flex-1 bg-[#1a1a1a]" />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {projects.map(({ icon: Icon, title, desc, tags, href, detail, images }) => (
              <article
                key={title}
                className={`group rounded-lg border border-[#1a1a1a] bg-[#0A0A0A] p-6 transition hover:border-[#0070F3]/40 hover:bg-[#111111] ${
                  images ? "md:col-span-2" : ""
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#0070F3]/25 bg-[#0070F3]/10 text-[#60a5fa]">
                    <Icon size={18} />
                  </div>
                  {href && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#555555] transition group-hover:text-[#60a5fa]"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#888888]">{desc}</p>
                {detail && (
                  <p className="mt-3 text-sm leading-relaxed text-[#666666] border-l-2 border-[#0070F3]/30 pl-3 italic">
                    {detail}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-[#1a1a1a] bg-[#141414] px-2.5 py-0.5 text-xs font-medium text-[#a1a1aa]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {images && (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {images.map((src, i) => (
                      <a
                        key={src}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-video overflow-hidden rounded-lg border border-[#1a1a1a] bg-[#141414] transition hover:border-[#0070F3]/40"
                      >
                        <Image
                          src={src}
                          alt={`${title} 截圖 ${i + 1}`}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
