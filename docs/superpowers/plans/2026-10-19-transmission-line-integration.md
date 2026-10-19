# Transmission Line and Release Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add versioned Microstrip, symmetric Stripline, and grounded CPW calculators with forward/reverse solving, then prepare the complete five-tool first version as a reviewed Preview release.

**Architecture:** Pure quasi-static model functions consume SI geometry and return characteristic impedance plus propagation metrics. A bounded bisection solver reuses the forward functions for target-impedance width synthesis; the localized client app provides geometry diagrams, units, warnings, and shareable state without pretending to be a field solver.

**Tech Stack:** Next.js 16, React 19, TypeScript, SVG, Vitest, Testing Library, Playwright, existing content/i18n/SEO infrastructure; no new runtime dependency.

**Spec:** `docs/superpowers/specs/2026-10-19-jk-space-engineering-rf-tools-v1-design.md`

**Depends on:** `docs/superpowers/plans/2026-10-19-engineering-calculators-foundation.md` and `docs/superpowers/plans/2026-10-19-smith-chart-matching.md`

## Global Constraints

- Models are lossless quasi-static estimates only; do not add dispersion, roughness, solder mask, trapezoidal copper, finish, discontinuities, vias, connectors, or full conductor/dielectric loss.
- Microstrip uses Hammerstad–Jensen quasi-static impedance/effective-permittivity plus its finite-thickness correction, without Kirschning–Jansen dispersion.
- Symmetric Stripline uses Michael Steer's finite-thickness centered-stripline equations (3.42)–(3.44) and rejects off-center/asymmetric geometry.
- CPWG uses Qucs Technical Guide equations (12.10)–(12.18) for finite substrate/backside ground and first-order thickness correction, without equations (12.19) onward.
- Inputs display mm, mil, or µm but calculation modules receive meters; frequency is hertz and dielectric constant is dimensionless.
- Reverse solving must report failure and never reuse a previous width when no bounded solution exists.
- New translations remain `reviewed`; completing this plan does not authorize merging or production deployment.

## Review Focus

- Elliptic modulus values near 0 or 1 and extreme width/gap ratios can overflow; Tasks 1 and 4 pin finite-domain behavior.
- Conductor thickness equal to or larger than gap, width, or plane spacing invalidates corrections; Tasks 2–4 reject these geometries explicitly.
- A target impedance outside the selected geometry bounds must return `no_bracket`, not the nearest boundary as a false solution; Task 5 pins it.
- Switching mm/mil/µm must preserve physical geometry and query-state SI values; Task 5 pins round-trip behavior.
- Formula labels, warnings, metadata, sitemap, and three-language content must match the actual selected model; Task 6 pins each public surface.

---

### Task 1: Elliptic-integral and bounded-solver primitives

**Files:**
- Create: `lib/engineering/numerics.ts`
- Create: `lib/engineering/numerics.test.ts`

**Interfaces:**
- Consumes: `EngineeringResult<T>` from the foundation plan.
- Produces: `completeEllipticKModulus(k: number): EngineeringResult<number>` where `k` is the modulus, not parameter `m`.
- Produces: `solveBisection(input: { fn: (x: number) => number; target: number; min: number; max: number; relativeTolerance?: number; maxIterations?: number }): EngineeringResult<number>` with defaults `1e-9` and `100`.

- [ ] **Step 1: Write failing elliptic-integral tests**

Assert `K(0)=π/2`, `K(1/√2)=1.8540746773013719` within `1e-12`, values remain monotonic and finite for `k=1e-12` and `k=1-1e-12`, and `k<0`, `k>=1`, or non-finite input returns `out_of_range`.

- [ ] **Step 2: Run the numeric test and verify failure**

Run: `npm test -- lib/engineering/numerics.test.ts`
Expected: FAIL because `numerics.ts` does not exist.

- [ ] **Step 3: Implement `completeEllipticKModulus` using AGM**

Compute `π / (2 AGM(1, sqrt(1-k²)))`; terminate when the relative arithmetic/geometric mean difference is below `1e-15` or return `no_convergence` after 100 iterations.

- [ ] **Step 4: Write failing bisection tests**

Assert the solver finds `sqrt(2)` for `x²=2`, accepts increasing and decreasing monotonic functions, returns `no_bracket` when target is outside endpoint values, rejects invalid bounds/non-finite evaluations, and returns `no_convergence` when iteration limits prevent the requested tolerance.

- [ ] **Step 5: Implement and run numeric primitive tests**

