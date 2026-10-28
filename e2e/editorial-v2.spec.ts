import { expect, test } from "@playwright/test";

const sectionOrder = [
  "v2-home-hero",
  "v2-home-orientation",
  "v2-home-practice",
  "v2-home-tool",
  "v2-home-projects",
  "v2-home-notes",
  "v2-home-now",
  "v2-home-contact",
];

async function noHorizontalOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`brand routes keep one H1 and fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/en",
      "/zh-cn",
      "/projects",
      "/en/projects/pcb-test-point-comparison",
      "/zh-cn/tools",
      "/notes",
      "/about",
      "/privacy",
    ]) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("main h1:visible"), route).toHaveCount(1);
      expect(await noHorizontalOverflow(page), route).toBe(true);
    }
  });
}

test("brand pages stay warm paper even with a stored dark preference", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  for (const route of ["/", "/projects", "/en/about", "/zh-cn/privacy"]) {
    await page.goto(route);
    await expect(page.locator(".v2-editorial-page")).toHaveCSS("background-color", "rgb(246, 241, 231)");
  }
});

test("homepage keeps the approved eight-region narrative and usable primary links", async ({ page }) => {
  await page.goto("/");
  expect(await page.locator(".v2-home__shell > section").evaluateAll((sections) => sections.map((section) => section.className))).toEqual(sectionOrder);
  const hero = page.getByRole("region", { name: "把訊號，變成答案。" });
  await expect(hero.getByRole("link", { name: "使用工具" })).toHaveAttribute("href", "/tools");
  await expect(hero.getByRole("link", { name: "查看專案" })).toHaveAttribute("href", "/projects");
  await expect(page.getByRole("region", { name: "工程工具、專案與現場筆記" }).getByRole("link")).toHaveCount(3);
});

test("reduced motion exposes a labeled static signal field without positive durations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const field = page.getByRole("img", { name: "訊號從雜訊收斂為 JK 電路印記" });
  await expect(field).toHaveAttribute("data-mode", "static");
  await expect(field.locator("[data-testid='signal-field-static']")).toContainText("JK");
  const moving = await field.evaluate((root) => Array.from(root.querySelectorAll("*"), (element) => {
    const style = getComputedStyle(element);
    return [...style.animationDuration.split(","), ...style.transitionDuration.split(",")].some((duration) => parseFloat(duration) > 0.001);
  }).some(Boolean));
  expect(moving).toBe(false);
});

test("fine-pointer signal canvas paints only while visible and CTAs work immediately", async ({ page }) => {
  await page.addInitScript(() => {
    const trackedWindow = window as typeof window & { __signalPaints?: number };
    trackedWindow.__signalPaints = 0;
    const nativeClear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      trackedWindow.__signalPaints = (trackedWindow.__signalPaints ?? 0) + 1;
      return nativeClear.apply(this, args);
    };
  });
  await page.goto("/");
  const field = page.locator("[data-signal-field-host]");
  await expect(field).toHaveAttribute("data-mode", "interactive");
  await expect(field.locator("canvas")).toBeVisible();
  await expect(page.getByRole("region", { name: "把訊號，變成答案。" }).getByRole("link", { name: "查看專案" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __signalPaints?: number }).__signalPaints ?? 0)).toBeGreaterThan(0);
  await page.locator(".v2-home-contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const stoppedAt = await page.evaluate(() => (window as typeof window & { __signalPaints?: number }).__signalPaints ?? 0);
  await page.evaluate(() => window.dispatchEvent(new Event("scroll")));
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => (window as typeof window & { __signalPaints?: number }).__signalPaints ?? 0)).toBe(stoppedAt);
});

test("the no-JavaScript homepage preserves copy, links, and section order", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("把訊號，變成答案。");
  await expect(page.getByRole("link", { name: "使用工具" }).first()).toHaveAttribute("href", "/tools");
  await expect(page.locator("[data-signal-field-host]")).toHaveAttribute("data-mode", "static");
  expect(await page.locator(".v2-home__shell > section").evaluateAll((sections) => sections.map((section) => section.className))).toEqual(sectionOrder);
  await context.close();
});

test("mobile navigation, search, language, recovery, and real contacts remain operational", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "開啟選單" }).click();
  await expect(page.getByRole("navigation", { name: "行動版主導覽" })).toBeVisible();
  await page.getByRole("navigation", { name: "行動版主導覽" }).getByRole("group", { name: "選擇語言" }).getByRole("button", { name: "English" }).click();
  await expect(page).toHaveURL("/en");
  await expect(page.getByRole("heading", { level: 1, name: "Turn signals into answers." })).toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("textbox", { name: "Search projects, tools, and notes" })).toBeFocused();
  await page.keyboard.press("Escape");
  await page.goto("/en/missing-v2-page");
  await expect(page.getByRole("main").getByRole("link")).toHaveCount(4);
  await page.goto("/en/contact");
  await expect(page.getByRole("main").getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/happytimes29");
  await expect(page.getByRole("main").getByRole("link", { name: "Telegram" })).toHaveAttribute("href", "https://t.me/JK_Sapce");
});

test("representative engineering journeys retain query state, results, exports, and fit", async ({ page }) => {
  await page.goto("/tools/engineering-converter/app?mode=rf&value=10&from=dBm&impedance=75");
  await expect(page.getByRole("tab", { selected: true })).toHaveText("RF 功率");
  expect(new URL(page.url()).searchParams.get("value")).toBe("10");
  expect(await noHorizontalOverflow(page)).toBe(true);

  await page.goto("/tools/smith-chart/app?r=50&x=50&reference=50&frequency=1G");
  await expect(page.getByRole("table", { name: "RF 讀值" })).toContainText("50 + j50 Ω");
  await expect(page.getByRole("button", { name: "匯出 PNG" })).toBeVisible();
  expect(await noHorizontalOverflow(page)).toBe(true);

  await page.goto("/en/tools/datasheet-workbench/app");
  await expect(page.getByRole("tab", { name: "Quick read", selected: true })).toBeVisible();
  await expect(page.getByLabel("Original datasheet PDF")).toBeAttached();
  expect(await noHorizontalOverflow(page)).toBe(true);

  await page.goto("/tools/pcb-test-point/app");
  await page.getByRole("button", { name: "載入範例" }).click();
  await expect(page.getByRole("button", { name: "匯出 CSV" })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出 CSV" }).click();
  expect((await download).suggestedFilename()).toMatch(/^pcb-tp-diff_.*\.csv$/);
  expect(await noHorizontalOverflow(page)).toBe(true);
});
