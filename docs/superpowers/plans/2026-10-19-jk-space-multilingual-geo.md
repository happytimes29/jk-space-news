# JK Space Multilingual SEO and GEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add stable Traditional Chinese, Simplified Chinese, and English routing, phased translations, locale-aware SEO/GEO, and explicit AI crawler policy without changing existing Traditional Chinese public URLs.

**Architecture:** Keep Traditional Chinese at unprefixed routes and add `/zh-cn` and `/en` through separate App Router root layouts backed by shared page components. A typed locale registry, strict JSON dictionaries, and locale-aware Markdown loaders become the single source for navigation, search, metadata, sitemap, schemas, and translation availability; only published translations enter production output.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, JSON dictionaries, Markdown/MDX with gray-matter and js-yaml, Vitest/Testing Library, Playwright, Vercel Analytics.

**Spec:** `docs/superpowers/specs/2026-10-19-jk-space-multilingual-geo-design.md`

## Global Constraints

- Locale contract is exact: `zh-TW` has no URL prefix, `zh-CN` uses `/zh-cn`, and `en` uses `/en`.
- HTML language values are `zh-Hant-TW`, `zh-Hans-CN`, and `en`; `hreflang` values are `zh-Hant-TW`, `zh-Hans-CN`, `en`, plus `x-default`.
- Existing unprefixed routes and content remain canonical Traditional Chinese URLs; do not migrate or redirect them to `/zh-tw`.
- Browser language may show a suggestion only. Never use IP geolocation, locale-adaptive page bodies, or an automatic language redirect.
- The explicit `jk-locale` cookie lasts one year with `SameSite=Lax`; invalid values are ignored.
- Interface and core-page copy lives in exactly `locales/zh-TW.json`, `locales/zh-CN.json`, and `locales/en.json` with identical non-empty key sets.
- Translated content lives below `content/{projects,tools,notes}/{zh-cn,en}/`; original files stay where they are.
- Production includes only `translationStatus: published`; Preview includes `reviewed` and `published`; `draft` is never routable.
- A missing or unpublished translation returns 404 and is absent from search, sitemap, RSS, canonical alternates, and the active language link.
- Do not invent a Note solely to satisfy a demo. The repository currently has no original Notes: implement and fixture-test localized Notes, but create real Note translations only after an original Note exists.
- Allow `OAI-SearchBot` and public search crawlers; block `GPTBot` at `/`. Do not add or depend on `llms.txt` in this plan.
- Do not add automatic translation services, a CMS, or a new i18n runtime dependency.
- Do not touch or publish the sibling private `researchmfg-library` archive.
- Do not push, create a PR, merge, or deploy until the owner reviews the completed local branch.

## Review Focus

- Encoded content slugs, query strings, and URL fragments must survive a language switch without double encoding or a broken route; Task 3 owns the regression test.
- `draft`, `reviewed`, and `published` must remain distinct across local Preview and production so an unpublished translation never leaks; Task 2 owns the regression test.
- A missing, extra, nested, or empty dictionary key must fail validation before rendering; Task 1 owns the regression test.
- Unknown locale segments and invalid `jk-locale` cookie values must never select a dictionary or create a redirect loop; Task 3 owns the regression test.
- A related Project, Tool, or Note without a translation must link to a clearly labeled Traditional Chinese original rather than a nonexistent localized route; Task 6 owns the regression test.

---

### Task 1: Locale Registry and Strict Dictionaries

**Files:**
- Create: `lib/i18n/locales.ts`
- Create: `lib/i18n/locales.test.ts`
- Create: `lib/i18n/dictionaries.ts`
- Create: `lib/i18n/dictionaries.test.ts`
- Create: `locales/zh-TW.json`
- Create: `locales/zh-CN.json`
- Create: `locales/en.json`
- Modify: `lib/site-config.ts`
- Modify: `lib/site-config.test.ts`

