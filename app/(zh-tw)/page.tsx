import { HomePage } from "@/components/pages/HomePage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCALES } from "@/lib/i18n/locales";
import { buildLocalizedMetadata } from "@/lib/seo";

const dictionary = getDictionary("zh-TW");
export const metadata = buildLocalizedMetadata({ locale: "zh-TW", pathname: "/", title: dictionary.metadata.homeTitle, description: dictionary.metadata.homeDescription, availableLocales: LOCALES });

export default async function TraditionalHomePage() {
  return HomePage({ locale: "zh-TW" });
}
