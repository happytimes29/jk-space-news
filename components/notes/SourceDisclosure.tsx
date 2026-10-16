import type { CommentaryNote } from "@/lib/notes";

export function SourceDisclosure({ note }: { note: CommentaryNote }) {
  return (
    <aside aria-label="原始來源" className="my-8 space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm leading-7 dark:border-blue-900 dark:bg-blue-950">
      <p>本文為站主個人觀點；事件資訊請參閱原始來源。</p>
      <p>原始來源：<a href={note.sourceUrl} className="break-words text-blue-700 underline underline-offset-4 dark:text-blue-300" target="_blank" rel="noopener noreferrer">{note.sourceTitle}</a></p>
      <p>事件或原文發布日期：<time dateTime={note.sourcePublishedAt}>{note.sourcePublishedAt.slice(0, 10)}</time></p>
    </aside>
  );
}
