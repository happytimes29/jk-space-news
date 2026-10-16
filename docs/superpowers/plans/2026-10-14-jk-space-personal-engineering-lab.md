# JK Space 個人工程實驗室 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將 JK Space News 改造成以專案、工具與原創觀點為核心的 JK Space 個人工程實驗室，並安全退場自動化新聞內容。

**Architecture:** 保留 Next.js App Router 與 Git 管理的 Markdown／MDX，新增共用內容驗證層，讓 Projects、Tools、Notes 與 Now 都由明確型別及 frontmatter 驅動。頁面維持靜態優先，PCB 工具繼續純瀏覽器運算；全站品牌、搜尋、RSS、sitemap 與結構化資料改從單一站台設定和新內容集合產生。

**Tech Stack:** Next.js 16、React 19、TypeScript 5、Tailwind CSS 3、gray-matter、next-mdx-remote、Vitest、Testing Library、Playwright、Vercel

**Spec:** `docs/superpowers/specs/2026-10-14-jk-space-personal-engineering-lab-design.md`

## Global Constraints

- 對外品牌統一為「JK Space」，不得在網站框架或 Metadata 使用「JK Space News」；已封存專案案例可在明確的歷史脈絡中提及舊名稱。
- 核心標語固定為「把工程上的麻煩事，做成好用的工具。」
- 主導覽固定為：首頁、專案、工具、筆記與觀點、關於我、聯絡。
- V1 以繁體中文為主，根 `<html>` 使用 `lang="zh-Hant-TW"`。
- 內容使用 Git 管理的 Markdown／MDX，不新增 CMS、資料庫、登入、留言、電子報或金流。
- 只發布站主原創筆記；新聞只能以具備來源資訊的「新聞觀點」發布。
- 不顯示虛構 Email、社群連結、成效數字、見證或示範文章。
- PCB 工具的使用者檔案必須留在瀏覽器端，不新增上傳 API。
- 舊新聞退出首頁、導覽、搜尋、RSS、sitemap 與正式建置；刪除前先建立可驗證的 Git 備份。
- `/news`、`/trending` 永久轉址至 `/notes`；`/profile` 永久轉址至 `/about`；舊 `/news/[slug]` 回傳 404 且 noindex。
- 不刪除或停用外部 OpenClaw 排程、密鑰或服務；只產生待站主確認的外部資源清單。
- 所有互動元件可鍵盤操作、保留可見焦點並尊重 `prefers-reduced-motion`。
- 首頁、專案詳情、工具詳情與筆記列表的 Lighthouse Accessibility 與 SEO 目標均為 90 以上；第一篇真實筆記發布時，筆記詳情套用相同門檻。

## Review Focus

- 缺少必要 frontmatter、日期錯誤、重複 slug：內容驗證必須報出檔名與欄位，不能靜默補成假資料；由 Task 2 測試。
- `commentary` 缺少 `sourceTitle`、`sourceUrl` 或 `sourcePublishedAt`：不得發布；由 Task 2 與 Task 6 測試。
- Notes 為空或聯絡欄位未設定：頁面顯示真實空狀態且不產生假連結；由 Task 3、Task 6 與 Task 8 測試。
- 舊新聞仍被任何公開入口、搜尋、RSS、sitemap 或建置程式引用：驗證必須失敗；由 Task 9 與 Task 10 測試。
- 320px 小螢幕、鍵盤搜尋、減少動態效果及 PCB 本機資料流：不得溢出、失焦或產生上傳請求；由 Task 5 與 Task 11 測試。

---

## Target File Map

### 基礎與設定

- Create: `lib/site-config.ts` — 品牌、導覽、聯絡方式與站台 URL 的唯一來源。
- Create: `components/Analytics.tsx` — Vercel 匿名頁面瀏覽與工具開啟事件入口。
- Create: `lib/content/shared.ts` — Markdown 讀取、frontmatter 驗證、日期與閱讀時間共用函式。
- Create: `lib/notes.ts` — Note 型別、驗證、排序與查詢。
- Create: `lib/now.ts` — Now 內容讀取與驗證。
- Modify: `lib/projects.ts` — 改為 PRD 的 Project 模型。
- Modify: `lib/tools.ts` — 改為 PRD 的 Tool 模型。
- Create: `vitest.config.ts`, `tests/setup.ts`, `playwright.config.ts`, `e2e/site.spec.ts`, `lighthouserc.json` — 自動化驗證。
- Modify: `package.json`, `package-lock.json` — 測試、型別、lint 與驗證命令。
- Create: `.eslintrc.json` — 讓現有 `next lint` 失效後仍可使用 ESLint CLI。

### 頁面與元件

- Modify: `app/layout.tsx`, `components/Header.tsx`, `components/Footer.tsx`, `components/CommandPalette.tsx` — 新品牌與全站導覽。
- Modify: `app/page.tsx` — 個人工程實驗室首頁。
- Create: `app/projects/page.tsx` — 專案列表。
- Modify: `app/projects/[slug]/page.tsx` — 案例型專案詳情。
- Modify: `app/tools/page.tsx`, `app/tools/[slug]/page.tsx`, `app/tools/pcb-test-point/app/page.tsx` — 自有工具入口與範例流程。
- Create: `app/notes/page.tsx`, `app/notes/[slug]/page.tsx` — 筆記列表與詳情。
- Modify: `app/about/page.tsx`, `app/contact/page.tsx`, `app/privacy/page.tsx`, `app/not-found.tsx` — 個人與信任頁面。
- Create: `components/content/ContentCard.tsx`, `components/content/ContentMeta.tsx`, `components/content/StatusBadge.tsx` — 共用內容呈現。
- Create: `components/home/FocusAreas.tsx`, `components/home/FeaturedTool.tsx`, `components/home/NowCard.tsx` — 首頁專用區塊。
- Create: `components/notes/NoteFilter.tsx`, `components/notes/SourceDisclosure.tsx` — 筆記分類與來源揭露。

