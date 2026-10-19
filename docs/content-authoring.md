# 內容編寫與發布

內容放在 Git 管理的 `content/`，支援 `.md` 與 `.mdx`；檔名建議與 `slug` 相同。slug 使用穩定的小寫英數與連字號，集合內必須唯一。只發布站主原創內容；Notes 目前保持真實空集合，不要為了填滿畫面發布示例。

## 三語翻譯與審核狀態

繁體中文是原始內容，直接放在 `content/projects/`、`content/tools/`、`content/notes/`。簡體中文與英文使用相同檔名及 slug，分別放在集合下的 `zh-cn/` 與 `en/` 子目錄，例如：

```text
content/projects/pcb-test-point-comparison.md
content/projects/zh-cn/pcb-test-point-comparison.md
content/projects/en/pcb-test-point-comparison.md
```

翻譯檔必須保留原內容模型的所有必要欄位，並額外加入以下欄位：

```yaml
locale: en # 简体中文使用 zh-CN
translationOf: pcb-test-point-comparison
translationStatus: draft # draft | reviewed | published
translatedAt: 2026-10-19
```

`translationOf`、檔名與 `slug` 必須一致，且繁體中文原文必須存在。三種狀態的規則如下：

- `draft`：尚在翻譯，不在 Preview 或正式網站產生路由。
- `reviewed`：文字已可供站主檢查；只在 `CONTENT_PREVIEW=1` 或 Vercel Preview 顯示，不進入正式建置。
- `published`：站主確認後才可改為此狀態，正式建置會產生該語言的詳頁、索引與搜尋項目。

本機審稿先執行 `CONTENT_PREVIEW=1 npm run build:local`，正式可見性則以 `npm run build:local` 驗證。不要為了讓正式建置出現路由而跳過文字審核。目前 PCB Project 與 Tool 已有 `reviewed` 的简体中文、英文版本；Note 的三語路由與 fixture 測試已完成，但因為站內沒有真實 Note 原文，所以沒有建立虛構的 Note 翻譯。

翻譯需保留技術名詞、數值、日期、限制、程式碼、圖片和 URL；圖片的 Markdown 替代文字應一併翻譯。互動 PCB 工具仍使用既有未加語言前綴的 `/tools/pcb-test-point/app`，翻譯頁會明示工具介面目前使用原始語言。相關 Project／Tool／Note 若沒有目前語言的可見翻譯，連結必須回到未加前綴的繁體中文原文，並顯示「繁體中文原文」標籤，不能導向不存在的翻譯頁。

以下是填滿必要欄位、可通過現有模型的編寫範例。Project／Tool 取自現有 PCB 內容；Note／commentary 是供編輯的未發布範本，需站主確認、完成原創正文後才放進 `content/notes/`，不可視為已發布文章或個人立場。

## Project：`content/projects/pcb-test-point-comparison.md`

```markdown
---
title: PCB 測試點自動比對工具
slug: pcb-test-point-comparison
summary: 比對新舊 OrCAD HTML 報表中的 RefDes 與座標，檢視移動、新增與移除的測試點。
year: 2026
status: maintained
areas: [hardware, product]
role: 設計與實作
tags: [Next.js, OrCAD, DXF, Canvas]
featured: true
updatedAt: 2026-06-10
coverImage: /images/pcb-tool-1.png
gallery: [/images/pcb-tool-1.png, /images/pcb-tool-2.png]
demoUrl: /tools/pcb-test-point/app
relatedTools: [pcb-test-point]
relatedNotes: []
outcome: 將測試點差異、目標清單篩選與板框疊圖整合在同一個瀏覽器工具。
---

## 問題與使用情境

PCB 改版後，需要核對新舊報表中測試點的位置差異。

## 角色與責任

我負責設計與實作，使用實際報表檢查解析與座標對應。

## 限制與設計考量

檔案只在瀏覽器處理；報表需有可辨識的 RefDes 與座標欄位。

## 解法與關鍵決策

以 RefDes 對應兩版資料，再以座標差分類結果。

## 實作過程與架構

DOMParser 讀取 HTML，Canvas 顯示測試點與 DXF 板框。

## 結果、驗證與已知限制

可用合成範例確認四種差異；疊圖單位與偏移仍需人工核對。

![工具操作畫面](/images/pcb-tool-2.png)

[開啟工具](/tools/pcb-test-point/app)
```

