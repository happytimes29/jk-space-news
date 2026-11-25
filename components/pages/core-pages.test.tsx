import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomePage } from "./HomePage";
import { AboutPage } from "./AboutPage";
import { ContactSection } from "./ContactSection";
import { ToolsPage } from "./ToolsPage";
import { PrivacyPage } from "./PrivacyPage";
import { NotFoundPage } from "./NotFoundPage";
import type { Locale } from "@/lib/i18n/locales";

describe.each([
  ["zh-TW", /工程問題，\s*動手解。/, "/projects", "閱讀專案案例", "/projects/pcb-test-point-comparison"],
  ["zh-CN", /工程问题，\s*动手解。/, "/zh-cn/projects", "阅读项目案例", "/zh-cn/projects/pcb-test-point-comparison"],
  ["en", /Engineering problems\.\s*Hands-on answers\./, "/en/projects", "Read the case study", "/en/projects/pcb-test-point-comparison"],
] as const)("%s core pages", (locale, tagline, projectsHref, caseLabel, caseHref) => {
  it("renders a complete localized home with locale-preserving next steps", async () => {
    const { container } = render(await HomePage({ locale }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(tagline);
    const localePrefix = projectsHref.slice(0, -"/projects".length);
    expect(container.querySelector(`a[href="${projectsHref}"]`)).toBeVisible();
    expect(container.querySelector(`a[href="${localePrefix}/tools"]`)).toBeVisible();
    expect(container.querySelectorAll(`a[href="${localePrefix}/notes"]`)).toHaveLength(2);
    const reading = container.querySelector<HTMLElement>("#reading")!;
    expect(within(reading).getByRole("link", { name: caseLabel })).toHaveAttribute("href", caseHref);
    expect(reading.querySelector('a[href="/tools/pcb-test-point/app"]')).toBeVisible();
    for (const section of screen.getAllByRole("region")) {
      expect(within(section).getAllByRole("heading")[0]).not.toBeEmptyDOMElement();
    }
    if (locale === "en") expect(container).not.toHaveTextContent("把工程上的麻煩事");
  });

  it("renders About, Privacy, and NotFound in the active language", () => {
    const pages = [
      <AboutPage key="about" locale={locale as Locale} />,
      <PrivacyPage key="privacy" locale={locale as Locale} />,
      <NotFoundPage key="not-found" locale={locale as Locale} />,
    ];
    for (const page of pages) {
      const { container, unmount } = render(page);
      expect(container.firstElementChild).toHaveClass("v2-editorial-page", "v2-utility");
      expect(container.querySelectorAll("h1")).toHaveLength(1);
      expect(container.querySelector("h1")).not.toBeEmptyDOMElement();
      expect(container.querySelectorAll("section").length).toBeGreaterThan(0);
      if (locale === "en") expect(container).not.toHaveTextContent(/關於我|聯絡我|隱私權政策|頁面不存在/);
      unmount();
    }
  });
});

it.each([
  ["zh-TW", "/", "/projects", "/tools", "/notes"],
  ["zh-CN", "/zh-cn", "/zh-cn/projects", "/zh-cn/tools", "/zh-cn/notes"],
  ["en", "/en", "/en/projects", "/en/tools", "/en/notes"],
] as const)("renders a static four-link %s recovery path", (locale, ...hrefs) => {
  const { container } = render(<NotFoundPage locale={locale} />);
  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(4);
  expect(links.map((link) => link.getAttribute("href"))).toEqual(hrefs);
  expect(container.querySelector("canvas, video")).toBeNull();
});

it("uses only the configured contact destinations", () => {
  const { container } = render(<ContactSection locale="en" />);
  expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
    "https://github.com/happytimes29",
    "https://t.me/JK_Sapce",
  ]);
  expect(container).not.toHaveTextContent(["jk", "example.com"].join("@"));
});

it("makes the contact section reachable on the About page", () => {
  const { container } = render(<AboutPage locale="en" />);
  const section = container.querySelector<HTMLElement>("#contact");
  expect(section).toBeVisible();
  expect(within(section!).getByRole("link", { name: "Telegram" })).toHaveAttribute("href", "https://t.me/JK_Sapce");
});

it("keeps English About and Privacy internal links under /en", () => {
  const { unmount } = render(<AboutPage locale="en" />);
  expect(screen.getByRole("link", { name: "View projects" })).toHaveAttribute("href", "/en/projects");
  expect(screen.getByRole("link", { name: "Contact me" })).toHaveAttribute("href", "#contact");
  unmount();
  render(<PrivacyPage locale="en" />);
  expect(screen.getByRole("link", { name: "contact page" })).toHaveAttribute("href", "/en/about#contact");
});

it("lists tool details on the Tools page without duplicating the project index", async () => {
  render(await ToolsPage({ locale: "en" }));
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tools");
  expect(screen.getByRole("link", { name: "PCB Test Point Comparison Tool" })).toHaveAttribute("href", "/en/tools/pcb-test-point");
  expect(screen.queryByRole("region", { name: "Projects" })).not.toBeInTheDocument();
});

it.each([
  ["en", "PCB test-point comparison tool", "/en/projects/pcb-test-point-comparison"],
  ["zh-CN", "PCB 测试点自动比对工具", "/zh-cn/projects/pcb-test-point-comparison"],
] as const)("links %s About copy to its published translation", (locale, linkName, href) => {
  render(<AboutPage locale={locale} />);
  expect(screen.getByRole("link", { name: linkName })).toHaveAttribute("href", href);
});

it.each([
  ["en", /PCB test-point comparison tool.*Traditional Chinese original/],
  ["zh-CN", /PCB 测试点自动比对工具.*繁体中文原文/],
] as const)("falls back from %s About copy to a labeled original when a future translation is unavailable", (locale, linkName) => {
  render(<AboutPage locale={locale} featuredProjectAvailable={false} />);
  expect(screen.getByRole("link", { name: linkName })).toHaveAttribute("href", "/projects/pcb-test-point-comparison");
});
