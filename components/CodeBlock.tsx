"use client";

import { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  isPrompt?: boolean;
  title?: string;
}

export function CodeBlock({ code, language = "bash", isPrompt = false, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Copy failed");
    }
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-[#1a1a1a] bg-[#050505] my-6">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a1a] bg-[#0A0A0A]">
        <div className="flex items-center gap-2.5">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] opacity-60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] opacity-60" />
          </div>
          <div className="w-px h-3 bg-[#1a1a1a]" />
          {isPrompt ? (
            <span className="text-xs text-[#0070F3] flex items-center gap-1.5 font-medium">
              <Terminal size={11} />
              AI Prompt
            </span>
          ) : (
            <span className="text-xs text-[#888888]">
              {title || language}
            </span>
          )}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all duration-200 ${
            copied
              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5"
              : "border-[#1a1a1a] text-[#888888] hover:text-[#EDEDED] hover:border-[#333] bg-transparent"
          }`}
          aria-label="複製到剪貼板"
        >
          {copied ? (
            <>
              <Check size={11} />
              <span>已複製！</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>複製</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-auto">
        <pre className="p-5 text-sm font-mono leading-relaxed">
          <code
            className={`text-[#EDEDED] ${
              isPrompt ? "text-[#a8d8f0]" : ""
            }`}
          >
            {code}
          </code>
        </pre>
      </div>

      {/* Prompt label overlay */}
      {isPrompt && (
        <div className="absolute top-2 right-14 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] text-[#0070F3] uppercase tracking-widest">可直接貼入 ChatGPT</span>
        </div>
      )}
    </div>
  );
}
