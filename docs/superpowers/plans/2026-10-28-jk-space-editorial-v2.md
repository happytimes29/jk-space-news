# JK Space Editorial V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild JK Space as a fixed warm-paper engineering editorial site with an interactive signal-field homepage while preserving every existing engineering-tool workflow.

**Architecture:** Keep the current Next.js 16 / React 19 routes, content loaders, locale system, SEO data, and calculator components. Add a scoped `.site-v2` design layer and migrate brand/content pages to it; keep each tool application inside `.engineering-app`, where DOM, dimensions, layout, state, and calculations remain unchanged and only existing color tokens may change. Build the homepage signal field as a small client component backed by pure geometry/state functions and a static fallback.

**Tech Stack:** Next.js 16.2.6, React 19, TypeScript, CSS, Canvas 2D, Vitest, Testing Library, Playwright

**Spec:** `docs/superpowers/specs/2026-10-28-jk-space-editorial-v2-design.md`

## Global Constraints

- Keep the existing Next.js / React architecture, routes, content models, SEO/GEO schema, translation publication rules, and URL behavior.
- Do not add a UI kit, animation framework, CMS, account system, database, backend service, or API.
- Brand/content pages use a fixed warm-paper theme and do not follow light/dark/system preferences.
- Core colors are Paper `#F6F1E7`, Paper Deep `#E8DFCF`, Ink `#17203A`, Night `#151513`, Brass `#A88654`, and Signal `#A73B2B`; Brass and Signal are accents, not body-copy colors.
- Serif is for narrative display, sans for reading and controls, and mono for measurements, dates, indexes, and metadata.
- `/tools/[slug]/app`, Datasheet, Smith chart, and PCB Test Point calculations, state, URL queries, export, upload, SVG/canvas geometry, DOM order, dimensions, and responsive layout must not change.
- Tool controls may consume existing scoped color tokens for backgrounds, text, borders, and focus only.
- V2 selectors must start from an explicit V2 or engineering boundary; no unscoped `input`, `button`, `select`, `svg`, or `canvas` rules.
- Homepage text and links remain HTML and usable before Canvas initializes; no essential information is drawn only on Canvas.
- Honor `prefers-reduced-motion`; coarse-pointer, unavailable-Canvas, and reduced-motion environments receive the static hero end state.
- Keep every task independently previewable and reversible. Deploy only after all tasks and the final full-suite gate pass.

## File Structure

### New files

- `app/editorial-v2.css` — fixed V2 tokens and every brand/content-page selector, scoped under `.site-v2` and content wrappers.
- `app/editorial-v2-styles.test.ts` — PostCSS contracts for tokens, selector boundaries, responsive rules, and tool isolation.
- `components/home/HomeSignalField.tsx` — client-only Canvas host, visibility/pointer listeners, static fallback, and accessible label.
- `components/home/home-signal-field.ts` — pure mode and frame calculation interfaces used by Canvas and tests.
- `components/home/HomeSignalField.test.tsx` — reduced-motion/static/interactive component contracts.
- `components/home/home-signal-field.test.ts` — deterministic mode and frame calculations.
- `e2e/editorial-v2.spec.ts` — fixed-theme, long-scroll, responsive, locale, reduced-motion, and tool-boundary browser checks.

### Existing files to modify

