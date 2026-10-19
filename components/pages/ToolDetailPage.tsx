import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getToolBySlug } from "@/lib/tools";
import { getTranslationAvailability, type ContentVisibility } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { getSiteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd, toolJsonLd } from "@/lib/seo";
import { MDXRenderer } from "@/components/MDXRenderer";
import { StatusBadge } from "@/components/content/StatusBadge";
import { OpenToolLink } from "@/components/tools/OpenToolLink";
import { JsonLd } from "@/components/JsonLd";

export async function ToolDetailPage({ locale, slug, visibility }: { locale: Locale; slug: string; visibility: ContentVisibility }) {
  const tool = await getToolBySlug(slug, { locale, visibility });
  if (!tool) notFound();
  const dictionary = getDictionary(locale);
  const config = getSiteConfig(locale);
  const relatedProjectAvailable = tool.relatedProject ? getTranslationAvailability("projects", tool.relatedProject, visibility).includes(locale) : false;
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={toolJsonLd(tool, locale, config)} />
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: dictionary.collections.toolsTitle, pathname: "/tools" }, { name: tool.title, pathname: `/tools/${tool.slug}` }], config)} />
      <nav aria-label={dictionary.content.breadcrumbsLabel}><Link href={localePath(locale, "/tools")} className="text-sm text-blue-600 hover:underline dark:text-blue-400">{dictionary.content.backTools}</Link></nav>
      <header className="mb-8 mt-8"><StatusBadge status={tool.status} locale={locale} /><h1 className="mt-4 text-3xl font-bold leading-tight">{tool.title}</h1><p className="mt-4 leading-relaxed text-[var(--color-muted)]">{tool.summary}</p><p className="mt-4 text-sm">{dictionary.common.lastUpdated}：<time dateTime={tool.updatedAt}>{tool.updatedAt.slice(0, 10)}</time></p>
        <dl className="my-6 space-y-3 rounded-xl border border-[var(--color-border)] p-5 text-sm"><div><dt className="font-semibold">{dictionary.content.privacyLabel}</dt><dd>{tool.privacy}</dd></div><div><dt className="font-semibold">{dictionary.content.inputFormats}</dt><dd>{tool.inputTypes.join("、")}</dd></div><div><dt className="font-semibold">{dictionary.content.outputResults}</dt><dd>{tool.outputTypes.join("、")}</dd></div></dl>
        {tool.appUrl && <div className="space-y-2"><OpenToolLink slug={tool.slug} href={tool.appUrl} locale={locale} localized={tool.localizedApp}>{dictionary.content.openTool}</OpenToolLink>{locale !== "zh-TW" && !tool.localizedApp && <p className="text-xs text-[var(--color-muted)]">{dictionary.content.originalToolNotice}</p>}</div>}
      </header>
      {tool.coverImage && <div className="relative mb-10 aspect-video overflow-hidden rounded-xl border border-[var(--color-border)]"><Image src={tool.coverImage} alt={`${tool.title}${dictionary.content.imageAltSuffix}`} fill className="object-cover" priority /></div>}
      <div className="prose"><MDXRenderer source={tool.content} /></div>
      <footer className="mt-10 flex flex-wrap gap-5 border-t border-[var(--color-border)] pt-6 text-sm text-blue-600 dark:text-blue-400">
        {tool.relatedProject && <Link href={relatedProjectAvailable ? localePath(locale, `/projects/${tool.relatedProject}`) : `/projects/${tool.relatedProject}`} className="hover:underline">{dictionary.content.relatedProject}{!relatedProjectAvailable && locale !== "zh-TW" ? ` (${dictionary.content.traditionalOriginal})` : ""}</Link>}
        {tool.sampleUrl && <a href={tool.sampleUrl} className="hover:underline">{dictionary.content.sampleDownload}</a>}
        {tool.repositoryUrl && <a href={tool.repositoryUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{dictionary.content.sourceCode}</a>}
        <Link href={localePath(locale, "/contact")} className="hover:underline">{dictionary.content.toolFeedback}</Link>
      </footer>
    </article>
  );
}
