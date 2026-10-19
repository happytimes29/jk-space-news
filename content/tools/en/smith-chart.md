---
title: "Single-frequency Smith Chart and L Match"
slug: smith-chart
summary: "Enter a complex impedance at one frequency, inspect Z, Y, Γ, and component paths, then synthesize an ideal L match."
status: experimental
privacy: All values and network steps are calculated in the browser and are not sent to a server.
inputTypes: [Single frequency, Complex load impedance, Reference impedance, Ideal RLC components]
outputTypes: [Smith paths, Z/Y/Γ and reflection metrics, L match and E24 values]
updatedAt: 2026-10-19
appUrl: /tools/smith-chart/app
localizedApp: true
locale: en
translationOf: smith-chart
translationStatus: reviewed
translatedAt: 2026-10-19
---

## Purpose, inputs, and chart conventions

Enter one frequency, reference impedance `Z0`, and load `Z=R+jX`. The tool maps `Γ=(Z-Z0)/(Z+Z0)` onto a Smith chart: the center is a match, the right edge is open, and the left edge is short. An admittance grid is also available. Readouts include Z, Y, Γ, S11, VSWR, return loss, and mismatch loss.

The default example is 1 GHz, a 50 Ω system, and a 25+j0 Ω load. Adding ideal series or shunt R, L, and C components keeps a path for every step; undo, redo, and the share URL retain the same physical network.

## L matching and preferred values

The L-match solver finds ideal low-pass and high-pass solutions at the selected frequency, then separately displays re-evaluated E24 values. Apply either result to inspect both component trajectories and the remaining mismatch.

## Assumptions, privacy, and limits

Version one accepts only a manually entered complex impedance at one frequency; it does not import S-parameters. The ideal lumped model excludes ESR, Q, self-resonance, package and trace parasitics, transmission-line effects, tolerance, and broadband optimization. Verify a final design with circuit/EM simulation and VNA measurements. Calculations and PNG export stay in the browser. Updated 2026-10-19.
