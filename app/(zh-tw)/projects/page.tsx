import { ProjectsPage } from "@/components/pages/ProjectsPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({ route: "/projects", title: "專案", description: "JK Space 的工程案例：記錄實際問題、角色、限制、關鍵決策與成果。" });
interface Props { searchParams: Promise<{ area?: string; status?: string }> }
export default async function TraditionalProjectsRoute({ searchParams }: Props) { return ProjectsPage({ locale: "zh-TW", searchParams }); }
