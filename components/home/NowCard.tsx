import type { NowItem } from "@/lib/now";
import type { SiteDictionary } from "@/lib/i18n/dictionaries";

export function NowCard({ now, dictionary }: { now: NowItem; dictionary: SiteDictionary }) {
  return (
    <section aria-labelledby="now-title" className="border-y border-zinc-300 py-8 dark:border-zinc-700">
      <div className="grid gap-5 md:grid-cols-[1fr_2fr]">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-blue-700 dark:text-blue-300">Now</p>
          <h2 id="now-title" className="text-2xl font-semibold tracking-tight">{dictionary.home.nowTitle}</h2>
          <p className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">{dictionary.home.nowUpdatedLabel} <time dateTime={now.updatedAt}>{now.updatedAt.slice(0, 10)}</time></p>
        </div>
        <p className="max-w-2xl whitespace-pre-line leading-8 text-zinc-600 dark:text-zinc-300">{now.content.trim()}</p>
      </div>
    </section>
  );
}
