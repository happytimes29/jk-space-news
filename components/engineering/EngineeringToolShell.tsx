import Link from "next/link";
import type { ReactNode } from "react";

export interface EngineeringToolShellProps {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  privacy: string;
  application: ReactNode;
}

export function EngineeringToolShell({ title, description, backHref, backLabel, privacy, application }: EngineeringToolShellProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label={backLabel}>
        <Link href={backHref} className="text-sm text-blue-600 hover:underline dark:text-blue-400">← {backLabel}</Link>
      </nav>
      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 leading-7 text-[var(--color-muted)]">{description}</p>
        <p className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-muted)]">{privacy}</p>
      </header>
      <section className="mt-8" aria-label={title}>{application}</section>
    </main>
  );
}
