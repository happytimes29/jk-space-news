import { describe, expect, it } from "vitest";
import { getEnabledContactLinks, siteConfig } from "@/lib/site-config";

describe("shared JK Space identity", () => {
  it("provides the identity contract used across pages", () => {
    expect(siteConfig.name).toBe("JK Space");
    expect(siteConfig.title).toBe("JK Space — 個人工程實驗室");
    expect(siteConfig.tagline).toBe("把工程上的麻煩事，做成好用的工具。");
    expect(siteConfig.description).toBe("硬體研發、AI 自動化、工程工具與技術觀點。");
  });

  it("provides the ordered primary navigation labels and destinations", () => {
    expect(siteConfig.navigation).toEqual([
      { label: "首頁", href: "/" },
      { label: "專案", href: "/projects" },
      { label: "工具", href: "/tools" },
      { label: "筆記與觀點", href: "/notes" },
      { label: "關於我", href: "/about" },
      { label: "聯絡", href: "/contact" },
    ]);
  });

  it("exposes only the configured public contact destinations", () => {
    const contacts = getEnabledContactLinks(siteConfig);
    expect(contacts.map((item) => item.label)).toEqual(["GitHub", "Telegram"]);
    expect(contacts).toEqual([
      { label: "GitHub", href: "https://github.com/happytimes29", kind: "github" },
      { label: "Telegram", href: "https://t.me/JK_Sapce", kind: "telegram" },
    ]);
  });

  it("has no contact links when no contacts are configured", () => {
    expect(getEnabledContactLinks({ ...siteConfig, contacts: [] })).toEqual([]);
  });
});
