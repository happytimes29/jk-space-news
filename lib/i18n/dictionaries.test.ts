import { describe, expect, it } from "vitest";
import { getDictionary, validateDictionary } from "@/lib/i18n/dictionaries";

describe("localized dictionaries", () => {
  it("loads complete dictionaries for every supported locale", () => {
    const traditional = getDictionary("zh-TW");

    expect(traditional.site.title).toBe("JK Space — 個人工程實驗室");
    expect(getDictionary("zh-CN").navigation.projects).toBe("项目");
    expect(getDictionary("en").site.title).toBe("JK Space — Personal Engineering Lab");

    expect(() => validateDictionary(traditional, getDictionary("zh-CN"), "zh-CN")).not.toThrow();
    expect(() => validateDictionary(traditional, getDictionary("en"), "en")).not.toThrow();
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
    } else if (typeof mutation.navigation === "string") {
      candidate.navigation = mutation.navigation;
    } else if (mutation.navigation) {
      candidate.navigation = mutation.navigation;
    } else if (mutation.site) {
      candidate.site = { ...(candidate.site as Record<string, unknown>), ...mutation.site };
    }

    expect(() => validateDictionary(reference, candidate, "test")).toThrow();
  });
});
