import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";
import { siteConfig } from "@/lib/site-config";

describe("Footer", () => {
  it("shows the new brand, tagline, trust pages, and real contact destinations", () => {
    const { container } = render(<Footer />);
    expect(container).not.toHaveTextContent("JK Space News");
    expect(screen.getByRole("link", { name: "JK Space" })).toHaveAttribute("href", "/");
    expect(screen.getByText("把工程上的麻煩事，做成好用的工具。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "關於我" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "隱私權政策" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "聯絡" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/happytimes29");
    expect(screen.getByRole("link", { name: "Telegram" })).toHaveAttribute("href", "https://t.me/JK_Sapce");
    expect(screen.queryByLabelText(/Email|LinkedIn|YouTube|TikTok|Threads/)).not.toBeInTheDocument();
  });

  it("emits no contact elements when contacts are not configured", () => {
    const contacts = siteConfig.contacts;
    try {
      siteConfig.contacts = [];
      const { container } = render(<Footer />);
      expect(screen.queryByRole("link", { name: /GitHub|Telegram|Email/ })).not.toBeInTheDocument();
      expect(container.querySelector('a[href^="http"], a[href^="mailto:"]')).toBeNull();
      expect(screen.queryByLabelText("聯絡管道")).not.toBeInTheDocument();
    } finally {
      siteConfig.contacts = contacts;
    }
  });
});
