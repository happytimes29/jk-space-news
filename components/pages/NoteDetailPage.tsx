import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllNotes, getNoteBySlug } from "@/lib/notes";
import { parseCommentaryContent } from "@/lib/notes-content";
import { getTranslationAvailability, type ContentVisibility, type ContentCollection } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { getSiteConfig } from "@/lib/site-config";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { noteTypeLabels } from "@/app/notes/notes-view";
import { MDXRenderer } from "@/components/MDXRenderer";
import { SourceDisclosure } from "@/components/notes/SourceDisclosure";
import { WeeklyReviewCard } from "@/components/notes/WeeklyReviewCard";
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
  const availableNotes = note.relatedNotes?.length ? await getAllNotes({ locale, visibility }) : [];
  const relatedNotes = [...new Set(note.relatedNotes)].flatMap((relatedSlug) => {
    const related = availableNotes.find((item) => item.slug === relatedSlug && item.slug !== note.slug);
    return related ? [related] : [];
  });
  return (
    <article className="v2-editorial-page v2-detail v2-note-detail">
      <div className="v2-page-shell v2-detail-shell v2-reading-shell">
        <JsonLd data={articleJsonLd(note, locale, config)} />
        <JsonLd data={breadcrumbJsonLd(locale, [{ name: dictionary.collections.notesTitle, pathname: "/notes" }, { name: note.title, pathname: `/notes/${note.slug}` }], config)} />
        <nav aria-label={dictionary.content.breadcrumbsLabel} className="v2-breadcrumb"><Link href={localePath(locale, "/notes")}>{dictionary.content.backNotes}</Link></nav>
        <header className="v2-note-hero"><p className="v2-page-kicker">{noteTypeLabels(locale)[note.type]}</p><h1>{note.title}</h1>{note.type !== "personal" && <p className="v2-detail-hero__summary">{note.summary}</p>}
          <dl className="v2-note-meta"><div><dt>{dictionary.content.author}</dt><dd>{note.author}</dd></div><div><dt>{dictionary.content.publishedDate}</dt><dd><time dateTime={note.publishedAt}>{note.publishedAt.slice(0, 10)}</time></dd></div><div><dt>{dictionary.common.lastUpdated}</dt><dd><time dateTime={note.updatedAt}>{note.updatedAt.slice(0, 10)}</time></dd></div><div><dt>{dictionary.content.readingTime}</dt><dd>{note.readingTime} {dictionary.common.minutes}</dd></div></dl>
          {note.tags.length > 0 && <ul aria-label={dictionary.collections.noteTagLabel} className="v2-tag-list">{note.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
        </header>
        {note.coverImage && (
          <figure className="v2-note-cover">
            <Image src={note.coverImage} alt={note.coverImageAlt ?? note.title} fill sizes="(max-width: 960px) calc(100vw - 2rem), 58rem" loading="eager" fetchPriority="high" />
          </figure>
        )}
        {note.type === "commentary" && <SourceDisclosure note={note} locale={locale} />}
        <div className="v2-prose prose max-w-none break-words">{commentary ? <><section aria-labelledby="event-summary"><h2 id="event-summary">{dictionary.content.eventSummary}</h2><MDXRenderer source={commentary.summary} /></section><section aria-labelledby="my-opinion"><h2 id="my-opinion">{dictionary.content.myOpinion}</h2><MDXRenderer source={commentary.opinion} /></section></> : <MDXRenderer source={note.content} />}</div>
        {note.weeklyReviewTemplate && <WeeklyReviewCard locale={locale} />}
        {relatedNotes.length > 0 && (
          <aside className="v2-related" aria-labelledby="related-notes">
            <h2 id="related-notes">{dictionary.content.relatedReadingTitle}</h2>
            <ul>
              {relatedNotes.map((item) => (
                <li key={item.slug}><Link href={localePath(locale, `/notes/${encodeURIComponent(item.slug)}`)}>{item.title}</Link></li>
              ))}
            </ul>
          </aside>
        )}
        {!!(note.relatedProjects?.length || note.relatedTools?.length) && <aside aria-label={dictionary.content.relatedTitle} className="v2-related"><h2>{dictionary.content.relatedTitle}</h2><ul>
          {note.relatedProjects?.map((relatedSlug) => { const href = relatedTarget("projects", relatedSlug, locale, visibility); const fallback = locale !== "zh-TW" && !href.startsWith(localePath(locale, "/")); return <li key={`project-${relatedSlug}`}><Link href={href}>{dictionary.content.relatedProject}: {relatedSlug}{fallback ? ` (${dictionary.content.traditionalOriginal})` : ""}</Link></li>; })}
          {note.relatedTools?.map((relatedSlug) => { const href = relatedTarget("tools", relatedSlug, locale, visibility); const fallback = locale !== "zh-TW" && !href.startsWith(localePath(locale, "/")); return <li key={`tool-${relatedSlug}`}><Link href={href}>{dictionary.content.relatedTool}: {relatedSlug}{fallback ? ` (${dictionary.content.traditionalOriginal})` : ""}</Link></li>; })}
        </ul></aside>}
      </div>
    </article>
  );
}
