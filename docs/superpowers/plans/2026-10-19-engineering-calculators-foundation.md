# Engineering Calculators Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared engineering math platform plus the localized Engineering Converter, Passive Circuit Calculator, and RF Quick Calculator.

**Architecture:** Pure TypeScript modules under `lib/engineering` own parsing and calculations and never import React or locale data. A localized dynamic app route resolves only registered tools whose content is visible in the current environment, then renders focused client applications through a shared shell; existing non-localized PCB behavior remains unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Testing Library, Playwright, existing JSON dictionaries and Markdown content loaders; no new runtime dependency.

**Spec:** `docs/superpowers/specs/2026-10-19-jk-space-engineering-rf-tools-v1-design.md`

## Global Constraints

- All calculations run in the browser; do not add an API route, database, account, upload, or paid service.
- Internals use SI values, ohms, hertz, radians for trigonometry, and finite JavaScript numbers; UI angles use degrees.
- Calculation modules return structured error codes and warnings; visible copy comes only from the three locale dictionaries.
- Query parameters may contain public calculator state only; analytics must receive only tool slug and non-numeric action names.
- The existing PCB tool remains Traditional-Chinese-only and keeps its current `/tools/pcb-test-point/app` URL.
- New translated content stays `reviewed` until the owner authorizes publication.
- Follow TDD for every calculation and state serializer; do not add a calculation implementation before its failing test.

## Review Focus

- Ambiguous `m` and `M`, Unicode `µ`, `4k7`, negative values, whitespace, and non-finite exponents must parse or reject deterministically; Task 1 pins each case.
- Zero-ohm, open-circuit, unity-reflection, and zero-power inputs must never leak `NaN`; Tasks 2 and 3 pin these limits.
- Changing display units must not change the stored SI value; Tasks 4–7 pin round-trip serialization and component behavior.
- A `reviewed` translation must render in Preview but return 404 in production even though the dynamic app route exists; Task 8 pins both environments.
- Existing PCB links and JSON-LD must remain unprefixed while new localized apps use locale-prefixed install URLs; Tasks 4 and 8 pin both cases.

---

### Task 1: Numeric, complex, and preferred-value foundation

**Files:**
- Create: `lib/engineering/types.ts`
- Create: `lib/engineering/quantity.ts`
- Create: `lib/engineering/quantity.test.ts`
- Create: `lib/engineering/complex.ts`
- Create: `lib/engineering/complex.test.ts`
- Create: `lib/engineering/standard-values.ts`
- Create: `lib/engineering/standard-values.test.ts`

**Interfaces:**
- Produces: `EngineeringErrorCode`, `EngineeringWarning`, `EngineeringResult<T>` from `types.ts`.
- Produces: `parseEngineeringNumber(input: string): EngineeringResult<number>` and `formatEngineering(value: number, options?: { unit?: string; significantDigits?: number }): string`.
- Produces: `Complex { re: number; im: number }`, `complexAdd`, `complexSubtract`, `complexMultiply`, `complexDivide`, `complexReciprocal`, `complexMagnitude`, `complexPhaseDegrees`, `complexFromPolar`.
- Produces: `ESeries = 12 | 24 | 48 | 96` and `nearestStandardValues(value: number, series: ESeries, count?: number): number[]`.

- [ ] **Step 1: Write failing quantity tests**

Assert `4k7 → 4700`, `2R2 → 2.2`, `100n → 1e-7`, `3p3 → 3.3e-12`, `1µ → 1e-6`, case-sensitive `1m → 1e-3` and `1M → 1e6`; blank, `NaN`, `Infinity`, `1e309`, doubled prefixes, and trailing garbage return `ok: false` with `invalid_number` or `non_finite`. Assert formatting never emits `-0`, `NaN`, or `Infinity` for a successful finite input.

- [ ] **Step 2: Run quantity tests and verify the missing module failure**

Run: `npm test -- lib/engineering/quantity.test.ts`
Expected: FAIL because `quantity.ts` does not exist.

- [ ] **Step 3: Implement shared result types and quantity parsing/formatting**

