import { NotesPage } from "@/components/pages/NotesPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({ route: "/notes", title: "筆記與觀點", description: "JK Space 的原創工程筆記、AI 與自動化、專案紀錄與新聞觀點。" });
interface Props { searchParams: Promise<{ type?: string | string[] }> }
export default async function TraditionalNotesRoute({ searchParams }: Props) { return NotesPage({ locale: "zh-TW", searchParams }); }