**Interfaces:**
- Produces: `type Locale = "zh-TW" | "zh-CN" | "en"`.
- Produces: `LOCALES`, `DEFAULT_LOCALE`, `localeConfig(locale)`, `localeFromSegment(segment)`, `localePath(locale, pathname)`, and `splitLocalePath(pathname)` in `lib/i18n/locales.ts`.
- Produces: `type SiteDictionary`, `getDictionary(locale): SiteDictionary`, and `validateDictionary(reference, candidate, locale): void` in `lib/i18n/dictionaries.ts`.
- Produces: `getSiteConfig(locale): SiteConfig`; `siteConfig` remains the `zh-TW` compatibility export.

- [ ] **Step 1: Write failing locale and dictionary tests**

Assert the exact locale table, `/about` → `/en/about`, `/zh-cn/about` → `{ locale: "zh-CN", pathname: "/about" }`, encoded path preservation, and rejection of `fr`, `zh-tw`, empty, extra, nested, and empty-string dictionary keys. Assert English metadata includes `JK Space — Personal Engineering Lab` and Simplified Chinese navigation includes `项目`.

- [ ] **Step 2: Run the focused tests and observe RED**

Run: `npm test -- lib/i18n/locales.test.ts lib/i18n/dictionaries.test.ts lib/site-config.test.ts`  
Expected: FAIL because the registry, dictionaries, and localized config do not exist.

- [ ] **Step 3: Implement the locale registry and complete JSON dictionaries**

Define exact locale metadata and a recursive structural validator. Populate all three JSON files with the shared shell, core-page, collection-list, status, search, 404, metadata, and language-suggestion keys required by later tasks; do not add placeholder copy.

- [ ] **Step 4: Localize site config without changing its public contacts or URL**

Implement `getSiteConfig(locale)` from the validated dictionary while keeping contacts identical for every locale and keeping `siteConfig` as the existing Traditional Chinese value.

- [ ] **Step 5: Run focused and baseline tests**

Run: `npm test -- lib/i18n/locales.test.ts lib/i18n/dictionaries.test.ts lib/site-config.test.ts`  
Expected: PASS with all three dictionaries validated.

- [ ] **Step 6: Commit**

```bash
git add lib/i18n locales lib/site-config.ts lib/site-config.test.ts
git commit -m "feat: add strict multilingual dictionaries"
```

### Task 2: Localized Content State and Availability

**Files:**
- Create: `lib/content/translations.ts`
- Create: `lib/content/translations.test.ts`
- Modify: `lib/content/shared.ts`
- Modify: `lib/content/test-fixtures.ts`
- Modify: `lib/projects.ts`
- Modify: `lib/projects.test.ts`
- Modify: `lib/tools.ts`
- Modify: `lib/tools.test.ts`
- Modify: `lib/notes.ts`
- Modify: `lib/notes.test.ts`

**Interfaces:**
- Consumes: `Locale` and `localeConfig` from Task 1.
- Produces: `type TranslationStatus = "draft" | "reviewed" | "published"` and `type ContentVisibility = "production" | "preview"`.
- Produces: `interface ContentQuery { locale?: Locale; visibility?: ContentVisibility }`.
- Produces: `type TranslationAvailability = Record<string, readonly Locale[]>`.
- Produces: `translationDirectory(baseDirectory, locale): string`, `contentVisibility(env?): ContentVisibility`, `getTranslationAvailability(collection, slug, visibility): Locale[]`, and `buildTranslationAvailability(visibility): TranslationAvailability`.
- Changes: `loadProjects`, `loadTools`, and `loadNotes` accept `(directory?, query?)`; async getters accept `query?: ContentQuery`.
- Changes: every returned content item exposes normalized `locale`, `translationOf`, `translationStatus`, and optional `translatedAt`; existing originals normalize to `zh-TW`, their own slug, and `published`.

- [ ] **Step 1: Write failing translation-state tests**

Create fixture originals plus `zh-cn/` and `en/` files. Assert production returns only `published`, Preview returns `reviewed` and `published`, `draft` is excluded in both, and an orphan, mismatched slug, invalid locale/status/date, or duplicate translation throws `ContentValidationError`.

