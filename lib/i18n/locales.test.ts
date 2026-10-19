import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  LOCALES,
  localeConfig,
  localeFromSegment,
  localePath,
  splitLocalePath,
} from "@/lib/i18n/locales";

describe("locale registry", () => {
  it("defines the three supported locales and their public URL metadata", () => {
    expect(DEFAULT_LOCALE).toBe("zh-TW");
    expect(LOCALES).toEqual(["zh-TW", "zh-CN", "en"]);
    expect(LOCALES.map(localeConfig)).toEqual([
      {
        locale: "zh-TW",
        segment: null,
        htmlLang: "zh-Hant-TW",
        hreflang: "zh-Hant-TW",
        ogLocale: "zh_TW",
        label: "繁體中文",
      },
      {
        locale: "zh-CN",
        segment: "zh-cn",
        htmlLang: "zh-Hans-CN",
        hreflang: "zh-Hans-CN",
        ogLocale: "zh_CN",
        label: "简体中文",
      },
      {
        locale: "en",
        segment: "en",
        htmlLang: "en",
        hreflang: "en",
        ogLocale: "en_US",
        label: "English",
      },
    ]);
  });

  it("maps only exact public path segments to locales", () => {
    expect(localeFromSegment("zh-cn")).toBe("zh-CN");
    expect(localeFromSegment("en")).toBe("en");
    expect(localeFromSegment("fr")).toBeNull();
    expect(localeFromSegment("zh-tw")).toBeNull();
    expect(localeFromSegment("")).toBeNull();
  });

  it("prefixes non-default routes and keeps the default route unprefixed", () => {
    expect(localePath("zh-TW", "/about")).toBe("/about");
    expect(localePath("zh-CN", "/about")).toBe("/zh-cn/about");
    expect(localePath("en", "/about")).toBe("/en/about");
    expect(localePath("en", "/")).toBe("/en");
  });

  it("splits localized paths without decoding or rewriting encoded slugs", () => {
    expect(splitLocalePath("/zh-cn/about")).toEqual({ locale: "zh-CN", pathname: "/about" });
    expect(splitLocalePath("/en/notes/%E6%B8%AC%E8%A9%A6?from=%2Ftools#top")).toEqual({
      locale: "en",
      pathname: "/notes/%E6%B8%AC%E8%A9%A6?from=%2Ftools#top",
    });
    expect(splitLocalePath("/notes/%E6%B8%AC%E8%A9%A6")).toEqual({
      locale: "zh-TW",
      pathname: "/notes/%E6%B8%AC%E8%A9%A6",
    });
  });
});
