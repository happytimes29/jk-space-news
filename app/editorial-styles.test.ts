// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

const stylesheetPath = path.join(process.cwd(), "app", "editorial.css");

describe("editorial stylesheet boundaries", () => {
  it("defines every content and engineering isolation boundary", () => {
    expect(fs.existsSync(stylesheetPath)).toBe(true);
    if (!fs.existsSync(stylesheetPath)) return;

    const root = postcss.parse(fs.readFileSync(stylesheetPath, "utf8"));
    const selectors = new Set<string>();
    root.walkRules((rule) => {
      for (const selector of rule.selectors ?? []) selectors.add(selector.trim());
    });

    for (const boundary of [
      ".editorial-page",
      ".editorial-collection",
      ".editorial-detail",
      ".editorial-utility",
      ".engineering-app-page",
      ".engineering-app",
    ]) {
      expect(selectors.has(boundary), `missing ${boundary}`).toBe(true);
    }
  });

  it("never starts a rule with a generic interactive or drawing element", () => {
    expect(fs.existsSync(stylesheetPath)).toBe(true);
    if (!fs.existsSync(stylesheetPath)) return;

    const root = postcss.parse(fs.readFileSync(stylesheetPath, "utf8"));
    const unsafe: string[] = [];
    root.walkRules((rule) => {
      for (const selector of rule.selectors ?? []) {
        if (/^(?:input|button|select|svg|canvas)(?:\b|[:.#[])/.test(selector.trim())) unsafe.push(selector.trim());
      }
    });

    expect(unsafe).toEqual([]);
  });
});
