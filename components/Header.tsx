"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { label: "首頁", href: "/" },
  { label: "訪談", href: "/interview" },
  { label: "工具", href: "/tools" },
  { label: "關於我", href: "/profile" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="group text-sm font-semibold tracking-tight text-[var(--color-text)]"
          >
            <span>
              JK Space
              <span className="text-[var(--color-accent)]"> News</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)]/70 p-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  pathname === item.href
                    ? "text-[var(--color-text)] bg-[var(--color-card-hover)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card-hover)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Kbd hint */}
          <div className="hidden md:flex items-center gap-2">
            <kbd className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-xs text-[var(--color-muted)] border border-[var(--color-border)] rounded-full bg-[var(--color-card)] cursor-default select-none">
              <span>⌘</span>K
            </kbd>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 px-4 pb-4 pt-2 backdrop-blur-xl">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-xl px-3 py-2.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card-hover)] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
