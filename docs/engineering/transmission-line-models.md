# Transmission-line model references

These browser calculators are lossless, quasi-static engineering estimates. Inputs are converted to SI before model evaluation.

## Microstrip — Hammerstad–Jensen

The implementation follows the normalized-width, effective-permittivity, air-line impedance, and finite-conductor-thickness equations in E. Hammerstad and Ø. Jensen, “Accurate Models for Microstrip Computer-Aided Design,” 1980, as reproduced in the Qucs Technical Papers, Chapter 11. Variables are `u=w/h`, normalized copper thickness `t=t/h`, air correction `Δu1`, and dielectric correction `Δur`.

The model deliberately excludes Kirschning–Jansen dispersion, conductor and dielectric loss, copper roughness, solder mask, surface finish, trapezoidal etch, discontinuities, and radiation. A `model_range` warning is returned outside `0.01 ≤ w/h ≤ 100`; final stackups should be checked with the board house and a field solver.

## Symmetric Stripline — Wheeler 1965

The centered-trace model uses H. A. Wheeler's 1965 symmetric Stripline impedance expression with the finite-thickness effective-width correction. The public plane separation `b` is the full distance between two parallel ground planes, so effective permittivity is exactly the substrate relative permittivity in this homogeneous, lossless model. Only centered, symmetric geometry is represented.

The implementation warns outside `0.1 ≤ w/b ≤ 2`. It does not support offset Stripline, unequal dielectrics, side grounds, copper roughness, dielectric/conductor loss, or fabrication etch geometry.
