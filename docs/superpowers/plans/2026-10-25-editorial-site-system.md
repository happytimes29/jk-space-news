# JK Space Editorial Site System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the approved fashion-editorial homepage language across all content and brand pages while preserving every engineering tool's internal UI and behavior.

**Architecture:** Add a strictly scoped editorial stylesheet and stable page wrapper classes, then replace card-heavy page markup with semantic editorial lists and detail layouts. Engineering applications receive only `.engineering-app-page` and `.engineering-app` boundaries; the renderer, calculators, charts, uploads, state, and exports remain unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 3 utilities, scoped global CSS, Vitest, Testing Library, Playwright/local browser QA.

**Spec:** `docs/superpowers/specs/2026-10-25-editorial-site-system-design.md`

## Global Constraints

- Keep the work local on `codex/homepage-editorial-preview`; do not merge or deploy.
- Use the existing paper/ink/deep-orange editorial palette and the existing serif/sans/mono typography strategy; add no UI or animation dependency.
- Content pages must begin at `.editorial-page`; tool shell styles must begin at `.engineering-app-page` and must not select generic descendants inside `.engineering-app`.
- Preserve all content, locale paths, query strings, structured data, translation visibility, URLs, and SEO behavior.
- Do not change `ToolAppRenderer`, calculator DOM, formulas, state, event handlers, SVG/canvas internals, exports, or internal tool breakpoints.
- Keep exactly one H1 per page, visible keyboard focus, meaningful image alt text, and complete content when `prefers-reduced-motion` is enabled.
- Validate 360, 390, 768, 1024, and 1440 px with no horizontal scrolling.

## Review Focus

- Long English and Simplified Chinese headings at 360 px must wrap without clipping or horizontal overflow; Tasks 2–4 own responsive browser assertions.
- Empty and filtered collection states must keep localized clear/reset links and GET query behavior; Task 2 owns component tests.
- Missing optional cover images, outcomes, related content, or contact links must leave a deliberate layout with no empty frame; Tasks 2–4 own component tests.
- Tool query state, live calculations, tabs, undo/redo, chart geometry, upload/sample loading, and CSV export must behave exactly as before; Task 5 owns focused regression tests.
- Keyboard focus and reduced-motion mode must preserve navigation and content visibility; Tasks 1 and 5 own CSS contract tests and browser checks.

---

### Task 1: Scoped Editorial Foundation and Global Chrome

**Files:**
- Create: `app/editorial.css`
- Create: `app/editorial-styles.test.ts`
- Create: `components/editorial/EditorialSectionHeading.tsx`
- Create: `components/editorial/EditorialSectionHeading.test.tsx`
- Modify: `app/globals.css`
- Modify: `components/Header.tsx`
- Modify: `components/Header.test.tsx`
- Modify: `components/Footer.tsx`
- Modify: `components/Footer.test.tsx`

**Interfaces:**
- Produces: `EditorialSectionHeading({ index, title, action? }: { index: string; title: string; action?: ReactNode })` for collection and detail sections.
- Produces: `.editorial-page`, `.editorial-collection`, `.editorial-detail`, `.editorial-utility`, `.engineering-app-page`, and `.engineering-app` CSS boundaries used by later tasks.
- Produces: stable `.site-header` and `.site-footer` hooks without changing navigation or language-switcher behavior.

- [ ] **Step 1: Write failing foundation contract tests**

  Add tests that require the shared heading to expose its index separately from its heading, require Header/Footer to retain current localized links and gain stable site classes, and read `app/editorial.css` to assert the six wrapper selectors exist. Reject unscoped rules beginning with generic `input`, `button`, `select`, `svg`, or `canvas` selectors.

- [ ] **Step 2: Run the focused tests and confirm failure**

  Run: `npm test -- app/editorial-styles.test.ts components/editorial/EditorialSectionHeading.test.tsx components/Header.test.tsx components/Footer.test.tsx`

  Expected: FAIL because the stylesheet, shared heading, and stable hooks do not exist.

- [ ] **Step 3: Implement the scoped foundation**

  Import `app/editorial.css` from `app/globals.css` before Tailwind directives. Define only wrapper-scoped tokens, paper/ink/accent surfaces, typography, rules, links, focus states, responsive behavior, and reduced-motion behavior. Implement `EditorialSectionHeading` and add `.site-header`/`.site-footer` hooks while preserving existing accessible names, destinations, menu state, and language switching.

