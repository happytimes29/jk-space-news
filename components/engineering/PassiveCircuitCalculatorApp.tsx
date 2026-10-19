"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { decodeToolState, encodeToolState } from "@/lib/engineering/query-state";
import { AttenuatorMode } from "./passive/AttenuatorMode";
import { DividerMode } from "./passive/DividerMode";
import { ReactiveMode } from "./passive/ReactiveModes";
import type { PassiveCircuitCopy, PassiveMode } from "./passive/types";

export type { PassiveCircuitCopy } from "./passive/types";

const MODES: Array<{ mode: PassiveMode; label: keyof PassiveCircuitCopy }> = [
  { mode: "divider", label: "dividerTab" },
  { mode: "rc", label: "rcTab" },
  { mode: "lc", label: "lcTab" },
  { mode: "rlc", label: "rlcTab" },
  { mode: "reactance", label: "reactanceTab" },
  { mode: "attenuator", label: "attenuatorTab" },
];
const STATE_KEYS = ["mode", "vin", "target", "series", "load", "r", "l", "c", "f", "circuit", "attenuation", "z0", "topology"] as const;

function savedState() {
  if (typeof window === "undefined") return {};
  return decodeToolState(window.location.search, STATE_KEYS);
}

function isMode(value: string | undefined): value is PassiveMode {
  return MODES.some(({ mode }) => mode === value);
}

export function PassiveCircuitCalculatorApp({ copy }: { copy: PassiveCircuitCopy }) {
  const initial = useMemo(savedState, []);
  const [mode, setMode] = useState<PassiveMode>(isMode(initial.mode) ? initial.mode : "divider");
  const [activeState, setActiveState] = useState<Record<string, string | number | boolean>>({});
  const updateState = useCallback((state: Record<string, string | number | boolean>) => setActiveState(state), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = encodeToolState({ mode, ...activeState });
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?${query}${window.location.hash}`);
  }, [activeState, mode]);

  function selectMode(next: PassiveMode) {
    setActiveState({});
    setMode(next);
  }

  const modeInitial = initial.mode === mode ? initial : {};
  return <div className="space-y-6">
    <div role="tablist" className="flex gap-2 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-2">
      {MODES.map((item) => <button key={item.mode} type="button" role="tab" aria-selected={mode === item.mode} onClick={() => selectMode(item.mode)} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${mode === item.mode ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)]"}`}>{copy[item.label]}</button>)}
    </div>
    {mode === "divider" && <DividerMode copy={copy} initial={modeInitial} onStateChange={updateState} />}
    {(mode === "rc" || mode === "lc" || mode === "rlc" || mode === "reactance") && <ReactiveMode key={mode} mode={mode} copy={copy} initial={modeInitial} onStateChange={updateState} />}
    {mode === "attenuator" && <AttenuatorMode copy={copy} initial={modeInitial} onStateChange={updateState} />}
  </div>;
}
