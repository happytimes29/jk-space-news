import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#e5e5e7] dark:border-[#1a1a1a] mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="w-7 h-7 rounded-md bg-[#0070F3] flex items-center justify-center">
                <Zap size={14} className="text-white" fill="white" />
              </div>
              <span className="font-bold text-sm text-[#1a1a1a] dark:text-[#EDEDED]">
                JK<span className="text-[#0070F3]"> Space</span> News
              </span>
            </Link>
            <p className="text-xs text-[#6e6e73] dark:text-[#888888] max-w-xs leading-relaxed">
              專注 科技、金融理財、創業 的極速情報站。每日精選最前線科技脈動。
            </p>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <Link href="/subscribe" className="text-[#6e6e73] dark:text-[#888888] hover:text-[#0070F3] transition-colors">
              訂閱
            </Link>
            <Link href="/trending" className="text-[#6e6e73] dark:text-[#888888] hover:text-[#0070F3] transition-colors">
              趨勢分類
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#e5e5e7] dark:border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6e6e73] dark:text-[#888888]">
          <p>© 2026 JK Space News. All rights reserved.</p>
          <p>
            按下{" "}
            <kbd className="px-1.5 py-0.5 border border-[#e5e5e7] dark:border-[#1a1a1a] rounded bg-[#f5f5f7] dark:bg-[#0A0A0A] text-[#6e6e73] dark:text-[#888888]">
              ⌘K
            </kbd>{" "}
            開啟全站搜尋
          </p>
        </div>
      </div>
    </footer>
  );
}