---
title: "Datasheet 工程工作台"
slug: datasheet-workbench
summary: "从公开元件 Datasheet 提取可追溯规格，快速阅读 MLCC／功率电感，并用固定规则评估替代料。"
status: experimental
privacy: PDF 在浏览器解析；相关文字与用户提供的 API 密钥只在本次请求经 Relay 传给所选模型，不会储存。
inputTypes: [公开 Datasheet PDF, 完整 Ordering Code, 实际工作条件, 用户自备模型 API 密钥]
outputTypes: [有来源的规格摘要, 替代料比较矩阵, Markdown 报告, JSON 报告]
updatedAt: 2026-10-25
appUrl: /tools/datasheet-workbench/app
localizedApp: true
relatedProject: datasheet-workbench
locale: zh-CN
translationOf: datasheet-workbench
translationStatus: published
translatedAt: 2026-10-25
---

## 两个工作区

“快速读懂 Datasheet”把制造商、完整料号、额定值、工作条件、封装与限制整理成结构化表格。每个数值都能展开原始页码、章节、表格与引用文字，也可针对已验证的段落提出工程问题。

“替代料评估”同时载入原料与候选料，要求两份 Family Datasheet 各自选定完整 Ordering Code。填入实际工作条件后，工具才会用确定性规则输出可直接替代、条件式可替代、不建议替代或证据不足；没有工作条件时只显示规格差异，不下替代结论。

## 数据传送与 API 密钥

只可上传公开的元件 Datasheet PDF，请勿放入内部规格、电路图或机密文件。PDF 文字层在浏览器解析并选取相关片段；这些片段与用户自行提供的 API 密钥会在单次请求中经 JK Space Relay 传给所选模型供应商。本站不把密钥写入 Local Storage、Cookie、数据库或分析服务。

## 第一版范围与限制

第一版正式支持 MLCC 陶瓷电容与屏蔽型功率电感。它不支持 OCR、扫描 PDF、网页自动下载、晶体管／电源 IC，也不会从 DC Bias、Ripple、温度降额或感量曲线测量数值。必要数据只存在图表时，结果会降级为证据不足并提供人工查看页面。

模型负责提取与文字说明；单位换算、范围比较与替代判定由 TypeScript 确定性规则执行。结果仍是工程筛选辅助，不能取代原厂确认、仿真、样品验证与设计审查。