Implement the exact Task 1 interfaces. Prefix parsing is case-sensitive, accepts ASCII `u` and Unicode `µ`, trims outer whitespace, and treats embedded engineering notation as a single decimal separator only.

- [ ] **Step 4: Run quantity tests**

Run: `npm test -- lib/engineering/quantity.test.ts`
Expected: PASS.

- [ ] **Step 5: Write failing complex and E-series tests**

Assert `(3+j4)` magnitude is `5`, reciprocal round-trips within `1e-12`, division by `0+j0` returns `division_by_zero`, E12 neighbors around `4700` include `3900`, `4700`, `5600`, and non-positive or non-finite preferred-value requests return `[]`.

- [ ] **Step 6: Implement complex operations and preferred-value search**

Use immutable return values. Generate IEC nominal mantissas once, search the adjacent decades, return unique positive values ordered by relative error, then numeric value for ties.

- [ ] **Step 7: Run foundation tests**

Run: `npm test -- lib/engineering/quantity.test.ts lib/engineering/complex.test.ts lib/engineering/standard-values.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit the foundation**

```bash
git add lib/engineering
git commit -m "feat: add engineering numeric foundation"
```

### Task 2: RF power, wavelength, and reflection math

**Files:**
- Create: `lib/engineering/rf.ts`
- Create: `lib/engineering/rf.test.ts`

**Interfaces:**
- Consumes: `Complex`, complex helpers, and `EngineeringResult<T>` from Task 1.
- Produces: `powerWattsFromDbm(dbm: number): EngineeringResult<number>` and `dbmFromPowerWatts(watts: number): EngineeringResult<number>`.
- Produces: `rfVoltageFromPower(input: { watts: number; impedanceOhms: number }): EngineeringResult<{ vrms: number; vPeak: number; vPeakToPeak: number; iRms: number }>`.
- Produces: `wavelength(input: { frequencyHz: number; relativePermittivity?: number; velocityFactor?: number }): EngineeringResult<{ velocityMps: number; wavelengthM: number; halfM: number; quarterM: number; delaySecondsPerM: number }>`.
- Produces: `impedanceToAdmittance(z: Complex): EngineeringResult<Complex>`, `reflectionCoefficient(z: Complex, referenceOhms: number): EngineeringResult<Complex>`, and `reflectionMetrics(gamma: Complex): EngineeringResult<{ magnitude: number; phaseDegrees: number; s11Db: number; vswr: number; returnLossDb: number; mismatchLossDb: number }>`.

- [ ] **Step 1: Write failing RF reference and boundary tests**

Assert `0 dBm = 1 mW`, `30 dBm = 1 W`, `1 W into 50 Ω = sqrt(50) Vrms`, `1 GHz` free-space wavelength equals `0.299792458 m`, `Z=50+j0` at `Z0=50` gives `Γ=0`, VSWR `1`, infinite return loss represented by the documented successful sentinel, and `Z=0` gives `Γ=-1`, VSWR `Infinity` only in the explicit metric field rather than an error payload. Reject negative power, non-positive impedance/frequency/permittivity, `Z=-Z0`, and non-finite values.

- [ ] **Step 2: Run RF tests and verify failure**

Run: `npm test -- lib/engineering/rf.test.ts`
Expected: FAIL because `rf.ts` does not exist.

- [ ] **Step 3: Implement the RF interfaces**

Use `299_792_458 m/s`. If both velocity factor and relative permittivity are supplied, return `conflicting_inputs`. Encode mathematically meaningful open/short limits in successful result fields and reserve `ok: false` for undefined operations.

- [ ] **Step 4: Run RF tests**

Run: `npm test -- lib/engineering/rf.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit RF math**

```bash
git add lib/engineering/rf.ts lib/engineering/rf.test.ts
git commit -m "feat: add RF quick calculation core"
```

### Task 3: Passive circuit math

**Files:**
- Create: `lib/engineering/passive.ts`
- Create: `lib/engineering/passive.test.ts`

