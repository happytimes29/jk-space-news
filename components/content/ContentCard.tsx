import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  href: string;
  title: string;
  summary: string;
  children?: ReactNode;
}

export function ContentCard({ href, title, summary, children }: Props) {
  return (
    <article aria-label={title} className="min-w-0 space-y-5 rounded-2xl border border-[#d4d4d8] bg-white p-5 sm:p-7 dark:border-[#303036] dark:bg-[#111113]">
      <h2 className="break-words text-xl font-semibold leading-snug text-[#1a1a1a] dark:text-[#ededed]">
        <Link href={href} className="hover:text-blue-600 dark:hover:text-blue-300">{title}</Link>
      </h2>
      <p className="text-sm leading-7 text-[#55555b] dark:text-[#a1a1aa]">{summary}</p>
      {children}
    </article>
  );
}