Run: `npm test -- lib/engineering/numerics.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit numerical primitives**

```bash
git add lib/engineering/numerics.ts lib/engineering/numerics.test.ts
git commit -m "feat: add transmission-line numeric primitives"
```

### Task 2: Hammerstad–Jensen Microstrip model

**Files:**
- Create: `lib/engineering/transmission-line.ts`
- Create: `lib/engineering/transmission-line.microstrip.test.ts`
- Create: `docs/engineering/transmission-line-models.md`

**Interfaces:**
- Consumes: shared result types.
- Produces: `TransmissionLineResult { impedanceOhms: number; effectivePermittivity: number; phaseVelocityMps: number; wavelengthM: number; delaySecondsPerM: number; electricalLengthDegrees: number; warnings: EngineeringWarning[] }`.
- Produces: `microstripHammerstadJensen(input: { widthM: number; substrateHeightM: number; conductorThicknessM: number; relativePermittivity: number; frequencyHz: number; lengthM: number }): EngineeringResult<TransmissionLineResult>`.

- [ ] **Step 1: Write failing Microstrip reference and domain tests**

For FR-4-like `εr=4.3`, `h=1.6 mm`, `w=3.0 mm`, `t=35 µm`, `f=1 GHz`, assert characteristic impedance is between 45 Ω and 55 Ω, `1 < εeff < εr`, wavelength is below free-space wavelength, and zero-length electrical angle is zero. Assert zero/negative dimensions, `t>=w`, `εr<1`, and non-positive frequency are rejected; ratios outside the documented Hammerstad–Jensen range return a warning rather than silent normal output.

- [ ] **Step 2: Run the Microstrip test and verify failure**

Run: `npm test -- lib/engineering/transmission-line.microstrip.test.ts`
Expected: FAIL because the model does not exist.

- [ ] **Step 3: Implement the exact quasi-static H–J equations and propagation metrics**

Name intermediate normalized width and thickness-corrected widths after the Qucs Technical Guide Chapter 11 notation. Do not call a dispersion function. Record equations, variable definitions, omissions, and source citation in `docs/engineering/transmission-line-models.md`.

- [ ] **Step 4: Run Microstrip tests**

Run: `npm test -- lib/engineering/transmission-line.microstrip.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit Microstrip**

```bash
git add lib/engineering/transmission-line.ts lib/engineering/transmission-line.microstrip.test.ts docs/engineering/transmission-line-models.md
git commit -m "feat: add Hammerstad Jensen microstrip model"
```

### Task 3: Finite-thickness symmetric Stripline model

**Files:**
- Modify: `lib/engineering/transmission-line.ts`
- Create: `lib/engineering/transmission-line.stripline.test.ts`
- Modify: `docs/engineering/transmission-line-models.md`

**Interfaces:**
- Produces: `symmetricStriplineFiniteThickness(input: { widthM: number; planeSeparationM: number; conductorThicknessM: number; relativePermittivity: number; frequencyHz: number; lengthM: number }): EngineeringResult<TransmissionLineResult>`.

- [ ] **Step 1: Write failing Stripline reference and domain tests**

For `εr=4.3`, `b=1.6 mm` plane separation, `w=0.10 mm`, `t=35 µm`, and `1 GHz`, assert impedance is approximately `95.207720 Ω`, `εeff=εr`, and propagation metrics use `c/√εr`. Assert `t>=b`, non-positive geometry/frequency, `εr<1`, and unsupported shape ratios are rejected or warned according to the documented validity range.

- [ ] **Step 2: Run the Stripline test and verify failure**

Run: `npm test -- lib/engineering/transmission-line.stripline.test.ts`
Expected: FAIL because `symmetricStriplineFiniteThickness` does not exist.

- [ ] **Step 3: Implement Steer equations (3.42)–(3.44) and document the symmetric geometry**

The public input has one plane separation and therefore encodes a centered trace only; do not accept top/bottom distances that suggest unsupported asymmetric Stripline.

- [ ] **Step 4: Run Stripline and Microstrip tests**