**Interfaces:**
- Consumes: `EngineeringResult<T>`, `ESeries`, and `nearestStandardValues` from Task 1.
- Produces: `loadedDivider(input: { vin: number; rTopOhms: number; rBottomOhms: number; loadOhms?: number }): EngineeringResult<DividerResult>` where `DividerResult` includes `vout`, branch current, each resistor power, and effective bottom resistance.
- Produces: `suggestDivider(input: { vin: number; targetVout: number; series: ESeries; nominalCurrentA?: number; loadOhms?: number; limit?: number }): EngineeringResult<DividerCandidate[]>`, ordered by relative voltage error then total resistance.
- Produces: `dividerWorstCase(input: { vin: number; rTopOhms: number; rBottomOhms: number; tolerancePercent: number; loadOhms?: number }): EngineeringResult<{ minVout: number; maxVout: number }>`.
- Produces: `rcCutoffHz`, `rcTimeConstantSeconds`, `lcResonanceHz`, `seriesRlc`, `parallelRlc`, `capacitiveReactanceOhms`, `inductiveReactanceOhms` with named object inputs.
- Produces: `symmetricAttenuator(input: { topology: "tee" | "pi"; attenuationDb: number; impedanceOhms: number; inputPowerWatts?: number }): EngineeringResult<AttenuatorResult>`.

- [ ] **Step 1: Write failing divider tests**

Assert a 10 V divider with two 10 kΩ resistors returns 5 V; a 10 kΩ load changes the effective bottom leg to 5 kΩ and output to `10/3 V`; a 1% worst-case result brackets nominal; an E24 suggestion for 3.3 V to 1.8 V returns candidates in deterministic error order. Reject `targetVout <= 0`, `targetVout >= vin`, non-positive resistances, and non-finite load values.

- [ ] **Step 2: Run divider tests and verify failure**

Run: `npm test -- lib/engineering/passive.test.ts -t divider`
Expected: FAIL because `passive.ts` does not exist.

- [ ] **Step 3: Implement divider calculations and candidate search**

Limit candidate generation to preferred values in the decades surrounding the ideal pair, deduplicate by `(rTop, rBottom)`, and calculate ranking from the loaded result rather than the unloaded ratio.

- [ ] **Step 4: Write failing reactive and attenuator tests**

Assert `1 kΩ + 100 nF` gives `1591.549 Hz`, `10 nH + 1 pF` gives approximately `1.591549 GHz`, `XL` and `XC` magnitudes are reciprocal at resonance, and 6 dB 50 Ω tee/pi networks return positive finite resistor values. Assert zero/negative R, L, C, frequency, impedance, and attenuation return structured errors.

- [ ] **Step 5: Implement reactive and symmetric attenuator functions**

Keep ideal formulas separate by topology. When optional input power is omitted, omit branch power; do not invent a default power rating.

- [ ] **Step 6: Run passive tests**

