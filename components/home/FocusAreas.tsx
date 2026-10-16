import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const areas = [
  { title: "硬體與高頻研發", summary: "從硬體改版與測試需求出發，整理限制、座標與驗證方式。", href: "/projects?area=hardware" },
  { title: "AI 與工作流程自動化", summary: "串接資料處理與發布流程，也記錄自動化的邊界與維護取捨。", href: "/projects?area=automation" },
  { title: "工程工具與獨立產品", summary: "把反覆遇到的工程問題，做成可直接操作的瀏覽器工具。", href: "/projects?area=product" },
];

export function FocusAreas() {
  return (
    <section aria-labelledby="focus-title" className="space-y-6">
      <h2 id="focus-title" className="text-2xl font-semibold tracking-tight">專業焦點</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {areas.map((area, index) => (
          <Link key={area.href} href={area.href} className="group min-w-0 border-t border-zinc-300 py-5 dark:border-zinc-700">
            <span className="font-mono text-xs text-blue-700 dark:text-blue-300">0{index + 1}</span>
            <h3 className="mt-4 flex items-start justify-between gap-3 text-lg font-semibold">
              {area.title}<ArrowUpRight aria-hidden="true" size={18} className="mt-1 shrink-0 text-blue-700 dark:text-blue-300" />
            </h3>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{area.summary}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
