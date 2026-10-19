---
title: "工程单位与 RF 功率转换器"
slug: engineering-converter
summary: "转换常用电子工程单位、工程记号，以及指定阻抗下的 RF 功率、电压和电流。"
status: experimental
privacy: 所有数值只在浏览器内计算，不会发送到服务器。
inputTypes: [工程记号, SI 单位, RF 功率]
outputTypes: [单位转换, dBm/dBW, RF 电压与电流]
updatedAt: 2026-10-19
appUrl: /tools/engineering-converter/app
localizedApp: true
locale: zh-CN
translationOf: engineering-converter
translationStatus: reviewed
translatedAt: 2026-10-19
---

## 用途与输入输出

转换电压、电流、电阻、电容、电感、频率、时间、功率和长度。支持 `4k7`、`2R2`、`100n`、小数和科学记号；RF 模式转换 dBm、dBW、W、mW、Vrms、Vpeak、Vpp 和 Irms，并使用 50 Ω、75 Ω或正数自定义阻抗。

## 示例与公式

`4k7 Ω` 会得到 `4.7 kΩ`，SI 基准值仍为 4700 Ω。`0 dBm / 50 Ω` 等于 1 mW 和约 223.607 mVrms。采用 `P(W)=10^((dBm-30)/10)` 与 `Vrms=√(PR)`。

## 假设、隐私与限制

RF 计算假设纯电阻负载和正弦稳态，不含相位、带宽、失真与测量误差。数值只留在浏览器；关键结果请用 datasheet 和仪器验证。更新于 2026-10-19。
