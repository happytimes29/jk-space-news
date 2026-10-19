import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { LocaleSuggestion } from "@/components/LocaleSuggestion";
import { Analytics } from "@/components/Analytics";
import { getAllProjects } from "@/lib/projects";
import { getAllTools } from "@/lib/tools";
import { getAllNotes } from "@/lib/notes";
import { buildSearchItems } from "@/lib/search";
import { buildTranslationAvailability, contentVisibility } from "@/lib/content/translations";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeConfig, type Locale } from "@/lib/i18n/locales";
import { getSiteConfig } from "@/lib/site-config";

export function buildRootMetadata(locale: Locale): Metadata {
  const config = getSiteConfig(locale);
  const dictionary = getDictionary(locale);
  return {
    metadataBase: new URL(config.url),
    title: { default: config.title, template: `%s | ${config.name}` },
    description: config.description,
    keywords: [dictionary.navigation.projects, dictionary.navigation.tools, dictionary.navigation.notes, config.name],
    authors: [{ name: config.name }],
    creator: config.name,
    icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
    openGraph: {
      type: "website",
      locale: localeConfig(locale).ogLocale,
      url: config.url,
      siteName: config.name,
      title: config.title,
      description: config.description,
      images: [{ url: `/api/og?${new URLSearchParams({ title: config.title })}`, width: 1200, height: 630, alt: config.title }],
    },
  };
}

export async function SiteShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const visibility = contentVisibility();
  const dictionary = getDictionary(locale);
  const config = getSiteConfig(locale);
  const [projects, tools, notes] = await Promise.all([
    getAllProjects({ locale, visibility }),
    getAllTools({ locale, visibility }),
    getAllNotes({ locale, visibility }),
  ]);
  const searchItems = buildSearchItems(projects, tools, notes, locale);
  const availability = buildTranslationAvailability(visibility);

  return (
    <>
      <div id="reading-progress" />
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <Header locale={locale} dictionary={dictionary} config={config} availability={availability} />
        <CommandPalette items={searchItems} locale={locale} dictionary={dictionary} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} dictionary={dictionary} config={config} />
        <LocaleSuggestion
          locale={locale}
          copy={{
            title: dictionary.language.suggestionTitle,
            description: dictionary.language.suggestionDescription,
            switchAction: dictionary.language.switchAction,
            dismissAction: dictionary.language.dismissAction,
          }}
        />
      </ThemeProvider>
      <Analytics />
    </>
  );
}
