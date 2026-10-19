import type { ProjectArea, ProjectItem, ProjectStatus } from "@/lib/projects";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

export function projectAreaLabels(locale: Locale): Record<ProjectArea, string> {
  const copy = getDictionary(locale).collections;
  return { hardware: copy.areaHardware, automation: copy.areaAutomation, product: copy.areaProduct };
}

export function projectStatusLabels(locale: Locale): Record<ProjectStatus, string> {
  const copy = getDictionary(locale).status;
  return { active: copy.active, completed: copy.completed, maintained: copy.maintained, archived: copy.archived };
}

export function filterProjects(items: ProjectItem[], { area, status }: { area?: string; status?: string }): ProjectItem[] {
  return items
    .filter((item) => (!area || item.areas.some((value) => value === area)) && (!status || item.status === status))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}
