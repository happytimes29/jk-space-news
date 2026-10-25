---
title: "Datasheet 工程工作台"
slug: datasheet-workbench
summary: "從公開元件 Datasheet 擷取可追溯規格，快速閱讀 MLCC／功率電感，並以固定規則評估替代料。"
status: experimental
privacy: PDF 在瀏覽器解析；相關文字與使用者提供的 API Key 只於本次請求經 Relay 傳給所選模型，不會儲存。
inputTypes: [公開 Datasheet PDF, 完整 Ordering Code, 實際工作條件, 使用者自備模型 API Key]
outputTypes: [有來源的規格摘要, 替代料比較矩陣, Markdown 報告, JSON 報告]
updatedAt: 2026-10-25
appUrl: /tools/datasheet-workbench/app
localizedApp: true
relatedProject: datasheet-workbench
---

## 兩個工作區

「快速讀懂 Datasheet」把製造商、完整料號、額定值、工作條件、封裝與限制整理成結構化表格。每個數值都能展開原始頁碼、章節、表格與引用文字，也可針對已驗證的段落提出工程問題。

「替代料評估」同時載入原料與候選料，要求兩份 Family Datasheet 各自選定完整 Ordering Code。填入實際工作條件後，工具才會以確定性規則輸出可直接替代、條件式可替代、不建議替代或證據不足；沒有工作條件時只顯示規格差異，不下替代結論。

## 資料傳送與 API Key

只可上傳公開的元件 Datasheet PDF，請勿放入內部規格、電路圖或機密文件。PDF 文字層在瀏覽器解析並選取相關片段；這些片段與你自行提供的 API Key 會在單次請求中經 JK Space Relay 傳給所選模型供應商。本站不把 API Key 寫入 Local Storage、Cookie、資料庫或分析服務。

## 第一版範圍與限制

第一版正式支援 MLCC 陶瓷電容與屏蔽型功率電感。它不支援 OCR、掃描 PDF、網頁自動下載、電晶體／電源 IC，也不會從 DC Bias、Ripple、溫度降額或感量曲線量測數值。必要資料只存在圖表時，結果會降級為證據不足並提供人工查看頁面。

模型負責抽取與文字說明；單位換算、範圍比較與替代判定由 TypeScript 固定規則執行。結果仍是工程篩選輔助，不能取代原廠確認、模擬、樣品驗證與設計審查。
