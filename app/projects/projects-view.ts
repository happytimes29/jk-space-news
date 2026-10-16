import type { ProjectArea, ProjectItem } from "@/lib/projects";

export const projectAreaLabels: Record<ProjectArea, string> = {
  hardware: "硬體", automation: "AI 自動化", product: "工具產品",
};

export function filterProjects(items: ProjectItem[], { area, status }: { area?: string; status?: string }): ProjectItem[] {
  return items
    .filter((item) => (!area || item.areas.some((value) => value === area)) && (!status || item.status === status))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}