- `app/globals.css` — import V2 after legacy/tool styles; remove brand-wide dark defaults and superseded brand animation rules only after migration.
- `app/editorial.css` — retain functional tool/Datasheet/PCB rules; remove only V1 brand/content selectors proven unused in Task 9.
- `components/SiteShell.tsx` — remove runtime theme switching and provide the `.site-v2` root without changing search, analytics, locale suggestion, or data loading.
- `components/Header.tsx`, `components/Footer.tsx` — brand navigation and footer markup.
- `components/Header.test.tsx`, `components/Footer.test.tsx` — preserve navigation, language, mobile, and real-contact behavior while asserting the V2 shell.
- `components/home/HomePageContent.tsx`, `components/home/HomePageContent.test.tsx` — eight homepage narrative regions and real content.
- `components/pages/core-pages.test.tsx` — three-locale homepage order and utility-page contracts.
- `locales/zh-TW.json`, `locales/zh-CN.json`, `locales/en.json` — V2 homepage and accessibility copy with identical key structure.
- `components/pages/ProjectsPage.tsx`, `ToolsPage.tsx`, `NotesPage.tsx`, `collection-pages.test.tsx` — V2 indexes without changing filters or links.
- `components/pages/ProjectDetailPage.tsx`, `ToolDetailPage.tsx`, `NoteDetailPage.tsx`, `detail-pages.test.tsx` — V2 detail/prose layout with existing JSON-LD and fallbacks intact.
- `components/pages/AboutPage.tsx`, `ContactPage.tsx`, `PrivacyPage.tsx`, `NotFoundPage.tsx` — V2 utility layouts.
- `components/editorial/EditorialSectionHeading.tsx`, `EditorialSectionHeading.test.tsx` — reusable V2 section marker.
- `components/engineering/EngineeringToolShell.tsx`, `EngineeringToolAppPage.test.tsx` — compact V2 outer shell around an unchanged application child.
- `app/(zh-tw)/tools/pcb-test-point/app/page.tsx`, `page.test.tsx` — match the outer shell contract while preserving the PCB application subtree.
- `e2e/editorial-review.spec.ts`, `e2e/site.spec.ts` — remove obsolete theme/old-homepage assertions; retain unrelated coverage.

## Review Focus

- A stale `localStorage.theme = "dark"` must not turn brand pages dark or reduce tool readability; Task 1 adds the fixed-theme browser contract.
- Reduced-motion, coarse-pointer, or unavailable Canvas must show the completed JK signal composition without starting a render loop; Task 4 tests each mode.
- English and Simplified Chinese titles must wrap at 320–390 px without clipping, overlap, or horizontal scrolling; Tasks 3, 5, 7, and 10 pin this at component and browser level.
- Existing calculator query hydration, undo/redo, uploads, local-only processing, charts, and exports must remain unchanged after shell restyling; Tasks 8 and 10 run the existing tool suites.
- Empty collections, filtered no-match states, missing cover images, and unavailable translations must remain useful and localized; Tasks 5 and 6 retain explicit assertions.

---

### Task 1: Establish the Fixed V2 Root and CSS Safety Boundary

**Files:**
- Create: `app/editorial-v2.css`
- Create: `app/editorial-v2-styles.test.ts`
- Modify: `app/globals.css`
- Modify: `components/SiteShell.tsx`

**Interfaces:**
- Consumes: existing `SiteShell({ locale, children })` callers and existing `--color-*` tool tokens.
- Produces: `.site-v2` fixed brand root; `.site-v2-content` content wrapper; unchanged `SiteShell` signature; scoped Paper/Ink/Brass/Signal tokens; `.engineering-app` high-contrast token override.

- [ ] **Step 1: Write failing CSS and shell boundary tests**

In `app/editorial-v2-styles.test.ts`, parse `editorial-v2.css` and assert:

```ts
expect(declarations(".site-v2")).toMatchObject({
  "--v2-paper": "#f6f1e7",
  "--v2-ink": "#17203a",
  "--v2-brass": "#a88654",
  "--v2-signal": "#a73b2b",
  "color-scheme": "light",
});
expect(allSelectors()).not.toContainEqual(expect.stringMatching(/^(input|button|select|svg|canvas)\b/));
expect(declarations(".site-v2 .engineering-app")).toMatchObject({
  "--color-bg": expect.any(String),
  "--color-text": expect.any(String),
});
```

