# 多語 SEO／GEO 本機驗證紀錄

日期：2026-10-19  
分支：`codex/multilingual-geo-native`  
範圍：繁體中文（預設）、簡體中文、英文介面與核心頁；分階段翻譯的 Projects／Tools／Notes；SEO 與 GEO 發布介面。  
限制：本紀錄只代表本機驗證，沒有 push、PR、merge、Preview deployment 或正式發布。

## 驗證結果

| 命令／檢查 | 結果 |
| --- | --- |
| `npm run test:e2e -- e2e/site.spec.ts e2e/seo.spec.ts` | PASS，32/32 |
| `npm run test:e2e -- e2e/site.spec.ts --grep "invalid locales and missing translated details" --repeat-each=5` | PASS，5/5；確認 404 的 `noindex` 不再與父層 metadata 衝突 |
| `npm run verify` | PASS；ESLint、TypeScript、44 個 Vitest 檔／265 項測試、15 項舊新聞守門測試、production build 全部成功 |
| `npm run test:e2e` | PASS，38/38 |
| `CONTENT_PREVIEW=1 npm run build:local` | PASS，35 個靜態頁；包含簡中／英文 PCB Project 與 Tool 詳情 |
| production `npm run build:local`（由 `npm run verify` 執行） | PASS，31 個靜態頁；未包含仍為 `reviewed` 的 PCB 翻譯詳情 |
| `git diff --check` | PASS，無 whitespace error |
| `find`／`rg` 檢查 `app content public` | PASS，沒有 ResearchMFG 檔案路徑或內容引用 |

Next.js 在隔離 worktree 偵測到兩份 lockfile 並提示推斷 workspace root；不影響 production 或 Preview build。Playwright 開發伺服器另有既存的 React script-tag 與圖片 LCP 提示，但沒有測試失敗。

## 路由與語言行為

- `/` 保留繁體中文預設網址；`/zh-cn` 與 `/en` 使用穩定、可索引的語系網址。
- 三個 About 頁、桌面與行動語言控制、明確選擇 cookie、瀏覽器語言提示均已由瀏覽器測試覆蓋。提示只提供選項，不會強制跳轉。
- 無效語系、尚未發布的翻譯詳情與不存在頁面回傳真正的 404；自訂 404 保留可用的返回導覽並標記 `noindex`。
- 各語頁面輸出相符的 `<html lang>`、self-canonical、互惠 `hreflang`、`x-default`、Open Graph locale 與 JSON-LD URL／語言。
- sitemap 只列出可公開的語系頁；RSS 保留繁體中文原始 Notes；robots 明確允許一般 crawler、Googlebot、Bingbot 與 OAI-SearchBot，並依既定政策拒絕 GPTBot。
- PCB 瀏覽器工具仍可解析公開合成範例，測試期間沒有非 GET 的資料上傳；Analytics 在送出 pageview 前移除 query 與 fragment。

## 分階段翻譯狀態

PCB Project 與 PCB Tool 的簡中、英文翻譯目前為 `translationStatus: reviewed`。它們可在 `CONTENT_PREVIEW=1` 的本機 Preview build 審閱，但 production build、正式 sitemap 與公開翻譯詳情不會納入；升級為 `published` 前仍需要站主確認文字與術語。

目前沒有可供翻譯的正式原創 Note，因此沒有建立空白或虛構的 Note 翻譯。後續每篇 Notes 應在原文完成後個別翻譯、審閱與發布。

## Preview 截圖與人工觀察

- `docs/evidence/multilingual-geo-preview-en-project.png`：英文 PCB Project，完整案例內容、圖片與英文導覽正常。
- `docs/evidence/multilingual-geo-preview-zh-cn-project.png`：簡中 PCB Project，完整案例內容、圖片與簡中導覽正常；英文瀏覽器環境顯示非阻斷式語言建議，沒有自動跳轉。
- `docs/evidence/multilingual-geo-preview-en-tool.png`：英文 PCB Tool，隱私、輸入格式、限制、範例與 CTA 均可閱讀。

本機重現：

```bash
CONTENT_PREVIEW=1 npm run build:local
CONTENT_PREVIEW=1 npm run start -- --hostname 127.0.0.1 --port 3100
```

## 隔離與外部狀態

- 設定中的 remote 維持 `origin = https://github.com/happytimes29/jk-space-news.git`；本次沒有修改 Git remote。
- 工作只位於 `jk-space-news/.worktrees/multilingual-geo`；沒有修改同層的 `researchmfg-library`，也沒有把其文章、圖片或路由帶入網站。
- 沒有操作 API key、外部排程、OpenClaw、Vercel、DNS 或正式網站。
- 完成 commits：`1cf59185`、`60a8e893`、`4590dad9`、`57edcfb7`、`ea216edb`、`671bd507`、`b44d922b`、`edf03d76`、`f6c98f02`、`3577abaa`，以及包含本段紀錄的最終 review-fix commit。

## 最終整體審查

單一唯讀 reviewer 檢查完整計畫差異後沒有發現 Critical，並提出三項 Important；本分支已全部修正並重新驗證：

- About 的英文／簡中連結在 production 改指向繁中原文並明確標示；只有 Preview 可連到 `reviewed` 翻譯。
- 瀏覽器語言建議共用翻譯可用性資料，不再把未翻譯詳情或僅繁中的 PCB app 導向 404，且會在 client-side 路徑變更後重新判斷。
- 翻譯可用性鍵統一使用 URL 編碼路徑；真實 builder 產生的非 ASCII slug 已測試不會解碼或重複編碼。

Reviewer 另列兩項不阻擋交接的 Minor：全域 404 client chunk 仍可進一步縮小字典內容；Open Graph 圖片內的固定類型標籤仍可再做語系化。兩者不影響目前頁面語言、索引、翻譯發佈控制或導覽正確性，留待後續獨立改善。

## 站主核准點

1. 是否要修改簡中／英文 PCB 翻譯或術語。
2. 是否將已確認的翻譯由 `reviewed` 升為 `published`。
3. 是否另行授權 push、建立 PR、Preview deployment 或正式發布；在取得授權前不採取外部動作。
