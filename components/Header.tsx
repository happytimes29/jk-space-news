"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { SiteDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import type { SiteConfig } from "@/lib/site-config";
import type { TranslationAvailability } from "@/lib/content/translations";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface HeaderProps {
  locale: Locale;
  dictionary: SiteDictionary;
  config: SiteConfig;
  availability: TranslationAvailability;
}

export function Header({ locale, dictionary, config, availability }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="site-header v2-site-header">
      <div className="v2-site-header__inner">
          <Link
            href={config.navigation[0].href}
            className="v2-site-header__brand"
          >
            {config.name}
          </Link>

          <nav aria-label={dictionary.header.mainNavigation} className="v2-site-nav hidden md:flex">
            {config.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="v2-site-header__tools hidden md:flex">
            <LanguageSwitcher locale={locale} availability={availability} label={dictionary.language.select} unavailableLabel={dictionary.language.unavailable} />
            <kbd className="v2-site-header__shortcut hidden lg:flex">
              <span>⌘</span>K
            </kbd>
          </div>

          <button
            className="v2-site-header__toggle md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? dictionary.header.closeMenu : dictionary.header.openMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
      </div>

      <nav id="mobile-navigation" aria-label={dictionary.header.mobileNavigation} hidden={!mobileOpen} className="v2-site-header__mobile md:hidden">
        {config.navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <div className="v2-site-header__mobile-language">
          <LanguageSwitcher locale={locale} availability={availability} label={dictionary.language.select} unavailableLabel={dictionary.language.unavailable} />
        </div>
      </nav>
    </header>
  );
}
