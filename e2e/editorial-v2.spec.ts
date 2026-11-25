import { expect, test } from "@playwright/test";

const homeTitle = /工程問題，\s*動手解。/;

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
  for (const route of ["/projects", "/en/about", "/zh-cn/privacy"]) {
    await page.goto(route);
    await expect(page.locator(".v2-editorial-page")).toHaveCSS("background-color", "rgb(246, 243, 233)");
  }
});

test("both homepage reading links open the notes page with a real case", async ({ page }) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: homeTitle });
  await expect(hero.getByRole("link", { name: "使用工具" })).toHaveAttribute("href", "/tools");
  await hero.getByRole("link", { name: "閱讀札記" }).click();
  await expect(page).toHaveURL("/notes");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("筆記與觀點");
  await page.goto("/");
  await page.getByRole("region", { name: "依興趣探索" }).getByRole("link", { name: /閱讀札記/ }).click();
  await expect(page).toHaveURL("/notes");
});

test("reduced motion suppresses the homepage card transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const cards = await page.getByRole("region", { name: "依興趣探索" }).getByRole("link").all();
  expect(cards).toHaveLength(4);
  for (const card of cards) {
    expect(await card.evaluate((link) => getComputedStyle(link).transitionDuration.split(",").every((duration) => parseFloat(duration) <= 0.001))).toBe(true);
  }
});

test("the no-JavaScript homepage renders the design and reading links", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(homeTitle);
  await expect(page.getByRole("link", { name: "使用工具" }).first()).toHaveAttribute("href", "/tools");
  await expect(page.locator("#reading").getByRole("link", { name: "開啟比對工具" })).toHaveAttribute("href", "/tools/pcb-test-point/app");
  await context.close();
});

test("mobile navigation, search, language, recovery, and real contacts remain operational", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "開啟選單" }).click();
  await expect(page.getByRole("navigation", { name: "行動版主導覽" })).toBeVisible();
  await page.getByRole("navigation", { name: "行動版主導覽" }).getByRole("group", { name: "選擇語言" }).getByRole("button", { name: "English" }).click();
  await expect(page).toHaveURL("/en");
  await expect(page.getByRole("heading", { level: 1, name: /Engineering problems\.\s*Hands-on answers\./ })).toBeVisible();
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile primary navigation" })).toBeVisible();
  await page.getByRole("button", { name: "Close menu" }).click();
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("textbox", { name: "Search projects, tools, and notes" })).toBeFocused();
  await page.keyboard.press("Escape");
  await page.goto("/en/missing-v2-page");
  await expect(page.getByRole("main").getByRole("link")).toHaveCount(4);
  await page.goto("/en/about#contact");
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
