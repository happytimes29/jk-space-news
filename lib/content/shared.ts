import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { JSON_SCHEMA, load } from "js-yaml";

export class ContentValidationError extends Error {
  constructor(public readonly file: string, public readonly field: string, message: string) {
    super(`${file}: ${field}: ${message}`);
    this.name = "ContentValidationError";
  }
}

export interface ContentFile {
  file: string;
  data: Record<string, unknown>;
  content: string;
}

export function readContentFile(file: string): ContentFile {
  const raw = fs.readFileSync(file, "utf8");
  try {
    const parsed = matter(raw, {
      // Keep dates as strings so invalid calendar dates cannot roll forward in YAML.
      engines: { yaml: (source) => load(source, { schema: JSON_SCHEMA }) as object },
    });
    if (!parsed.data || typeof parsed.data !== "object" || Array.isArray(parsed.data)) {
      throw new Error("expected a frontmatter mapping");
    }
    return { file, data: parsed.data, content: parsed.content };
  } catch (error) {
    throw new ContentValidationError(file, "frontmatter", error instanceof Error ? error.message : "invalid YAML");
  }
}

export function loadContentCollection<T extends { slug: string }>(directory: string, parse: (source: ContentFile) => T): T[] {
  const slugs = new Set<string>();
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.mdx?$/.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      const file = path.join(directory, entry.name);
      const item = parse(readContentFile(file));
      if (slugs.has(item.slug)) {
        throw new ContentValidationError(file, "slug", `duplicate slug "${item.slug}"`);
      }
      slugs.add(item.slug);
      return item;
    });
}

export class ContentFields {
  constructor(private readonly file: string, private readonly data: Record<string, unknown>) {}

  private fail(field: string, message: string): never {
    throw new ContentValidationError(this.file, field, message);
  }

  string(field: string): string {
    const value = this.data[field];
    if (typeof value !== "string" || !value.trim()) this.fail(field, "expected a non-empty string");
    return value.trim();
  }

  optionalString(field: string): string | undefined {
    return this.data[field] === undefined ? undefined : this.string(field);
  }

  strings(field: string, nonEmpty = false): string[] {
    const value = this.data[field];
    if (!Array.isArray(value) || (nonEmpty && value.length === 0) || value.some((item) => typeof item !== "string" || !item.trim())) {
      this.fail(field, `expected ${nonEmpty ? "a non-empty" : "an"} array of non-empty strings`);
    }
    return value.map((item: string) => item.trim());
  }

  optionalStrings(field: string): string[] | undefined {
    return this.data[field] === undefined ? undefined : this.strings(field);
  }

  enum<T extends string>(field: string, allowed: readonly T[]): T {
    const value = this.string(field);
    if (!allowed.includes(value as T)) this.fail(field, `expected one of: ${allowed.join(", ")}`);
    return value as T;
  }

  enums<T extends string>(field: string, allowed: readonly T[]): T[] {
    const values = this.strings(field, true);
    if (values.some((value) => !allowed.includes(value as T))) this.fail(field, `expected values from: ${allowed.join(", ")}`);
    return values as T[];
  }

  boolean(field: string): boolean {
    const value = this.data[field];
    if (typeof value !== "boolean") this.fail(field, "expected a boolean");
    return value;
  }

  year(field: string): number {
    const value = this.data[field];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 9999) this.fail(field, "expected an integer year from 1 to 9999");
    return value;
  }

  date(field: string): string {
    const value = this.string(field);
    const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.exec(value);
    if (!match) this.fail(field, "expected an ISO date or timestamp with timezone");
    const [, yearText, monthText, dayText, hour, minute, second] = match;
    const year = Number(yearText), month = Number(monthText), day = Number(dayText);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month < 1 || month > 12 || day < 1 || day > monthDays[month - 1] || Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59 || !Number.isFinite(Date.parse(value))) {
      this.fail(field, "expected a valid calendar date");
    }
    return new Date(value).toISOString();
  }

  url(field: string, allowLocal = false): string {
    const value = this.string(field);
    if (allowLocal && value.startsWith("/") && !value.startsWith("//") && !/[\\\s]/.test(value)) return value;
    try {
      const url = new URL(value);
      if (url.protocol === "https:" || url.protocol === "http:") return value;
    } catch { /* Report the field below. */ }
    return this.fail(field, `expected ${allowLocal ? "a site path or " : ""}an HTTP(S) URL`);
  }

  optionalUrl(field: string, allowLocal = false): string | undefined {
    return this.data[field] === undefined ? undefined : this.url(field, allowLocal);
  }
}

export function estimateReadingTime(content: string): number {
  const characters = (content.match(/[\u3400-\u9fff]/g) || []).length;
  const words = content.replace(/[\u3400-\u9fff]/g, " ").match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length || 0;
  return Math.max(1, Math.ceil((characters + words) / 200));
}
