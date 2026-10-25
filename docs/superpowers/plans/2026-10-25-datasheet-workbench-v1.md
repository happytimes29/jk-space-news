# Datasheet Workbench V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 JK Space 建立可讀取公開文字型 MLCC／屏蔽型功率電感 Datasheet 的三語工程工具，提供有來源的快速摘要與嚴格、可追溯的雙料號替代評估。

**Architecture:** PDF 在瀏覽器解析、分頁與切塊，只有相關文字片段經過不儲存憑證或內容的 Next.js Relay 傳給使用者選擇的模型。模型只負責結構化抽取與說明；單位正規化、證據驗證、工作條件與替代結論由 TypeScript 確定性引擎完成。

**Tech Stack:** Next.js 16 App Router、React 19、TypeScript 5、Vitest、Testing Library、`pdfjs-dist`、原生 `fetch`／Web Crypto／Node DNS。

**Spec:** `docs/superpowers/specs/2026-10-25-datasheet-workbench-design.md`

## Global Constraints

- V1 只正式支援 `mlcc` 與 `shielded-power-inductor`；其他元件一律回報 unsupported，不套用近似規則。
- 只接受使用者本機上傳、具有文字層的公開 PDF；不提供 URL 抓取、OCR、掃描表格或曲線數值內插。
- Family Datasheet 必須先選定完整 Ordering Code，否則只能顯示差異，不能產生替代結論。
- `direct-replacement` 必須通過所有強制工作條件與封裝／焊盤相容性，而且不需要修改 PCB、外部元件或製程。
- API Key 只存在瀏覽器記憶體及單次 TLS Relay 請求；不得寫入 Cookie、Storage、資料庫、Log、遙測或錯誤內容。
- Relay 支援 OpenAI-compatible、Anthropic Messages 與 Google Gemini；自訂 Base URL 僅允許 HTTPS，且必須阻擋私有／保留位址與不安全重新導向。
- 每個展示或比較的規格值都必須具有本次 PDF 的頁碼、原文與可驗證 `chunkHash`；無有效來源就不顯示為事實。
- 模型結構化輸出最多修復一次；仍無效即標記 ambiguous／insufficient-evidence，不以推測補值。
- 介面提供繁體中文、簡體中文與英文；Datasheet 原文引用不翻譯。
- 所有任務遵循 TDD、每項任務獨立提交；不得合併或部署到 `main`，除非使用者另行確認。

## Review Focus

- 有文字但沒有可辨識元件／Ordering Code 的 Family PDF：Task 6 必須測試停止判定並要求人工選擇。
- 規格數值相同但測試條件不同（例如不同頻率、溫升或飽和定義）：Task 2 必須測試結果為 `insufficient-evidence`，不得判成直接替代。
- 自訂 OpenAI-compatible URL 解析到 IPv4／IPv6 私有位址，或 3xx 重新導向到私有位址：Task 5 必須測試 Relay 拒絕請求。
- 模型引用不存在的 chunk、錯頁或被修改的原文：Task 4 與 Task 6 必須測試欄位被拒絕且不能進入比較引擎。
- 使用者在處理中切換模式、移除檔案或清除 Key：Task 7 必須測試中止既有請求並清除衍生狀態，不保留跨流程資料。

---

### Task 1: Datasheet domain contracts and golden fixtures

**Files:**
- Create: `lib/datasheet/types.ts`
- Create: `lib/datasheet/component-fields.ts`
- Create: `lib/datasheet/validation.ts`
- Create: `lib/datasheet/validation.test.ts`
- Create: `tests/fixtures/datasheets/mlcc-record.ts`
- Create: `tests/fixtures/datasheets/inductor-record.ts`

**Interfaces:**
- Consumes: none.
- Produces: `ComponentKind`, `SourceEvidence`, `SpecificationValue`, `PartRecord`, `WorkConditions`, `ExtractionEnvelope`, `ReplacementVerdict`, `parseExtractionEnvelope(value: unknown): ValidationResult<ExtractionEnvelope>`, and `requiredFieldsFor(kind: ComponentKind): readonly FieldDefinition[]`.

- [ ] **Step 1: Write failing schema tests**

