// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

const stylesheetPath = path.join(process.cwd(), "app", "editorial.css");

function declarations(selector: string, mobile = false) {
  const values: Record<string, string> = {};
  postcss.parse(fs.readFileSync(stylesheetPath, "utf8")).walkRules((rule) => {
    const inMobile = rule.parent?.type === "atrule" && rule.parent.params === "(max-width: 767px)";
    if (rule.selectors.includes(selector) && inMobile === mobile) {
      rule.walkDecls((declaration) => { values[declaration.prop] = declaration.value; });
    }
  });
  return values;
}

describe("final editorial review contracts", () => {
  it("restores the theme surface only at non-PCB application boundaries", () => {
    expect(declarations(".engineering-app:not(.pcb-engineering-app)").background).toBe("var(--color-bg)");
    expect(declarations(".engineering-app").background).toBeUndefined();
  });

  it("places 404 recovery links in the second desktop column and first mobile column", () => {
    expect(declarations(".editorial-page.editorial-not-found nav")).toMatchObject({
      display: "grid", "grid-column": "2", "grid-template-columns": "repeat(2, minmax(0, 1fr))",
    });
    expect(declarations(".editorial-page.editorial-not-found nav", true)["grid-column"]).toBe("1");
    expect(declarations(".editorial-page.editorial-not-found nav a").display).toBe("flex");
    expect(declarations(".editorial-page.editorial-not-found nav a:nth-child(odd)")["margin-right"]).toBe("1.5rem");
    expect(declarations(".editorial-page.editorial-not-found nav a:hover").color).toBe("var(--editorial-accent)");
    expect(declarations(".editorial-page.editorial-not-found nav span").color).toBe("var(--editorial-accent)");
    expect(declarations(".editorial-page.editorial-not-found h1")["font-size"]).toBe("clamp(2.8rem, 7vw, 6rem)");
    expect(fs.readFileSync(stylesheetPath, "utf8")).not.toMatch(/\.editorial-page\s+\.editorial-not-found\s/);
  });

  it.each(["input", "select", "textarea", "button"])("gives content-page %s controls an editorial focus outline", (element) => {
    expect(declarations(`.editorial-page ${element}:focus-visible`).outline).toBe("2px solid var(--editorial-accent, var(--color-accent))");
    expect(declarations(`.engineering-app-page ${element}:focus-visible`).outline).toBeUndefined();
    expect(declarations(`.engineering-app ${element}:focus-visible`).outline).toBeUndefined();
  });

  it("uses a compact full-width column when a tool has no cover", () => {
    expect(declarations(".editorial-page .editorial-tool-row--no-cover")).toMatchObject({
      "grid-template-columns": "minmax(0, 1fr)", "min-height": "auto",
    });
    expect(declarations(".editorial-page .editorial-tool-row--no-cover .editorial-tool-row__body").padding).toBe("clamp(2rem, 4vw, 4rem) 0");
  });

  it("keeps homepage status and metadata styling in both light and dark sections", () => {
    const globals = postcss.parse(fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8"));
    const values: Record<string, Record<string, string>> = {};
    globals.walkRules((rule) => {
      for (const selector of rule.selectors) {
        values[selector] ??= {};
        rule.walkDecls((declaration) => { values[selector][declaration.prop] = declaration.value; });
      }
    });
    expect(values[".editorial-home .editorial-status"]).toMatchObject({ display: "inline-flex", border: "1px solid var(--editorial-ink)", padding: "0.25rem 0.75rem" });
    expect(values[".editorial-projects .editorial-status"]).toMatchObject({ color: "var(--editorial-paper)", "border-color": "#7c7970" });
    expect(values[".editorial-home .editorial-content-meta"]).toMatchObject({ display: "flex", "flex-wrap": "wrap", gap: "0.75rem 1.5rem" });
    expect(values[".editorial-home .editorial-content-meta > div"]).toMatchObject({ display: "flex", gap: "0.5rem" });
    expect(declarations(".editorial-page .editorial-content-meta").display).toBe("grid");
  });
});

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
