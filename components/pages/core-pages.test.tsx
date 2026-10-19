import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "./HomePage";
import { AboutPage } from "./AboutPage";
import { ContactPage } from "./ContactPage";
import { PrivacyPage } from "./PrivacyPage";
import { NotFoundPage } from "./NotFoundPage";
import type { Locale } from "@/lib/i18n/locales";

afterEach(() => vi.unstubAllEnvs());

describe.each([
  ["zh-TW", "把工程上的麻煩事，做成好用的工具。", "/projects"],
  ["zh-CN", "把工程中的麻烦事，做成好用的工具。", "/zh-cn/projects"],
  ["en", "Turn difficult engineering work into useful tools.", "/en/projects"],
] as const)("%s core pages", (locale, tagline, projectsHref) => {
  it("renders a complete localized home with locale-preserving next steps", async () => {
    const { container } = render(await HomePage({ locale }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(tagline);
    expect(screen.getByRole("link", { name: locale === "en" ? "View projects" : locale === "zh-CN" ? "查看项目" : "查看專案" })).toHaveAttribute("href", projectsHref);
    expect(screen.getAllByRole("region")).toHaveLength(7);
    for (const section of screen.getAllByRole("region")) {
      expect(within(section).getAllByRole("heading")[0]).not.toBeEmptyDOMElement();
    }
    if (locale === "en") expect(container).not.toHaveTextContent("把工程上的麻煩事");
  });

  it("renders About, Contact, Privacy, and NotFound in the active language", () => {
    const pages = [
      <AboutPage key="about" locale={locale as Locale} />,
      <ContactPage key="contact" locale={locale as Locale} />,
      <PrivacyPage key="privacy" locale={locale as Locale} />,
      <NotFoundPage key="not-found" locale={locale as Locale} />,
    ];
    for (const page of pages) {
      const { container, unmount } = render(page);
      expect(container.querySelector("h1")).not.toBeEmptyDOMElement();
      expect(container.querySelectorAll("section").length).toBeGreaterThan(0);
      if (locale === "en") expect(container).not.toHaveTextContent(/關於我|聯絡我|隱私權政策|頁面不存在/);
      unmount();
    }
  });
});

it("keeps English About and Privacy internal links under /en", () => {
  const { unmount } = render(<AboutPage locale="en" />);
  expect(screen.getByRole("link", { name: "View projects" })).toHaveAttribute("href", "/en/projects");
  expect(screen.getByRole("link", { name: "Contact me" })).toHaveAttribute("href", "/en/contact");
  unmount();
  render(<PrivacyPage locale="en" />);
  expect(screen.getByRole("link", { name: "contact page" })).toHaveAttribute("href", "/en/contact");
});

it.each([
  ["en", /PCB test-point comparison tool.*Traditional Chinese original/],
  ["zh-CN", /PCB 测试点自动比对工具.*繁体中文原文/],
] as const)("links %s About copy to the published original until its translation is published", (locale, linkName) => {
  vi.stubEnv("CONTENT_PREVIEW", "0");
  render(<AboutPage locale={locale} />);
  expect(screen.getByRole("link", { name: linkName })).toHaveAttribute(
    "href",
    "/projects/pcb-test-point-comparison",
  );
});

it.each([
  ["en", "PCB test-point comparison tool", "/en/projects/pcb-test-point-comparison"],
  ["zh-CN", "PCB 测试点自动比对工具", "/zh-cn/projects/pcb-test-point-comparison"],
] as const)("links %s About copy to reviewed translations only in Preview", (locale, linkName, href) => {
  vi.stubEnv("CONTENT_PREVIEW", "1");
  render(<AboutPage locale={locale} />);
  expect(screen.getByRole("link", { name: linkName })).toHaveAttribute("href", href);
});
