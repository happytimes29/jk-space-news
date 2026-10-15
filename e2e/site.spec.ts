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

test("project case studies lead from the list to contextual detail pages", async ({ page }) => {
  const projects = [
    { title: "PCB 測試點自動比對工具", slug: "pcb-test-point-comparison", role: "設計與實作", status: "維護中", updatedAt: "2026-06-10" },
    { title: "JK Space 新聞自動化系統（已封存）", slug: "jk-space-news-automation", role: "工作流程整合與網站實作", status: "已封存", updatedAt: "2026-10-14" },
  ];
  await page.goto("/projects");
  for (const project of projects) {
    await expect(page.getByRole("article", { name: project.title })).toBeVisible();
  }
  for (const project of projects) {
    await page.getByRole("link", { name: project.title, exact: true }).click();
    await expect(page).toHaveURL(`/projects/${project.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.title);
    const header = page.getByRole("main").locator("article > header");
    await expect(header).toContainText(project.role);
    await expect(header).toContainText(project.status);
    await expect(header).toContainText("2026");
    await expect(header.locator("time")).toHaveAttribute("datetime", `${project.updatedAt}T00:00:00.000Z`);
    await expect(header.locator("time")).toHaveText(project.updatedAt);
    await expect(header).toContainText("成果");
    await page.getByRole("link", { name: "返回專案列表" }).click();
    await expect(page).toHaveURL("/projects");
  }
});

test("project filters combine and empty results can be reset", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("combobox", { name: "領域" }).selectOption("hardware");
  await page.getByRole("combobox", { name: "狀態" }).selectOption("archived");
  await page.getByRole("button", { name: "套用篩選" }).click();
  await expect(page.getByText("沒有符合篩選條件的專案")).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(0);
  await page.getByRole("link", { name: "清除篩選" }).click();
  await expect(page.getByRole("article")).toHaveCount(2);
});
