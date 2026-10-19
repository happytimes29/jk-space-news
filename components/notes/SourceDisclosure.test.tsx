import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import type { CommentaryNote } from "@/lib/notes";
import { SourceDisclosure } from "./SourceDisclosure";

const note: CommentaryNote = {
  title: "個人觀點", slug: "opinion", summary: "摘要", type: "commentary", author: "JK Space", tags: [], featured: false,
  publishedAt: "2026-10-14T00:00:00.000Z", updatedAt: "2026-10-15T00:00:00.000Z", readingTime: 2, content: "正文",
  sourceTitle: "工程週刊的原始報導", sourceUrl: "https://example.com/report?topic=pcb", sourcePublishedAt: "2026-10-12T00:00:00.000Z",
  locale: "zh-TW", translationOf: "opinion", translationStatus: "published",
};

it("distinguishes the original source and event date from the author's commentary", () => {
  render(<SourceDisclosure note={note} locale="zh-TW" />);
  expect(screen.getByRole("link", { name: "工程週刊的原始報導" })).toHaveAttribute("href", "https://example.com/report?topic=pcb");
  expect(screen.getByText("2026-10-12")).toHaveAttribute("datetime", "2026-10-12T00:00:00.000Z");
  expect(screen.getByText(/事件或原文發布日期/)).toBeVisible();
  expect(screen.getByText(/個人觀點/)).toBeVisible();
});