Add tests named `accepts_a_sourced_mlcc_record`, `rejects_an_unsupported_component_kind`, `rejects_a_value_without_page_quote_and_chunk_hash`, and `marks_missing_required_fields_without_inventing_values`. Assert exact component kinds, evidence properties and missing field IDs from the spec.

- [ ] **Step 2: Run the focused test and confirm red**

Run: `npm test -- lib/datasheet/validation.test.ts`

Expected: FAIL because the datasheet contracts do not exist.

- [ ] **Step 3: Add the shared domain types and component field catalogs**

Define `ComponentKind = "mlcc" | "shielded-power-inductor"`; keep raw and normalized values separate; represent min／typ／max and conditions explicitly. MLCC and power-inductor field catalogs must encode which fields are mandatory for summary, which are mandatory for replacement, and which require manual curve review.

- [ ] **Step 4: Implement boundary validation and reusable golden records**

Implement `parseExtractionEnvelope` as a dependency-free runtime validator that returns path-specific errors and never coerces an unsupported value. Create one fully sourced MLCC and one fully sourced inductor record for later tests.

- [ ] **Step 5: Run the domain tests**

Run: `npm test -- lib/datasheet/validation.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/datasheet tests/fixtures/datasheets
git commit -m "feat: define datasheet domain contracts"
```

### Task 2: Deterministic units and replacement engine

**Files:**
- Create: `lib/datasheet/units.ts`
- Create: `lib/datasheet/units.test.ts`
- Create: `lib/datasheet/replacement.ts`
- Create: `lib/datasheet/replacement.test.ts`

**Interfaces:**
- Consumes: `PartRecord`, `WorkConditions`, `SpecificationValue`, and `ReplacementVerdict` from Task 1.
- Produces: `normalizeQuantity(input: ParsedQuantity): NormalizedQuantity`, `compareSpecification(original: SpecificationValue, candidate: SpecificationValue, requirement?: Requirement): ComparisonRow`, and `evaluateReplacement(input: ReplacementInput): ReplacementReport`.

- [ ] **Step 1: Write failing unit-normalization tests**

Test pF／nF／µF, mΩ／Ω, kHz／MHz, mA／A, °C and Unicode micro variants. Assert invalid dimensions and non-finite values return typed errors instead of `NaN`.

- [ ] **Step 2: Run the unit tests and confirm red**

Run: `npm test -- lib/datasheet/units.test.ts`

Expected: FAIL because `normalizeQuantity` is missing.

- [ ] **Step 3: Implement unit normalization**

Use a dimension-indexed factor table; preserve original raw text and convert only supported units to SI base values. Do not parse values out of curve descriptions.

- [ ] **Step 4: Run the unit tests and confirm green**

