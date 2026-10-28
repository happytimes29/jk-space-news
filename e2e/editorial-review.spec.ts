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

test("engineering pages keep the dark V2 header legible", async ({ page }) => {
  for (const route of [
    "/tools/smith-chart/app",
    "/en/tools/datasheet-workbench/app",
    "/tools/pcb-test-point/app",
  ]) {
    await page.goto(route);
    await expect(page.locator(".v2-site-header")).toHaveCSS("background-color", "rgb(21, 21, 19)");
    await expect(page.locator(".v2-site-header__brand")).toHaveCSS("color", "rgb(243, 237, 227)");
  }
});

for (const storedTheme of ["dark", "light"]) {
  test(`fixed V2 paper and functional tool surfaces remain readable with stored ${storedTheme}`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem("theme", value), storedTheme);
    await page.goto("/en/projects");
    await expect(page.locator(".v2-editorial-page")).toHaveCSS("background-color", "rgb(246, 241, 231)");
    for (const control of await page.locator(".v2-filter select, .v2-filter button").all()) {
      await control.focus();
      await expect(control).toHaveCSS("outline-color", "rgb(167, 59, 43)");
      const colors = await control.evaluate((element) => ({
        foreground: getComputedStyle(element).outlineColor,
        background: getComputedStyle(element.closest(".v2-editorial-page")!).backgroundColor,
      }));
      expect(contrast(colors.foreground, colors.background)).toBeGreaterThanOrEqual(3);
    }
    await page.goto("/tools/smith-chart/app");
    await expect(page.locator(".engineering-app")).toHaveCSS("background-color", "rgb(251, 250, 247)");
    await page.goto("/tools/pcb-test-point/app");
    await expect(page.locator(".pcb-engineering-app")).toHaveCSS("background-color", "rgb(13, 17, 23)");
  });
}

for (const width of [360, 1440]) {
  test(`V2 404 recovery remains compact and usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/missing-editorial-review-page");
    const root = page.locator(".v2-not-found");
    const links = root.getByRole("navigation").getByRole("link");
    await expect(links).toHaveCount(4);
    for (const link of await links.all()) {
      const box = await link.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });

  test(`homepage V2 status and metadata retain their hierarchy at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(page.locator(".v2-home-tool .editorial-status").first()).toHaveCSS("display", "inline-flex");
    await expect(page.locator(".v2-home-project .editorial-content-meta").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
