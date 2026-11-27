import { Download } from "lucide-react";
import type { Locale } from "@/lib/i18n/locales";
import copyByLocale from "./weekly-review.json";

export function WeeklyReviewCard({ locale }: { locale: Locale }) {
  const copy = copyByLocale[locale];
  return (
    <aside className="v2-weekly-review" aria-labelledby="weekly-review">
      <h2 id="weekly-review">{copy.title}</h2>
      <p>{copy.description}</p>
      <h3>{copy.exampleLabel}</h3>
      <dl>
        {copy.fields.map((field, index) => (
          <div key={field}>
            <dt>{field}</dt>
            <dd>{copy.example[index]}</dd>
          </div>
        ))}
      </dl>
      <div className="v2-weekly-review__download">
        <a className="signal-jump-link" href={`/downloads/weekly-action-review-${locale.toLowerCase()}.xlsx`} download>
          <Download aria-hidden="true" size={17} />{copy.download}
        </a>
        <p>{copy.downloadNote}</p>
      </div>
    </aside>
  );
}
