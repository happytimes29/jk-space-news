import type { ProjectStatus } from "@/lib/projects";
import type { ToolStatus } from "@/lib/tools";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

export function StatusBadge({ status, locale }: { status: ProjectStatus | ToolStatus; locale: Locale }) {
  const copy = getDictionary(locale).status;
  const labels: Record<ProjectStatus | ToolStatus, string> = {
    active: copy.active, completed: copy.completed, maintained: copy.maintained, archived: copy.archived,
    available: copy.available, experimental: copy.experimental, maintenance: copy.maintenance,
  };
  return (
    <span className="editorial-status">
      {labels[status]}
    </span>
  );
}
