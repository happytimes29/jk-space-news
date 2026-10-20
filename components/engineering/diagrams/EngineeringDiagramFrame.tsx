"use client";

import { useId, type ReactNode } from "react";

export interface EngineeringDiagramFrameProps {
  label: string;
  title: string;
  description: string;
  viewBox: string;
  stale: boolean;
  staleLabel: string;
  minWidthClassName?: string;
  children: ReactNode;
}

export function DiagramStatusNotice({ stale, label }: { stale: boolean; label: string }) {
  if (!stale) return null;

  return (
    <p role="status" className="mt-2 text-sm font-medium text-[var(--color-muted)]">
      {label}
    </p>
  );
}

export function EngineeringDiagramFrame({
  label,
  title,
  description,
  viewBox,
  stale,
  staleLabel,
  minWidthClassName = "min-w-[420px]",
  children,
}: EngineeringDiagramFrameProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <figure>
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3">
        <svg
          role="img"
          aria-label={label}
          aria-describedby={`${titleId} ${descriptionId}`}
          viewBox={viewBox}
          data-stale={stale ? "true" : undefined}
          className={`h-auto w-full ${minWidthClassName} text-[var(--color-text)] transition-opacity ${stale ? "opacity-55" : "opacity-100"}`}
        >
          <title id={titleId}>{title}</title>
          <desc id={descriptionId}>{description}</desc>
          {children}
        </svg>
      </div>
      <DiagramStatusNotice stale={stale} label={staleLabel} />
    </figure>
  );
}
