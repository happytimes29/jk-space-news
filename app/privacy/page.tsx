import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "隱私權政策",
  description: `${siteConfig.name} 的網站連線、匿名瀏覽統計與 PCB 工具檔案處理說明。`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-[var(--color-text)] sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">隱私權政策</h1>
      <p className="mt-4 text-xs text-[var(--color-muted)]">最後更新：<time dateTime="2026-10-15">2026-10-15</time></p>

      <div className="mt-10 space-y-8 text-sm leading-7 text-[var(--color-muted)]">
        <p>{siteConfig.name} 是個人工程實驗室，提供專案紀錄、技術筆記與瀏覽器工具。以下說明目前網站的資料處理方式。</p>

        <section aria-labelledby="privacy-site">
          <h2 id="privacy-site" className="mb-3 text-xl font-semibold text-[var(--color-text)]">網站使用與聯絡</h2>
          <p>本網站沒有會員帳號、登入或聯絡表單，不自行收集註冊資料或儲存表單訊息。</p>
          <p className="mt-3">若您透過外部聯絡管道交流，您傳送的內容會交由該平台處理，並用於回覆與討論。請留意外部平台的隱私規範，避免傳送機密設計或敏感資料。</p>
        </section>

        <section aria-labelledby="privacy-hosting">
          <h2 id="privacy-hosting" className="mb-3 text-xl font-semibold text-[var(--color-text)]">託管與瀏覽統計</h2>
          <p>網站使用 Vercel 託管。提供網站連線與安全維護時，託管平台可能處理 IP 位址、瀏覽器、裝置與請求等必要連線資訊；相關日誌由平台依其服務規範處理。</p>
          <p className="mt-3">網站整合 Vercel Analytics，用於匿名頁面瀏覽統計。送出頁面瀏覽事件前，會移除網址的查詢參數與片段；目前不傳送自訂事件，也不把工具檔案內容或聯絡資訊加入分析事件。</p>
          <p className="mt-3">網站未加入廣告像素或跨站追蹤。明暗主題偏好可保存在您的瀏覽器中，供下次造訪時使用。</p>
        </section>

        <section aria-labelledby="privacy-pcb">
          <h2 id="privacy-pcb" className="mb-3 text-xl font-semibold text-[var(--color-text)]">PCB 工具檔案</h2>
          <p>PCB 測試點比對工具讀取的 OrCAD 報表、DXF 板框與測試點資料，只在您的瀏覽器內解析、比對與繪製，不上傳至網站伺服器或分析服務。匯出的結果由瀏覽器產生並下載。</p>
          <p className="mt-3">您可以使用工具內的範例資料體驗流程。若要回報問題，請先移除檔案中的公司、產品與其他機密資訊。</p>
        </section>

        <section aria-labelledby="privacy-updates">
          <h2 id="privacy-updates" className="mb-3 text-xl font-semibold text-[var(--color-text)]">更新與疑問</h2>
          <p>
            若資料處理方式改變，會更新本頁說明與日期。如有隱私相關疑問，請前往
            <Link href="/contact" className="text-[var(--color-accent)] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">聯絡頁</Link>
            查看目前提供的交流管道。
          </p>
        </section>
      </div>
    </div>
  );
}
