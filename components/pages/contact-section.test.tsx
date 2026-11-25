import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as siteConfig from "@/lib/site-config";
import { ContactSection } from "./ContactSection";

afterEach(() => vi.restoreAllMocks());

describe("ContactSection optional channels", () => {
  it("omits the channels section and heading when no contacts are enabled", () => {
    const config = siteConfig.getSiteConfig("en");
    vi.spyOn(siteConfig, "getSiteConfig").mockReturnValue({ ...config, contacts: [] });
    render(<ContactSection locale="en" />);
    expect(screen.getByRole("heading", { level: 2 })).toBeVisible();
    expect(screen.queryByRole("region", { name: "Contact channels" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Contact channels" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("keeps the complete channels section when contacts are configured", () => {
    render(<ContactSection locale="en" />);
    expect(screen.getByRole("region", { name: "Contact channels" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Contact channels" })).toBeVisible();
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/happytimes29");
  });
});
