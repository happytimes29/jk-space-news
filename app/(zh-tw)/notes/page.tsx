import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { getAllNotes, type NoteType } from "@/lib/notes";
import { ContentCard } from "@/components/content/ContentCard";
import { NoteFilter } from "@/components/notes/NoteFilter";
import { filterNotes, noteTypeLabels } from "@/app/notes/notes-view";

export const metadata = buildPageMetadata({
  route: "/notes",
  title: "筆記與觀點", description: "JK Space 的原創工程筆記、AI 與自動化、專案紀錄與新聞觀點。",
});

interface Props { searchParams: Promise<{ type?: string | string[] }> }

export default async function NotesPage({ searchParams }: Props) {
  const query = (await searchParams).type;
  const type = typeof query === "string" && Object.hasOwn(noteTypeLabels, query) ? query as NoteType : undefined;
  const allNotes = await getAllNotes();
  const notes = filterNotes(allNotes, type);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">筆記與觀點</h1>
        <p className="max-w-2xl leading-7 text-[#55555b] dark:text-[#a1a1aa]">記錄親自遇到的工程問題、實驗與判斷。新聞觀點會清楚區分原始來源與我的評論。</p>
      </header>
      <NoteFilter type={type} />
      {notes.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {notes.map((note) => (
            <ContentCard key={note.slug} href={`/notes/${encodeURIComponent(note.slug)}`} title={note.title} summary={note.summary}>
              <p className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#55555b] dark:text-[#a1a1aa]">
                <span>{noteTypeLabels[note.type]}</span>
                <time dateTime={note.publishedAt}>{note.publishedAt.slice(0, 10)}</time>
                <span>{note.readingTime} 分鐘</span>
              </p>
              {note.tags.length > 0 && <ul aria-label="文章標籤" className="flex flex-wrap gap-2 text-xs text-[#55555b] dark:text-[#a1a1aa]">{note.tags.map((tag) => <li key={tag} className="rounded border border-[#d4d4d8] px-2 py-1 dark:border-[#303036]">{tag}</li>)}</ul>}
            </ContentCard>
          ))}
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-[#d4d4d8] p-6 dark:border-[#303036]">
          <p>{allNotes.length === 0 ? "筆記正在整理中" : "沒有符合分類的筆記"}</p>
          {allNotes.length > 0 && <Link href="/notes" className="text-blue-700 underline underline-offset-4 dark:text-blue-300">查看全部筆記</Link>}
        </div>
      )}
    </div>
  );
}
