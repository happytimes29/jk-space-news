import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隱私權政策 — JK Space News",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-[#EDEDED] mb-8">隱私權政策</h1>
      <div className="prose dark:prose-invert text-sm text-[#6e6e73] dark:text-[#888888] space-y-4 max-w-none">
        <p>最後更新日期：2026 年 6 月 2 日</p>

        <p>JK Space News（以下稱「本網站」）非常重視您的隱私權，且遵循中華民國「個人資料保護法」之規定，因此制訂了本隱私權保護政策，請詳細閱讀下列內容。</p>

        <h2>個人資料之安全</h2>
        <p>保護您的個人隱私是本網站重要的經營理念。在未經您同意之下，我們絕不會將您的個人資料提供予任何與本網站服務無關之第三人。您應妥善保密自己的帳號密碼及個人資料，在使用完本網站所提供的各項服務後，務必記得登出帳戶；若與他人共享電腦或使用公共電腦，切記要關閉瀏覽器視窗。</p>

        <h2>個人資料的蒐集、處理、利用</h2>
        <p>本網站所取得的個人資料，僅供本網站於內部、依照原來所說明的使用目的和範圍使用。除非事先說明、或依照相關法律規定，否則本網站不會將資料提供給第三人、或移作其他目的使用。</p>

        <p><strong>蒐集之目的：</strong></p>
        <p>本網站為純內容型網站，不提供會員註冊、購物車或金流服務。本網站僅透過第三方託管平台（Vercel）收集必要的連線日誌，目的在於進行網站流量分析與營運安全維護。</p>

        <p><strong>蒐集之個人資料類別：</strong></p>
        <p>本網站於營運過程中可能被動收集之資料包括：</p>
        <ul>
          <li>C001 辨識個人者：如 IP 位址、瀏覽器類型與版本、裝置類型等連線資訊。</li>
          <li>如您主動透過 Telegram 或其他管道與我們聯繫，我們將保存您所提供的聯絡資訊以進行回覆。</li>
        </ul>

        <p><strong>利用期間、地區、對象及方式：</strong></p>
        <ul>
          <li><strong>期間：</strong>自您使用本網站之日起，至本網站終止服務或您要求停止使用之日為止。</li>
          <li><strong>地區：</strong>您的個人資料將用於台灣地區及本網站伺服器所在區域（美國）。</li>
          <li><strong>利用對象及方式：</strong>您的資料僅用於網站營運分析、安全維護及客服回覆，不會用於行銷目的。</li>
        </ul>

        <h2>您就個人資料之權利</h2>
        <p>依個人資料保護法，您得對本網站行使以下權利：</p>
        <ul>
          <li>查詢或請求閱覽。</li>
          <li>請求製給複製本。</li>
          <li>請求補充或更正。</li>
          <li>請求停止蒐集、處理或利用。</li>
          <li>請求刪除。</li>
        </ul>
        <p>如欲行使上述權利，請透過 Telegram 與我們聯繫。</p>

        <h2>資料安全</h2>
        <p>為保障您的隱私及安全，本網站採用合理的技術及程序（包括但不限於 HTTPS 加密傳輸、伺服器存取控制）來保護所有資料之安全。本網站使用 Vercel 作為託管平台，Vercel 提供符合業界標準的基礎設施安全措施。</p>

        <h2>Cookie</h2>
        <p>本網站不會自行設置追蹤型 Cookie。第三方服務（如 Vercel Analytics）可能使用必要的 Cookie 來分析網站流量，這些資料無法識別個人身份。如您關閉 Cookie，可能導致本網站的部份功能無法正常運作。</p>

        <h2>第三方服務</h2>
        <p>本網站使用以下第三方服務，各服務有其獨立的隱私政策，建議您參考其規定：</p>
        <ul>
          <li><strong>Vercel</strong> — 網站託管與效能分析</li>
          <li><strong>GitHub</strong> — 原始碼管理與自動部署</li>
          <li><strong>Google Sheets</strong> — 數據記錄（僅限內部使用）</li>
          <li><strong>Telegram</strong> — 讀者聯絡管道</li>
        </ul>

        <h2>隱私權政策修訂</h2>
        <p>隨著市場環境與法規的改變，本網站將會不時修訂本政策。更新後的版本將公布於本頁面，並附上更新日期。如您持續使用本網站服務，即代表您同意修訂後的政策。</p>

        <h2>聯絡方式</h2>
        <p>如對本隱私權政策有任何疑問或行使您的權利，請透過以下管道與我們聯繫：</p>
        <ul>
          <li>Telegram：<strong>@JK_Sapce</strong></li>
        </ul>

        <p className="text-xs text-[#b0b0b0] mt-10">本政策參考電腦王阿達之隱私權政策改編，並依本網站實際營運情況調整。</p>
      </div>
    </div>
  );
}
