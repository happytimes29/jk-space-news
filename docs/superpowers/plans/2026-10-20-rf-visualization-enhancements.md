# RF Visualization Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing attenuator, RF quick calculator, Smith matching, and transmission-line tools explain their current inputs and results through accessible, live engineering diagrams without changing their public routes.

**Architecture:** Calculator components remain the owners of editable strings and last-valid typed results; `lib/engineering` remains the only location for engineering mathematics. Small dedicated SVG components consume those results through explicit props, sharing only a frame, stale-result notice, and stateless circuit symbols rather than a general diagram engine.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS, inline responsive SVG, Vitest, Testing Library, Playwright, Vercel Preview

**Spec:** `docs/superpowers/specs/2026-10-20-rf-visualization-enhancements-design.md`

## Global Constraints

- Preserve all current tool slugs, locale-prefixed routes, and query parameter names, including `topology=tee|pi`.
- Keep every calculation in the browser; do not add an API, persistence layer, analytics payload containing engineering values, or third-party diagram dependency.
- `lib/engineering` owns formulas and SI values; SVG components may format or position values but must not reimplement engineering equations.
- Use dedicated SVG components plus small stateless primitives; do not introduce a generic circuit DSL, Canvas renderer, or geometry auto-layout engine.
- Diagrams are schematic and not to scale. Exact results must remain available as text outside each SVG.
- Preserve the existing visual language, CSS variables, dark/light themes, 320 px page-width support, and keyboard-only operation.
- Add every user-facing string to `locales/zh-TW.json`, `locales/zh-CN.json`, and `locales/en.json` in the same task that first consumes it.
- Preserve the last complete valid result on invalid edits, dim the affected diagram, and expose a localized non-blocking stale-result notice.
- Do not expand scope to unequal-impedance attenuators, S-parameter import, sweeps, lossy/parasitic models, field solving, or the Engineering Converter RF tab.

## File Structure

- `components/engineering/diagrams/`: presentation-only frame, stale notice, and stateless SVG circuit symbols shared by the feature diagrams.
- `components/engineering/passive/`: attenuator topology picker, full circuit diagram, and the existing attenuator mode that owns its input state.
- `components/engineering/rf/`: typed RF view results plus dedicated propagation and reflection diagrams; the existing app remains the calculation/state coordinator.
- `components/engineering/smith/`: matching-network schematic built directly from existing `MatchSolution` objects.
- `components/engineering/transmission-line/`: the existing geometry diagram extended with formatted last-valid dimensions and outputs.
- `lib/engineering/passive.ts`: the only new engineering formula, attenuator output power; all other numerical cores remain unchanged.
- `locales/*.json` and `content/tools/**`: interface copy and explanatory content, kept in lockstep across three locales.
- `e2e/engineering-calculators.spec.ts`: cross-tool query, locale, keyboard, responsive, and geometry-boundary coverage.

## Review Focus

- Near-zero positive attenuation produces very large finite resistors: Task 2 pins finite math and Task 8 checks that the resulting long labels stay within the diagram.
- A user can change T／π while another attenuator field is invalid: Task 3 verifies the selected card changes while the full diagram remains explicitly marked as the last valid result.
- A passive lossless reflection coefficient can lie anywhere on `|Γ|=1`, not only at ±1: Task 5 covers `Γ=0+j1` without mislabeling it as open or short.
- A transmission-line unit switch can occur while a geometry field is invalid: Task 7 verifies that the last-valid SI snapshot is preserved and reformatted in the new display unit.
- Entering both εeff and velocity factor creates a two-field conflict: Task 4 verifies errors on both fields, a stale diagram notice, and clean recovery after either field is cleared.

---

### Task 1: Shared diagram frame, status, and circuit primitives

**Files:**
- Create: `components/engineering/diagrams/EngineeringDiagramFrame.tsx`
- Create: `components/engineering/diagrams/EngineeringDiagramFrame.test.tsx`
- Create: `components/engineering/diagrams/CircuitSymbols.tsx`

**Interfaces:**
- Produces: `EngineeringDiagramFrame({ label, title, description, viewBox, stale, staleLabel, minWidthClassName?, children }: EngineeringDiagramFrameProps)`; it renders the responsive container, one accessible `<svg>`, localized `<title>/<desc>`, and the stale notice.
- Produces: `DiagramStatusNotice({ stale, label }: { stale: boolean; label: string })` for existing diagrams, such as the Smith chart, that already own their `<svg>`.
- Produces: `ResistorSymbol`, `InductorSymbol`, `CapacitorSymbol`, and `GroundSymbol`; each accepts explicit coordinates, `orientation: "horizontal" | "vertical"` where applicable, and an optional `testId`.

