import type { ReactNode } from "react";
import { parseEngineeringNumber } from "@/lib/engineering/quantity";
import { ResultPanel } from "../ResultPanel";

export function parsed(text: string): number | undefined {
  const result = parseEngineeringNumber(text);
  return result.ok ? result.value : undefined;
}

export function ModeLayout({ inputTitle, resultTitle, inputs, results }: { inputTitle: string; resultTitle: string; inputs: ReactNode; results: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-label={inputTitle} className="space-y-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <h2 className="text-lg font-semibold">{inputTitle}</h2>{inputs}
      </section>
      <ResultPanel title={resultTitle}>{results}</ResultPanel>
    </div>
  );
}

export function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return <label className="block space-y-2 text-sm font-medium">{label}<select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2">{children}</select></label>;
}

export function ResultRow({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt className="text-sm text-[var(--color-muted)]">{label}</dt><dd className="mt-1 font-mono">{children}</dd></div>;
}
