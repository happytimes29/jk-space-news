"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { filterSearchItems, type SearchItem } from "@/lib/search";

const typeLabels: Record<SearchItem["type"], string> = { project: "專案", tool: "工具", note: "筆記" };

interface CommandPaletteProps {
  items: SearchItem[];
}

export function CommandPalette({ items }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();

  // Toggle on Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelected(0);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filtered = filterSearchItems(items, query);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
      setQuery("");
    },
    [router]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.max(0, Math.min(s + 1, filtered.length - 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter" && filtered[selected]) {
        navigate(filtered[selected].href);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, filtered, selected, navigate]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] animate-[fadeIn_0.15s_ease]"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-[9999] w-full max-w-xl px-4 animate-[slideDown_0.2s_ease]">
        <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl shadow-black/60">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-[#1a1a1a]">
            <Search size={16} className="text-[#888888] flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(0);
              }}
              aria-label="搜尋專案、工具與筆記"
              placeholder="搜尋專案、工具與筆記..."
              className="min-w-0 flex-1 py-4 bg-transparent text-sm text-[#EDEDED] placeholder-[#888888]"
            />
            <kbd className="text-[10px] text-[#888888] border border-[#1a1a1a] rounded px-1.5 py-0.5 bg-black">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="py-2 max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#888888]">
                <p>找不到相關內容</p>
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-[#7ea0ff]">
                  <Link href="/projects" onClick={() => setOpen(false)}>專案</Link>
                  <Link href="/tools" onClick={() => setOpen(false)}>工具</Link>
                  <Link href="/notes" onClick={() => setOpen(false)}>筆記與觀點</Link>
                </div>
              </div>
            ) : (
              <>
                <p className="px-4 py-1.5 text-[10px] text-[#888888] uppercase tracking-wider font-medium">
                  {query.trim() ? `搜尋結果 (${filtered.length})` : "探索內容"}
                </p>
                {filtered.map((item, i) => (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setSelected(i)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      i === selected ? "bg-[#0070F3]/10 text-[#EDEDED]" : "text-[#888888] hover:text-[#EDEDED]"
                    }`}
                  >
                    <FileText
                      size={14}
                      className={i === selected ? "text-[#0070F3]" : "text-[#888888]"}
                    />
                    <span className="flex-1 text-sm truncate">{item.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        i === selected
                          ? "border-[#0070F3]/30 text-[#0070F3] bg-[#0070F3]/5"
                          : "border-[#1a1a1a] text-[#888888]"
                      }`}
                    >
                      {typeLabels[item.type]}
                    </span>
                    {i === selected && (
                      <ArrowRight size={13} className="text-[#0070F3] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2.5 border-t border-[#1a1a1a] flex items-center gap-4 text-[10px] text-[#888888]">
            <span className="flex items-center gap-1">
              <kbd className="border border-[#1a1a1a] rounded px-1 py-0.5 bg-black">↑↓</kbd>
              導覽
            </span>
            <span className="flex items-center gap-1">
              <kbd className="border border-[#1a1a1a] rounded px-1 py-0.5 bg-black">↵</kbd>
              跳轉
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp size={11} />
              全站搜尋
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
