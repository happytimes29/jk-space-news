import { expect, test } from "@playwright/test";

function contrast(foreground: string, background: string) {
  const luminance = (color: string) => {
    const [r, g, b] = color.match(/[\d.]+/g)!.slice(0, 3).map((channel) => {
      const value = Number(channel) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test.use({ reducedMotion: "reduce" });

for (const theme of ["dark", "light"]) {
  test.describe(theme, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
    });

    test("unfilled Smith controls use the neutral application surface and PCB keeps its dark surface", async ({ page }) => {
      await page.goto("/tools/smith-chart/app");
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      const app = page.locator(".engineering-app");
      await expect(app).toHaveCSS("background-color", theme === "dark" ? "rgb(15, 13, 10)" : "rgb(255, 252, 245)");
      for (const label of ["匯出 PNG", "複製分享網址"]) {
        const control = app.getByRole("button", { name: label });
        await expect(control).toBeVisible();
        const colors = await control.evaluate((element) => {
          let surface: Element | null = element;
          while (surface && getComputedStyle(surface).backgroundColor === "rgba(0, 0, 0, 0)") surface = surface.parentElement;
          return { foreground: getComputedStyle(element).color, background: getComputedStyle(surface!).backgroundColor };
        });
        expect(contrast(colors.foreground, colors.background)).toBeGreaterThanOrEqual(4.5);
        await control.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        await expect(control).toBeFocused();
        await expect(control).toHaveCSS("outline-color", theme === "dark" ? "rgb(126, 160, 255)" : "rgb(46, 91, 255)");
      }
      await page.goto("/tools/pcb-test-point/app");
      await expect(page.locator(".pcb-engineering-app")).toHaveCSS("background-color", "rgb(13, 17, 23)");
    });

    test("keyboard focus on project filters uses a contrasting editorial outline", async ({ page }) => {
      await page.goto("/en/projects");
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      for (const control of await page.locator(".editorial-filter select, .editorial-filter button").all()) {
        await control.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        await expect(control).toBeFocused();
        await expect(control).toHaveCSS("outline-color", "rgb(182, 45, 25)");
        await expect(control).toHaveCSS("outline-width", "2px");
        const colors = await control.evaluate((element) => ({
          foreground: getComputedStyle(element).outlineColor,
          background: getComputedStyle(element.closest(".editorial-page")!).backgroundColor,
        }));
        expect(contrast(colors.foreground, colors.background)).toBeGreaterThanOrEqual(3);
      }
    });
  });
}

for (const width of [360, 1440]) {
  test(`404 recovery navigation has separated two-column actions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/missing-editorial-review-page");
    const root = page.locator(".editorial-not-found");
    const nav = root.getByRole("navigation");
    await expect(nav).toHaveCSS("display", "grid");
    await expect(nav).toHaveCSS("grid-column-start", width === 360 ? "1" : "2");
    const links = nav.getByRole("link");
    await expect(links).toHaveCount(4);
    const boxes = await links.evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    }));
    expect(boxes[0].height).toBeGreaterThanOrEqual(44);
    expect(boxes[1].x).toBeGreaterThan(boxes[0].x + boxes[0].width);
    expect(boxes[2].y).toBeGreaterThanOrEqual(boxes[0].y + boxes[0].height);
    expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThan(1);
    const heading = await root.getByRole("heading", { level: 1 }).boundingBox();
    expect(Math.abs(boxes[0].x - heading!.x)).toBeLessThan(1);
    await expect(links.first()).toHaveCSS("display", "flex");
    await expect(links.first().locator("span")).toHaveCSS("color", "rgb(182, 45, 25)");
    await expect(root.getByRole("heading", { level: 1 })).toHaveCSS("font-size", width === 360 ? "44.8px" : "96px");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });

  test(`homepage shared status and metadata retain their layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const featureStatus = page.locator(".editorial-tool .editorial-status").first();
    await expect(featureStatus).toHaveCSS("display", "inline-flex");
    await expect(featureStatus).toHaveCSS("border-left-width", "1px");
    await expect(featureStatus).toHaveCSS("padding-left", "12px");
    const projectStatus = page.locator(".editorial-projects .editorial-status").first();
    await expect(projectStatus).toHaveCSS("color", "rgb(241, 239, 232)");
    await expect(projectStatus).toHaveCSS("border-left-color", "rgb(124, 121, 112)");
    const metadata = page.locator(".editorial-projects .editorial-content-meta").first();
    await expect(metadata).toHaveCSS("display", "flex");
    await expect(metadata).toHaveCSS("flex-wrap", "wrap");
    await expect(metadata).toHaveCSS("column-gap", "24px");
  });
}