Run: `npm test -- lib/engineering/transmission-line.microstrip.test.ts lib/engineering/transmission-line.stripline.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit Stripline**

```bash
git add lib/engineering/transmission-line.ts lib/engineering/transmission-line.stripline.test.ts docs/engineering/transmission-line-models.md
git commit -m "feat: add finite thickness symmetric stripline model"
```

### Task 4: Qucs grounded CPW model

**Files:**
- Modify: `lib/engineering/transmission-line.ts`
- Create: `lib/engineering/transmission-line.cpwg.test.ts`
- Modify: `docs/engineering/transmission-line-models.md`

**Interfaces:**
- Consumes: `completeEllipticKModulus` from Task 1.
- Produces: `groundedCoplanarWaveguideQucs(input: { widthM: number; gapM: number; substrateHeightM: number; conductorThicknessM: number; relativePermittivity: number; frequencyHz: number; lengthM: number }): EngineeringResult<TransmissionLineResult>`.

- [ ] **Step 1: Write failing CPWG equation and boundary tests**

For zero-thickness `εr=4.3`, `h=1.6 mm`, `w=3.0 mm`, `gap=0.2 mm`, and `1 GHz`, assert equations (12.10)–(12.13) give approximately `36.35 Ω` and `εeff≈2.873` within 1%; a realistic 35 µm correction remains finite and positive. Reject `t>=gap`, zero/negative geometry, `εr<1`, elliptic modulus outside `[0,1)`, and correction producing a non-positive effective gap.

- [ ] **Step 2: Run the CPWG test and verify failure**

Run: `npm test -- lib/engineering/transmission-line.cpwg.test.ts`
Expected: FAIL because `groundedCoplanarWaveguideQucs` does not exist.

- [ ] **Step 3: Implement Qucs equations (12.10)–(12.18)**

Keep equation-number comments beside the relevant operations. Do not implement the dispersion expression beginning at (12.19). Document infinite lateral-ground and continuous backside-ground assumptions.

- [ ] **Step 4: Run all forward-model tests**

Run: `npm test -- lib/engineering/transmission-line.*.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit grounded CPW**

```bash
git add lib/engineering/transmission-line.ts lib/engineering/transmission-line.cpwg.test.ts docs/engineering/transmission-line-models.md
git commit -m "feat: add Qucs grounded CPW model"
```

### Task 5: Width synthesis and Transmission Line application

**Files:**
- Create: `lib/engineering/transmission-line-solver.ts`
- Create: `lib/engineering/transmission-line-solver.test.ts`
- Create: `components/engineering/TransmissionLineApp.tsx`
- Create: `components/engineering/TransmissionLineApp.test.tsx`
- Create: `components/engineering/transmission-line/GeometryDiagram.tsx`
- Create: `components/engineering/transmission-line/GeometryDiagram.test.tsx`
- Modify: `lib/engineering/tool-registry.ts`
- Modify: `components/engineering/ToolAppRenderer.tsx`

**Interfaces:**
- Consumes: Tasks 1–4, shared quantity/query-state/shell modules.
- Produces: `TransmissionLineKind = "microstrip" | "stripline" | "cpwg"` and discriminated `TransmissionLineInput`.
- Produces: `analyzeTransmissionLine(input: TransmissionLineInput): EngineeringResult<TransmissionLineResult>`.
- Produces: `solveTransmissionLineWidth(input: Omit<TransmissionLineInput, "widthM"> & { targetImpedanceOhms: number; minWidthM?: number; maxWidthM?: number }): EngineeringResult<{ widthM: number; result: TransmissionLineResult }>` with defaults based on `1e-3` to `100` times the relevant substrate height and geometry validation applied before solving.
- Produces: `TransmissionLineApp({ copy }: { copy: TransmissionLineCopy })` registered as `transmission-line`.

- [ ] **Step 1: Write failing solver tests**

Generate a forward result for each model, solve its impedance back to width, and assert relative width error `<1e-6`. Assert increasing width lowers impedance for the accepted domain, impossible targets return `no_bracket`, invalid geometry fails before iteration, and solver failure contains no previous width/result.

- [ ] **Step 2: Run solver tests and verify failure**

Run: `npm test -- lib/engineering/transmission-line-solver.test.ts`
Expected: FAIL because the solver does not exist.

- [ ] **Step 3: Implement discriminated dispatch and bounded width synthesis**

Use `solveBisection`; never duplicate forward formulas inside the solver. Return the forward calculation at the solved width so UI cannot display a width and result from different evaluations.

- [ ] **Step 4: Write failing application and diagram tests**

Assert each geometry diagram labels W/t/h and CPWG gap; switching mm/mil/µm preserves SI values; forward mode displays impedance, effective permittivity, velocity, wavelength, delay, and electrical angle; target mode finds approximately the original width; model-range warnings remain visible; invalid input preserves the last valid result but clears any stale solved width; query reload restores equivalent geometry.

