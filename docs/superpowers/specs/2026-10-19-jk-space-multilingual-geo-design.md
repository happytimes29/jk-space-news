# JK Space 多語言 SEO 與 GEO 設計規格

**日期：** 2026-10-19  
**狀態：** 已完成對話設計，待站主審閱書面規格  
**範圍：** JK Space 公開網站；不包含私人 ResearchMFG 離線資料庫

## 1. 目標

JK Space 將從單一繁體中文網站改為可分階段發布的繁體中文、簡體中文與英文網站。第一階段完成三語基礎架構、共用介面與核心頁面；Projects、Tools、Notes 則在譯文經過審閱後逐篇發布。

同一套架構必須同時支援傳統搜尋引擎最佳化（SEO）與生成式引擎最佳化（GEO）：讓搜尋引擎及可引用網頁的 AI 系統能爬取、理解、判斷語言、識別作者與內容類型，並連回正確的語言頁面。任何設計都不得承諾排名或 AI 引用結果。

成功標準：

- 現有繁中網址、功能及索引身分保持穩定。
- 簡中與英文核心頁面具有獨立且可直接存取的網址。
- 搜尋引擎能透過 canonical、`hreflang`、sitemap、HTML 語言與結構化資料理解三語關係。
- 使用者能切換語言並保留選擇，但網站不依 IP 強制跳轉。
- 未完成的翻譯不會建立公開頁面、進入 sitemap 或被誤標成正式譯文。
- ChatGPT Search 的 `OAI-SearchBot` 可爬取公開內容；訓練用途的 `GPTBot` 被 robots 規則阻擋。

## 2. 非目標

第一階段不包含：

- 批量翻譯所有既有 Projects、Tools、Notes。
- 使用即時機器翻譯替換正式內容。
- 使用 IP 地理位置決定語言。
- 讓同一網址根據訪客條件回傳不同語言正文。
- 建立不同網域或語言子網域。
- 導入外部 CMS、翻譯 SaaS 或自動翻譯 API。
- 依賴 `llms.txt`、非官方 GEO 分數或隱藏關鍵字取得曝光。
- 更改或公開私人 ResearchMFG 離線資料。

## 3. 語言與網址契約

### 3.1 Locale 對照

| 內部 locale | 網址前綴 | HTML `lang` | `hreflang` | Open Graph locale |
|---|---|---|---|---|
| `zh-TW` | 無 | `zh-Hant-TW` | `zh-Hant-TW` | `zh_TW` |
| `zh-CN` | `/zh-cn` | `zh-Hans-CN` | `zh-Hans-CN` | `zh_CN` |
| `en` | `/en` | `en` | `en` | `en_US` |

繁中保留現有路徑，例如 `/about`、`/projects`、`/notes/example`。簡中與英文使用相同邏輯路徑，例如 `/zh-cn/about` 與 `/en/about`。網址前綴大小寫固定如表；其他拼法不視為有效 locale。

### 3.2 Canonical 與語言替代頁

- 每個正式頁面的 canonical 指向自己，不跨語言 canonical 到繁中。
- 每組確實存在的譯文輸出完全相同、互相回指且包含自身的 `hreflang` 集合。
- `x-default` 指向該內容的繁中版本；核心首頁的 `x-default` 為 `/`。
- 不存在的譯文不得出現在 `hreflang`、sitemap、搜尋索引或語言切換連結中。
- 不支援的 locale、slug 或未發布譯文回傳真正的 404。

### 3.3 路由結構

- 現有無前綴 App Router 頁面繼續代表 `zh-TW`。
- `app/[locale]/` 只接受 `zh-cn` 與 `en`，其他值立即 `notFound()`。
- 三語頁面使用共用 server component 與 locale 資料，不複製三套版面邏輯。
- 現有繁中網址不進行 301 遷移，因此現有書籤、外部連結與搜尋紀錄不需重建。

## 4. 語言選擇體驗

