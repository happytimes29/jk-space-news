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
    <footer className="site-footer v2-site-footer">
      <div className="v2-site-footer__inner">
        <div className="v2-site-footer__top">
          <div className="v2-site-footer__identity">
            <Link href={localePath(locale, "/")}>{config.name}</Link>
            <p>{config.tagline}</p>
          </div>
          <div className="v2-site-footer__navigation">
            <nav aria-label={dictionary.footer.siteInformation}>
              <Link href={localePath(locale, "/about")}><span className="v2-footer-index" aria-hidden="true">01</span>{dictionary.navigation.about}</Link>
              <Link href={localePath(locale, "/privacy")}><span className="v2-footer-index" aria-hidden="true">02</span>{dictionary.navigation.privacy}</Link>
              <Link href={localePath(locale, "/contact")}><span className="v2-footer-index" aria-hidden="true">03</span>{dictionary.navigation.contact}</Link>
            </nav>
            {contacts.length > 0 && (
              <div className="v2-site-footer__contacts" aria-label={dictionary.footer.contactChannels}>
                {contacts.map(({ label, href, kind }) => {
                  const Icon = contactIcons[kind];
                  return (
                    <a key={kind} href={href} aria-label={label}>
                      <Icon size={15} aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="v2-site-footer__bottom">
          <p>© 2026 {config.name}. {dictionary.footer.rights}</p>
          <p>{dictionary.footer.searchPrefix} <kbd>⌘K</kbd> {dictionary.footer.searchSuffix}</p>
        </div>
      </div>
    </footer>
  );
}
