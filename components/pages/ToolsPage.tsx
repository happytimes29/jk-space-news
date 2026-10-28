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
    <div className="v2-editorial-page v2-collection v2-tools-index">
      <div className="v2-page-shell">
        <header className="v2-collection-intro">
          <div><p className="v2-page-kicker">02 / {dictionary.navigation.tools}</p><h1>{copy.toolsTitle}</h1></div>
          <p className="v2-page-lede">{copy.toolsDescription}</p>
        </header>
        {tools.length === 0 ? <div className="v2-empty"><p>{copy.toolsEmpty}</p></div> : <div className="v2-tools-list">{tools.map((tool, index) => (
          <article key={tool.slug} aria-label={tool.title} className={`v2-tool-row${tool.coverImage ? "" : " v2-tool-row--no-cover"}`}>
            {tool.coverImage && <figure className="v2-tool-row__visual"><Image src={tool.coverImage} alt={`${tool.title}${copy.toolImageAltSuffix}`} fill sizes="(max-width: 767px) 100vw, 45vw" className="object-cover" /><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span></figure>}
            <div className="v2-tool-row__body">
              <div className="v2-tool-row__status"><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><StatusBadge status={tool.status} locale={locale} /></div>
              <h2><Link href={localePath(locale, `/tools/${tool.slug}`)}>{tool.title}</Link></h2>
              <p className="v2-tool-row__summary">{tool.summary}</p>
              <dl className="v2-tool-row__facts"><div><dt>{copy.toolDataProcessing}</dt><dd>{tool.privacy}</dd></div><div><dt>{copy.toolInputFormats}</dt><dd>{tool.inputTypes.join("、")}</dd></div><div><dt>{copy.toolOutputResults}</dt><dd>{tool.outputTypes.join("、")}</dd></div></dl>
              <div className="v2-tool-row__actions">{tool.appUrl && <OpenToolLink slug={tool.slug} href={tool.appUrl} locale={locale} localized={tool.localizedApp}>{copy.toolOpen}</OpenToolLink>}<Link href={localePath(locale, `/tools/${tool.slug}`)}>{copy.toolIntroduction}</Link></div>
            </div>
          </article>
        ))}</div>}
      </div>
    </div>
  );
}
