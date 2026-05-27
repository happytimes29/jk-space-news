import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Glowing number */}
      <div className="relative mb-8">
        <p
          className="text-[120px] sm:text-[180px] font-black text-[#0070F3]/10 select-none leading-none"
          style={{ textShadow: "0 0 60px rgba(0,112,243,0.3)" }}
        >
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-xl bg-[#0070F3] flex items-center justify-center shadow-[0_0_40px_#0070F3]">
            <Zap size={28} className="text-white" fill="white" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-[#EDEDED] mb-3">頁面不存在</h1>
      <p className="text-[#888888] text-sm mb-8 max-w-sm">
        這篇情報已被列為機密或不存在。請回到基地繼續探索最新 AI 動態。
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0070F3] text-white text-sm font-medium hover:bg-[#0070F3]/90 transition-colors shadow-[0_0_20px_rgba(0,112,243,0.4)]"
      >
        返回首頁
      </Link>
    </div>
  );
}
