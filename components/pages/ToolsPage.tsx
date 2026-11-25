import Image from "next/image";
import Link from "next/link";
import { getAllTools } from "@/lib/tools";
import { getAllProjects } from "@/lib/projects";
import { contentVisibility } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { StatusBadge } from "@/components/content/StatusBadge";
import { OpenToolLink } from "@/components/tools/OpenToolLink";

export async function ToolsPage({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const copy = dictionary.collections;
  const query = { locale, visibility: contentVisibility() };
  const [tools, projects] = await Promise.all([getAllTools(query), getAllProjects(query)]);
  return (
    <div className="v2-editorial-page v2-collection v2-tools-index">
      <div className="v2-page-shell">
        <header className="v2-collection-intro">
          <div><h1>{dictionary.navigation.work}</h1></div>
          <p className="v2-page-lede">{copy.toolsDescription}</p>
        </header>
        <div className="signal-jump-links">
          <Link href="#tools" className="signal-jump-link">{dictionary.navigation.tools}</Link>
          {projects.length > 0 && <Link href="#projects" className="signal-jump-link">{dictionary.navigation.projects}</Link>}
        </div>
        <section id="tools" className="signal-index-section" aria-labelledby="work-tools-heading">
          <h2 id="work-tools-heading">{dictionary.navigation.tools}</h2>
          {tools.length === 0 ? <div className="v2-empty"><p>{copy.toolsEmpty}</p></div> : <div className="v2-tools-list">{tools.map((tool, index) => (
          <article key={tool.slug} aria-label={tool.title} className={`v2-tool-row${tool.coverImage ? "" : " v2-tool-row--no-cover"}`}>
            {tool.coverImage && <figure className="v2-tool-row__visual"><Image src={tool.coverImage} alt={`${tool.title}${copy.toolImageAltSuffix}`} fill sizes="(max-width: 767px) 100vw, 45vw" className="object-cover" /><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span></figure>}
            <div className="v2-tool-row__body">
              <div className="v2-tool-row__status"><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><StatusBadge status={tool.status} locale={locale} /></div>
              <h3><Link href={localePath(locale, `/tools/${tool.slug}`)}>{tool.title}</Link></h3>
              <p className="v2-tool-row__summary">{tool.summary}</p>
              <dl className="v2-tool-row__facts"><div><dt>{copy.toolDataProcessing}</dt><dd>{tool.privacy}</dd></div><div><dt>{copy.toolInputFormats}</dt><dd>{tool.inputTypes.join("、")}</dd></div><div><dt>{copy.toolOutputResults}</dt><dd>{tool.outputTypes.join("、")}</dd></div></dl>
              <div className="v2-tool-row__actions">{tool.appUrl && <OpenToolLink slug={tool.slug} href={tool.appUrl} locale={locale} localized={tool.localizedApp}>{copy.toolOpen}</OpenToolLink>}<Link href={localePath(locale, `/tools/${tool.slug}`)}>{copy.toolIntroduction}</Link></div>
            </div>
          </article>
          ))}</div>}
        </section>
        {projects.length > 0 && (
          <section id="projects" className="signal-index-section" aria-labelledby="work-projects-heading">
            <h2 id="work-projects-heading">{dictionary.navigation.projects}</h2>
            <div className="signal-project-grid">
              {projects.map(project => (
                <article key={project.slug} className="signal-project-card">
                  <StatusBadge status={project.status} locale={locale} />
                  <h3><Link href={localePath(locale, `/projects/${project.slug}`)}>{project.title}</Link></h3>
                  <p>{project.summary}</p>
                </article>
              ))}
            </div>
            <Link className="signal-jump-link" href={localePath(locale, "/projects")}>{dictionary.common.allProjects}</Link>
          </section>
        )}
      </div>
    </div>
  );
}
