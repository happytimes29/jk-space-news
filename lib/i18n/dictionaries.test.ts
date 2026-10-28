import { describe, expect, it } from "vitest";
import { getDictionary, validateDictionary } from "@/lib/i18n/dictionaries";

describe("localized dictionaries", () => {
  it("loads complete dictionaries for every supported locale", () => {
    const traditional = getDictionary("zh-TW");

    expect(traditional.site.title).toBe("JK Space — 個人工程實驗室");
    expect(getDictionary("zh-CN").navigation.projects).toBe("项目");
    expect(getDictionary("en").site.title).toBe("JK Space — Personal Engineering Lab");
    expect(traditional.home.heroTitle).toBe("把訊號，變成答案。");
    expect(getDictionary("zh-CN").home.heroTitle).toBe("把信号，变成答案。");
    expect(getDictionary("en").home.heroTitle).toBe("Turn signals into answers.");

    expect(() => validateDictionary(traditional, getDictionary("zh-CN"), "zh-CN")).not.toThrow();
    expect(() => validateDictionary(traditional, getDictionary("en"), "en")).not.toThrow();
    for (const locale of ["zh-TW", "zh-CN", "en"] as const) {
      const tools = getDictionary(locale).engineeringTools;
      expect(Object.keys(tools)).toEqual(Object.keys(traditional.engineeringTools));
      expect(JSON.stringify(tools)).not.toContain('""');
      expect(tools.datasheet).toMatchObject({
        publicPdfOnly: expect.any(String),
        relayDisclosure: expect.any(String),
        quickMode: expect.any(String),
        replacementMode: expect.any(String),
        supportedTypes: expect.any(String),
        v1Limits: expect.any(String),
      });
    }
    expect(traditional.engineeringTools.datasheet.quickMode).toBe("快速讀懂 Datasheet");
    expect(traditional.engineeringTools.datasheet.replacementMode).toBe("替代料評估");
  });

  it.each([
    ["missing", { navigation: {} }],
    ["extra", { unexpected: "value" }],
    ["nested", { navigation: "not-an-object" }],
    ["empty-string", { site: { title: "" } }],
  ])("rejects a %s dictionary mismatch", (_name, mutation) => {
    const reference = getDictionary("zh-TW");
    const candidate = structuredClone(reference) as unknown as Record<string, unknown>;

    if ("unexpected" in mutation) {
      candidate.unexpected = mutation.unexpected;
    } else if ("navigation" in mutation) {
      candidate.navigation = mutation.navigation;
    } else if ("site" in mutation) {
      candidate.site = { ...(candidate.site as Record<string, unknown>), ...mutation.site };
    }

    expect(() => validateDictionary(reference, candidate, "test")).toThrow();
  });
});