- [ ] **Step 1: Write failing frame and primitive tests**

Add tests asserting the frame exposes the requested accessible name, title and description; stale state adds `data-stale="true"` plus a `role="status"` notice; normal state has no notice; every primitive renders inside the same SVG and forwards its test id.

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `npm test -- components/engineering/diagrams/EngineeringDiagramFrame.test.tsx`  
Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement the frame, notice, and stateless primitives**

Use `useId()` to associate `<title>` and `<desc>` with the SVG. The stale style belongs on the diagram viewport, while the notice remains full-opacity text outside the SVG.

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run: `npm test -- components/engineering/diagrams/EngineeringDiagramFrame.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/engineering/diagrams
git commit -m "feat: add accessible engineering diagram frame"
```

### Task 2: Attenuator power model and zero-power boundary

**Files:**
- Modify: `lib/engineering/passive.ts`
- Modify: `lib/engineering/passive.test.ts`

**Interfaces:**
- Produces: both branches of `AttenuatorResult` retain their topology-specific `resistorsOhms` and `resistorDissipationW` fields and add optional `inputPowerW: number`, `outputPowerW: number`, and `estimatedTotalDissipationW: number`.
- Preserves: `symmetricAttenuator(input: { topology: "tee" | "pi"; attenuationDb: number; impedanceOhms: number; inputPowerWatts?: number }): EngineeringResult<AttenuatorResult>`.

- [ ] **Step 1: Extend the attenuator tests before changing the model**

For both topologies, assert a 6 dB, 50 Ω, 1 W case returns `inputPowerW=1`, `outputPowerW=10 ** (-0.6)`, total dissipation equal to input minus output, and individual resistor dissipation summing to total dissipation. Assert `inputPowerWatts=0` succeeds with every power field equal to zero, omitted power leaves every power summary undefined, and 0.001 dB produces finite positive resistor values. Assert 0 dB reports `field="attenuationDb"`, 0 Ω reports `field="impedanceOhms"`, negative power reports `field="inputPowerWatts"`, and each non-finite input reports its own field.

- [ ] **Step 2: Run the attenuator tests and confirm RED**

Run: `npm test -- lib/engineering/passive.test.ts`  
Expected: FAIL because output power is absent and zero power is rejected.

- [ ] **Step 3: Implement the typed power summary**

Use `Pout = Pin * 10 ** (-attenuationDb / 10)` and `Pdissipation = Pin - Pout`. Replace positive-only power validation with finite, non-negative validation; do not relax attenuation or impedance validation.

- [ ] **Step 4: Run engineering-core regression tests**

Run: `npm test -- lib/engineering/passive.test.ts lib/engineering/rf.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/engineering/passive.ts lib/engineering/passive.test.ts
git commit -m "feat: expose attenuator output power"
```

### Task 3: Discoverable T／π selector and complete attenuator diagram

**Files:**
- Create: `components/engineering/passive/AttenuatorTopologyPicker.tsx`
- Create: `components/engineering/passive/AttenuatorTopologyPicker.test.tsx`
- Modify: `components/engineering/passive/AttenuatorDiagram.tsx`
- Modify: `components/engineering/passive/AttenuatorMode.tsx`
- Modify: `components/engineering/passive/types.ts`
- Modify: `components/engineering/PassiveCircuitCalculatorApp.test.tsx`
- Modify: `locales/zh-TW.json`
- Modify: `locales/zh-CN.json`
- Modify: `locales/en.json`

**Interfaces:**
- Consumes: Task 1 frame/primitives and Task 2 `AttenuatorResult` power fields.
- Produces: `AttenuatorTopologyPicker({ value, onChange, label, hint, teeLabel, piLabel }: AttenuatorTopologyPickerProps)` using a keyboard-operable radiogroup and two schematic cards.
- Produces: `AttenuatorDiagram` props for localized title/description/port labels, topology, three resistor values and powers, attenuation, impedance, input/output/total power, plus `stale` and `staleLabel`.
- Adds to `PassiveCircuitCopy`: `attenuatorDiagramDescription`, `topologyHint`, `inputPortLabel`, `outputPortLabel`, `groundLabel`, `outputPowerLabel`, and `lastValidResultLabel`.

