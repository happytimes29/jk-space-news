# Engineering and RF Tools v1 — Preview verification

Date: 2026-10-19
Branch: `codex/engineering-rf-tools-v1`
Candidate base: `bfa05717` (final integration commit is recorded by Git history immediately after this document)
Runtime: Node `v26.8.2`, npm `11.19.1`

## Candidate scope

The reviewed Preview contains five browser-only engineering applications:

1. Engineering unit and RF power converter
2. Passive circuit calculator
3. RF quick calculator
4. Single-frequency Smith chart and ideal L matching
5. PCB transmission-line impedance and width calculator

Traditional Chinese originals are published content. Simplified Chinese and English additions remain `reviewed` and are visible only with `CONTENT_PREVIEW=1`. This candidate is not authorized for merge, production deployment, or promotion of translations to `published`.

## Formula and model references

- General RF: exact complex arithmetic, reflection coefficient, wavelength, and ideal lumped RLC equations documented in the source tests.
- Smith chart: `Γ=(Z-Z0)/(Z+Z0)`, single-frequency ideal series/shunt network paths, analytic L-match synthesis, and separately re-evaluated E24 component choices.
- Microstrip: Hammerstad–Jensen 1980 quasi-static equations with finite-thickness correction; no Kirschning–Jansen dispersion.
- Symmetric Stripline: Wheeler 1965 centered geometry and finite-thickness effective width.
- Grounded CPW: [Qucs Technical Guide equations (12.10)–(12.18)](https://qucs.sourceforge.net/tech/node86.html); no equation (12.19+) dispersion.
- Complete elliptic integrals: arithmetic–geometric mean using elliptic modulus `k`; width synthesis uses bounded bisection and returns `no_bracket` outside the interval.

Detailed definitions and omissions are in `docs/engineering/transmission-line-models.md`.

## Verification commands

Focused commands:

```text
npm test -- lib/engineering/numerics.test.ts
npm test -- lib/engineering/transmission-line*.test.ts components/engineering/TransmissionLineApp.test.tsx components/engineering/transmission-line
npm test -- lib/engineering components/engineering lib/tools.test.ts lib/i18n/dictionaries.test.ts lib/search.test.ts lib/seo.test.ts app/seo.test.tsx
CONTENT_PREVIEW=1 npx playwright test e2e/engineering-calculators.spec.ts
```

Release-candidate commands:

```text
npm run verify
npm run test:e2e
```

## Results

At the final integration checkpoint:

- Numeric primitives: 8 tests passed.
- Transmission-line forward models: 29 tests passed.
- Transmission-line solver and application focused suite: 45 tests passed.
- Smith integration checkpoint: 64 test files / 413 tests passed; production build succeeded.
- Smith-era full Playwright suite: 47/47 passed.
- Engineering-focused Vitest suite: 32 files / 245 tests passed.
- Full Vitest suite: 71 files / 467 tests passed.
- Transmission Line Preview Playwright: 12/12 passed, including forward/reverse and unit/query/locale scenarios.
- Full Playwright suite: 50/50 passed.
- Production build succeeded and static generation completed 45/45 pages.

## Preview surface checks

- Desktop and 320 px mobile layouts: covered by Playwright overflow checks.
- Keyboard operation: direct keyboard editing and select/button flows passed.
- Traditional Chinese, Simplified Chinese, and English copy: Preview routes returned 200 and localized headings.
- Light/dark contrast: uses existing design tokens; no fixed low-contrast foreground was introduced.
- Smith SVG/PNG: accessible SVG labels/table and browser PNG download passed.
- Geometry SVGs: W/t/h, plane separation b, and CPWG gap s labels passed accessible-role tests.
- Share URL restore: Smith ordered steps and canonical SI transmission geometry survived reload.
- Network privacy: browser tests observed no calculation XHR/fetch payload; analytics assertion rejects numeric Smith inputs.

## Known limitations

- Smith v1 accepts one manually entered complex impedance at one frequency; no Touchstone/S-parameter import, broadband optimization, parasitic/Q/ESR model, or tolerance analysis.
- Transmission-line results are lossless quasi-static estimates. They omit dispersion, roughness, conductor/dielectric loss, solder mask, etch trapezoid, surface finish, glass weave, finite lateral grounds, ground vias, bends, connectors, and discontinuities.
- Stripline is symmetric and centered only. CPWG assumes infinite lateral grounds and a continuous backside ground.
- Formula-range warnings are advisory; final geometry must be confirmed with the PCB fabricator, a 2D/3D field solver, and measurement.
- Translation review is incomplete by policy: `zh-CN` and `en` tool introductions remain `reviewed`, so production intentionally returns 404 for those unpublished detail/application routes.

## Publication gate

Do not change `translationStatus`, merge, push, deploy, or publish this candidate without a new explicit owner authorization.