- [ ] **Step 2: Pin the Preview environment rule**

Assert `contentVisibility({ VERCEL_ENV: "preview" }) === "preview"`, `contentVisibility({ CONTENT_PREVIEW: "1" }) === "preview"`, and production/default environments return `"production"`.

- [ ] **Step 3: Run the content tests and observe RED**

Run: `npm test -- lib/content/translations.test.ts lib/projects.test.ts lib/tools.test.ts lib/notes.test.ts`  
Expected: FAIL because translated directories and publication states are not read.

- [ ] **Step 4: Implement shared translation validation and update all three loaders**

Parse every translation file before filtering visibility, verify its `translationOf` exists in the base collection, require filename/slug/translation target consistency, and preserve each collection's existing validation. Missing localized directories return an empty collection; missing base Projects or Tools directories retain current failure behavior; missing base Notes remains valid and empty.

- [ ] **Step 5: Implement availability from validated content**

`getTranslationAvailability` returns `zh-TW` plus visible translations in registry order and never infers availability from a directory name alone. `buildTranslationAvailability` keys the three-language core paths and every visible content path by unprefixed logical pathname. Both accept collection-root overrides in tests so they never read unrelated workspace files.

- [ ] **Step 6: Run focused and full content tests**

Run: `npm test -- lib/content/translations.test.ts lib/projects.test.ts lib/tools.test.ts lib/notes.test.ts`  
Expected: PASS, including the `draft`/`reviewed`/`published` matrix.

- [ ] **Step 7: Commit**

```bash
git add lib/content lib/projects.ts lib/projects.test.ts lib/tools.ts lib/tools.test.ts lib/notes.ts lib/notes.test.ts
git commit -m "feat: validate phased content translations"
```

### Task 3: Locale-Aware Site Shell and Language Selection

**Files:**
- Create: `components/SiteShell.tsx`
- Create: `components/LanguageSwitcher.tsx`
- Create: `components/LanguageSwitcher.test.tsx`
- Create: `components/LocaleSuggestion.tsx`
- Create: `components/LocaleSuggestion.test.tsx`
- Create: `app/(zh-tw)/layout.tsx`
- Create: `app/[locale]/layout.tsx`
- Create: `app/[locale]/not-found.tsx`
- Move: `app/not-found.tsx` → `app/(zh-tw)/not-found.tsx`
- Move all current UI page route modules under `app/(zh-tw)/` while leaving `app/api`, `app/feed.xml`, `app/robots.ts`, and `app/sitemap.ts` at the root.
- Delete: `app/layout.tsx`
- Modify: `app/layout.test.tsx`
- Modify: `components/Header.tsx`
- Modify: `components/Header.test.tsx`
- Modify: `components/Footer.tsx`
- Modify: `components/Footer.test.tsx`
- Modify: `components/CommandPalette.tsx`
- Modify: `components/CommandPalette.test.tsx`

**Interfaces:**
- Consumes: dictionaries and locale path helpers from Task 1; localized content queries and availability from Task 2.
- Produces: `SiteShell({ locale, children })`, which loads only the active dictionary/search data and renders Header, CommandPalette, Footer, Analytics, and `<main>`.
- Produces: `LanguageSwitcher({ locale, availability })` and `LocaleSuggestion({ locale })`; the switcher reads the current pathname in the client, strips its locale prefix, and looks up that logical path in the server-built availability map.
- Route contract: `(zh-tw)` root layout renders `<html lang="zh-Hant-TW">`; `[locale]` accepts only `zh-cn` and `en`, emits their exact `<html lang>`, and calls `notFound()` for any other segment.

- [ ] **Step 1: Write failing shell, switcher, and suggestion tests**

Assert exact desktop/mobile language links, an unavailable translation's disabled state from `TranslationAvailability`, `jk-locale=<locale>; Max-Age=31536000; Path=/; SameSite=Lax`, browser-language suggestion without navigation, dismissal persistence, and localized shell labels.

