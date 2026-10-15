---
title: "PCB 測試點自動比對工具"
slug: pcb-test-point
summary: "比對新舊 OrCAD HTML 報表的 RefDes 座標，找出移動、新增與移除的測試點；支援 Target List 篩選與 DXF 板框疊圖。"
status: available
privacy: 所有使用者檔案只在瀏覽器內解析，不上傳伺服器。
inputTypes: [OrCAD HTML, DXF, Target List]
outputTypes: [差異表, 2D 座標圖, CSV]
updatedAt: 2026-10-15
coverImage: /images/pcb-tool-1.png
appUrl: /tools/pcb-test-point/app
sampleUrl: /samples/pcb-test-point-old.html
relatedProject: pcb-test-point-comparison
---

## 用途與使用方式

適合在 PCB 改版後，以 RefDes 核對測試點是否移位、新增或移除。先選取舊版與新版 HTML 報表，工具會自動產生 Moved、Added、Removed、Unchanged 四種結果，以及 ΔX、ΔY 與位移距離。

可貼上 Target List，只比較指定 RefDes；每行一個或使用逗號分隔。DXF 為選填底圖，匯入後可調整縮放與偏移，協助人工判讀。最後可將差異表匯出為 CSV。

## 支援格式與限制

- HTML／HTM：報表必須包含表格與 RefDes、SYM_X、SYM_Y 欄位，也支援部分常見 X／Y 欄名。標題列上方可有報表資訊，座標可含千分位逗號；缺少名稱、座標或無法解析數字的列會略過。
- CSV、純文字、Gerber 與原生 PCB 檔不能直接作為座標報表輸入；CSV 是匯出格式。請先從 CAD 匯出符合上述欄位的 HTML。
- RefDes 區分大小寫，重複 RefDes 以最後一筆為準；請先確認報表中名稱唯一。座標差異大於 0.000001 才視為移動，這不是可設定的製造公差。
- 座標不會自動換算單位，報表必須使用一致的原點與單位；CSV 標示為 mil，請使用 mil 報表。DXF 疊圖的縮放與偏移需要自行確認。
- DXF 僅支援 ASCII 的 LINE、LWPOLYLINE、ARC、CIRCLE，不支援二進位 DXF、BLOCK／INSERT 或完整 CAD 語意。優先取板框名稱的圖層；找不到時使用非圓形幾何作為備援，可能包含非板框線段。
- 檔案在瀏覽器記憶體處理，大型報表與複雜 DXF 的速度受裝置影響。結果供工程核對，不能取代 CAD、DRC 或製造驗證。

## 資料處理與隱私

資料不離開瀏覽器。選取的 HTML、DXF、Target List 與比對結果不會上傳，CSV 也在瀏覽器內產生；重新整理後需重新選取檔案。載入範例只讀取本站公開的靜態合成報表，不需要登入。

網站保留匿名頁面瀏覽分析，頁面網址會移除查詢字串與片段，不包含使用者檔名、座標、RefDes 或報表內容。開啟工具的自訂事件介面僅傳公開工具 slug；Vercel 自訂事件的可見性取決於方案支援及網站的隱私過濾設定。目前網站僅保留匿名 pageview，仍可透過應用頁的瀏覽量觀察使用入口。

## 範例輸入與預期結果

開啟工具後按「載入範例」，即可讀取兩份沒有真實 PCB 資料的合成報表；也可以下載 [舊版 HTML](/samples/pcb-test-point-old.html) 與 [新版 HTML](/samples/pcb-test-point-new.html) 自行選取。

預期結果為 TP1 從 (100, 100) 移至 (130, 140)，距離為 50，顯示 Moved；TP2 顯示 Unchanged；TP3 顯示 Removed；TP4 顯示 Added。範例不含 DXF，也不需要 Target List。

## 已知問題與回饋

各 CAD 版本的報表欄名與 DXF 圖層可能不同。若顯示 0 筆，請檢查 HTML 是否包含表格與必要欄位，並確認座標是數字。若底圖不對齊，請先確認 DXF 單位、縮放與原點。

可透過頁尾的「工具回饋」前往聯絡頁，查看已設定的聯絡管道。回報時請提供 CAD 版本、欄名與去識別化的最小範例，不要傳送機密板檔或客戶資料。
