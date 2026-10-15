// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import RootLayout, { metadata } from "./layout";

vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: vi.fn() }) }));

describe("RootLayout", () => {
  it("renders the shell with the Taiwan Traditional Chinese language", async () => {
    const html = renderToStaticMarkup(await RootLayout({ children: <h1>工程實驗室</h1> }));
    expect(html).toContain('<html lang="zh-Hant-TW"');
    expect(html).toMatch(/<main\b[^>]*><h1>工程實驗室<\/h1><\/main>/);
  });

  it("uses JK Space identity throughout the default metadata", () => {
    expect(metadata.title).toEqual({ default: "JK Space — 個人工程實驗室", template: "%s | JK Space" });
    expect(metadata.description).toBe("硬體研發、AI 自動化、工程工具與技術觀點。");
    expect(JSON.stringify(metadata)).not.toContain("JK Space News");
  });
});