- [ ] **Step 2: Add the Review Focus URL-preservation test**

For `/notes/%E6%B8%AC%E8%A9%A6?type=engineering#result`, switching to English must yield `/en/notes/%E6%B8%AC%E8%A9%A6?type=engineering#result` without decoding, double encoding, or dropping query/hash. Invalid cookie `jk-locale=fr` must be ignored and must not navigate.

- [ ] **Step 3: Run focused tests and observe RED**

Run: `npm test -- components/LanguageSwitcher.test.tsx components/LocaleSuggestion.test.tsx components/Header.test.tsx components/Footer.test.tsx components/CommandPalette.test.tsx app/layout.test.tsx`  
Expected: FAIL because the shell is fixed to Traditional Chinese.

- [ ] **Step 4: Implement the shared shell and client language controls**

Pass locale/dictionary props explicitly into client components. Use `window.location.pathname/search/hash` only inside the switch interaction, write the cookie only after an explicit choice, and use local storage only to remember a dismissed suggestion. Do not add middleware or automatic redirects.

- [ ] **Step 5: Create separate root layouts and move the existing routes mechanically**

Move `page.tsx`, `about`, `contact`, `privacy`, `projects`, `tools`, `notes`, retired `news`, and the PCB tool app route into `(zh-tw)` without changing their visible URLs. Keep support modules such as `app/projects/projects-view.ts` at stable import paths. Update tests/imports after `git mv`.

- [ ] **Step 6: Run shell tests and a production build**

Run: `npm test -- components/LanguageSwitcher.test.tsx components/LocaleSuggestion.test.tsx components/Header.test.tsx components/Footer.test.tsx components/CommandPalette.test.tsx app/layout.test.tsx`  
Expected: PASS.  
Run: `npm run build:local`  
Expected: PASS; existing unprefixed routes remain in the build output.

- [ ] **Step 7: Commit**

```bash
git add app components
git commit -m "feat: add locale-aware site shell"
```

### Task 4: Three-Language Core Pages

**Files:**
- Create: `components/pages/HomePage.tsx`
- Create: `components/pages/AboutPage.tsx`
- Create: `components/pages/ContactPage.tsx`
- Create: `components/pages/PrivacyPage.tsx`
- Create: `components/pages/NotFoundPage.tsx`
- Create: `components/pages/core-pages.test.tsx`
- Create: `app/[locale]/page.tsx`
- Create: `app/[locale]/about/page.tsx`
- Create: `app/[locale]/contact/page.tsx`
- Create: `app/[locale]/privacy/page.tsx`
- Modify: corresponding `app/(zh-tw)/**/page.tsx` route wrappers
- Modify: `components/home/HomePageContent.tsx`
- Modify: `components/home/HomePageContent.test.tsx`
- Modify: `components/home/FocusAreas.tsx`
- Modify: `components/home/FeaturedTool.tsx`
- Modify: `components/home/NowCard.tsx`
- Modify: `app/contact/ContactLinks.tsx`
- Modify: `app/contact/ContactLinks.test.tsx`

**Interfaces:**
- Consumes: `Locale`, `getDictionary`, `localePath`, localized content getters, and `SiteShell`.
- Produces: one shared server/page component per core page with `{ locale: Locale }` props; route modules only resolve locale, metadata inputs, and render the shared component.
- Core-page contract: `/`, `/about`, `/contact`, `/privacy`, `/zh-cn...`, and `/en...` render complete native-language copy and locale-preserving internal links.

- [ ] **Step 1: Write failing core-page rendering tests**

Render Home, About, Contact, Privacy, and NotFound for all locales. Assert representative native strings, locale-prefixed internal links, no Traditional Chinese shell copy in English output, and no empty translated section.

- [ ] **Step 2: Run focused tests and observe RED**

Run: `npm test -- components/pages/core-pages.test.tsx components/home/HomePageContent.test.tsx app/contact/ContactLinks.test.tsx`  
Expected: FAIL because core pages contain hard-coded Traditional Chinese.

