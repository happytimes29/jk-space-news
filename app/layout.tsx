import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { getAllNews } from "@/lib/news";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jk-space.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JK Space News — 科技情報站",
    template: "%s | JK Space News",
  },
  description: "專注於 科技、金融理財、創業 的極速情報站。每日精選最前線科技脈動。",
  keywords: ["科技", "金融理財", "創業", "AI", "人工智慧", "科技新聞", "JK Space News"],
  authors: [{ name: "JK Space News" }],
  creator: "JK Space News",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: siteUrl,
    siteName: "JK Space News",
    title: "JK Space News — 科技情報站",
    description: "專注於 科技、金融理財、創業 的極速情報站。",
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
  const allNews = await getAllNews();
  const searchItems = allNews.map((n) => ({
    slug: n.slug,
    title: n.title,
    category: n.category,
  }));

  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        {/* Reading progress bar for article pages */}
        <div id="reading-progress" />

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <CommandPalette items={searchItems} />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
