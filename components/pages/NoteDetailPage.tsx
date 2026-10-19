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
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={articleJsonLd(note, locale, config)} />
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: dictionary.collections.notesTitle, pathname: "/notes" }, { name: note.title, pathname: `/notes/${note.slug}` }], config)} />
      <nav aria-label={dictionary.content.breadcrumbsLabel} className="mb-8 text-sm"><Link href={localePath(locale, "/notes")} className="text-blue-700 underline underline-offset-4 dark:text-blue-300">{dictionary.content.backNotes}</Link></nav>
      <header className="mb-8 space-y-5 border-b border-[#d4d4d8] pb-8 dark:border-[#303036]"><p className="text-sm text-blue-700 dark:text-blue-300">{noteTypeLabels(locale)[note.type]}</p><h1 className="break-words text-3xl font-bold leading-tight sm:text-4xl">{note.title}</h1><p className="leading-8 text-[#55555b] dark:text-[#a1a1aa]">{note.summary}</p>
        <dl className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#55555b] dark:text-[#a1a1aa]"><div><dt>{dictionary.content.author}</dt><dd>{note.author}</dd></div><div><dt>{dictionary.content.publishedDate}</dt><dd><time dateTime={note.publishedAt}>{note.publishedAt.slice(0, 10)}</time></dd></div><div><dt>{dictionary.common.lastUpdated}</dt><dd><time dateTime={note.updatedAt}>{note.updatedAt.slice(0, 10)}</time></dd></div><div><dt>{dictionary.content.readingTime}</dt><dd>{note.readingTime} {dictionary.common.minutes}</dd></div></dl>
        {note.tags.length > 0 && <ul aria-label={dictionary.collections.noteTagLabel} className="flex flex-wrap gap-2 text-xs">{note.tags.map((tag) => <li key={tag} className="rounded border border-[#d4d4d8] px-2 py-1 dark:border-[#303036]">{tag}</li>)}</ul>}
      </header>
      {note.type === "commentary" && <SourceDisclosure note={note} locale={locale} />}
      <div className="prose max-w-none break-words dark:prose-invert">{commentary ? <><section aria-labelledby="event-summary"><h2 id="event-summary">{dictionary.content.eventSummary}</h2><MDXRenderer source={commentary.summary} /></section><section aria-labelledby="my-opinion"><h2 id="my-opinion">{dictionary.content.myOpinion}</h2><MDXRenderer source={commentary.opinion} /></section></> : <MDXRenderer source={note.content} />}</div>
      {!!(note.relatedProjects?.length || note.relatedTools?.length) && <aside aria-label={dictionary.content.relatedTitle} className="mt-10 space-y-4 border-t border-[#d4d4d8] pt-6 dark:border-[#303036]"><h2 className="text-xl font-semibold">{dictionary.content.relatedTitle}</h2><ul className="space-y-3 break-words text-sm">
        {note.relatedProjects?.map((relatedSlug) => { const href = relatedTarget("projects", relatedSlug, locale, visibility); const fallback = locale !== "zh-TW" && !href.startsWith(localePath(locale, "/")); return <li key={`project-${relatedSlug}`}><Link href={href} className="text-blue-700 underline underline-offset-4 dark:text-blue-300">{dictionary.content.relatedProject}: {relatedSlug}{fallback ? ` (${dictionary.content.traditionalOriginal})` : ""}</Link></li>; })}
        {note.relatedTools?.map((relatedSlug) => { const href = relatedTarget("tools", relatedSlug, locale, visibility); const fallback = locale !== "zh-TW" && !href.startsWith(localePath(locale, "/")); return <li key={`tool-${relatedSlug}`}><Link href={href} className="text-blue-700 underline underline-offset-4 dark:text-blue-300">{dictionary.content.relatedTool}: {relatedSlug}{fallback ? ` (${dictionary.content.traditionalOriginal})` : ""}</Link></li>; })}
      </ul></aside>}
    </article>
  );
}
