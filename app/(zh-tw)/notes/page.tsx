import { NotesPage } from "@/components/pages/NotesPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCALES } from "@/lib/i18n/locales";
import { buildLocalizedMetadata } from "@/lib/seo";

const dictionary = getDictionary("zh-TW");
export const metadata = buildLocalizedMetadata({ locale: "zh-TW", pathname: "/notes", title: dictionary.collections.notesTitle, description: "JK Space 的原創工程筆記、AI 與自動化、專案紀錄與新聞觀點。", availableLocales: LOCALES });
interface Props { searchParams: Promise<{ type?: string | string[] }> }
export default async function TraditionalNotesRoute({ searchParams }: Props) { return NotesPage({ locale: "zh-TW", searchParams }); }
