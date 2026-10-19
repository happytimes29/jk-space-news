---
title: "PCB 测试点自动比对工具"
slug: pcb-test-point-comparison
summary: "硬件改版时，比对新旧 OrCAD 报表中的测试点坐标，自动标记 Unchanged / Moved / Added / Removed。支持 DXF 板框叠图、白名单筛选、mil↔mm 坐标对齐。完全在浏览器端运算，确保 CAD 数据不外泄。"
year: 2026
status: maintained
areas: [hardware, product]
role: 设计与实现
featured: true
updatedAt: 2026-06-10
tags: ["Next.js", "OrCAD", "DXF", "Canvas", "Claude Code"]
coverImage: /images/pcb-tool-1.png
gallery: [/images/pcb-tool-1.png, /images/pcb-tool-2.png]
demoUrl: /tools/pcb-test-point/app
relatedTools: [pcb-test-point]
outcome: 将新旧测试点差异、目标清单筛选与板框叠图整合在同一个浏览器工具中。
locale: zh-CN
translationOf: pcb-test-point-comparison
translationStatus: published
translatedAt: 2026-10-19
---

## 问题与使用场景

PCB 改版后，需要确认新旧 OrCAD 报表中的测试点哪些被保留、移动、新增或移除。只有坐标数字时，很难看出变动与板边、孔位的空间关系；把全板测试点一起画出来，又容易掩盖本次改版真正需要检查的区域。

这个工具把报表比对、目标测试点筛选与 DXF 板框叠图放在同一个浏览器界面中，供工程师检查改版差异。

## 角色与责任

我负责工具的设计与实现，从 OrCAD 报表解析、比对规则、坐标叠合到操作界面，并使用 Claude Code 协助开发。遇到解析与坐标问题时，以实际报表结构与画面结果调整做法。

## 限制与设计考量

- CAD 数据可能包含机密，因此文件解析与比对都在浏览器端执行。
- OrCAD 导出的 HTML 不一定符合预期的表格字段与结构，不能只凭想象建立解析器。
- HTML 测试点与 DXF 板框可能使用不同单位与原点，导入后不能直接假设两者重合。
- 全板点位会产生视觉噪声，需要让用户指定本次要查看的测试点。

## 解决方案与关键决策

### 用实际报表修正解析方式

初版解析器曾无法读取数据。检查 OrCAD HTML 源代码后，使用实际的表格片段调整字段识别，从报表中找出 RefDes、X 与 Y，而不是依赖 AI 预设的表格格式。

### 先筛选，再比对

加入 Target List 白名单，在核心比对前先挑出指定测试点，让画布与明细聚焦在本次改版的范围。

### 在网页上调整板框坐标

加入 DXF 板框作为底图，并提供缩放倍率与 X／Y 偏移控制。转换采用 `Target = (Original × Scale) + Offset`；默认倍率 39.37 对应 mm 到 mil 的换算，仍需根据实际数据确认原点与单位。

## 实现过程与架构

界面使用 Next.js App Router、React 与 Tailwind CSS。HTML 由浏览器原生 DOMParser 解析；DXF 使用项目内的解析程序读取几何数据；Canvas 负责绘制测试点、板框与位移向量。

1. 读取旧版与新版 HTML，另可加入 Target List 与 DXF 板框。
2. 解析报表字段与坐标；若指定了 Target List，先筛选两个版本的数据。
3. 以 RefDes 对应新旧测试点，计算坐标差异，分类为 Unchanged、Moved、Added、Removed。
4. 应用 DXF 缩放与偏移，在同一个画布上叠合板框与测试点。
5. 显示可筛选的明细与可视化结果，并提供 CSV 导出。

## 结果与验证方式

目前工具可把差异分类、目标清单与板框叠图放在同一个工作画面中。开发时通过实际 OrCAD 表格确认字段能够被读取，并检查叠图来调整缩放与原点偏移。

这些是功能与操作结果的定性记录；尚未建立节省工时、降低错误率或性能提升的量化测试，不以估算数字作为成果。

![测试点比对与板框叠图操作界面](/images/pcb-tool-2.png)

## 已知限制

- 支持的报表仍须能够识别 RefDes 与坐标字段，并非任意 CAD 格式都可直接使用。
- DXF 解析以支持的几何图元与板框图层为主，无法取代完整 CAD 查看器。
- 用户须确认叠图单位与偏移；图面已对齐并不代表已经完成电气、机械或可制造性检查。
- 比对依 RefDes 对应，命名改变时不能自动推断是否为同一个实体测试点。

## 相关链接

- [工具介绍与使用说明](/zh-cn/tools/pcb-test-point)
- [打开 PCB 测试点比对工具](/tools/pcb-test-point/app)
