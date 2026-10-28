// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

const stylesheetPath = path.join(process.cwd(), "app", "editorial-v2.css");

function stylesheet() {
  return postcss.parse(fs.readFileSync(stylesheetPath, "utf8"));
}

function declarations(selector: string) {
  const values: Record<string, string> = {};
  stylesheet().walkRules((rule) => {
    if (!rule.selectors.includes(selector)) return;
    rule.walkDecls((declaration) => { values[declaration.prop] = declaration.value; });
  });
  return values;
}

function allSelectors() {
  const selectors: string[] = [];
  stylesheet().walkRules((rule) => {
    selectors.push(...rule.selectors.map((selector) => selector.trim()));
  });
  return selectors;
}

describe("editorial v2 design boundary", () => {
  it("defines the fixed paper brand tokens on the site root", () => {
    expect(fs.existsSync(stylesheetPath)).toBe(true);
    if (!fs.existsSync(stylesheetPath)) return;

    expect(declarations(".site-v2")).toMatchObject({
      "--v2-paper": "#f6f1e7",
      "--v2-ink": "#17203a",
      "--v2-brass": "#a88654",
      "--v2-signal": "#a73b2b",
      "color-scheme": "light",
    });
  });

  it("keeps generic controls and drawings behind an explicit boundary", () => {
    expect(fs.existsSync(stylesheetPath)).toBe(true);
    if (!fs.existsSync(stylesheetPath)) return;

    expect(allSelectors()).not.toContainEqual(expect.stringMatching(/^(input|button|select|svg|canvas)\b/));
  });

  it("restores readable functional tokens inside engineering applications", () => {
    expect(fs.existsSync(stylesheetPath)).toBe(true);
    if (!fs.existsSync(stylesheetPath)) return;

    expect(declarations(".site-v2 .engineering-app")).toMatchObject({
      "--color-bg": expect.any(String),
      "--color-text": expect.any(String),
    });
  });
});
