import Link from "next/link";
import type { ReactNode } from "react";

export interface EngineeringToolShellProps {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  privacy: string;
  application: ReactNode;
}

export function EngineeringToolShell({ title, description, backHref, backLabel, privacy, application }: EngineeringToolShellProps) {
  return (
    <main className="engineering-app-page">
      <div className="engineering-app-shell">
        <nav aria-label={backLabel} className="engineering-app-shell__back">
          <Link href={backHref}>{backLabel}</Link>
        </nav>
        <header className="engineering-app-shell__intro">
          <div><p className="engineering-app-shell__kicker">Engineering utility / Local first</p><h1>{title}</h1></div>
          <div><p className="engineering-app-shell__summary">{description}</p><p className="engineering-app-shell__privacy">{privacy}</p></div>
        </header>
      </div>
      <section className="engineering-app" aria-label={title}>{application}</section>
    </main>
  );
}