必要欄位為上例至 `updatedAt` 的全部欄位。`status`：`active`／`completed`／`maintained`／`archived`；`areas`：`hardware`／`automation`／`product`。`coverImage`、`gallery`、`demoUrl`、`repositoryUrl`、`relatedTools`、`relatedNotes`、`outcome` 選填；沒有真實公開 repo 就省略 `repositoryUrl`。相關內容填 slug，不填整段網址。`featured: true` 控制首頁精選；內容依更新日期排序。

## Tool：`content/tools/pcb-test-point.md`

```markdown
---
title: PCB 測試點自動比對工具
slug: pcb-test-point
summary: 比對 OrCAD HTML 的 RefDes 座標，支援 Target List 與 DXF 板框疊圖。
status: available
privacy: 所有使用者檔案只在瀏覽器內解析，不上傳伺服器。
inputTypes: [OrCAD HTML, DXF, Target List]
outputTypes: [差異表, 2D 座標圖, CSV]
updatedAt: 2026-10-15
appUrl: /tools/pcb-test-point/app
coverImage: /images/pcb-tool-1.png
sampleUrl: /samples/pcb-test-point-old.html
relatedProject: pcb-test-point-comparison
---

## 用途與使用方式

選取舊版與新版 HTML，或按「載入範例」檢視差異。

## 支援格式與限制

報表必須有 RefDes 與可解析的座標；單位與原點需要一致。

## 資料處理與隱私

檔案與 CSV 都在瀏覽器內處理，重新整理後需重新選取檔案。

## 範例輸入與預期結果

範例應顯示 TP1 Moved、TP2 Unchanged、TP3 Removed、TP4 Added。

## 已知問題與回饋

若沒有結果，先確認 HTML 表格與必要欄位。請透過聯絡頁提供去識別化最小範例。
```

必要欄位為上例至 `updatedAt` 的全部欄位；輸入／輸出陣列不可為空。`status`：`available`／`experimental`／`maintenance`／`archived`。`appUrl`、`coverImage`、`sampleUrl`、`repositoryUrl`、`relatedProject` 選填。只有真實可用工具填 `appUrl`；新增介紹內容不會自動實作一個工具應用。

## 一般 Note：未發布的工程筆記範本

```markdown
---
title: 如何驗證 PCB 測試點比對範例
slug: validating-pcb-comparison-samples
summary: 使用公開合成報表核對四種差異分類，並記錄單位與原點限制。
publishedAt: 2026-10-15
updatedAt: 2026-10-15
type: engineering
tags: [PCB, 驗證]
author: JK
featured: false
relatedProjects: [pcb-test-point-comparison]
relatedTools: [pcb-test-point]
---

## 問題與步驟

在工具按「載入範例」，確認 TP1 移動、TP2 不變、TP3 移除、TP4 新增。

## 驗證與限制

TP1 從 (100, 100) 移至 (130, 140)，距離為 50。這只驗證合成資料，不能取代實際板檔的工程核對。
```

所有 Note 必填 title、slug、summary、publishedAt、updatedAt、type、tags、author、featured。一般分類可用 `engineering`、`automation`、`project-log`；閱讀時間由正文計算。`coverImage`、`relatedProjects`、`relatedTools` 選填。首頁顯示最新三篇，不會因為 `featured` 製造假文章。

## 新聞觀點：未發布的來源／觀點格式範本

