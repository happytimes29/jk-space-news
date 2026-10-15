# 上線後 60 天驗證

這是站主核准並完成正式發布後使用的檢查表，不代表已部署或已取得測量結果。Day 0 為正式發布日；記錄實際日期、資料來源與限制，不填假數字或流量成長百分比。

| 時間 | 檢查 | 留存證據／判斷 |
| --- | --- | --- |
| Day 0 | 首頁、六個導覽、redirect、404/noindex、sitemap、RSS、PCB 範例 | 正式部署 commit、URL、狀態碼、畫面及失敗項目 |
| Day 1–7 | 五人 10 秒定位測試 | 每人回答摘要；至少四人辨識為個人工程作品站 |
| Day 7、30、60 | Projects／Tools／Notes／Contact 的頁面流量與入口 | Vercel 匿名 pageview、觀察期間與資料不足註記 |
| Day 7、30、60 | 工具開啟與範例流程 | `Open Tool` 可見性或工具 app pageview；人工重跑範例 |
| Day 30、60 | 至少 2 篇具體專案案例與 2 篇原創筆記 | 真實 URL、內容 commit、角色／決策／結果與來源審核 |
| Day 30 前，Day 60 複查 | 不修改 React 新增筆記／更新專案 | 內容差異、檢查輸出、畫面、React 改動 0 的紀錄 |
| 每次重大內容發布 | 行動版、鍵盤、減少動態效果、SEO／Accessibility | 320／768／1440 畫面；E2E 與 Lighthouse 結果 |

## 五人 10 秒定位測試

讓五位第一次造訪的人各看首頁 10 秒，暫停後詢問「這是什麼網站、站主擅長什麼、下一步會點哪裡」。不先提示「個人工程實驗室」。記下原話摘要與是否辨識為作品／工程工具站；至少四位能辨識定位。若不足，先檢查首屏定位、CTA 與作品證據，再決定文案或版面改動。只記匿名代號，不收集姓名或聯絡資料。

| 代號 | 日期 | 網站定位回答 | 專長／下一步 | 辨識成功 |
| --- | --- | --- | --- | --- |
| A | 待測 | 待測 | 待測 | 待測 |
| B | 待測 | 待測 | 待測 | 待測 |
| C | 待測 | 待測 | 待測 | 待測 |
| D | 待測 | 待測 | 待測 | 待測 |
| E | 待測 | 待測 | 待測 | 待測 |

## 導覽與工具使用

檢視 `/projects`、`/projects/*`、`/tools`、`/tools/*`、`/notes`、`/notes/*`、`/contact` 的實際匿名流量與進站來源；記錄是否仍有舊新聞入口。分析資料若只有 pageview，不能據此宣稱已量到逐步導覽漏斗、獨立使用者或工具任務完成率。流量太少時註記資料不足，用人工流程測試補充。

工具 CTA 的 `Open Tool` 邊界只含公開工具 slug。網站目前的隱私過濾可能捨棄自訂事件，Vercel 方案也可能限制可見性；不可把事件不存在解讀成沒有人開工具。此時以 `/tools/pcb-test-point/app` 的匿名 pageview 為替代指標，並明確標示它代表應用頁開啟、不代表比對完成。要重新評估事件收集，另行確認方案與隱私需求，不能為取得數字而直接放寬過濾。

不記錄使用者檔名、報表、座標、RefDes、Target List、搜尋字串或聯絡資料。人工工具驗證使用公開合成範例，確認四種分類與 CSV 匯出可用，並確認本機檔案操作沒有上傳請求。

## 內容持續性與無 React 修改驗證

- [ ] 至少兩篇真實 Project 案例能交代問題、角色、限制、選擇、結果與驗證；現有 PCB 與封存自動化案例可作起點，狀態需誠實標示。
- [ ] 至少兩篇由站主署名、完成審核的原創 Note；commentary 有三個來源欄位與「事件摘要／我的觀點」，不靠示範文章充數。
- [ ] 從內容工作分支新增一篇 Note 或更新一個 Project，僅修改 Markdown／MDX 與必要公開媒體。
- [ ] 保存 commit 與 `git show --stat`，確認 `app/`、`components/` React 檔案改動為 0。
- [ ] 保存 `npm run verify`、`npm run verify:no-legacy-news` 與 E2E 結果，檢查列表、詳情、搜尋、RSS、sitemap；記錄新內容頁畫面。
- [ ] 第一篇真實 Note 的詳情 URL 加入 Lighthouse，Accessibility／SEO 均達 0.90；Performance 記錄分數並檢查 CLS 與阻塞媒體。
- [ ] Day 60 整理內容發布所花步驟、卡點與下一個小改進，維持 Now 日期真實。

驗證紀錄格式：日期、分支／commit、內容路徑、公開 URL、React 改動數、命令與 exit code、截圖路徑、審核者、正式部署結果、未解決事項。沒有完成的欄位寫「待驗證」。

本機內容流程預檢紀錄（2026-10-15）：從 `docs/content-authoring.md` 擷取五個完整 Markdown 範本，機械產生到作業系統暫存目錄，以正式 `loadProjects`／`loadTools`／`loadNotes`／`loadNow` 驗證；結果為 Project 1、Tool 1、一般 Note 1、commentary 1、Now 日期有效，exit 0。移除 commentary 的 `sourceUrl` 後，正確回報含檔名與欄位的錯誤。此檢查沒有修改 React 或正式內容；正式集合仍為 2 Projects／1 Tool／0 Notes。這只證明內容模型可接受範本，實際原創內容的 production 路由與正式發布紀錄仍待站主完成。

## 發布與外部資源責任

每次正式發布仍須站主明確核准；依 [README](../README.md) 的 Git → main → Vercel 流程操作，發布後才檢查正式 URL。本機綠燈不能代替正式驗證。

外部 OpenClaw job、主機／CI 排程、API key、webhook 與舊發布憑證的盤點及任何停用由站主另案操作。先確認其他消費者與備份，再決定處理；本次網站改版沒有操作外部服務，也無法證明那些排程已停止。詳見 [新聞退場紀錄](migrations/2026-10-14-retired-news-publication.md)。