Run: `npm test -- lib/datasheet/units.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing replacement-contract tests**

Cover these exact verdicts: all mandatory ratings plus footprint pass → `direct-replacement`; permitted preference difference → `conditional`; candidate voltage/current/temperature or footprint fails → `not-recommended`; missing evidence, mismatched test frequency, curve-only data or no selected Ordering Code → `insufficient-evidence`. Add separate MLCC DC-bias/manual-review and inductor saturation-definition tests.

- [ ] **Step 6: Run the replacement tests and confirm red**

Run: `npm test -- lib/datasheet/replacement.test.ts`

Expected: FAIL because the rule engine is missing.

- [ ] **Step 7: Implement comparisons, reason codes and verdict precedence**

`not-recommended` takes precedence for proven hard failures; otherwise any missing mandatory evidence yields `insufficient-evidence`; otherwise allowed soft differences yield `conditional`; only a fully proven result yields `direct-replacement`. Return machine-readable reason codes plus the exact evidence used for every row.

- [ ] **Step 8: Run both deterministic test files**

Run: `npm test -- lib/datasheet/units.test.ts lib/datasheet/replacement.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add lib/datasheet/units.ts lib/datasheet/units.test.ts lib/datasheet/replacement.ts lib/datasheet/replacement.test.ts
git commit -m "feat: add deterministic replacement rules"
```

### Task 3: Browser PDF, chunk and Ordering Code pipeline

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `lib/datasheet/pdf/types.ts`
- Create: `lib/datasheet/pdf/browser-parser.ts`
- Create: `lib/datasheet/pdf/chunks.ts`
- Create: `lib/datasheet/pdf/browser-parser.test.ts`
- Create: `lib/datasheet/pdf/chunks.test.ts`
- Create: `tests/fixtures/datasheets/text-layer-pdf.ts`

**Interfaces:**
- Consumes: `ComponentKind` from Task 1.
- Produces: `parsePdfFile(file: File, signal?: AbortSignal): Promise<ParsedPdf>`, `buildDocumentChunks(document: ParsedPdf): Promise<DocumentChunk[]>`, `searchDocumentChunks(chunks: readonly DocumentChunk[], query: RetrievalQuery): DocumentChunk[]`, and `hashChunk(text: string): Promise<string>`.

- [ ] **Step 1: Add the PDF parser dependency**

Run: `npm install pdfjs-dist`

Expected: `package.json` and `package-lock.json` contain one compatible `pdfjs-dist` version.

- [ ] **Step 2: Write failing parser tests**

Use a small base64 text-layer PDF fixture. Assert page count, per-page text, file SHA-256, abort behavior, maximum 100 pages／25 MiB, and rejection of a zero-text PDF with `PDF_TEXT_LAYER_REQUIRED`.

- [ ] **Step 3: Run the parser test and confirm red**

Run: `npm test -- lib/datasheet/pdf/browser-parser.test.ts`

Expected: FAIL because the parser is missing.

- [ ] **Step 4: Implement browser-only PDF parsing**

Dynamically import `pdfjs-dist` inside `parsePdfFile`, configure its worker for Next.js, preserve one-based page numbers, and never upload the binary. Return typed errors for password protection, corruption, size/page limits, abort and missing text.

- [ ] **Step 5: Write failing chunk/retrieval tests**

Assert chunks never span pages, every chunk has a stable SHA-256 `chunkHash`, section hints remain attached, and keyword retrieval finds Ordering Information plus MLCC／inductor-specific specification sections without a vector database.

- [ ] **Step 6: Run the chunk test and confirm red**

Run: `npm test -- lib/datasheet/pdf/chunks.test.ts`

Expected: FAIL because the chunker is missing.

- [ ] **Step 7: Implement page-bounded chunking and keyword retrieval**

Split on section/table boundaries before length, preserve page and section metadata, hash normalized chunk text with Web Crypto, and rank exact field／component terms ahead of generic terms.

- [ ] **Step 8: Run PDF and chunk tests**

Run: `npm test -- lib/datasheet/pdf/browser-parser.test.ts lib/datasheet/pdf/chunks.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json lib/datasheet/pdf tests/fixtures/datasheets/text-layer-pdf.ts
git commit -m "feat: parse datasheet pdfs in browser"
```

### Task 4: Provider adapters and evidence-safe extraction contract

**Files:**
- Create: `lib/datasheet/providers/types.ts`
- Create: `lib/datasheet/providers/openai-compatible.ts`
- Create: `lib/datasheet/providers/anthropic.ts`
- Create: `lib/datasheet/providers/gemini.ts`
- Create: `lib/datasheet/providers/index.ts`
- Create: `lib/datasheet/providers/providers.test.ts`
- Create: `lib/datasheet/evidence.ts`
- Create: `lib/datasheet/evidence.test.ts`

**Interfaces:**
- Consumes: Task 1 extraction types and Task 3 `DocumentChunk`.
- Produces: `ProviderAdapter` with `buildRequest(input: AdapterInput): UpstreamRequest` and `parseResponse(response: unknown): unknown`; `getProviderAdapter(kind: ProviderKind): ProviderAdapter`; `verifyEvidence(envelope: ExtractionEnvelope, chunks: readonly DocumentChunk[]): EvidenceVerification`.

- [ ] **Step 1: Write failing adapter contract tests**

For OpenAI-compatible, Anthropic and Gemini, assert provider-specific URL, auth header, model field, JSON-output request and normalized assistant text. Verify upstream error bodies are reduced to status／provider codes without echoing credentials or prompt text.

- [ ] **Step 2: Run the provider tests and confirm red**

Run: `npm test -- lib/datasheet/providers/providers.test.ts`

Expected: FAIL because the adapters are missing.

- [ ] **Step 3: Implement the three adapters behind one interface**

Keep API-specific request construction out of UI code. OpenAI-compatible accepts an approved custom base URL; Anthropic and Gemini use fixed official hosts. Adapter response parsers return unknown JSON for Task 1 validation rather than casting it.

- [ ] **Step 4: Write failing evidence verification tests**

Assert a correct page／quote／hash passes; an invented chunk ID, wrong page, changed quote, duplicate/conflicting value or quote outside the supplied chunks is rejected and recorded as ambiguous.

- [ ] **Step 5: Implement `verifyEvidence` and run all Task 4 tests**

Run: `npm test -- lib/datasheet/providers/providers.test.ts lib/datasheet/evidence.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/datasheet/providers lib/datasheet/evidence.ts lib/datasheet/evidence.test.ts
git commit -m "feat: add model adapters and evidence checks"
```

### Task 5: Ephemeral, SSRF-safe model Relay

**Files:**
- Create: `lib/datasheet/relay-security.ts`
- Create: `lib/datasheet/relay-security.test.ts`
- Create: `app/api/datasheet/relay/route.ts`
- Create: `app/api/datasheet/relay/route.test.ts`

**Interfaces:**
- Consumes: Task 4 adapters.
- Produces: `validateRelayTarget(input: RelayTarget, resolver: HostResolver): Promise<SafeRelayTarget>` and `POST(request: Request): Promise<Response>` at `/api/datasheet/relay`.

- [ ] **Step 1: Write failing URL／network safety tests**

Cover HTTP, credentials in URL, non-standard port, localhost, IPv4 private／loopback／link-local／documentation ranges, IPv6 loopback／ULA／mapped IPv4, DNS rebinding candidates, and redirects to blocked addresses. Assert only HTTPS public targets pass.

- [ ] **Step 2: Run the security test and confirm red**

Run: `npm test -- lib/datasheet/relay-security.test.ts`

Expected: FAIL because Relay validation is missing.

- [ ] **Step 3: Implement target validation**

Use `node:dns/promises.lookup(host, { all: true })`; require every returned address to be public. Keep fixed official provider endpoints in an allowlist and revalidate every manually followed redirect before the next fetch.

- [ ] **Step 4: Write failing route tests**

Assert same-origin POST, 512 KiB JSON-body limit, 60-second abort, `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, no cookies, maximum two redirects, sanitized errors, and no key／prompt／PDF text in response or logger calls. Assert the browser key arrives in `Authorization: Bearer …`, is translated to the provider-specific header, and is never returned.

