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
    <div className="editorial-page editorial-collection">
      <div className="editorial-page__shell">
        <header className="editorial-page__intro">
          <div><p className="editorial-page__kicker">02 / {dictionary.navigation.tools}</p><h1>{copy.toolsTitle}</h1></div>
          <p className="editorial-page__lede">{copy.toolsDescription}</p>
        </header>
        {tools.length === 0 ? <div className="editorial-empty"><p>{copy.toolsEmpty}</p></div> : <div className="editorial-tools-list">{tools.map((tool, index) => (
          <article key={tool.slug} aria-label={tool.title} className={`editorial-tool-row${tool.coverImage ? "" : " editorial-tool-row--no-cover"}`}>
            {tool.coverImage && <figure className="editorial-tool-row__visual"><Image src={tool.coverImage} alt={`${tool.title}${copy.toolImageAltSuffix}`} fill sizes="(max-width: 767px) 100vw, 45vw" className="object-cover" /><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span></figure>}
            <div className="editorial-tool-row__body">
              <div className="editorial-tool-row__status"><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><StatusBadge status={tool.status} locale={locale} /></div>
              <h2><Link href={localePath(locale, `/tools/${tool.slug}`)}>{tool.title}</Link></h2>
              <p className="editorial-tool-row__summary">{tool.summary}</p>
              <dl className="editorial-tool-row__facts"><div><dt>{copy.toolDataProcessing}</dt><dd>{tool.privacy}</dd></div><div><dt>{copy.toolInputFormats}</dt><dd>{tool.inputTypes.join("、")}</dd></div><div><dt>{copy.toolOutputResults}</dt><dd>{tool.outputTypes.join("、")}</dd></div></dl>
              <div className="editorial-tool-row__actions">{tool.appUrl && <OpenToolLink slug={tool.slug} href={tool.appUrl} locale={locale} localized={tool.localizedApp}>{copy.toolOpen}</OpenToolLink>}<Link href={localePath(locale, `/tools/${tool.slug}`)}>{copy.toolIntroduction}</Link></div>
            </div>
          </article>
        ))}</div>}
      </div>
    </div>
  );
}
