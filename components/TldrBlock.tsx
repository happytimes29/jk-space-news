"use client";

import { useState } from "react";
import { Zap, Play, Pause, Volume2 } from "lucide-react";

interface TldrBlockProps {
  points: string[];
  audioUrl?: string;
}

export function TldrBlock({ points, audioUrl }: TldrBlockProps) {
  const [playing, setPlaying] = useState(false);

  const toggleAudio = () => {
    if (!audioUrl) return;
    setPlaying((p) => !p);
    // Future: wire to actual HTMLAudioElement or ElevenLabs stream
  };

  return (
    <div className="relative rounded-xl border border-[#0070F3]/30 bg-[#0070F3]/5 p-5 mb-8 overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,112,243,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,112,243,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0070F3] flex items-center justify-center">
              <Zap size={12} className="text-white" fill="white" />
            </div>
            <span className="text-xs font-semibold text-[#0070F3] uppercase tracking-wider">
              TL;DR — 太長不看，3 點摘要
            </span>
          </div>

          {/* AI Audio player */}
          <button
            onClick={toggleAudio}
            title={audioUrl ? (playing ? "暫停語音導讀" : "播放 AI 語音導讀") : "語音導讀（即將上線）"}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all duration-200 ${
              audioUrl
                ? "border-[#0070F3]/30 text-[#0070F3] hover:bg-[#0070F3]/10 cursor-pointer"
                : "border-[#1a1a1a] text-[#888888] cursor-not-allowed opacity-60"
            }`}
            disabled={!audioUrl}
          >
            {playing ? (
              <>
                <Pause size={11} />
                <span>暫停</span>
                <Volume2 size={11} className="animate-pulse" />
              </>
            ) : (
              <>
                <Play size={11} />
                <span>AI 語音導讀</span>
              </>
            )}
          </button>
        </div>

        {/* Points */}
        <ul className="space-y-2.5">
          {points.map((point, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0070F3]/15 border border-[#0070F3]/30 text-[#0070F3] text-[10px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-[#CCCCCC] leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
