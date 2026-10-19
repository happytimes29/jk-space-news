import Image from "next/image";
import Link from "next/link";
import { getAllTools } from "@/lib/tools";
import { contentVisibility } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { StatusBadge } from "@/components/content/StatusBadge";
import { OpenToolLink } from "@/components/tools/OpenToolLink";

export async function ToolsPage({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const copy = dictionary.collections;
  const tools = await getAllTools({ locale, visibility: contentVisibility() });
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10"><h1 className="text-3xl font-bold">{copy.toolsTitle}</h1><p className="mt-3 text-[var(--color-muted)]">{copy.toolsDescription}</p></header>
      {tools.length === 0 ? <p>{copy.toolsEmpty}</p> : <div className="grid gap-6">{tools.map((tool) => (
        <article key={tool.slug} aria-label={tool.title} className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] md:grid md:grid-cols-2">
          {tool.coverImage && <div className="relative aspect-video"><Image src={tool.coverImage} alt={`${tool.title}${copy.toolImageAltSuffix}`} fill className="object-cover" /></div>}
          <div className="p-6"><StatusBadge status={tool.status} locale={locale} /><h2 className="mt-4 text-xl font-semibold"><Link href={localePath(locale, `/tools/${tool.slug}`)}>{tool.title}</Link></h2><p className="mt-3 leading-relaxed text-[var(--color-muted)]">{tool.summary}</p>
            <dl className="my-5 space-y-3 text-sm"><div><dt className="font-medium">{copy.toolDataProcessing}</dt><dd>{tool.privacy}</dd></div><div><dt className="font-medium">{copy.toolInputFormats}</dt><dd>{tool.inputTypes.join("、")}</dd></div><div><dt className="font-medium">{copy.toolOutputResults}</dt><dd>{tool.outputTypes.join("、")}</dd></div></dl>
            <div className="flex flex-wrap items-center gap-4">{tool.appUrl && <OpenToolLink slug={tool.slug} href={tool.appUrl} locale={locale} localized={tool.localizedApp}>{copy.toolOpen}</OpenToolLink>}<Link href={localePath(locale, `/tools/${tool.slug}`)} className="text-sm text-blue-600 hover:underline dark:text-blue-400">{copy.toolIntroduction}</Link></div>
          </div>
        </article>
      ))}</div>}
    </div>
  );
}