### 內容、SEO 與退場

- Modify: `content/projects/pcb-test-point-comparison.md`, `content/tools/pcb-test-point.md` — 套用新 frontmatter。
- Create: `content/projects/jk-space-news-automation.md` — 將現有新聞自動化系統改寫為已封存專案案例，而不是新聞入口。
- Create: `content/notes/.gitkeep`, `content/now.md` — 空的原創內容集合與近況。
- Create: `public/samples/pcb-test-point-old.html`, `public/samples/pcb-test-point-new.html` — 無機密的工具示範資料。
- Modify: `app/feed.xml/route.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/api/og/route.tsx`, `next.config.ts` — 新內容 SEO 與舊路由。
- Create: `lib/rss.ts`, `lib/seo.ts`, `components/JsonLd.tsx` — 可測試的 RSS、sitemap 與 JSON-LD 產生器。
- Delete after backup verification: `content/news/`, `content/archived-news.json`, `lib/news.ts`, `lib/archived-news.ts`, `lib/interviews.ts`, `app/trending/`, `app/interview/`, `app/profile/` 與未再使用的新聞元件。
- Replace: `app/news/[slug]/page.tsx` — 無內容讀取的 noindex 404 路由。
- Delete after exact manifest review: 只被新聞 frontmatter 使用的 `public/images/*`。
- Create: `docs/migrations/2026-10-14-retired-news-assets.txt` — 實際刪除的新聞圖片清單。
- Create: `docs/content-authoring.md`, `README.md` — 新網站維護方式。

---

### Task 1: 建立品質基線與集中站台設定

**Files:**
- Create: `.eslintrc.json`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `playwright.config.ts`
- Create: `lighthouserc.json`
- Create: `lib/site-config.ts`
- Create: `lib/site-config.test.ts`
- Create: `components/Analytics.tsx`
- Create: `e2e/site.spec.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `ContactLink { label: string; href: string; kind: "github" | "telegram" | "email" }`, `SiteConfig`, `siteConfig`, `getEnabledContactLinks(config: SiteConfig): ContactLink[]`。
- Produces: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, `npm run audit`, `npm run verify`。

- [ ] **Step 1: 安裝測試依賴並建立命令**

執行 `npm install @vercel/analytics` 與 `npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test @lhci/cli`，並將 scripts 定義為：

```json
{
  "lint": "eslint . --max-warnings=0",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "audit": "lhci autorun",
  "verify": "npm run lint && npm run typecheck && npm run test && npm run build:local"
}
```

- [ ] **Step 2: 寫出站台設定的失敗測試**

`lib/site-config.test.ts` 斷言：

```ts
expect(siteConfig.name).toBe("JK Space");
expect(siteConfig.tagline).toBe("把工程上的麻煩事，做成好用的工具。");
expect(siteConfig.navigation.map((item) => item.href)).toEqual([
  "/", "/projects", "/tools", "/notes", "/about", "/contact",
]);
expect(getEnabledContactLinks(siteConfig).map((item) => item.label)).toEqual([
  "GitHub", "Telegram",
]);
expect(getEnabledContactLinks({ ...siteConfig, contacts: [] })).toEqual([]);
```

- [ ] **Step 3: 執行測試確認失敗**

Run: `npm run test -- lib/site-config.test.ts`

Expected: FAIL，原因為 `@/lib/site-config` 尚不存在。

- [ ] **Step 4: 實作集中設定與測試環境**

`lib/site-config.ts` 使用以下固定值：

- `name`: `JK Space`
- `title`: `JK Space — 個人工程實驗室`
- `tagline`: `把工程上的麻煩事，做成好用的工具。`
- `description`: `硬體研發、AI 自動化、工程工具與技術觀點。`
- GitHub: `https://github.com/happytimes29`
- Telegram: `https://t.me/JK_Sapce`
- Email 不設定、不渲染。

`components/Analytics.tsx` 封裝 `@vercel/analytics/next` 的 `<Analytics />`，只收集 Vercel 的匿名頁面瀏覽；不得加入使用者檔名、上傳內容、搜尋字串或聯絡資料。

`playwright.config.ts` 以 `npm run dev -- --hostname 127.0.0.1` 作為 `webServer`，base URL 為 `http://127.0.0.1:3000`；`vitest.config.ts` 使用 `jsdom`、`tests/setup.ts` 與 `@` 根目錄 alias。`lighthouserc.json` 由 `npm run start -- --hostname 127.0.0.1` 啟動 production server，收集首頁、PCB Project、PCB Tool 與 Notes 列表，對 Accessibility 與 SEO 設 `minScore: 0.9`，Performance 僅收集不設硬性門檻。

- [ ] **Step 5: 修復 lint 命令並驗證基線**

`.eslintrc.json` extends `next/core-web-vitals` 與 `next/typescript`。執行：

