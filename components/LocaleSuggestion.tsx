"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { TranslationAvailability } from "@/lib/content/translations";
import { LOCALES, localeConfig, localePath, splitLocalePath, type Locale } from "@/lib/i18n/locales";
import { setLocalePreference } from "@/components/LanguageSwitcher";

interface SuggestionCopy {
  title: string;
  description: string;
  switchAction: string;
  dismissAction: string;
}

interface LocaleSuggestionProps {
  locale: Locale;
  copy: SuggestionCopy;
  availability: TranslationAvailability;
}

const DISMISSED_KEY = "jk-locale-suggestion-dismissed";

function localeCookie(): Locale | null {
  const value = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("jk-locale="))
    ?.slice("jk-locale=".length);
  return LOCALES.includes(value as Locale) ? (value as Locale) : null;
}

function browserLocale(languages: readonly string[]): Locale | null {
  for (const language of languages) {
    const normalized = language.toLowerCase();
    if (normalized === "zh-cn" || normalized.startsWith("zh-hans")) return "zh-CN";
    if (normalized === "zh-tw" || normalized.startsWith("zh-hant")) return "zh-TW";
    if (normalized === "en" || normalized.startsWith("en-")) return "en";
  }
  return null;
}

export function LocaleSuggestion({ locale, copy, availability }: LocaleSuggestionProps) {
  const [suggested, setSuggested] = useState<Locale | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setSuggested(null);
    if (window.localStorage.getItem(DISMISSED_KEY) === "1" || localeCookie()) return;
    const preferred = browserLocale(navigator.languages);
    const logicalPath = splitLocalePath(pathname).pathname;
    const available = availability[logicalPath] ?? [locale];
    if (preferred && preferred !== locale && available.includes(preferred)) setSuggested(preferred);
  }, [availability, locale, pathname]);

  if (!suggested) return null;

  const accept = () => {
    const logicalPath = splitLocalePath(window.location.pathname).pathname;
    const available = availability[logicalPath] ?? [locale];
    if (!available.includes(suggested)) {
      setSuggested(null);
      return;
    }
    setLocalePreference(suggested);
    router.push(`${localePath(suggested, logicalPath)}${window.location.search}${window.location.hash}`);
    setSuggested(null);
  };

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setSuggested(null);
  };

  return (
    <aside role="status" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-2xl">
      <p className="font-semibold text-[var(--color-text)]">{copy.title}</p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{copy.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={accept} className="rounded-md bg-[var(--color-accent)] px-3 py-2 text-sm text-white">
          {copy.switchAction}: {localeConfig(suggested).label}
        </button>
        <button type="button" onClick={dismiss} className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-muted)]">
          {copy.dismissAction}
        </button>
      </div>
    </aside>
  );
}
