import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const script = fileURLToPath(new URL("./verify-no-legacy-news.mjs", import.meta.url));
function verify(files) {
  const root = mkdtempSync(path.join(os.tmpdir(), "retired-news-"));
  try {
    for (const [file, source] of Object.entries(files)) {
      const destination = path.join(root, file);
      mkdirSync(path.dirname(destination), { recursive: true });
      writeFileSync(destination, source);
    }
    return spawnSync(process.execPath, [script, "--root", root], { encoding: "utf8" });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// Each fixture catches a real reintroduced publishing input or public news entry point.
for (const [file, source, diagnostic] of [
  ["app/layout.tsx", 'import { getAllNews } from "@/lib/news";', "legacy content import"],
  ["lib/read.ts", 'readFileSync("content/news/article.md")', "legacy content read"],
  ["lib/read.ts", 'readFileSync("content/archived-news.json")', "legacy content read"],
  ["components/Header.tsx", '<a href="/trending">Trending</a>', "retired public link"],
  ["content/notes/new.md", '[Old feed](/news/old-story)', "retired public link"],
  ["app/api/og/route.tsx", 'const title = "JK Space News";', "retired site brand"],
  ["content/news/story.md", "old article", "retired path"],
  ["content/archived-news.json", "[]", "retired path"],
  ["lib/archived-news.ts", "export {};", "retired path"],
  ["app/interview/page.tsx", "export {};", "retired path"],
  ["scripts/prune-news-content.mjs", "export {};", "retired path"],
  ["package.json", '{"scripts":{"archive:prune":"node scripts/prune-news-content.mjs"}}', "retired package workflow"],
]) {
  test(`rejects ${diagnostic} in ${file}`, () => {
    const result = verify({ [file]: source });
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(diagnostic));
    assert.ok(result.stderr.includes(file));
  });
}

test("accepts current public sources and a historical project with the old name", () => {
  const result = verify({
    "app/news/[slug]/page.tsx": 'import { notFound } from "next/navigation"; export default function Page() { notFound(); }',
    "app/layout.tsx": 'const name = "JK Space";',
    "components/Header.test.tsx": 'expect(text).not.toContain("JK Space News")',
    "content/projects/jk-space-news-automation.md": "# JK Space News historical automation project\nRetired publication.",
    "content/notes/original.md": "[A real project](/projects/jk-space-news-automation)",
    "package.json": '{"scripts":{"verify:no-legacy-news":"node scripts/verify-no-legacy-news.mjs"}}',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /No legacy news publishing inputs or public entry points/);
});
