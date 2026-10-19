import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleSuggestion } from "./LocaleSuggestion";
import type { TranslationAvailability } from "@/lib/content/translations";

const { push, currentPathname } = vi.hoisted(() => ({ push: vi.fn(), currentPathname: { value: "/about" } }));
vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname.value,
  useRouter: () => ({ push }),
}));

const copy = {
  title: "Switch display language?",
  description: "Your browser suggests another language.",
  switchAction: "Switch language",
  dismissAction: "Keep current language",
};
const allCore: TranslationAvailability = { "/about": ["zh-TW", "zh-CN", "en"] };

const stored = new Map<string, string>();
const storage = {
  clear: () => stored.clear(),
  getItem: (key: string) => stored.get(key) ?? null,
  setItem: (key: string, value: string) => stored.set(key, value),
  removeItem: (key: string) => stored.delete(key),
  key: (index: number) => [...stored.keys()][index] ?? null,
  get length() { return stored.size; },
};

Object.defineProperty(window, "localStorage", { configurable: true, value: storage });

describe("LocaleSuggestion", () => {
  beforeEach(() => {
    push.mockClear();
    window.localStorage.clear();
    document.cookie = "jk-locale=; Max-Age=0; Path=/";
    currentPathname.value = "/about";
    window.history.replaceState({}, "", "/about?source=test#profile");
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["en-US", "zh-TW"]);
  });

  it("suggests the browser language without navigating automatically", async () => {
    render(<LocaleSuggestion locale="zh-TW" copy={copy} availability={allCore} />);
    expect(await screen.findByRole("status")).toHaveTextContent("Switch display language?");
    expect(screen.getByRole("button", { name: /Switch language.*English/ })).toBeVisible();
    expect(push).not.toHaveBeenCalled();
  });

  it("persists dismissal locally and does not show the prompt again", async () => {
    const { unmount } = render(<LocaleSuggestion locale="zh-TW" copy={copy} availability={allCore} />);
    fireEvent.click(await screen.findByRole("button", { name: "Keep current language" }));
    expect(window.localStorage.getItem("jk-locale-suggestion-dismissed")).toBe("1");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    unmount();
    render(<LocaleSuggestion locale="zh-TW" copy={copy} availability={allCore} />);
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  });

  it("ignores an invalid locale cookie and never turns it into navigation", async () => {
    document.cookie = "jk-locale=fr; Path=/";
    render(<LocaleSuggestion locale="zh-TW" copy={copy} availability={allCore} />);
    expect(await screen.findByRole("button", { name: /Switch language.*English/ })).toBeVisible();
    expect(push).not.toHaveBeenCalled();
  });

  it("stores and navigates only after the visitor accepts the suggestion", async () => {
    const cookieSetter = vi.spyOn(Document.prototype, "cookie", "set");
    render(<LocaleSuggestion locale="zh-TW" copy={copy} availability={allCore} />);
    fireEvent.click(await screen.findByRole("button", { name: /Switch language.*English/ }));
    expect(cookieSetter).toHaveBeenCalledWith("jk-locale=en; Max-Age=31536000; Path=/; SameSite=Lax");
    expect(push).toHaveBeenCalledWith("/en/about?source=test#profile");
    cookieSetter.mockRestore();
  });

  it.each([
    ["/projects/pcb-test-point-comparison", { "/projects/pcb-test-point-comparison": ["zh-TW"] }],
    ["/tools/pcb-test-point/app", {}],
  ] as const)("suppresses a suggestion when %s has no target-language route", async (pathname, availability) => {
    currentPathname.value = pathname;
    window.history.replaceState({}, "", pathname);
    render(<LocaleSuggestion locale="zh-TW" copy={copy} availability={availability} />);
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  });

  it("re-evaluates availability after client-side pathname changes", async () => {
    const { rerender } = render(<LocaleSuggestion locale="zh-TW" copy={copy} availability={allCore} />);
    expect(await screen.findByRole("status")).toBeVisible();
    currentPathname.value = "/projects/pcb-test-point-comparison";
    window.history.replaceState({}, "", currentPathname.value);
    rerender(
      <LocaleSuggestion
        locale="zh-TW"
        copy={copy}
        availability={{ "/projects/pcb-test-point-comparison": ["zh-TW"] }}
      />,
    );
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  });
});