- [ ] **Step 5: Implement the Relay route**

Set `runtime = "nodejs"` and `dynamic = "force-dynamic"`; accept only the three provider kinds and extraction／repair／explain operations. Do not add persistent rate-limit identity in V1; enforce per-request size, redirect and timeout bounds while documenting deployment-level rate limiting as an operational control.

- [ ] **Step 6: Run the Relay tests**

Run: `npm test -- lib/datasheet/relay-security.test.ts app/api/datasheet/relay/route.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/datasheet/relay-security.ts lib/datasheet/relay-security.test.ts app/api/datasheet/relay
git commit -m "feat: add secure datasheet model relay"
```

### Task 6: Analysis orchestration, prompts and one-repair policy

**Files:**
- Create: `lib/datasheet/prompts.ts`
- Create: `lib/datasheet/analysis.ts`
- Create: `lib/datasheet/analysis.test.ts`
- Create: `lib/datasheet/report.ts`
- Create: `lib/datasheet/report.test.ts`

**Interfaces:**
- Consumes: Tasks 1–5 contracts, chunks, provider transport, evidence verifier and replacement engine.
- Produces: `discoverPartOptions(input: AnalysisInput): Promise<PartOption[]>`, `analyzeDatasheet(input: AnalyzePartInput, transport: ModelTransport, onProgress?: ProgressListener): Promise<AnalysisResult>`, `compareDatasheets(input: CompareInput): Promise<ReplacementReport>`, `serializeMarkdown(report: WorkbenchReport): string`, and `serializeJson(report: WorkbenchReport): string`.

- [ ] **Step 1: Write failing orchestration tests**

Use a fake transport to assert: relevant chunks only are sent; unsupported component type stops; ambiguous Family PDF returns selectable Ordering Codes; no selected exact code blocks final analysis; invalid JSON receives exactly one repair request; invalid repaired JSON fails safely; verified evidence reaches the result; and progress is `parsing → retrieving → extracting → verifying → comparing → complete`.

