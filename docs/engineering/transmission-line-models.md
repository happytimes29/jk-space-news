# Transmission-line model references

These browser calculators are lossless, quasi-static engineering estimates. Inputs are converted to SI before model evaluation.

## Microstrip — Hammerstad–Jensen

The implementation follows the normalized-width, effective-permittivity, air-line impedance, and finite-conductor-thickness equations in E. Hammerstad and Ø. Jensen, “Accurate Models for Microstrip Computer-Aided Design,” 1980, as reproduced in the Qucs Technical Papers, Chapter 11. Variables are `u=w/h`, normalized copper thickness `t=t/h`, air correction `Δu1`, and dielectric correction `Δur`.

The model deliberately excludes Kirschning–Jansen dispersion, conductor and dielectric loss, copper roughness, solder mask, surface finish, trapezoidal etch, discontinuities, and radiation. A `model_range` warning is returned outside `0.01 ≤ w/h ≤ 100`; final stackups should be checked with the board house and a field solver.