Run: `npm test -- lib/engineering/passive.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit passive math**

```bash
git add lib/engineering/passive.ts lib/engineering/passive.test.ts
git commit -m "feat: add passive circuit calculation core"
```

### Task 4: Localized engineering-tool route and shared application shell

**Files:**
- Modify: `lib/content/shared.ts`
- Modify: `lib/tools.ts`
- Modify: `lib/tools.test.ts`
- Create: `lib/engineering/tool-registry.ts`
- Create: `lib/engineering/tool-registry.test.ts`
- Create: `lib/engineering/query-state.ts`
- Create: `lib/engineering/query-state.test.ts`
- Create: `components/engineering/EngineeringToolShell.tsx`
- Create: `components/engineering/CalculatorField.tsx`
- Create: `components/engineering/ResultPanel.tsx`
- Modify: `components/tools/OpenToolLink.tsx`
- Modify: `components/tools/OpenToolLink.test.tsx`
- Modify: `components/pages/ToolsPage.tsx`
- Modify: `components/pages/ToolDetailPage.tsx`
- Modify: `components/home/FeaturedTool.tsx`
- Modify: `lib/seo.ts`
- Modify: `lib/seo.test.ts`

**Interfaces:**
- Consumes: existing content visibility and locale helpers.
- Produces: optional `localizedApp: boolean` on `ToolItem`, defaulting to `false` when absent.
- Produces: `ENGINEERING_TOOL_SLUGS`, `EngineeringToolSlug`, `isEngineeringToolSlug`, and `getEngineeringToolDefinition(slug)`; initial registered slugs are `engineering-converter`, `passive-circuit-calculator`, and `rf-calculator`.
- Produces: `encodeToolState(state: Record<string, string | number | boolean>): string` and `decodeToolState(search: string, allowedKeys: readonly string[]): Record<string, string>`; unknown keys and values over 200 characters are discarded.
- Changes: `OpenToolLink` receives `locale: Locale` and `localized?: boolean`; internal hrefs are locale-prefixed only when `localized` is true.

- [ ] **Step 1: Write failing content and link tests**

Assert `localizedApp: true` parses, a non-boolean value fails validation, absence yields `false`, English localized links become `/en/tools/engineering-converter/app`, and the existing PCB link remains `/tools/pcb-test-point/app`. Assert localized `toolJsonLd().installUrl` follows locale while PCB install URL does not.

- [ ] **Step 2: Run targeted tests and verify failure**

Run: `npm test -- lib/tools.test.ts components/tools/OpenToolLink.test.tsx lib/seo.test.ts`
Expected: FAIL on missing `localizedApp` behavior.

- [ ] **Step 3: Add the content field and locale-aware app URL behavior**

Add `optionalBoolean(field)` to `ContentFields`, parse `localizedApp`, update all three `OpenToolLink` callers, and localize `SoftwareApplication.installUrl` only for localized apps.

- [ ] **Step 4: Write failing registry and query-state tests**

Assert only the three initial slugs resolve, unknown query keys and oversized values are dropped, serialization orders keys lexicographically, and decoding malformed percent-encoding returns a safe empty state.

- [ ] **Step 5: Implement the registry, state serializer, and shared shell**

The registry contains data only and never imports React components. The shell receives localized title, description, back link, privacy statement, and application component as typed props.

- [ ] **Step 6: Run route and shared-component tests**

Run: `npm test -- lib/tools.test.ts lib/engineering/tool-registry.test.ts lib/engineering/query-state.test.ts components/tools/OpenToolLink.test.tsx lib/seo.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit the localized application boundary**

```bash
git add lib/content/shared.ts lib/tools.ts lib/tools.test.ts lib/engineering/tool-registry.ts lib/engineering/tool-registry.test.ts lib/engineering/query-state.ts lib/engineering/query-state.test.ts components/engineering components/tools/OpenToolLink.tsx components/tools/OpenToolLink.test.tsx components/pages/ToolsPage.tsx components/pages/ToolDetailPage.tsx components/home/FeaturedTool.tsx lib/seo.ts lib/seo.test.ts
git commit -m "feat: add localized engineering tool shell"
```

### Task 5: Engineering Converter application

**Files:**
- Create: `components/engineering/EngineeringConverterApp.tsx`
- Create: `components/engineering/EngineeringConverterApp.test.tsx`

**Interfaces:**
- Consumes: Task 1 quantity helpers, Task 2 power helpers, shared fields/panels, and query-state helpers.
- Produces: `EngineeringConverterApp({ copy }: { copy: EngineeringConverterCopy })`.

- [ ] **Step 1: Write failing UI tests**

Assert the general converter accepts `4k7`, converts Ω to kΩ without changing the SI value, the RF tab converts `0 dBm` at `50 Ω` to `1 mW` and about `223.607 mVrms`, changing to `75 Ω` changes voltage but not power, invalid text shows an associated alert and preserves the last valid result, and reset restores the documented example.

- [ ] **Step 2: Run the component test and verify failure**

Run: `npm test -- components/engineering/EngineeringConverterApp.test.tsx`
Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the converter application**

Use controlled text fields and store canonical SI values separately from display units. Tabs are keyboard-operable buttons with selected state; the URL state includes only mode, value, from-unit, to-unit, and impedance.

- [ ] **Step 4: Run converter and query-state tests**

