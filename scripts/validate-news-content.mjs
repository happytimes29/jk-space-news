#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const newsDir = path.join(root, "content", "news");
const imageDir = path.join(root, "public", "images");
const errors = [];
const warnings = [];

function fail(file, message) {
  errors.push(`${file}: ${message}`);
}

function warn(file, message) {
  warnings.push(`${file}: ${message}`);
}

function validateMdxText(file, content) {
  const lines = content.split(/\r?\n/);
  let inFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const invalidClosingVoidTag = line.match(/<\/\s*(br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)\s*>/i);
    if (invalidClosingVoidTag) {
      fail(
        file,
        `line ${index + 1} contains '${invalidClosingVoidTag[0]}' that MDX treats as an invalid JSX closing tag; use '<${invalidClosingVoidTag[1].toLowerCase()} />' instead`,
      );
    }

    const bareVoidTag = line.match(/<(br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)(\s[^>/]*)?\s*>/i);
    if (bareVoidTag) {
      fail(
        file,
        `line ${index + 1} contains '${bareVoidTag[0]}' that MDX treats as an unclosed JSX tag; use '<${bareVoidTag[1].toLowerCase()} />' instead`,
      );
    }

    const invalidTag = line.match(/<\s*(?=[0-9.+-])/);
    if (invalidTag) {
      fail(
        file,
        `line ${index + 1} contains '${invalidTag[0].trim()}' that MDX treats as an invalid JSX tag; use '&lt;' instead`,
      );
    }
  }
}

if (!fs.existsSync(newsDir)) {
  fail("content/news", "directory does not exist");
} else {
  const files = fs
    .readdirSync(newsDir)
    .filter((name) => name.endsWith(".md") || name.endsWith(".mdx"))
    .sort();

  const seenSlugs = new Map();

  for (const file of files) {
    const filePath = path.join(newsDir, file);
    const expectedSlug = file.replace(/\.mdx?$/, "");
    let parsed;

    try {
      const raw = fs.readFileSync(filePath, "utf8");
      parsed = matter(raw);
      validateMdxText(file, parsed.content);
    } catch (error) {
      fail(file, `invalid frontmatter: ${error.message}`);
      continue;
    }

    const data = parsed.data || {};
    const slug = typeof data.slug === "string" && data.slug.trim() ? data.slug.trim() : expectedSlug;

    if (!data.title || typeof data.title !== "string") fail(file, "title must be a string");
    if (data.slug && data.slug !== expectedSlug) warn(file, `slug '${data.slug}' differs from filename '${expectedSlug}'`);
    if (seenSlugs.has(slug)) fail(file, `duplicate slug '${slug}' also used by ${seenSlugs.get(slug)}`);
    seenSlugs.set(slug, file);

    const date = data.date ? new Date(data.date) : null;
    if (!date || Number.isNaN(date.getTime())) fail(file, "date is missing or invalid");

    if (data.tags !== undefined && !Array.isArray(data.tags)) fail(file, "tags must be an array");
    if (data.tldr !== undefined && !Array.isArray(data.tldr)) fail(file, "tldr must be an array");

    if (data.coverImage && typeof data.coverImage === "string" && data.coverImage.startsWith("/images/")) {
      const imagePath = path.join(imageDir, data.coverImage.replace("/images/", ""));
      if (!fs.existsSync(imagePath)) warn(file, `cover image not found: ${data.coverImage}`);
    }
  }
}

for (const item of warnings) console.warn(`WARN ${item}`);

if (errors.length) {
  for (const item of errors) console.error(`ERROR ${item}`);
  console.error(`\nNews content validation failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log("News content validation passed.");
