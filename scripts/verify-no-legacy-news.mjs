import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== "--root")) {
  console.error("Usage: node scripts/verify-no-legacy-news.mjs [--root directory]");
  process.exit(1);
}
const root = path.resolve(args[1] ?? process.cwd());
const errors = [];
const retiredPaths = [
  "content/news", "content/archived-news.json",
  "lib/news.ts", "lib/archived-news.ts", "lib/interviews.ts",
  "app/trending", "app/interview", "app/profile",
  "components/HeroCarousel.tsx", "components/LatestNewsList.tsx", "components/NewsCard.tsx",
  "components/TldrBlock.tsx", "components/CategoryFilter.tsx",
  "scripts/prune-news-content.mjs", "scripts/validate-news-content.mjs", "scripts/weekly-archive-prune.sh",
];
for (const file of retiredPaths) {
  const absolute = path.join(root, file);
  if (!existsSync(absolute)) continue;
  const remaining = statSync(absolute).isDirectory() ? walk(file) : [file];
  for (const item of remaining.length ? remaining : [file]) errors.push(`${item}: retired path remains`);
}

function walk(directory) {
  const absolute = path.join(root, directory);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = `${directory}/${entry.name}`;
    return entry.isDirectory() ? walk(relative) : [relative];
  });
}

const sources = ["app", "components", "lib", "content/projects", "content/tools", "content/notes"].flatMap(walk);
for (const file of sources) {
  if (!/\.(?:[cm]?[jt]sx?|mdx?)$/.test(file) || /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file)) continue;
  const source = readFileSync(path.join(root, file), "utf8");
  const checks = [
    ["legacy content import", /(?:@\/lib\/|(?:\.\.?\/)+)(?:news|archived-news|interviews)(?:\.[cm]?[jt]sx?)?["']/],
    ["legacy content read", /content\/(?:news|archived-news\.json)/],
    ["retired public link", /\/(?:news|trending|interview|profile)(?=[\/\s?#"'`)}]|$)/],
  ];
  // Only this published case study may use the historical product name.
  if (file !== "content/projects/jk-space-news-automation.md") checks.push(["retired site brand", /JK Space News/]);
  for (const [diagnostic, pattern] of checks) {
    if (pattern.test(source)) errors.push(`${file}: ${diagnostic}`);
  }
}

const packagePath = path.join(root, "package.json");
if (existsSync(packagePath)) {
  const scripts = JSON.parse(readFileSync(packagePath, "utf8")).scripts ?? {};
  for (const [name, command] of Object.entries(scripts)) {
    if (/^(?:archive:prune(?::dry)?|verify:content)$/.test(name) || /(?:prune-news-content|validate-news-content|weekly-archive-prune)/.test(command)) {
      errors.push(`package.json: retired package workflow ${name}`);
    }
  }
}

if (errors.length) {
  console.error(errors.sort().join("\n"));
  process.exitCode = 1;
} else {
  console.log("No legacy news publishing inputs or public entry points.");
}
