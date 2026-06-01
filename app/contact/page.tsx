import type { Metadata } from "next";
import { Mail, Send } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "聯絡我們 — JK Space News",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-[#EDEDED] mb-8">聯絡我們</h1>
      <div className="prose dark:prose-invert text-sm text-[#6e6e73] dark:text-[#888888] space-y-6">
        <p>有任何建議、合作提案或問題，歡迎透過以下方式與我們聯繫：</p>
        
        <div className="flex items-center gap-3 p-4 rounded-lg border border-[#e5e5e7] dark:border-[#1a1a1a] bg-[#f5f5f7] dark:bg-[#0A0A0A]">
          <Send size={18} className="text-[#0070F3]" />
          <div>
            <p className="text-sm font-medium text-[#1a1a1a] dark:text-[#EDEDED]">Telegram</p>
            <p className="text-xs">最快回覆方式</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg border border-[#e5e5e7] dark:border-[#1a1a1a] bg-[#f5f5f7] dark:bg-[#0A0A0A]">
          <Mail size={18} className="text-[#0070F3]" />
          <div>
            <p className="text-sm font-medium text-[#1a1a1a] dark:text-[#EDEDED]">Email</p>
            <p className="text-xs">jk@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
