import "../globals.css";
import type { Metadata } from "next";
import { SiteShell, buildRootMetadata } from "@/components/SiteShell";
import { localeConfig, localeFromSegment } from "@/lib/i18n/locales";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

function resolveShellLocale(segment: string) {
  const locale = localeFromSegment(segment);
  return locale && locale !== "zh-TW" ? locale : "zh-TW";
}

export function generateStaticParams() {
  return [{ locale: "zh-cn" }, { locale: "en" }];
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  return buildRootMetadata(resolveShellLocale((await params).locale));
}

export default async function LocalizedLayout({ children, params }: Props) {
  const locale = resolveShellLocale((await params).locale);
  const shell = await SiteShell({ locale, children });
  return (
    <html lang={localeConfig(locale).htmlLang} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        {shell}
      </body>
    </html>
  );
}
