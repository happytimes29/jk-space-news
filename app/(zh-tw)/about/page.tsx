import { AboutPage } from "@/components/pages/AboutPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCALES } from "@/lib/i18n/locales";
import { buildLocalizedMetadata } from "@/lib/seo";

const dictionary = getDictionary("zh-TW");
export const metadata = buildLocalizedMetadata({ locale: "zh-TW", pathname: "/about", title: dictionary.about.title, description: dictionary.about.metadataDescription, availableLocales: LOCALES });

export default function TraditionalAboutPage() {
  return <AboutPage locale="zh-TW" />;
}
