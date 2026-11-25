import "./globals.css";
import { NotFoundPage } from "@/components/pages/NotFoundPage";

export default function GlobalNotFound() {
  return (
    <html lang="zh-Hant-TW">
      <head><meta name="robots" content="noindex, nofollow" /></head>
      <body className="min-h-screen bg-[var(--color-bg)] antialiased">
        <main className="site-v2"><NotFoundPage locale="zh-TW" /></main>
      </body>
    </html>
  );
}
