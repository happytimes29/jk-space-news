import { expect, test } from "@playwright/test";

test("owned tool details explain formats and privacy and lead to working examples", async ({ page }) => {
  await page.goto("/tools");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("我做的工具");
  const card = page.getByRole("article");
  await expect(card).toContainText("可使用");
  await expect(card).toContainText("OrCAD HTML");
  await expect(card).toContainText("CSV");
  await expect(card).toContainText("瀏覽器");
  await card.getByRole("link", { name: "工具介紹" }).click();
  await expect(page.getByRole("main")).toContainText("資料不離開瀏覽器");
  await expect(page.getByRole("heading", { name: "支援格式與限制" })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("RefDes");
  await expect(page.getByRole("main")).toContainText("最後更新");
  await expect(page.locator("article time")).toHaveAttribute("datetime", "2026-10-15T00:00:00.000Z");
  await expect(page.locator("article time")).toHaveText("2026-10-15");
  await expect(page.getByRole("link", { name: "工具回饋" })).toHaveAttribute("href", "/contact");
  await page.getByRole("link", { name: "開啟工具", exact: true }).click();
  await expect(page).toHaveURL("/tools/pcb-test-point/app");
  await page.getByRole("button", { name: "載入範例", exact: true }).click();
  await expect(page.getByRole("row", { name: /TP1 Moved/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /TP4 Added/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /TP3 Removed/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /TP2 Unchanged/ })).toBeVisible();
});

test("selecting local reports produces comparison results without network uploads", async ({ page }) => {
  await page.goto("/tools/pcb-test-point/app");
  await page.waitForLoadState("networkidle");
  const unexpectedRequests: string[] = [];
  // Begin after navigation/hydration and before file selection. Observe every
  // browser request, including fetch/XHR reads and writes of any resource type.
  page.on("request", (request) => {
    const url = new URL(request.url());
    const analytics = url.origin === new URL(page.url()).origin && url.pathname.startsWith("/_vercel/insights/");
    if (!analytics && (["fetch", "xhr"].includes(request.resourceType()) || ["POST", "PUT", "PATCH"].includes(request.method()))) {
      unexpectedRequests.push(`${request.method()} ${request.resourceType()} ${request.url()}`);
    }
  });
  const report = (x: number) => Buffer.from(`<table><tr><th>RefDes</th><th>SYM_X</th><th>SYM_Y</th></tr><tr><td>TP1</td><td>${x}</td><td>20</td></tr></table>`);
  await page.locator('input[type="file"]').nth(0).setInputFiles({ name: "private-old.html", mimeType: "text/html", buffer: report(10) });
  await page.locator('input[type="file"]').nth(1).setInputFiles({ name: "private-new.html", mimeType: "text/html", buffer: report(15) });
  await page.locator('input[type="file"]').nth(2).setInputFiles({
    name: "private-outline.dxf", mimeType: "text/plain",
    buffer: Buffer.from("0\nSECTION\n2\nENTITIES\n0\nLINE\n8\nEdge.Cuts\n10\n0\n20\n0\n11\n10\n21\n20\n0\nENDSEC\n0\nEOF"),
  });
  await page.locator('input[type="file"]').nth(3).setInputFiles({ name: "private-targets.txt", mimeType: "text/plain", buffer: Buffer.from("TP1") });
  await expect(page.getByRole("textbox")).toHaveValue("TP1");
  await expect(page.getByRole("row", { name: /TP1 Moved/ })).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(unexpectedRequests).toEqual([]);
});

test("a failed sample download explains how to continue", async ({ page }) => {
  await page.route("**/samples/pcb-test-point-*.html", (route) => route.fulfill({ status: 503, body: "unavailable" }));
  await page.goto("/tools/pcb-test-point/app");
  await page.getByRole("button", { name: "載入範例", exact: true }).click();
  await expect(page.getByRole("region", { name: "隱私與範例" }).getByRole("alert")).toContainText("請重試或選取本機 HTML 報表");
});
