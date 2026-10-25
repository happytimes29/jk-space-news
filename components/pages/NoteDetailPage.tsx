import { notFound } from "next/navigation";
import Link from "next/link";
import { getNoteBySlug } from "@/lib/notes";
import { parseCommentaryContent } from "@/lib/notes-content";
import { getTranslationAvailability, type ContentVisibility, type ContentCollection } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { getSiteConfig } from "@/lib/site-config";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { noteTypeLabels } from "@/app/notes/notes-view";
import { MDXRenderer } from "@/components/MDXRenderer";
import { SourceDisclosure } from "@/components/notes/SourceDisclosure";
import { JsonLd } from "@/components/JsonLd";

function relatedTarget(collection: ContentCollection, slug: string, locale: Locale, visibility: ContentVisibility) {
  return getTranslationAvailability(collection, slug, visibility).includes(locale)
    ? localePath(locale, `/${collection}/${encodeURIComponent(slug)}`)
    : `/${collection}/${encodeURIComponent(slug)}`;
}

export async function NoteDetailPage({ locale, slug, visibility }: { locale: Locale; slug: string; visibility: ContentVisibility }) {
  const note = await getNoteBySlug(slug, { locale, visibility });
  if (!note) notFound();
  const dictionary = getDictionary(locale);
  const config = getSiteConfig(locale);
  const commentary = note.type === "commentary" ? parseCommentaryContent(note.content, note.slug) : undefined;
  return (
    <article className="editorial-page editorial-detail editorial-note-detail">
      <div className="editorial-page__shell editorial-reading-shell">
        <JsonLd data={articleJsonLd(note, locale, config)} />
        <JsonLd data={breadcrumbJsonLd(locale, [{ name: dictionary.collections.notesTitle, pathname: "/notes" }, { name: note.title, pathname: `/notes/${note.slug}` }], config)} />
        <nav aria-label={dictionary.content.breadcrumbsLabel} className="editorial-breadcrumb"><Link href={localePath(locale, "/notes")}>{dictionary.content.backNotes}</Link></nav>
        <header className="editorial-note-hero"><p className="editorial-page__kicker">{noteTypeLabels(locale)[note.type]}</p><h1>{note.title}</h1><p className="editorial-detail-hero__summary">{note.summary}</p>
          <dl className="editorial-note-meta"><div><dt>{dictionary.content.author}</dt><dd>{note.author}</dd></div><div><dt>{dictionary.content.publishedDate}</dt><dd><time dateTime={note.publishedAt}>{note.publishedAt.slice(0, 10)}</time></dd></div><div><dt>{dictionary.common.lastUpdated}</dt><dd><time dateTime={note.updatedAt}>{note.updatedAt.slice(0, 10)}</time></dd></div><div><dt>{dictionary.content.readingTime}</dt><dd>{note.readingTime} {dictionary.common.minutes}</dd></div></dl>
          {note.tags.length > 0 && <ul aria-label={dictionary.collections.noteTagLabel} className="editorial-tag-list">{note.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
        </header>
        {note.type === "commentary" && <SourceDisclosure note={note} locale={locale} />}
        <div className="editorial-prose prose max-w-none break-words">{commentary ? <><section aria-labelledby="event-summary"><h2 id="event-summary">{dictionary.content.eventSummary}</h2><MDXRenderer source={commentary.summary} /></section><section aria-labelledby="my-opinion"><h2 id="my-opinion">{dictionary.content.myOpinion}</h2><MDXRenderer source={commentary.opinion} /></section></> : <MDXRenderer source={note.content} />}</div>
        {!!(note.relatedProjects?.length || note.relatedTools?.length) && <aside aria-label={dictionary.content.relatedTitle} className="editorial-related"><h2>{dictionary.content.relatedTitle}</h2><ul>
          {note.relatedProjects?.map((relatedSlug) => { const href = relatedTarget("projects", relatedSlug, locale, visibility); const fallback = locale !== "zh-TW" && !href.startsWith(localePath(locale, "/")); return <li key={`project-${relatedSlug}`}><Link href={href}>{dictionary.content.relatedProject}: {relatedSlug}{fallback ? ` (${dictionary.content.traditionalOriginal})` : ""}</Link></li>; })}
          {note.relatedTools?.map((relatedSlug) => { const href = relatedTarget("tools", relatedSlug, locale, visibility); const fallback = locale !== "zh-TW" && !href.startsWith(localePath(locale, "/")); return <li key={`tool-${relatedSlug}`}><Link href={href}>{dictionary.content.relatedTool}: {relatedSlug}{fallback ? ` (${dictionary.content.traditionalOriginal})` : ""}</Link></li>; })}
        </ul></aside>}
      </div>
    </article>
  );
}
