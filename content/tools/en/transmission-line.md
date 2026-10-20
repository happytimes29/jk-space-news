---
title: "PCB Transmission Line Impedance and Width Calculator"
slug: transmission-line
summary: "Analyze or synthesize Microstrip, symmetric Stripline, and grounded CPW with versioned quasi-static models."
status: experimental
privacy: Geometry and material values are calculated only in the browser and are not sent to a server.
inputTypes: [PCB geometry, Relative permittivity and frequency, Target impedance]
outputTypes: [Impedance and effective permittivity, Wavelength delay and angle, Synthesized width]
updatedAt: 2026-10-20
appUrl: /tools/transmission-line/app
localizedApp: true
locale: en
translationOf: transmission-line
translationStatus: reviewed
translatedAt: 2026-10-20
---

## Geometries and inputs

Microstrip uses trace width W, substrate height h, and copper thickness t. Symmetric Stripline uses W, the full reference-plane separation b, and t with a centered trace. Grounded CPW (CPWG) adds the gap s to each infinite lateral ground and assumes a continuous backside ground. Shared inputs are relative permittivity, frequency, and line length. Switching mm, mil, and µm preserves the physical SI geometry.

Forward mode reports characteristic impedance, effective permittivity, phase velocity, wavelength, delay per metre, and electrical angle. Target mode uses bounded bisection to synthesize width; an out-of-range target reports no solution instead of retaining a stale width.

The cross-section updates live with inputs and display units, labelling W, t, h/b, CPWG gap s, conductor, dielectric, ground, εr, Z₀, and electrical angle. If an input becomes invalid, the diagram says so and preserves the last valid physical dimensions. Switching among mm, mil, and µm then only reformats that same SI snapshot.

## Formula versions and examples

Microstrip uses Hammerstad–Jensen quasi-static equations with finite-thickness correction; centered Stripline uses Steer section 3.7.1 equations (3.42)–(3.44); CPWG uses Qucs Technical Guide equations (12.10)–(12.18) and excludes dispersion from (12.19) onward. With the default FR-4-like 4.3 and 1 GHz examples, the 3.0 mm / 1.6 mm Microstrip is near 50 Ω, the 0.75 mm / 1.6 mm Stripline is about 47 Ω, and the 3.0 mm trace with 0.2 mm CPWG gaps is about 34.5 Ω.

## Ranges, privacy, and limitations

These lossless quasi-static estimates exclude dispersion, roughness, conductor/dielectric loss, solder mask, trapezoidal etch, surface finish, glass weave, finite ground width, ground vias, bends, connectors, and discontinuities. A warning appears outside recommended ratios. Board-house materials, tolerance, and pressed thickness differ; confirm final geometry with the fabricator, a 2D/3D field solver, and measurement. Values stay in the browser. Updated 2026-10-20.
