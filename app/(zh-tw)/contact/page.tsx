import { ContactPage } from "@/components/pages/ContactPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCALES } from "@/lib/i18n/locales";
import { buildLocalizedMetadata } from "@/lib/seo";

const dictionary = getDictionary("zh-TW");
export const metadata = buildLocalizedMetadata({ locale: "zh-TW", pathname: "/contact", title: dictionary.contact.title, description: dictionary.contact.metadataDescription, availableLocales: LOCALES });

export default function TraditionalContactPage() {
  return <ContactPage locale="zh-TW" />;
}