Also read `components/SiteShell.tsx` in the test and assert one `.site-v2` root encloses Header, main, Footer, CommandPalette, and LocaleSuggestion, and that the source no longer imports `ThemeProvider`.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npx vitest run app/editorial-v2-styles.test.ts components/Header.test.tsx components/Footer.test.tsx`

Expected: FAIL because `editorial-v2.css` and `.site-v2` do not exist.

- [ ] **Step 3: Implement the V2 root and fixed tokens**

Import `./editorial-v2.css` after `./editorial.css` in `app/globals.css`. Remove `ThemeProvider` from `SiteShell`, wrap the existing shell children in one `.site-v2` element, and keep Analytics behavior unchanged. Define only tokens, base typography/surface rules, focus styles, and functional-boundary token resets in this task; do not restyle page layouts yet.

- [ ] **Step 4: Run focused tests**

Run: `npx vitest run app/editorial-v2-styles.test.ts components/Header.test.tsx components/Footer.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/editorial-v2.css app/editorial-v2-styles.test.ts components/SiteShell.tsx
git commit -m "feat: establish editorial v2 theme boundary"
```

### Task 2: Rebuild the Shared Header, Footer, and Section Marker

**Files:**
- Modify: `components/Header.tsx`
- Modify: `components/Header.test.tsx`
- Modify: `components/Footer.tsx`
- Modify: `components/Footer.test.tsx`
- Modify: `components/editorial/EditorialSectionHeading.tsx`
- Modify: `components/editorial/EditorialSectionHeading.test.tsx`
- Modify: `app/editorial-v2.css`

**Interfaces:**
- Consumes: current `HeaderProps`, `FooterProps`, `LanguageSwitcher`, navigation config, and real contact config.
- Produces: unchanged component signatures; `EditorialSectionHeading({ index, title, action? })`; `.v2-site-header`, `.v2-site-footer`, and `.v2-section-heading` hooks.

- [ ] **Step 1: Update tests for the new shared chrome**

Assert the desktop header remains ordered Home → Projects → Tools → Notes → About → Contact, exposes one language group, uses the `v2-site-header` hook, and keeps the accessible mobile open/close behavior. Assert the footer uses `v2-site-footer`, real GitHub/Telegram destinations, localized internal links, and no placeholder channels. Assert the section marker renders mono index, H2, and optional action in separate children.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npx vitest run components/Header.test.tsx components/Footer.test.tsx components/editorial/EditorialSectionHeading.test.tsx`

Expected: FAIL on missing V2 hooks/structure.

- [ ] **Step 3: Implement the shared chrome**

Replace pill navigation and rounded social buttons with the confirmed black/navy editorial bar, hairline navigation, compact language control, numbered footer links, and visible focus states. Keep `usePathname` only for active-destination semantics, not for selecting brand versus tool styling. Preserve all existing hrefs and mobile-state behavior.

- [ ] **Step 4: Run the focused tests**

Run: `npx vitest run components/Header.test.tsx components/Footer.test.tsx components/LanguageSwitcher.test.tsx components/editorial/EditorialSectionHeading.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/Header.tsx components/Header.test.tsx components/Footer.tsx components/Footer.test.tsx components/editorial/EditorialSectionHeading.tsx components/editorial/EditorialSectionHeading.test.tsx app/editorial-v2.css
git commit -m "feat: add editorial v2 site chrome"
```

### Task 3: Recompose the Static Homepage Narrative in Three Languages

**Files:**
- Modify: `components/home/HomePageContent.tsx`
- Modify: `components/home/HomePageContent.test.tsx`
- Modify: `components/pages/core-pages.test.tsx`
- Modify: `locales/zh-TW.json`
- Modify: `locales/zh-CN.json`
- Modify: `locales/en.json`
- Modify: `lib/i18n/dictionaries.test.ts`
- Modify: `app/editorial-v2.css`

**Interfaces:**
- Consumes: unchanged `HomePageContent` props from `selectHomeContent`, `NowItem`, locale, and dictionary.
- Produces: `dictionary.home.heroTitle`, `orientationTitle`, `signalFieldLabel`; eight ordered homepage regions: Hero, orientation, practice, tools, projects, notes, currently, contact.

- [ ] **Step 1: Write failing three-locale narrative tests**

Assert exact hero titles:

```ts
expect(getDictionary("zh-TW").home.heroTitle).toBe("把訊號，變成答案。");
expect(getDictionary("zh-CN").home.heroTitle).toBe("把信号，变成答案。");
expect(getDictionary("en").home.heroTitle).toBe("Turn signals into answers.");
```

