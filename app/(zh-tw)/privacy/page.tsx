import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCALES } from "@/lib/i18n/locales";
import { buildLocalizedMetadata } from "@/lib/seo";

const dictionary = getDictionary("zh-TW");
export const metadata = buildLocalizedMetadata({ locale: "zh-TW", pathname: "/privacy", title: dictionary.privacy.title, description: "JK Space 的網站連線、匿名瀏覽統計與 PCB 工具檔案處理說明。", availableLocales: LOCALES });

export default function TraditionalPrivacyPage() {
  return <PrivacyPage locale="zh-TW" />;
}