Run: `npm test -- components/engineering/EngineeringConverterApp.test.tsx lib/engineering/query-state.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit the converter**

```bash
git add components/engineering/EngineeringConverterApp.tsx components/engineering/EngineeringConverterApp.test.tsx
git commit -m "feat: add engineering converter app"
```

### Task 6: Passive Circuit Calculator application

**Files:**
- Create: `components/engineering/PassiveCircuitCalculatorApp.tsx`
- Create: `components/engineering/PassiveCircuitCalculatorApp.test.tsx`

**Interfaces:**
- Consumes: Task 3 passive functions, Task 1 parsing/formatting, shared fields/panels, and query-state helpers.
- Produces: `PassiveCircuitCalculatorApp({ copy }: { copy: PassiveCircuitCopy })` with divider, RC/LC/RLC, reactance, and attenuator modes.

- [ ] **Step 1: Write failing UI tests**

Assert the divider example produces 1.8 V candidates from 3.3 V, enabling a load changes results, switching E-series changes suggested values, RC mode computes the documented cutoff, LC mode computes resonance, and 6 dB 50 Ω tee/pi modes show positive finite resistors. Invalid or contradictory inputs show localized errors without replacing the last valid result.

- [ ] **Step 2: Run the passive app test and verify failure**

Run: `npm test -- components/engineering/PassiveCircuitCalculatorApp.test.tsx`
Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the passive calculator application**

Keep each mode in a focused child section inside the same file only while the file stays under 350 lines; split sections into `components/engineering/passive/` if it exceeds that limit. URL state includes only the active mode and its active input set.

- [ ] **Step 4: Run passive application and core tests**

Run: `npm test -- components/engineering/PassiveCircuitCalculatorApp.test.tsx lib/engineering/passive.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit the passive calculator**

```bash
git add components/engineering/PassiveCircuitCalculatorApp.tsx components/engineering/PassiveCircuitCalculatorApp.test.tsx
git commit -m "feat: add passive circuit calculator app"
```

### Task 7: RF Quick Calculator application

**Files:**
- Create: `components/engineering/RfQuickCalculatorApp.tsx`
- Create: `components/engineering/RfQuickCalculatorApp.test.tsx`

**Interfaces:**
- Consumes: Task 2 RF functions, Task 1 complex/quantity helpers, shared fields/panels, and query-state helpers.
- Produces: `RfQuickCalculatorApp({ copy }: { copy: RfQuickCalculatorCopy })` with wavelength/electrical-length and impedance/reflection modes.

- [ ] **Step 1: Write failing RF Quick UI tests**

Assert 1 GHz displays free-space, half, and quarter wavelength; dielectric input changes velocity and wavelength; 50+j0 Ω at 50 Ω displays Γ=0 and VSWR=1; 25+j25 Ω displays finite Z, Y, Γ, S11, return loss, and mismatch loss; contradictory velocity-factor/permittivity input is rejected.

- [ ] **Step 2: Run the component test and verify failure**

Run: `npm test -- components/engineering/RfQuickCalculatorApp.test.tsx`
Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the RF Quick application**

Display complex numbers in both rectangular and polar form. Render infinite ideal limits as localized `∞` labels while preserving the exact numeric sentinel in the core result.

- [ ] **Step 4: Run RF Quick and core tests**

