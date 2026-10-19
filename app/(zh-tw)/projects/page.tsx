import { ProjectsPage } from "@/components/pages/ProjectsPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCALES } from "@/lib/i18n/locales";
import { buildLocalizedMetadata } from "@/lib/seo";

const dictionary = getDictionary("zh-TW");
export const metadata = buildLocalizedMetadata({ locale: "zh-TW", pathname: "/projects", title: dictionary.collections.projectsTitle, description: "JK Space 的工程案例：記錄實際問題、角色、限制、關鍵決策與成果。", availableLocales: LOCALES });
interface Props { searchParams: Promise<{ area?: string; status?: string }> }
export default async function TraditionalProjectsRoute({ searchParams }: Props) { return ProjectsPage({ locale: "zh-TW", searchParams }); }
