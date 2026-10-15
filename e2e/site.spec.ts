import { expect, test } from "@playwright/test";

test("homepage provides the primary site landmarks", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("PCB tool article leads to the browser application", async ({ page }) => {
  await page.goto("/tools/pcb-test-point");

  await page.getByRole("main").getByRole("link", { name: /開啟工具/ }).click();

  await expect(page).toHaveURL("/tools/pcb-test-point/app");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("PCB");
});
