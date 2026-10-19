import { expect, test } from "@playwright/test";
import { loadNotes } from "../lib/notes";

test("retired entry points redirect permanently and article URLs return noindex 404", async ({ page, request }) => {
  for (const [source, destination] of [["/news", "/notes"], ["/trending", "/notes"], ["/profile", "/about"], ["/interview", "/notes"], ["/interview/previous-guest", "/notes"]]) {
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
  await expect(page.getByRole("region", { name: "把工程上的麻煩事，做成好用的工具。" }).getByText(/這裡是我的個人工程實驗室/)).toBeVisible();
});

test("three locale roots and About pages keep stable URLs and document languages", async ({ page }) => {
  for (const [route, lang] of [["/", "zh-Hant-TW"], ["/zh-cn", "zh-Hans-CN"], ["/en", "en"]]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
  }
  for (const [route, lang, heading] of [["/about", "zh-Hant-TW", "關於我"], ["/zh-cn/about", "zh-Hans-CN", "关于我"], ["/en/about", "en", "About"]]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveText(heading);
  }
});

test("desktop and mobile language controls persist an explicit choice", async ({ page, context }) => {
  await context.addCookies([{ name: "jk-locale", value: "zh-TW", url: "http://127.0.0.1:3000" }]);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/about?source=language#about-focus");
  await page.getByRole("group", { name: "選擇語言" }).getByRole("button", { name: "English" }).click();
  await expect(page).toHaveURL("/en/about?source=language#about-focus");
  await expect.poll(async () => (await context.cookies()).find(({ name }) => name === "jk-locale")?.value).toBe("en");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.setViewportSize({ width: 320, height: 740 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("navigation", { name: "Mobile primary navigation" }).getByRole("group", { name: "Choose a language" }).getByRole("button", { name: "简体中文" }).click();
  await expect(page).toHaveURL("/zh-cn/about?source=language#about-focus");
  await expect.poll(async () => (await context.cookies()).find(({ name }) => name === "jk-locale")?.value).toBe("zh-CN");
});

test("browser language offers a non-blocking suggestion without forced navigation", async ({ page, context }) => {
  await context.clearCookies();
  await page.addInitScript(() => {
    window.localStorage.removeItem("jk-locale-suggestion-dismissed");
    Object.defineProperty(window.navigator, "languages", { configurable: true, get: () => ["en-US", "en"] });
  });
  await page.goto("/about");
  await expect(page).toHaveURL("/about");
  const suggestion = page.getByRole("status");
  await expect(suggestion).toContainText("要切換顯示語言嗎？");
  await expect(suggestion.getByRole("button", { name: "切換語言: English" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveText("關於我");
  await suggestion.getByRole("button", { name: "維持繁體中文" }).click();
  await expect(suggestion).toHaveCount(0);
  await expect(page).toHaveURL("/about");
});

test("invalid locales and missing translated details are true 404 responses", async ({ page }) => {
  for (const route of ["/fr/about", "/en/projects/jk-space-news-automation", "/zh-cn/tools/not-translated"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(404);
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  }
});

// These journeys catch broken mobile-menu links as well as desktop navigation.
for (const width of [320, 1440]) {
  test(`all six primary navigation destinations are reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    for (const [label, href] of [["首頁", "/"], ["專案", "/projects"], ["工具", "/tools"], ["筆記與觀點", "/notes"], ["關於我", "/about"], ["聯絡", "/contact"]]) {
      if (width < 768) await page.getByRole("button", { name: "開啟選單" }).click();
      const navigation = page.getByRole("navigation", { name: width < 768 ? "行動版主導覽" : "主導覽", exact: true });
      await navigation.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(href);
      await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
}

for (const shortcut of ["Meta+k", "Control+k"]) {
  test(`${shortcut} searches and keyboard-selects both project and tool`, async ({ page }) => {
    await page.goto("/");
    for (const [type, destination] of [["專案", "/projects/pcb-test-point-comparison"], ["工具", "/tools/pcb-test-point"]]) {
      await page.keyboard.press(shortcut);
      const search = page.getByRole("textbox", { name: "搜尋專案、工具與筆記" });
      await expect(search).toBeFocused();
      await search.fill("PCB");
      await expect(page.getByRole("button", { name: `PCB 測試點自動比對工具 ${type}`, exact: true })).toBeVisible();
      // Search ordering is projects followed by tools; exercise down/up selection.
      await page.keyboard.press("ArrowDown");
      if (type === "專案") await page.keyboard.press("ArrowUp");
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(destination);
      await expect(search).toHaveCount(0);
    }
  });
}

for (const width of [320, 768, 1440]) {
  test(`representative public pages fit ${width}px without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/projects", "/projects/pcb-test-point-comparison", "/projects/jk-space-news-automation", "/tools", "/tools/pcb-test-point", "/notes", "/about", "/contact", "/privacy"]) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), route).toBe(true);
    }
  });
}

test("reduced motion disables page and search animation and transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("textbox", { name: "搜尋專案、工具與筆記" })).toBeVisible();
  // Query the page document, excluding the development toolbar's shadow root.
  const movingElements = await page.evaluate(() => Array.from(document.querySelectorAll("body *")).filter((element) =>
    [null, "::before", "::after"].some((pseudo) => {
      const style = getComputedStyle(element, pseudo);
      return [...style.animationDuration.split(","), ...style.transitionDuration.split(",")].some((duration) => parseFloat(duration) > 0.001);
    })
  ).map((element) => element.tagName));
  expect(movingElements).toEqual([]);
});

test("Contact renders real linked channels without placeholder email or inert social controls", async ({ page }) => {
  await page.goto("/contact");
  const main = page.getByRole("main");
  await expect(main).not.toContainText("jk@example.com");
  await expect(main.locator("a:not([href]), a[href=''], a[href='#'], button")).toHaveCount(0);
  await expect(main.getByRole("link", { name: "GitHub", exact: true })).toHaveAttribute("href", "https://github.com/happytimes29");
  await expect(main.getByRole("link", { name: "Telegram", exact: true })).toHaveAttribute("href", "https://t.me/JK_Sapce");
});

test("RSS serves the original Notes feed without retired articles", async ({ page, request }) => {
  const notes = loadNotes();
  const response = await request.get("/feed.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/rss+xml");
  const source = await response.text();
  expect(source).toContain("<title>JK Space</title>");
  expect(source).toContain("<link>https://jk-space.com/notes</link>");
  const items = await page.evaluate((xml) => {
    const document = new DOMParser().parseFromString(xml, "application/xml");
    if (document.querySelector("parsererror")) throw new Error("Invalid RSS XML");
    return Array.from(document.querySelectorAll("item")).map((item) => ({
      title: item.querySelector("title")?.textContent,
      link: item.querySelector("link")?.textContent,
      summary: item.querySelector("description")?.textContent,
    }));
  }, source);
  expect(items).toEqual(notes.map((note) => ({ title: note.title, link: `https://jk-space.com/notes/${encodeURIComponent(note.slug)}`, summary: note.summary })));
  expect(source).not.toContain("https://jk-space.com/news/");
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

test("PCB browser tool parses the public example without uploading user data", async ({ page }) => {
  const requests: Array<{ method: string; pathname: string }> = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin === "http://127.0.0.1:3000") requests.push({ method: request.method(), pathname: url.pathname });
  });
  await page.goto("/tools/pcb-test-point/app");
  requests.splice(0);
  await page.getByRole("button", { name: "載入範例" }).click();
  await expect(page.getByRole("button", { name: "All 4", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Moved 1", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Added 1", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Removed 1", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Unchanged 1", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "TP1", exact: true })).toBeVisible();
  expect(requests).toEqual(expect.arrayContaining([
    { method: "GET", pathname: "/samples/pcb-test-point-old.html" },
    { method: "GET", pathname: "/samples/pcb-test-point-new.html" },
  ]));
  expect(requests.filter(({ method }) => method !== "GET")).toEqual([]);
});

test("analytics removes query and hash data before a pageview can be sent", async ({ page }) => {
  await page.goto("/tools/pcb-test-point/app?board=private-customer#upload");
  await expect.poll(() => page.evaluate(() => Boolean(window.vaq?.some(([event]) => event === "beforeSend")))).toBe(true);
  const sanitized = await page.evaluate(() => {
    const registration = window.vaq?.find(([event]) => event === "beforeSend");
    if (!registration) throw new Error("beforeSend was not registered");
    const beforeSend = registration[1] as (event: { type: "pageview"; url: string }) => unknown;
    return beforeSend({ type: "pageview", url: window.location.href });
  });
  expect(sanitized).toEqual({ type: "pageview", url: "http://127.0.0.1:3000/tools/pcb-test-point/app" });
});

test("ResearchMFG local archive is not exposed by the public site", async ({ page, request }) => {
  for (const route of ["/researchmfg-library", "/researchmfg", "/archive/researchmfg"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(404);
  }
  for (const route of ["/", "/sitemap.xml", "/feed.xml"]) {
    const response = await request.get(route);
    expect((await response.text()).toLowerCase()).not.toContain("researchmfg");
  }
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

test("Notes categories show published content or its honest empty state without legacy news paths", async ({ page }) => {
  const notes = loadNotes();
  await page.goto("/notes");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("筆記與觀點");
  for (const [label, type] of [["工程筆記", "engineering"], ["AI 與自動化", "automation"], ["專案紀錄", "project-log"], ["新聞觀點", "commentary"]]) {
    await page.getByRole("navigation", { name: "筆記分類" }).getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(`/notes?type=${type}`);
    const expected = notes.filter((note) => note.type === type);
    await expect(page.getByRole("article")).toHaveCount(expected.length);
    if (expected.length === 0) {
      await expect(page.getByText(notes.length === 0 ? "筆記正在整理中" : "沒有符合分類的筆記", { exact: true })).toBeVisible();
    }
    for (const note of expected) {
      await expect(page.getByRole("article", { name: note.title, exact: true }).getByRole("link", { name: note.title, exact: true })).toHaveAttribute("href", `/notes/${encodeURIComponent(note.slug)}`);
    }
    await expect(page.locator('a[href^="/news"]')).toHaveCount(0);
  }
  await page.getByRole("navigation", { name: "筆記分類" }).getByRole("link", { name: "全部" }).click();
  await expect(page).toHaveURL("/notes");
  await expect(page.getByRole("article")).toHaveCount(notes.length);
  if (notes.length > 0) {
    const note = notes[0];
    await page.getByRole("article", { name: note.title, exact: true }).getByRole("link", { name: note.title, exact: true }).click();
    await expect(page).toHaveURL(`/notes/${encodeURIComponent(note.slug)}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(note.title);
    await page.goBack();
    await expect(page).toHaveURL("/notes");
  }
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  let missingSlug = "no-placeholder";
  while (notes.some((note) => note.slug === missingSlug)) missingSlug += "-missing";
  const response = await page.goto(`/notes/${missingSlug}`);
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
