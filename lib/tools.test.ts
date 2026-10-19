import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadTools, getAllTools, getFeaturedTool, getToolBySlug } from "./tools";
import { fixtureDirectory, toolData, writeContent, writeTranslation } from "./content/test-fixtures";

const directories: string[] = [];
function directory() { const dir = fixtureDirectory(); directories.push(dir); return dir; }
afterEach(() => {
  vi.restoreAllMocks();
  directories.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true }));
});

describe("tools", () => {
  it("loads privacy, formats and optional links without inventing metadata", () => {
    const dir = directory();
    writeContent(dir, "tool.md", { ...toolData, relatedProject: "pcb-test-point-comparison" });
    expect(loadTools(dir)[0]).toMatchObject({ ...toolData, localizedApp: false, updatedAt: "2026-10-14T00:00:00.000Z", relatedProject: "pcb-test-point-comparison", locale: "zh-TW", translationOf: "test-tool", translationStatus: "published" });
    expect(loadTools(dir)[0].privacy).toContain("瀏覽器");
    expect(loadTools(dir)[0].coverImage).toBeUndefined();
  });

  it("loads a localized tool through the same visibility contract", () => {
    const dir = directory();
    writeContent(dir, "test-tool.md", toolData);
    writeTranslation(dir, "zh-cn", "test-tool.md", { ...toolData, title: "测试工具", locale: "zh-CN", translationOf: "test-tool", translationStatus: "published", translatedAt: "2026-10-19" });
    expect(loadTools(dir, { locale: "zh-CN", visibility: "production" })).toMatchObject([{ title: "测试工具", locale: "zh-CN", translationStatus: "published" }]);
  });

  it("accepts an explicit localized application boundary", () => {
    const dir = directory();
    writeContent(dir, "localized.md", { ...toolData, localizedApp: true });
    expect(loadTools(dir)[0]).toMatchObject({ localizedApp: true });
  });

  it("sorts tools newest first", () => {
    const dir = directory();
    writeContent(dir, "a.md", { ...toolData, slug: "older", updatedAt: "2026-01-01" });
    writeContent(dir, "b.md", { ...toolData, slug: "newer" });
    expect(loadTools(dir).map((item) => item.slug)).toEqual(["newer", "older"]);
  });

  it("selects the newest available tool while skipping other statuses", async () => {
    const root = directory();
    const dir = path.join(root, "content/tools");
    fs.mkdirSync(dir, { recursive: true });
    writeContent(dir, "a.md", { ...toolData, slug: "experimental-newest", status: "experimental", updatedAt: "2026-10-15" });
    writeContent(dir, "b.md", { ...toolData, slug: "available-newer" });
    writeContent(dir, "c.md", { ...toolData, slug: "available-older", updatedAt: "2026-01-01" });
    vi.spyOn(process, "cwd").mockReturnValue(root);
    expect(await getFeaturedTool()).toMatchObject({ slug: "available-newer" });
  });

  it("returns no featured tool when none are available", async () => {
    const root = directory();
    const dir = path.join(root, "content/tools");
    fs.mkdirSync(dir, { recursive: true });
    writeContent(dir, "maintenance.md", { ...toolData, status: "maintenance" });
    writeContent(dir, "archived.md", { ...toolData, slug: "archived-tool", status: "archived" });
    vi.spyOn(process, "cwd").mockReturnValue(root);
    expect(await getFeaturedTool()).toBeNull();
  });

  it.each([["status", "active"], ["privacy", ""], ["inputTypes", []], ["outputTypes", "CSV"], ["updatedAt", undefined], ["appUrl", "javascript:alert(1)"], ["localizedApp", "yes"]])("rejects invalid tool %s", (field, value) => {
    const dir = directory();
    writeContent(dir, "invalid.md", { ...toolData, [field]: value });
    expect(() => loadTools(dir)).toThrow(new RegExp(`invalid\\.md.*${field}`));
  });

  it("loads the real browser-only PCB tool and selects the available tool", async () => {
    expect(await getAllTools()).toHaveLength(4);
    expect(await getFeaturedTool()).toMatchObject({ slug: "pcb-test-point", status: "available", privacy: "所有使用者檔案只在瀏覽器內解析，不上傳伺服器。", inputTypes: ["OrCAD HTML", "DXF", "Target List"], outputTypes: ["差異表", "2D 座標圖", "CSV"] });
    expect(await getToolBySlug("pcb-test-point")).toMatchObject({ appUrl: "/tools/pcb-test-point/app" });
    expect(await getToolBySlug("missing")).toBeNull();
  });

  it("loads reviewed engineering translations only in preview", () => {
    for (const locale of ["zh-CN", "en"] as const) {
      expect(loadTools(undefined, { locale, visibility: "production" }).map(({ slug }) => slug)).toEqual(["pcb-test-point"]);
      expect(loadTools(undefined, { locale, visibility: "preview" }).map(({ slug }) => slug).sort()).toEqual([
        "engineering-converter", "passive-circuit-calculator", "pcb-test-point", "rf-calculator",
      ]);
    }
    expect(loadTools(undefined, { locale: "zh-TW", visibility: "production" }).filter(({ localizedApp }) => localizedApp)).toHaveLength(3);
  });
});
