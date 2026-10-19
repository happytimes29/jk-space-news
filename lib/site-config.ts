import { getDictionary } from "@/lib/i18n/dictionaries";
import { DEFAULT_LOCALE, localePath, type Locale } from "@/lib/i18n/locales";

export interface ContactLink {
  label: string;
  href: string;
  kind: "github" | "telegram" | "email";
}

export interface SiteConfig {
  name: string;
  url: string;
  title: string;
  tagline: string;
  description: string;
  navigation: { label: string; href: string }[];
  contacts: ContactLink[];
}

const contacts: ContactLink[] = [
  { label: "GitHub", href: "https://github.com/happytimes29", kind: "github" },
  { label: "Telegram", href: "https://t.me/JK_Sapce", kind: "telegram" },
];

export function getSiteConfig(locale: Locale): SiteConfig {
  const dictionary = getDictionary(locale);
  const navigation = [
    [dictionary.navigation.home, "/"],
    [dictionary.navigation.projects, "/projects"],
    [dictionary.navigation.tools, "/tools"],
    [dictionary.navigation.notes, "/notes"],
    [dictionary.navigation.about, "/about"],
    [dictionary.navigation.contact, "/contact"],
  ] as const;

  return {
    name: "JK Space",
    url: (process.env.NEXT_PUBLIC_SITE_URL || "https://jk-space.com").replace(/\/+$/, ""),
    title: dictionary.site.title,
    tagline: dictionary.site.tagline,
    description: dictionary.site.description,
    navigation: navigation.map(([label, href]) => ({ label, href: localePath(locale, href) })),
    contacts: contacts.map((contact) => ({ ...contact })),
  };
}

export const siteConfig: SiteConfig = getSiteConfig(DEFAULT_LOCALE);

export function getEnabledContactLinks(config: SiteConfig): ContactLink[] {
  return config.contacts;
}