Run: `npm test -- components/engineering/RfQuickCalculatorApp.test.tsx lib/engineering/rf.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit RF Quick**

```bash
git add components/engineering/RfQuickCalculatorApp.tsx components/engineering/RfQuickCalculatorApp.test.tsx
git commit -m "feat: add RF quick calculator app"
```

### Task 8: Three-language content, metadata, sitemap, and Phase 1 verification

**Files:**
- Modify: `locales/zh-TW.json`
- Modify: `locales/zh-CN.json`
- Modify: `locales/en.json`
- Create: `content/tools/engineering-converter.md`
- Create: `content/tools/zh-cn/engineering-converter.md`
- Create: `content/tools/en/engineering-converter.md`
- Create: `content/tools/passive-circuit-calculator.md`
- Create: `content/tools/zh-cn/passive-circuit-calculator.md`
- Create: `content/tools/en/passive-circuit-calculator.md`
- Create: `content/tools/rf-calculator.md`
- Create: `content/tools/zh-cn/rf-calculator.md`
- Create: `content/tools/en/rf-calculator.md`
- Create: `components/engineering/ToolAppRenderer.tsx`
- Create: `components/engineering/ToolAppRenderer.test.tsx`
- Create: `components/engineering/EngineeringToolAppPage.tsx`
- Create: `components/engineering/EngineeringToolAppPage.test.tsx`
- Create: `app/(zh-tw)/tools/[slug]/app/page.tsx`
- Create: `app/[locale]/tools/[slug]/app/page.tsx`
- Modify: `lib/seo.ts`
- Modify: `lib/seo.test.ts`
- Modify: `app/sitemap.ts`
- Modify: `app/seo.test.tsx`
- Create: `e2e/engineering-calculators.spec.ts`

**Interfaces:**
- Consumes: all prior Phase 1 tasks and current content/SEO infrastructure.
- Produces: complete `engineeringTools` dictionary subtree with identical keys in all locales.
- Produces: three original tool pages and six `reviewed` translations, each with `localizedApp: true` and its logical unprefixed `appUrl`.
- Produces: `ToolAppRenderer` with a static component map for the three registered slugs and `EngineeringToolAppPage({ locale, slug, visibility })`, which calls `notFound()` unless both the registry definition and visible localized tool content exist.
- Changes: sitemap appends an app URL only for a production-visible tool with `localizedApp: true`, with the same locale availability as its introduction page.

- [ ] **Step 1: Write failing dictionary, content, metadata, and sitemap tests**

Assert all three dictionaries contain identical non-empty engineering-tool keys; Preview loads all nine content files while production excludes the six reviewed translations; a reviewed English app renders in Preview but calls `notFound()` in production; localized application metadata is self-canonical with reciprocal alternates; sitemap excludes reviewed translations in production and includes only visible localized app URLs.

- [ ] **Step 2: Run integration tests and verify failure**

Run: `npm test -- lib/i18n/dictionaries.test.ts lib/tools.test.ts lib/seo.test.ts app/seo.test.tsx`
Expected: FAIL because dictionaries, content, and localized app sitemap entries do not exist.

- [ ] **Step 3: Add the three-language dictionaries and content**

Each introduction covers purpose, exact inputs/outputs, at least one worked example, formulas, assumptions, privacy, ideal-model limitations, and update date. Keep translations `reviewed`; do not publish them in this task.

- [ ] **Step 4: Add the static app renderer, dynamic routes, metadata, and sitemap entries**

Select components from a static typed map rather than user-controlled imports. Generate app metadata from the visible localized tool item and registry definition. Derive app sitemap alternates from content availability; do not maintain a second hard-coded locale list.

- [ ] **Step 5: Write Playwright flows for all three applications**

Test direct navigation in all three locales, one representative calculation per app, invalid input recovery, query-state reload, language-preserving back links, mobile viewport without horizontal overflow, and absence of calculation-value network requests.

- [ ] **Step 6: Run Phase 1 focused verification**

Run: `npm test -- lib/engineering components/engineering lib/tools.test.ts lib/i18n/dictionaries.test.ts lib/seo.test.ts app/seo.test.tsx`
Expected: PASS.

Run: `npx playwright test e2e/engineering-calculators.spec.ts`
Expected: PASS.

- [ ] **Step 7: Run full repository verification**

Run: `npm run verify`
Expected: PASS with lint, TypeScript, all Vitest tests, legacy-news guard, and production build.

Run: `npm run test:e2e`
Expected: PASS for existing and new E2E suites.

- [ ] **Step 8: Commit Phase 1 integration**

```bash
git add locales content/tools components/engineering/ToolAppRenderer.tsx components/engineering/ToolAppRenderer.test.tsx components/engineering/EngineeringToolAppPage.tsx components/engineering/EngineeringToolAppPage.test.tsx app/'(zh-tw)'/tools/'[slug]'/app/page.tsx app/'[locale]'/tools/'[slug]'/app/page.tsx lib/seo.ts lib/seo.test.ts app/sitemap.ts app/seo.test.tsx e2e/engineering-calculators.spec.ts
git commit -m "feat: publish engineering calculator preview"
```

