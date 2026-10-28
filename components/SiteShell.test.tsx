// @vitest-environment node
import { renderToReadableStream } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { SiteShell } from "./SiteShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en",
  useRouter: () => ({ push: vi.fn() }),
}));

it("places the complete shared experience inside one fixed v2 root", async () => {
  const stream = await renderToReadableStream(await SiteShell({
    locale: "en",
    children: <div data-testid="route-content">Route content</div>,
  }));
  const markup = await new Response(stream).text();

  expect(markup).toContain('class="site-v2"');
  expect(markup).toContain('class="site-v2-content');
  expect(markup).toContain("<header");
  expect(markup).toContain("<main");
  expect(markup).toContain("<footer");
  expect(markup).toContain('data-testid="route-content"');
  expect(markup.indexOf("<header")).toBeLessThan(markup.indexOf("<main"));
  expect(markup.indexOf("<main")).toBeLessThan(markup.indexOf("<footer"));
});
