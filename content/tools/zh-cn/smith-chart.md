---
title: "单频史密斯图与 L 型匹配"
slug: smith-chart
summary: "输入单一频率的复数阻抗，在史密斯图查看 Z、Y、Γ 与元件路径，并计算理想 L 型匹配。"
status: experimental
privacy: 所有数值与网络步骤只在浏览器内计算，不会发送到服务器。
inputTypes: [单一频率, 复数负载阻抗, 参考阻抗, 理想 RLC 元件]
outputTypes: [史密斯图路径, Z/Y/Γ 与反射指标, L 型匹配与 E24 值]
updatedAt: 2026-10-19
appUrl: /tools/smith-chart/app
localizedApp: true
locale: zh-CN
translationOf: smith-chart
translationStatus: reviewed
translatedAt: 2026-10-19
---

## 用途、输入与图表约定

输入单一频率、参考阻抗 `Z0` 和负载 `Z=R+jX`。工具以 `Γ=(Z-Z0)/(Z+Z0)` 投影到史密斯图：中心为匹配，右端为开路，左端为短路，并可切换导纳网格。读数包括 Z、Y、Γ、S11、VSWR、回波损耗和失配损耗。

默认示例为 1 GHz、50 Ω 系统和 25+j0 Ω 负载。加入串联或并联的理想 R、L、C 后，图中保留每一步路径；撤销、重做和分享网址保存同一物理网络。

## L 型匹配与标准值

工具在指定单一频率计算低通型与高通型理想解，并分别显示重新评估过的 E24 标准值。应用方案后可直接检查两个元件的路径与剩余失配。

## 假设、隐私与限制

第一版只接受手动输入单一频率复数阻抗，不导入 S 参数。理想集总模型不含 ESR、Q 值、自谐振、封装/走线寄生、传输线效应、容差或宽带优化；请用电路/EM 仿真及 VNA 实测确认。运算与 PNG 导出均在浏览器内完成。更新于 2026-10-19。
