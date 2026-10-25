import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContactPage from "@/app/(zh-tw)/contact/page";
import { ContactLinks } from "./ContactLinks";

describe("contact page", () => {
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
  it("renders nothing when no contact links are enabled", () => {
    const { container } = render(<ContactLinks links={[]} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders supplied GitHub and Telegram links with the editorial index and safe navigation", () => {
    const { container } = render(<ContactLinks links={[
      { label: "Source code", href: "https://github.com/happytimes29", kind: "github" },
      { label: "Message JK", href: "https://t.me/JK_Sapce", kind: "telegram" },
    ]} />);

    expect(container.firstElementChild).toHaveClass("editorial-contact-links");
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
