import traditionalChinese from "@/locales/zh-TW.json";
import simplifiedChinese from "@/locales/zh-CN.json";
import english from "@/locales/en.json";
import type { Locale } from "@/lib/i18n/locales";

export type SiteDictionary = typeof traditionalChinese;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateDictionary(reference: unknown, candidate: unknown, locale: string): void {
  const visit = (expected: unknown, actual: unknown, path: string): void => {
    if (typeof expected === "string") {
      if (typeof actual !== "string") {
        throw new Error(`${locale}: ${path} must be a string`);
      }
      if (actual.trim() === "") {
        throw new Error(`${locale}: ${path} must not be empty`);
      }
      return;
    }

    if (!isRecord(expected) || !isRecord(actual)) {
      throw new Error(`${locale}: ${path || "dictionary"} must be an object`);
    }

    const expectedKeys = Object.keys(expected);
    const actualKeys = Object.keys(actual);
    const missing = expectedKeys.filter((key) => !(key in actual));
    const extra = actualKeys.filter((key) => !(key in expected));

    if (missing.length > 0) {
      throw new Error(`${locale}: missing ${path ? `${path}.` : ""}${missing.join(", ")}`);
    }
    if (extra.length > 0) {
      throw new Error(`${locale}: unexpected ${path ? `${path}.` : ""}${extra.join(", ")}`);
    }

    for (const key of expectedKeys) {
      visit(expected[key], actual[key], path ? `${path}.${key}` : key);
    }
  };

  visit(reference, candidate, "");
}

validateDictionary(traditionalChinese, traditionalChinese, "zh-TW");
validateDictionary(traditionalChinese, simplifiedChinese, "zh-CN");
validateDictionary(traditionalChinese, english, "en");

const dictionaries: Record<Locale, SiteDictionary> = {
  "zh-TW": traditionalChinese,
  "zh-CN": simplifiedChinese,
  en: english,
};

export function getDictionary(locale: Locale): SiteDictionary {
  const dictionary = dictionaries[locale];
  if (!dictionary) {
    throw new Error(`Unsupported locale: ${String(locale)}`);
  }
  return dictionary;
}
