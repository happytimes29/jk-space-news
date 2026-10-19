import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";
import { siteConfig } from "@/lib/site-config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSiteConfig } from "@/lib/site-config";

const props = { locale: "en" as const, dictionary: getDictionary("en"), config: getSiteConfig("en") };

describe("Footer", () => {
  it("shows the new brand, tagline, trust pages, and real contact destinations", () => {
    const { container } = render(<Footer {...props} />);
    expect(container).not.toHaveTextContent("JK Space News");
    expect(screen.getByRole("link", { name: "JK Space" })).toHaveAttribute("href", "/en");
    expect(screen.getByText("Turn difficult engineering work into useful tools.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/en/about");
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/en/privacy");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/en/contact");
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/happytimes29");
    expect(screen.getByRole("link", { name: "Telegram" })).toHaveAttribute("href", "https://t.me/JK_Sapce");
    expect(screen.queryByLabelText(/Email|LinkedIn|YouTube|TikTok|Threads/)).not.toBeInTheDocument();
  });

  it("emits no contact elements when contacts are not configured", () => {
    const contacts = siteConfig.contacts;
    try {
      siteConfig.contacts = [];
      const config = getSiteConfig("en");
      config.contacts = [];
      const { container } = render(<Footer locale="en" dictionary={getDictionary("en")} config={config} />);
      expect(screen.queryByRole("link", { name: /GitHub|Telegram|Email/ })).not.toBeInTheDocument();
      expect(container.querySelector('a[href^="http"], a[href^="mailto:"]')).toBeNull();
      expect(screen.queryByLabelText("Contact channels")).not.toBeInTheDocument();
    } finally {
      siteConfig.contacts = contacts;
    }
  });
});
