---
title: "證據優先的 Datasheet 工程工作台"
slug: datasheet-workbench
summary: "把 PDF 解析、多模型抽取、來源驗證與確定性比較規則串成可核對的元件閱讀與替代料流程。"
year: 2026
status: maintained
areas: [hardware, product]
role: 產品設計與實作
featured: false
updatedAt: 2026-10-25
tags: ["Next.js", "TypeScript", "PDF.js", "BYOK", "Evidence"]
demoUrl: /tools/datasheet-workbench/app
relatedTools: [datasheet-workbench]
outcome: 建立一套不以 AI 信心分數代替來源、可匯出且能明確降級的 Datasheet 工作流程。
---

## 問題

元件 Datasheet 的規格分散在料號表、額定值、工作條件、特性表與圖形中；相同名稱還可能採用不同測試條件。單純讓 AI 摘要整份 PDF，容易遺失頁碼、混淆 Family 與 Ordering Code，或把 Typical 誤當保證值。替代料問題更不能只靠語意相似，因為任何電壓、溫度、封裝或電流阻擋項目都可能否決替代。

## 架構與責任邊界

瀏覽器用 PDF.js 讀取公開 PDF 的文字層、分頁與雜湊，依元件類型及欄位選出相關片段。使用者選擇 OpenAI-compatible、Anthropic 或 Gemini，並提供自己的 API Key；Relay 只允許固定 HTTPS 目的地與操作，不記錄金鑰。

AI 的責任是辨識完整 Ordering Code、將片段抽取成共同 JSON Schema，以及用已驗證來源回答問題。確定性 TypeScript 程式負責單位正規化、min／typ／max、條件相容性、額定範圍、封裝與替代判定。相同結構化輸入會得到相同結果。

## 證據模型

每個規格保存文件識別、頁碼、章節、表格、原文與 chunk hash。若模型引用的文字不存在於送出的片段，該值會被降級；問答也只可引用已驗證證據。替代矩陣保留原料與候選料兩邊來源，讓工程師能回到 PDF 人工核對。

## 驗證方式

目前以人工建立的 MLCC 與屏蔽型功率電感 fixture 驗證 Schema、單位換算、四種判定、測試條件衝突、缺失證據、Ordering Code 與報告匯出；另以路由測試驗證 Relay 的供應商白名單、SSRF 防護、超時與回應大小。這些測試證明指定案例的行為，沒有量測真實世界抽取準確率，因此不宣稱 accuracy 百分比。

## 隱私與限制

PDF 本機解析，但相關文字與 API Key 仍會在單次請求經 Relay 傳往使用者選定的供應商；介面必須在送出前說明。第一版只支援有文字層的公開 PDF、MLCC 與屏蔽型功率電感，不做 OCR、掃描表格、曲線內插、網路抓取、供應鏈或其他元件的正式替代判定。曲線是必要條件時，結果必須標為證據不足。