Header 在桌面與行動版都提供「繁中／简中／EN」選單。

- 核心頁面切換語言時維持相同邏輯頁面。
- 內容詳情頁只連到確實存在且已發布的譯文；缺少譯文的語言顯示不可用狀態，不建立假頁面。
- 使用者明確選擇後寫入 `jk-locale` Cookie，期限一年、`SameSite=Lax`，不保存個人資料。
- 首次造訪且沒有 Cookie 時，瀏覽器語言只用來顯示一次非阻塞式建議，例如「是否切換至 English？」。
- 網站不因瀏覽器語言或 IP 自動改寫內容，也不強制把目前網址跳到另一個語言。
- 搜尋引擎、分享連結與直接造訪永遠得到網址所代表的固定語言。

此策略中的「自動」是搜尋引擎依 `hreflang` 選擇適合結果，以及網站提出語言建議；最終切換由使用者確認。

## 5. 介面與核心頁面翻譯

三語介面字典存放於：

```text
locales/
├── zh-TW.json
├── zh-CN.json
└── en.json
```

字典涵蓋：

- Header、Footer、語言選單、搜尋與命令面板。
- 首頁、About、Contact、Privacy 的標題、正文與行動文字。
- Projects、Tools、Notes 列表介面與空狀態。
- 404、系統錯誤、Cookie 語言提示及輔助文字。
- 頁面 metadata 與 Open Graph 文案。

`zh-TW.json` 是完整鍵集合的型別來源。`zh-CN.json` 與 `en.json` 必須具有完全相同的鍵；遺漏、額外鍵或空字串使驗證與 production build 失敗。所有字典由 server component 按 locale 讀取，避免把三份完整字典送到瀏覽器。

簡中翻譯不是單純字元轉換，必須調整區域用語；英文翻譯應保留硬體、軟體與工程專有名詞。品牌名稱、產品名稱、程式碼、檔名及 API 名稱原樣保留。第一階段翻譯在 Preview 中供站主檢視後才正式發布。

## 6. Projects、Tools、Notes 的逐篇翻譯

繁中內容維持現有位置；翻譯使用語言子目錄：

```text
content/notes/example.md
content/notes/zh-cn/example.md
content/notes/en/example.md
```

Projects 與 Tools 採相同規則。第一版要求譯文與原文使用相同 slug，以簡化配對、內部連結、圖片重用及錯誤檢查。

翻譯檔額外 frontmatter：

```yaml
locale: en
translationOf: example
translationStatus: reviewed
translatedAt: 2026-10-19
```

`translationStatus` 接受 `draft`、`reviewed`、`published`：

- `draft`：本機編輯，不建立公開頁面。
- `reviewed`：可進 Preview，正式 production build 仍不公開。
- `published`：可進正式路由、搜尋、sitemap、RSS 及 `hreflang`。

繁中既有檔案不強制補 locale 欄位，讀取器視為 `zh-TW` 原文。譯文必須引用存在的繁中 slug，且同一 locale 不得重複。譯文沿用原文內容類型及引用關係，但 title、summary、正文、圖片 alt、caption、來源標題及可見標籤都必須翻譯。

簡中與英文列表只顯示該語言已發布的內容，不混入繁中卡片。第一輪多語言專案在 Phase 4 為 Project、Tool、Note 各建立一篇示範譯文；其餘內容依站主興趣與搜尋表現逐篇處理。

## 7. 搜尋、sitemap、RSS 與分享資訊

- 站內搜尋依目前 locale 建立獨立索引，只回傳該語言實際存在的頁面。
- Command Palette 的導覽與內容名稱跟隨目前 locale。
- sitemap 包含繁中公開頁面、簡中與英文核心頁面，以及各語言已發布的內容詳情頁。
- sitemap 條目或 HTML metadata 提供語言替代連結；實作選擇單一可完整測試的權威來源，避免兩套資料漂移。
- RSS 第一階段維持現有繁中 Feed。某語言至少有一篇已發布 Note 後，才建立對應語言 Feed。
- Open Graph、分享標題、描述、圖片替代文字及 URL 全部跟隨頁面 locale。
- 網站內部連結必須保留目前 locale；連到尚未翻譯的內容時，使用明確的「繁體中文原文」標示。