Render each locale and assert eight region headings occur in the approved sequence, tool navigation precedes project navigation, real featured projects/tools/notes remain linked, and empty notes still leave Currently and Contact visible.

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest run components/home/HomePageContent.test.tsx components/pages/core-pages.test.tsx lib/i18n/dictionaries.test.ts`

Expected: FAIL because the new keys and eight-region order do not exist.

- [ ] **Step 3: Implement the static homepage**

Replace the current image-led hero with an HTML text/CTA layer and a reserved signal-field host. Add the 30-second orientation section before the three practice areas, move Tools after practice, and preserve real content selection, locale paths, status, metadata, and empty states. Use editorial indexes and asymmetric layout instead of repeated cards.

- [ ] **Step 4: Run focused tests**

Run: `npx vitest run components/home/HomePageContent.test.tsx components/pages/core-pages.test.tsx lib/i18n/dictionaries.test.ts`

Expected: PASS for zh-TW, zh-CN, and en.

- [ ] **Step 5: Commit**

```bash
git add components/home/HomePageContent.tsx components/home/HomePageContent.test.tsx components/pages/core-pages.test.tsx locales/zh-TW.json locales/zh-CN.json locales/en.json lib/i18n/dictionaries.test.ts app/editorial-v2.css
git commit -m "feat: compose editorial v2 homepage narrative"
```

### Task 4: Add the Interactive Signal Field with a Static End-State Fallback

**Files:**
- Create: `components/home/home-signal-field.ts`
- Create: `components/home/home-signal-field.test.ts`
- Create: `components/home/HomeSignalField.tsx`
- Create: `components/home/HomeSignalField.test.tsx`
- Modify: `components/home/HomePageContent.tsx`
- Modify: `app/editorial-v2.css`

**Interfaces:**
- Consumes: the hero host from Task 3 and `dictionary.home.signalFieldLabel`.
- Produces:
  - `type SignalFieldMode = "interactive" | "static"`
  - `selectSignalFieldMode(input: { reducedMotion: boolean; coarsePointer: boolean; canvasAvailable: boolean }): SignalFieldMode`
  - `type SignalPointer = Readonly<{ x: number; y: number }> | null`
  - `computeSignalFrame(input: { progress: number; pointer: SignalPointer; width: number; height: number }): SignalFrame`
  - `HomeSignalField({ label }: { label: string }): JSX.Element`

- [ ] **Step 1: Write failing pure and component tests**

Test `selectSignalFieldMode` returns `static` for each fallback condition and `interactive` only when all capabilities are available. Test `computeSignalFrame` clamps progress to `0..1`, returns finite coordinates at zero dimensions, and places the final Signal path, Brass match point, and JK mark at `progress: 1`. In the component test, mock `matchMedia`, Canvas context, IntersectionObserver, ResizeObserver, and requestAnimationFrame; assert static mode does not request a frame and still renders the labeled end-state fallback.

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest run components/home/home-signal-field.test.ts components/home/HomeSignalField.test.tsx`

Expected: FAIL because the module and component do not exist.

- [ ] **Step 3: Implement the pure signal-field model**

Implement deterministic normalized geometry for scattered nodes/traces, Smith arcs, one Signal path, one Brass match point, and a subtle JK circuit mark. Pointer input may only perturb a local neighborhood; zero/negative dimensions must return a safe empty frame.

- [ ] **Step 4: Implement the Canvas host**

Use Canvas 2D, `requestAnimationFrame`, `IntersectionObserver`, ResizeObserver, capped device-pixel ratio, and passive pointer listeners. Drive progress from the hero section scroll position; pause when invisible; avoid React state per frame. Render semantic hero text outside the Canvas and an HTML/CSS static composition inside the same labeled figure when mode is `static`.

- [ ] **Step 5: Run signal and homepage tests**

Run: `npx vitest run components/home/home-signal-field.test.ts components/home/HomeSignalField.test.tsx components/home/HomePageContent.test.tsx`

Expected: PASS with no pending timers or animation-frame leaks.

- [ ] **Step 6: Commit**

```bash
git add components/home/home-signal-field.ts components/home/home-signal-field.test.ts components/home/HomeSignalField.tsx components/home/HomeSignalField.test.tsx components/home/HomePageContent.tsx app/editorial-v2.css
git commit -m "feat: add homepage signal field narrative"
```

### Task 5: Migrate Projects, Tools, and Notes Indexes

**Files:**
- Modify: `components/pages/ProjectsPage.tsx`
- Modify: `components/pages/ToolsPage.tsx`
- Modify: `components/pages/NotesPage.tsx`
- Modify: `components/pages/collection-pages.test.tsx`
- Modify: `app/editorial-v2.css`

**Interfaces:**
- Consumes: existing loaders, filter helpers, `StatusBadge`, `ContentMeta`, `NoteFilter`, and `OpenToolLink` unchanged.
- Produces: `.v2-editorial-page.v2-collection`, numbered index rows, stable existing form/query/link behavior.

- [ ] **Step 1: Update collection tests to the V2 contracts**

