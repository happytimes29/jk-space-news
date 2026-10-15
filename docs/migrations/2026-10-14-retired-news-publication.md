# Automated news publication retirement

The public site now contains original projects, tools, and notes. Automated news articles and interviews no longer participate in the build. The historical project `content/projects/jk-space-news-automation.md` remains published as an archived engineering case study.

## Verified preservation

Before deletion, the clean worktree was at `5d965ea630f9ff1781868016122f3d2bc761b65d`. There were 521 Git-tracked news articles and 4,126 files in `/Users/jk_sapce/Archives/jk-space-news/articles`. The new local branch `backup/news-publication-final-2026-10-14` points to that pre-deletion commit; its tree was independently counted at 521 news files. The archive was only read, including a sample containing title, slug, date, source, excerpt, URL, and original body.

## Deleted assets and code

`2026-10-14-retired-news-assets.txt` is the exact sorted deletion manifest: 521 tracked image paths, all under `public/images/`, with SHA-256 `247bc90473c16e523adee90a7aaaba9508a514590e6640f69d6b78460f83c6fa`.

The one-time generator parsed only tracked news frontmatter, traversed its string values for `/images/...` references, excluded paths referenced by retained Projects/Tools/Notes/app/components, required the image to be Git-tracked, and rejected normalized paths outside `public/images/`. Manual review confirmed the manifest excludes `pcb-tool-1.png`, `pcb-tool-2.png`, `default-cover.svg`, and icons. Unreferenced images outside this exact manifest were retained. The generator was removed after use; the manifest remains for audit and recovery.

`git rm` removed 521 news Markdown files, the archived-news JSON index, three legacy data modules, four route files under interview/profile/trending, five unused news components, three retired publication scripts, and exactly the 521 manifest images. The five components had no consumers after replacing the news page and removing the trending route. The remaining news detail route always returns `notFound()` and exports noindex metadata; it never reads either archive.

## Routing and checks

- `/news` and `/trending` permanently redirect to `/notes`.
- `/profile`, `/interview`, and `/interview/:path*` permanently redirect to `/about`.
- `/news/[slug]` is a dynamic noindex 404, including previously published slugs.
- `npm run verify:no-legacy-news` rejects retired filesystem inputs, publication workflows, legacy content reads/imports, public retired links, and obsolete site branding. The old name is allowed only in the historical project Markdown. Tests and migration documentation are outside the public-source scan.
- Run `node --test scripts/verify-no-legacy-news.test.mjs` for controlled CLI fixtures and `npm test` for application unit tests.

The sitemap now reads current content collections so the deleted news module cannot enter the build. The OG endpoint uses centralized site identity. Further SEO refinement remains in the SEO task.

## Recovery

For read-only inspection, use `git show backup/news-publication-final-2026-10-14:content/news/ai-digest-2026-08-09-1531.md` or create a separate checkout from that branch. To restore publication later, prepare a dedicated branch and revert the retirement commit after review; that restores content, scripts, routing, and all manifest assets together. To recover a selected image, copy it from the backup tree using its exact manifest path. The external archive remains available independently. No recovery requires rewriting the historical backup branch.

## Owner-only external followups

The site owner must separately inventory and decide whether to retain or disable OpenClaw publication jobs, machine/user/CI schedules, external API keys, webhook receivers/senders, and any deployment credentials used by the old publishing workflow. Confirm each resource's other consumers and preserve desired archives before changing it. This migration does not identify secret values, invoke external APIs, edit scheduling configuration, revoke keys, disable webhooks, push, or deploy. A website retirement alone does not establish the state of those external resources.
