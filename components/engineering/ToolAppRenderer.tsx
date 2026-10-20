import { EngineeringConverterApp } from "./EngineeringConverterApp";
import { PassiveCircuitCalculatorApp } from "./PassiveCircuitCalculatorApp";
import { RfQuickCalculatorApp } from "./RfQuickCalculatorApp";
import { SmithChartApp, type SmithChartCopy } from "./SmithChartApp";
import { TransmissionLineApp, type TransmissionLineCopy } from "./TransmissionLineApp";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { EngineeringToolSlug } from "@/lib/engineering/tool-registry";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";

export function ToolAppRenderer({ slug, locale }: { slug: EngineeringToolSlug; locale: Locale }) {
  const copy = getDictionary(locale).engineeringTools;
  switch (slug) {
    case "engineering-converter": return <EngineeringConverterApp copy={copy.converter} />;
    case "passive-circuit-calculator": return <PassiveCircuitCalculatorApp copy={copy.passive} />;
    case "rf-calculator": return <RfQuickCalculatorApp copy={copy.rf} smithChartHref={localePath(locale, "/tools/smith-chart/app")} />;
    case "smith-chart": return <SmithChartApp copy={(copy as typeof copy & { smith: SmithChartCopy }).smith} />;
    case "transmission-line": return <TransmissionLineApp copy={(copy as typeof copy & { transmissionLine: TransmissionLineCopy }).transmissionLine} />;
  }
}
