---
title: "PCB 測試點自動比對工具"
slug: pcb-test-point-comparison
summary: "硬體改版時，比對新舊 OrCAD 報表中的測試點座標，自動標示 Unchanged / Moved / Added / Removed。支援 DXF 板框疊圖、白名單篩選、mil↔mm 座標對齊。完全在瀏覽器端運算，確保 CAD 資料不外流。"
year: 2026
status: maintained
areas: [hardware, product]
role: 設計與實作
featured: true
updatedAt: 2026-06-10
tags: ["Next.js", "OrCAD", "DXF", "Canvas", "Claude Code"]
coverImage: /images/pcb-tool-1.png
gallery: [/images/pcb-tool-1.png, /images/pcb-tool-2.png]
demoUrl: /tools/pcb-test-point/app
relatedTools: [pcb-test-point]
outcome: 將新舊測試點差異、目標清單篩選與板框疊圖整合在同一個瀏覽器工具中。
---

## 問題與使用情境

PCB 改版後，需要確認新舊 OrCAD 報表中的測試點哪些保留、移動、新增或移除。只有座標數字時，很難看出變動與板邊、孔位的空間關係；把全板測試點一起畫出來，又容易掩蓋這次改版真正要檢查的區域。

這個工具把報表比對、目標測試點篩選與 DXF 板框疊圖放在同一個瀏覽器介面，供工程師檢視改版差異。

## 角色與責任

我負責工具的設計與實作，從 OrCAD 報表解析、比對規則、座標疊合到操作介面，並使用 Claude Code 協助開發。遇到解析與座標問題時，以實際報表結構與畫面結果調整做法。

## 限制與設計考量

- CAD 資料可能包含機密，因此檔案解析與比對都在瀏覽器端執行。
- OrCAD 匯出的 HTML 不一定符合預期的表格欄位與結構，不能只憑想像建立解析器。
- HTML 測試點與 DXF 板框可能使用不同單位與原點，匯入後不能直接假設兩者重合。
- 全板點位會產生視覺雜訊，需要讓使用者指定本次要看的測試點。

## 解法與關鍵決策

### 用實際報表修正解析方式

初版解析器曾抓不到資料。檢查 OrCAD HTML 原始碼後，使用實際的表格片段調整欄位辨識，從報表找出 RefDes、X 與 Y，而不是依賴 AI 預設的表格格式。

### 先篩選，再比對

加入 Target List 白名單，在核心比對前先挑出指定測試點，讓畫布與明細聚焦在本次改版的範圍。

### 在網頁上調整板框座標

加入 DXF 板框作為底圖，並提供縮放倍率與 X／Y 偏移控制。轉換採用 `Target = (Original × Scale) + Offset`；預設倍率 39.37 對應 mm 到 mil 的換算，仍需依實際資料確認原點與單位。

## 實作過程與架構

介面使用 Next.js App Router、React 與 Tailwind CSS。HTML 由瀏覽器原生 DOMParser 解析；DXF 使用專案內的解析程式讀取幾何資料；Canvas 負責繪製測試點、板框與位移向量。

1. 讀取舊版與新版 HTML，另可加入 Target List 與 DXF 板框。
2. 解析報表欄位與座標；若有指定 Target List，先篩選兩版資料。
3. 以 RefDes 對應新舊測試點，計算座標差異，分類為 Unchanged、Moved、Added、Removed。
4. 套用 DXF 縮放與偏移，在同一個畫布上疊合板框與測試點。
5. 顯示可篩選的明細與視覺化結果，並提供 CSV 匯出。

## 結果與驗證方式

目前工具可把差異分類、目標清單與板框疊圖放在同一個工作畫面。開發時透過實際 OrCAD 表格確認欄位能被讀取，並檢視疊圖來調整縮放與原點偏移。

這些是功能與操作結果的定性紀錄；尚未建立節省工時、降低錯誤率或效能提升的量化測試，不以推估數字作為成果。

![測試點比對與板框疊圖操作畫面](/images/pcb-tool-2.png)

## 已知限制

- 支援的報表仍須能辨識 RefDes 與座標欄位，非任意 CAD 格式皆可直接使用。
- DXF 解析以支援的幾何圖元與板框圖層為主，無法取代完整 CAD 檢視器。
- 使用者須確認疊圖單位與偏移；圖面對齊不代表已完成電氣、機構或可製造性檢查。
- 比對依 RefDes 對應，命名改變時不能自動推斷是否為同一個實體測試點。

## 相關連結

- [工具介紹與使用說明](/tools/pcb-test-point)
- [開啟 PCB 測試點比對工具](/tools/pcb-test-point/app)
