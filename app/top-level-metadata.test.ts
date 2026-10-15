import { describe, expect, it } from "vitest";
import { metadata as projects } from "./projects/page";
import { metadata as tools } from "./tools/page";
import { metadata as notes } from "./notes/page";
import { metadata as about } from "./about/page";
import { metadata as contact } from "./contact/page";
import { metadata as privacy } from "./privacy/page";

describe("public entry page metadata", () => {
  // Catches list/trust routes advertising the homepage or sharing the wrong title/description.
  it.each([
    ["/projects", projects, "專案", "JK Space 的工程案例：記錄實際問題、角色、限制、關鍵決策與成果。"],
    ["/tools", tools, "我做的工具", "JK Space 開發的工程工具：用途、格式、限制與資料處理方式。"],
    ["/notes", notes, "筆記與觀點", "JK Space 的原創工程筆記、AI 與自動化、專案紀錄與新聞觀點。"],
    ["/about", about, "關於我", "15+ 年硬體研發經驗，從高頻電路與系統架構，延伸至 AI 自動化與獨立產品實驗。"],
    ["/contact", contact, "聯絡我", "JK Space 的技術交流、工具回饋與合作討論管道。"],
    ["/privacy", privacy, "隱私權政策", "JK Space 的網站連線、匿名瀏覽統計與 PCB 工具檔案處理說明。"],
  ] as const)("gives %s its own canonical and complete Open Graph identity", (route, metadata, title, description) => {
    expect(metadata).toMatchObject({
      title, description, alternates: { canonical: route },
      openGraph: { type: "website", siteName: "JK Space", locale: "zh_TW", url: route, title: `${title} | JK Space`, description },
    });
    const graph = metadata.openGraph as { images: { url: string }[] };
    const image = new URL(graph.images[0].url, "https://jk-space.com");
    expect(image.pathname).toBe("/api/og");
    expect(image.searchParams.get("title")).toBe(`${title} | JK Space`);
  });
});
