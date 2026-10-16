import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JsonLd } from "./JsonLd";

describe("JsonLd", () => {
  // Catches HTML parsing ending the JSON script early, rather than merely testing JSON.stringify.
  it("keeps script-like content inside one inert JSON script and round-trips the original data", () => {
    const data = { "@type": "Article", headline: '</script><script>alert("x")</script><!--', description: "工程 < 測試 & 驗證" };
    const html = renderToStaticMarkup(<JsonLd data={data} />);
    const document = new DOMParser().parseFromString(html, "text/html");
    const scripts = document.querySelectorAll("script");
    expect(scripts).toHaveLength(1);
    expect(scripts[0].type).toBe("application/ld+json");
    expect(scripts[0].textContent).not.toContain("<");
    expect(scripts[0].textContent).toContain("\\u003c/script>");
    expect(JSON.parse(scripts[0].textContent!)).toEqual(data);
  });
});