- [ ] **Step 1: Add failing selector, diagram, and integration tests**

Assert the selector exposes exactly two radios, arrow keys select π, `onChange("pi")` fires once, and selection is not color-only. In the calculator test, hydrate `topology=pi`, verify the π card and π network are selected, verify R1/R2/R3 and all power labels use the π mapping, enter `0` W and see zero power, then make attenuation invalid and switch to T: the card changes while the diagram retains the last valid π result with the stale notice.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `npm test -- components/engineering/passive/AttenuatorTopologyPicker.test.tsx components/engineering/PassiveCircuitCalculatorApp.test.tsx`  
Expected: FAIL because the selector and expanded diagram contract do not exist.

- [ ] **Step 3: Implement topology cards, field-specific errors, and live diagram data**

Map T powers as input-series→R1, shunt→R2, output-series→R3; map π powers as input-shunt→R1, series→R2, output-shunt→R3. Keep `topology` query values unchanged. Track `isStale` separately from the last valid `AttenuatorResult`; pass errors only to attenuation, impedance, or power fields that failed.

- [ ] **Step 4: Add all three locale dictionaries and run focused tests**

Run: `npm test -- components/engineering/passive/AttenuatorTopologyPicker.test.tsx components/engineering/PassiveCircuitCalculatorApp.test.tsx components/engineering/ToolAppRenderer.test.tsx`  
Expected: PASS with no missing copy properties.

- [ ] **Step 5: Run typecheck and commit**

```bash
npm run typecheck
git add components/engineering/passive components/engineering/PassiveCircuitCalculatorApp.test.tsx locales
git commit -m "feat: make attenuator topologies visual"
```

### Task 4: RF propagation result model, εeff guidance, and live diagram

**Files:**
- Create: `components/engineering/rf/types.ts`
- Create: `components/engineering/rf/PropagationDiagram.tsx`
- Create: `components/engineering/rf/PropagationDiagram.test.tsx`
- Modify: `components/engineering/RfQuickCalculatorApp.tsx`
- Modify: `components/engineering/RfQuickCalculatorApp.test.tsx`
- Modify: `locales/zh-TW.json`
- Modify: `locales/zh-CN.json`
- Modify: `locales/en.json`

**Interfaces:**
- Consumes: Task 1 diagram frame.
- Produces: `PropagationResult` with `frequencyHz`, `velocityMps`, `wavelengthM`, `halfM`, `quarterM`, `lengthM`, `delaySeconds`, `angleDegrees`, and `medium: { kind: "free-space" } | { kind: "effective-permittivity"; value: number } | { kind: "velocity-factor"; value: number }`.
- Produces: `ImpedanceResult` moved unchanged from the app into `components/engineering/rf/types.ts`, with Z, Y, Γ, reference impedance, limit, magnitude, phase, S11, VSWR, return loss, and mismatch loss.
- Produces: `PropagationDiagram({ label, description, values, labels, stale, staleLabel }: PropagationDiagramProps)` where every value passed to the SVG is already formatted text.
- Adds RF copy for diagram title/description, wave direction, λ markers, medium summary, εeff guidance, and stale-result text. Existing `permittivityLabel` becomes localized “Effective relative permittivity εeff”.

- [ ] **Step 1: Add failing propagation component and calculator tests**

Assert the default diagram contains 1 GHz, λ, λ/2, λ/4, 100 mm, the angle and delay; angle-input and delay-input modes update the same physical length; εeff=4 updates the medium and wavelength; long lengths use a repeated-wave/ellipsis marker rather than a wider SVG. Assert simultaneous εeff and velocity factor errors appear on both fields, the old diagram becomes stale, and clearing either field restores live state.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `npm test -- components/engineering/rf/PropagationDiagram.test.tsx components/engineering/RfQuickCalculatorApp.test.tsx`  
Expected: FAIL because the diagram and typed result contract do not exist.

- [ ] **Step 3: Move result types and implement propagation state**

Keep the existing query key `er`; only the visible label and explanation change. Build the complete `PropagationResult` only after every active input validates, preserve the last valid result otherwise, and derive per-field errors from the active conversion mode.

- [ ] **Step 4: Implement and integrate the responsive propagation SVG**

