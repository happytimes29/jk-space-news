---
title: "PCB 测试点自动比对工具"
slug: pcb-test-point
summary: "比对新旧 OrCAD HTML 报表的 RefDes 坐标，找出移动、新增与移除的测试点；支持 Target List 筛选与 DXF 板框叠图。"
status: available
privacy: 所有用户文件只在浏览器内解析，不上传服务器。
inputTypes: [OrCAD HTML, DXF, Target List]
outputTypes: [差异表, 2D 坐标图, CSV]
updatedAt: 2026-10-15
coverImage: /images/pcb-tool-1.png
appUrl: /tools/pcb-test-point/app
sampleUrl: /samples/pcb-test-point-old.html
relatedProject: pcb-test-point-comparison
locale: zh-CN
translationOf: pcb-test-point
translationStatus: published
translatedAt: 2026-10-19
---

## 用途与使用方式

适合在 PCB 改版后，以 RefDes 核对测试点是否移动、新增或移除。先选择旧版与新版 HTML 报表，工具会自动生成 Moved、Added、Removed、Unchanged 四种结果，以及 ΔX、ΔY 与位移距离。

可粘贴 Target List，只比对指定 RefDes；每行一个或使用逗号分隔。DXF 为选填底图，导入后可调整缩放与偏移，协助人工判断。最后可将差异表导出为 CSV。

## 支持格式与限制

- HTML／HTM：报表必须包含表格与 RefDes、SYM_X、SYM_Y 字段，也支持部分常见 X／Y 字段名。标题行上方可有报表信息，坐标可含千位分隔逗号；缺少名称、坐标或无法解析数字的行会被略过。
- CSV、纯文本、Gerber 与原生 PCB 文件不能直接作为坐标报表输入；CSV 是导出格式。请先从 CAD 导出符合上述字段的 HTML。
- RefDes 区分大小写，重复 RefDes 以最后一条为准；请先确认报表中的名称唯一。坐标差异大于 0.000001 才视为移动，这不是可设置的制造公差。
- 坐标不会自动换算单位，报表必须使用一致的原点与单位；CSV 标记为 mil，请使用 mil 报表。DXF 叠图的缩放与偏移需要自行确认。
- DXF 只支持 ASCII 的 LINE、LWPOLYLINE、ARC、CIRCLE，不支持二进制 DXF、BLOCK／INSERT 或完整 CAD 语义。优先选取板框名称的图层；找不到时使用非圆形几何作为备用，可能包含非板框线段。
- 文件在浏览器内存中处理，大型报表与复杂 DXF 的速度受设备影响。结果供工程核对，不能取代 CAD、DRC 或制造验证。

## 数据处理与隐私

数据不会离开浏览器。选择的 HTML、DXF、Target List 与比对结果不会上传，CSV 也在浏览器内生成；刷新后需要重新选择文件。加载示例只会读取本站公开的静态合成报表，无需登录。

网站保留匿名页面浏览分析，页面网址会移除查询字符串与片段，不包含用户文件名、坐标、RefDes 或报表内容。打开工具的自定义事件接口只传递公开工具 slug；Vercel 自定义事件的可见性取决于方案支持及网站的隐私过滤设置。目前网站只保留匿名 pageview，仍可通过应用页的浏览量观察使用入口。

## 示例输入与预期结果

打开工具后点击“加载示例”，即可读取两份不含真实 PCB 数据的合成报表；也可以下载[旧版 HTML](/samples/pcb-test-point-old.html) 与[新版 HTML](/samples/pcb-test-point-new.html)自行选择。

预期结果为 TP1 从 (100, 100) 移至 (130, 140)，距离为 50，显示 Moved；TP2 显示 Unchanged；TP3 显示 Removed；TP4 显示 Added。示例不含 DXF，也不需要 Target List。

## 已知问题与反馈

不同 CAD 版本的报表字段名与 DXF 图层可能不同。若显示 0 条，请检查 HTML 是否包含表格与必要字段，并确认坐标是数字。若底图没有对齐，请先确认 DXF 单位、缩放与原点。

可通过页脚的“工具反馈”前往联系页，查看已设置的联系方式。反馈时请提供 CAD 版本、字段名与去标识化的最小示例，不要发送机密板文件或客户数据。
