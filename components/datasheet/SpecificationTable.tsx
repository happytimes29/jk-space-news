import type { Locale } from "@/lib/i18n/locales";
import type { SpecificationCategory, SpecificationValue } from "@/lib/datasheet/types";
import { SourceEvidencePanel } from "./SourceEvidencePanel";

const CATEGORY_ORDER: SpecificationCategory[] = ["absolute-maximum", "operating", "typical", "package", "identity"];
const LABELS: Record<Locale, Record<SpecificationCategory, string>> = {
  "zh-TW": { "absolute-maximum": "絕對最大值", operating: "操作條件", typical: "典型特性", package: "封裝與機構", identity: "識別資料" },
  "zh-CN": { "absolute-maximum": "绝对最大值", operating: "操作条件", typical: "典型特性", package: "封装与机构", identity: "识别资料" },
  en: { "absolute-maximum": "Absolute maximum", operating: "Operating conditions", typical: "Typical characteristics", package: "Package and mechanical", identity: "Identity" },
};

export function SpecificationTable({ locale, specifications, file }: { locale: Locale; specifications: readonly SpecificationValue[]; file?: File }) {
  const groups = new Map<SpecificationCategory, SpecificationValue[]>();
  for (const specification of specifications) {
    const category = specification.category ?? "operating";
    groups.set(category, [...(groups.get(category) ?? []), specification]);
  }
  return <div className="datasheet-specification-groups">
    {CATEGORY_ORDER.filter((category) => groups.has(category)).map((category) => <section key={category}>
      <h3>{LABELS[locale][category]}</h3>
      <div className="datasheet-specification-table" role="table" aria-label={LABELS[locale][category]}>
        {groups.get(category)?.map((specification) => <div role="row" key={`${category}-${specification.field}`} className={`datasheet-specification-row is-${specification.status}`}>
          <div role="cell"><code>{specification.field}</code></div>
          <div role="cell"><strong>{specification.rawValue}</strong>{specification.conditions.length > 0 && <small>{specification.conditions.join(" · ")}</small>}</div>
          <div role="cell"><span>{specification.status}</span><SourceEvidencePanel locale={locale} evidence={specification.evidence} file={file} /></div>
        </div>)}
      </div>
    </section>)}
  </div>;
}

