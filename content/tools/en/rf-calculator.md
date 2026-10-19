---
title: "RF Quick Calculator"
slug: rf-calculator
summary: "Calculate wavelength, delay, electrical length, and Z/Y/Γ/S11/VSWR metrics from complex impedance."
status: experimental
privacy: All values are calculated in the browser and are not sent to a server.
inputTypes: [Frequency and medium, Length/angle/delay, Z/Y/Γ, Reference impedance]
outputTypes: [Wavelength and angle, Z/Y/Γ, S11/VSWR/loss]
updatedAt: 2026-10-19
appUrl: /tools/rf-calculator/app
localizedApp: true
locale: en
translationOf: rf-calculator
translationStatus: reviewed
translatedAt: 2026-10-19
---

## Purpose, inputs, and outputs

Propagation mode converts among physical length, electrical angle, and delay at a frequency with either relative permittivity or velocity factor. RF mode accepts complex Z, Y, or Γ and displays Z, Y, Γ, normalized values, S11, VSWR, return loss, and mismatch loss.

## Example and formulas

At 1 GHz, `λ=c/f` is about 299.792 mm in free space and a quarter wave is about 74.9481 mm. For 50+j0 Ω at 50 Ω, `Γ=(Z-Z0)/(Z+Z0)=0` and VSWR=1. Ideal short (`Γ=-1`) and open (`Γ=+1`) are shown explicitly as infinite limits.

## Assumptions, privacy, and limits

The medium uses `v=c/√εr` or velocity factor, never both. Dispersion, loss, geometry, and calibration planes are excluded. Values stay in the browser; use EM simulation or VNA measurements for final verification. Updated 2026-10-19.
