import { ToolsPage } from "@/components/pages/ToolsPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({ route: "/tools", title: "我做的工具", description: "JK Space 開發的工程工具：用途、格式、限制與資料處理方式。" });
export default async function TraditionalToolsRoute() { return ToolsPage({ locale: "zh-TW" }); }