## 8. GEO 內容與結構化資料

### 8.1 實體與 Schema

現有 JSON-LD 擴充但不虛構資料：

- `Person`：作者名稱、網站內身分、公開連結及頁面可見的專業領域。
- `WebSite`：網站名稱、說明、發布者與支援語言。
- `Article`：Notes 的語言、作者、發布／更新日期、主頁 URL 與真實引用來源。
- `CreativeWork`：Projects 的名稱、摘要、作者、更新日期與語言。
- `SoftwareApplication`：Tools 的名稱、用途、執行環境、操作 URL 與語言。
- `BreadcrumbList`：目前頁面與 locale 對應的導覽層級。

每一份 JSON-LD 都必須與頁面可見文字及 canonical 相符。翻譯頁使用對應 `inLanguage`，作者以穩定 `@id` 連回同一個 `Person` 實體。

### 8.2 可引用內容格式

內容模板與作者指南鼓勵：

- 開頭提供可以獨立理解的摘要或直接答案。
- 清楚定義問題、適用情境、前提及限制。
- 使用描述性標題、步驟、比較表及具體例子。
- 標示作者、發布日期、修改日期及版本資訊。
- 技術結論附實測方法、原始資料、程式碼或可信來源。
- 清楚區分事實、個人經驗、估算與推論。
- 保留已知限制、失敗案例與尚未量化的結果。
- 圖片提供有意義的檔名、alt 與 caption。

不批量產生低品質 FAQ、不重複堆疊關鍵字、不建立只供機器讀取的隱藏內容。

## 9. AI 爬蟲政策

公開 `robots.txt` 的政策為：

- `Googlebot`：允許公開網站。
- `Bingbot`：允許公開網站。
- `OAI-SearchBot`：允許公開網站，供 ChatGPT Search 發現與引用。
- `GPTBot`：`Disallow: /`，表示不允許用於 OpenAI 基礎模型訓練。
- 其他一般搜尋爬蟲沿用公開索引政策。

草稿與未發布翻譯不產生公開路由，因此不依賴 robots 保密。`robots.txt` 是對合規爬蟲的政策聲明，不是存取控制或機密資料防護機制。

第一階段不把 `llms.txt` 視為必要條件。若日後加入，內容只能列出正式公開 URL，且不得取代 sitemap、內部連結或結構化資料。

## 10. 成效追蹤

- Search Console 依 URL、國家／地區、查詢與頁面語言觀察曝光、點擊及索引狀態。
- Vercel Analytics 依無前綴、`/zh-cn`、`/en` 分析使用情況。
- 可辨識時記錄 ChatGPT、Bing、Perplexity 等推薦來源，但不將缺少 referrer 視為零引用。
- 伺服器或平台日誌可用時，確認 `OAI-SearchBot` 是否成功存取公開頁面。
- 發布前保存繁中流量與索引基準；發布後按月比較，不宣稱無法驗證的 GEO 分數。
- 翻譯優先順序依內容重要性、站主興趣、既有曝光及目標讀者決定。

## 11. 錯誤處理與邊界情況

- 字典缺鍵、空值、未知 locale、翻譯孤兒、重複 slug 或無效狀態在建置前失敗。
- 未發布譯文回傳 404，不回退為繁中 200 頁面。
- 語言 Cookie 值不合法時忽略並刪除，不拼接成路由。
- 語言提示元件在 JavaScript 關閉時不影響主要內容、導覽或索引。
- Locale 切換不得產生 redirect loop，也不得覆寫使用者明確選擇。
- Schema 序列化沿用安全 JSON-LD 寫法，避免內容中的 `</script>` 中斷標記。
- sitemap、canonical、`hreflang`、搜尋索引及語言選單都從同一份 locale／翻譯可用性資料產生。

