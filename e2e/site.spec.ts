import { expect, test } from "@playwright/test";

test("retired entry points redirect permanently and article URLs return noindex 404", async ({ page, request }) => {
  for (const [source, destination] of [["/news", "/notes"], ["/trending", "/notes"], ["/profile", "/about"], ["/interview", "/about"], ["/interview/previous-guest", "/about"]]) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(destination);
  }
  for (const slug of ["ai-digest-2026-08-09-1531", "never-published"]) {
    const response = await page.goto(`/news/${slug}`);
    expect(response?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    await expect(page.getByRole("navigation", { name: "繼續探索" })).toBeVisible();
  }
});

test("homepage provides the primary site landmarks", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("homepage introduces real work and reaches collaboration at every supported width", async ({ page }) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);
    const hero = page.getByRole("region", { name: "把工程上的麻煩事，做成好用的工具。" });
    for (const [label, href] of [["查看專案", "/projects"], ["使用工具", "/tools"]]) {
      const cta = hero.getByRole("link", { name: label, exact: true });
      await expect(cta).toHaveAttribute("href", href);
      await expect(cta).toBeInViewport();
    }
    const projects = page.getByRole("region", { name: "精選專案" });
    await expect(projects.getByRole("article").nth(1)).toBeVisible();
    for (const slug of ["pcb-test-point-comparison", "jk-space-news-automation"]) {
      await expect(projects.locator(`a[href="/projects/${slug}"]`)).toBeVisible();
    }
    await expect(page.getByRole("region", { name: "精選工具" }).getByRole("link", { name: "立即使用" })).toHaveAttribute("href", "/tools/pcb-test-point/app");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole("link", { name: "聯絡我", exact: true }).click();
    await expect(page).toHaveURL("/contact");
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toContainText("聯絡");
  }
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

test("Notes categories preserve the honest empty collection without legacy news paths", async ({ page }) => {
  await page.goto("/notes");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("筆記與觀點");
  for (const [label, type] of [["工程筆記", "engineering"], ["AI 與自動化", "automation"], ["專案紀錄", "project-log"], ["新聞觀點", "commentary"]]) {
    await page.getByRole("navigation", { name: "筆記分類" }).getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(`/notes?type=${type}`);
    await expect(page.getByText("筆記正在整理中")).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);
    await expect(page.locator('a[href^="/news"]')).toHaveCount(0);
  }
  await page.getByRole("navigation", { name: "筆記分類" }).getByRole("link", { name: "全部" }).click();
  await expect(page).toHaveURL("/notes");
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const response = await page.goto("/notes/no-placeholder");
  expect(response?.status()).toBe(404);
});

test("About connects verified expertise, real work, and enabled external profiles", async ({ page }) => {
  await page.goto("/about");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { level: 1 })).toHaveText("關於我");
  for (const name of ["簡介", "專業領域", "工作方法", "經歷時間線", "目前關注方向", "外部連結"]) {
    await expect(main.getByRole("region", { name })).toBeVisible();
  }
  await expect(main).toContainText("15+ 年");
  await main.getByRole("link", { name: "PCB 測試點自動比對工具", exact: true }).click();
  await expect(page).toHaveURL("/projects/pcb-test-point-comparison");
  await page.goBack();
  for (const [label, href] of [["GitHub", "https://github.com/happytimes29"], ["Telegram", "https://t.me/JK_Sapce"]]) {
    const link = main.getByRole("region", { name: "外部連結" }).getByRole("link", { name: label, exact: true });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  await main.getByRole("link", { name: "聯絡我", exact: true }).click();
  await expect(page).toHaveURL("/contact");
  await expect(main.getByRole("heading", { level: 1 })).toHaveText("聯絡我");
  await expect(main.getByRole("link")).toHaveCount(2);
  await expect(main.locator("form, input, textarea")).toHaveCount(0);
  await expect(main.locator('a[href^="mailto:"]')).toHaveCount(0);
});

test("trust pages and missing-page recovery stay usable on narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const route of ["/about", "/contact", "/privacy"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.getByRole("main").getByRole("link", { name: "聯絡頁" }).click();
  await expect(page).toHaveURL("/contact");

  const response = await page.goto("/missing-engineering-page");
  expect(response?.status()).toBe(404);
  const recovery = page.getByRole("main").getByRole("navigation", { name: "繼續探索" });
  for (const [label, href] of [["回到首頁", "/"], ["專案", "/projects"], ["工具", "/tools"], ["筆記與觀點", "/notes"]]) {
    await expect(recovery.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", href);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await recovery.getByRole("link", { name: "專案", exact: true }).click();
  await expect(page).toHaveURL("/projects");
});
