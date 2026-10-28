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
  const hasDetailLinks = Boolean(tool.relatedProject || tool.sampleUrl || tool.repositoryUrl);
  return (
    <article className="v2-editorial-page v2-detail v2-tool-detail">
      <div className="v2-page-shell v2-detail-shell">
        <JsonLd data={toolJsonLd(tool, locale, config)} />
        <JsonLd data={breadcrumbJsonLd(locale, [{ name: dictionary.collections.toolsTitle, pathname: "/tools" }, { name: tool.title, pathname: `/tools/${tool.slug}` }], config)} />
        <nav aria-label={dictionary.content.breadcrumbsLabel} className="v2-breadcrumb"><Link href={localePath(locale, "/tools")}>{dictionary.content.backTools}</Link></nav>
        <header className="v2-detail-hero">
          <div className="v2-detail-hero__main">
            <div className="v2-detail-hero__labels"><StatusBadge status={tool.status} locale={locale} /></div>
            <h1>{tool.title}</h1>
            <p className="v2-detail-hero__summary">{tool.summary}</p>
            {tool.appUrl && <div className="v2-detail-hero__action"><OpenToolLink slug={tool.slug} href={tool.appUrl} locale={locale} localized={tool.localizedApp}>{dictionary.content.openTool}</OpenToolLink>{locale !== "zh-TW" && !tool.localizedApp && <p>{dictionary.content.originalToolNotice}</p>}</div>}
          </div>
          <aside className="v2-detail-hero__aside">
            <p className="v2-detail-date">{dictionary.common.lastUpdated}：<time dateTime={tool.updatedAt}>{tool.updatedAt.slice(0, 10)}</time></p>
            <dl className="v2-detail-facts"><div><dt>{dictionary.content.privacyLabel}</dt><dd>{tool.privacy}</dd></div><div><dt>{dictionary.content.inputFormats}</dt><dd>{tool.inputTypes.join("、")}</dd></div><div><dt>{dictionary.content.outputResults}</dt><dd>{tool.outputTypes.join("、")}</dd></div></dl>
          </aside>
        </header>
        {tool.coverImage && <figure className="v2-detail__cover"><Image src={tool.coverImage} alt={`${tool.title}${dictionary.content.imageAltSuffix}`} fill sizes="(max-width: 768px) 100vw, 1280px" className="object-cover" priority /></figure>}
        <div className="v2-prose prose"><MDXRenderer source={tool.content} /></div>
        <footer className={hasDetailLinks ? "v2-detail-links" : "v2-detail-feedback"}>
          {tool.relatedProject && <Link href={relatedProjectAvailable ? localePath(locale, `/projects/${tool.relatedProject}`) : `/projects/${tool.relatedProject}`}>{dictionary.content.relatedProject}{!relatedProjectAvailable && locale !== "zh-TW" ? ` (${dictionary.content.traditionalOriginal})` : ""}</Link>}
          {tool.sampleUrl && <a href={tool.sampleUrl}>{dictionary.content.sampleDownload}</a>}
          {tool.repositoryUrl && <a href={tool.repositoryUrl} target="_blank" rel="noopener noreferrer">{dictionary.content.sourceCode}</a>}
          <Link href={localePath(locale, "/contact")}>{dictionary.content.toolFeedback}</Link>
        </footer>
      </div>
    </article>
  );
}