Use a fixed viewBox and schematic wave periods. Never scale the outer SVG width from the physical length; use the result angle to choose markers and display exact text.

- [ ] **Step 5: Update three locales, verify, and commit**

```bash
npm test -- components/engineering/rf/PropagationDiagram.test.tsx components/engineering/RfQuickCalculatorApp.test.tsx
npm run typecheck
git add components/engineering/rf components/engineering/RfQuickCalculatorApp.tsx components/engineering/RfQuickCalculatorApp.test.tsx locales
git commit -m "feat: add live RF propagation diagram"
```

### Task 5: RF load/reflection diagram and localized Smith link

**Files:**
- Create: `components/engineering/rf/ReflectionDiagram.tsx`
- Create: `components/engineering/rf/ReflectionDiagram.test.tsx`
- Modify: `components/engineering/RfQuickCalculatorApp.tsx`
- Modify: `components/engineering/RfQuickCalculatorApp.test.tsx`
- Modify: `components/engineering/ToolAppRenderer.tsx`
- Modify: `components/engineering/ToolAppRenderer.test.tsx`
- Modify: `locales/zh-TW.json`
- Modify: `locales/zh-CN.json`
- Modify: `locales/en.json`

**Interfaces:**
- Consumes: Task 1 diagram frame and Task 4 `ImpedanceResult` exported from `components/engineering/rf/types.ts`.
- Produces: `ReflectionDiagram({ label, description, values, labels, limit, stale, staleLabel }: ReflectionDiagramProps)` where `limit` is `"finite" | "short" | "open"` and formatted values include Z₀, ZL, Γ, VSWR, and return loss.
- Changes: `RfQuickCalculatorApp({ copy, smithChartHref }: { copy: RfQuickCalculatorCopy; smithChartHref: string })`.
- `ToolAppRenderer` supplies `localePath(locale, "/tools/smith-chart/app")`; the link does not carry RF values in this release.

- [ ] **Step 1: Add failing reflection-state tests**

Cover matched 50+j0 Ω, short, open, a normal 25+j25 Ω load, and `Γ=0+j1`. Assert only ±1 on the real axis receive open/short symbols; all `|Γ|=1` cases remain valid and display finite labels where mathematically defined. Assert invalid `|Γ|>1` preserves and marks the last valid diagram.

- [ ] **Step 2: Add failing locale-link tests**

Render `ToolAppRenderer` for zh-TW, zh-CN, and en and assert the RF tool links to `/tools/smith-chart/app`, `/zh-cn/tools/smith-chart/app`, and `/en/tools/smith-chart/app` respectively.

- [ ] **Step 3: Run focused tests and confirm RED**

Run: `npm test -- components/engineering/rf/ReflectionDiagram.test.tsx components/engineering/RfQuickCalculatorApp.test.tsx components/engineering/ToolAppRenderer.test.tsx`  
Expected: FAIL because the diagram and `smithChartHref` contract do not exist.

- [ ] **Step 4: Implement the diagram, field errors, and locale-preserving link**

Use arrow direction and labels in addition to color. Vary reflected-arrow emphasis from `|Γ|`, but retain exact text and a visible zero-reflection state. Attach parse/range errors to the active Z/Y/Γ fields and reference-impedance field.

- [ ] **Step 5: Update locales, verify, and commit**

```bash
npm test -- components/engineering/rf/ReflectionDiagram.test.tsx components/engineering/RfQuickCalculatorApp.test.tsx components/engineering/ToolAppRenderer.test.tsx
npm run typecheck
git add components/engineering/rf components/engineering/RfQuickCalculatorApp.tsx components/engineering/RfQuickCalculatorApp.test.tsx components/engineering/ToolAppRenderer.tsx components/engineering/ToolAppRenderer.test.tsx locales
git commit -m "feat: visualize RF reflections"
```

### Task 6: Smith L-match circuit diagrams and stale chart notice

**Files:**
- Create: `components/engineering/smith/MatchingNetworkDiagram.tsx`
- Create: `components/engineering/smith/MatchingNetworkDiagram.test.tsx`
- Modify: `components/engineering/SmithChartApp.tsx`
- Modify: `components/engineering/SmithChartApp.test.tsx`
- Modify: `locales/zh-TW.json`
- Modify: `locales/zh-CN.json`
- Modify: `locales/en.json`

