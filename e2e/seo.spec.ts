import { expect, test } from "@playwright/test";
import { getAllNotes, loadNotes } from "../lib/notes";
import { getAllProjects } from "../lib/projects";
import { getAllTools } from "../lib/tools";
import { LOCALES } from "../lib/i18n/locales";

test("every public entry and filtered list advertises its canonical page identity", async ({ page, request }) => {
  for (const [route, canonical, title, description] of [
    ["/", "/", "JK Space — 個人工程實驗室", "硬體研發、AI 自動化、工程工具與技術觀點。"],
    ["/projects", "/projects", "專案 | JK Space", "JK Space 的工程案例：記錄實際問題、角色、限制、關鍵決策與成果。"],
    ["/projects?area=hardware&status=maintained", "/projects", "專案 | JK Space", "JK Space 的工程案例：記錄實際問題、角色、限制、關鍵決策與成果。"],
    ["/tools", "/tools", "我做的工具 | JK Space", "JK Space 開發的工程工具：用途、格式、限制與資料處理方式。"],
    ["/notes", "/notes", "筆記與觀點 | JK Space", "JK Space 的原創工程筆記、AI 與自動化、專案紀錄與新聞觀點。"],
    ["/notes?type=engineering", "/notes", "筆記與觀點 | JK Space", "JK Space 的原創工程筆記、AI 與自動化、專案紀錄與新聞觀點。"],
    ["/about", "/about", "關於我 | JK Space", "15+ 年硬體研發經驗，從高頻電路與系統架構，延伸至 AI 自動化與獨立產品實驗。"],
    ["/contact", "/contact", "聯絡我 | JK Space", "JK Space 的技術交流、工具回饋與合作討論管道。"],
    ["/privacy", "/privacy", "隱私權政策 | JK Space", "JK Space 的網站連線、匿名瀏覽統計與 PCB 工具檔案處理說明。"],
  ]) {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    const source = await response.text();
    const openGraphTitle = route === "/" ? `${title} | JK Space` : title;
    expect(source).toContain(`<title>${title}</title>`);
    expect(source).toContain(`property="og:title" content="${openGraphTitle}"`);
    expect(source).toContain(`property="og:description" content="${description}"`);
    await page.goto(route);
    const canonicalUrl = new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!);
    expect(canonicalUrl.origin).toBe("https://jk-space.com");
    expect(canonicalUrl.pathname).toBe(canonical);
    expect(canonicalUrl.search).toBe("");
    const graphUrl = new URL((await page.locator('meta[property="og:url"]').getAttribute("content"))!);
    expect(graphUrl.href).toBe(canonicalUrl.href);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", description);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "JK Space");
  }
});

test("published page source carries its own canonical, social image and structured data", async ({ page, request }) => {
  for (const [route, types, imageType] of [
    ["/", ["Person", "WebSite"], null],
    ["/projects/pcb-test-point-comparison", ["CreativeWork", "BreadcrumbList"], "project"],
    ["/projects/jk-space-news-automation", ["CreativeWork", "BreadcrumbList"], "project"],
    ["/tools/pcb-test-point", ["SoftwareApplication", "BreadcrumbList"], "tool"],
  ] as const) {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    const source = await response.text();
    expect(source).toContain('type="application/ld+json"');
    await page.goto(route);
    const canonical = new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!);
    expect(canonical.origin).toBe("https://jk-space.com");
    expect(canonical.pathname).toBe(route);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "JK Space");
    const imageUrl = new URL((await page.locator('meta[property="og:image"]').getAttribute("content"))!);
    expect(imageUrl.pathname).toBe("/api/og");
    expect(imageUrl.searchParams.get("type")).toBe(imageType);
    expect(imageUrl.searchParams.get("title")).toBeTruthy();
    const data = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent!)));
    expect(data.map((item) => item["@type"])).toEqual(types);
    if (route !== "/") expect(data[0].url).toBe(`https://jk-space.com${route}`);
  }
});

