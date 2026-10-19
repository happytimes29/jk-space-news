import { expect, test } from "@playwright/test";

const preview = process.env.CONTENT_PREVIEW === "1";

test("engineering applications navigate directly in every visible locale and preserve back links", async ({ page }) => {
  const locales = preview
    ? [["", "工程單位與 RF 功率轉換器", "/tools/engineering-converter"], ["/zh-cn", "工程单位与 RF 功率转换器", "/zh-cn/tools/engineering-converter"], ["/en", "Engineering Unit and RF Power Converter", "/en/tools/engineering-converter"]]
    : [["", "工程單位與 RF 功率轉換器", "/tools/engineering-converter"]];
  for (const [prefix, heading, back] of locales) {
    const response = await page.goto(`${prefix}/tools/engineering-converter/app`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(page.getByRole("main").getByRole("link", { name: /返回工具介紹|返回工具介绍|Back to tool overview/ })).toHaveAttribute("href", back);
  }
});

test("converter calculates, recovers from invalid input, and restores query state", async ({ page }) => {
  await page.goto("/tools/engineering-converter/app");
  const value = page.getByLabel("數值");
  await value.fill("2R2");
  await expect(page.getByRole("region", { name: "計算結果" })).toContainText("2.2 Ω");
  await expect.poll(() => new URL(page.url()).searchParams.get("value")).toBe("2R2");
  await page.reload();
  await expect(value).toHaveValue("2R2");
  await value.fill("invalid");
  await expect(page.getByText("請輸入有效的工程數值。")).toBeVisible();
  await expect(page.getByRole("region", { name: "計算結果" })).toContainText("2.2 Ω");
});

test("passive and RF examples calculate locally without value network requests", async ({ page }) => {
  for (const [route, tab, expected] of [
    ["/tools/passive-circuit-calculator/app", "RC", "1.59155 kHz"],
    ["/tools/rf-calculator/app", "阻抗與反射", "VSWR"],
  ]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const unexpected: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      const analytics = url.pathname.startsWith("/_vercel/insights/");
      if (!analytics && ["fetch", "xhr"].includes(request.resourceType())) unexpected.push(request.url());
    });
    await page.getByRole("tab", { name: tab }).click();
    await expect(page.getByRole("region", { name: "計算結果" })).toContainText(expected);
    expect(unexpected).toEqual([]);
  }
});

for (const route of ["engineering-converter", "passive-circuit-calculator", "rf-calculator"]) {
  test(`${route} fits a mobile viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(`/tools/${route}/app`);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