- [ ] **Step 3: Extract shared page components and wire locale copy**

Move presentation out of route files, pass dictionary namespaces into the existing home subcomponents, and keep all current Traditional Chinese text byte-for-byte equivalent in the rendered UI except where the new language controls require additions.

- [ ] **Step 4: Add localized core route wrappers**

Create `zh-cn`/`en` wrappers through `[locale]`; reject `zh-TW` as a public prefixed route. Localized home data queries use the active locale and display translated empty states until reviewed content becomes visible.

- [ ] **Step 5: Run core tests and build**

Run: `npm test -- components/pages/core-pages.test.tsx components/home/HomePageContent.test.tsx app/contact/ContactLinks.test.tsx`  
Expected: PASS.  
Run: `npm run build:local`  
Expected: PASS with `/`, `/zh-cn`, `/en`, and all three core-page sets.

- [ ] **Step 6: Commit**

```bash
git add app components locales
git commit -m "feat: translate core site pages"
```

### Task 5: Localized Collection Lists and Search

**Files:**
- Create: `components/pages/ProjectsPage.tsx`
- Create: `components/pages/ToolsPage.tsx`
- Create: `components/pages/NotesPage.tsx`
- Create: `components/pages/collection-pages.test.tsx`
- Create: `app/[locale]/projects/page.tsx`
- Create: `app/[locale]/tools/page.tsx`
- Create: `app/[locale]/notes/page.tsx`
- Modify: corresponding `app/(zh-tw)/**/page.tsx` route wrappers
- Modify: `app/projects/projects-view.ts`
- Modify: `app/projects/projects-view.test.ts`
- Modify: `app/notes/notes-view.ts`
- Modify: `app/notes/notes-view.test.ts`
- Modify: `components/content/ContentMeta.tsx`
- Modify: `components/content/ContentMeta.test.tsx`
- Modify: `components/content/StatusBadge.tsx`
- Modify: `components/content/StatusBadge.test.tsx`
- Modify: `components/notes/NoteFilter.tsx`
- Modify: `lib/search.ts`
- Modify: `lib/search.test.ts`

**Interfaces:**
- Consumes: locale content getters from Task 2 and collection dictionary labels from Task 1.
- Changes: `buildSearchItems(projects, tools, notes, locale): SearchItem[]` prefixes only localized paths.
- Produces: localized label functions for project area/status, tool status, note type, ContentMeta, filters, and empty states.

- [ ] **Step 1: Write failing localized collection/search tests**

Assert `/en/projects`, `/en/tools`, and `/en/notes` render English headings and only English visible items; a locale with no visible content renders its translated empty state. Assert search built for `en` contains only `/en/...` and never indexes Traditional Chinese fallback items.

- [ ] **Step 2: Run focused tests and observe RED**

Run: `npm test -- components/pages/collection-pages.test.tsx lib/search.test.ts app/projects/projects-view.test.ts app/notes/notes-view.test.ts components/content/ContentMeta.test.tsx components/content/StatusBadge.test.tsx`  
Expected: FAIL because labels, links, and search are global Traditional Chinese values.

- [ ] **Step 3: Implement locale-driven collection components and labels**

Replace exported global label objects with functions that require `locale` or dictionary values. Preserve filter query parameters and form actions under the active prefix.

- [ ] **Step 4: Implement locale-scoped search data**

Update `SiteShell` to query only the current locale/visibility and pass localized type labels into CommandPalette. Empty translated collections produce an empty index rather than using original content.

- [ ] **Step 5: Run collection, search, and shell tests**

Run: `npm test -- components/pages/collection-pages.test.tsx lib/search.test.ts app/projects/projects-view.test.ts app/notes/notes-view.test.ts components/content/ContentMeta.test.tsx components/content/StatusBadge.test.tsx components/CommandPalette.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app components lib/search.ts lib/search.test.ts
git commit -m "feat: localize collections and search"
```

### Task 6: Localized Detail Routes and Reviewed Example Translations

