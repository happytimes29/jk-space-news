#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const newsDir = path.join(root, "content", "news");
const publicDir = path.join(root, "public");
const imageDir = path.join(publicDir, "images");
const archivedIndexPath = path.join(root, "content", "archived-news.json");
const archiveRoot = process.env.ARCHIVE_ROOT || "/Users/jk_sapce/Archives/jk-space-news";
const archiveArticlesDir = path.join(archiveRoot, "articles");
const archiveImagesDir = path.join(archiveRoot, "images");
const retentionDays = Number(process.env.RETENTION_DAYS || 7);
const shouldApply = process.argv.includes("--apply");
const now = process.env.PRUNE_NOW ? new Date(process.env.PRUNE_NOW) : new Date();
const cutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function dateParts(value) {
  const date = value ? new Date(value) : new Date();
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  return [
    String(safe.getFullYear()),
    String(safe.getMonth() + 1).padStart(2, "0"),
    String(safe.getDate()).padStart(2, "0"),
  ];
}

function copyIfChanged(source, target) {
  ensureDir(path.dirname(target));
  if (fs.existsSync(target) && fs.readFileSync(source).equals(fs.readFileSync(target))) {
    return false;
  }
  if (shouldApply) fs.copyFileSync(source, target);
  return true;
}

function unlinkIfApply(filePath) {
  if (shouldApply) fs.unlinkSync(filePath);
}

function stringOr(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readExistingArchivedIndex() {
  if (!fs.existsSync(archivedIndexPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(archivedIndexPath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

if (!fs.existsSync(newsDir)) {
  throw new Error(`News directory not found: ${newsDir}`);
}

const files = fs
  .readdirSync(newsDir)
  .filter((name) => name.endsWith(".md") || name.endsWith(".mdx"))
  .sort();

const retainedCoverImages = new Set();
const existingArchived = new Map(readExistingArchivedIndex().map((item) => [item.slug, item]));
const archivedItems = new Map(existingArchived);
const toPrune = [];
let archivedArticles = 0;
let archivedImages = 0;

for (const file of files) {
  const filePath = path.join(newsDir, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data || {};
  const date = data.date ? new Date(data.date) : null;
  const isInvalidDate = !date || Number.isNaN(date.getTime());
  const slug = stringOr(data.slug, file.replace(/\.mdx?$/, ""));
  const coverImage = stringOr(data.coverImage);

  if (isInvalidDate || date >= cutoff) {
    if (coverImage.startsWith("/images/")) retainedCoverImages.add(coverImage);
    continue;
  }

  const [year, month, day] = dateParts(data.date);
  const archiveArticlePath = path.join(archiveArticlesDir, year, month, day, file);
  if (copyIfChanged(filePath, archiveArticlePath)) archivedArticles += 1;

  if (coverImage.startsWith("/images/")) {
    const sourceImage = path.join(publicDir, coverImage);
    const targetImage = path.join(archiveImagesDir, coverImage.replace(/^\/images\//, ""));
    if (fs.existsSync(sourceImage) && copyIfChanged(sourceImage, targetImage)) archivedImages += 1;
  }

  archivedItems.set(slug, {
    slug,
    title: stringOr(data.title, "無標題"),
    date: date.toISOString(),
    category: stringOr(data.category, "未分類"),
    excerpt: stringOr(data.excerpt),
    source: stringOr(data.source),
    archivePath: archiveArticlePath,
  });
  toPrune.push({ file, filePath, coverImage });
}

const prunedCoverImages = [];
for (const item of toPrune) {
  unlinkIfApply(item.filePath);

  if (!item.coverImage.startsWith("/images/")) continue;
  if (retainedCoverImages.has(item.coverImage)) continue;

  const imagePath = path.join(publicDir, item.coverImage);
  if (fs.existsSync(imagePath)) {
    prunedCoverImages.push(item.coverImage);
    unlinkIfApply(imagePath);
  }
}

const archivedIndex = [...archivedItems.values()].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

if (shouldApply) {
  ensureDir(path.dirname(archivedIndexPath));
  fs.writeFileSync(`${archivedIndexPath}.tmp`, `${JSON.stringify(archivedIndex, null, 2)}\n`);
  fs.renameSync(`${archivedIndexPath}.tmp`, archivedIndexPath);
}

console.log(`${shouldApply ? "Applied" : "Dry run"} news prune`);
console.log(`Now: ${now.toISOString()}`);
console.log(`Retention: ${retentionDays} day(s)`);
console.log(`Cutoff: ${cutoff.toISOString()}`);
console.log(`Current files scanned: ${files.length}`);
console.log(`Articles to prune: ${toPrune.length}`);
console.log(`Cover images to prune: ${prunedCoverImages.length}`);
console.log(`Archive article copies changed: ${archivedArticles}`);
console.log(`Archive image copies changed: ${archivedImages}`);
console.log(`Archived index entries: ${archivedIndex.length}`);

if (!shouldApply) {
  console.log("Run with --apply to archive, write content/archived-news.json, and remove old public files.");
}
