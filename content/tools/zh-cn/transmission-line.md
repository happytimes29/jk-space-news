---
title: "PCB 传输线阻抗与线宽计算器"
slug: transmission-line
summary: "用微带线、对称带状线和接地 CPW 准静态模型计算阻抗、传播指标或反求线宽。"
status: experimental
privacy: 几何与材料数值只在浏览器内计算，不会发送到服务器。
inputTypes: [PCB 几何尺寸, 相对介电常数与频率, 目标阻抗]
outputTypes: [特性阻抗与有效介电常数, 波长延迟与电气角度, 反求线宽]
updatedAt: 2026-10-19
appUrl: /tools/transmission-line/app
localizedApp: true
locale: zh-CN
translationOf: transmission-line
translationStatus: reviewed
translatedAt: 2026-10-19
---

## 三种几何与输入

微带线输入宽度 W、基板高度 h、铜厚 t；对称带状线输入 W、两参考平面的完整间距 b 和 t，走线固定居中；接地 CPW（CPWG）另输入两侧间隙 s，并假设连续背面地和无限宽侧地。共用输入为相对介电常数、频率与线长，mm、mil、µm 切换不会改变实际尺寸。

正向模式输出阻抗、有效介电常数、相速度、波长、每米延迟和电气角度。目标模式用有界二分法反求线宽；范围内无解时不会沿用旧结果。

## 公式、范围与限制

微带线采用 Hammerstad–Jensen 与有限铜厚修正；对称带状线采用 Wheeler 1965；CPWG 采用 Qucs (12.10)–(12.18)，不含 (12.19) 之后的频散。默认 FR-4 类示例约为 50 Ω 微带线、50 Ω 带状线和 35–36 Ω CPWG。

模型不含频散、粗糙度、导体/介质损耗、阻焊、梯形蚀刻、表面处理、玻纤效应、有限地宽、接地孔、转角、连接器或不连续。超出建议比例会警告。最终尺寸请与板厂确认，并用场求解器和实测验证。数据只留在浏览器。更新于 2026-10-19。
