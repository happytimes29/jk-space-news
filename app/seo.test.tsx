import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage, { metadata as homeMetadata } from "./page";
import ProjectPage, { generateMetadata as projectMetadata } from "./projects/[slug]/page";
import ToolPage, { generateMetadata as toolMetadata } from "./tools/[slug]/page";
import sitemap from "./sitemap";
import robots from "./robots";

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
    expect(await structuredData(await ProjectPage(props("pcb-test-point-comparison")))).toMatchObject([{ "@type": "CreativeWork", url: "https://jk-space.com/projects/pcb-test-point-comparison" }]);
    expect(await structuredData(await ToolPage(props("pcb-test-point")))).toMatchObject([{ "@type": "SoftwareApplication", url: "https://jk-space.com/tools/pcb-test-point" }]);
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
    expect((await sitemap()).map((item) => item.url)).toEqual([
      "https://jk-space.com/", "https://jk-space.com/projects", "https://jk-space.com/tools", "https://jk-space.com/notes", "https://jk-space.com/about", "https://jk-space.com/contact", "https://jk-space.com/privacy",
      "https://jk-space.com/projects/jk-space-news-automation", "https://jk-space.com/projects/pcb-test-point-comparison", "https://jk-space.com/tools/pcb-test-point",
    ]);
    expect(robots()).toEqual({ rules: { userAgent: "*", allow: "/" }, sitemap: "https://jk-space.com/sitemap.xml" });
  });
});
