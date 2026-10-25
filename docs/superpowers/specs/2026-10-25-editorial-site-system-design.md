# JK Space 全站時尚編輯設計系統規格

## 目的

把首頁已確認的「時尚工程編輯誌」語言延伸到網站的閱讀與品牌頁面，同時隔離工程工具的操作介面，避免視覺改版影響輸入、即時計算、圖表比例、URL 狀態或匯出功能。

## 使用者與核心體驗

- 第一次造訪者應能感受到一致的個人品牌，並快速理解專案、工具與筆記的關係。
- 工程使用者進入工具後，應立刻取得穩定、清楚、密度合理的操作介面；品牌風格不能妨礙計算工作。
- 三種語言使用相同資訊架構與視覺層級，文字長度不同時仍須保持可讀與不溢出。

## 採用方案

採用方案 A：內容頁全面改版，工具核心保持不動。

曾考慮但不採用：

- 方案 B：同步調整工具卡片、輸入框與結果面板。統一度較高，但需要逐一驗證所有工程工具，現階段風險與成本不相稱。
- 方案 C：重排工具輸入、圖表與結果區。可能改善部分工具，但會影響史密斯圖、示意圖和手機版的既有互動，不符合本階段穩定優先的目標。

## 範圍

### 全面套用時尚編輯風格

- Projects 列表頁與專案詳情頁。
- Tools 列表頁與工具介紹詳情頁；不包含 `/tools/[slug]/app` 內部操作區。
- Notes 列表頁與筆記閱讀頁。
- About、Contact、Privacy 與 404。
- Header、Footer、麵包屑、狀態標籤及內容頁共用導覽。

### 工具應用頁只修改外殼

`/tools/[slug]/app` 可修改：

- Header 與 Footer 的品牌呈現。
- 返回工具說明的連結。
- 工具名稱、摘要、隱私提示與頁面外圍留白。
- 外殼背景、字體與寬度。

`/tools/[slug]/app` 禁止修改：

- `ToolAppRenderer` 及其渲染的計算器元件 DOM 結構。
- `CalculatorField`、`ResultPanel`、圖表、SVG、canvas、tab、輸入框與按鈕的內部樣式。
- 任何公式、資料轉換、React state、事件處理、URL 參數、歷史、匯出與複製功能。
- 工具內容區現有斷點與欄位排列。

PCB Test Point 雖然採用獨立頁面結構、未經過 `EngineeringToolShell`，仍比照上述原則納入：只改頁面外殼與品牌呈現，不修改圖片上傳、範例載入、資料解析、圖表、表格、CSV 匯出或任何操作區內部樣式與行為。

## 視覺系統

### 品牌層

- 主色：米白紙張、近黑、可讀性合格的深橘紅。
- 內容標題使用中文襯線字回退組合；操作文字與導覽使用無襯線字；編號、日期與分類使用等寬字。
- 使用大留白、字級反差、非對稱網格、圖像局部裁切和少量色塊。
- 不使用玻璃效果、霓虹漸層、虛構產品、泛用科技光效或重複圓角卡片。

### 功能層

- 工具操作區繼續使用現有 neutral variables：`--color-card`、`--color-input-bg`、`--color-border`、`--color-text`、`--color-muted`、`--color-accent`。
- 品牌頁不得使用未限定範圍的 `input`、`button`、`select`、`svg`、`canvas` 或 `.rounded-*` 選擇器。
- 時尚版色彩不得透過 `body` 或根節點滲入工程工具操作區。

## 樣式隔離架構

- 每個內容頁最外層加入 `.editorial-page`，可再加 `.editorial-collection`、`.editorial-detail`、`.editorial-prose` 等用途類別。
- 工具應用頁最外層加入 `.engineering-app-page`；真正的操作區包在 `.engineering-app`。
- 內容頁 CSS 只能從 `.editorial-page` 開始。
- 工具外殼 CSS 只能從 `.engineering-app-page` 開始，並不得選取 `.engineering-app` 內部的通用元素。
- Header 與 Footer 使用共用品牌元件；在 `.engineering-app-page` 上保持較安靜、較緊湊的版本。
- 禁止依賴路徑字串或 JavaScript 判斷樣式；以頁面 wrapper 作為明確邊界。

## 頁面設計

### 列表頁

