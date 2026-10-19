---
title: "工程單位與 RF 功率轉換器"
slug: engineering-converter
summary: "換算常用電子工程單位、工程記號，以及指定阻抗下的 RF 功率、電壓與電流。"
status: experimental
privacy: 所有數值只在瀏覽器內計算，不會傳送到伺服器。
inputTypes: [工程記號, SI 單位, RF 功率]
outputTypes: [單位換算, dBm/dBW, RF 電壓與電流]
updatedAt: 2026-10-19
appUrl: /tools/engineering-converter/app
localizedApp: true
---

## 用途與輸入輸出

這個工具處理電壓、電流、電阻、電容、電感、頻率、時間、功率與長度。可輸入 `4k7`、`2R2`、`100n`、一般小數或科學記號；RF 模式接受 dBm、dBW、W、mW、Vrms、Vpeak、Vpp 與 Irms，並要求 50 Ω、75 Ω或正數自訂阻抗。

## 範例與公式

輸入 `4k7 Ω` 會得到 `4.7 kΩ`，底層 SI 值仍是 4700 Ω。RF 範例 `0 dBm / 50 Ω` 等於 1 mW 與約 223.607 mVrms。功率採 `P(W)=10^((dBm-30)/10)`，電壓採 `Vrms=√(PR)`。

## 假設、隱私與限制

計算假設純電阻負載與正弦穩態，不包含阻抗相位、失真、頻寬、連接器或量測誤差。所有輸入與結果只留在目前瀏覽器；這是工程估算，不能取代儀器量測或元件額定值檢查。最後更新：2026-10-19。
