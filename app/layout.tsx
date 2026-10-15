import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { Analytics } from "@/components/Analytics";
import { getAllProjects } from "@/lib/projects";
import { getAllTools } from "@/lib/tools";
import { getAllNotes } from "@/lib/notes";
import { buildSearchItems } from "@/lib/search";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["硬體研發", "AI 自動化", "工程工具", "技術觀點", siteConfig.name],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: `/api/og?${new URLSearchParams({ title: siteConfig.title })}`, width: 1200, height: 630, alt: siteConfig.title }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projects, tools, notes] = await Promise.all([getAllProjects(), getAllTools(), getAllNotes()]);
  const searchItems = buildSearchItems(projects, tools, notes);

  return (
    <html lang="zh-Hant-TW" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        {/* Reading progress bar for article pages */}
        <div id="reading-progress" />

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Header />
          <CommandPalette items={searchItems} />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
