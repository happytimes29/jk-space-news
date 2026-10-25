---
title: "Evidence-first Datasheet Engineering Workbench"
slug: datasheet-workbench
summary: "Connects PDF parsing, multi-model extraction, source verification, and deterministic comparison rules into an auditable component-reading and replacement workflow."
year: 2026
status: maintained
areas: [hardware, product]
role: Product design and implementation
featured: false
updatedAt: 2026-10-25
tags: ["Next.js", "TypeScript", "PDF.js", "BYOK", "Evidence"]
demoUrl: /tools/datasheet-workbench/app
relatedTools: [datasheet-workbench]
outcome: Built an exportable Datasheet workflow that uses evidence and explicit degradation instead of an AI confidence score.
locale: en
translationOf: datasheet-workbench
translationStatus: published
translatedAt: 2026-10-25
---

## Problem

Component Datasheet facts are split across ordering tables, ratings, operating conditions, characteristic tables, and charts. Identically named values may use different test conditions. Asking AI to summarize a whole PDF can drop page references, confuse a family with an Ordering Code, or present a Typical value as guaranteed. Replacement evaluation is stricter: one voltage, thermal, package, or current blocker can reject a candidate.

## Architecture and responsibility boundary

PDF.js reads the public PDF text layer, pages, and hashes in the browser. Retrieval selects passages by component type and field. The user chooses OpenAI-compatible, Anthropic, or Gemini and supplies an API key. The Relay permits fixed HTTPS destinations and operations and does not store the key.

AI identifies exact Ordering Codes, extracts passages into a shared JSON schema, and explains verified evidence. Deterministic TypeScript owns unit normalization, min/typ/max semantics, condition compatibility, rating ranges, package checks, and replacement verdicts. Identical structured inputs produce identical decisions.

## Evidence model

Each specification keeps a document identity, page, section, table, quotation, and chunk hash. A model citation that does not exist in a supplied passage is degraded. Q&A can cite only verified evidence. The replacement matrix keeps sources from both the original and candidate parts so an engineer can return to the PDF.

## Validation

Hand-authored MLCC and shielded-power-inductor fixtures exercise schemas, unit conversion, four verdicts, mismatched conditions, missing evidence, Ordering Codes, and report export. Route tests cover the Relay provider allowlist, SSRF rejection, timeouts, and response limits. These tests establish behavior for specified cases; they do not measure real-world extraction accuracy, so the project claims no accuracy percentage.

## Privacy and known limits

PDF parsing is local, but relevant text and the API key cross the Relay once to reach the provider selected by the user. Version one accepts public, text-layer PDFs and supports only MLCCs and shielded power inductors. It excludes OCR, scanned tables, chart interpolation, web fetching, supply-chain data, and formal replacement decisions for other component types. A required curve-only value forces an insufficient-evidence result.
