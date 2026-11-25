import { ToolsPage } from "@/components/pages/ToolsPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCALES } from "@/lib/i18n/locales";
import { buildLocalizedMetadata } from "@/lib/seo";

const dictionary = getDictionary("zh-TW");
export const metadata = buildLocalizedMetadata({ locale: "zh-TW", pathname: "/tools", title: dictionary.navigation.work, description: dictionary.collections.toolsDescription, availableLocales: LOCALES });
export default async function TraditionalToolsRoute() { return ToolsPage({ locale: "zh-TW" }); }
