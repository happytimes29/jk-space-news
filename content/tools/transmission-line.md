---
title: "PCB 傳輸線阻抗與線寬計算器"
slug: transmission-line
summary: "以 Microstrip、對稱 Stripline 與接地 CPW 準靜態模型計算阻抗、傳播指標或反求線寬。"
status: experimental
privacy: 幾何與材料數值只在瀏覽器內計算，不會傳送到伺服器。
inputTypes: [PCB 幾何尺寸, 相對介電常數與頻率, 目標阻抗]
outputTypes: [特性阻抗與有效介電常數, 波長延遲與電氣角度, 反求線寬]
updatedAt: 2026-10-19
appUrl: /tools/transmission-line/app
localizedApp: true
---

## 三種幾何與輸入

Microstrip 輸入走線寬度 W、基板高度 h、銅厚 t；對稱 Stripline 輸入 W、兩參考平面的完整間距 b 與 t，走線固定置中；接地 CPW（CPWG）另輸入走線至兩側地的間隙 s，並假設連續背面地與無限寬側地。共用輸入為相對介電常數、頻率及線長，可在 mm、mil、µm 間切換而不改變實際尺寸。

正向模式輸出特性阻抗、有效介電常數、相速度、波長、每米延遲與指定線長的電氣角度。目標模式以有界二分法反求線寬；若目標不在選定範圍內會明確回報無解，不會沿用舊結果。

## 公式版本與參考例

Microstrip 採 Hammerstad–Jensen 準靜態公式與有限銅厚修正；對稱 Stripline 採 Wheeler 1965；CPWG 採 Qucs Technical Guide (12.10)–(12.18)，不使用 (12.19) 之後的頻散式。預設 FR-4 類 4.3、1 GHz 範例中，3.0 mm / 1.6 mm Microstrip 約為 50 Ω；0.75 mm / 1.6 mm 對稱 Stripline 也落在約 50 Ω；3.0 mm、0.2 mm gap 的 CPWG 約 35–36 Ω。

## 範圍、隱私與限制

這些是無損準靜態估算，不含頻散、銅箔粗糙度、導體/介質損耗、阻焊、梯形蝕刻、表面處理、玻纖效應、有限地寬、接地孔、彎角、連接器或不連續。超出公式建議比例時會顯示警告。板廠材料、公差與壓合後介厚可能不同，最終幾何必須交由板廠確認並以 2D/3D 場求解器及量測驗證。所有數值只留在瀏覽器。最後更新：2026-10-19。
