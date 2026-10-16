import { render } from "@testing-library/react";
import type { BeforeSend } from "@vercel/analytics/next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Analytics } from "@/components/Analytics";

// The real Vercel component needs Next's router context. Only the routing hooks
// are substituted; script injection and beforeSend registration stay real.
vi.mock("next/navigation.js", () => ({
  useParams: () => ({}),
  usePathname: () => "/tools/pcb-test-point/app",
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  delete window.va;
  delete window.vaq;
  delete window.vam;
  document.head.querySelectorAll("script[data-sdkn]").forEach((script) => script.remove());
});

function registeredBeforeSend(): BeforeSend {
  render(<Analytics />);
  const registration = window.vaq?.find(([event]) => event === "beforeSend");
  expect(registration).toBeDefined();
  return registration![1] as BeforeSend;
}

describe("anonymous pageview analytics", () => {
  it("removes search strings and fragments before sending pageviews", () => {
    const beforeSend = registeredBeforeSend();

    expect(beforeSend({
      type: "pageview",
      url: "https://jk-space.com/tools/pcb-test-point/app?search=private-board&email=person@example.com#upload",
    })).toEqual({
      type: "pageview",
      url: "https://jk-space.com/tools/pcb-test-point/app",
    });
  });

  it("drops custom events that could carry uploaded content or contact details", () => {
    const beforeSend = registeredBeforeSend();

    expect(beforeSend({
      type: "event",
      url: "https://jk-space.com/tools/pcb-test-point/app",
    })).toBeNull();
  });
});
