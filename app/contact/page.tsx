import type { Metadata } from "next";
import { getEnabledContactLinks, siteConfig } from "@/lib/site-config";
import { ContactLinks } from "./ContactLinks";

export const metadata: Metadata = {
  title: "聯絡我",
  description: `${siteConfig.name} 的技術交流、工具回饋與合作討論管道。`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-[var(--color-text)] sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="mb-3 font-mono text-xs text-[var(--color-accent)]">{siteConfig.name} / Contact</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">聯絡我</h1>
        <p className="mt-5 leading-relaxed text-[var(--color-muted)]">
          歡迎交流硬體研發與 AI 自動化的實作經驗，分享工具使用回饋，或討論工程工具與獨立產品的合作方向。
        </p>
      </header>

      <section aria-labelledby="contact-topics" className="mb-10">
        <h2 id="contact-topics" className="text-xl font-semibold">適合交流的主題</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-[var(--color-muted)]">
          <li>技術交流：高頻電路、系統架構，以及 n8n、Dify 等自動化工作流程。</li>
          <li>工具回饋：PCB 測試點比對工具的使用情境、限制與改善建議。</li>
          <li>合作討論：把重複的工程工作轉成可使用的工具或產品原型。</li>
        </ul>
        <p className="mt-5 text-sm leading-relaxed text-[var(--color-muted)]">
          提出工具問題時，可以附上操作步驟、預期結果與去除機密的範例；請避免提供公司的原始設計或敏感資料。
        </p>
      </section>

      <ContactLinks links={getEnabledContactLinks(siteConfig)} />
    </div>
  );
}
