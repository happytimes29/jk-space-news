"use client";

import { useCallback, useRef } from "react";
import { parseTargetList } from "@/lib/pcb-tool/parser";

interface Props {
  value: string;
  onChange: (val: string) => void;
  targetCount: number;
}

export default function TargetListInput({ value, onChange, targetCount }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        // For CSV single-column, parse and join with newlines
        const set = parseTargetList(text);
        onChange(Array.from(set).join("\n"));
      };
      reader.readAsText(file, "utf-8");
      e.target.value = "";
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            區塊 C — Target List 白名單
          </p>
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
            留空 = 全板檢測；填入 TP 名稱以縮小比對範圍
          </p>
        </div>
        <div className="flex items-center gap-2">
          {targetCount > 0 && (
            <span className="text-xs text-[var(--tech-blue)] bg-[var(--tech-blue-glow)] px-2 py-0.5 rounded-full border border-[var(--tech-blue-dim)]">
              {targetCount} 個目標
            </span>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--tech-blue)] hover:border-[var(--tech-blue-dim)] transition-colors"
          >
            匯入 TXT / CSV
          </button>
          <input ref={fileRef} type="file" accept=".txt,.csv" className="hidden" onChange={handleFileUpload} />
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"TP1, TP2, TP3\n或每行一個名稱：\nTP1\nTP2\nTP3"}
        rows={5}
        className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2
          text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]
          focus:outline-none focus:border-[var(--tech-blue)] focus:ring-1 focus:ring-[var(--tech-blue)]
          font-mono transition-colors"
      />
    </div>
  );
}
