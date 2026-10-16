import Link from "next/link";
import type { NoteType } from "@/lib/notes";
import { noteTypeLabels } from "@/app/notes/notes-view";

export function NoteFilter({ type }: { type?: NoteType }) {
  return (
    <nav aria-label="筆記分類" className="mb-8 flex flex-wrap gap-2">
      {[{ value: undefined, label: "全部" }, ...Object.entries(noteTypeLabels).map(([value, label]) => ({ value, label }))].map(({ value, label }) => (
        <Link key={value ?? "all"} href={value ? `/notes?type=${value}` : "/notes"} aria-current={type === value ? "page" : undefined}
          className={`rounded-lg border px-4 py-2 text-sm ${type === value ? "border-blue-700 bg-blue-700 text-white" : "border-[#d4d4d8] hover:border-blue-600 dark:border-[#55555b]"}`}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
