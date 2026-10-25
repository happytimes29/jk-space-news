"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import type { ReactNode } from "react";
import { localePath, type Locale } from "@/lib/i18n/locales";

export function OpenToolLink({ slug, href, locale, localized = false, children }: { slug: string; href: string; locale: Locale; localized?: boolean; children: ReactNode }) {
  const className = "editorial-tool-cta";
  const onClick = () => track("Open Tool", { slug });
  if (href.startsWith("/") && !href.startsWith("//")) {
    return <Link href={localized ? localePath(locale, href) : href} onClick={onClick} className={className}>{children}</Link>;
  }
  return <a href={href} onClick={onClick} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
}
