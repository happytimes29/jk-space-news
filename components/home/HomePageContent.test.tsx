import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomePageContent } from "./HomePageContent";
import type { NoteItem } from "@/lib/notes";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";

describe("previous editorial homepage component", () => {
  it.each(["zh-TW", "zh-CN", "en"] as const)("localizes the %s orientation navigation", (locale: Locale) => {
    const dictionary = getDictionary(locale);
    render(<HomePageContent
      featuredProjects={[]}
      featuredTool={null}
      recentNotes={[]}
      now={{ content: dictionary.home.nowContent, updatedAt: "2026-10-14" }}
      locale={locale}
      dictionary={dictionary}
    />);
    const navigation = within(screen.getByRole("region", { name: dictionary.home.orientationTitle })).getByRole("navigation");
    for (const [label, pathname] of [
      [dictionary.navigation.tools, "/tools"],
      [dictionary.navigation.projects, "/projects"],
      [dictionary.navigation.notes, "/notes"],
    ]) {
      expect(within(navigation).getByRole("link", { name: label })).toHaveAttribute("href", localePath(locale, pathname));
    }
  });

  // Catches rendering an empty state after publication, mislabelling commentary, or losing the detail route.
  it("presents a published commentary as a dated personal viewpoint with its own detail link", () => {
    const note: NoteItem = {
      title: "公開規格的工程取捨", slug: "spec-tradeoffs", summary: "以工程角度討論公開規格的限制。",
      type: "commentary", publishedAt: "2026-10-15", updatedAt: "2026-10-15", author: "JK Space",
      tags: [], featured: false, readingTime: 4, content: "原創觀點",
      sourceTitle: "原始規格", sourceUrl: "https://example.com/spec", sourcePublishedAt: "2026-10-14",
      locale: "zh-TW", translationOf: "spec-tradeoffs", translationStatus: "published",
    };
    render(<HomePageContent featuredProjects={[]} featuredTool={null} recentNotes={[note]} now={{ content: "整理工程實驗", updatedAt: "2026-10-14" }} locale="zh-TW" dictionary={getDictionary("zh-TW")} />);
    const notes = screen.getByRole("region", { name: "最新筆記與觀點" });
    expect(within(notes).getByRole("link", { name: "公開規格的工程取捨" })).toHaveAttribute("href", "/notes/spec-tradeoffs");
    expect(notes).toHaveTextContent("新聞觀點");
    expect(notes).toHaveTextContent("以工程角度討論公開規格的限制。");
    expect(notes).toHaveTextContent("4 分鐘");
    expect(within(notes).getByText("2026-10-15")).toHaveAttribute("datetime", "2026-10-15");
    expect(within(notes).queryByText("筆記正在整理中。")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "聯絡我" })).toBeVisible();
    expect(screen.queryByRole("img", { name: "Engineering signal study" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "最近在做什麼" })).toBeVisible();
    expect(screen.getByRole("region", { name: "一起解決下一個工程問題" })).toBeVisible();
  });
});
