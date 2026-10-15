---
title: JK Space 新聞自動化系統（已封存）
slug: jk-space-news-automation
summary: 曾以 RSS、AI 文字處理與配圖串接新聞發布流程；現已停止作為新聞產品，保留為自動化工程案例。
year: 2026
status: archived
areas: [automation, product]
role: 工作流程整合與網站實作
tags: [Next.js, Python, RSS, DeepSeek, ComfyUI, Vercel]
featured: true
updatedAt: 2026-10-14
---

## 問題與使用情境

JK Space News 曾是一個 AI 驅動的新聞聚合網站，將資料來源、摘要處理、配圖與網站發布串成工作流程。本案例記錄這套系統的整合方式；它已停止作為新聞產品，不再以自動新聞更新作為網站方向。

## 角色與實作

我的工作是整合內容處理流程與 Next.js 網站。先前公開的個人頁將流程描述為：RSS 監控 → SQLite 儲存 → DeepSeek 摘要 → Agnes／ComfyUI 配圖 → Git 更新 → Vercel 部署。網站以 Markdown 保存內容，透過 Git 管理版本，再由 Next.js 產生頁面。

## 限制與轉型

自動化發布仍需要維護來源、排程與內容品質。這個流程能串接資料與網站發布，但自動摘要不能取代我願意署名的工程經驗與觀點，也不代表原始報導。

目前網站正轉型為個人工程實驗室，集中呈現實際專案、自有工具與原創筆記。此處只保留歷史架構與已封存狀態，不提供舊新聞閱讀入口，也不宣稱未驗證的流量或成效。

## 可公開範圍

本案例依據既有程式庫與先前個人頁已公開的流程整理。外部排程、服務與密鑰仍需另外盤點；網站內容的封存狀態不代表那些外部資源已經停用。