- [ ] **Step 5: Implement the localized application and geometry diagrams**

Use a discriminated form state so hidden inputs from another geometry are excluded from calculation and URL state. Share links store canonical SI values plus display-unit preference.

- [ ] **Step 6: Run model, solver, and application tests**

Run: `npm test -- lib/engineering/transmission-line.*.test.ts components/engineering/TransmissionLineApp.test.tsx components/engineering/transmission-line`
Expected: PASS.

- [ ] **Step 7: Commit the Transmission Line application**

```bash
git add lib/engineering/transmission-line-solver.ts lib/engineering/transmission-line-solver.test.ts components/engineering/TransmissionLineApp.tsx components/engineering/TransmissionLineApp.test.tsx components/engineering/transmission-line lib/engineering/tool-registry.ts components/engineering/ToolAppRenderer.tsx
git commit -m "feat: add transmission line calculator app"
```

### Task 6: Three-language Transmission Line content and complete first-version review build

**Files:**
- Modify: `locales/zh-TW.json`
- Modify: `locales/zh-CN.json`
- Modify: `locales/en.json`
- Create: `content/tools/transmission-line.md`
- Create: `content/tools/zh-cn/transmission-line.md`
- Create: `content/tools/en/transmission-line.md`
- Modify: `lib/engineering/tool-registry.ts`
- Modify: `lib/search.test.ts`
- Modify: `lib/seo.test.ts`
- Modify: `app/seo.test.tsx`
- Modify: `e2e/engineering-calculators.spec.ts`
- Create: `docs/engineering-tools-v1-verification.md`

**Interfaces:**
- Consumes: all three first-version plans.
- Produces: complete three-language Transmission Line UI/content, one original and two `reviewed` translations, and the first-version verification record.

- [ ] **Step 1: Write failing dictionary, content, search, SEO, and sitemap tests**

Assert dictionary parity, Preview visibility for all five tools in all three locales, production visibility only for published translations, search items pointing to localized introduction pages, application canonical/alternates, localized install URLs, and sitemap application entries derived from actual content visibility.

- [ ] **Step 2: Add three-language Transmission Line copy and content**

Explain the three geometries, every input, formula/version source, reference examples, forward/reverse behavior, model ranges, omitted physical effects, privacy, and the requirement to confirm final geometry with a board house or field solver. Keep translations `reviewed`.

- [ ] **Step 3: Complete first-version Playwright coverage**

Test all five tool entries and apps in zh-TW/zh-CN/en Preview visibility; run one forward and reverse case for every transmission model; verify unit-switch invariance, warnings, query reload, keyboard/mobile layout, no numeric analytics payloads, and genuine 404 for unavailable production translations.

- [ ] **Step 4: Create the verification record**

Record commit, tested Node/npm versions, formula references, focused commands, full commands, pass counts, production page count, Preview limitations, known model limitations, and the explicit statement that translations remain reviewed and production deployment is not authorized.

- [ ] **Step 5: Run all engineering-focused tests**

Run: `npm test -- lib/engineering components/engineering lib/tools.test.ts lib/i18n/dictionaries.test.ts lib/search.test.ts lib/seo.test.ts app/seo.test.tsx`
Expected: PASS.

Run: `npx playwright test e2e/engineering-calculators.spec.ts`
Expected: PASS.

- [ ] **Step 6: Run the full release-candidate verification**

Run: `npm run verify`
Expected: PASS with zero lint warnings, zero TypeScript errors, all Vitest and legacy-news tests passing, and a successful production build.

Run: `npm run test:e2e`
Expected: PASS for all existing and new Playwright projects.

- [ ] **Step 7: Perform manual Preview checks**

Verify desktop/mobile layout, light/dark contrast, keyboard operation, three-language copy, SVG/PNG output, formula/source visibility, Share URL restore, and that DevTools Network contains no calculation payload. Add the results to `docs/engineering-tools-v1-verification.md`.

- [ ] **Step 8: Commit the reviewed first-version candidate**

```bash
git add locales content/tools lib/engineering/tool-registry.ts lib/search.test.ts lib/seo.test.ts app/seo.test.tsx e2e/engineering-calculators.spec.ts docs/engineering-tools-v1-verification.md
git commit -m "feat: complete engineering RF tools preview"
```

- [ ] **Step 9: Stop at the publication gate**

Present the Preview URL, verification document, change summary, formula/model limitations, and remaining reviewed translations to the owner. Do not change `translationStatus` to `published`, merge, push to production, or deploy without a new explicit authorization.