**Interfaces:**
- Consumes: Task 1 frame/primitives, existing `MatchSolution`, and each result card's existing `ideal` and `rounded` solutions.
- Produces: `MatchingNetworkDiagram({ label, description, ideal, rounded, sourceLabel, loadLabel, idealLabel, roundedLabel, stale?, staleLabel? }: MatchingNetworkDiagramProps)`.
- Adds Smith copy for the circuit diagram name/description, source/load labels, and last-valid-result notice.

- [ ] **Step 1: Add failing topology tests**

Construct fixtures for `[series L, shunt C]`, `[series C, shunt L]`, `[shunt C, series L]`, and `[shunt L, series C]`. Assert source/load direction, ground attachment, component order and symbols, and separate ideal/rounded formatted values. Assert the component uses the two supplied `MatchSolution` objects without deriving a new topology.

- [ ] **Step 2: Add failing Smith integration tests**

After solving the default load, assert every solution card has an accessible matching-network image and the displayed topology matches its existing step text. Changing E24 to E96 updates rounded labels without changing topology. Invalidating a main Smith input preserves the chart and adds the stale-result notice.

- [ ] **Step 3: Run focused tests and confirm RED**

Run: `npm test -- components/engineering/smith/MatchingNetworkDiagram.test.tsx components/engineering/SmithChartApp.test.tsx`  
Expected: FAIL because matching diagrams and stale notice are absent.

- [ ] **Step 4: Implement diagram integration and localized status**

Pass the existing `ideal` and `rounded` values directly from each `MatchView`. Keep the current textual topology, preview Smith chart, and Apply action; the new circuit image supplements rather than replaces them.

- [ ] **Step 5: Update locales, verify, and commit**

```bash
npm test -- components/engineering/smith/MatchingNetworkDiagram.test.tsx components/engineering/SmithChartApp.test.tsx lib/engineering/matching.test.ts
npm run typecheck
git add components/engineering/smith components/engineering/SmithChartApp.tsx components/engineering/SmithChartApp.test.tsx locales
git commit -m "feat: draw Smith matching networks"
```

### Task 7: Live transmission-line geometry values and last-valid snapshot

**Files:**
- Modify: `components/engineering/transmission-line/GeometryDiagram.tsx`
- Modify: `components/engineering/transmission-line/GeometryDiagram.test.tsx`
- Modify: `components/engineering/TransmissionLineApp.tsx`
- Modify: `components/engineering/TransmissionLineApp.test.tsx`
- Modify: `locales/zh-TW.json`
- Modify: `locales/zh-CN.json`
- Modify: `locales/en.json`

**Interfaces:**
- Consumes: Task 1 diagram frame.
- Produces: `GeometryDiagramValues { width: string; thickness: string; heightOrPlanes: string; gap?: string; permittivity: string; impedance: string; electricalAngle: string }`.
- Changes: `GeometryDiagram({ kind, title, description, labels, values, stale, staleLabel }: GeometryDiagramProps)`; `GeometryLabels` adds localized conductor, dielectric, ground, impedance, and electrical-angle labels.
- `TransmissionLineApp` stores the last valid `TransmissionLineInput` in SI alongside the existing `TransmissionLineResult`, then formats that snapshot in the currently selected display unit.

- [ ] **Step 1: Add failing geometry component tests**

For microstrip, stripline, and CPWG, assert the correct dimensions and no irrelevant dimension are present; assert εr, Z₀, electrical angle, conductor/dielectric/ground legend, localized title/description, and stale status. Values must include units, not only W/h/b/t/s symbols.

- [ ] **Step 2: Add failing application-state tests**

Edit dimensions and verify the diagram updates. Switch mm→mil→µm and assert physical impedance is unchanged while every geometry label changes unit. Then enter an invalid width, switch units, and assert the diagram still represents the last-valid SI snapshot in the new unit with a stale notice. Verify model-range warning and stale error are separate states.

- [ ] **Step 3: Run focused tests and confirm RED**

Run: `npm test -- components/engineering/transmission-line/GeometryDiagram.test.tsx components/engineering/TransmissionLineApp.test.tsx`  
Expected: FAIL because live values and the SI snapshot do not exist.

- [ ] **Step 4: Implement last-valid input storage and field errors**

On every successful `analyzeTransmissionLine`, store the exact parsed SI `TransmissionLineInput` with its result. On failure, retain both. Format the stored SI input through the existing unit conversion functions; do not pass invalid raw strings to the SVG. Map parse or non-positive failures to `width`, `height`/`plane`, `gap` (CPWG only), `thickness`, `permittivity`, `frequency`, or `length`; map an invalid or unsatisfied target solve to `target` and clear `solvedWidth`.

