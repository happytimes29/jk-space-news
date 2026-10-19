---
title: "RF 快速計算器"
slug: rf-calculator
summary: "計算波長、傳播延遲與電氣長度，並由複數阻抗取得導納、Γ、S11、VSWR 與損耗。"
status: experimental
privacy: 所有數值只在瀏覽器內計算，不會傳送到伺服器。
inputTypes: [頻率與介質, 複數阻抗, 參考阻抗]
outputTypes: [波長與電氣角度, Z/Y/Γ, S11/VSWR/損耗]
updatedAt: 2026-10-19
appUrl: /tools/rf-calculator/app
localizedApp: true
---

## 用途與輸入輸出

傳播模式接受頻率、物理長度，以及相對介電常數或速度因子；阻抗模式接受 `R+jX` 與參考阻抗，輸出 Z、Y、Γ、S11、VSWR、回波損耗及失配損耗的直角與極座標讀值。

## 範例與公式

1 GHz 自由空間波長 `λ=c/f` 約 299.792 mm，四分之一波長約 74.9481 mm。50+j0 Ω 對 50 Ω 時 `Γ=(Z-Z0)/(Z+Z0)=0`、VSWR=1；25+j25 Ω則會顯示有限的反射與損耗。

## 假設、隱私與限制

介質模型使用 `v=c/√εr` 或指定速度因子，不能同時使用兩者。結果不包含頻散、損耗、走線幾何或校正面；所有運算只在瀏覽器進行，不能取代 EM 模擬或 VNA 實測。最後更新：2026-10-19。