- [ ] **Step 2: Run orchestration tests and confirm red**

Run: `npm test -- lib/datasheet/analysis.test.ts`

Expected: FAIL because the orchestrator is missing.

- [ ] **Step 3: Implement extraction prompts and orchestration**

Prompts must state the selected component kind and Ordering Code, enumerate the Task 1 schema, distinguish absolute／operating／typical data, forbid curve interpolation, require supplied chunk IDs, and allow `missing` rather than guesses. The explanation prompt may only describe already verified facts and deterministic verdicts.

- [ ] **Step 4: Write failing export tests**

Assert Markdown and JSON include selected Ordering Codes, work conditions, verdict／reason codes, missing fields and both documents' page citations, while excluding API keys, raw prompts and unrelated document chunks.

- [ ] **Step 5: Run the report test and confirm red**

Run: `npm test -- lib/datasheet/report.test.ts`

Expected: FAIL because the serializers are missing.

- [ ] **Step 6: Implement deterministic Markdown and JSON serializers**

Serialize only the normalized report model, with stable field order and explicit missing／manual-review sections; never accept provider configuration as serializer input.

- [ ] **Step 7: Run analysis and report tests**

Run: `npm test -- lib/datasheet/analysis.test.ts lib/datasheet/report.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/datasheet/prompts.ts lib/datasheet/analysis.ts lib/datasheet/analysis.test.ts lib/datasheet/report.ts lib/datasheet/report.test.ts
git commit -m "feat: orchestrate evidence-first datasheet analysis"
```

### Task 7: Workbench shell, provider setup and safe client state

**Files:**
- Create: `components/datasheet/DatasheetWorkbenchApp.tsx`
- Create: `components/datasheet/DatasheetWorkbenchApp.test.tsx`
- Create: `components/datasheet/workbench-state.ts`
- Create: `components/datasheet/workbench-state.test.ts`
- Create: `components/datasheet/ModeSwitcher.tsx`
- Create: `components/datasheet/ProviderSetup.tsx`
- Create: `components/datasheet/PdfDropzone.tsx`
- Modify: `lib/engineering/tool-registry.ts`
- Modify: `lib/engineering/tool-registry.test.ts`
- Modify: `components/engineering/ToolAppRenderer.tsx`
- Modify: `components/engineering/ToolAppRenderer.test.tsx`
- Modify: `components/engineering/EngineeringToolAppPage.tsx`

**Interfaces:**
- Consumes: `parsePdfFile`, Task 6 orchestration functions, locale copy and existing tool routes.
- Produces: registered slug `datasheet-workbench`; `WorkbenchState`, `workbenchReducer(state, action): WorkbenchState`; and mounted `DatasheetWorkbenchApp`.

- [ ] **Step 1: Write failing reducer privacy/lifecycle tests**

Assert the API key exists only in reducer memory, never enters URL／localStorage helpers, is cleared on explicit clear and unmount, and changing mode／removing a PDF aborts active work and clears all results derived from that document.

- [ ] **Step 2: Run reducer tests and confirm red**

Run: `npm test -- components/datasheet/workbench-state.test.ts`

Expected: FAIL because workbench state is missing.

- [ ] **Step 3: Implement reducer and provider transport**

Use an `AbortController` per run. Provider setup contains provider, model, optional HTTPS OpenAI-compatible base URL and an unrevealed password input; “測試連線” uses a minimal Relay request and stores only the success state.

- [ ] **Step 4: Write failing shell interaction tests**

Assert two prominent modes, provider disclosure before first transmission, file type／size errors, parsed page/text/API-call estimates, disabled Analyze until setup is valid, keyboard labels, status progression, cancel and clear actions.

- [ ] **Step 5: Register and render the tool**

Add `datasheet-workbench` to `ENGINEERING_TOOL_SLUGS` with no query-state keys. Render the new client app from `ToolAppRenderer`. Pass each tool's localized `tool.privacy` into `EngineeringToolShell` so this networked tool does not inherit the existing “browser only” statement.

- [ ] **Step 6: Run Task 7 tests**

