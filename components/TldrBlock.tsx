"use client";

import { useState } from "react";
import { Zap, Volume2 } from "lucide-react";

interface TldrBlockProps {
  points: string[];
  audioUrl?: string;
}

export function TldrBlock({ points, audioUrl }: TldrBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative rounded-xl border border-[#0070F3]/30 bg-[#0070F3]/5 dark:bg-[#0070F3]/10 p-5 mb-8 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(circle at top left, rgba(0,112,243,0.3) 0%, transparent 50%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0070F3] flex items-center justify-center">
              <Zap size={12} className="text-white" fill="white" />
            </div>
            <span className="text-xs font-semibold text-[#0070F3] uppercase tracking-wider">
              TL;DR
            </span>
          </div>

          {audioUrl && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all duration-200 ${
                isPlaying
                  ? "border-[#0070F3]/30 text-[#0070F3] hover:bg-[#0070F3]/10 cursor-pointer"
                  : "border-[#e5e5e7] dark:border-[#1a1a1a] text-[#6e6e73] dark:text-[#888888] cursor-not-allowed opacity-60"
              }`}
            >
              <Volume2 size={11} className="animate-pulse" />
              {isPlaying ? "播放中" : "音檔"}
            </button>
          )}
        </div>

        <ul className="space-y-2.5">
          {points.map((point, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0070F3]/15 border border-[#0070F3]/30 text-[#0070F3] text-[10px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-[#1a1a1a] dark:text-[#EDEDED] leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}