import type { ContactLink } from "@/lib/site-config";
import { Github, Mail, Send, ArrowUpRight } from "lucide-react";

const contactIcons = { github: Github, telegram: Send, email: Mail };

export function ContactLinks({ links }: { links: ContactLink[] }) {
  if (links.length === 0) return null;

  return (
    <ul className="editorial-contact-links">
      {links.map(({ label, href, kind }) => {
        const Icon = contactIcons[kind];
        const external = kind !== "email";

        return (
          <li key={kind}>
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="editorial-contact-link"
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
              {external && <ArrowUpRight size={16} aria-hidden="true" />}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
