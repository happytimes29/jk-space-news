import Link from "next/link";

export default function LocalizedNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center text-[var(--color-text)]">
      <p className="mb-6 font-mono text-6xl font-bold text-[var(--color-accent)]" aria-hidden="true">404</p>
      <h1 className="mb-3 text-2xl font-bold">Page not found</h1>
      <p className="mb-8 max-w-md text-sm leading-7 text-[var(--color-muted)]">This page is not available in the selected language.</p>
      <Link href="/" className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm">JK Space</Link>
    </div>
  );
}
