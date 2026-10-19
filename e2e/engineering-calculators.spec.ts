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

test("Smith chart edits a network, restores its query, solves matches, and exports locally", async ({ page }) => {
  const unexpected: string[] = [];
  const analyticsPayloads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith("/_vercel/insights/")) analyticsPayloads.push(request.postData() ?? "");
    else if (["fetch", "xhr"].includes(request.resourceType())) unexpected.push(request.url());
  });
  await page.goto("/tools/smith-chart/app");
  await page.getByLabel("負載電阻 R").fill("50");
  await page.getByLabel("負載電抗 X").fill("50");
  await expect(page.getByRole("table", { name: "RF 讀值" })).toContainText("50 + j50 Ω");
  await page.getByLabel("圖表模式").selectOption("admittance");
  await page.getByRole("button", { name: "加入元件" }).click();
  await expect(page.getByText(/步驟 1 · 串聯 L/)).toBeVisible();
  await page.getByLabel("連接方式").selectOption("shunt");
  await page.getByLabel("元件", { exact: true }).selectOption("C");
  await page.getByLabel("元件值").fill("3p3");
  await page.getByRole("button", { name: "加入元件" }).click();
  await page.getByRole("button", { name: "復原" }).click();
  await expect(page.getByText(/步驟 2/)).toHaveCount(0);
  await page.getByRole("button", { name: "重做" }).click();
  await expect(page.getByText(/步驟 2 · 並聯 C/)).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get("step1")).toContain("shunt,C");
  await page.reload();
  await expect(page.getByText(/步驟 2 · 並聯 C/)).toBeVisible();

  await page.getByRole("button", { name: "重設" }).click();
  await page.getByRole("button", { name: "求解 L 型匹配" }).click();
  await expect(page.getByRole("heading", { name: "低通型" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "高通型" })).toBeVisible();
  await expect(page.getByText("E24 標準值").first()).toBeVisible();
  await page.getByRole("button", { name: "套用方案" }).first().click();
  await expect(page.getByText(/步驟 2/)).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出 PNG" }).click();
  await expect((await download).suggestedFilename()).toBe("smith-chart.png");
  expect(unexpected).toEqual([]);
  expect(analyticsPayloads.join(" ")).not.toMatch(/(?:25|50|1000000000|step\d|frequency|reference)/i);
});

test("Smith chart supports keyboard input, mobile layout, and every visible locale", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const locales = preview
    ? [["", "負載電阻 R"], ["/zh-cn", "负载电阻 R"], ["/en", "Load resistance R"]]
    : [["", "負載電阻 R"]];
  for (const [prefix, resistance] of locales) {
    await page.goto(`${prefix}/tools/smith-chart/app`);
    const input = page.getByLabel(resistance);
    await input.focus();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.type("75");
    await expect(input).toHaveValue("75");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test("Transmission Line analyzes and synthesizes all three geometry models", async ({ page }) => {
  const unexpected: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!url.pathname.startsWith("/_vercel/insights/") && ["fetch", "xhr"].includes(request.resourceType())) unexpected.push(request.url());
  });
  await page.goto("/tools/transmission-line/app");
  for (const [kind, formula] of [["microstrip", "Hammerstad–Jensen"], ["stripline", "Wheeler 1965"], ["cpwg", "Qucs 技術指南"]]) {
    await page.getByLabel("模型", { exact: true }).selectOption(kind);
    await expect(page.getByText(new RegExp(formula))).toBeVisible();
    const impedance = Number((await page.getByTestId("impedance-value").textContent())?.split(" ")[0]);
    expect(impedance).toBeGreaterThan(0);
    await page.getByLabel("模式").selectOption("target");
    await page.getByLabel("目標阻抗").fill(String(impedance));
    await page.getByRole("button", { name: "求解寬度" }).click();
    await expect(page.getByText(/^求解寬度:/)).toBeVisible();
    await page.getByLabel("模式").selectOption("forward");
  }
  expect(unexpected).toEqual([]);
});

test("Transmission Line preserves SI geometry across units, query reload, keyboard, and locales", async ({ page }) => {
  await page.goto("/tools/transmission-line/app");
  const width = page.getByLabel("走線寬度");
  await width.focus();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("3");
  const before = await page.getByTestId("impedance-value").textContent();
  await page.getByLabel("顯示單位").selectOption("mil");
  await expect(width).toHaveValue(/118\.110/);
  await expect(page.getByTestId("impedance-value")).toHaveText(before!);
  await expect.poll(() => new URL(page.url()).searchParams.get("widthM")).toBe("0.003");
  await page.reload();
  await expect(page.getByLabel("顯示單位")).toHaveValue("mil");
  await expect(width).toHaveValue(/118\.110/);

  if (preview) {
    for (const [route, heading] of [["/zh-cn/tools/transmission-line/app", "PCB 传输线阻抗与线宽计算器"], ["/en/tools/transmission-line/app", "PCB Transmission Line Impedance and Width Calculator"]]) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    }
  }
});

for (const route of ["engineering-converter", "passive-circuit-calculator", "rf-calculator", "smith-chart", "transmission-line"]) {
  test(`${route} fits a mobile viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(`/tools/${route}/app`);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
