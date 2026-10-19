---
title: "Passive Circuit Calculator"
slug: passive-circuit-calculator
summary: "Calculate dividers, RC/LC/RLC networks, reactance, and symmetric T or pi attenuators."
status: experimental
privacy: All values are calculated in the browser and are not sent to a server.
inputTypes: [R/L/C, Voltage and frequency, E-series and load]
outputTypes: [Preferred values, Cutoff and resonance, Attenuator values]
updatedAt: 2026-10-19
appUrl: /tools/passive-circuit-calculator/app
localizedApp: true
locale: en
translationOf: passive-circuit-calculator
translationStatus: reviewed
translatedAt: 2026-10-19
---

## Purpose, inputs, and outputs

The divider ranks E12/E24/E48/E96 pairs from Vin, target Vout, and an optional load. Other modes calculate RC time constant and cutoff, LC/RLC resonance, Q, bandwidth, Xc, Xl, and symmetric T/pi attenuators.

## Example and formulas

The 3.3 V to 1.8 V example ranks actual loaded output error. With 1 kΩ and 100 nF, `fc=1/(2πRC)` is about 1.59155 kHz. With 10 nH and 1 pF, `f0=1/(2π√LC)` is about 1.59155 GHz.

## Assumptions, privacy, and limits

These are ideal lumped-element formulas. ESR, ESL, SRF, parasitics, power ratings, and layout are excluded. Values stay in the browser; validate critical designs with SPICE, datasheets, and measurements. Updated 2026-10-19.
