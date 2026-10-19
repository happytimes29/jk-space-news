import { ToolsPage } from "@/components/pages/ToolsPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCALES } from "@/lib/i18n/locales";
import { buildLocalizedMetadata } from "@/lib/seo";

const dictionary = getDictionary("zh-TW");
export const metadata = buildLocalizedMetadata({ locale: "zh-TW", pathname: "/tools", title: dictionary.collections.toolsTitle, description: "JK Space 開發的工程工具：用途、格式、限制與資料處理方式。", availableLocales: LOCALES });
export default async function TraditionalToolsRoute() { return ToolsPage({ locale: "zh-TW" }); }
