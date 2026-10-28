import type { ReactNode } from "react";

interface EditorialSectionHeadingProps {
  index: string;
  title: string;
  action?: ReactNode;
}

export function EditorialSectionHeading({ index, title, action }: EditorialSectionHeadingProps) {
  return (
    <header className="editorial-section-heading v2-section-heading">
      <span className="editorial-index v2-section-heading__index" aria-hidden="true">{index}</span>
      <h2>{title}</h2>
      {action && <div className="editorial-section-heading__action v2-section-heading__action">{action}</div>}
    </header>
  );
}
