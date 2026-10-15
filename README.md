# JK Space — 個人工程實驗室

把工程上的麻煩事，做成好用的工具。

Next.js App Router、React、TypeScript 與 Tailwind CSS 建立的繁體中文作品站。專案、工具、原創筆記與近況由 Git 管理的 Markdown／MDX 產生；PCB 工具在瀏覽器內解析使用者檔案，沒有上傳 API。

## 本機環境

- Node.js 20.9 以上及 npm；使用支援中的 Node LTS。此次驗收環境為 Node 26.8.2 / npm 11.19.1。
- Chromium（Playwright 可自動安裝）；Lighthouse 需要本機 Chrome／Chromium。
- 不需要 CMS、資料庫或登入憑證。

```bash
npm ci
npm run dev -- --hostname 127.0.0.1
```

開啟 `http://127.0.0.1:3000`。品牌、導覽、真實聯絡管道與正式站網址集中於 `lib/site-config.ts`。一般本機驗證不用設定環境變數；`NEXT_PUBLIC_SITE_URL` 可覆寫 canonical／RSS／sitemap 的網站根網址，正式設定由站主管理，不能為了本機測試修改正式 URL。

## 驗證與 production 預覽

```bash
npm test
npm run lint
npm run typecheck
npm run verify
npm run verify:no-legacy-news
npx playwright install chromium
npm run test:e2e
npm run build:local
npm run start -- --hostname 127.0.0.1
```

`verify` 依序執行零 warning ESLint、TypeScript、Vitest、新聞退場 CLI fixture tests、退場檢查與 webpack production build。`build` 是 Next 預設 Turbopack build；`build:local` 是此專案的可重現 webpack production build，與 production server 搭配使用。E2E 預設啟動 dev server；本機已有 3000 port 的 production server 時會直接測試它。請避免同時執行 dev 與 build，兩者共用 `.next`。

完成 production build 並停止佔用 3000 port 的 server 後執行：

```bash
npm run audit
```

此命令是 Lighthouse，測試首頁、PCB Project、PCB Tool 與 Notes 列表；Accessibility 與 SEO 各需至少 0.90，Performance 記錄分數並人工確認 CLS、媒體大小與阻塞資源。第一篇真實 Note 發布時，要將詳情網址加入 `lighthouserc.json` 同樣驗證。依賴安全掃描另用 `npm audit`／`npm audit --omit=dev`；不可把 Lighthouse 綠燈當成依賴漏洞已解決。

## 內容與程式目錄

| 路徑 | 用途 |
| --- | --- |
| `content/projects/*.md` 或 `.mdx` | 專案案例；自動建立列表、詳情、搜尋與 sitemap |
| `content/tools/*.md` 或 `.mdx` | 自有工具介紹；工具程式仍在 `app/tools/` |
| `content/notes/*.md` 或 `.mdx` | 原創筆記與具有來源的新聞觀點；空集合是正常狀態 |
| `content/now.md` | 首頁近況與真實更新日期 |
| `public/images/`、`public/samples/` | 公開圖片與無機密合成範例 |
| `lib/` | 內容解析、驗證、搜尋、SEO 與 PCB 純函式 |
| `app/`、`components/` | 頁面及共用 UI |
| `e2e/` | 瀏覽器使用流程驗證 |

完整欄位、可用範例與內容驗證見 [內容編寫](docs/content-authoring.md)。上線後的定位、流量、內容維護驗證見 [60 天檢查表](docs/post-launch-validation.md)。

## Git 內容發布與部署

1. 在工作分支只新增或更新內容檔、所需公開圖片與 Now 日期；先核對著作權、來源、機密資訊與真實成果。
2. 執行 `npm run verify`、`npm run verify:no-legacy-news`、E2E；用 production server 檢查新內容、搜尋、sitemap、RSS 與相關連結。用 `git diff --check` 與 `git diff --stat` 確認只包含預期變更。
3. 建立本機 commit，交付畫面、驗證結果與完整 commit 清單供站主審核。內容是在 build 時讀取；本機新增檔案不會自動更新正式站。
4. 只有站主明確同意正式發布，才將核准變更整合至 `main` 並推送 `origin main`，由既有 Vercel 主分支流程部署。此文件不代表發布授權。
5. 發布後以正式站驗證首頁、`/profile` → `/about`、`/news`／`/trending` → `/notes`、任意新聞詳情 404/noindex、`/sitemap.xml`、`/feed.xml` 與 PCB 範例。發布前驗證只涵蓋本機，不能宣稱正式環境已驗證。

舊新聞不參與正式建置；封存、備份與復原方式見 [退場紀錄](docs/migrations/2026-10-14-retired-news-publication.md)。外部 OpenClaw job、排程、API key、webhook 與其他服務的盤點／停用是站主另案操作；本 repo 的內容退場不會停掉那些資源，不得由此推定它們已停止。

匿名分析只保留經過隱私過濾的 pageview。`Open Tool` 介面只傳公開工具 slug，但目前自訂事件可能被過濾或受方案限制；請以 `/tools/pcb-test-point/app` pageview 作為可用的替代觀察。任何分析均不得記錄檔名、報表內容、RefDes、搜尋字串或聯絡資料。
