# Smith Chart and Matching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a localized, browser-only single-frequency Smith chart with manual complex-impedance input, ideal component paths, and complete L-match solutions.

**Architecture:** Extend the pure engineering core with Smith projection, ideal network-step, and matching-synthesis modules. A responsive SVG renders from immutable calculation results, while one client application owns editable text, undo/redo history, query state, solution selection, and PNG export.

**Tech Stack:** Next.js 16, React 19, TypeScript, SVG, browser Canvas for PNG export, Vitest, Testing Library, Playwright; no new runtime dependency.

**Spec:** `docs/superpowers/specs/2026-10-19-jk-space-engineering-rf-tools-v1-design.md`

**Depends on:** `docs/superpowers/plans/2026-10-19-engineering-calculators-foundation.md`

## Global Constraints

- First version accepts manual input for one frequency and one passive complex load only.
- Default reference is 50 Ω; 75 Ω and any finite positive custom reference are supported.
- Do not add Touchstone, VNA upload, sweep, broadband optimization, stability/gain/noise circles, stubs, or multi-stage matching.
- Components are ideal and lossless; every result visibly excludes Q, ESR, SRF, package, trace, and parasitic effects.
- All calculations run locally and all UI/error copy is available in zh-TW, zh-CN, and en.
- Use the shared Task 1 result, complex, quantity, preferred-value, route, query-state, and shell interfaces.

## Review Focus

- Open, short, exact match, negative resistance, and `Z = -Z0` must produce deliberate states instead of broken SVG coordinates; Tasks 1 and 5 pin them.
- Series and shunt operations have different reference planes and signs; Task 2 verifies each endpoint against direct complex arithmetic.
- Analytic matching can produce duplicate, negative, or invalid component solutions near degeneracy; Task 3 verifies, filters, deduplicates, and re-evaluates every returned network.
- Undo after applying a generated solution and then editing a component must preserve a linear history without resurrecting discarded redo states; Task 5 pins it.
- PNG export, query strings, and analytics must not expose hidden or stale values; Tasks 5 and 6 pin the exported summary and event payload.

---

### Task 1: Smith projection and display metrics

**Files:**
- Create: `lib/engineering/smith.ts`
- Create: `lib/engineering/smith.test.ts`

**Interfaces:**
- Consumes: `Complex`, complex helpers, RF reflection helpers, and `EngineeringResult<T>` from the foundation plan.
- Produces: `SmithPoint { impedance: Complex; normalizedImpedance: Complex; admittance: Complex | null; gamma: Complex; x: number; y: number }`.
- Produces: `smithPoint(impedance: Complex, referenceOhms: number): EngineeringResult<SmithPoint>` where SVG coordinates are `x = Re(Γ)` and `y = -Im(Γ)`.
- Produces: `smithReadout(point: SmithPoint): EngineeringResult<SmithReadout>` containing Z, Y, Γ rectangular/polar, S11, VSWR, return loss, and mismatch loss.

- [ ] **Step 1: Write failing canonical-point tests**

Assert `50+j0` at 50 Ω maps to `(0,0)`, short maps to `(-1,0)`, a very large finite resistance approaches `(1,0)`, `50+j50` maps to `(0.2,-0.4)`, and `50-j50` maps to `(0.2,0.4)`. Assert negative resistance and `Z=-Z0` return structured errors; open/short readouts use explicit limit values without `NaN`.

- [ ] **Step 2: Run the Smith core test and verify failure**

Run: `npm test -- lib/engineering/smith.test.ts`
Expected: FAIL because `smith.ts` does not exist.

- [ ] **Step 3: Implement Smith projection and readout**

Use the same reflection convention as `rf.ts`. Keep mathematical y and SVG y conversion explicit in names or comments so signs cannot be silently reversed.

- [ ] **Step 4: Run Smith core tests**

