import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function fixtureDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "jk-content-"));
}

export function writeContent(directory: string, name: string, data: Record<string, unknown>, content = "測試正文。") {
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, name);
  fs.writeFileSync(file, `---\n${JSON.stringify(data)}\n---\n${content}\n`);
  return file;
}

export function writeTranslation(
  directory: string,
  segment: "zh-cn" | "en",
  name: string,
  data: Record<string, unknown>,
  content = "Translated content.",
) {
  return writeContent(path.join(directory, segment), name, data, content);
}

export const projectData = {
  title: "測試專案", slug: "test-project", summary: "專案摘要", year: 2026,
  status: "maintained", areas: ["hardware", "product"], role: "設計與實作",
  tags: ["PCB"], featured: true, updatedAt: "2026-10-14",
};

export const toolData = {
  title: "測試工具", slug: "test-tool", summary: "工具摘要", status: "available",
  privacy: "檔案只在瀏覽器處理。", inputTypes: ["OrCAD HTML"], outputTypes: ["CSV"],
  updatedAt: "2026-10-14", appUrl: "/tools/test-tool/app",
};

export const noteData = {
  title: "測試筆記", slug: "test-note", summary: "筆記摘要", publishedAt: "2026-10-13",
  updatedAt: "2026-10-14", type: "engineering", tags: ["PCB"], author: "JK Space", featured: false,
};
