import type { ProjectStatus } from "@/lib/projects";
import type { ToolStatus } from "@/lib/tools";

const labels: Record<ProjectStatus | ToolStatus, string> = {
  active: "進行中", completed: "已完成", maintained: "維護中", archived: "已封存",
  available: "可使用", experimental: "實驗中", maintenance: "維護中",
};

export function StatusBadge({ status }: { status: ProjectStatus | ToolStatus }) {
  return (
    <span className="inline-flex rounded-full border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
      {labels[status]}
    </span>
  );
}