Run: `npm test -- components/datasheet components/engineering/ToolAppRenderer.test.tsx lib/engineering/tool-registry.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/datasheet components/engineering/ToolAppRenderer.tsx components/engineering/ToolAppRenderer.test.tsx components/engineering/EngineeringToolAppPage.tsx lib/engineering/tool-registry.ts lib/engineering/tool-registry.test.ts
git commit -m "feat: add datasheet workbench shell"
```

### Task 8: Quick-read results, citations and engineering Q&A

**Files:**
- Create: `components/datasheet/QuickReadWorkspace.tsx`
- Create: `components/datasheet/QuickReadWorkspace.test.tsx`
- Create: `components/datasheet/SourceEvidencePanel.tsx`
- Create: `components/datasheet/SourceEvidencePanel.test.tsx`
- Create: `components/datasheet/SpecificationTable.tsx`
- Create: `lib/datasheet/question-answering.ts`
- Create: `lib/datasheet/question-answering.test.ts`
- Modify: `components/datasheet/DatasheetWorkbenchApp.tsx`

**Interfaces:**
- Consumes: `AnalysisResult` from Task 6 and workbench state from Task 7.
- Produces: accessible quick-read result UI and `askDatasheet(question: string, result: AnalysisResult, transport: ModelTransport): Promise<GroundedAnswer>` from `lib/datasheet/question-answering.ts`.

- [ ] **Step 1: Write failing result/evidence tests**

Assert identity, selected Ordering Code, key specifications, absolute／operating／typical groups, limitations, missing/conflicting states and checklist render. Opening a value must show one-based page, section/table, original quote and “查看 PDF 第 N 頁”.

- [ ] **Step 2: Write failing Q&A grounding tests**

Assert the question uses only verified chunks; answer sentences include citations; an answer with an invalid citation is rejected; and “文件沒有足夠證據” is shown instead of a model guess.

- [ ] **Step 3: Implement quick-read, citation and Q&A views**

Keep the original PDF in browser memory and render the selected page on demand with PDF.js canvas; do not persist a blob URL after unmount. Separate verified facts from model-generated explanation visually.

- [ ] **Step 4: Run Task 8 tests**

Run: `npm test -- components/datasheet/QuickReadWorkspace.test.tsx components/datasheet/SourceEvidencePanel.test.tsx lib/datasheet/question-answering.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/datasheet lib/datasheet/question-answering.ts lib/datasheet/question-answering.test.ts
git commit -m "feat: add sourced datasheet quick read"
```

### Task 9: Replacement workspace and report exports

**Files:**
- Create: `components/datasheet/ReplacementWorkspace.tsx`
- Create: `components/datasheet/ReplacementWorkspace.test.tsx`
- Create: `components/datasheet/WorkConditionsForm.tsx`
- Create: `components/datasheet/ComparisonMatrix.tsx`
- Create: `components/datasheet/ReportExport.tsx`
- Modify: `components/datasheet/DatasheetWorkbenchApp.tsx`

**Interfaces:**
- Consumes: Task 2 `ReplacementReport`, Task 6 analyze/compare/export functions and Task 8 evidence panels.
- Produces: dual-file replacement workflow with MLCC／inductor condition forms, verdict view, comparison matrix and local Markdown／JSON downloads.

- [ ] **Step 1: Write failing workflow tests**

Assert both PDFs must share the same supported kind; each Family PDF requires its own exact Ordering Code; no work conditions means differences only and no verdict; mandatory/preference toggles alter the deterministic outcome; and each comparison row exposes both citations.

- [ ] **Step 2: Write failing verdict/export UI tests**

Assert the four verdicts have distinct text and non-color status cues, blockers appear before soft risks, curve-only requirements link to manual pages, and downloaded Markdown／JSON match Task 6 serializers without credentials.

- [ ] **Step 3: Implement condition forms and replacement results**

MLCC fields: capacitance, DC voltage, ripple frequency/current, ambient temperature, dielectric and allowed dimensions. Inductor fields: inductance, RMS/peak current, frequency, temperature, maximum DCR and dimensions. Safety/rating/package/temperature remain mandatory even if the user does not toggle them.

- [ ] **Step 4: Run Task 9 tests**

Run: `npm test -- components/datasheet/ReplacementWorkspace.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/datasheet
git commit -m "feat: add datasheet replacement workspace"
```

