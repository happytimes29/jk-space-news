import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";

export function FocusAreas({ locale, dictionary }: { locale: Locale; dictionary: SiteDictionary }) {
  const areas = [
    { title: dictionary.home.focusHardwareTitle, summary: dictionary.home.focusHardwareText, href: "/projects?area=hardware" },
    { title: dictionary.home.focusAutomationTitle, summary: dictionary.home.focusAutomationText, href: "/projects?area=automation" },
    { title: dictionary.home.focusProductTitle, summary: dictionary.home.focusProductText, href: "/projects?area=product" },
  ];
  return (
    <section aria-labelledby="focus-title" className="space-y-6">
      <h2 id="focus-title" className="text-2xl font-semibold tracking-tight">{dictionary.home.focusTitle}</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {areas.map((area, index) => (
          <Link key={area.href} href={localePath(locale, area.href)} className="group min-w-0 border-t border-zinc-300 py-5 dark:border-zinc-700">
            <span className="font-mono text-xs text-blue-700 dark:text-blue-300">0{index + 1}</span>
            <h3 className="mt-4 flex items-start justify-between gap-3 text-lg font-semibold">
              {area.title}<ArrowUpRight aria-hidden="true" size={18} className="mt-1 shrink-0 text-blue-700 dark:text-blue-300" />
            </h3>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{area.summary}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