Assert each first element has `v2-editorial-page` and `v2-collection`; Projects retains GET form action/default values/reset behavior; Tools retains cover and no-cover layouts plus Open Tool/Overview links; Notes retains type filter/date/reading time; all English and Simplified Chinese empty/no-match states stay localized.

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest run components/pages/collection-pages.test.tsx`

Expected: FAIL on V2 wrappers/structure while legacy behavior assertions remain green.

- [ ] **Step 3: Implement all three index layouts**

Migrate complete pages, not fragments. Use numbered rows, hairlines, metadata columns, real imagery, and responsive stacking. Do not alter loader calls, filter names, query values, hrefs, item visibility, `Image` alt text, or empty-state decisions.

- [ ] **Step 4: Run collection and filter tests**

Run: `npx vitest run components/pages/collection-pages.test.tsx app/projects/projects-view.test.ts app/notes/notes-view.test.ts components/tools/OpenToolLink.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/pages/ProjectsPage.tsx components/pages/ToolsPage.tsx components/pages/NotesPage.tsx components/pages/collection-pages.test.tsx app/editorial-v2.css
git commit -m "feat: migrate content indexes to editorial v2"
```

### Task 6: Migrate Project, Tool, and Note Detail Reading Pages

**Files:**
- Modify: `components/pages/ProjectDetailPage.tsx`
- Modify: `components/pages/ToolDetailPage.tsx`
- Modify: `components/pages/NoteDetailPage.tsx`
- Modify: `components/pages/detail-pages.test.tsx`
- Modify: `app/editorial-v2.css`

**Interfaces:**
- Consumes: current content loaders, `MDXRenderer`, JSON-LD builders, translation availability, source disclosure, and related-content resolution.
- Produces: `.v2-editorial-page.v2-detail`, `.v2-prose`, unchanged JSON-LD/href/fallback semantics.

- [ ] **Step 1: Update detail tests for V2 and content edge cases**

Assert one H1, V2 wrappers, localized breadcrumbs/body/image alt, JSON-LD scripts, absent optional links, commentary SourceDisclosure, related-content fallback labels, and no cover wrapper when cover is absent. Add a long English title fixture and assert markup contains no fixed-height title hook.

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest run components/pages/detail-pages.test.tsx`

Expected: FAIL on V2 wrappers and prose hooks.

- [ ] **Step 3: Implement the detail and prose layouts**

Migrate heroes, metadata, figures, prose, related links, and tool CTA to the V2 system. Keep `JsonLd`, content parsing, MDX source, timestamps, translation visibility, original-language fallbacks, and external-link security attributes unchanged.

- [ ] **Step 4: Run detail, MDX, and SEO tests**

Run: `npx vitest run components/pages/detail-pages.test.tsx lib/seo.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/pages/ProjectDetailPage.tsx components/pages/ToolDetailPage.tsx components/pages/NoteDetailPage.tsx components/pages/detail-pages.test.tsx app/editorial-v2.css
git commit -m "feat: migrate editorial detail pages"
```

### Task 7: Migrate About, Contact, Privacy, and 404

**Files:**
- Modify: `components/pages/AboutPage.tsx`
- Modify: `components/pages/ContactPage.tsx`
- Modify: `components/pages/PrivacyPage.tsx`
- Modify: `components/pages/NotFoundPage.tsx`
- Modify: `components/pages/core-pages.test.tsx`
- Modify: `app/editorial-v2.css`

**Interfaces:**
- Consumes: existing dictionaries, `EditorialSectionHeading`, real contact config, and locale-aware fallback links.
- Produces: `.v2-editorial-page.v2-utility`; the same localized actions and one-H1 hierarchy.

- [ ] **Step 1: Update utility-page tests**

