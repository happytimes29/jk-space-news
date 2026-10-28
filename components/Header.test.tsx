import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "./Header";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSiteConfig } from "@/lib/site-config";

vi.mock("next/navigation", () => ({ usePathname: () => "/en/projects", useRouter: () => ({ push: vi.fn() }) }));

const expectedNavigation = [
  ["Home", "/en"], ["Projects", "/en/projects"], ["Tools", "/en/tools"],
  ["Notes & Perspectives", "/en/notes"], ["About", "/en/about"], ["Contact", "/en/contact"],
];
const props = { locale: "en" as const, dictionary: getDictionary("en"), config: getSiteConfig("en"), availability: { "/projects": ["zh-TW", "zh-CN", "en"] as const } };

describe("Header", () => {
  it("renders the new brand and all six centralized destinations in order", () => {
    const { container } = render(<Header {...props} />);
    expect(container.firstElementChild).toHaveClass("site-header", "v2-site-header");
    expect(screen.getByRole("link", { name: "JK Space" })).toHaveAttribute("href", "/en");
    expect(screen.queryByText(/JK Space News/)).not.toBeInTheDocument();
    const links = within(screen.getByRole("navigation", { name: "Primary navigation" })).getAllByRole("link");
    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual(expectedNavigation);
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toHaveClass("v2-site-nav");
    expect(screen.getAllByRole("group", { name: "Choose a language" })).toHaveLength(1);
  });

  it("announces and controls the mobile menu state and closes after choosing a destination", () => {
    render(<Header {...props} />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const menuId = toggle.getAttribute("aria-controls");
    expect(menuId).toBeTruthy();
    expect(document.getElementById(menuId!)).not.toBeVisible();

    fireEvent.click(toggle);
    expect(toggle).toHaveAccessibleName("Close menu");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("navigation", { name: "Mobile primary navigation" });
    expect(menu).toHaveAttribute("id", menuId);
    expect(within(menu).getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")])).toEqual(expectedNavigation);
    const destination = within(menu).getByRole("link", { name: "Projects" });
    destination.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(destination);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(menu).not.toBeVisible();
  });
});
