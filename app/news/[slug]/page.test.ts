import { describe, expect, it } from "vitest";
import * as route from "@/app/(zh-tw)/news/[slug]/page";

describe("retired news article", () => {
  // Break caught: an existing or unknown slug returns public article/archive content.
  it.each(["ai-digest-2026-08-09-1531", "never-published"])("returns Next's 404 for %s", async (slug) => {
    const render = route.default as (...args: unknown[]) => unknown;
    await expect(async () => render({ params: Promise.resolve({ slug }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  // Break caught: the tombstone becomes indexable despite removing its content.
  it("exposes noindex metadata for every retired slug", () => {
    expect((route as Record<string, unknown>).metadata).toMatchObject({ robots: { index: false, follow: true } });
  });
});
