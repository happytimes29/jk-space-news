"use client";

import { useId } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { TranslationAvailability } from "@/lib/content/translations";
import { LOCALES, localeConfig, localePath, splitLocalePath, type Locale } from "@/lib/i18n/locales";

interface LanguageSwitcherProps {
  locale: Locale;
  availability: TranslationAvailability;
  label: string;
  unavailableLabel: string;
}

export function setLocalePreference(locale: Locale): void {
  document.cookie = `jk-locale=${locale}; Max-Age=31536000; Path=/; SameSite=Lax`;
}

export function LanguageSwitcher({ locale, availability, label, unavailableLabel }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const descriptionId = useId();
  const logicalPath = splitLocalePath(pathname).pathname;
  const available = availability[logicalPath] ?? [locale];

  const switchLocale = (target: Locale) => {
    if (!available.includes(target)) return;
    const currentLogicalPath = splitLocalePath(window.location.pathname).pathname;
    setLocalePreference(target);
    router.push(`${localePath(target, currentLogicalPath)}${window.location.search}${window.location.hash}`);
  };

  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1">
      <span id={descriptionId} className="sr-only">{unavailableLabel}</span>
      {LOCALES.map((target) => {
        const enabled = available.includes(target);
        return (
          <button
            key={target}
            type="button"
            aria-pressed={target === locale}
            aria-describedby={enabled ? undefined : descriptionId}
            disabled={!enabled}
            onClick={() => switchLocale(target)}
            className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-muted)] transition-colors enabled:hover:border-[var(--color-accent)] enabled:hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:border-[var(--color-accent)] aria-pressed:text-[var(--color-accent)]"
          >
            {localeConfig(target).label}
          </button>
        );
      })}
    </div>
  );
}
