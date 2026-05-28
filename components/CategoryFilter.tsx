"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Cpu, Layers, Rocket, Hash } from "lucide-react";

const TOP_TAGS = ["AI", "半導體", "晶片", "華為"];

const CATEGORIES = [
  { value: "all", label: "全部", icon: Hash },
  { value: "科技", label: "科技", icon: Cpu },
  { value: "金融理財", label: "金融理財", icon: Layers },
  { value: "創業", label: "創業", icon: Rocket },
];

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("cat") || "all";

  const handleSelect = (value: string) => {
    const params = new URLSearchParams();
    if (value === "all") {
      // show all
    } else if (TOP_TAGS.includes(value)) {
      params.set("tag", value);
    } else {
      params.set("cat", value);
    }
    router.push(`/trending?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(({ value, label, icon: Icon }) => {
        const active = current === value;
        return (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
              active
                ? "border-[#0070F3] text-[#0070F3] dark:text-[#60a5fa] bg-[#0070F3]/10 dark:bg-[#0070F3]/20"
                : "border-[#e5e5e7] dark:border-[#1a1a1a] text-[#6e6e73] dark:text-[#888888] hover:border-[#0070F3]/30 hover:text-[#0070F3] dark:hover:text-[#EDEDED] bg-white dark:bg-[#0A0A0A]"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        );
      })}
      {/* Tags */}
      <span className="text-xs text-[#b0b0b0] dark:text-[#555] self-center ml-1">|</span>
      {TOP_TAGS.map((tag) => {
        const active = searchParams.get("tag") === tag;
        return (
          <button
            key={tag}
            onClick={() => handleSelect(tag)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all duration-200 ${
              active
                ? "border-[#f59e0b] text-[#f59e0b] dark:text-[#fbbf24] bg-[#f59e0b]/10 dark:bg-[#f59e0b]/20"
                : "border-[#e5e5e7] dark:border-[#1a1a1a] text-[#6e6e73] dark:text-[#888888] hover:border-[#f59e0b]/30 hover:text-[#f59e0b] bg-white dark:bg-[#0A0A0A]"
            }`}
          >
            # {tag}
          </button>
        );
      })}
    </div>
  );
}