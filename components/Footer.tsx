import Link from "next/link";
import { Github, Mail, Send } from "lucide-react";
import { getEnabledContactLinks, siteConfig } from "@/lib/site-config";

const contactIcons = { github: Github, telegram: Send, email: Mail };

export function Footer() {
  const contacts = getEnabledContactLinks(siteConfig);

  return (
    <footer className="border-t border-[var(--color-border)] mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3">
            <Link href="/" className="font-bold text-sm text-[var(--color-text)]">{siteConfig.name}</Link>
            <p className="text-xs text-[var(--color-muted)] max-w-xs leading-relaxed">{siteConfig.tagline}</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-4">
            <nav aria-label="網站資訊" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-muted)]">
              <Link href="/about" className="hover:text-[var(--color-accent)] transition-colors">關於我</Link>
              <Link href="/privacy" className="hover:text-[var(--color-accent)] transition-colors">隱私權政策</Link>
              <Link href="/contact" className="hover:text-[var(--color-accent)] transition-colors">聯絡</Link>
            </nav>
            {contacts.length > 0 && (
              <div className="flex flex-wrap items-center gap-2" aria-label="聯絡管道">
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
          <p>© 2026 {siteConfig.name}. All rights reserved.</p>
          <p>按下 <kbd className="px-1.5 py-0.5 border border-[var(--color-border)] rounded bg-[var(--color-card)]">⌘K</kbd> 開啟全站搜尋</p>
        </div>
      </div>
    </footer>
  );
}
