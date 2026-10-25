---
title: "证据优先的 Datasheet 工程工作台"
slug: datasheet-workbench
summary: "把 PDF 解析、多模型提取、来源验证与确定性比较规则串成可核对的元件阅读与替代料流程。"
year: 2026
status: maintained
areas: [hardware, product]
role: 产品设计与实现
featured: false
updatedAt: 2026-10-25
tags: ["Next.js", "TypeScript", "PDF.js", "BYOK", "Evidence"]
demoUrl: /tools/datasheet-workbench/app
relatedTools: [datasheet-workbench]
outcome: 建立一套不以 AI 信心分数代替来源、可导出且能明确降级的 Datasheet 工作流程。
locale: zh-CN
translationOf: datasheet-workbench
translationStatus: published
translatedAt: 2026-10-25
---

## 问题

元件 Datasheet 的规格分散在料号表、额定值、工作条件、特性表与图形中；相同名称还可能采用不同测试条件。单纯让 AI 摘要整份 PDF，容易丢失页码、混淆 Family 与 Ordering Code，或把 Typical 当成保证值。替代料也不能只靠语义相似，因为任何电压、温度、封装或电流阻挡项都可能否决替代。

## 架构与职责边界

浏览器用 PDF.js 读取公开 PDF 的文字层、分页与哈希，并按元件类型及字段选出相关片段。用户选择 OpenAI-compatible、Anthropic 或 Gemini 并提供自己的 API 密钥；Relay 只允许固定 HTTPS 目的地与操作，不记录密钥。

AI 负责识别完整 Ordering Code、把片段提取成共同 JSON Schema，以及用已验证来源回答问题。确定性 TypeScript 程序负责单位标准化、min／typ／max、条件兼容性、额定范围、封装与替代判定。相同结构化输入会得到相同结果。

## 证据模型与验证

每个规格保存文档标识、页码、章节、表格、原文与 chunk hash。模型引用不存在于已发送片段的文字时，该值会被降级。替代矩阵保留原料与候选料两边来源。

目前用人工建立的 MLCC 与屏蔽型功率电感 fixture 验证 Schema、单位换算、四种判定、条件冲突、缺失证据、Ordering Code 与报告导出，也测试 Relay 白名单、SSRF 防护、超时与回包大小。这些只证明指定案例行为，没有测量真实提取准确率，因此不宣称 accuracy 百分比。

## 隐私与限制

PDF 本地解析，但相关文字与 API 密钥仍会在单次请求经 Relay 传给用户所选供应商。第一版只支持有文字层的公开 PDF、MLCC 与屏蔽型功率电感，不做 OCR、扫描表格、曲线插值、网络抓取、供应链或其他元件的正式替代判定。曲线是必要条件时，结果必须标为证据不足。