### Task 10: Three-language content, styles and project case study

**Files:**
- Modify: `locales/zh-TW.json`
- Modify: `locales/zh-CN.json`
- Modify: `locales/en.json`
- Modify: `lib/i18n/dictionaries.test.ts`
- Create: `content/tools/datasheet-workbench.md`
- Create: `content/tools/zh-cn/datasheet-workbench.md`
- Create: `content/tools/en/datasheet-workbench.md`
- Create: `content/projects/datasheet-workbench.md`
- Create: `content/projects/zh-cn/datasheet-workbench.md`
- Create: `content/projects/en/datasheet-workbench.md`
- Modify: `app/editorial.css`
- Modify: `app/editorial-styles.test.ts`

**Interfaces:**
- Consumes: tool registration and UI components from Tasks 7–9.
- Produces: localized discoverable Tool/Project pages and responsive `.datasheet-workbench` visual system.

- [ ] **Step 1: Write failing locale/content tests**

Extend dictionary parity and tool/project collection tests to require all three translations, localized app routes, public-PDF disclosure, Relay/API-key disclosure, supported types and explicit V1 limits.

- [ ] **Step 2: Run focused content tests and confirm red**

Run: `npm test -- lib/i18n/dictionaries.test.ts lib/tools.test.ts lib/projects.test.ts app/editorial-styles.test.ts`

Expected: FAIL because copy, content and styles are missing.

- [ ] **Step 3: Add concise three-language UI copy and content**

Use “快速讀懂 Datasheet” and “替代料評估” as the Traditional Chinese mode names. The Project case study documents architecture, deterministic versus AI responsibilities, evidence model, privacy, validation method and known limitations without claiming unmeasured accuracy.

- [ ] **Step 4: Add responsive, accessible styling**

Keep the site's editorial typography and warm neutral palette, but use a denser engineering workspace inside the app. Provide visible focus, 44px touch targets, overflow-safe comparison tables, print/download states, status patterns beyond color, and reduced-motion behavior.

- [ ] **Step 5: Run locale/content/style tests**

Run: `npm test -- lib/i18n/dictionaries.test.ts lib/tools.test.ts lib/projects.test.ts app/editorial-styles.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add locales content/tools content/projects app/editorial.css app/editorial-styles.test.ts lib/i18n/dictionaries.test.ts
git commit -m "feat: publish datasheet workbench content"
```

### Task 11: End-to-end verification and operational documentation

**Files:**
- Create: `tests/datasheet-workbench.e2e.ts`
- Create: `docs/datasheet-workbench-operations.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: the complete V1.
- Produces: reproducible mocked-provider end-to-end checks and deployment/runbook documentation.

- [ ] **Step 1: Add a deterministic browser E2E flow**

Mock `/api/datasheet/relay` at the browser boundary and cover: open localized tool; set provider; upload a text PDF; select Ordering Code; complete quick read; open a page citation; switch to replacement; upload two PDFs; enter conditions; receive a non-direct verdict; export Markdown. Add a mobile viewport pass for the same primary controls.

- [ ] **Step 2: Add deployment and incident guidance**

Document Relay request/timeout/body limits, required platform rate limiting, how to confirm no sensitive logs, supported providers, custom-host SSRF behavior, public-document-only warning, and kill-switch procedure for `/api/datasheet/relay`.

- [ ] **Step 3: Run focused and full verification**

Run:

```bash
npm test -- lib/datasheet components/datasheet app/api/datasheet
npm run lint
npm run typecheck
npm test
npm run build:local
npx playwright test tests/datasheet-workbench.e2e.ts
```

Expected: all commands exit 0; the production build contains the three localized tool routes and Node Relay route.

- [ ] **Step 4: Perform secret and persistence audit**

Run:

```bash
rg -n "localStorage|sessionStorage|cookies\(|console\.|apiKey" components/datasheet lib/datasheet app/api/datasheet
git diff --check
git status --short
```

Expected: every match is reviewed; no persistence/logging of credentials or document text; no whitespace errors; only intended files are changed.

- [ ] **Step 5: Commit**

```bash
git add tests/datasheet-workbench.e2e.ts docs/datasheet-workbench-operations.md README.md
git commit -m "test: verify datasheet workbench v1"
```