Run: `npm run test -- lib/site-config.test.ts && npm run typecheck`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add .eslintrc.json vitest.config.ts tests/setup.ts playwright.config.ts lighthouserc.json e2e/site.spec.ts lib/site-config.ts lib/site-config.test.ts components/Analytics.tsx package.json package-lock.json
git commit -m "test: establish site quality baseline"
```

### Task 2: 建立嚴格的 Projects、Tools、Notes 與 Now 內容層

**Files:**
- Create: `lib/content/shared.ts`
- Create: `lib/content/shared.test.ts`
- Create: `lib/notes.ts`
- Create: `lib/notes.test.ts`
- Create: `lib/now.ts`
- Create: `lib/now.test.ts`
- Modify: `lib/projects.ts`
- Create: `lib/projects.test.ts`
- Modify: `lib/tools.ts`
- Create: `lib/tools.test.ts`
- Create: `content/notes/.gitkeep`
- Create: `content/now.md`
- Modify: `content/projects/pcb-test-point-comparison.md`
- Create: `content/projects/jk-space-news-automation.md`
- Modify: `content/tools/pcb-test-point.md`

**Interfaces:**
- Produces: `ContentValidationError(file: string, field: string, message: string)`。
- Produces: `loadProjects(directory?: string): ProjectItem[]`, `getAllProjects()`, `getFeaturedProjects(limit?: number)`, `getProjectBySlug(slug: string)`。
- Produces: `loadTools(directory?: string): ToolItem[]`, `getAllTools()`, `getFeaturedTool()`（回傳第一個 `available` 工具）, `getToolBySlug(slug: string)`。
- Produces: `BaseNote`, `StandardNote`, `CommentaryNote`, `NoteItem` discriminated union；以及 `loadNotes(directory?: string): NoteItem[]`, `getAllNotes()`, `getRecentNotes(limit?: number)`, `getNoteBySlug(slug: string)`。
- Produces: `loadNow(filePath?: string): NowItem`。

- [ ] **Step 1: 寫共用驗證的失敗測試**

在暫存 fixture 目錄測試：必要字串為空、無效日期、錯誤 enum、重複 slug 均拋出 `ContentValidationError`，錯誤訊息包含檔名與欄位；空目錄回傳 `[]`。

- [ ] **Step 2: 寫四種內容模型的失敗測試**

關鍵斷言：

```ts
expect(loadProjects(projectDir)[0]).toMatchObject({
  status: "maintained",
  areas: ["hardware", "product"],
  featured: true,
});
expect(loadTools(toolDir)[0].privacy).toContain("瀏覽器");
expect(loadNotes(emptyDir)).toEqual([]);
expect(() => loadNotes(commentaryMissingSourceDir)).toThrow(/sourceUrl/);
expect(loadNow(nowPath).updatedAt).toBe("2026-10-14T00:00:00.000Z");
```

- [ ] **Step 3: 執行測試確認失敗**

Run: `npm run test -- lib/content/shared.test.ts lib/projects.test.ts lib/tools.test.ts lib/notes.test.ts lib/now.test.ts`

Expected: FAIL，因新模型與函式尚不存在。

- [ ] **Step 4: 實作共用解析與嚴格型別**

使用 PRD 欄位，並固定以下 union：

```ts
type ProjectStatus = "active" | "completed" | "maintained" | "archived";
type ProjectArea = "hardware" | "automation" | "product";
type ToolStatus = "available" | "experimental" | "maintenance" | "archived";
type NoteType = "engineering" | "automation" | "project-log" | "commentary";
```

所有集合依 `updatedAt` 或 `publishedAt` 新到舊排序；不得以目前時間補缺少日期，不得用「無標題」補缺少標題。

- [ ] **Step 5: 遷移現有內容**

- PCB Project：`year: 2026`、`status: maintained`、`areas: [hardware, product]`、`role: 設計與實作`、`featured: true`。
- PCB Tool：`status: available`、`privacy: 所有使用者檔案只在瀏覽器內解析，不上傳伺服器。`、輸入 `OrCAD HTML`／`DXF`／`Target List`、輸出 `差異表`／`2D 座標圖`／`CSV`。
- JK Space News Automation：使用現有 repo 與 `/profile` 已公開資訊寫成 `status: archived` 的專案案例，清楚交代它已停止作為新聞產品。
- Now：內容為目前正將網站改造成個人工程實驗室，日期 `2026-10-14`。
- Notes 只建立 `.gitkeep`，不建立假文章。

- [ ] **Step 6: 執行內容測試與正式內容載入**

Run: `npm run test -- lib/content/shared.test.ts lib/projects.test.ts lib/tools.test.ts lib/notes.test.ts lib/now.test.ts`

Expected: PASS，且正式集合為 2 個 Projects、1 個 Tool、0 個 Notes、1 個 Now。

- [ ] **Step 7: 提交**

```bash
git add lib/content lib/projects.ts lib/projects.test.ts lib/tools.ts lib/tools.test.ts lib/notes.ts lib/notes.test.ts lib/now.ts lib/now.test.ts content/projects content/tools content/notes content/now.md
git commit -m "feat: add validated portfolio content models"
```

### Task 3: 改造全站框架、導覽與跨內容搜尋

**Files:**
- Create: `lib/search.ts`
- Create: `lib/search.test.ts`
- Modify: `app/layout.tsx`
- Modify: `components/Header.tsx`
- Create: `components/Header.test.tsx`
- Modify: `components/Footer.tsx`
- Create: `components/Footer.test.tsx`
- Modify: `components/CommandPalette.tsx`
- Create: `components/CommandPalette.test.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `siteConfig`, `getEnabledContactLinks`, `getAllProjects`, `getAllTools`, `getAllNotes`。
- Produces: `SearchItem { title: string; href: string; type: "project" | "tool" | "note"; label: string }`。
- Produces: `buildSearchItems(projects, tools, notes): SearchItem[]`, `filterSearchItems(items, query, limit?: number): SearchItem[]`。

