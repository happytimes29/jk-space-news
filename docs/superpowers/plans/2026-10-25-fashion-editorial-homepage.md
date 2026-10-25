# Fashion Editorial Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the isolated B homepage preview into a fashion-forward engineering editorial with the short tagline “把問題，做成工具。” and authentic tool imagery.

**Architecture:** Keep the existing server-rendered homepage data and seven semantic regions. Replace the hero signal illustration with a focused editorial image composition, then refine the scoped `.editorial-home` system so no other page or preview inherits the visual changes.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind utilities, scoped global CSS, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-10-25-fashion-editorial-homepage-design.md`

## Global Constraints

- Work only on branch `codex/homepage-editorial-preview` and local preview port `4176`.
- Do not deploy, merge, or change the existing `4175` preview.
- Use only supplied real content and `/images/pcb-tool-1.png` or `/images/pcb-tool-2.png`.
- Preserve seven homepage regions, their order, routes, accessibility labels, and reduced-motion support.
- Keep all styling scoped under `.editorial-home` or `body:has(.editorial-home)`.

## Review Focus

- Traditional Chinese headline remains readable at 360 px without horizontal overflow.
- Simplified Chinese and English taglines use equivalent short copy and retain the same single H1.
- Homepage renders when `featuredTool` is null without a broken hero image.
- Real tool image keeps a meaningful alt string and does not become decorative content.
- Existing CTA ordering and seven-region accessibility tests remain intact.

---

### Task 1: Short Tagline and Fashion Hero

**Files:**
- Modify: `locales/zh-TW.json`
- Modify: `locales/zh-CN.json`
- Modify: `locales/en.json`
- Modify: `components/home/HomePageContent.tsx`
- Delete: `components/home/EditorialSignalPanel.tsx`
- Modify: `components/home/HomePageContent.test.tsx`
- Modify: `lib/site-config.test.ts`
- Modify: `components/pages/core-pages.test.tsx`

**Interfaces:**
- Consumes: `featuredTool.coverImage`, `featuredTool.title`, localized `site.tagline`, and existing homepage dictionary copy.
- Produces: the unchanged `HomePageContent(props: Props)` API with a new editorial hero and the same CTA/link semantics.

- [ ] **Step 1: Update tests for the short Traditional Chinese tagline**

Assert the homepage H1, first region heading, core page copy, and site config tagline equal `把問題，做成工具。`; retain assertions for `/tools` before `/projects` and seven ordered regions.

- [ ] **Step 2: Run focused tests to verify they fail**

Run: `npm test -- components/home/HomePageContent.test.tsx lib/site-config.test.ts components/pages/core-pages.test.tsx`

Expected: FAIL because the dictionaries still contain the long tagline.

- [ ] **Step 3: Update three localized tagline values**

Use `把問題，做成工具。`, `把问题，做成工具。`, and `Turn problems into tools.` in the locale JSON files.

- [ ] **Step 4: Replace the signal panel with the authentic tool-image hero**

In `HomePageContent.tsx`, remove `EditorialSignalPanel`, render an editorial figure only when `featuredTool?.coverImage` exists, keep the H1 and two CTA links unchanged, and provide a typographic fallback when the tool is null. Delete `EditorialSignalPanel.tsx` after its import and usage are gone.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- components/home/HomePageContent.test.tsx lib/site-config.test.ts components/pages/core-pages.test.tsx`

Expected: all focused tests PASS, including the null-tool render case.

- [ ] **Step 6: Commit the hero and copy change**

```bash
git add locales components/home components/pages/core-pages.test.tsx lib/site-config.test.ts
git commit -m "feat: refine homepage fashion editorial hero"
```

### Task 2: Editorial System Refinement and Responsive QA

**Files:**
- Modify: `app/globals.css`
- Test: `components/home/HomePageContent.test.tsx`

**Interfaces:**
- Consumes: the `.editorial-home`, `.editorial-hero`, `.editorial-tool`, `.editorial-focus`, `.editorial-projects`, `.editorial-notes`, `.editorial-now`, and `.editorial-contact` DOM hooks from Task 1.
- Produces: a homepage-scoped responsive visual system; no new public TypeScript API.

- [ ] **Step 1: Add structural regression assertions**

Assert the hero includes the real featured-tool image, excludes `Engineering signal study`, and still presents the tools CTA before the projects CTA.

- [ ] **Step 2: Run the homepage test to verify the new assertion fails before the hero implementation is applied**

Run: `npm test -- components/home/HomePageContent.test.tsx`

Expected: FAIL on the signal-panel exclusion or hero image placement before Task 1; PASS when Task 1 is present.

- [ ] **Step 3: Refine the scoped CSS system**

Reduce rule density; use an editorial image crop with an offset caption; introduce serif/sans display contrast without adding dependencies; vary the tool, focus, project, notes, and contact compositions; retain high-contrast focus states and reduced-motion behavior.

- [ ] **Step 4: Run static and full verification**

Run: `npm run verify`

Expected: lint, typecheck, 530+ tests, legacy-content checks, and production build all exit 0.

- [ ] **Step 5: Inspect the local preview**

Open `http://localhost:4176/`, verify the desktop hero, a mid-page section, and narrow layout visually, then leave the preview tab available to the user.

- [ ] **Step 6: Commit the visual refinement**

```bash
git add app/globals.css components/home/HomePageContent.test.tsx docs/superpowers
git commit -m "style: add fashion editorial homepage system"
```