- Projects：編號式專案索引、清楚的篩選控制、狀態與成果摘要；保持原本 GET query 與無結果行為。
- Tools：依工具性質形成編輯式清單，真實截圖與操作入口並重；「開啟工具」仍是主要動作。
- Notes：採閱讀導向的日期、類型與標題列表，不使用均質卡片網格。

### 詳情與閱讀頁

- Project／Tool 詳情：大型標題、摘要、狀態與 metadata 分欄；封面使用真實圖片；正文保持舒適行長。
- Notes：文章標題、來源資訊、作者觀點與正文層級清楚，保留結構化資料與既有連結。
- About：以個人定位、工作方式與能力區塊構成，不加入未提供的履歷數字或客戶背書。
- Contact：保留真實聯絡管道，以簡短 editorial CTA 呈現。
- Privacy：以可掃讀的法律資訊版式呈現，不追求視覺戲劇性。

### 工具應用外殼

- 工具標題區改為較精簡的品牌 header，清楚顯示返回連結、工具名稱、摘要與本機處理提示。
- 操作區從外殼視覺中自然銜接，但其內部背景、控制元件與尺寸保持原狀。
- 史密斯圖與其他 SVG 圖形不得受到 `font-family`、`color`、`stroke`、`width`、`height` 或 `transform` 的外層覆寫。

## 元件策略

- 建立共用的內容頁 shell 與 section heading，避免每頁重複首頁 CSS。
- 將 editoral tokens 集中在 scoped CSS variables；不新增 UI 套件。
- 現有 `ContentCard` 可被列表頁的新語意元件取代，但保持連結、角色、狀態與 metadata 行為。
- `EngineeringToolShell` 只負責新增隔離 wrapper 與外殼版面；其 `application` prop 原樣輸出到 `.engineering-app`。
- PCB Test Point 頁面另外加入相同的 `.engineering-app-page` 與 `.engineering-app` 邊界，但既有上傳及分析元件須原樣保留。

## 響應式與無障礙

- 檢查 360、390、768、1024 與 1440 px。
- 每頁只有一個 H1，標題可斷行但不可造成水平捲動。
- 正常文字對比至少 4.5:1；大型文字至少 3:1。
- 所有按鈕、篩選、語言切換與工具控制保留鍵盤操作和可見焦點。
- 動畫遵守 `prefers-reduced-motion`；內容在無動畫時必須完整顯示。
- 圖片保留有意義的 alt；純裝飾裁切使用空 alt。

## 驗證與風險控制

### 每一階段

- 先更新對應頁面的結構測試，再實作。
- 執行頁面 focused tests、全套 `npm test`、typecheck、lint 與 production build。
- 使用本機預覽比對桌面與手機畫面。

### 工具頁安全檢查

- 既有工程工具互動測試必須零修改通過；若測試必須修改，視為越界並停止。
- 逐一開啟 passive circuit、converter、RF、transmission line、Smith chart。
- 驗證輸入值即時更新、結果正確顯示、tab/radio 切換、URL 查詢參數、undo/redo、匯出與圖表比例。
- PCB Test Point 另行驗證圖片上傳、範例載入、分析圖表、資料表格與 CSV 匯出。
- 比較改版前後操作區 DOM 邊界；`.engineering-app` 內不得出現非必要差異。

## 實作階段

1. 建立 scoped design tokens、內容頁 shell 與工具隔離 wrapper。
2. 改造 Projects、Tools、Notes 列表頁。
3. 改造 Project、Tool、Note 詳情頁。
4. 改造 About、Contact、Privacy、404 及共用 Header／Footer。
5. 只改造 `EngineeringToolShell` 與 PCB Test Point 的頁面外殼，執行完整工具回歸與響應式檢查。

## 非目標

- 不修改內容資料、SEO schema、翻譯發布規則或 URL。
- 不新增帳號、後端、資料庫、動畫框架或設計套件。
- 不重新設計工程工具內部。
- 本階段先保留為本機分支，不合併、不發布。

## 成功標準

- 所有內容頁看起來屬於同一個時尚工程品牌，而非套用相同卡片模板。
- 使用者從內容頁進入工具後，操作方式、控制位置和圖表比例與現況一致。
- 三語、手機版、鍵盤操作及 reduced-motion 全部可用。
- 全套測試與 production build 通過，工具互動測試無需為視覺改版而修改。
