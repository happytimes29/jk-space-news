import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { track } from "@vercel/analytics";
import { OpenToolLink } from "./OpenToolLink";

// Analytics is the external event boundary; rendering and click behavior stay real.
vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

it("opens an internal app in the same tab and emits only its public slug", () => {
  render(<OpenToolLink slug="pcb-test-point" href="/tools/pcb-test-point/app" locale="zh-TW">開啟工具</OpenToolLink>);
  const link = screen.getByRole("link", { name: "開啟工具" });
  expect(link).toHaveClass("editorial-tool-cta");
  // Keep jsdom from navigating while preserving the component click handler.
  link.addEventListener("click", (event) => event.preventDefault());
  fireEvent.click(link);
  expect(link).toHaveAttribute("href", "/tools/pcb-test-point/app");
  expect(link).not.toHaveAttribute("target");
  expect(track).toHaveBeenCalledExactlyOnceWith("Open Tool", { slug: "pcb-test-point" });
});

it("prefixes localized application links with the active locale", () => {
  render(<OpenToolLink slug="engineering-converter" href="/tools/engineering-converter/app" locale="en" localized>Open tool</OpenToolLink>);
  expect(screen.getByRole("link", { name: "Open tool" })).toHaveAttribute("href", "/en/tools/engineering-converter/app");
});

it("opens external applications with safe new-tab attributes", () => {
  render(<OpenToolLink slug="external-tool" href="https://example.com/app" locale="zh-TW">外部工具</OpenToolLink>);
  const link = screen.getByRole("link", { name: "外部工具" });
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
});
