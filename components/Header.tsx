"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Zap, Menu, X, Rss } from "lucide-react";

const NAV = [
  { label: "首頁", href: "/" },
  { label: "趨勢", href: "/trending" },
  { label: "RSS", href: "/feed.xml", external: true },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-black/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-md bg-[#0070F3] flex items-center justify-center group-hover:shadow-[0_0_12px_#0070F3] transition-shadow duration-300">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-sm tracking-tight">
              JK<span className="text-[#0070F3]"> Space</span> News
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#888888] hover:text-[#EDEDED] transition-colors rounded-md hover:bg-[#0A0A0A]"
                >
                  <Rss size={13} />
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    pathname === item.href
                      ? "text-[#EDEDED] bg-[#0A0A0A]"
                      : "text-[#888888] hover:text-[#EDEDED] hover:bg-[#0A0A0A]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Kbd hint */}
          <div className="hidden md:flex items-center gap-2">
            <kbd className="hidden lg:flex items-center gap-1 px-2 py-0.5 text-xs text-[#888888] border border-[#1a1a1a] rounded bg-[#0A0A0A] cursor-default select-none">
              <span>⌘</span>K
            </kbd>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-[#888888] hover:text-[#EDEDED] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1a1a1a] bg-black/95 px-4 pb-4 pt-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2.5 text-sm text-[#888888] hover:text-[#EDEDED] transition-colors border-b border-[#0A0A0A] last:border-0"
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