**Files:**
- Create: `components/pages/ProjectDetailPage.tsx`
- Create: `components/pages/ToolDetailPage.tsx`
- Create: `components/pages/NoteDetailPage.tsx`
- Create: `components/pages/detail-pages.test.tsx`
- Create: `app/[locale]/projects/[slug]/page.tsx`
- Create: `app/[locale]/tools/[slug]/page.tsx`
- Create: `app/[locale]/notes/[slug]/page.tsx`
- Modify: corresponding `app/(zh-tw)/**/[slug]/page.tsx` wrappers
- Create: `content/projects/zh-cn/pcb-test-point-comparison.md`
- Create: `content/projects/en/pcb-test-point-comparison.md`
- Create: `content/tools/zh-cn/pcb-test-point.md`
- Create: `content/tools/en/pcb-test-point.md`
- Modify: `docs/content-authoring.md`

**Interfaces:**
- Consumes: localized loaders, availability, dictionary labels, and `localePath`.
- Produces: shared detail components with `{ locale, slug, visibility }` props and locale-specific `generateStaticParams`/metadata inputs.
- Example translations use `translationStatus: reviewed`; they appear with `CONTENT_PREVIEW=1` or Vercel Preview but stay out of production until the owner approves their wording and changes status to `published`.

- [ ] **Step 1: Write failing detail and missing-translation tests**

Assert a visible English fixture renders translated title/body/alt text; an absent, `draft`, or production-`reviewed` translation calls `notFound`; available locale sets match actual visibility; localized static params include only visible slugs.

- [ ] **Step 2: Add the Review Focus related-link test**

When an English Note fixture references a Project with no English translation, assert the link targets `/projects/<slug>` and visibly says it is the Traditional Chinese original. When the translation exists, assert `/en/projects/<slug>` without the fallback label.

- [ ] **Step 3: Run focused tests and observe RED**

Run: `npm test -- components/pages/detail-pages.test.tsx lib/projects.test.ts lib/tools.test.ts lib/notes.test.ts`  
Expected: FAIL because only unprefixed detail routes exist.

- [ ] **Step 4: Extract shared detail components and add localized wrappers**

Make breadcrumbs, status labels, dates, reading time, image alt text, related links, tool actions, and commentary disclosure locale-aware. Keep the PCB app itself at its existing unprefixed URL and label it as an original-language tool when linked from translated copy.

- [ ] **Step 5: Write faithful reviewed Project and Tool translations**

Translate the existing PCB Project and Tool into Simplified Chinese and English, preserving technical terms, code, URLs, claims, limitations, images, and dates. Do not create a Note because no original exists; document that the Note path is implemented and fixture-tested.

- [ ] **Step 6: Run production and Preview visibility checks**

Run: `npm test -- components/pages/detail-pages.test.tsx lib/projects.test.ts lib/tools.test.ts lib/notes.test.ts`  
Expected: PASS.  
Run: `CONTENT_PREVIEW=1 npm run build:local`  
Expected: PASS with reviewed PCB translations generated.  
Run: `npm run build:local`  
Expected: PASS with those reviewed translations absent from production routes.

- [ ] **Step 7: Commit**

```bash
git add app components content docs/content-authoring.md
git commit -m "feat: add reviewed content translations"
```

### Task 7: Locale-Aware SEO, GEO Schemas, Sitemap, and Feed Support

**Files:**
- Modify: `lib/seo.ts`
- Modify: `lib/seo.test.ts`
- Modify: `app/seo.test.tsx`
- Modify: `app/sitemap.ts`
- Modify: `components/JsonLd.tsx`
- Modify: `components/JsonLd.test.tsx`
- Modify: `lib/rss.ts`
- Modify: `lib/rss.test.ts`
- Modify: `app/feed.xml/route.ts`
- Modify: `app/feed.xml/route.test.ts`
- Modify: all core, collection, and detail route metadata functions created in Tasks 4–6

