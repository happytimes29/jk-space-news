import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "關於我們 — JK Space News",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-[#EDEDED] mb-8">關於 JK Space News</h1>
      <div className="prose dark:prose-invert text-sm text-[#6e6e73] dark:text-[#888888] space-y-4">
        <p>JK Space News 是一個自動化的科技新聞聚合平台，專注於 AI、科技與金融領域的最新動態。</p>
        <h2>運作方式</h2>
        <p>本網站透過自動化流程運作：</p>
        <ul>
          <li>TrendRadar 每 30 分鐘爬取全球熱門科技新聞</li>
          <li>DeepSeek V4 Flash 將新聞改寫為 500-800 字的中文深度報導</li>
          <li>Replicate AI 為每篇文章生成專屬封面圖</li>
          <li>所有內容經 Git 推送後由 Vercel 自動部署上線</li>
        </ul>
        <h2>編輯方針</h2>
        <p>每篇文章皆包含原文摘要、觀點評論與延伸思考，並非單純的機器翻譯。我們致力於為華語讀者提供有價值的科技資訊。</p>
        <h2>技術棧</h2>
        <p>Next.js · TypeScript · Tailwind CSS · Vercel · DeepSeek API · Replicate · TrendRadar · Google Sheets API</p>
      </div>
    </div>
  );
}
