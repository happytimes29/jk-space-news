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

test("shareable calculator URLs hydrate without errors and survive reloads", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  for (const [route, activeTab] of [
    ["/tools/engineering-converter/app?mode=rf&value=10&from=dBm&impedance=75", "RF 功率"],
    ["/tools/passive-circuit-calculator/app?mode=divider&dividerMode=evaluate&vin=12&rTop=10k&rBottom=20k&tolerance=5", "分壓"],
    ["/tools/passive-circuit-calculator/app?mode=attenuator&attenuation=6&z0=50&topology=pi&inputPower=1", "衰減器"],
    ["/tools/rf-calculator/app?mode=impedance&impedanceInput=gamma&real=-0.3333333333&imaginary=0&z0=50", "阻抗與反射"],
  ]) {
    await page.goto(route);
    await expect(page.getByRole("tab", { selected: true })).toHaveText(activeTab);
    if (route.includes("dividerMode=evaluate")) {
      await expect(page.getByLabel("分壓工作模式")).toHaveValue("evaluate");
      await expect(page.getByLabel("輸入電壓")).toHaveValue("12");
    }
    await page.reload();
    await expect(page.getByRole("tab", { selected: true })).toHaveText(activeTab);
  }

  expect(errors.filter((message) => /hydration|did not match|uncaught/i.test(message))).toEqual([]);
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

test("RF calculator represents ideal short and open limits", async ({ page }) => {
  await page.goto("/tools/rf-calculator/app");
  await page.getByRole("tab", { name: "阻抗與反射" }).click();
  const result = page.getByRole("region", { name: "計算結果" });

  await page.getByLabel("電阻 R").fill("0");
  await expect(result).toContainText("短路");
  await expect(result).toContainText("-1 + j0");

  await page.getByLabel("RF 換算起始量").selectOption("gamma");
  await page.getByLabel("Γ 實部").fill("1");
  await expect(result).toContainText("開路");
  await expect(result).toContainText("1 + j0");
  await expect(page.getByText("請輸入有限且符合物理範圍的數值。")).toHaveCount(0);
});

test("Smith chart edits a network, restores its query, solves matches, and exports locally", async ({ page }) => {
  const unexpected: string[] = [];
  const analyticsPayloads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith("/_vercel/insights/")) analyticsPayloads.push(request.postData() ?? "");
    else if (["fetch", "xhr"].includes(request.resourceType())) unexpected.push(request.url());
  });
  await page.addInitScript(() => {
    const exportWindow = window as typeof window & { __smithExportBlobs?: Blob[] };
    const nativeCreateObjectUrl = URL.createObjectURL.bind(URL);
    exportWindow.__smithExportBlobs = [];
    URL.createObjectURL = (blob: Blob | MediaSource) => {
      if (blob instanceof Blob) exportWindow.__smithExportBlobs?.push(blob);
      return nativeCreateObjectUrl(blob);
    };
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
  await expect(page.getByText("標準值系列: E24").first()).toBeVisible();
  await page.getByLabel("負載電阻 R").fill("30");
  await expect(page.getByRole("region", { name: "匹配方案" })).toHaveCount(0);
  await page.getByLabel("負載電阻 R").fill("25");
  await page.getByRole("button", { name: "求解 L 型匹配" }).click();
  await page.getByRole("button", { name: "套用方案" }).first().click();
  await expect(page.getByText(/步驟 2/)).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出 PNG" }).click();
  await expect((await download).suggestedFilename()).toBe("smith-chart.png");
  const nonWhitePixels = await page.evaluate(async () => {
    const exportWindow = window as typeof window & { __smithExportBlobs?: Blob[] };
    const png = [...(exportWindow.__smithExportBlobs ?? [])].reverse().find((blob) => blob.type === "image/png");
    if (!png) return 0;
    const url = URL.createObjectURL(png);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      if (!context) return 0;
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, 1024, 1024).data;
      let count = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index] < 245 || pixels[index + 1] < 245 || pixels[index + 2] < 245) count += 1;
      }
      return count;
    } finally {
      URL.revokeObjectURL(url);
    }
  });
  expect(nonWhitePixels).toBeGreaterThan(10_000);
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
  for (const [kind, formula] of [["microstrip", "Hammerstad–Jensen"], ["stripline", "Steer 3.7.1"], ["cpwg", "Qucs 技術指南"]]) {
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

test("attenuator topology cards hydrate, support keyboard selection, and keep extreme labels inside the diagram", async ({ page }) => {
  await page.goto("/tools/passive-circuit-calculator/app?mode=attenuator&attenuation=6&z0=50&topology=pi&inputPower=0");
  const diagram = page.getByRole("img", { name: "衰減器電路圖" });
  const pi = page.getByRole("radio", { name: "π 型網路" });
  const tee = page.getByRole("radio", { name: "T 型網路" });
  await expect(pi).toBeChecked();
  await expect(diagram.getByTestId("attenuator-pi-network")).toBeVisible();
  await expect(diagram.getByTestId("attenuator-diagram-output-power")).toContainText("0 W");

  await pi.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(tee).toBeChecked();
  await page.keyboard.press("ArrowRight");
  await expect(pi).toBeChecked();
  await expect.poll(() => new URL(page.url()).searchParams.get("topology")).toBe("pi");

  await page.getByLabel("輸入功率").fill("1");
  await page.getByLabel("衰減量").fill("0.001");
  const labels = ["attenuator-diagram-r1", "attenuator-diagram-r2", "attenuator-diagram-r3"];
  const diagramBox = await diagram.boundingBox();
  expect(diagramBox).not.toBeNull();
  for (const testId of labels) {
    const label = diagram.getByTestId(testId);
    await expect(label).toBeVisible();
    const box = await label.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(diagramBox!.x);
    expect(box!.x + box!.width).toBeLessThanOrEqual(diagramBox!.x + diagramBox!.width);
  }
});

test("RF diagrams update across propagation inputs, recover from medium conflicts, and cover reflection limits", async ({ page }) => {
  await page.goto("/tools/rf-calculator/app");
  const propagation = page.getByRole("img", { name: "RF 傳播示意圖" });
  await expect(propagation).toContainText("100 mm");

  await page.getByLabel("換算起始量").selectOption("angle");
  await page.getByLabel("輸入電氣角度").fill("180");
  await expect(propagation.getByTestId("propagation-length")).toContainText("149.896 mm");
  await page.getByLabel("換算起始量").selectOption("delay");
  await page.getByLabel("輸入傳播延遲").fill("1n");
  await expect(propagation.getByTestId("propagation-length")).toContainText("299.792 mm");

  await page.getByLabel("有效相對介電常數 εeff").fill("4");
  await page.getByLabel("速度因子").fill("0.5");
  await expect(page.getByLabel("有效相對介電常數 εeff")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("速度因子")).toHaveAttribute("aria-invalid", "true");
  await expect(propagation).toHaveAttribute("data-stale", "true");
  await page.getByLabel("速度因子").fill("");
  await expect(propagation).not.toHaveAttribute("data-stale", "true");
  await expect(propagation.getByTestId("propagation-medium")).toContainText("εeff = 4");

  await page.getByRole("tab", { name: "阻抗與反射" }).click();
  const reflection = page.getByRole("img", { name: "RF 反射示意圖" });
  await expect(reflection).toContainText("無反射波");
  await page.getByLabel("電阻 R").fill("0");
  await expect(reflection.getByTestId("short-load")).toBeVisible();
  await page.getByLabel("RF 換算起始量").selectOption("gamma");
  await page.getByLabel("Γ 實部").fill("1");
  await expect(reflection.getByTestId("open-load")).toBeVisible();
  await page.getByLabel("Γ 實部").fill("0");
  await page.getByLabel("Γ 虛部").fill("1");
  await expect(reflection.getByTestId("finite-load")).toBeVisible();
  await expect(reflection).toContainText("0 + j1");
});

test("RF Smith link preserves locale and matching solutions include live schematics", async ({ page }) => {
  await page.goto("/tools/rf-calculator/app?mode=impedance");
  await expect(page.getByRole("link", { name: "在史密斯圖中開啟" })).toHaveAttribute("href", "/tools/smith-chart/app");

  if (preview) {
    await page.goto("/en/tools/rf-calculator/app?mode=impedance");
    await expect(page.getByRole("link", { name: "Open in Smith chart" })).toHaveAttribute("href", "/en/tools/smith-chart/app");
  }

  await page.goto("/tools/smith-chart/app");
  await page.getByRole("button", { name: "求解 L 型匹配" }).click();
  const diagrams = page.getByRole("img", { name: /匹配網路示意圖/ });
  await expect(diagrams).toHaveCount(2);
  await expect(diagrams.first().getByTestId("matching-step-0-ideal")).toContainText("理想值");
  await expect(diagrams.first().getByTestId("matching-step-0-rounded")).toContainText("標準值結果");
});

test("all transmission-line cross-sections show live values and retain a valid SI snapshot", async ({ page }) => {
  await page.goto("/tools/transmission-line/app");
  const diagram = page.getByRole("img", { name: "傳輸線幾何" });
  for (const [kind, dimension] of [["microstrip", "h"], ["stripline", "b"], ["cpwg", "s"]]) {
    await page.getByLabel("模型", { exact: true }).selectOption(kind);
    await expect(diagram).toContainText(dimension);
    await expect(diagram).toContainText("Z₀");
    await expect(diagram).toContainText("電氣角度");
  }

  await page.getByLabel("模型", { exact: true }).selectOption("microstrip");
  await page.getByLabel("走線寬度").fill("4");
  await expect(diagram).toContainText("4 mm");
  await page.getByLabel("走線寬度").fill("-1");
  await expect(diagram).toHaveAttribute("data-stale", "true");
  await expect(page.getByText("目前輸入無效，圖中顯示最後一次有效結果。")).toBeVisible();
  await page.getByLabel("顯示單位").selectOption("mil");
  await expect(diagram).toContainText(/157\.4803.*mil/);
});

test("new RF diagrams remain visible without page overflow across widths and color schemes", async ({ page }) => {
  const routesAndDiagrams = [
    ["/tools/passive-circuit-calculator/app?mode=attenuator", "衰減器電路圖"],
    ["/tools/rf-calculator/app", "RF 傳播示意圖"],
    ["/tools/transmission-line/app", "傳輸線幾何"],
  ];
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const [route, name] of routesAndDiagrams) {
        await page.goto(route);
        await expect(page.getByRole("img", { name })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      }
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

test("long divider load values remain inside the circuit diagram", async ({ page }) => {
  await page.goto("/tools/passive-circuit-calculator/app?mode=divider&dividerMode=evaluate&vin=12&rTop=10k&rBottom=20k&tolerance=1&load=123456");

  const diagram = page.getByRole("img", { name: "分壓器電路圖" });
  const loadLabel = diagram.getByTestId("divider-diagram-load");
  await expect(loadLabel).toHaveText("123.456 kΩ");

  const [diagramBox, labelBox] = await Promise.all([diagram.boundingBox(), loadLabel.boundingBox()]);
  expect(diagramBox).not.toBeNull();
  expect(labelBox).not.toBeNull();
  expect(labelBox!.x).toBeGreaterThanOrEqual(diagramBox!.x);
  expect(labelBox!.x + labelBox!.width).toBeLessThanOrEqual(diagramBox!.x + diagramBox!.width);
});

test("loaded divider keeps the output value clear of the load resistor", async ({ page }) => {
  await page.goto("/tools/passive-circuit-calculator/app?mode=divider&dividerMode=evaluate&vin=12&rTop=10k&rBottom=20k&tolerance=1&load=100k");

  const diagram = page.getByRole("img", { name: "分壓器電路圖" });
  const [outputBox, resistorBox] = await Promise.all([
    diagram.getByTestId("divider-diagram-vout").boundingBox(),
    diagram.getByTestId("divider-diagram-load-resistor").boundingBox(),
  ]);
  expect(outputBox).not.toBeNull();
  expect(resistorBox).not.toBeNull();

  const overlaps = !(
    outputBox!.x + outputBox!.width <= resistorBox!.x
    || resistorBox!.x + resistorBox!.width <= outputBox!.x
    || outputBox!.y + outputBox!.height <= resistorBox!.y
    || resistorBox!.y + resistorBox!.height <= outputBox!.y
  );
  expect(overlaps).toBe(false);
});