- [ ] **Step 4: Run foundation tests and static checks**

  Run: `npm test -- app/editorial-styles.test.ts components/editorial/EditorialSectionHeading.test.tsx components/Header.test.tsx components/Footer.test.tsx && npm run typecheck`

  Expected: all focused tests PASS and TypeScript exits 0.

- [ ] **Step 5: Commit the foundation**

  ```bash
  git add app/editorial.css app/editorial-styles.test.ts app/globals.css components/editorial components/Header.tsx components/Header.test.tsx components/Footer.tsx components/Footer.test.tsx
  git commit -m "style: add scoped editorial site foundation"
  ```

### Task 2: Editorial Collection Pages

**Files:**
- Modify: `components/pages/ProjectsPage.tsx`
- Modify: `components/pages/ToolsPage.tsx`
- Modify: `components/pages/NotesPage.tsx`
- Modify: `components/pages/collection-pages.test.tsx`
- Modify: `components/notes/NoteFilter.tsx`
- Modify: `components/content/ContentMeta.tsx`
- Modify: `components/content/StatusBadge.tsx`
- Modify: `components/tools/OpenToolLink.tsx`
- Modify: `components/tools/OpenToolLink.test.tsx`
- Modify: `app/editorial.css`

**Interfaces:**
- Consumes: `EditorialSectionHeading` and `.editorial-page.editorial-collection` from Task 1.
- Produces: indexed project rows, visual tool features, and date-led note rows using existing data models and locale helpers.
- Preserves: project GET filter names `area` and `status`, note query name `type`, and `OpenToolLink` analytics/navigation behavior.

- [ ] **Step 1: Extend collection tests with editorial and edge-state assertions**

  Require one H1 and `.editorial-page.editorial-collection` on all three pages; require project and note entries to remain semantic articles with localized links; require tool rows to retain real cover alt text, primary open action, and introduction link. Add cases for an active filter with no matches and for items without optional image/outcome/tags.

- [ ] **Step 2: Run collection tests and confirm failure**

  Run: `npm test -- components/pages/collection-pages.test.tsx components/tools/OpenToolLink.test.tsx app/projects/projects-view.test.ts app/notes/notes-view.test.ts`

  Expected: FAIL on the new editorial wrappers and structures while existing filter logic remains green.

- [ ] **Step 3: Rebuild Projects, Tools, and Notes presentation**

  Replace the uniform card grids with numbered project rows, image-led tool features, and chronological note rows. Keep existing content sources, labels, status semantics, `Image` behavior, filter actions, localized empty states, URLs, and analytics. Restyle `NoteFilter`, metadata, badges, and tool CTA through explicit editorial classes rather than generic element selectors.

- [ ] **Step 4: Verify collection behavior**

  Run: `npm test -- components/pages/collection-pages.test.tsx components/tools/OpenToolLink.test.tsx app/projects/projects-view.test.ts app/notes/notes-view.test.ts && npm run typecheck`

  Expected: all focused tests PASS with unchanged filtering and navigation behavior.

- [ ] **Step 5: Browser-check collection pages**

  Check `/projects`, `/tools`, `/notes`, `/en/projects`, `/zh-cn/tools`, and a no-match filter at 360, 768, and 1440 px. Confirm long headings wrap, filters remain keyboard-operable, missing optional data creates no blank panel, and no page scrolls horizontally.

- [ ] **Step 6: Commit collections**

  ```bash
  git add components/pages/ProjectsPage.tsx components/pages/ToolsPage.tsx components/pages/NotesPage.tsx components/pages/collection-pages.test.tsx components/notes/NoteFilter.tsx components/content/ContentMeta.tsx components/content/StatusBadge.tsx components/tools/OpenToolLink.tsx components/tools/OpenToolLink.test.tsx app/editorial.css
  git commit -m "style: redesign editorial collection pages"
  ```

### Task 3: Editorial Project, Tool, and Note Details

**Files:**
- Modify: `components/pages/ProjectDetailPage.tsx`
- Modify: `components/pages/ToolDetailPage.tsx`
- Modify: `components/pages/NoteDetailPage.tsx`
- Modify: `components/pages/detail-pages.test.tsx`
- Modify: `components/notes/SourceDisclosure.tsx`
- Modify: `components/notes/SourceDisclosure.test.tsx`
- Modify: `app/editorial.css`

