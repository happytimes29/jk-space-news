import Image from "next/image";
import Link from "next/link";
import type { ToolItem } from "@/lib/tools";
import { StatusBadge } from "@/components/content/StatusBadge";
import { OpenToolLink } from "@/components/tools/OpenToolLink";
import type { SiteDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";

export function FeaturedTool({ tool, locale, dictionary }: { tool: ToolItem | null; locale: Locale; dictionary: SiteDictionary }) {
  return (
    <section aria-labelledby="tool-title" className="space-y-6">
      <h2 id="tool-title" className="text-2xl font-semibold tracking-tight">{dictionary.home.featuredToolTitle}</h2>
      {tool ? (
        <article aria-label={tool.title} className="overflow-hidden rounded-2xl border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-[#11151b]">
          <div className="grid items-center lg:grid-cols-[1fr_1.15fr]">
            <div className="min-w-0 space-y-5 p-5 sm:p-8">
              <StatusBadge status={tool.status} locale={locale} />
              <h3 className="text-2xl font-semibold leading-snug">{tool.title}</h3>
              <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">{tool.summary}</p>
              <p className="text-sm leading-7"><span className="font-medium">{dictionary.home.toolAudienceLabel}：</span>{dictionary.home.toolAudience}</p>
              <p className="border-l-2 border-blue-500 pl-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{tool.privacy}</p>
              <div className="flex flex-wrap items-center gap-5 pt-2">
                {tool.appUrl && <OpenToolLink slug={tool.slug} href={tool.appUrl}>{dictionary.home.toolUseNow}</OpenToolLink>}
                <Link href={localePath(locale, `/tools/${tool.slug}`)} className="text-sm text-blue-700 underline underline-offset-4 dark:text-blue-300">{dictionary.home.toolDetails}</Link>
              </div>
            </div>
            {tool.coverImage && (
              <figure className="min-w-0 border-t border-zinc-300 bg-[#0c1117] p-3 sm:p-5 lg:border-l lg:border-t-0 dark:border-zinc-700">
                <Image src={tool.coverImage} alt={`${tool.title}${dictionary.home.toolImageAltSuffix}`} width={1191} height={730} sizes="(max-width: 1023px) 100vw, 600px" className="h-auto w-full rounded-lg" />
                <figcaption className="mt-3 text-xs leading-5 text-zinc-400">{dictionary.home.toolCaption}</figcaption>
              </figure>
            )}
          </div>
        </article>
      ) : <p className="text-sm text-zinc-600 dark:text-zinc-400">{dictionary.home.toolEmpty}</p>}
    </section>
  );
}
