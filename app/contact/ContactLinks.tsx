import type { ContactLink } from "@/lib/site-config";
import { Github, Mail, Send, ArrowUpRight } from "lucide-react";

const contactIcons = { github: Github, telegram: Send, email: Mail };

export function ContactLinks({ links }: { links: ContactLink[] }) {
  if (links.length === 0) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {links.map(({ label, href, kind }) => {
        const Icon = contactIcons[kind];
        const external = kind !== "email";

        return (
          <li key={kind}>
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
            >
              <Icon size={20} className="shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
              <span className="min-w-0 flex-1 break-words font-medium">{label}</span>
              {external && <ArrowUpRight size={16} className="shrink-0" aria-hidden="true" />}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
