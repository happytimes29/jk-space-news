// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

const stylesheetPath = path.join(process.cwd(), "app", "editorial.css");
const globalsPath = path.join(process.cwd(), "app", "globals.css");

function root() {
  return postcss.parse(fs.readFileSync(stylesheetPath, "utf8"));
}

function selectors() {
  const values = new Set<string>();
  root().walkRules((rule) => rule.selectors.forEach((selector) => values.add(selector.trim())));
  return values;
}

function declarations(selector: string, mobile = false) {
  const values: Record<string, string> = {};
  root().walkRules((rule) => {
    const inMobile = rule.parent?.type === "atrule" && rule.parent.params === "(max-width: 767px)";
    if (rule.selectors.includes(selector) && inMobile === mobile) {
      rule.walkDecls((declaration) => { values[declaration.prop] = declaration.value; });
    }
  });
  return values;
}

describe("preserved functional stylesheet boundaries", () => {
  it("removes superseded V1 brand selectors from both legacy stylesheets", () => {
    const legacySelectors = [...selectors()];
    expect(legacySelectors).not.toContainEqual(expect.stringMatching(/^\.editorial-(?:page|collection|detail|utility)(?:\b|[.:\s])/));
    expect(fs.readFileSync(globalsPath, "utf8")).not.toContain(".editorial-home");
  });

  it("preserves engineering, Datasheet, and PCB application boundaries", () => {
    const protectedSelectors = selectors();
    for (const boundary of [
      ".engineering-app-page",
      ".engineering-app",
      ".engineering-app:not(.pcb-engineering-app)",
      ".engineering-app-page > .pcb-engineering-app",
      ".datasheet-workbench",
    ]) {
      expect(protectedSelectors.has(boundary), `missing ${boundary}`).toBe(true);
    }
    expect(declarations(".engineering-app:not(.pcb-engineering-app)").background).toBe("var(--color-bg)");
    expect(declarations(".engineering-app").background).toBeUndefined();
  });

  it("keeps dense, responsive, accessible Datasheet controls", () => {
    expect(declarations(".datasheet-workbench")).toMatchObject({ "max-width": "90rem", margin: "0 auto" });
    expect(declarations(".datasheet-workbench button")["min-height"]).toBe("44px");
    expect(declarations(".datasheet-workbench :focus-visible").outline).toBe("2px solid var(--editorial-accent)");
    expect(declarations(".datasheet-comparison-matrix")["overflow-x"]).toBe("auto");
    expect(declarations(".datasheet-document-grid", true)["grid-template-columns"]).toBe("minmax(0, 1fr)");
    const stylesheet = fs.readFileSync(stylesheetPath, "utf8");
    expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
    expect(stylesheet).toContain("@media print");
  });

  it("never starts a rule with a generic interactive or drawing element", () => {
    const unsafe: string[] = [];
    root().walkRules((rule) => {
      for (const selector of rule.selectors) {
        if (/^(?:input|button|select|svg|canvas)(?:\b|[:.#[])/.test(selector.trim())) unsafe.push(selector.trim());
      }
    });
    expect(unsafe).toEqual([]);
  });

  it("leaves V2 selector ownership to editorial-v2.css", () => {
    expect(fs.readFileSync(stylesheetPath, "utf8")).not.toMatch(/\.v2-[\w-]+/);
    expect(fs.readFileSync(globalsPath, "utf8")).not.toMatch(/\.v2-[\w-]+/);
  });
});
