"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  label: string;
  sublabel?: string;
  accept?: string;
  onFile: (content: string, filename: string) => void;
  fileName?: string;
  recordCount?: number;
  /** Text after the count, e.g. "筆資料" or "個圖元". Defaults to "筆資料". */
  recordLabel?: string;
  colorClass?: string;
}

export default function DropZone({
  label,
  sublabel,
  accept = ".html,.htm",
  onFile,
  fileName,
  recordCount,
  recordLabel = "筆資料",
  colorClass = "border-[var(--tech-blue-dim)]",
}: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const readFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onFile(text, file.name);
      };
      reader.readAsText(file, "utf-8");
    },
    [onFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    },
    [readFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) readFile(file);
      e.target.value = "";
    },
    [readFile]
  );

  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all duration-200
        ${dragging ? "border-[var(--tech-blue)] bg-[var(--tech-blue-glow)]" : colorClass + " bg-[var(--surface)] hover:bg-[var(--surface-2)]"}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {fileName ? (
        <>
          <svg className="w-8 h-8 text-[var(--tech-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-[var(--tech-blue)] truncate max-w-full px-2">{fileName}</p>
          {recordCount !== undefined && (
            <p className="text-xs text-[var(--foreground-muted)]">{recordCount} {recordLabel}</p>
          )}
        </>
      ) : (
        <>
          <svg className="w-8 h-8 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
          {sublabel && <p className="text-xs text-[var(--foreground-muted)] text-center">{sublabel}</p>}
          <p className="text-xs text-[var(--foreground-muted)]">拖曳或點擊上傳 HTML</p>
        </>
      )}
    </div>
  );
}
