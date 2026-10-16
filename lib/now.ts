import path from "node:path";
import { ContentFields, readContentFile } from "./content/shared";

export interface NowItem {
  updatedAt: string;
  content: string;
}

export function loadNow(filePath = path.join(process.cwd(), "content/now.md")): NowItem {
  const { file, data, content } = readContentFile(filePath);
  const fields = new ContentFields(file, { ...data, content });
  fields.string("content");
  return { updatedAt: fields.date("updatedAt"), content };
}
