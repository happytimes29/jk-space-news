---
title: "被動電路計算器"
slug: passive-circuit-calculator
summary: "計算分壓器、RC/LC/RLC、電抗，以及 50/75 Ω 系統常用的 T 型與 π 型衰減器。"
status: experimental
privacy: 所有數值只在瀏覽器內計算，不會傳送到伺服器。
inputTypes: [R/L/C, 電壓與頻率, E 系列與負載]
outputTypes: [標準阻值建議, 截止與諧振, 衰減器阻值]
updatedAt: 2026-10-19
appUrl: /tools/passive-circuit-calculator/app
localizedApp: true
---

## 用途與輸入輸出

分壓模式依 Vin、目標 Vout、E12/E24/E48/E96 與選填負載列出阻值；其他模式計算 RC 時間常數與截止頻率、LC/RLC 諧振、Q 值、頻寬、Xc、Xl，以及等端口阻抗的 T/π 衰減器。

## 範例與公式

3.3 V 轉 1.8 V 的 E24 範例會依實際輸出誤差排序。1 kΩ 與 100 nF 的 `fc=1/(2πRC)` 約為 1.59155 kHz；10 nH 與 1 pF 的 `f0=1/(2π√LC)` 約為 1.59155 GHz。6 dB、50 Ω可直接求理想衰減網路阻值。

## 假設、隱私與限制

公式採理想集中元件，沒有 ESR、ESL、容差以外的寄生、額定功率、SRF 或佈局效應。所有計算在瀏覽器本機完成；結果應再以 SPICE、datasheet 與實測驗證。最後更新：2026-10-19。
