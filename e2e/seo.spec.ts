import { expect, test } from "@playwright/test";
import { loadNotes } from "../lib/notes";

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
    expect(source).toContain(`<title>${title}</title>`);
    expect(source).toContain(`property="og:title" content="${title}"`);
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
    ["/projects/pcb-test-point-comparison", ["CreativeWork"], "project"],
    ["/projects/jk-space-news-automation", ["CreativeWork"], "project"],
    ["/tools/pcb-test-point", ["SoftwareApplication"], "tool"],
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

test("crawl endpoints contain only public portfolio content", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const source = await sitemap.text();
  expect([...source.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])).toEqual([
    "https://jk-space.com/", "https://jk-space.com/projects", "https://jk-space.com/tools", "https://jk-space.com/notes", "https://jk-space.com/about", "https://jk-space.com/contact", "https://jk-space.com/privacy",
    "https://jk-space.com/projects/jk-space-news-automation", "https://jk-space.com/projects/pcb-test-point-comparison", "https://jk-space.com/tools/pcb-test-point",
    ...loadNotes().map((note) => `https://jk-space.com/notes/${encodeURIComponent(note.slug)}`),
  ]);
  expect(source).not.toContain("https://jk-space.com/news/");
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toBe("User-Agent: *\nAllow: /\n\nSitemap: https://jk-space.com/sitemap.xml\n");
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
