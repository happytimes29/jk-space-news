# Engineering and RF Tools v1 — Preview verification

Date: 2026-10-20
Branch: `codex/rf-visual-enhancements`
Candidate base: `4d976859` (the final verification commit is recorded by Git history immediately after this document)
Runtime: Node `v26.8.2`, npm `11.19.1`

## Candidate scope

The reviewed candidate contains five browser-only engineering applications. This increment adds accessible, live diagrams to the four RF/passive tools while preserving the existing formulas and query keys:

1. Engineering unit and RF power converter
2. Passive circuit calculator
3. RF quick calculator
4. Single-frequency Smith chart and ideal L matching
5. PCB transmission-line impedance and width calculator

Traditional Chinese originals are published content. Simplified Chinese and English additions remain `reviewed` and are visible only with `CONTENT_PREVIEW=1`. This candidate is not authorized for merge or production deployment before owner approval of the Vercel Preview.

## Formula and model references

- General RF: exact complex arithmetic, reflection coefficient, wavelength, and ideal lumped RLC equations documented in the source tests.
- Smith chart: `Γ=(Z-Z0)/(Z+Z0)`, single-frequency ideal series/shunt network paths, analytic L-match synthesis, and separately re-evaluated selectable E12/E24/E48/E96 component choices.
- Microstrip: Hammerstad–Jensen 1980 quasi-static equations with finite-thickness correction; no Kirschning–Jansen dispersion.
- Symmetric Stripline: Steer equations (3.42)–(3.44), centered geometry with finite-thickness effective width and edge fringing.
- Grounded CPW: [Qucs Technical Guide equations (12.10)–(12.18)](https://qucs.sourceforge.net/tech/node86.html); no equation (12.19+) dispersion.
- Complete elliptic integrals: arithmetic–geometric mean using elliptic modulus `k`; width synthesis uses bounded bisection and returns `no_bracket` outside the interval.

Detailed definitions and omissions are in `docs/engineering/transmission-line-models.md`.

## Verification commands

Focused commands:

```text
npm test -- lib/engineering/numerics.test.ts
npm test -- lib/engineering/transmission-line*.test.ts components/engineering/TransmissionLineApp.test.tsx components/engineering/transmission-line
npm test -- lib/engineering components/engineering lib/tools.test.ts lib/i18n/dictionaries.test.ts lib/search.test.ts lib/seo.test.ts app/seo.test.tsx
NEXT_PUBLIC_SITE_URL=https://jk-space.com npx playwright test e2e/engineering-calculators.spec.ts
CONTENT_PREVIEW=1 NEXT_PUBLIC_SITE_URL=https://jk-space.com npx playwright test e2e/engineering-calculators.spec.ts
```

Release-candidate commands:

```text
npm run verify
NEXT_PUBLIC_SITE_URL=https://jk-space.com npm run test:e2e
```

## Results

At the final integration checkpoint:

- Transmission-line geometry focused suite: 3 files / 20 tests passed.
- Full Vitest suite: 76 files / 529 tests passed.
- Engineering Playwright: 21 passed with one Preview-only check skipped in normal content mode, and 22/22 passed with `CONTENT_PREVIEW=1` for all three locales.
- Full Playwright suite: 59 passed with the one Preview-only localization check skipped.
- Production build succeeded and static generation completed 45/45 pages.
- `npm run verify` passed lint, TypeScript, Vitest, 15 legacy-news guards, and the production build.

## Preview surface checks

- 320, 768, and 1440 px layouts: all new RF diagrams remained visible with no document-level horizontal overflow.
- Light and dark color schemes: every affected calculator diagram remained visible using shared design tokens.
- Keyboard operation: direct keyboard editing, T/π radio-arrow selection, selects, and buttons passed.
- Traditional Chinese, Simplified Chinese, and English copy: Preview routes returned 200, localized headings, locale-preserving Smith links, and every SVG text label remained inside its diagram in light and dark schemes.
- Smith SVG/PNG: accessible SVG labels/table, browser PNG download, and a non-white pixel-content assertion passed.
- Attenuator SVG: direct π hydration, zero input/output power, per-resistor dissipation, and near-zero attenuation labels passed bounds checks.
- RF SVGs: length/angle/delay propagation, εeff conflicts and recovery, matched/short/open/Γ=j reflection states passed.
- Smith SVGs: the main chart shows labeled major scales, minor grid lines, visible numbered network paths, and both low-pass and high-pass matching solutions show ideal and E-series component values with simplified thumbnail grids.
- Geometry SVGs: Microstrip W/t/h, Stripline W/t/b, CPWG W/t/h/s, live units, Z₀, electrical angle, and invalid-input SI snapshot behavior passed.
- Share URL restore: Converter, passive, RF, Smith ordered steps, and canonical SI transmission geometry survived reload without hydration errors.
- Network privacy: browser tests observed no calculation XHR/fetch payload; analytics assertion rejects numeric Smith inputs.

## Known limitations

- Smith v1 accepts one manually entered complex impedance at one frequency; no Touchstone/S-parameter import, broadband optimization, parasitic/Q/ESR model, or tolerance analysis.
- Transmission-line results are lossless quasi-static estimates. They omit dispersion, roughness, conductor/dielectric loss, solder mask, etch trapezoid, surface finish, glass weave, finite lateral grounds, ground vias, bends, connectors, and discontinuities.
- Stripline is symmetric and centered only. CPWG assumes infinite lateral grounds and a continuous backside ground.
- Attenuator resistor power is an ideal steady-state estimate and excludes temperature rise, pulse rating, and derating.
- RF propagation εeff is an effective modal value, not unadjusted material Dk. Dispersion and loss remain outside the quick model.
- Formula-range warnings are advisory; final geometry must be confirmed with the PCB fabricator, a 2D/3D field solver, and measurement.
- Translation review is incomplete by policy: `zh-CN` and `en` tool introductions remain `reviewed`, so production intentionally returns 404 for those unpublished detail/application routes.

## Publication gate

The branch may be pushed and opened as a PR to obtain a Vercel Preview. Do not change `translationStatus`, merge, deploy to production, or publish this candidate without explicit owner approval after Preview inspection.
