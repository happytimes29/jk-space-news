---
title: "Engineering Unit and RF Power Converter"
slug: engineering-converter
summary: "Convert common electronics units, engineering notation, and RF power, voltage, and current at a specified impedance."
status: experimental
privacy: All values are calculated in the browser and are not sent to a server.
inputTypes: [Engineering notation, SI units, RF power]
outputTypes: [Unit conversion, dBm/dBW, RF voltage and current]
updatedAt: 2026-10-19
appUrl: /tools/engineering-converter/app
localizedApp: true
locale: en
translationOf: engineering-converter
translationStatus: reviewed
translatedAt: 2026-10-19
---

## Purpose, inputs, and outputs

Convert voltage, current, resistance, capacitance, inductance, frequency, time, power, and length. Inputs include `4k7`, `2R2`, `100n`, decimal, and scientific notation. RF mode converts dBm, dBW, W, mW, Vrms, Vpeak, Vpp, and Irms at 50 Ω, 75 Ω, or a positive custom impedance.

## Example and formulas

`4k7 Ω` becomes `4.7 kΩ` while the canonical value remains 4700 Ω. `0 dBm / 50 Ω` is 1 mW and about 223.607 mVrms. The model uses `P(W)=10^((dBm-30)/10)` and `Vrms=√(PR)`.

## Assumptions, privacy, and limits

The RF calculation assumes a resistive load and sinusoidal steady state. It excludes impedance phase, bandwidth, distortion, and measurement error. Values stay in this browser. Verify ratings and critical results with datasheets and instruments. Updated 2026-10-19.