- [ ] **Step 1: 寫搜尋與 Shell 的失敗測試**

測試搜尋結果直接使用 `/projects/...`、`/tools/...`、`/notes/...` href；查詢匹配標題、標籤與類型；空查詢最多回傳 7 筆。Header 渲染六個導覽項，Footer 只渲染已啟用聯絡連結，畫面中沒有 `JK Space News`。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm run test -- lib/search.test.ts components/Header.test.tsx components/Footer.test.tsx components/CommandPalette.test.tsx`

Expected: FAIL，因現有搜尋只導向 `/news/{slug}`，導覽與品牌仍是舊版。

- [ ] **Step 3: 實作搜尋資料與全站 Layout**

`app/layout.tsx` 平行載入三個集合並呼叫 `buildSearchItems`；根語系改為 `zh-Hant-TW`，並掛載 Task 1 的 Analytics 元件。`CommandPalette` 直接 `router.push(item.href)`，結果標示「專案／工具／筆記」，無結果文案為「找不到相關內容」。

- [ ] **Step 4: 實作 Header、Footer 與互動狀態**

Header 使用集中導覽；手機按鈕具 `aria-expanded`、`aria-controls` 與中文 label。Footer 顯示新品牌、標語、About／Privacy／Contact 及真實 GitHub／Telegram；未設定聯絡項不產生 DOM。

- [ ] **Step 5: 補齊焦點與減少動態樣式**

在 `app/globals.css` 提供一致 `:focus-visible`，並在 `@media (prefers-reduced-motion: reduce)` 停止非必要動畫與平滑捲動。

- [ ] **Step 6: 執行測試**

Run: `npm run test -- lib/search.test.ts components/Header.test.tsx components/Footer.test.tsx components/CommandPalette.test.tsx && npm run typecheck`

Expected: PASS。

- [ ] **Step 7: 提交**

```bash
git add lib/search.ts lib/search.test.ts app/layout.tsx app/globals.css components/Header.tsx components/Header.test.tsx components/Footer.tsx components/Footer.test.tsx components/CommandPalette.tsx components/CommandPalette.test.tsx
git commit -m "feat: rebrand global navigation and search"
```

### Task 4: 建立專案列表與案例頁

**Files:**
- Create: `components/content/ContentCard.tsx`
- Create: `components/content/ContentMeta.tsx`
- Create: `components/content/StatusBadge.tsx`
- Create: `app/projects/page.tsx`
- Create: `app/projects/projects-view.ts`
- Create: `app/projects/projects-view.test.ts`
- Modify: `app/projects/[slug]/page.tsx`
- Modify: `content/projects/pcb-test-point-comparison.md`
- Modify: `content/projects/jk-space-news-automation.md`
- Modify: `e2e/site.spec.ts`

**Interfaces:**
- Consumes: `ProjectItem`, `getAllProjects`, `getProjectBySlug`。
- Produces: `filterProjects(items, { area?, status? }): ProjectItem[]`。
- Produces: 共用 `StatusBadge`，接受 Project 與 Tool status。

- [ ] **Step 1: 寫專案篩選與頁面失敗測試**

`projects-view.test.ts` 斷言 area 與 status 可單獨或同時篩選，無條件時精選優先、其餘依 `updatedAt` 排序。E2E 斷言 `/projects` 至少顯示 PCB 與 JK Space 自動化案例，並可進入詳情。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm run test -- app/projects/projects-view.test.ts`

Expected: FAIL，因 `/projects` 與 `filterProjects` 尚不存在。

- [ ] **Step 3: 實作專案列表與共用內容元件**

列表接受 `area`、`status` query；卡片顯示名稱、summary、role、status、areas、tags、outcome。無結果時顯示清除篩選入口，不建立空的假卡片。

- [ ] **Step 4: 重構專案詳情**

返回連結改為 `/projects`；頁首顯示 role、status、year、updatedAt、outcome。兩篇 Markdown 依「問題、角色、限制、決策、實作、結果、限制、相關連結」整理，保留無法量化的結果為定性描述，不創造數字。

- [ ] **Step 5: 執行單元與頁面測試**