Run: `npm test -- lib/engineering/smith.test.ts lib/engineering/rf.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit Smith projection**

```bash
git add lib/engineering/smith.ts lib/engineering/smith.test.ts
git commit -m "feat: add Smith chart projection core"
```

### Task 2: Ideal component network steps and path sampling

**Files:**
- Create: `lib/engineering/network.ts`
- Create: `lib/engineering/network.test.ts`

**Interfaces:**
- Consumes: Task 1 complex/result types and `smithPoint`.
- Produces: `NetworkStep = { id: string; connection: "series" | "shunt"; component: "R" | "L" | "C"; value: number }`.
- Produces: `componentImpedance(step: NetworkStep, frequencyHz: number): EngineeringResult<Complex>`.
- Produces: `applyNetworkStep(load: Complex, step: NetworkStep, frequencyHz: number): EngineeringResult<Complex>` and `applyNetwork(load: Complex, steps: readonly NetworkStep[], frequencyHz: number): EngineeringResult<Complex>`.
- Produces: `sampleNetworkStep(load: Complex, step: NetworkStep, frequencyHz: number, referenceOhms: number, sampleCount?: number): EngineeringResult<SmithPoint[]>` with endpoints included and default `sampleCount=48`.

- [ ] **Step 1: Write failing component and cascade tests**

At 1 GHz assert 3.978873577 nH is `+j25 Ω`, 6.366197724 pF is `-j25 Ω`, series components add impedance, shunt components add admittance, and a sequence equals direct hand-calculated complex arithmetic within `1e-10`. Reject zero/negative component values, non-positive frequency, invalid load, and unknown component data.

- [ ] **Step 2: Run network tests and verify failure**

Run: `npm test -- lib/engineering/network.test.ts`
Expected: FAIL because `network.ts` does not exist.

- [ ] **Step 3: Implement component operations and sampled paths**

Sample from zero to the selected value using the exact network operation at each sample. Stop and return an error if any intermediate point is undefined; do not clamp it onto the chart boundary.

- [ ] **Step 4: Run network and Smith tests**

Run: `npm test -- lib/engineering/network.test.ts lib/engineering/smith.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit network steps**

```bash
git add lib/engineering/network.ts lib/engineering/network.test.ts
git commit -m "feat: add ideal RF network steps"
```

### Task 3: Single-frequency L-match synthesis

**Files:**
- Create: `lib/engineering/matching.ts`
- Create: `lib/engineering/matching.test.ts`

**Interfaces:**
- Consumes: `Complex`, `NetworkStep`, `applyNetwork`, `ESeries`, and shared result types.
- Produces: `MatchSolution { id: string; character: "low-pass" | "high-pass"; steps: [NetworkStep, NetworkStep]; matchedImpedance: Complex; residualGammaMagnitude: number }`.
- Produces: `solveLMatch(input: { load: Complex; targetOhms: number; frequencyHz: number }): EngineeringResult<MatchSolution[]>`.
- Produces: `roundMatchSolution(solution: MatchSolution, series: ESeries, load: Complex, targetOhms: number, frequencyHz: number): EngineeringResult<MatchSolution>`.

- [ ] **Step 1: Write failing exact L-match tests**

For a 25+j0 Ω load, 50 Ω target, and 1 GHz, assert two valid solutions: series `+j25 Ω` with shunt `+j0.02 S` and the dual-sign high-pass solution, corresponding approximately to `3.9789 nH + 3.1831 pF` and `6.3662 pF + 7.9577 nH`. Re-apply every returned network and assert `|Γ| < 1e-9`. Assert already matched 50 Ω returns an empty solution list plus `already_matched`, and negative resistance, zero/open, non-positive target/frequency, and non-finite inputs are rejected.

- [ ] **Step 2: Run matching tests and verify failure**

Run: `npm test -- lib/engineering/matching.test.ts`
Expected: FAIL because `matching.ts` does not exist.

- [ ] **Step 3: Implement analytic topology enumeration**

Enumerate both series-then-shunt and shunt-then-series analytic branches. Convert signed reactance/susceptance to L or C, reject non-positive/non-finite components, cascade each candidate with `applyNetwork`, retain only passive two-component matches within `1e-9`, and deduplicate equal networks within relative `1e-9`.

- [ ] **Step 4: Write failing complex-load and preferred-value tests**

Assert representative loads `25+j10 Ω` and `100-j30 Ω` each return at least one network and every result re-evaluates within tolerance. Assert E24 rounding returns E24 values, remains finite/passive, reports a larger or equal residual than the ideal solution, and never mutates the ideal solution.