- [ ] **Step 5: Implement the annotated cross-sections and verify**

Run: `npm test -- components/engineering/transmission-line/GeometryDiagram.test.tsx components/engineering/TransmissionLineApp.test.tsx lib/engineering/transmission-line*.test.ts`  
Expected: PASS for all UI and model tests.

- [ ] **Step 6: Update locales and commit**

```bash
npm run typecheck
git add components/engineering/transmission-line components/engineering/TransmissionLineApp.tsx components/engineering/TransmissionLineApp.test.tsx locales
git commit -m "feat: annotate transmission-line geometry"
```

### Task 8: Three-language content, cross-tool browser coverage, and release readiness

**Files:**
- Modify: `content/tools/passive-circuit-calculator.md`
- Modify: `content/tools/zh-cn/passive-circuit-calculator.md`
- Modify: `content/tools/en/passive-circuit-calculator.md`
- Modify: `content/tools/rf-calculator.md`
- Modify: `content/tools/zh-cn/rf-calculator.md`
- Modify: `content/tools/en/rf-calculator.md`
- Modify: `content/tools/smith-chart.md`
- Modify: `content/tools/zh-cn/smith-chart.md`
- Modify: `content/tools/en/smith-chart.md`
- Modify: `content/tools/transmission-line.md`
- Modify: `content/tools/zh-cn/transmission-line.md`
- Modify: `content/tools/en/transmission-line.md`
- Modify: `e2e/engineering-calculators.spec.ts`
- Modify: `docs/engineering-tools-v1-verification.md`

**Interfaces:**
- Consumes: all prior tasks' accessible names, locale copy, stable query keys, and test ids.
- Produces: updated public explanations of live diagrams, εeff versus material Dk, browser-only assumptions, and unchanged model limits in all three languages.
- Produces: one end-to-end regression path covering each new diagram and all release gates.

- [ ] **Step 1: Update all twelve tool documents**

Keep frontmatter slugs and app URLs unchanged. Describe T／π visual selection and power, RF propagation/reflection diagrams and εeff guidance, Smith matching schematics, and live transmission-line dimensions. Preserve every existing limitation and update `updatedAt` consistently.

- [ ] **Step 2: Add failing Playwright scenarios**

Cover: direct `topology=pi` hydration and keyboard selection; zero-power output; near-zero attenuation with long labels bounded by the SVG; propagation updates from length/angle/delay; εeff conflict and stale recovery; matched/short/open/`Γ=j` reflection states; locale-preserving Smith link; matching circuit images; all three live transmission-line diagrams; invalid-then-unit-switch behavior; 320/768/1440 widths; and dark/light visibility. Use DOM roles, text, query state, and bounding boxes rather than pixel snapshots.

- [ ] **Step 3: Run the feature browser suite and resolve in-scope failures**

Run: `NEXT_PUBLIC_SITE_URL=https://jk-space.com npx playwright test e2e/engineering-calculators.spec.ts`  
Expected: PASS with no page errors, hydration errors, overflow, clipping, or overlap. Diagnose each failure before editing; changes remain within the files and behavior covered by this specification, then rerun the failing scenario before rerunning the file.

- [ ] **Step 4: Run full verification**

Run: `npm run verify`  
Expected: lint, TypeScript, all Vitest files, legacy-news guards, and the production build pass.

Run: `NEXT_PUBLIC_SITE_URL=https://jk-space.com npm run test:e2e`  
Expected: all Playwright tests pass.

- [ ] **Step 5: Record evidence and commit**

Update `docs/engineering-tools-v1-verification.md` with the exact commands, counts, browser widths, locale coverage, and known ideal-model limitations.

```bash
git add content/tools e2e/engineering-calculators.spec.ts docs/engineering-tools-v1-verification.md
git commit -m "test: verify RF visualization enhancements"
```

- [ ] **Step 6: Obtain whole-branch review and Preview approval**

Request an independent review against the approved spec. Resolve every Critical or Important finding and rerun the affected focused tests plus full verification. Push the feature branch, create a GitHub PR, attach it to the task, wait for Vercel Preview success, and inspect the four affected tools in all three locales. Do not merge to `main` until the human approves the Preview or explicitly asks for production deployment.