**Interfaces:**
- Consumes: locale registry, dictionaries, content availability, and localized content items.
- Produces: `buildLocalizedMetadata({ locale, pathname, title, description, availableLocales, type, imageTitle }): Metadata`.
- Produces: `buildLanguageAlternates(pathname, availableLocales)` with self-reciprocal absolute language URLs and `x-default` mapped to the unprefixed Traditional Chinese route.
- Changes: `personJsonLd`, `websiteJsonLd`, `projectJsonLd`, `toolJsonLd`, and `articleJsonLd` require locale and emit matching URL/`inLanguage`.
- Produces: `breadcrumbJsonLd(locale, items)` and locale-aware `buildSitemapEntries`/`buildNotesRss`.

- [ ] **Step 1: Write failing metadata and reciprocal alternate tests**

Assert self-canonical `/en/about`, exact `languages` entries for all existing variants, no entry for a missing content translation, `x-default` at `/about`, matching Open Graph locale/URL, and safe OG query encoding.

- [ ] **Step 2: Write failing GEO schema tests**

Assert Person and WebSite have stable `@id`; visible expertise and `sameAs` match the page/config; Project, Tool, Article, and Breadcrumb use the active canonical URL and exact `inLanguage`; malicious `</script>` text remains safely serialized.

- [ ] **Step 3: Write failing sitemap and RSS tests**

Assert core pages appear in three locales, content appears only for visible published translations, each sitemap item exposes only real alternates, default RSS remains `zh-TW`, and a localized RSS result is empty/disabled until a published localized Note exists.

- [ ] **Step 4: Run SEO tests and observe RED**

Run: `npm test -- lib/seo.test.ts app/seo.test.tsx components/JsonLd.test.tsx lib/rss.test.ts app/feed.xml/route.test.ts`  
Expected: FAIL because metadata and schemas are fixed to `zh-TW`.

- [ ] **Step 5: Implement the centralized metadata and schema builders**

Make every route call the same builders; do not hand-build alternates in route files. Include `BreadcrumbList` beside existing page schemas and describe only visible page content.

- [ ] **Step 6: Implement sitemap and future localized-feed support**

Build sitemap data from production visibility regardless of Preview environment. Keep `/feed.xml` as the only live Feed while localized Notes are empty; expose a tested RSS builder so a localized route can be added when the first published translated Note exists.

- [ ] **Step 7: Run focused SEO tests and production build**

Run: `npm test -- lib/seo.test.ts app/seo.test.tsx components/JsonLd.test.tsx lib/rss.test.ts app/feed.xml/route.test.ts`  
Expected: PASS.  
Run: `npm run build:local`  
Expected: PASS with consistent canonical, alternates, sitemap, and schemas.

- [ ] **Step 8: Commit**

```bash
git add app components/JsonLd.tsx components/JsonLd.test.tsx lib/seo.ts lib/seo.test.ts lib/rss.ts lib/rss.test.ts
git commit -m "feat: add multilingual SEO and GEO metadata"
```

### Task 8: AI Crawler Policy and GEO Authoring Guardrails

**Files:**
- Modify: `app/robots.ts`
- Modify: `app/seo.test.tsx`
- Modify: `docs/content-authoring.md`
- Modify: localized Privacy copy in `locales/*.json`
- Create: `docs/multilingual-geo-operations.md`

**Interfaces:**
- Consumes: `siteConfig.url` and the publication contracts from earlier tasks.
- Produces: deterministic `MetadataRoute.Robots` rules that allow `*`, `Googlebot`, `Bingbot`, and `OAI-SearchBot`, and set `GPTBot` to `disallow: "/"`.
- Produces: author instructions for answer-first summaries, evidence, dates, limitations, sources, translated images, review states, and monthly measurement.

- [ ] **Step 1: Write the failing crawler-policy test**

Assert exact user-agent rules, sitemap URL, `OAI-SearchBot` allow `/`, and `GPTBot` disallow `/`. Assert no rule mentions or depends on `llms.txt`.

- [ ] **Step 2: Run the crawler test and observe RED**

