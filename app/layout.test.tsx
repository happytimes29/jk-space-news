// @vitest-environment node
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import TraditionalLayout, { metadata } from "./(zh-tw)/layout";
import LocalizedLayout from "./[locale]/layout";

vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: vi.fn() }), notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }) }));

describe("RootLayout", () => {
  it("publishes the AdSense ownership code in every language root", async () => {
    const traditional = renderToStaticMarkup(await TraditionalLayout({ children: <h1>工程實驗室</h1> }));
    const english = renderToStaticMarkup(await LocalizedLayout({ children: <h1>Lab</h1>, params: Promise.resolve({ locale: "en" }) }));

    for (const html of [traditional, english]) {
      expect(html).toContain("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8234074314115236");
      expect(html).toContain('crossorigin="anonymous"');
    }
  });

  it("authorizes only the configured AdSense publisher in ads.txt", () => {
    const adsTxt = readFileSync(new URL("../public/ads.txt", import.meta.url), "utf8");
    expect(adsTxt).toBe("google.com, pub-8234074314115236, DIRECT, f08c47fec0942fa0\n");
  });

  it("renders the shell with the Taiwan Traditional Chinese language", async () => {
    const html = renderToStaticMarkup(await TraditionalLayout({ children: <h1>工程實驗室</h1> }));
    expect(html).toContain('<html lang="zh-Hant-TW"');
    expect(html).toMatch(/<main\b[^>]*><h1>工程實驗室<\/h1><\/main>/);
  });

  it("renders exact Simplified Chinese and English root language tags", async () => {
    const simplified = renderToStaticMarkup(await LocalizedLayout({ children: <h1>实验室</h1>, params: Promise.resolve({ locale: "zh-cn" }) }));
    const english = renderToStaticMarkup(await LocalizedLayout({ children: <h1>Lab</h1>, params: Promise.resolve({ locale: "en" }) }));
    expect(simplified).toContain('<html lang="zh-Hans-CN"');
    expect(english).toContain('<html lang="en"');
  });

  it("uses the Traditional Chinese shell around an unsupported leaf route's 404 boundary", async () => {
    const html = renderToStaticMarkup(await LocalizedLayout({ children: <span />, params: Promise.resolve({ locale: "fr" }) }));
    expect(html).toContain('<html lang="zh-Hant-TW"');
  });

  it("uses JK Space identity throughout the default metadata", () => {
    expect(metadata.title).toEqual({ default: "JK Space — 個人工程實驗室", template: "%s | JK Space" });
    expect(metadata.description).toBe("硬體研發、AI 自動化、工程工具與技術觀點。");
    expect(JSON.stringify(metadata)).not.toContain("JK Space News");
  });
});