**Interfaces:**
- Consumes: `.editorial-page.editorial-detail`, shared editorial tokens, existing `MDXRenderer`, `JsonLd`, locale helpers, and Task 2 status/meta classes.
- Produces: editorial hero metadata, deliberate real-image treatment, readable prose width, and related-content footers.
- Preserves: `projectJsonLd`, `toolJsonLd`, `articleJsonLd`, breadcrumb JSON-LD, translation fallback links, and commentary summary/opinion sections.

- [ ] **Step 1: Extend detail tests**

  Assert all three detail types have one H1 and `.editorial-page.editorial-detail`; preserve localized breadcrumbs, dates, alt text, app links, related links, commentary disclosure, and structured-data output. Add fixtures without cover image, outcome, repository/sample URL, or related items and assert no empty visual container appears.

- [ ] **Step 2: Run detail tests and confirm failure**

  Run: `npm test -- components/pages/detail-pages.test.tsx components/notes/SourceDisclosure.test.tsx app/seo.test.tsx`

  Expected: FAIL on new editorial structure assertions; existing content and SEO assertions remain green.

- [ ] **Step 3: Implement detail layouts**

  Give project and tool pages asymmetric hero/metadata columns and real-image treatment; give note pages a reading-first header, restrained disclosure, comfortable measure, and editorial related-content footer. Do not alter MDX source, JSON-LD data, URL decisions, visibility rules, or fallback labels.

- [ ] **Step 4: Verify detail and SEO behavior**

  Run: `npm test -- components/pages/detail-pages.test.tsx components/notes/SourceDisclosure.test.tsx app/seo.test.tsx && npm run typecheck`

  Expected: all focused tests PASS and structured-data assertions remain unchanged.

- [ ] **Step 5: Browser-check representative details**

  Check one project, one tool, a standard note, and a commentary note in each available locale at 360, 768, 1024, and 1440 px. Confirm long titles and code/prose do not overflow, images retain meaningful alt text, and absent optional sections collapse cleanly.

- [ ] **Step 6: Commit details**

  ```bash
  git add components/pages/ProjectDetailPage.tsx components/pages/ToolDetailPage.tsx components/pages/NoteDetailPage.tsx components/pages/detail-pages.test.tsx components/notes/SourceDisclosure.tsx components/notes/SourceDisclosure.test.tsx app/editorial.css
  git commit -m "style: redesign editorial detail pages"
  ```

### Task 4: About, Contact, Privacy, and Not Found

**Files:**
- Modify: `components/pages/AboutPage.tsx`
- Modify: `components/pages/ContactPage.tsx`
- Modify: `components/pages/PrivacyPage.tsx`
- Modify: `components/pages/NotFoundPage.tsx`
- Modify: `components/pages/core-pages.test.tsx`
- Modify: `app/contact/ContactLinks.tsx`
- Create: `app/contact/ContactLinks.test.tsx`
- Modify: `app/editorial.css`

**Interfaces:**
- Consumes: `.editorial-page.editorial-utility`, `EditorialSectionHeading`, locale helpers, and existing contact configuration.
- Produces: a narrative About page, compact contact index, readable legal page, and editorial 404 navigation.
- Preserves: featured-project fallback logic and only configured real contact destinations.

- [ ] **Step 1: Add utility-page structure and absence tests**

  Require each page to expose `.editorial-page.editorial-utility`, exactly one H1, localized internal links, and the existing section headings. Test `ContactLinks` with configured contacts and an empty array; ensure no fabricated contact method, metric, customer quote, or empty contact grid appears.

- [ ] **Step 2: Run utility tests and confirm failure**

  Run: `npm test -- components/pages/core-pages.test.tsx app/contact/ContactLinks.test.tsx`

  Expected: FAIL on the new wrappers and contact presentation assertions.

- [ ] **Step 3: Implement utility page designs**

  Recompose existing copy into editorial sections, asymmetric rules, numbered expertise/method entries, restrained contact links, a scan-friendly privacy document, and a typographic 404. Do not add biography claims, statistics, clients, or new contact channels.

- [ ] **Step 4: Verify utility pages**

  Run: `npm test -- components/pages/core-pages.test.tsx app/contact/ContactLinks.test.tsx && npm run typecheck`

  Expected: all focused tests PASS in zh-TW, zh-CN, and English.

