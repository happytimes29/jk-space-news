import Link from "next/link";
import { Github, Mail, Send } from "lucide-react";
import { getEnabledContactLinks, type SiteConfig } from "@/lib/site-config";
import type { SiteDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";

const contactIcons = { github: Github, telegram: Send, email: Mail };

interface FooterProps {
  locale: Locale;
  dictionary: SiteDictionary;
  config: SiteConfig;
}

export function Footer({ locale, dictionary, config }: FooterProps) {
  const contacts = getEnabledContactLinks(config);

  return (
    <footer className="border-t border-[var(--color-border)] mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3">
            <Link href={localePath(locale, "/")} className="font-bold text-sm text-[var(--color-text)]">{config.name}</Link>
            <p className="text-xs text-[var(--color-muted)] max-w-xs leading-relaxed">{config.tagline}</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-4">
            <nav aria-label={dictionary.footer.siteInformation} className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-muted)]">
              <Link href={localePath(locale, "/about")} className="hover:text-[var(--color-accent)] transition-colors">{dictionary.navigation.about}</Link>
              <Link href={localePath(locale, "/privacy")} className="hover:text-[var(--color-accent)] transition-colors">{dictionary.navigation.privacy}</Link>
              <Link href={localePath(locale, "/contact")} className="hover:text-[var(--color-accent)] transition-colors">{dictionary.navigation.contact}</Link>
            </nav>
            {contacts.length > 0 && (
              <div className="flex flex-wrap items-center gap-2" aria-label={dictionary.footer.contactChannels}>
                {contacts.map(({ label, href, kind }) => {
                  const Icon = contactIcons[kind];
                  return (
                    <a key={kind} href={href} aria-label={label} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors">
                      <Icon size={15} aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--color-muted)]">
          <p>© 2026 {config.name}. {dictionary.footer.rights}</p>
          <p>{dictionary.footer.searchPrefix} <kbd className="px-1.5 py-0.5 border border-[var(--color-border)] rounded bg-[var(--color-card)]">⌘K</kbd> {dictionary.footer.searchSuffix}</p>
        </div>
      </div>
    </footer>
  );
}