Run: `npm run test -- app/projects/projects-view.test.ts && npm run typecheck`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add components/content app/projects content/projects e2e/site.spec.ts
git commit -m "feat: publish project case studies"
```

### Task 5: 將 Tools 改為自有工具入口並保護 PCB 核心流程

**Files:**
- Modify: `app/tools/page.tsx`
- Modify: `app/tools/[slug]/page.tsx`
- Modify: `app/tools/pcb-test-point/app/page.tsx`
- Create: `components/tools/OpenToolLink.tsx`
- Create: `components/tools/OpenToolLink.test.tsx`
- Create: `lib/pcb-tool/parser.test.ts`
- Create: `lib/pcb-tool/compare.test.ts`
- Create: `lib/pcb-tool/parseDXF.test.ts`
- Create: `public/samples/pcb-test-point-old.html`
- Create: `public/samples/pcb-test-point-new.html`
- Modify: `content/tools/pcb-test-point.md`
- Create: `e2e/pcb-tool.spec.ts`

**Interfaces:**
- Consumes: `ToolItem`, `getAllTools`, `getToolBySlug`, `StatusBadge`。
- Preserves: `parseHTML(content: string): TestPoint[]`, `parseTargetList(text: string): Set<string>`, `compareTestPoints(oldPoints, newPoints, targetList?)`, `parseDXF(content, fileName)`。
- Produces: `loadExampleFiles(): Promise<{ oldContent: string; newContent: string }>`，只讀取同站 `/samples/...`。
- Produces: `OpenToolLink({ slug, href, children })`，點擊時呼叫 `track("Open Tool", { slug })` 後導向工具；事件只含 slug。

- [ ] **Step 1: 為既有 PCB 核心寫回歸測試**

測試 OrCAD 表格標題不在第一列、逗號座標、無效列、Moved／Added／Removed／Unchanged、Target List 篩選、DXF outline layer fallback。

- [ ] **Step 2: 執行測試確認現況**

Run: `npm run test -- lib/pcb-tool/parser.test.ts lib/pcb-tool/compare.test.ts lib/pcb-tool/parseDXF.test.ts`

Expected: PASS；若失敗，先記錄既有缺陷並以不改公開行為的最小修正使其通過。

- [ ] **Step 3: 寫工具頁與範例流程的失敗 E2E**

`OpenToolLink.test.tsx` mock `@vercel/analytics`，斷言點擊只送出 `track("Open Tool", { slug: "pcb-test-point" })`。`e2e/pcb-tool.spec.ts` 斷言：工具詳情顯示「資料不離開瀏覽器」、支援格式與限制；點擊「載入範例」後顯示至少一筆 Moved、Added、Removed 或 Unchanged 結果；上傳本機 fixture 時，除 `/_vercel/insights` 匿名分析外，不得出現 fetch／XHR／POST／PUT／PATCH 網路請求。

- [ ] **Step 4: 建立無機密範例檔與載入按鈕**

兩個 HTML fixture 各包含 `RefDes`、`SYM_X`、`SYM_Y`，資料刻意涵蓋四種比較狀態。按鈕只 fetch 同站靜態檔並呼叫既有 parser，不建立 API route。

- [ ] **Step 5: 改寫 Tools 列表與詳情**

列表標題改為「我做的工具」，卡片顯示 status、privacy、inputTypes、outputTypes 與 `OpenToolLink`。詳情包含用途、格式、限制、隱私、範例、最後更新與回饋入口；`appUrl` 使用內部連結，外部 URL 才用安全的新分頁連結。Vercel 自訂事件只在支援的方案中顯示；所有方案仍可用 `/tools/{slug}/app` 的匿名 pageview 衡量開啟量。

- [ ] **Step 6: 執行驗證**

Run: `npm run test -- lib/pcb-tool components/tools/OpenToolLink.test.tsx && npm run typecheck && npm run test:e2e -- e2e/pcb-tool.spec.ts`

Expected: PASS，且 E2E 沒有使用者檔案上傳請求。

- [ ] **Step 7: 提交**

```bash
git add app/tools components/tools content/tools lib/pcb-tool public/samples e2e/pcb-tool.spec.ts
git commit -m "feat: present PCB comparison as a first-party tool"
```

### Task 6: 建立 Notes、新聞觀點格式與新 RSS

**Files:**
- Create: `app/notes/page.tsx`
- Create: `app/notes/[slug]/page.tsx`
- Create: `app/notes/notes-view.ts`
- Create: `app/notes/notes-view.test.ts`
- Create: `components/notes/NoteFilter.tsx`
- Create: `components/notes/SourceDisclosure.tsx`
- Create: `components/notes/SourceDisclosure.test.tsx`
- Create: `lib/rss.ts`
- Create: `lib/rss.test.ts`
- Modify: `app/feed.xml/route.ts`
- Modify: `e2e/site.spec.ts`

**Interfaces:**
- Consumes: `NoteItem`, `getAllNotes`, `getNoteBySlug`。
- Produces: `filterNotes(items, type?: NoteType): NoteItem[]`。
- Produces: `buildNotesRss(items: NoteItem[], config: SiteConfig): string`。
- Produces: `SourceDisclosure({ note: CommentaryNote })`。

- [ ] **Step 1: 寫分類、來源揭露與 RSS 失敗測試**

測試四種分類；空集合顯示「筆記正在整理中」；commentary 顯示來源名稱、外部連結與事件日期。RSS 空集合仍是合法 channel；有文章時只產生 `/notes/{slug}`，不包含 `/news/`、`news@jk-space.com` 或 `tech@jk-space.com`。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm run test -- app/notes/notes-view.test.ts components/notes/SourceDisclosure.test.tsx lib/rss.test.ts`

Expected: FAIL，因 Notes 頁面與新 RSS 尚不存在。

- [ ] **Step 3: 實作 Notes 列表與詳情**

列表從 URL query `type` 篩選，無內容時顯示真實空狀態。詳情對 commentary 強制顯示來源區塊，並在文章內把「事件摘要」與「我的觀點」作為內容模板要求；Metadata 使用 Article，不宣告為新聞出版者。

- [ ] **Step 4: 替換 RSS**

`app/feed.xml/route.ts` 僅呼叫 `getAllNotes` 與 `buildNotesRss`，名稱為 `JK Space`，描述使用 site config，不輸出假 email，自動 escape XML 特殊字元。

- [ ] **Step 5: 執行測試**

