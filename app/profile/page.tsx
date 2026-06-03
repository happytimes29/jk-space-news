import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Cpu,
  Mail,
  MessageSquare,
  RadioTower,
  Sparkles,
  Zap,
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
  { value: "100", label: "AI Apps 挑戰" },
  { value: "4+", label: "跨域核心技術" },
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

const recentApps = [
  "n8n Webhook Bot",
  "Dify 文件摘要",
  "BOM 比對系統",
  "RF 測試報告",
  "Code Review Bot",
  "BMS Dashboard",
];

export default function ProfilePage() {
  const completedDays = 6;
  const totalDays = 100;
  const progress = Math.round((completedDays / totalDays) * 100);

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
              href="#ai-progress"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0070F3] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(0,112,243,0.35)] transition hover:bg-[#1a7ff5]"
            >
              進入 AI 100 實驗室
              <ArrowRight size={15} />
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center rounded-lg border border-white/15 px-6 py-3 text-sm font-semibold text-[#EDEDED] transition hover:border-[#0070F3]/50 hover:bg-white/5"
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

      <section id="ai-progress" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-[#1a1a1a] bg-gradient-to-br from-[#0A0A0A] to-[#07111f] p-8 text-center sm:p-10">
          <div className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#60a5fa]">
            <span className="h-2 w-2 rounded-full bg-[#0070F3] shadow-[0_0_8px_rgba(0,112,243,0.8)]" />
            Live Challenge · AI 100 Apps
          </div>

          <div className="flex items-baseline justify-center gap-3">
            <span className="font-mono text-5xl font-bold text-[#60a5fa] sm:text-6xl">
              {String(completedDays).padStart(2, "0")}
            </span>
            <span className="font-mono text-2xl text-[#888888]">/ {totalDays}</span>
          </div>

          <p className="mt-3 text-sm text-[#888888]">
            已完成 {completedDays} 個 AI 應用，目標 100 天打造 100 款實戰工具
          </p>

          <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0070F3] to-[#00e5ff] shadow-[0_0_12px_rgba(0,112,243,0.55)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {recentApps.map((app, index) => (
              <span
                key={app}
                className={`rounded-md border px-2.5 py-1 font-mono text-xs ${
                  index === completedDays - 1
                    ? "border-[#0070F3]/40 bg-[#0070F3]/15 text-[#60a5fa]"
                    : "border-white/10 bg-white/[0.03] text-[#888888]"
                }`}
              >
                {app}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <span className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#60a5fa]">
              Contact
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl">聯絡我</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#888888]">
              合作提案、技術討論或單純打聲招呼，我很樂意回覆。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="mailto:hello@jkspace.dev"
              className="flex items-center gap-4 rounded-lg border border-[#1a1a1a] bg-[#0A0A0A] p-5 transition hover:border-[#0070F3]/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#0070F3]/25 bg-[#0070F3]/10 text-[#60a5fa]">
                <Mail size={16} />
              </span>
              <span>
                <span className="block text-xs text-[#888888]">Email</span>
                <span className="text-sm font-medium">hello@jkspace.dev</span>
              </span>
            </a>

            <div className="flex items-center gap-4 rounded-lg border border-[#1a1a1a] bg-[#0A0A0A] p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#0070F3]/25 bg-[#0070F3]/10 text-[#60a5fa]">
                <MessageSquare size={16} />
              </span>
              <span>
                <span className="block text-xs text-[#888888]">回覆時間</span>
                <span className="text-sm font-medium">通常 24 小時內</span>
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[#0070F3]/20 bg-[#0070F3]/10 p-5">
            <p className="text-sm font-medium text-[#60a5fa]">開放合作中</p>
            <p className="mt-2 text-sm leading-relaxed text-[#a1a1aa]">
              AI 自動化顧問、硬體系統評估、技術白皮書撰寫與 SaaS 產品共創。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