For all three locales, assert each page has the V2 wrapper, exactly one H1, non-empty sections, locale-preserving internal links, real contacts only, and no Traditional Chinese leakage in English. Keep the About future-translation fallback assertion. Assert 404 has four recovery links and no animation-dependent navigation.

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest run components/pages/core-pages.test.tsx`

Expected: FAIL on V2 wrappers.

- [ ] **Step 3: Implement utility layouts**

Apply the editorial hero, numbered section marker, index/timeline, restrained legal reading layout, and compact 404 recovery layout. Do not invent biographies, clients, numbers, contact channels, or privacy claims.

- [ ] **Step 4: Run utility and contact tests**

Run: `npx vitest run components/pages/core-pages.test.tsx app/contact/ContactLinks.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/pages/AboutPage.tsx components/pages/ContactPage.tsx components/pages/PrivacyPage.tsx components/pages/NotFoundPage.tsx components/pages/core-pages.test.tsx app/editorial-v2.css
git commit -m "feat: migrate editorial utility pages"
```

### Task 8: Restyle Only the Engineering Application Shells

**Files:**
- Modify: `components/engineering/EngineeringToolShell.tsx`
- Modify: `components/engineering/EngineeringToolAppPage.test.tsx`
- Modify: `app/(zh-tw)/tools/pcb-test-point/app/page.tsx`
- Modify: `app/(zh-tw)/tools/pcb-test-point/app/page.test.tsx`
- Modify: `app/editorial-v2.css`
- Modify: `app/editorial-styles.test.ts`

**Interfaces:**
- Consumes: unchanged `EngineeringToolShellProps` and `application: ReactNode`.
- Produces: `.v2-engineering-shell` around exactly one unchanged `.engineering-app`; PCB uses the same outer hooks and retains `.pcb-engineering-app`.

- [ ] **Step 1: Tighten shell isolation tests**

Assert `EngineeringToolShell` renders the supplied application sentinel exactly once, with the same node identity/children inside `.engineering-app`, and adds only V2 classes outside it. For PCB, record the ordered input/button labels inside `.engineering-app` and assert they remain identical after the shell change. Update PostCSS tests so V2 selectors may set only color-related custom properties inside `.engineering-app`, never layout, dimensions, SVG/canvas stroke, or transforms.

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest run components/engineering/EngineeringToolAppPage.test.tsx 'app/(zh-tw)/tools/pcb-test-point/app/page.test.tsx' app/editorial-styles.test.ts app/editorial-v2-styles.test.ts`

Expected: FAIL on the missing V2 shell hooks/contracts.

- [ ] **Step 3: Implement the compact outer shells**

Restyle only back navigation, title, summary, privacy/local-first copy, outer background, width, and page spacing. Keep the application child expression unchanged. Apply the same outer hooks to PCB without moving or restyling its upload/analysis subtree.

- [ ] **Step 4: Run component and calculator unit tests**

Run: `npx vitest run components/engineering components/tools components/datasheet 'app/(zh-tw)/tools/pcb-test-point/app/page.test.tsx' app/editorial-styles.test.ts app/editorial-v2-styles.test.ts`

Expected: PASS with no existing interaction assertion changed or removed.

- [ ] **Step 5: Run the critical browser regression subset**

Run: `npx playwright test e2e/engineering-calculators.spec.ts e2e/pcb-tool.spec.ts tests/datasheet-workbench.e2e.ts --project=chromium`

Expected: PASS for calculator query hydration, Smith undo/redo/export, local PCB upload/export, and Datasheet workflows.

- [ ] **Step 6: Commit**

```bash
git add components/engineering/EngineeringToolShell.tsx components/engineering/EngineeringToolAppPage.test.tsx 'app/(zh-tw)/tools/pcb-test-point/app/page.tsx' 'app/(zh-tw)/tools/pcb-test-point/app/page.test.tsx' app/editorial-v2.css app/editorial-styles.test.ts
git commit -m "feat: add editorial v2 engineering shells"
```

### Task 9: Remove Superseded V1 Brand Selectors Without Touching Tool CSS

**Files:**
- Modify: `app/globals.css`
- Modify: `app/editorial.css`
- Modify: `app/editorial-v2.css`
- Modify: `app/editorial-styles.test.ts`
- Modify: `app/editorial-v2-styles.test.ts`
- Modify: migrated components from Tasks 3, 5, 6, and 7 only if stale V1 classes remain.

**Interfaces:**
- Consumes: all V2 hooks completed in Tasks 1–8.
- Produces: no runtime interface changes; one active brand layer plus preserved functional tool/Datasheet/PCB rules.

- [ ] **Step 1: Add failing stale-selector and protected-selector tests**

Assert migrated component sources no longer contain `editorial-home`, `editorial-page`, `editorial-collection`, `editorial-detail`, or `editorial-utility`. Assert `editorial.css` still contains required `.engineering-app`, `.datasheet-workbench`, and `.pcb-engineering-app` functional selectors. Assert `editorial-v2.css` owns every `v2-*` selector and has no unsafe generic rule start.

