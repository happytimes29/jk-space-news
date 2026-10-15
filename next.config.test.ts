import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";

describe("retired public routes", () => {
  // Break caught: a retired entry point serves content or redirects to the wrong destination.
  it.each([
    ["/news", "/notes"],
    ["/trending", "/notes"],
    ["/profile", "/about"],
    ["/interview", "/notes"],
    ["/interview/:path*", "/notes"],
  ])("permanently redirects %s to %s", async (source, destination) => {
    const redirects = await nextConfig.redirects!();
    expect(redirects.find((redirect) => redirect.source === source)).toEqual({ source, destination, permanent: true });
  });

  it("preserves canonical host redirects", async () => {
    const redirects = await nextConfig.redirects!();
    expect(redirects).toEqual(expect.arrayContaining([
      { source: "/:path*", has: [{ type: "host", value: "www.jk-space.com" }], destination: "https://jk-space.com/:path*", permanent: true },
      { source: "/:path*", has: [{ type: "host", value: "jk-space-news.vercel.app" }], destination: "https://jk-space.com/:path*", permanent: true },
    ]));
  });
});
