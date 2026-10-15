"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import type { ReactNode } from "react";

export function OpenToolLink({ slug, href, children }: { slug: string; href: string; children: ReactNode }) {
  const className = "inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700";
  const onClick = () => track("Open Tool", { slug });
  if (href.startsWith("/") && !href.startsWith("//")) {
    return <Link href={href} onClick={onClick} className={className}>{children}</Link>;
  }
  return <a href={href} onClick={onClick} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
}
