import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { getEnabledContactLinks, siteConfig } from "@/lib/site-config";
import { ContactLinks } from "@/app/contact/ContactLinks";

export const metadata = buildPageMetadata({
  route: "/about",
  title: "關於我",
  description: "15+ 年硬體研發經驗，從高頻電路與系統架構，延伸至 AI 自動化與獨立產品實驗。",
});

const expertise = [
  { title: "硬體系統與高頻電路", text: "從 RF、BMS 到系統架構，把硬體邊界條件轉成可落地的工程決策。" },
  { title: "AI 自動化工作流", text: "以 n8n、Dify 與代理式工具串接資料、流程與產品原型。" },
  { title: "獨立產品實驗", text: "用快速原型驗證需求，探索能持續迭代的工程工具與數位服務。" },
];

const linkClass = "text-[var(--color-accent)] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

export default function AboutPage() {
  const contacts = getEnabledContactLinks(siteConfig);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-[var(--color-text)] sm:px-6 lg:px-8">
      <header className="mb-12 border-b border-[var(--color-border)] pb-10">
        <p className="mb-3 font-mono text-xs text-[var(--color-accent)]">{siteConfig.name} / Hardware R&amp;D × AI Automation</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">關於我</h1>
        <p className="mt-5 max-w-2xl text-balance text-lg leading-relaxed">{siteConfig.tagline}</p>
      </header>

      <div className="space-y-12">
        <section aria-labelledby="about-intro">
          <h2 id="about-intro" className="text-xl font-semibold">簡介</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
            我有 15+ 年硬體研發經驗，專注高頻電路與系統架構，也投入 AI 自動化工作流與獨立產品實驗。
            {siteConfig.name} 是我整理工程實作、工具與技術觀點的空間。
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            以 <Link href="/projects/pcb-test-point-comparison" className={linkClass}>PCB 測試點自動比對工具</Link> 為例，
            我把硬體改版時的新舊報表比對，做成能在瀏覽器內使用的工具，處理報表解析、測試點差異與 DXF 座標對齊。
          </p>
        </section>

        <section aria-labelledby="about-expertise">
          <h2 id="about-expertise" className="text-xl font-semibold">專業領域</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {expertise.map(({ title, text }) => (
              <article key={title} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="about-method">
          <h2 id="about-method" className="text-xl font-semibold">工作方法</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-[var(--color-muted)]">
            <li>釐清工程限制：先處理報表結構、資料篩選與座標系等邊界條件。</li>
            <li>以工具串起流程：用 AI 協作與自動化減少重複工作，把資料轉成可操作的結果。</li>
            <li>用快速原型驗證需求：從實際使用情境出發，持續調整工具與產品方向。</li>
          </ol>
        </section>

        <section aria-labelledby="about-timeline">
          <h2 id="about-timeline" className="text-xl font-semibold">經歷時間線</h2>
          <ol className="mt-5 space-y-6 border-l border-[var(--color-border)] pl-5">
            <li>
              <h3 className="font-semibold">硬體研發累積 · 15+ 年</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">以高頻電路與系統架構為主軸，涵蓋 RF、BMS 與硬體系統的工程決策。</p>
            </li>
            <li>
              <h3 className="font-semibold">延伸至 AI 與流程自動化</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">實作 n8n 自動化工作流，串接資料同步、通知與內容流程，並探索 Dify 與智慧代理工具。</p>
            </li>
            <li>
              <h3 className="font-semibold">目前 · 工程工具與獨立產品實驗</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">把硬體工作中的需求轉成瀏覽器工具，持續以原型探索產品方向。</p>
            </li>
          </ol>
        </section>

        <section aria-labelledby="about-focus">
          <h2 id="about-focus" className="text-xl font-semibold">目前關注方向</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
            聚焦 AI 自動化、n8n／Dify 工作流，以及能解決實際問題的獨立產品。
            從 PCB 資料處理到日常自動化，我關心的是如何把技術實驗變成好用的工具。
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm">
            <Link href="/projects" className={linkClass}>查看專案</Link>
            <Link href="/tools" className={linkClass}>使用工具</Link>
            <Link href="/contact" className={linkClass}>聯絡我</Link>
          </div>
        </section>

        {contacts.length > 0 && (
          <section aria-labelledby="about-links">
            <h2 id="about-links" className="mb-5 text-xl font-semibold">外部連結</h2>
            <ContactLinks links={contacts} />
          </section>
        )}
      </div>
    </div>
  );
}
