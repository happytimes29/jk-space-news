import fs from "node:fs";
import path from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { buildTranslationAvailability, type TranslationAvailability } from "@/lib/content/translations";
import { fixtureDirectory, projectData, writeContent, writeTranslation } from "@/lib/content/test-fixtures";

const { push, currentPathname } = vi.hoisted(() => ({ push: vi.fn(), currentPathname: { value: "/about" } }));
vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname.value,
  useRouter: () => ({ push }),
}));

const allCore: TranslationAvailability = { "/about": ["zh-TW", "zh-CN", "en"] };
const directories: string[] = [];

afterEach(() => directories.splice(0).forEach((directory) => fs.rmSync(directory, { recursive: true })));

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

  it("uses availability built from a non-ASCII slug without decoding or double encoding", () => {
    const root = fixtureDirectory();
    directories.push(root);
    const projects = path.join(root, "projects");
    const tools = path.join(root, "tools");
    const notes = path.join(root, "notes");
    fs.mkdirSync(tools, { recursive: true });
    fs.mkdirSync(notes, { recursive: true });
    writeContent(projects, "測試.md", { ...projectData, slug: "測試" });
    writeTranslation(projects, "en", "測試.md", {
      ...projectData,
      title: "Encoded project",
      slug: "測試",
      locale: "en",
      translationOf: "測試",
      translationStatus: "published",
      translatedAt: "2026-10-19",
    });
    const availability = buildTranslationAvailability("production", { projects, tools, notes });
    currentPathname.value = "/projects/%E6%B8%AC%E8%A9%A6";
    window.history.replaceState({}, "", currentPathname.value);

    render(<LanguageSwitcher locale="zh-TW" availability={availability} label="選擇語言" unavailableLabel="尚未翻譯" />);
    fireEvent.click(screen.getByRole("button", { name: "English" }));

    expect(push).toHaveBeenCalledWith("/en/projects/%E6%B8%AC%E8%A9%A6");
  });
});
