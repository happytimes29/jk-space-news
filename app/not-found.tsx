import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center text-[var(--color-text)]">
      <p className="mb-6 font-mono text-6xl font-bold text-[var(--color-accent)]" aria-hidden="true">404</p>
      <h1 className="mb-3 text-2xl font-bold">頁面不存在</h1>
      <p className="mb-8 max-w-md text-sm leading-7 text-[var(--color-muted)]">
        這個網址可能已移動或不再提供。可以從專案、工具或筆記與觀點繼續探索工程實作。
      </p>
      <nav aria-label="繼續探索" className="flex max-w-lg flex-wrap justify-center gap-3">
        {[["回到首頁", "/"], ["專案", "/projects"], ["工具", "/tools"], ["筆記與觀點", "/notes"]].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm font-medium transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
