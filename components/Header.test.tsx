import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "./Header";

vi.mock("next/navigation", () => ({ usePathname: () => "/projects" }));

const expectedNavigation = [
  ["首頁", "/"], ["專案", "/projects"], ["工具", "/tools"],
  ["筆記與觀點", "/notes"], ["關於我", "/about"], ["聯絡", "/contact"],
];

describe("Header", () => {
  it("renders the new brand and all six centralized destinations in order", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "JK Space" })).toHaveAttribute("href", "/");
    expect(screen.queryByText(/JK Space News/)).not.toBeInTheDocument();
    const links = within(screen.getByRole("navigation", { name: "主導覽" })).getAllByRole("link");
    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual(expectedNavigation);
  });

  it("announces and controls the mobile menu state and closes after choosing a destination", () => {
    render(<Header />);
    const toggle = screen.getByRole("button", { name: "開啟選單" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const menuId = toggle.getAttribute("aria-controls");
    expect(menuId).toBeTruthy();
    expect(document.getElementById(menuId!)).not.toBeVisible();

    fireEvent.click(toggle);
    expect(toggle).toHaveAccessibleName("關閉選單");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("navigation", { name: "行動版主導覽" });
    expect(menu).toHaveAttribute("id", menuId);
    expect(within(menu).getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")])).toEqual(expectedNavigation);
    const destination = within(menu).getByRole("link", { name: "專案" });
    destination.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(destination);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(menu).not.toBeVisible();
  });
});
