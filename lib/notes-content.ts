import { fromMarkdown } from "mdast-util-from-markdown";
import { ContentValidationError } from "./content/shared";

/** Commentary uses two top-level Markdown sections, rendered separately by the detail page. */
export function parseCommentaryContent(content: string, file: string): { summary: string; opinion: string } {
  const nodes = fromMarkdown(content).children;
  const sections = nodes.flatMap((node) => node.type === "heading" && node.depth === 2 ? [node] : []);
  const titles = sections.map((node) => node.children.length === 1 && node.children[0].type === "text" ? node.children[0].value : "");
  const fail = (): never => {
    throw new ContentValidationError(file, "content", "新聞觀點必須依序包含非空的「## 事件摘要」與「## 我的觀點」，且各出現一次");
  };
  if (titles.length !== 2 || titles[0] !== "事件摘要" || titles[1] !== "我的觀點" || nodes[0] !== sections[0]) fail();
  const summaryEnd = sections[1].position!.start.offset!;
  const summary = content.slice(sections[0].position!.end.offset!, summaryEnd).trim();
  const opinion = content.slice(sections[1].position!.end.offset!).trim();
  // Comments and link definitions do not provide visible section content.
  for (const section of [summary, opinion]) {
    if (!fromMarkdown(section).children.some((node) => node.type !== "definition" && !(node.type === "html" && /^\s*<!--[\s\S]*-->\s*$/.test(node.value)))) fail();
  }
  return { summary, opinion };
}