- [ ] **Step 2: Run style tests and verify failure**

Run: `npx vitest run app/editorial-styles.test.ts app/editorial-v2-styles.test.ts`

Expected: FAIL while legacy brand classes/selectors remain.

- [ ] **Step 3: Remove only proven-unused V1 brand rules**

Use `rg` to map remaining class references before removal. Delete superseded homepage/content/utility rules and obsolete brand animation/theme overrides; preserve all tool, Datasheet, PCB, command palette, MDX compatibility, print, and functional boundary rules still referenced. Do not perform a blind rewrite of `editorial.css`.

- [ ] **Step 4: Run full unit/style/type checks**

Run: `npm run lint && npm run typecheck && npm run test`

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/editorial.css app/editorial-v2.css app/editorial-styles.test.ts app/editorial-v2-styles.test.ts components
git commit -m "refactor: remove superseded editorial v1 styles"
```

### Task 10: Add Cross-Locale Browser Acceptance and Run the Release Gate

**Files:**
- Create: `e2e/editorial-v2.spec.ts`
- Modify: `e2e/editorial-review.spec.ts`
- Modify: `e2e/site.spec.ts`

**Interfaces:**
- Consumes: the complete V2 site from Tasks 1–9 and all existing public routes.
- Produces: browser-level release contract; no application interface changes.

- [ ] **Step 1: Write failing V2 browser acceptance tests**

Cover:

```ts
for (const width of [360, 390, 768, 1024, 1440]) {
  // /, /en, /zh-cn and representative collection/detail/utility pages
  // assert scrollWidth <= innerWidth and one visible H1
}
```

Also assert:

- `localStorage.theme = "dark"` still yields Paper `rgb(246, 241, 231)` on brand pages.
- Homepage region order matches the approved eight-region narrative and real links work.
- Reduced motion exposes the static labeled signal field and no positive animation/transition durations.
- Normal fine-pointer mode exposes the Canvas, pauses when out of view, and keeps CTAs usable before interaction.
- A JavaScript-disabled browser context still renders the hero copy, primary links, and approved section order.
- Header mobile navigation, command palette, language switch, 404 recovery, and real Contact links still work.
- A representative Smith chart, converter, Datasheet, and PCB journey retains queries/results/exports and has no horizontal overflow.

Remove obsolete assertions from `editorial-review.spec.ts` and `site.spec.ts` that require dark/light theme classes, seven homepage regions, the old hero image, or V1 class names; do not remove unrelated navigation, locale, SEO, RSS, privacy, or local-only processing coverage.

- [ ] **Step 2: Run the new acceptance file and verify failure before final fixes**

Run: `npx playwright test e2e/editorial-v2.spec.ts --project=chromium`

Expected: any remaining cross-locale, viewport, reduced-motion, or shell mismatch fails with a specific route/width.

- [ ] **Step 3: Fix only failures within the approved design**

Adjust V2 CSS, copy wrapping, Canvas capability detection, or outer shell styles. Do not change content visibility, tool core behavior, or weaken assertions.

- [ ] **Step 4: Run the complete verification gate**

Run: `npm run verify`

Expected: lint, typecheck, all Vitest suites, legacy-news verification, and production build exit 0.

Run: `npm run test:e2e`

Expected: all Playwright suites exit 0, including engineering calculators, Datasheet, PCB, SEO, navigation, and V2 acceptance.

- [ ] **Step 5: Perform the visual acceptance pass**

Preview zh-TW, zh-CN, and en at 360, 390, 768, 1024, and 1440 px. Confirm the hero reaches the approved Signal Red → Brass match point → JK end state, typography follows Serif/Sans/Mono roles, brand pages remain fixed warm paper, and tool operation regions retain their pre-change positions and proportions.

- [ ] **Step 6: Commit**

```bash
git add e2e/editorial-v2.spec.ts e2e/editorial-review.spec.ts e2e/site.spec.ts app components locales
git commit -m "test: lock editorial v2 release contract"
```

## Final Handoff Conditions

- Do not merge or deploy from an intermediate task.
- Request one whole-branch review after Task 10.
- Address review findings with focused tests and rerun `npm run verify` plus `npm run test:e2e`.
- Present the local/preview build for the user's overall visual approval.
- Only after that approval: merge the V2 branch once and deploy once.
