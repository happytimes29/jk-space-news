import type { NowItem } from "@/lib/now";
import type { SiteDictionary } from "@/lib/i18n/dictionaries";

export function NowCard({ now, dictionary }: { now: NowItem; dictionary: SiteDictionary }) {
  return (
    <section aria-labelledby="now-title" className="rounded-[2rem] bg-[#fff0db] p-6 text-[#2b2117] sm:p-9 dark:bg-[#2a1c10] dark:text-[#fff2e2]">
      <h2 id="now-title" className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{dictionary.home.nowTitle}</h2>
      <p className="mt-4 text-sm font-medium text-[#876f56] dark:text-[#c9aa88]">{dictionary.home.nowUpdatedLabel} <time dateTime={now.updatedAt}>{now.updatedAt.slice(0, 10)}</time></p>
      <p className="mt-8 whitespace-pre-line text-base leading-8 text-[#65513d] dark:text-[#e1c7aa]">{now.content.trim()}</p>
    </section>
  );
}