## 12. 測試與驗收

### 12.1 自動測試

- Locale 解析、路徑加前綴／移除前綴與非法值測試。
- 三份字典鍵集合、空值及伺服器載入測試。
- 語言 Cookie、首次提示與同頁切換元件測試。
- 翻譯 frontmatter、狀態、原文配對及重複 slug 測試。
- 每種語言頁面的 `lang`、canonical、Open Graph、JSON-LD 與 `hreflang` 測試。
- sitemap 只含存在且已發布的語言頁測試。
- locale 搜尋索引不得混入其他語言測試。
- robots 明確允許 `OAI-SearchBot` 並阻擋 `GPTBot` 測試。
- 現有繁中路由、RSS、PCB 工具及 retired-news 防回歸測試。
- lint、TypeScript、Vitest、production build 與關鍵 Playwright E2E。

### 12.2 人工驗收

- 桌面與行動版切換器可操作且不遮擋導覽。
- 首頁、About、Contact、Privacy、404 及列表介面三語文案自然。
- 直接開啟、重新整理、分享任何語言 URL 都維持同一語言。
- Search Console／Rich Results Test 可讀取正式 metadata 與 JSON-LD。
- OAI-SearchBot 規則可存取公開路徑，GPTBot 規則為全站禁止。
- 缺少譯文時不產生軟 404、混合語言頁或錯誤的替代連結。

## 13. 分階段交付

### Phase 1：基礎架構

建立 locale registry、字典驗證、共用路由／metadata 工具、語言切換器與 Cookie 提示。保持繁中輸出不變。

### Phase 2：核心頁面

完成介面、首頁、About、Contact、Privacy、404 及三個內容列表的簡中與英文翻譯，在 Preview 中校對。

### Phase 3：SEO 與 GEO

完成 canonical、`hreflang`、sitemap、Open Graph、JSON-LD、locale 搜尋及 AI 爬蟲政策。

### Phase 4：逐篇翻譯能力

完成多語內容讀取、狀態驗證及 Project、Tool、Note 各一篇示範譯文。其餘文章留待後續逐篇翻譯。

### Phase 5：發布

執行完整驗證，提供本機或 Vercel Preview、翻譯檢視、變更清單及已知限制。只有站主明確同意後才合併並正式發布。

## 14. 回滾策略

- 所有工作在獨立分支完成，不直接修改 production branch。
- 正式發布前保存最後通過驗證的 commit 與 Preview 結果。
- 上線問題可回退整個多語言 commit／PR；繁中網址未遷移，因此回滾不需要反向轉址。
- 若單一翻譯品質有問題，可將該譯文狀態降為非公開並重新建置，不影響原始繁中內容。
- 爬蟲政策可獨立回退，但 robots 變更需要等待外部爬蟲重新抓取才完全生效。

## 15. 實作邊界

多語言資料、SEO/GEO metadata、搜尋與內容載入必須各自有清晰介面：

- Locale registry 決定支援語言及 URL 規則。
- Dictionary loader 只負責介面與核心頁文案。
- Content loader 只負責原文、譯文及發布狀態。
- SEO builder 從頁面身分與實際存在的翻譯產生 metadata。
- Sitemap、搜尋、語言選單與 JSON-LD 使用相同翻譯可用性，不各自猜測。
- 爬蟲政策集中於 `app/robots.ts`，不分散在頁面元件。

這些邊界讓後續新增語言或逐篇翻譯時不必重新設計路由，也避免 SEO、介面與內容狀態互相矛盾。

## 16. 官方參考

- [Google：AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google：Localized versions of your pages](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google：Introduction to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [OpenAI：Web crawlers and user agents](https://platform.openai.com/docs/bots)
