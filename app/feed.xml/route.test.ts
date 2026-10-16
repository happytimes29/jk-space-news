import { expect, it } from "vitest";
import { GET } from "./route";
import { loadNotes } from "@/lib/notes";

it("serves published Notes with RSS headers and no retired news", async () => {
  const response = await GET();
  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toBe("application/rss+xml; charset=utf-8");
  const xml = await response.text();
  const document = new DOMParser().parseFromString(xml, "application/xml");
  expect(document.querySelector("parsererror")).toBeNull();
  expect(document.querySelector("channel > title")?.textContent).toBe("JK Space");
  expect(Array.from(document.querySelectorAll("item")).map((item) => ({
    title: item.querySelector("title")?.textContent,
    link: item.querySelector("link")?.textContent,
    summary: item.querySelector("description")?.textContent,
  }))).toEqual(loadNotes().map((note) => ({ title: note.title, link: `https://jk-space.com/notes/${encodeURIComponent(note.slug)}`, summary: note.summary })));
  expect(xml).not.toMatch(/https:\/\/jk-space\.com\/news\/|news@jk-space\.com|tech@jk-space\.com/);
});
