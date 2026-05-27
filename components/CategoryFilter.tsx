"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Cpu, Layers, Rocket, Hash } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "全部", icon: Hash },
  { value: "AI", label: "AI 應用", icon: Cpu },
  { value: "硬體", label: "硬體", icon: Layers },
  { value: "數位創業", label: "數位創業", icon: Rocket },
];

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("cat") || "all";

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("cat");
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
                ? "border-[#0070F3] text-[#0070F3] bg-[#0070F3]/10"
                : "border-[#1a1a1a] text-[#888888] hover:border-[#333] hover:text-[#EDEDED] bg-[#0A0A0A]"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