Run: `npm test -- app/seo.test.tsx`  
Expected: FAIL because robots currently has only one wildcard rule.

- [ ] **Step 3: Implement crawler rules and update visible privacy copy**

Keep public search crawling allowed. Add language-preference Cookie disclosure to all three Privacy translations; do not claim robots is access control or that AI citation is guaranteed.

- [ ] **Step 4: Document the translation/GEO publishing workflow**

Add exact frontmatter examples, production/Preview commands, review-to-publish transition, content structure guidance, Search Console/Analytics checks, crawler verification, and rollback steps. State that Google AI features require normal indexability rather than special GEO markup.

- [ ] **Step 5: Run SEO, dictionary, and documentation checks**

Run: `npm test -- app/seo.test.tsx lib/i18n/dictionaries.test.ts`  
Expected: PASS.  
Run: `rg -n "OAI-SearchBot|GPTBot|translationStatus|CONTENT_PREVIEW" docs/content-authoring.md docs/multilingual-geo-operations.md`  
Expected: each policy/workflow term appears in the documented operating instructions.

- [ ] **Step 6: Commit**

```bash
git add app/robots.ts app/seo.test.tsx locales docs
git commit -m "docs: define GEO publishing and crawler policy"
```

### Task 9: End-to-End Verification and Owner Handoff

**Files:**
- Modify: `e2e/site.spec.ts`
- Modify: `e2e/seo.spec.ts`
- Modify: `docs/post-launch-validation.md`
- Create: `docs/multilingual-geo-verification.md`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: browser-level evidence for locale routing, switching, missing translations, metadata, robots, and existing-site regression safety.
- Produces: a local verification report; no push, PR, merge, or deployment.

- [ ] **Step 1: Write failing Playwright locale journeys**

Cover `/`, `/zh-cn`, `/en`, the three About pages, desktop/mobile language controls, explicit cookie persistence, browser-language suggestion without forced navigation, invalid locale 404, and a missing translated detail 404.

- [ ] **Step 2: Add SEO/GEO browser assertions**

Assert rendered `<html lang>`, self-canonical, reciprocal `hreflang`, `x-default`, JSON-LD URL/language, localized sitemap entries, default RSS language, and crawler-specific robots output.

- [ ] **Step 3: Add existing-site regression journeys**

Verify the PCB browser tool still parses its example without upload, retired news still returns no indexable article, unprefixed routes retain content, Vercel Analytics strips query/hash, and no ResearchMFG archive file or route appears in the public build.

- [ ] **Step 4: Run focused E2E integration verification**

Run: `npm run test:e2e -- e2e/site.spec.ts e2e/seo.spec.ts`  
Expected: all targeted E2E tests PASS. If a test fails, return the defect to the task that owns the interface rather than adding unrelated fixes in the verification task.

- [ ] **Step 5: Run the complete verification suite**

Run: `npm run verify`  
Expected: lint, TypeScript, Vitest, legacy-news guard, and production build all PASS.  
Run: `npm run test:e2e`  
Expected: all Playwright tests PASS.  
Run: `CONTENT_PREVIEW=1 npm run build:local`  
Expected: Preview build PASS and includes reviewed PCB translations.

- [ ] **Step 6: Record evidence and perform isolation checks**

Write exact commands, counts, generated locale routes, known deferred Note translation, reviewed-vs-published status, and screenshots/manual findings to `docs/multilingual-geo-verification.md`. Confirm `git status`, `git diff --check`, no repository remote changes, and no files from `../researchmfg-library` under public app/content/public output.

- [ ] **Step 7: Commit verification artifacts**

```bash
git add e2e docs/post-launch-validation.md docs/multilingual-geo-verification.md
git commit -m "test: verify multilingual GEO experience"
```

- [ ] **Step 8: Stop for owner review**

Provide the branch, commits, local Preview command, translation screenshots, test evidence, and the explicit fact that the PCB translations remain `reviewed`. Ask the owner whether to revise translations, promote them to `published`, and authorize push/PR/Preview; take no external action without that response.
