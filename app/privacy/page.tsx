import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隱私權政策 — JK Space News",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-[#EDEDED] mb-8">隱私權政策</h1>
      <div className="prose dark:prose-invert text-sm text-[#6e6e73] dark:text-[#888888] space-y-4">
        <p>最後更新日期：2026 年 6 月 1 日</p>
        <h2>1. 資訊收集</h2>
        <p>JK Space News（以下稱「本網站」）不會主動收集您的個人資料。本網站使用 Vercel 作為託管平台，Vercel 可能會自動記錄標準的伺服器日誌（如 IP 位址、瀏覽器類型、造訪時間），這些資料僅用於網站營運與安全維護。</p>
        <h2>2. Cookie 使用</h2>
        <p>本網站不會自行設置追蹤型 Cookie。第三方服務（如 Vercel Analytics）可能使用必要的 Cookie 來分析網站流量，這些資料無法識別個人身份。</p>
        <h2>3. 第三方服務</h2>
        <p>本網站使用以下第三方服務，各服務有其獨立的隱私政策：</p>
        <ul>
          <li>Vercel（網站託管）</li>
          <li>GitHub（原始碼管理）</li>
          <li>Google Sheets（數據記錄）</li>
        </ul>
        <h2>4. 資料安全</h2>
        <p>我們採取合理的技術措施保護網站安全，但無法保證網際網路傳輸的絕對安全。</p>
        <h2>5. 聯絡方式</h2>
        <p>如有任何隱私相關問題，請透過 Telegram 與我們聯繫。</p>
      </div>
    </div>
  );
}
