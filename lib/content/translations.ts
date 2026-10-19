import path from "node:path";
import { ContentFields, ContentValidationError, loadContentCollection, type ContentFile } from "@/lib/content/shared";
import { DEFAULT_LOCALE, LOCALES, localeConfig, type Locale } from "@/lib/i18n/locales";
import { loadProjects } from "@/lib/projects";
import { loadTools } from "@/lib/tools";
import { loadNotes } from "@/lib/notes";

export type TranslationStatus = "draft" | "reviewed" | "published";
export type ContentVisibility = "production" | "preview";

export interface ContentQuery {
  locale?: Locale;
  visibility?: ContentVisibility;
}

export interface LocalizedContent {
  locale: Locale;
  translationOf: string;
  translationStatus: TranslationStatus;
  translatedAt?: string;
}

export type WithoutLocalization<T> = T extends LocalizedContent
  ? Omit<T, keyof LocalizedContent>
  : never;

export type TranslationAvailability = Record<string, readonly Locale[]>;
export type ContentCollection = "projects" | "tools" | "notes";
export type CollectionRoots = Partial<Record<ContentCollection, string>>;

export function translationDirectory(baseDirectory: string, locale: Locale): string {
  const segment = localeConfig(locale).segment;
  return segment ? path.join(baseDirectory, segment) : baseDirectory;
}

export function contentVisibility(
  env: { VERCEL_ENV?: string; CONTENT_PREVIEW?: string } = process.env as {
    VERCEL_ENV?: string;
    CONTENT_PREVIEW?: string;
  },
): ContentVisibility {
  return env.VERCEL_ENV === "preview" || env.CONTENT_PREVIEW === "1" ? "preview" : "production";
}

function isVisible(status: TranslationStatus, visibility: ContentVisibility): boolean {
  return status === "published" || (visibility === "preview" && status === "reviewed");
}

export function loadLocalizedContentCollection<T extends { slug: string }>(options: {
  directory: string;
  query?: ContentQuery;
  parse: (source: ContentFile) => T;
  allowMissingBase?: boolean;
}): Array<T & LocalizedContent> {
  const locale = options.query?.locale ?? DEFAULT_LOCALE;
  const visibility = options.query?.visibility ?? contentVisibility();
  const originals = loadContentCollection(options.directory, options.parse, {
    allowMissingDirectory: options.allowMissingBase,
  });
  const originalSlugs = new Set(originals.map((item) => item.slug));

  if (locale === DEFAULT_LOCALE) {
    return originals.map((item) => ({
      ...item,
      locale: DEFAULT_LOCALE,
      translationOf: item.slug,
      translationStatus: "published" as const,
    }));
  }

  const translated = loadContentCollection(
    translationDirectory(options.directory, locale),
    (source) => {
      const item = options.parse(source);
      const fields = new ContentFields(source.file, source.data);
      const declaredLocale = fields.enum("locale", [locale]);
      const translationOf = fields.string("translationOf");
      const translationStatus = fields.enum("translationStatus", ["draft", "reviewed", "published"] as const);
      const translatedAt = source.data.translatedAt === undefined ? undefined : fields.date("translatedAt");
      const filenameSlug = path.basename(source.file).replace(/\.mdx?$/, "");

      if (filenameSlug !== item.slug) {
        throw new ContentValidationError(source.file, "slug", `expected filename slug "${filenameSlug}"`);
      }
      if (translationOf !== item.slug) {
        throw new ContentValidationError(source.file, "translationOf", `expected "${item.slug}"`);
      }
      if (!originalSlugs.has(translationOf)) {
        throw new ContentValidationError(source.file, "translationOf", `original "${translationOf}" does not exist`);
      }

      return { ...item, locale: declaredLocale, translationOf, translationStatus, translatedAt };
    },
    { allowMissingDirectory: true },
  );

  return translated.filter((item) => isVisible(item.translationStatus, visibility));
}

function collectionDirectory(collection: ContentCollection, roots: CollectionRoots): string {
  return roots[collection] ?? path.join(process.cwd(), "content", collection);
}

function loadCollection(collection: ContentCollection, roots: CollectionRoots, query: ContentQuery) {
  const directory = collectionDirectory(collection, roots);
  if (collection === "projects") return loadProjects(directory, query);
  if (collection === "tools") return loadTools(directory, query);
  return loadNotes(directory, query);
}

export function getTranslationAvailability(
  collection: ContentCollection,
  slug: string,
  visibility: ContentVisibility,
  roots: CollectionRoots = {},
): Locale[] {
  return LOCALES.filter((locale) =>
    loadCollection(collection, roots, { locale, visibility }).some((item) => item.slug === slug),
  );
}

const corePaths = ["/", "/about", "/contact", "/privacy", "/projects", "/tools", "/notes"] as const;

export function buildTranslationAvailability(
  visibility: ContentVisibility,
  roots: CollectionRoots = {},
): TranslationAvailability {
  const result: TranslationAvailability = Object.fromEntries(corePaths.map((pathname) => [pathname, [...LOCALES]]));

  for (const collection of ["projects", "tools", "notes"] as const) {
    const byLocale = new Map(
      LOCALES.map((locale) => [locale, loadCollection(collection, roots, { locale, visibility })] as const),
    );
    const originals = byLocale.get(DEFAULT_LOCALE) ?? [];
    for (const original of originals) {
      result[`/${collection}/${encodeURIComponent(original.slug)}`] = LOCALES.filter((locale) =>
        (byLocale.get(locale) ?? []).some((item) => item.slug === original.slug),
      );
    }
  }

  return result;
}