```markdown
---
title: 新聞觀點撰寫示例：從 ChatGPT 發布談工程驗證
slug: chatgpt-and-engineering-validation
summary: 以 ChatGPT 原始發布文章示範事件事實與個人判斷的分區方式。
publishedAt: 2026-10-15
updatedAt: 2026-10-15
type: commentary
tags: [AI, 工程驗證]
author: JK
featured: false
sourceTitle: Introducing ChatGPT
sourceUrl: https://openai.com/index/chatgpt/
sourcePublishedAt: 2022-11-30
relatedProjects: [jk-space-news-automation]
relatedTools: []
---

## 事件摘要

OpenAI 在來源文章介紹 ChatGPT。這個段落應只保留與評論有關的事實，數據與引述需逐項連到原始來源。

## 我的觀點

這裡需要由站主寫出自己的判斷、依據、限制與可驗證的下一步。此範本未經站主定稿，不應直接發布。
```

`commentary` 除 Note 必填欄位外，必須有非空 `sourceTitle`、HTTP(S) `sourceUrl`、有效 `sourcePublishedAt`；缺任一欄會在內容載入／建置時失敗並指出檔名與欄位，不會自動補資料。來源日期是原文發布日期，不是本站發文日期。

正文必須從 `## 事件摘要` 開始，然後 `## 我的觀點`，兩個 H2 各一次、依序且各有可見內容；不可增加其他 H2、在前面加入導言，或用註解／連結定義充當內容。可在兩區內使用 H3。來源揭露由頁面另外產生。內容驗證通過不等於已完成事實查核；不得完整搬運原文或只做無新增判斷的摘要。

## Now：`content/now.md`

```markdown
---
updatedAt: 2026-10-14
---

目前正將網站改造成個人工程實驗室，整理實際做過的工程專案、PCB 工具與原創筆記的發布方式。
```

Now 必須有有效更新日期與非空正文，手動維護，不使用目前時間假裝更新。

## 共通驗證與聯絡方式

日期接受 `YYYY-MM-DD` 或含時區的 ISO timestamp；不接受不可能的日期。必要字串不可空白、布林用 `true`／`false`、year 用整數、陣列用 YAML 陣列。缺欄、錯誤 enum、無效日期或重複 slug 會明確失敗。公開資源使用 `/images/...`、`/samples/...` 等站內路徑；外部連結使用真實 HTTP(S) URL，圖片不要含機密資料並提供替代文字。

聯絡方式只在 `lib/site-config.ts` 的 `contacts` 設定真實管道；未設定 Email 或其他管道就完全不渲染。不要新增 `jk@example.com`、空 href、`#` 或無作用社群按鈕來佔位。

## 不改 React 的內容驗證紀錄

1. 在工作分支建立一篇經站主完成的 Note，或更新既有 Project 的 Markdown、日期與真實成果；不要改 `app/` 或 `components/`。
2. 執行 `npm run verify` 與 `npm run verify:no-legacy-news`。如需確認錯誤條件，在暫存內容 fixture 驗證缺來源的 commentary 會失敗；不要把無效測試文章留在正式內容目錄。
3. 用 production server 確認列表、詳情、搜尋、sitemap、RSS；Notes 才會進入 RSS。首頁與相關內容是否顯示取決於內容數量、日期、featured 與關聯 slug。
4. 保存內容 commit、改動檔案清單、檢查命令／結果與畫面，並記錄「React 檔案改動 0」。執行 `git diff --check`，提交站主審核。
5. 依 README 的人工發布閘門整合／部署。第一篇真實 Note 需追加詳情 Lighthouse URL，Accessibility／SEO 各至少 0.90。

完整發布流程見 [README](../README.md)，60 天驗證表見 [post-launch-validation.md](post-launch-validation.md)。外部 OpenClaw、排程、密鑰與 webhook 的後續處理仍由站主另案執行，內容維護不授權改動外部服務。
