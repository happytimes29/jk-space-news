import Link from "next/link";
import { Zap, Rss } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="w-7 h-7 rounded-md bg-[#0070F3] flex items-center justify-center">
                <Zap size={14} className="text-white" fill="white" />
              </div>
              <span className="font-bold text-sm">
                JK<span className="text-[#0070F3]"> Space</span> News
              </span>
            </Link>
            <p className="text-xs text-[#888888] max-w-xs leading-relaxed">
              專注 AI 應用、科技熱點與數位創業的極速情報站。每日精選最前線科技脈動。
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 text-xs text-[#888888]">
            <p className="font-medium text-[#EDEDED] mb-1">訂閱與同步</p>
            <a
              href="/feed.xml"
              className="flex items-center gap-2 hover:text-[#0070F3] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Rss size={12} />
              RSS Feed (n8n 自動化)
            </a>
            <Link href="/trending" className="hover:text-[#0070F3] transition-colors">
              趨勢分類
            </Link>
          </div>

          {/* Automation badge */}
          <div className="border border-[#1a1a1a] rounded-lg p-4 bg-[#0A0A0A] text-xs space-y-1.5 max-w-xs">
            <p className="text-[#888888] font-medium text-[10px] uppercase tracking-wider">一人公司放大器</p>
            <p className="text-[#EDEDED]">網站更新 → n8n 抓取 RSS</p>
            <p className="text-[#888888]">→ AI 自動推文至 Threads · X · FB</p>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="pulse-dot" />
              <span className="text-[#0070F3] text-[10px]">自動化進行中</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#888888]">
          <p>© 2026 JK Space News. All rights reserved.</p>
          <p>
            按下{" "}
            <kbd className="px-1.5 py-0.5 border border-[#1a1a1a] rounded bg-black text-[#EDEDED]">
              ⌘K
            </kbd>{" "}
            開啟全站搜尋
          </p>
        </div>
      </div>
    </footer>
  );
}
