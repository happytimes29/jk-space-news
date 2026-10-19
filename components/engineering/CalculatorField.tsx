"use client";

import type { ChangeEventHandler, InputHTMLAttributes, ReactNode } from "react";

export interface CalculatorFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "onChange" | "value"> {
  id: string;
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  unit?: string;
  hint?: ReactNode;
  error?: string;
}

export function CalculatorField({ id, label, value, onChange, unit, hint, error, className = "", ...inputProps }: CalculatorFieldProps) {
  const descriptionId = hint || error ? `${id}-description` : undefined;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <div className="flex overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] focus-within:border-[var(--color-accent)]">
        <input
          {...inputProps}
          id={id}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={`min-w-0 flex-1 bg-transparent px-3 py-2 font-mono text-sm outline-none ${className}`}
        />
        {unit && <span className="flex items-center border-l border-[var(--color-border)] px-3 text-sm text-[var(--color-muted)]">{unit}</span>}
      </div>
      {(error || hint) && <div id={descriptionId} className={`text-xs ${error ? "text-red-600 dark:text-red-400" : "text-[var(--color-muted)]"}`} role={error ? "alert" : undefined}>{error ?? hint}</div>}
    </div>
  );
}