Run: `npm run test -- app/notes components/notes lib/rss.test.ts lib/notes.test.ts && npm run typecheck`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add app/notes components/notes lib/rss.ts lib/rss.test.ts app/feed.xml/route.ts e2e/site.spec.ts
git commit -m "feat: add original notes and commentary publishing"
```

### Task 7: 重做首頁為個人工程實驗室入口

**Files:**
- Create: `lib/home.ts`
- Create: `lib/home.test.ts`
- Create: `components/home/FocusAreas.tsx`
- Create: `components/home/FeaturedTool.tsx`
- Create: `components/home/NowCard.tsx`
- Create: `components/home/HomePageContent.tsx`
- Create: `components/home/HomePageContent.test.tsx`
- Modify: `app/page.tsx`
- Modify: `e2e/site.spec.ts`

**Interfaces:**
- Consumes: `getFeaturedProjects`, `getFeaturedTool`, `getRecentNotes`, `loadNow`。
- Produces: `selectHomeContent(projects, tools, notes): { featuredProjects; featuredTool; recentNotes }`。

- [ ] **Step 1: 寫首頁選擇規則與畫面的失敗測試**

斷言精選專案最多 4 個、近期筆記最多 3 個、工具為第一個 `available` 項目。畫面包含固定定位、標語、「查看專案」、「使用工具」、三個焦點、Now 日期；網站框架不包含「最新情報」、「查看全部趨勢」或 `JK Space News` 品牌文字。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm run test -- lib/home.test.ts components/home/HomePageContent.test.tsx`

Expected: FAIL，因首頁仍讀取新聞。

- [ ] **Step 3: 實作首頁內容選擇與七個區塊**

依序渲染 Hero、專業焦點、精選工具、精選專案、最新筆記、Now、合作 CTA。Notes 為空時只顯示簡短空狀態；不隱藏其他區塊。首頁改為靜態內容，不保留 60 秒新聞 ISR。視覺延續深色優先、單一藍／青強調色與工程網格，優先展示真實工具截圖，不加入新聞封面拼貼或非必要動畫。

- [ ] **Step 4: 補首頁 E2E**

E2E 斷言首屏可找到 `/projects` 與 `/tools` CTA、至少兩個專案及一個工具，且從首頁能抵達聯絡頁。

- [ ] **Step 5: 執行驗證**

Run: `npm run test -- lib/home.test.ts components/home/HomePageContent.test.tsx && npm run test:e2e -- e2e/site.spec.ts`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add app/page.tsx lib/home.ts lib/home.test.ts components/home e2e/site.spec.ts
git commit -m "feat: launch personal engineering lab homepage"
```

### Task 8: 整合 About、Contact、Privacy 與 404 信任頁面

**Files:**
- Modify: `app/about/page.tsx`
- Modify: `app/contact/page.tsx`
- Create: `app/contact/ContactLinks.tsx`
- Create: `app/contact/ContactLinks.test.tsx`
- Modify: `app/privacy/page.tsx`
- Modify: `app/not-found.tsx`
- Modify: `e2e/site.spec.ts`

**Interfaces:**
- Consumes: `siteConfig`, `getEnabledContactLinks`。
- Produces: `ContactLinks({ links }: { links: ContactLink[] })`，空陣列時不渲染假卡片。

- [ ] **Step 1: 寫 Contact 的失敗測試**

測試 GitHub 與 Telegram 連結具 `rel="noopener noreferrer"`；空陣列不顯示 Email 或 placeholder；整個頁面不存在 `jk@example.com`。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm run test -- app/contact/ContactLinks.test.tsx`

Expected: FAIL，因現有頁面有假 Email 且 Telegram 無連結。

- [ ] **Step 3: 重寫四個信任頁面**

- About：把現有 `/profile` 的 15+ 年硬體研發、AI 自動化與獨立產品方向移至 `/about`，並整理成簡介、專業領域、工作方法、經歷時間線、目前關注方向與外部連結；刪除新聞媒體介紹。
- Contact：說明技術交流、工具回饋與合作討論，只渲染集中設定中的真實連結。
- Privacy：品牌改為 JK Space，說明無帳號、無表單、Vercel 連線資料及 PCB 檔案只在瀏覽器處理；移除不存在的登入、Cookie 與假聯絡說法。
- 404：改成一般工程網站文案，提供首頁、Projects、Tools、Notes 入口。

- [ ] **Step 4: 執行測試與敏感 placeholder 掃描**

Run: `npm run test -- app/contact/ContactLinks.test.tsx && ! rg -n "jk@example.com|連結即將開放" app components lib`

Expected: PASS，`rg` 無匹配。

- [ ] **Step 5: 提交**

```bash
git add app/about app/contact app/privacy app/not-found.tsx e2e/site.spec.ts
git commit -m "feat: update personal profile and trust pages"
```

### Task 9: 備份後安全退場舊新聞與訪談路由

**Files:**
- Create: `app/news/[slug]/page.test.ts`
- Replace: `app/news/[slug]/page.tsx`
- Modify: `next.config.ts`
- Create: `next.config.test.ts`
- Create: `scripts/verify-no-legacy-news.mjs`
- Create: `scripts/verify-no-legacy-news.test.mjs`
- Create: `docs/migrations/2026-10-14-retired-news-assets.txt`
- Modify: `package.json`
- Modify: `package-lock.json`
- Delete: `content/news/`
- Delete: `content/archived-news.json`
- Delete: `lib/news.ts`
- Delete: `lib/archived-news.ts`
- Delete: `lib/interviews.ts`
- Delete: `app/trending/`
- Delete: `app/interview/`
- Delete: `app/profile/`
- Delete if `rg` confirms unused: `components/HeroCarousel.tsx`, `components/LatestNewsList.tsx`, `components/NewsCard.tsx`, `components/TldrBlock.tsx`, `components/CategoryFilter.tsx`
- Delete: `scripts/prune-news-content.mjs`, `scripts/validate-news-content.mjs`, `scripts/weekly-archive-prune.sh`
- Delete from reviewed manifest: news-only files under `public/images/`

