"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Cpu, Layers, Rocket, Hash, TrendingUp } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  count: number;
  type: "category" | "tag";
}

interface Props {
  categories: FilterOption[];
  topTags: FilterOption[];
}

export function CategoryFilter({ categories, topTags }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCat = searchParams.get("cat") || "all";
  const activeTag = searchParams.get("tag");

  const handleSelect = (value: string, type: "category" | "tag") => {
    const params = new URLSearchParams();
    if (value === "all") {
      // no params
    } else if (type === "tag") {
      params.set("tag", value);
    } else {
      params.set("cat", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    router.push(pathname);
  };

  return (
    <div className="space-y-4">
      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {/* "全部" item */}
        <button
          onClick={() => handleClear()}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
            activeCat === "all" && !activeTag
              ? "border-[#0070F3] text-[#0070F3] dark:text-[#60a5fa] bg-[#0070F3]/10 dark:bg-[#0070F3]/20"
              : "border-[#e5e5e7] dark:border-[#1a1a1a] text-[#6e6e73] dark:text-[#888888] hover:border-[#0070F3]/30 hover:text-[#0070F3] dark:hover:text-[#EDEDED] bg-white dark:bg-[#0A0A0A]"
          }`}
        >
          <Hash size={13} />
          全部
          <span className="text-[10px] opacity-60 ml-0.5">
            ({categories.reduce((s, c) => s + c.count, 0)})
          </span>
        </button>

        {categories.map(({ value, label, count, type }) => {
          const active = activeCat === value && !activeTag;
          return (
            <button
              key={value}
              onClick={() => handleSelect(value, type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
                active
                  ? "border-[#0070F3] text-[#0070F3] dark:text-[#60a5fa] bg-[#0070F3]/10 dark:bg-[#0070F3]/20"
                  : "border-[#e5e5e7] dark:border-[#1a1a1a] text-[#6e6e73] dark:text-[#888888] hover:border-[#0070F3]/30 hover:text-[#0070F3] dark:hover:text-[#EDEDED] bg-white dark:bg-[#0A0A0A]"
              }`}
            >
              {label === "科技" && <Cpu size={13} />}
              {label === "金融理財" && <Layers size={13} />}
              {label === "創業" && <Rocket size={13} />}
              {!["科技", "金融理財", "創業"].includes(label) && <TrendingUp size={13} />}
              {label}
              <span className="text-[10px] opacity-60 ml-0.5">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tags (only if there are meaningful tags) */}
      {topTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-[#b0b0b0] dark:text-[#555] self-center mr-1">🏷️</span>
          {topTags.map(({ value, label, count, type }) => {
            const active = activeTag === value;
            // If a category is selected AND this tag matches, also highlight
            return (
              <button
                key={value}
                onClick={() => handleSelect(value, type)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs border transition-all duration-200 ${
                  active
                    ? "border-[#f59e0b] text-[#f59e0b] dark:text-[#fbbf24] bg-[#f59e0b]/10 dark:bg-[#f59e0b]/20"
                    : "border-[#e5e5e7] dark:border-[#1a1a1a] text-[#6e6e73] dark:text-[#888888] hover:border-[#f59e0b]/30 hover:text-[#f59e0b] bg-white dark:bg-[#0A0A0A]"
                }`}
              >
                # {label}
                <span className="text-[9px] opacity-50 ml-0.5">{count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
