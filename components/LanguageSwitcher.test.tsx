import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { TranslationAvailability } from "@/lib/content/translations";

const { push, currentPathname } = vi.hoisted(() => ({ push: vi.fn(), currentPathname: { value: "/about" } }));
vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname.value,
  useRouter: () => ({ push }),
}));

const allCore: TranslationAvailability = { "/about": ["zh-TW", "zh-CN", "en"] };

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    push.mockClear();
    currentPathname.value = "/about";
    window.history.replaceState({}, "", "/about");
    document.cookie = "jk-locale=; Max-Age=0; Path=/";
  });

  it("renders exact locale destinations and disables unavailable translations", () => {
    currentPathname.value = "/projects/private";
    render(<LanguageSwitcher locale="zh-TW" availability={{ "/projects/private": ["zh-TW", "en"] }} label="選擇語言" unavailableLabel="尚未翻譯" />);
    const group = screen.getByRole("group", { name: "選擇語言" });
    expect(within(group).getByRole("button", { name: "繁體中文" })).toHaveAttribute("aria-pressed", "true");
    expect(within(group).getByRole("button", { name: /简体中文/ })).toBeDisabled();
    expect(within(group).getByRole("button", { name: /简体中文/ })).toHaveAccessibleDescription("尚未翻譯");
    expect(within(group).getByRole("button", { name: "English" })).toBeEnabled();
  });

  it("preserves encoded pathname, query, and hash and stores only an explicit choice", () => {
    currentPathname.value = "/notes/%E6%B8%AC%E8%A9%A6";
    window.history.replaceState({}, "", "/notes/%E6%B8%AC%E8%A9%A6?type=engineering#result");
    const cookieSetter = vi.spyOn(Document.prototype, "cookie", "set");
    render(<LanguageSwitcher locale="zh-TW" availability={{ "/notes/%E6%B8%AC%E8%A9%A6": ["zh-TW", "en"] }} label="選擇語言" unavailableLabel="尚未翻譯" />);

    expect(push).not.toHaveBeenCalled();
    expect(cookieSetter).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "English" }));

    expect(cookieSetter).toHaveBeenCalledWith("jk-locale=en; Max-Age=31536000; Path=/; SameSite=Lax");
    expect(push).toHaveBeenCalledWith("/en/notes/%E6%B8%AC%E8%A9%A6?type=engineering#result");
    cookieSetter.mockRestore();
  });

  it("rebases an already-prefixed route without creating a duplicate prefix", () => {
    currentPathname.value = "/en/about";
    window.history.replaceState({}, "", "/en/about");
    render(<LanguageSwitcher locale="en" availability={allCore} label="Choose a language" unavailableLabel="Unavailable" />);
    fireEvent.click(screen.getByRole("button", { name: "简体中文" }));
    expect(push).toHaveBeenCalledWith("/zh-cn/about");
  });
});
