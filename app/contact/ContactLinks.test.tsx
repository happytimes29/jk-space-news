import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContactPage from "./page";
import { ContactLinks } from "./ContactLinks";

describe("contact page", () => {
  // Catches reintroducing unconfigured contacts or non-actionable channel cards.
  it("offers only the enabled contact destinations as working links", () => {
    render(<ContactPage />);

    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "https://github.com/happytimes29",
      "https://t.me/JK_Sapce",
    ]);
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
  });

  it("does not expose the legacy fake email address", () => {
    const { container } = render(<ContactPage />);

    expect(container).not.toHaveTextContent(["jk", "example.com"].join("@"));
  });
});

describe("ContactLinks", () => {
  // Catches rendering empty contact cards when all channels are disabled.
  it("renders nothing when no contact links are enabled", () => {
    const { container } = render(<ContactLinks links={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  // Catches hardcoded destinations and unsafe external tab navigation.
  it("renders supplied GitHub and Telegram links with safe external navigation", () => {
    render(<ContactLinks links={[
      { label: "Source code", href: "https://github.com/happytimes29", kind: "github" },
      { label: "Message JK", href: "https://t.me/JK_Sapce", kind: "telegram" },
    ]} />);

    for (const [label, href] of [
      ["Source code", "https://github.com/happytimes29"],
      ["Message JK", "https://t.me/JK_Sapce"],
    ]) {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("keeps a configured mail address as a mail link in the current tab", () => {
    render(<ContactLinks links={[
      { label: "Email", href: "mailto:hello@example.org", kind: "email" },
    ]} />);

    const link = screen.getByRole("link", { name: "Email" });
    expect(link).toHaveAttribute("href", "mailto:hello@example.org");
    expect(link).not.toHaveAttribute("target");
  });
});
