import { notFound } from "next/navigation";
import { EngineeringToolShell } from "./EngineeringToolShell";
import { ToolAppRenderer } from "./ToolAppRenderer";
import { getEngineeringToolDefinition } from "@/lib/engineering/tool-registry";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { getToolBySlug } from "@/lib/tools";
import type { ContentVisibility } from "@/lib/content/translations";

export async function EngineeringToolAppPage({ locale, slug, visibility }: { locale: Locale; slug: string; visibility: ContentVisibility }) {
  const definition = getEngineeringToolDefinition(slug);
  const tool = definition ? await getToolBySlug(slug, { locale, visibility }) : null;
  if (!definition || !tool || !tool.localizedApp) notFound();
  const shell = getDictionary(locale).engineeringTools.shell;
  return <EngineeringToolShell
    title={tool.title}
    description={tool.summary}
    backHref={localePath(locale, `/tools/${tool.slug}`)}
    backLabel={shell.backLabel}
    privacy={tool.privacy}
    application={<ToolAppRenderer slug={definition.slug} locale={locale} />}
  />;
}