**Interfaces:**
- Consumes: 新 `/notes`、`/about` 路由。
- Produces: `nextConfig.redirects()` 中 `/news`、`/trending`、`/profile`、`/interview`、`/interview/:path*` 的永久轉址。
- Produces: `npm run verify:no-legacy-news`。

- [ ] **Step 1: 寫舊路由與殘留檢查的失敗測試**

斷言 redirects 目的地正確；`app/news/[slug]` 永遠呼叫 `notFound()` 並 export `robots: { index: false, follow: true }`；掃描 `app`、`components`、`lib` 時不得出現 `@/lib/news`、作為網站框架品牌的 `JK Space News`、`/trending` 公開連結或 `content/news` 建置讀取。歷史專案 Markdown 中的舊名稱不列為殘留錯誤。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm run test -- next.config.test.ts app/news/'[slug]'/page.test.ts && node --test scripts/verify-no-legacy-news.test.mjs`

Expected: FAIL，因舊新聞仍存在。

- [ ] **Step 3: 驗證並建立可回復備份**

先驗證：

```bash
git status --short
git ls-files content/news | wc -l
find /Users/jk_sapce/Archives/jk-space-news/articles -type f | wc -l
```

Expected: 工作區乾淨、Git 中有 521 篇新聞、本機 archive 至少 521 篇。接著建立 `backup/news-publication-final-2026-10-14` 指向刪除前 HEAD，並用 `git ls-tree -r --name-only backup/news-publication-final-2026-10-14 -- content/news | wc -l` 再次確認為 521。

- [ ] **Step 4: 產生並人工檢查新聞圖片精確清單**

建立一次性 Node 腳本：只讀新聞 frontmatter 的 `/images/...`，排除仍被 `content/projects`、`content/tools`、`content/notes`、`app` 或 `components` 引用的圖片；拒絕 `public/images` 以外路徑；將排序後的 Git tracked 路徑寫入 `docs/migrations/2026-10-14-retired-news-assets.txt`。人工確認清單不含 `pcb-tool-1.png`、`pcb-tool-2.png`、`default-cover.svg` 與 icon。

- [ ] **Step 5: 以 Git 可回復方式移除舊內容**

使用 `git rm` 移除已列明的 news／interview 檔案與 scripts；使用 `git rm --pathspec-from-file=docs/migrations/2026-10-14-retired-news-assets.txt` 移除精確圖片清單。完成後刪除一次性清單產生器，但保留清單本身作為稽核紀錄。

- [ ] **Step 6: 實作舊路由行為與殘留驗證**

`app/news/[slug]/page.tsx` 不讀任何 archive，只設定 noindex 並 `notFound()`。`next.config.ts` 新增永久 redirects。`verify:no-legacy-news` 掃描公開程式與內容；package scripts 移除 archive/prune/舊 content verify，改加入新驗證。

- [ ] **Step 7: 盤點但不變更外部自動化**

在 migration 文件末尾記錄需由站主另行確認的 OpenClaw、排程、API key 與 webhook；本任務不呼叫外部刪除或停用操作。

- [ ] **Step 8: 執行退場驗證**

Run: `npm run test -- next.config.test.ts app/news/'[slug]'/page.test.ts && npm run verify:no-legacy-news && npm run build:local`

Expected: PASS；Next build 不列出任何靜態新聞 slug，且 `/news/[slug]` 為單一動態 404 路由。

- [ ] **Step 9: 提交**

```bash
git add -A
git commit -m "refactor: retire automated news publishing"
```

### Task 10: 完成 Metadata、sitemap、robots、Open Graph 與結構化資料

**Files:**
- Create: `lib/seo.ts`
- Create: `lib/seo.test.ts`
- Create: `components/JsonLd.tsx`
- Create: `components/JsonLd.test.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/sitemap.ts`
- Modify: `app/robots.ts`
- Modify: `app/api/og/route.tsx`
- Modify: `app/projects/[slug]/page.tsx`
- Modify: `app/tools/[slug]/page.tsx`
- Modify: `app/notes/[slug]/page.tsx`

**Interfaces:**
- Consumes: `siteConfig`, Projects、Tools、Notes loaders。
- Produces: `buildSitemapEntries({ baseUrl, projects, tools, notes }): MetadataRoute.Sitemap`。
- Produces: `personJsonLd(config)`, `websiteJsonLd(config)`, `projectJsonLd(project, config)`, `toolJsonLd(tool, config)`, `articleJsonLd(note, config)`。
- Produces: `JsonLd({ data })`，序列化時 escape `<` 為 `\u003c`。

- [ ] **Step 1: 寫 SEO 失敗測試**

斷言 sitemap 只含靜態六個主入口、privacy、Project、Tool、Note；不含 `/news`、`/trending`、`/profile`、`/interview`。JSON-LD 類型正確，commentary 是 `Article`，工具是 `SoftwareApplication`，含 `</script>` 的標題不能中斷 script。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm run test -- lib/seo.test.ts components/JsonLd.test.tsx`

Expected: FAIL，因 sitemap 仍由 News 產生且 JSON-LD 尚不存在。

- [ ] **Step 3: 實作全站 Metadata 與 canonical**

