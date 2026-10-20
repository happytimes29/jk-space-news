"use client";

import type { KeyboardEvent } from "react";

export interface AttenuatorTopologyPickerProps {
  value: "tee" | "pi";
  onChange: (value: "tee" | "pi") => void;
  label: string;
  hint: string;
  teeLabel: string;
  piLabel: string;
}

function TopologySketch({ topology }: { topology: "tee" | "pi" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 180 72" className="h-16 w-full" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {topology === "tee" ? (
        <path d="M8 24h24l8-8 12 16 12-16 12 16 8-8h24l8-8 12 16 12-16 12 16 8-8h24M96 24v12l-8 7 16 10-16 10 8 5" />
      ) : (
        <path d="M8 24h52m0 0h20l8-8 12 16 12-16 12 16 8-8h40M60 24v12l-8 7 16 10-16 10 8 5M132 24v12l-8 7 16 10-16 10 8 5" />
      )}
    </svg>
  );
}

export function AttenuatorTopologyPicker({ value, onChange, label, hint, teeLabel, piLabel }: AttenuatorTopologyPickerProps) {
  const choices = [
    { value: "tee" as const, label: teeLabel },
    { value: "pi" as const, label: piLabel },
  ];

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, choice: "tee" | "pi") {
    if (event.key === "Enter") {
      event.preventDefault();
      if (choice !== value) onChange(choice);
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "ArrowRight" || event.key === "ArrowDown" ? "pi" : "tee";
    if (next !== value) onChange(next);
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <p className="text-xs text-[var(--color-muted)]">{hint}</p>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-3">
        {choices.map((choice) => {
          const selected = value === choice.value;
          return (
            <label key={choice.value} data-testid={`topology-card-${choice.value}`} data-selected={selected ? "true" : "false"} className={`relative cursor-pointer rounded-xl border-2 p-3 transition-colors focus-within:ring-2 focus-within:ring-[var(--color-accent)] focus-within:ring-offset-2 ${selected ? "border-[var(--color-accent)] bg-[var(--color-card-hover)]" : "border-[var(--color-border)] bg-[var(--color-input-bg)]"}`}>
              <input className="sr-only" type="radio" name="attenuator-topology" value={choice.value} checked={selected} onChange={() => onChange(choice.value)} onKeyDown={(event) => handleKeyDown(event, choice.value)} />
              <TopologySketch topology={choice.value} />
              <span className="flex items-center justify-between text-sm font-semibold">{choice.label}<span aria-hidden="true">{selected ? "✓" : "○"}</span></span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
