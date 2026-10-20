import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ToolItem } from "@/lib/tools";
import { StatusBadge } from "@/components/content/StatusBadge";
import { OpenToolLink } from "@/components/tools/OpenToolLink";
import type { SiteDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";

export function FeaturedTool({ tool, locale, dictionary }: { tool: ToolItem | null; locale: Locale; dictionary: SiteDictionary }) {
  return (
    <section aria-labelledby="tool-title" className="home-enter-delay overflow-hidden rounded-[2.25rem] bg-[#171a21] text-white">
      <div className="grid lg:grid-cols-[minmax(19rem,0.72fr)_minmax(0,1.28fr)] lg:items-stretch">
        <div className="flex min-w-0 flex-col justify-between p-6 sm:p-10 lg:p-12">
          <div>
            <h2 id="tool-title" className="text-base font-semibold text-blue-300">{dictionary.home.featuredToolTitle}</h2>
            {tool ? (
              <>
                <h3 className="mt-8 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">{tool.title}</h3>
                <div className="mt-6"><StatusBadge status={tool.status} locale={locale} /></div>
                <p className="mt-6 text-base leading-8 text-zinc-300">{tool.summary}</p>
                <p className="mt-6 text-base leading-8 text-zinc-300"><span className="font-semibold text-white">{dictionary.home.toolAudienceLabel}：</span>{dictionary.home.toolAudience}</p>
                <p className="mt-6 text-base leading-8 text-blue-200">{tool.privacy}</p>
              </>
            ) : <p className="mt-8 text-base text-zinc-300">{dictionary.home.toolEmpty}</p>}
          </div>
          {tool && (
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              {tool.appUrl && <OpenToolLink slug={tool.slug} href={tool.appUrl} locale={locale} localized={tool.localizedApp}>{dictionary.home.toolUseNow}</OpenToolLink>}
              <Link href={localePath(locale, `/tools/${tool.slug}`)} className="group inline-flex items-center gap-2 text-base font-semibold text-white">
                {dictionary.home.toolDetails}<ArrowUpRight aria-hidden="true" size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>
        {tool?.coverImage && (
          <figure className="min-w-0 bg-[#0b0f15] p-3 sm:p-5 lg:flex lg:flex-col lg:justify-center lg:p-7">
            <Image src={tool.coverImage} alt={`${tool.title}${dictionary.home.toolImageAltSuffix}`} width={1191} height={730} sizes="(max-width: 1023px) 100vw, 760px" className="h-auto w-full rounded-2xl" />
            {tool.slug === "pcb-test-point" && <Image src="/images/pcb-tool-2.png" alt="" width={1191} height={844} sizes="(max-width: 1023px) 100vw, 760px" className="mt-3 aspect-[3/1] w-full rounded-2xl object-cover object-top" />}
            <figcaption className="mt-4 px-1 text-sm leading-6 text-zinc-400">{dictionary.home.toolCaption}</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
