import { expect, it } from "vitest";
import { GET } from "./route";

it("serves the real empty Notes channel with RSS headers and no retired news", async () => {
  const response = await GET();
  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toBe("application/rss+xml; charset=utf-8");
  const xml = await response.text();
  const document = new DOMParser().parseFromString(xml, "application/xml");
  expect(document.querySelector("parsererror")).toBeNull();
  expect(document.querySelector("channel > title")?.textContent).toBe("JK Space");
  expect(document.querySelectorAll("item")).toHaveLength(0);
  expect(xml).not.toMatch(/\/news\/|news@jk-space\.com|tech@jk-space\.com/);
});