test("localized pages agree on lang, canonical, hreflang, Open Graph, and JSON-LD", async ({ page }) => {
  const languages = {
    "zh-Hant-TW": "https://jk-space.com/about",
    "zh-Hans-CN": "https://jk-space.com/zh-cn/about",
    en: "https://jk-space.com/en/about",
    "x-default": "https://jk-space.com/about",
  };
  for (const [route, lang, ogLocale] of [["/about", "zh-Hant-TW", "zh_TW"], ["/zh-cn/about", "zh-Hans-CN", "zh_CN"], ["/en/about", "en", "en_US"]]) {
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    expect(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).pathname).toBe(route);
    for (const [hreflang, href] of Object.entries(languages)) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`)).toHaveAttribute("href", href);
    }
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", ogLocale);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://jk-space.com${route}`);
  }

  await page.goto("/en");
  const graphs = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent!)));
  expect(graphs).toMatchObject([
    { "@type": "Person", "@id": "https://jk-space.com/#person", url: "https://jk-space.com/en/about", inLanguage: "en" },
    { "@type": "WebSite", "@id": "https://jk-space.com/#website", url: "https://jk-space.com/en", inLanguage: "en" },
  ]);
});

test("crawl endpoints contain only public portfolio content", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const source = await sitemap.text();
  const locations = [...source.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const publishedContent = await Promise.all(LOCALES.flatMap((locale) => [
    getAllProjects({ locale, visibility: "production" }),
    getAllTools({ locale, visibility: "production" }),
    getAllNotes({ locale, visibility: "production" }),
  ]));
  const localizedApps = (await Promise.all(LOCALES.map((locale) => getAllTools({ locale, visibility: "production" })))).flat().filter((tool) => tool.localizedApp).length;
  expect(locations).toHaveLength(LOCALES.length * 7 + publishedContent.reduce((count, items) => count + items.length, 0) + localizedApps);
  expect(locations).toEqual(expect.arrayContaining([
    "https://jk-space.com/", "https://jk-space.com/zh-cn", "https://jk-space.com/en",
    "https://jk-space.com/about", "https://jk-space.com/zh-cn/about", "https://jk-space.com/en/about",
    "https://jk-space.com/projects/jk-space-news-automation", "https://jk-space.com/projects/pcb-test-point-comparison", "https://jk-space.com/tools/pcb-test-point",
    "https://jk-space.com/zh-cn/projects/pcb-test-point-comparison", "https://jk-space.com/en/projects/pcb-test-point-comparison",
    "https://jk-space.com/zh-cn/tools/pcb-test-point", "https://jk-space.com/en/tools/pcb-test-point",
    "https://jk-space.com/tools/engineering-converter/app", "https://jk-space.com/tools/passive-circuit-calculator/app", "https://jk-space.com/tools/rf-calculator/app",
    "https://jk-space.com/tools/smith-chart/app",
    ...loadNotes().map((note) => `https://jk-space.com/notes/${encodeURIComponent(note.slug)}`),
  ]));
  expect(source).toContain('<xhtml:link rel="alternate" hreflang="en" href="https://jk-space.com/en/projects/pcb-test-point-comparison" />');
  expect(source).toContain('hreflang="zh-Hant-TW"');
  expect(source).toContain('hreflang="zh-Hans-CN"');
  expect(source).toContain('hreflang="en"');
  expect(source).toContain('hreflang="x-default"');
  expect(source).not.toContain("https://jk-space.com/news/");
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toBe("User-Agent: *\nAllow: /\n\nUser-Agent: Googlebot\nAllow: /\n\nUser-Agent: Bingbot\nAllow: /\n\nUser-Agent: OAI-SearchBot\nAllow: /\n\nUser-Agent: GPTBot\nDisallow: /\n\nSitemap: https://jk-space.com/sitemap.xml\n");

  const feed = await request.get("/feed.xml");
  expect(feed.status()).toBe(200);
  expect(await feed.text()).toContain("<language>zh-TW</language>");
});

test("social image endpoint renders known and unrecognized types as PNG", async ({ request }) => {
  for (const type of ["project", "tool", "note", "unrecognized"]) {
    const response = await request.get(`/api/og?${new URLSearchParams({ type, title: "PCB Engineering Lab" })}`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
    const image = await response.body();
    expect([...image.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
  }
});

test("social image shows the engineering grid behind the content", async ({ page, request }) => {
  const response = await request.get("/api/og?type=tool&title=PCB");
  const pixels = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    return [[576, 160], [577, 161]].map(([x, y]) => [...context.getImageData(x, y, 1, 1).data]);
  }, (await response.body()).toString("base64"));
  expect(pixels[0]).not.toEqual(pixels[1]);
});