Layout 預設 title、description、authors、creator、Open Graph 改用 site config；首頁 canonical `/`。各詳情頁 canonical 使用自己的 route，OG 圖呼叫 `/api/og` 並加入內容類型。

- [ ] **Step 4: 實作 sitemap、robots 與 JSON-LD**

首頁注入 Person 與 WebSite；專案使用 CreativeWork，工具使用 SoftwareApplication，Notes 使用 Article。robots 允許公開內容並指向新 sitemap；舊 `/news/[slug]` 自己維持 noindex。

- [ ] **Step 5: 重做 OG 圖品牌**

`app/api/og/route.tsx` 移除新聞類別與媒體語彙，顯示 JK Space、內容類型、標題與工程網格視覺；未知 type 使用「JK Space」。

- [ ] **Step 6: 執行測試**

Run: `npm run test -- lib/seo.test.ts components/JsonLd.test.tsx lib/rss.test.ts && npm run typecheck`

Expected: PASS。

- [ ] **Step 7: 提交**

```bash
git add lib/seo.ts lib/seo.test.ts components/JsonLd.tsx components/JsonLd.test.tsx app/layout.tsx app/sitemap.ts app/robots.ts app/api/og app/projects app/tools app/notes
git commit -m "feat: align SEO with JK Space portfolio"
```

### Task 11: 文件、響應式、可及性與發布前驗收

**Files:**
- Create: `README.md`
- Create: `docs/content-authoring.md`
- Create: `docs/post-launch-validation.md`
- Modify: `e2e/site.spec.ts`
- Modify: `e2e/pcb-tool.spec.ts`
- Modify as findings require: `app/globals.css`, affected page/component files

**Interfaces:**
- Consumes: 前十項任務全部公開路由與驗證命令。
- Produces: 可重現的本機維護、測試、內容發布與部署說明。

- [ ] **Step 1: 完成端到端驗收案例**

`e2e/site.spec.ts` 必須覆蓋：

- 首頁能在可見文字中辨識「個人工程實驗室」。
- 六個導覽入口皆可抵達。
- `/profile` → `/about`、`/trending` → `/notes`、`/news` → `/notes`。
- 任意 `/news/retired-slug` 顯示 404。
- `Meta+K` 或 `Control+K` 開啟搜尋，鍵盤可選擇 Project／Tool。
- 320、768、1440 viewport 均滿足 `document.documentElement.scrollWidth <= window.innerWidth`。
- `prefers-reduced-motion: reduce` 時動畫 duration 為 0 或近似 0。
- Contact 沒有 `jk@example.com` 或無 href 的社群按鈕。

- [ ] **Step 2: 執行 E2E 並修正發現**

Run: `npx playwright install chromium && npm run test:e2e`

Expected: PASS。

- [ ] **Step 3: 撰寫維護文件**

`README.md` 包含環境需求、安裝、dev、test、verify、build、內容目錄與部署關係。`docs/content-authoring.md` 提供 Project、Tool、一般 Note、新聞觀點與 Now 的完整 frontmatter 範例，並明確說明 commentary 缺來源會失敗、未設定聯絡方式不顯示。`docs/post-launch-validation.md` 提供 60 天檢查表：五人 10 秒定位測試、Project／Tool／Notes／Contact 導覽流量、`Open Tool` 或工具 app pageview、2 篇案例與 2 篇原創筆記，以及不改 React 新增內容的驗證紀錄。

- [ ] **Step 4: 執行完整靜態驗證**

Run: `npm ci && npm run verify && npm run verify:no-legacy-news`

Expected: ESLint、TypeScript、Vitest、Next production build 全部通過，無 warning 被誤當成功。

- [ ] **Step 5: 執行代表頁視覺與 Lighthouse 驗收**

先完成 production build，再執行 `npm run audit`。`lighthouserc.json` 會測試首頁、PCB Project、PCB Tool 與 Notes 列表；Accessibility 與 SEO 各至少 90。Performance 只記錄結果，不設單一分數門檻，但人工檢查不得有明顯 CLS 或阻塞式大型媒體。第一篇真實 Note 發布時，將該詳情 URL 加入相同 audit。

- [ ] **Step 6: 檢查 Git 差異與建立最終本機提交**

Run: `git diff --check && git status --short && git log --oneline --decorate -12`

Expected: 無 whitespace error；只包含本計畫範圍內變更。提交：

```bash
git add README.md docs/content-authoring.md docs/post-launch-validation.md e2e app components lib content public package.json package-lock.json next.config.ts
git commit -m "docs: document JK Space publishing workflow"
```

- [ ] **Step 7: 發布閘門**

先向站主提交本機驗證結果、畫面與完整 commit 清單。只有站主明確同意正式發布後，才執行 `git push origin main` 觸發 Vercel production deployment；發布後驗證 `https://jk-space.com` 的首頁、redirect、404、sitemap、RSS 與 PCB 工具。外部 OpenClaw 排程維持不變，另案處理。

---

## Recommended Execution Order

1. Tasks 1–3：先建立測試、資料模型與全站骨架。
2. Tasks 4–8：逐一交付 Projects、Tools、Notes、Home 與信任頁面；每項都可獨立 review。
3. Task 9：功能替代入口完整後，才移除舊新聞。
4. Task 10：在最終路由穩定後統一 SEO。
5. Task 11：全站驗收、文件與人工發布閘門。

Task 9 是唯一大量刪除步驟，必須在 Tasks 1–8 全部通過、備份分支與本機 archive 驗證成功後執行。任何驗證失敗都停止刪除，不以跳過檢查繼續。
