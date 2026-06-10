---
title: "PCB 測試點自動比對工具"
slug: pcb-test-point
date: 2026-06-10
excerpt: "上傳新舊 OrCAD 測試點報表，自動比對 RefDes 座標差異，支援 DXF 板框疊圖與白名單篩選。純瀏覽器端運算，機密資料不外流。"
category: "硬體工具"
tags: ["OrCAD", "PCB", "測試點", "比對", "DXF"]
coverImage: /images/pcb-tool-1.png
url: /tools/pcb-test-point/app
pricing: "免費"
author: "JK Space News"
---

PCB 改版時最頭痛的事之一，就是人工比對成千上百個測試點座標。

[🚀 開啟工具 →](/tools/pcb-test-point/app)

這個工具讓你直接上傳新舊 OrCAD Testprep Report 的 HTML / CSV 報表，自動比對並標示：

- **Unchanged** — 座標未變
- **Moved** — 座標偏移（顯示 ΔX, ΔY, 距離）
- **Added** — 新版新增
- **Removed** — 舊版移除

還支援 DXF 板框疊圖、白名單篩選、CSV 匯出。
