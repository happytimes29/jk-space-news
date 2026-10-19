import "../globals.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell, buildRootMetadata } from "@/components/SiteShell";
import { localeConfig, localeFromSegment } from "@/lib/i18n/locales";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

function resolveLocale(segment: string) {
  const locale = localeFromSegment(segment);
  if (!locale || locale === "zh-TW") notFound();
  return locale;
}

export function generateStaticParams() {
  return [{ locale: "zh-cn" }, { locale: "en" }];
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  return buildRootMetadata(resolveLocale((await params).locale));
}

export default async function LocalizedLayout({ children, params }: Props) {
  const locale = resolveLocale((await params).locale);
  const shell = await SiteShell({ locale, children });
  return (
    <html lang={localeConfig(locale).htmlLang} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        {shell}
      </body>
    </html>
  );
}
