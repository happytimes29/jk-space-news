import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/(zh-tw)/page";
import { HomePageContent } from "./HomePageContent";
import { loadNotes, type NoteItem } from "@/lib/notes";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";

describe("personal engineering lab homepage", () => {
  // Catches retaining the news landing page or losing the visitor's next steps.
  it("introduces the engineering lab and links to projects and tools", async () => {
    const { container } = render(await HomePage());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("把訊號，變成答案。");
    expect(screen.getByText("硬體研發 × AI 自動化 × 獨立產品實驗")).toBeVisible();
    expect(screen.getByRole("link", { name: "查看專案" })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: "使用工具" })).toHaveAttribute("href", "/tools");
    expect(container).not.toHaveTextContent(/最新情報|查看全部趨勢|JK Space News/);
    const hero = screen.getByRole("region", { name: "把訊號，變成答案。" });
    expect(hero.querySelector("[data-signal-field-host]")).toBeInTheDocument();
    expect(hero.querySelector("img")).toBeNull();
  });

  // Catches demoting the usable tools behind portfolio browsing in the primary hero journey.
  it("puts the usable tool journey before project exploration", async () => {
    render(await HomePage());
    const toolsLink = screen.getByRole("link", { name: "使用工具" });
    const projectsLink = screen.getByRole("link", { name: "查看專案" });

    expect(toolsLink.compareDocumentPosition(projectsLink) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

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

  // Catches hiding real work or Now when Notes is empty, and missing collaboration routing.
  it("keeps eight ordered sections with real projects, an available tool and a dated Now", async () => {
    render(await HomePage());
    expect(screen.getAllByRole("region").map((region) => within(region).getAllByRole("heading")[0].textContent)).toEqual([
      "把訊號，變成答案。", "工程工具、專案與現場筆記", "專業焦點", "精選工具", "精選專案", "最新筆記與觀點", "最近在做什麼", "一起解決下一個工程問題",
    ]);
    const focus = screen.getByRole("region", { name: "專業焦點" });
    for (const label of ["硬體與高頻研發", "AI 與工作流程自動化", "工程工具與獨立產品"]) {
      expect(within(focus).getByRole("link", { name: new RegExp(label) })).toHaveAttribute("href", expect.stringMatching(/^\/projects/));
    }
    const projects = screen.getByRole("region", { name: "精選專案" });
    expect(within(projects).getAllByRole("article")).toHaveLength(2);
    const pcb = within(projects).getByRole("article", { name: "PCB 測試點自動比對工具" });
    expect(pcb).toHaveTextContent("設計與實作");
    expect(pcb).toHaveTextContent("維護中");
    expect(pcb).toHaveTextContent("成果：將新舊測試點差異");
    expect(within(pcb).getByRole("link", { name: "PCB 測試點自動比對工具" })).toHaveAttribute("href", "/projects/pcb-test-point-comparison");
    const tool = screen.getByRole("region", { name: "精選工具" });
    expect(tool).toHaveTextContent("PCB 測試點自動比對工具");
    expect(tool).toHaveTextContent("所有使用者檔案只在瀏覽器內解析，不上傳伺服器。");
    expect(within(tool).getByRole("link", { name: "立即使用" })).toHaveAttribute("href", "/tools/pcb-test-point/app");
    expect(within(tool).getByRole("img")).toHaveAttribute("src", expect.stringContaining("pcb-tool-1.png"));
    const recentNotes = loadNotes().slice(0, 3);
    const notes = screen.getByRole("region", { name: "最新筆記與觀點" });
    if (recentNotes.length === 0) expect(notes).toHaveTextContent("筆記正在整理中");
    for (const note of recentNotes) {
      expect(within(notes).getByRole("link", { name: note.title })).toHaveAttribute("href", `/notes/${encodeURIComponent(note.slug)}`);
    }
    const now = screen.getByRole("region", { name: "最近在做什麼" });
    expect(now).toHaveTextContent("目前正將網站改造成個人工程實驗室");
    expect(within(now).getByText("2026-10-14")).toHaveAttribute("datetime", "2026-10-14T00:00:00.000Z");
    expect(screen.getByRole("link", { name: "聯絡我" })).toHaveAttribute("href", "/contact");
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
