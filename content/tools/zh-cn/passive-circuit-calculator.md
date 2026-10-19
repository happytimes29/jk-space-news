---
title: "无源电路计算器"
slug: passive-circuit-calculator
summary: "计算分压器、RC/LC/RLC、电抗，以及等端口阻抗的 T 型和 π 型衰减器。"
status: experimental
privacy: 所有数值只在浏览器内计算，不会发送到服务器。
inputTypes: [R/L/C, 电压与频率, E 系列与负载]
outputTypes: [标准阻值建议, 截止与谐振, 衰减器阻值]
updatedAt: 2026-10-19
appUrl: /tools/passive-circuit-calculator/app
localizedApp: true
locale: zh-CN
translationOf: passive-circuit-calculator
translationStatus: reviewed
translatedAt: 2026-10-19
---

## 用途与输入输出

分压模式按 Vin、目标 Vout、E12/E24/E48/E96 与可选负载推荐阻值。其他模式计算 RC 时间常数与截止频率、LC/RLC 谐振、Q、带宽、Xc、Xl 和 T/π 衰减器。

## 示例与公式

3.3 V 到 1.8 V 的示例按实际输出误差排序。1 kΩ 与 100 nF 的 `fc=1/(2πRC)` 约为 1.59155 kHz；10 nH 与 1 pF 的 `f0=1/(2π√LC)` 约为 1.59155 GHz。

## 假设、隐私与限制

公式采用理想集中元件，不含 ESR、ESL、SRF、额定功率和布局寄生。计算只在浏览器完成；关键设计请再用 SPICE、datasheet 和实测验证。更新于 2026-10-19。
