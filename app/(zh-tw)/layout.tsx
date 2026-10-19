import "../globals.css";
import type { Metadata } from "next";
import { SiteShell, buildRootMetadata } from "@/components/SiteShell";

export const metadata: Metadata = buildRootMetadata("zh-TW");

export default async function TraditionalLayout({ children }: { children: React.ReactNode }) {
  const shell = await SiteShell({ locale: "zh-TW", children });
  return (
    <html lang="zh-Hant-TW" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        {shell}
      </body>
    </html>
  );
}