- [ ] **Step 5: Implement preferred-value rounding and final validation**

Round each component independently to its nearest series candidate, evaluate nearby Cartesian combinations, and return the combination with the smallest `|Γ|`; use total component value as deterministic tie-breaker.

- [ ] **Step 6: Run matching regression tests**

Run: `npm test -- lib/engineering/matching.test.ts lib/engineering/network.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit L-match synthesis**

```bash
git add lib/engineering/matching.ts lib/engineering/matching.test.ts
git commit -m "feat: add single-frequency L-match synthesis"
```

### Task 4: Accessible responsive Smith chart SVG

**Files:**
- Create: `components/engineering/smith/SmithChart.tsx`
- Create: `components/engineering/smith/SmithChart.test.tsx`
- Create: `components/engineering/smith/SmithReadoutTable.tsx`
- Create: `components/engineering/smith/smith-grid.ts`
- Create: `components/engineering/smith/smith-grid.test.ts`

**Interfaces:**
- Consumes: `SmithPoint[]` paths and `SmithReadout` from Tasks 1–2.
- Produces: `SmithChart({ mode, paths, activePoint, targetPoint, labels, size? })` where `mode` is `"impedance" | "admittance"` and the SVG uses a fixed `viewBox="-1.08 -1.08 2.16 2.16"`.
- Produces: pure `buildSmithGrid(mode): SmithGridPrimitive[]` for constant-resistance/conductance values `[0, 0.2, 0.5, 1, 2, 5]` and reactance/susceptance magnitudes `[0.2, 0.5, 1, 2, 5]`.

- [ ] **Step 1: Write failing grid and rendering tests**

Assert grid generation is finite, symmetric about the real axis, clipped to the unit circle, and contains center/open/short labels. Render one input and one path; assert accessible title/description, different marker shapes for load/target, non-color path labels, and an equivalent numeric table outside the SVG.

- [ ] **Step 2: Run SVG tests and verify failure**

Run: `npm test -- components/engineering/smith/SmithChart.test.tsx components/engineering/smith/smith-grid.test.ts`
Expected: FAIL because Smith chart components do not exist.

- [ ] **Step 3: Implement the grid, SVG, and readout table**

Use vector-effect non-scaling strokes and CSS variables for theme colors. Do not make hover the only way to inspect a point; path steps and values are listed in the table.

- [ ] **Step 4: Run Smith SVG tests**

Run: `npm test -- components/engineering/smith`
Expected: PASS.

- [ ] **Step 5: Commit the SVG chart**

```bash
git add components/engineering/smith
git commit -m "feat: add accessible Smith chart SVG"
```

### Task 5: Smith Chart and Matching application state

**Files:**
- Create: `components/engineering/SmithChartApp.tsx`
- Create: `components/engineering/SmithChartApp.test.tsx`
- Create: `components/engineering/smith/history.ts`
- Create: `components/engineering/smith/history.test.ts`
- Create: `components/engineering/smith/export.ts`
- Create: `components/engineering/smith/export.test.ts`
- Modify: `lib/engineering/tool-registry.ts`
- Modify: `components/engineering/ToolAppRenderer.tsx`

**Interfaces:**
- Consumes: all Smith/matching modules, shared tool shell/query state, chart, and dictionaries.
- Produces: `SmithChartApp({ copy }: { copy: SmithChartCopy })` registered as `smith-chart`.
- Produces: immutable `SmithHistory` with `createHistory`, `pushHistory`, `undoHistory`, `redoHistory`.
- Produces: `exportSmithChartPng(svg: SVGSVGElement, summary: SmithExportSummary, filename: string): Promise<void>`.

- [ ] **Step 1: Write failing history and app-flow tests**

Assert default 1 GHz, 50 Ω, and 25+j0 Ω load; entering 50+j50 updates the chart/readout; adding series L and shunt C adds two labeled paths; undo/redo works; editing after undo clears redo; invalid passive inputs preserve the last valid diagram; 75 Ω/custom reference updates normalization; admittance mode retains the physical network.

- [ ] **Step 2: Run app tests and verify failure**

Run: `npm test -- components/engineering/SmithChartApp.test.tsx components/engineering/smith/history.test.ts`
Expected: FAIL because the app/history do not exist.

- [ ] **Step 3: Implement controlled state, history, and network editing**

Query state includes frequency, reference, load R/X, chart mode, and ordered component steps. Validate decoded step count at a maximum of 20 and ignore unknown component types or oversized values.

- [ ] **Step 4: Write failing matching-selection and export tests**

Assert solving the default load lists two distinct low/high-pass solutions, selecting one renders its schematic/trajectory, E24 mode shows ideal and rounded results separately, copy URL excludes stale/inactive values, export serializes chart plus frequency/reference/result summary, and analytics receives only `{ slug: "smith-chart", action: "export_png" }`.

- [ ] **Step 5: Implement solution UI, URL actions, and PNG export**

PNG export clones the SVG, inlines required foreground/background colors, renders through a same-origin canvas, appends the summary below the chart, downloads `jk-space-smith-chart.png`, and revokes the object URL in `finally`.

- [ ] **Step 6: Run Smith application tests**

Run: `npm test -- components/engineering/SmithChartApp.test.tsx components/engineering/smith`
Expected: PASS.

- [ ] **Step 7: Commit the Smith application**

```bash
git add components/engineering/SmithChartApp.tsx components/engineering/SmithChartApp.test.tsx components/engineering/smith lib/engineering/tool-registry.ts components/engineering/ToolAppRenderer.tsx
git commit -m "feat: add interactive Smith chart and matching"
```

### Task 6: Three-language Smith content and end-to-end verification

**Files:**
- Modify: `locales/zh-TW.json`
- Modify: `locales/zh-CN.json`
- Modify: `locales/en.json`
- Create: `content/tools/smith-chart.md`
- Create: `content/tools/zh-cn/smith-chart.md`
- Create: `content/tools/en/smith-chart.md`
- Modify: `lib/engineering/tool-registry.ts`
- Modify: `lib/seo.test.ts`
- Modify: `app/seo.test.tsx`
- Modify: `e2e/engineering-calculators.spec.ts`

**Interfaces:**
- Consumes: the localized engineering route/content contract from the foundation plan.
- Produces: complete three-language Smith UI copy and one original plus two `reviewed` content pages with `localizedApp: true`.

- [ ] **Step 1: Write failing dictionary/content/SEO tests**

Assert exact dictionary parity, Preview visibility in all languages, production exclusion of reviewed translations, self-canonical app metadata, reciprocal Preview alternates, and `SoftwareApplication.installUrl` matching the localized app route.

- [ ] **Step 2: Add three-language UI copy and introduction content**

Content must explain Z/Y/Γ, chart conventions, the default example, ideal single-frequency L matching, standard-value rounding, manual-input scope, and excluded parasitic/broadband behavior. Keep translations `reviewed`.

- [ ] **Step 3: Extend Playwright coverage**

Test manual complex input, impedance/admittance toggle, series/shunt step, undo/redo, both default L-match solutions, E24 re-evaluation, query reload, PNG download, keyboard controls, mobile layout, all three locales, and absence of numeric analytics/network payloads.

- [ ] **Step 4: Run Smith-focused verification**

Run: `npm test -- lib/engineering/smith.test.ts lib/engineering/network.test.ts lib/engineering/matching.test.ts components/engineering/SmithChartApp.test.tsx components/engineering/smith lib/i18n/dictionaries.test.ts lib/seo.test.ts app/seo.test.tsx`
Expected: PASS.

Run: `npx playwright test e2e/engineering-calculators.spec.ts --grep "Smith"`
Expected: PASS.

- [ ] **Step 5: Run full verification**

Run: `npm run verify`
Expected: PASS.

Run: `npm run test:e2e`
Expected: PASS.

- [ ] **Step 6: Commit Smith integration**

```bash
git add locales content/tools lib/engineering/tool-registry.ts lib/seo.test.ts app/seo.test.tsx e2e/engineering-calculators.spec.ts
git commit -m "feat: add Smith chart preview content"
```

