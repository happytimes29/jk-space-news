import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage, { metadata as homeMetadata } from "./(zh-tw)/page";
import ProjectPage, { generateMetadata as projectMetadata } from "./(zh-tw)/projects/[slug]/page";
import ToolPage, { generateMetadata as toolMetadata } from "./(zh-tw)/tools/[slug]/page";
import { generateMetadata as engineeringAppMetadata } from "./(zh-tw)/tools/[slug]/app/page";
import { generateMetadata as localizedAboutMetadata } from "./[locale]/about/page";
import sitemap from "./sitemap";
import robots from "./robots";
import { getAllNotes, loadNotes } from "@/lib/notes";
import { getAllProjects } from "@/lib/projects";
import { getAllTools } from "@/lib/tools";
import { LOCALES } from "@/lib/i18n/locales";

const props = (slug: string) => ({ params: Promise.resolve({ slug }) });
async function structuredData(page: React.ReactNode) {
  const html = await new Response(await renderToReadableStream(page)).text();
  return [...new DOMParser().parseFromString(html, "text/html").querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent!));
}

describe("public SEO integration", () => {
  // Catches failing to mount the generators on real routes.
  it("publishes home Person/WebSite and project/tool detail schemas", async () => {
    expect(homeMetadata).toMatchObject({ alternates: { canonical: "/" } });
    expect((await structuredData(await HomePage())).map((item) => item["@type"])).toEqual(["Person", "WebSite"]);
    expect((await structuredData(await ProjectPage(props("pcb-test-point-comparison")))).map((item) => item["@type"])).toEqual(["CreativeWork", "BreadcrumbList"]);
    expect(await structuredData(await ProjectPage(props("pcb-test-point-comparison")))).toMatchObject([{ "@type": "CreativeWork", url: "https://jk-space.com/projects/pcb-test-point-comparison", inLanguage: "zh-Hant-TW" }, { "@type": "BreadcrumbList" }]);
    expect((await structuredData(await ToolPage(props("pcb-test-point")))).map((item) => item["@type"])).toEqual(["SoftwareApplication", "BreadcrumbList"]);
  });

  it("publishes localized self-canonical and reciprocal core-page alternates", async () => {
    expect(await localizedAboutMetadata({ params: Promise.resolve({ locale: "en" }) })).toMatchObject({
      alternates: {
        canonical: "/en/about",
        languages: {
          "zh-Hant-TW": "https://jk-space.com/about",
          "zh-Hans-CN": "https://jk-space.com/zh-cn/about",
          en: "https://jk-space.com/en/about",
          "x-default": "https://jk-space.com/about",
        },
      },
      openGraph: { locale: "en_US", url: "/en/about" },
    });
  });

  it("publishes self-canonical localized application metadata from content availability", async () => {
    expect(await engineeringAppMetadata(props("engineering-converter"))).toMatchObject({
      alternates: {
        canonical: "/tools/engineering-converter/app",
        languages: { "zh-Hant-TW": "https://jk-space.com/tools/engineering-converter/app", "x-default": "https://jk-space.com/tools/engineering-converter/app" },
      },
      openGraph: { url: "/tools/engineering-converter/app" },
    });
  });

  // Catches sharing home canonical/image identity across detail routes or omitting URL-encoded titles.
  it.each([
    ["project", "pcb-test-point-comparison", "/projects/pcb-test-point-comparison", projectMetadata],
    ["tool", "pcb-test-point", "/tools/pcb-test-point", toolMetadata],
  ] as const)("publishes %s canonical and typed social image", async (type, slug, route, generate) => {
    const metadata = await generate(props(slug));
    expect(metadata.alternates?.canonical).toBe(route);
    expect(metadata.openGraph).toMatchObject({ url: route, images: [{ url: `/api/og?type=${type}&title=PCB+%E6%B8%AC%E8%A9%A6%E9%BB%9E%E8%87%AA%E5%8B%95%E6%AF%94%E5%B0%8D%E5%B7%A5%E5%85%B7` }] });
  });

  // Catches sitemap/robots wrappers retaining a stale URL source or suppressing public crawling.
  it("serves only current public URLs and exposes their sitemap to crawlers", async () => {
    const entries = await sitemap();
    const publishedContent = await Promise.all(LOCALES.flatMap((locale) => [
      getAllProjects({ locale, visibility: "production" }),
      getAllTools({ locale, visibility: "production" }),
      getAllNotes({ locale, visibility: "production" }),
    ]));
    const localizedApps = (await Promise.all(LOCALES.map((locale) => getAllTools({ locale, visibility: "production" })))).flat().filter((tool) => tool.localizedApp).length;
    expect(entries).toHaveLength(LOCALES.length * 7 + publishedContent.reduce((count, items) => count + items.length, 0) + localizedApps);
    expect(entries.map((item) => item.url)).toEqual(expect.arrayContaining([
      "https://jk-space.com/", "https://jk-space.com/zh-cn", "https://jk-space.com/en",
      "https://jk-space.com/projects", "https://jk-space.com/zh-cn/projects", "https://jk-space.com/en/projects",
      "https://jk-space.com/projects/jk-space-news-automation", "https://jk-space.com/projects/pcb-test-point-comparison", "https://jk-space.com/tools/pcb-test-point",
      "https://jk-space.com/zh-cn/projects/pcb-test-point-comparison", "https://jk-space.com/en/projects/pcb-test-point-comparison",
      "https://jk-space.com/zh-cn/tools/pcb-test-point", "https://jk-space.com/en/tools/pcb-test-point",
      "https://jk-space.com/tools/engineering-converter/app", "https://jk-space.com/tools/passive-circuit-calculator/app", "https://jk-space.com/tools/rf-calculator/app",
      ...loadNotes().map((note) => `https://jk-space.com/notes/${encodeURIComponent(note.slug)}`),
    ]));
    expect(entries.find((item) => item.url === "https://jk-space.com/en/projects/pcb-test-point-comparison")?.alternates?.languages).toEqual({
      "zh-Hant-TW": "https://jk-space.com/projects/pcb-test-point-comparison",
      "zh-Hans-CN": "https://jk-space.com/zh-cn/projects/pcb-test-point-comparison",
      en: "https://jk-space.com/en/projects/pcb-test-point-comparison",
      "x-default": "https://jk-space.com/projects/pcb-test-point-comparison",
    });
    const policy = robots();
    expect(policy).toEqual({
      rules: [
        { userAgent: "*", allow: "/" },
        { userAgent: "Googlebot", allow: "/" },
        { userAgent: "Bingbot", allow: "/" },
        { userAgent: "OAI-SearchBot", allow: "/" },
        { userAgent: "GPTBot", disallow: "/" },
      ],
      sitemap: "https://jk-space.com/sitemap.xml",
    });
    expect(JSON.stringify(policy)).not.toMatch(/llms\.txt/i);
  });
});
