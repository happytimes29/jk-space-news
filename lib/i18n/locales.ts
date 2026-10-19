export const LOCALES = ["zh-TW", "zh-CN", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh-TW";

export interface LocaleConfig {
  locale: Locale;
  segment: "zh-cn" | "en" | null;
  htmlLang: "zh-Hant-TW" | "zh-Hans-CN" | "en";
  hreflang: "zh-Hant-TW" | "zh-Hans-CN" | "en";
  ogLocale: "zh_TW" | "zh_CN" | "en_US";
  label: string;
}

const CONFIG: Record<Locale, LocaleConfig> = {
  "zh-TW": {
    locale: "zh-TW",
    segment: null,
    htmlLang: "zh-Hant-TW",
    hreflang: "zh-Hant-TW",
    ogLocale: "zh_TW",
    label: "繁體中文",
  },
  "zh-CN": {
    locale: "zh-CN",
    segment: "zh-cn",
    htmlLang: "zh-Hans-CN",
    hreflang: "zh-Hans-CN",
    ogLocale: "zh_CN",
    label: "简体中文",
  },
  en: {
    locale: "en",
    segment: "en",
    htmlLang: "en",
    hreflang: "en",
    ogLocale: "en_US",
    label: "English",
  },
};

export function localeConfig(locale: Locale): LocaleConfig {
  return CONFIG[locale];
}

export function localeFromSegment(segment: string): Locale | null {
  return LOCALES.find((locale) => CONFIG[locale].segment === segment) ?? null;
}

function withLeadingSlash(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function splitLocalePath(pathname: string): { locale: Locale; pathname: string } {
  const normalized = withLeadingSlash(pathname);
  const match = normalized.match(/^\/([^/?#]+)(.*)$/);
  const locale = match ? localeFromSegment(match[1]) : null;

  if (!locale || !match) {
    return { locale: DEFAULT_LOCALE, pathname: normalized };
  }

  const remainder = match[2];
  return {
    locale,
    pathname: remainder === "" ? "/" : remainder.startsWith("/") ? remainder : `/${remainder}`,
  };
}

export function localePath(locale: Locale, pathname: string): string {
  const logicalPath = splitLocalePath(pathname).pathname;
  const segment = CONFIG[locale].segment;

  if (!segment) return logicalPath;
  if (logicalPath === "/") return `/${segment}`;
  return `/${segment}${logicalPath}`;
}
