"use client";

import { useState } from "react";
import { Mail, CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("訂閱成功！感謝你的加入 🎉");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "訂閱失敗，請稍後再試");
      }
    } catch {
      setStatus("error");
      setMessage("網路錯誤，請檢查連線後再試");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0070F3]/10 dark:bg-[#0070F3]/20 mb-6">
          <Mail size={24} className="text-[#0070F3]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-[#EDEDED] mb-3">
          訂閱 JK Space News
        </h1>
        <p className="text-sm text-[#6e6e73] dark:text-[#888888] leading-relaxed max-w-md mx-auto">
          輸入 Email，第一時間收到 AI 應用、科技熱點與數位創業的極速情報。每日精選，不漏接。
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-[#e5e5e7] dark:border-[#1a1a1a] rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#1a1a1a] dark:text-[#EDEDED] mb-2"
            >
              Email 帳號
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e7] dark:border-[#1a1a1a] bg-[#f5f5f7] dark:bg-[#050505] text-[#1a1a1a] dark:text-[#EDEDED] text-sm placeholder-[#b0b0b0] dark:placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#0070F3]/40 focus:border-[#0070F3] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-3 px-6 rounded-xl bg-[#0070F3] hover:bg-[#0055DD] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <>
                <Loader size={16} className="animate-spin" />
                訂閱中...
              </>
            ) : (
              "確認訂閱"
            )}
          </button>
        </form>

        {/* Status messages */}
        {status === "success" && (
          <div className="flex items-start gap-3 mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <CheckCircle size={18} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-3 mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-8 text-center text-xs text-[#b0b0b0] dark:text-[#555] space-y-1">
        <p>訂閱後可隨時取消。</p>
        <p>我們不會發送廣告，僅更新重要內容。</p>
      </div>
    </div>
  );
}