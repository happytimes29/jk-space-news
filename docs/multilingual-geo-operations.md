# 多語 SEO／GEO 操作手冊

本手冊用於 JK Space 的繁體中文、簡體中文與英文內容發布。目標是讓搜尋引擎與可引用公開網頁的 AI 系統讀到穩定 URL、正確語言、作者、日期、來源與限制；不保證搜尋排名、摘要曝光或 AI 引用。

## 1. 翻譯檔與狀態

繁中原文放在集合根目錄，簡中與英文使用相同檔名及 slug，放在 `zh-cn/`、`en/`：

```text
content/projects/example.md
content/projects/zh-cn/example.md
content/projects/en/example.md
```

Project 譯文 frontmatter 範例：

```yaml
---
title: Translated project title
slug: example
summary: Direct answer describing the problem, result, and main limitation.
year: 2026
status: maintained
areas: [hardware, product]
role: Design and implementation
tags: [PCB, Next.js]
featured: true
updatedAt: 2026-10-19
coverImage: /images/example.png
locale: en
translationOf: example
translationStatus: reviewed
translatedAt: 2026-10-19
---
```

Tool 與 Note 沿用各自原文的全部必要欄位，再加入同一組 `locale`、`translationOf`、`translationStatus`、`translatedAt`。Note 範例：

```yaml
locale: zh-CN
translationOf: validating-pcb-samples
translationStatus: reviewed
translatedAt: 2026-10-19
```

狀態用途：

- `draft`：編輯中，Preview 與 production 都不建立頁面。
- `reviewed`：可在 Preview 校對，production 不建立頁面，也不進 sitemap、RSS 或 `hreflang`。
- `published`：站主確認後公開，才會進 production 路由、搜尋、sitemap、RSS（Notes）與 `hreflang`。

不要建立沒有繁中原文的翻譯；檔名、slug 與 `translationOf` 必須相同。

## 2. Preview、審核與正式可見性

安裝依賴後，以 Preview 規則檢查 `reviewed` 內容：

```bash
CONTENT_PREVIEW=1 npm run build:local
CONTENT_PREVIEW=1 npm run dev
```

審核每一語言頁面時，逐項確認：

1. 標題、摘要、正文、按鈕、麵包屑與圖片替代文字都是目標語言。
2. 技術名詞、數值、單位、日期、程式碼、URL、限制與原文一致。
3. canonical 指向目前頁面，`hreflang` 只列出真實存在的版本，`x-default` 指向繁中原文。
4. 未翻譯的相關內容連回繁中原文並清楚標示，不產生軟 404。
5. JSON-LD 的 URL、`inLanguage`、作者、日期與畫面可見內容一致。

站主確認文字後，把個別檔案的 `translationStatus: reviewed` 改成 `translationStatus: published`，再執行正式規則：

```bash
npm run verify
npm run build:local
npm run test:e2e
```

正式建置輸出不應包含任何 `draft` 或 `reviewed` 詳頁。提交時保存變更檔案、審核人、命令結果與 Preview 截圖；推送、PR、合併與部署仍需站主另行授權。

## 3. 可引用內容結構

每頁先給能獨立理解的摘要或直接答案，再展開細節。建議順序如下：

1. 問題、適用情境與讀者需要知道的主要限制。
2. 前提、輸入資料、版本、日期與環境。
3. 方法、步驟、比較或關鍵決策。
4. 結果與驗證方式；量化數字必須有實測依據。
5. 已知限制、失敗案例、尚未驗證的部分與下一步。
6. 原始資料、程式碼、可信來源與相關站內內容。

事實、個人經驗、估算與推論必須明確區分。來源連結應盡量指向原始規格、官方文件或第一手資料；引用第三方內容時只做必要摘要，不搬運全文。新聞觀點須保留原始來源標題、URL、來源日期，以及分開的「事件摘要」和「我的觀點」。

圖片使用穩定且有意義的檔名；每個語言版本都要翻譯 alt 與 caption。圖片中的文字若影響理解，應提供目標語言版本或在圖說解釋，不能只換正文而留下無法理解的截圖。不要上傳客戶資料、機密板檔或含個資的畫面。

## 4. 爬蟲政策與驗證

`robots.txt` 明確允許 `*`、`Googlebot`、`Bingbot` 與 `OAI-SearchBot` 存取公開頁面，並對 `GPTBot` 設定 `Disallow: /`。`OAI-SearchBot` 用於搜尋結果能見度；`GPTBot` 的訓練用途政策獨立處理。robots 規則不是存取控制，機密資料絕不能只靠 robots 阻擋。

目前不依賴 `llms.txt`。Google 的 AI 搜尋功能沿用一般搜尋的可索引性與內容品質要求，不需要特殊 GEO 標記；canonical、`hreflang`、sitemap、結構化資料與實質內容才是基礎，也不保證內容一定被 AI 引用。

本機啟動 production server 後檢查：

```bash
curl -s http://localhost:3000/robots.txt
curl -s http://localhost:3000/sitemap.xml
curl -s http://localhost:3000/en/about
curl -s http://localhost:3000/feed.xml
```

確認 robots 的 `OAI-SearchBot` 為 `Allow: /`、`GPTBot` 為 `Disallow: /`；sitemap 只包含正式頁面；英文頁的 canonical、`hreflang`、Open Graph 與 JSON-LD 一致；目前唯一 Feed 是繁中 `/feed.xml`。

## 5. 上線後每月量測

發布前保存基準，之後每月在相同日期區間比較，不使用無法驗證的「GEO 分數」。

- Google Search Console：提交 `sitemap.xml`，用 URL Inspection 檢查三語核心頁與新發布詳頁是否可索引、canonical 是否由本站指定；在 Performance 依頁面路徑、國家／地區、查詢與裝置比較曝光、點擊、CTR 與平均排名。
- Bing Webmaster Tools：提交同一 sitemap，檢查抓取、索引與 URL 問題。
- Vercel Analytics：依 `/`、`/zh-cn`、`/en` 路徑比較匿名 pageview 與入口頁；不把查詢字串、檔名或工具內容加入事件。
- 內容紀錄：列出本月新發布／降版翻譯、來源更新、404、錯誤 hreflang、搜尋查詢與人工發現的 AI 引用。AI 引用只能記錄實際觀察，不推論未提供的流量或成效。

如果某語言沒有已發布 Note，不建立該語言 RSS。第一篇正式譯文發布後，先驗證 RSS builder 的語言、連結與 self URL，再另案新增公開 route。

## 6. 回滾

單篇翻譯有問題時，把 `translationStatus` 從 `published` 降為 `reviewed` 或 `draft`，重新執行 production build，確認該語言詳頁已從路由、搜尋、sitemap、RSS 與 `hreflang` 消失；繁中原文保持不變。

整體發布有問題時，回退多語言功能 commit／PR 到最後一次通過 `npm run verify` 與 E2E 的版本。繁中 URL 沒有遷移，不需要建立反向轉址。若只需調整爬蟲政策，可獨立回退 `app/robots.ts`，但外部爬蟲要重新抓取後才會反映。回滾後重跑 production build、sitemap、robots、關鍵頁面與 404 檢查，並記錄原因與恢復條件。
