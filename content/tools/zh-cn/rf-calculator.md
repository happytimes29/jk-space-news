---
title: "RF 快速计算器"
slug: rf-calculator
summary: "计算波长、传播延迟、电气长度，以及复数阻抗对应的 Y、Γ、S11、VSWR 和损耗。"
status: experimental
privacy: 所有数值只在浏览器内计算，不会发送到服务器。
inputTypes: [频率与介质, 长度/电气角/延迟, Z/Y/Γ, 参考阻抗]
outputTypes: [波长与电气角度, Z/Y/Γ, S11/VSWR/损耗]
updatedAt: 2026-10-19
appUrl: /tools/rf-calculator/app
localizedApp: true
locale: zh-CN
translationOf: rf-calculator
translationStatus: reviewed
translatedAt: 2026-10-19
---

## 用途与输入输出

传播模式可从物理长度、电气角或延迟任意一项反推其他结果，并接受相对介电常数或速度因子。RF 模式可从复数 Z、Y 或 Γ 任意一项换算，显示 Z、Y、Γ、归一化值、S11、VSWR、回波损耗和失配损耗。

## 示例与公式

1 GHz 自由空间的 `λ=c/f` 约为 299.792 mm，四分之一波长约 74.9481 mm。50+j0 Ω 对 50 Ω 时，`Γ=(Z-Z0)/(Z+Z0)=0` 且 VSWR=1；理想短路 `Γ=-1` 和开路 `Γ=+1` 会明确显示为无穷大极限。

## 假设、隐私与限制

介质模型采用 `v=c/√εr` 或速度因子，二者不能同时输入。不含频散、损耗、走线几何与校准面。计算只在浏览器完成，最终结果请用 EM 仿真或 VNA 验证。更新于 2026-10-19。
