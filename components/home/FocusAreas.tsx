import Link from "next/link";
import type { SiteDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";

export function FocusAreas({ locale, dictionary }: { locale: Locale; dictionary: SiteDictionary }) {
  const areas = [
    { title: dictionary.home.focusHardwareTitle, summary: dictionary.home.focusHardwareText, href: "/projects?area=hardware" },
    { title: dictionary.home.focusAutomationTitle, summary: dictionary.home.focusAutomationText, href: "/projects?area=automation" },
    { title: dictionary.home.focusProductTitle, summary: dictionary.home.focusProductText, href: "/projects?area=product" },
  ];

  return (
    <section aria-labelledby="focus-title" className="rounded-[2.25rem] bg-[#e9edff] px-6 py-10 text-[#171a28] sm:px-10 sm:py-14 lg:px-14 lg:py-16 dark:bg-[#18203a] dark:text-[#f5f7ff]">
      <div className="grid gap-10 lg:grid-cols-[minmax(13rem,0.45fr)_minmax(0,1.55fr)] lg:gap-16">
        <h2 id="focus-title" className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">{dictionary.home.focusTitle}</h2>
        <div className="grid gap-9 md:grid-cols-3">
          {areas.map((area) => (
            <Link key={area.href} href={localePath(locale, area.href)} className="group min-w-0">
              <h3 className="text-2xl font-semibold leading-tight tracking-[-0.03em] transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300">{area.title}</h3>
              <p className="mt-5 text-base leading-8 text-[#505975] dark:text-[#b9c3e8]">{area.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
