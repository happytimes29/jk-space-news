import type { WorkbenchMode } from "./workbench-state";

export function ModeSwitcher({ mode, quickLabel, replacementLabel, onChange }: {
  mode: WorkbenchMode;
  quickLabel: string;
  replacementLabel: string;
  onChange: (mode: WorkbenchMode) => void;
}) {
  return (
    <div className="datasheet-mode-switcher" role="tablist">
      <button type="button" role="tab" aria-selected={mode === "quick-read"} onClick={() => onChange("quick-read")}>{quickLabel}</button>
      <button type="button" role="tab" aria-selected={mode === "replacement"} onClick={() => onChange("replacement")}>{replacementLabel}</button>
    </div>
  );
}