- [ ] **Step 5: Browser-check utility pages and global chrome**

  Check About, Contact, Privacy, and 404 at 360, 390, 768, and 1440 px with keyboard navigation and reduced motion enabled. Confirm the mobile menu, language selector, header/footer contrast, focus rings, and long legal copy remain usable.

- [ ] **Step 6: Commit utility pages**

  ```bash
  git add components/pages/AboutPage.tsx components/pages/ContactPage.tsx components/pages/PrivacyPage.tsx components/pages/NotFoundPage.tsx components/pages/core-pages.test.tsx app/contact/ContactLinks.tsx app/contact/ContactLinks.test.tsx app/editorial.css
  git commit -m "style: redesign editorial brand pages"
  ```

### Task 5: Isolated Engineering Tool Shells and Full Regression

**Files:**
- Modify: `components/engineering/EngineeringToolShell.tsx`
- Modify: `components/engineering/EngineeringToolAppPage.test.tsx`
- Modify: `app/(zh-tw)/tools/pcb-test-point/app/page.tsx`
- Create: `app/(zh-tw)/tools/pcb-test-point/app/page.test.tsx`
- Modify: `app/editorial.css`

**Interfaces:**
- Consumes: `.engineering-app-page` and `.engineering-app` boundaries from Task 1.
- Preserves: `EngineeringToolShellProps` exactly as `{ title, description, backHref, backLabel, privacy, application }`.
- Preserves: the `application` ReactNode unchanged inside `.engineering-app`; PCB upload, parsing, sample loading, chart, filter, table, and CSV callbacks remain unchanged.

- [ ] **Step 1: Add shell-boundary and PCB regression tests**

  Assert `EngineeringToolShell` exposes `.engineering-app-page`, renders the application sentinel exactly once inside `.engineering-app`, retains the localized back link and privacy copy, and keeps one H1. Render PCB Test Point with mocked example files; assert its two upload zones, optional DXF zone, target input, example button, and shell boundaries remain present. Exercise successful example loading and CSV export without changing their observable labels or callbacks.

- [ ] **Step 2: Run focused tool tests and confirm failure**

  Run: `npm test -- components/engineering/EngineeringToolAppPage.test.tsx app/\(zh-tw\)/tools/pcb-test-point/app/page.test.tsx`

  Expected: FAIL because the isolation wrappers and PCB shell contract are absent.

- [ ] **Step 3: Apply shell-only visual changes**

  Update `EngineeringToolShell` title, summary, back link, privacy note, spacing, and background through explicit shell classes; render `application` untouched inside `.engineering-app`. Add equivalent outer wrappers to PCB Test Point while leaving every element inside its existing operational main section unchanged.

- [ ] **Step 4: Run all engineering and PCB tests**

  Run: `npm test -- components/engineering lib/engineering lib/pcb-tool app/\(zh-tw\)/tools/pcb-test-point/app/page.test.tsx`

  Expected: all existing engineering tests PASS without edits to calculator/chart tests; PCB upload/sample/export tests PASS.

- [ ] **Step 5: Browser-check tool behavior and visual isolation**

  At 360, 768, 1024, and 1440 px, check passive circuits, converter, RF quick calculator, transmission line, Smith chart, and PCB Test Point. Verify live values, topology/tab switching, URL parameters, undo/redo, chart/SVG proportions, sample loading, filters, table, and CSV export. Compare `.engineering-app` before/after DOM boundaries and confirm no horizontal overflow or inherited serif/stroke/transform styles.

- [ ] **Step 6: Run the full repository gate**

  Run: `npm run lint && npm run typecheck && npm test && node --test scripts/verify-no-legacy-news.test.mjs && npm run verify:no-legacy-news && npm run build:local`

  Expected: lint and typecheck exit 0; all Vitest and Node tests PASS; legacy-news check PASS; production build succeeds.

- [ ] **Step 7: Commit the shell work and any verified QA fixes**

  ```bash
  git add components/engineering/EngineeringToolShell.tsx components/engineering/EngineeringToolAppPage.test.tsx 'app/(zh-tw)/tools/pcb-test-point/app/page.tsx' 'app/(zh-tw)/tools/pcb-test-point/app/page.test.tsx' app/editorial.css
  git commit -m "style: isolate editorial engineering tool shells"
  ```

