import type { ReactNode } from "react";

export function ResultPanel({ title, children, status = "polite" }: { title: string; children: ReactNode; status?: "polite" | "off" }) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5" aria-labelledby="engineering-result-title" aria-live={status}>
      <h2 id="engineering-result-title" className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 min-w-0 overflow-x-auto">{children}</div>
    </section>
  );
}
