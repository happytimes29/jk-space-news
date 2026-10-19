# Transmission-line model references

These browser calculators are lossless, quasi-static engineering estimates. Inputs are converted to SI before model evaluation.

## Microstrip — Hammerstad–Jensen

The implementation follows the normalized-width, effective-permittivity, air-line impedance, and finite-conductor-thickness equations in E. Hammerstad and Ø. Jensen, “Accurate Models for Microstrip Computer-Aided Design,” 1980, as reproduced in the Qucs Technical Papers, Chapter 11. Variables are `u=w/h`, normalized copper thickness `t=t/h`, air correction `Δu1`, and dielectric correction `Δur`.

The model deliberately excludes Kirschning–Jansen dispersion, conductor and dielectric loss, copper roughness, solder mask, surface finish, trapezoidal etch, discontinuities, and radiation. A `model_range` warning is returned outside `0.01 ≤ w/h ≤ 100`; final stackups should be checked with the board house and a field solver.

## Symmetric Stripline — Steer finite-thickness closed form

The centered-trace model uses equations (3.42)–(3.44) in Michael Steer's *Microwave and RF Design II — Transmission Lines*, section 3.7.1. They combine normalized finite-thickness effective width and edge-fringing capacitance. The public plane separation `b` is the full distance between two parallel ground planes, so effective permittivity is exactly the substrate relative permittivity in this homogeneous, lossless model. Only centered, symmetric geometry is represented.

Source: [Steer, “Stripline,” equations (3.42)–(3.44)](https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/Microwave_and_RF_Design_II_-_Transmission_Lines_%28Steer%29/03%3A_Planar_Transmission_Lines/3.07%3A_Stripline). The implementation warns unless `w/(b-t) > 0.05` and `t/b < 0.025`, the published accuracy range. It does not support offset Stripline, unequal dielectrics, side grounds, copper roughness, dielectric/conductor loss, or fabrication etch geometry.

The earlier design draft attributed this centered shielded-Stripline model to Wheeler's 1965 paper about strips separated by a dielectric sheet. Independent review found that attribution did not match this geometry, so the implementation and public copy now use the directly verifiable Steer equations instead.

## Grounded CPW — Qucs equations 12.10–12.18

Grounded coplanar waveguide uses the Qucs Technical Guide, Chapter 12 equations (12.10)–(12.13) for a finite-height substrate with a continuous backside ground. Complete elliptic integrals are evaluated by AGM using modulus `k`, including `k1=W/(W+2s)` and the hyperbolic-tangent backside modulus `k3`. Nonzero copper uses effective gap/width equations (12.14)–(12.17) for the impedance ratio. Equation (12.18) is then applied to the preserved zero-thickness effective permittivity from equations (12.10)–(12.12), matching the documented Qucs computation sequence.

Source: [Qucs Technical Guide — Coplanar waveguides](https://qucs.sourceforge.net/tech/node86.html). The implementation intentionally stops before dispersion equation (12.19). It assumes infinite lateral top grounds and continuous backside ground, and omits finite ground width, loss, roughness, solder mask, etch shape, vias, and transitions. Thickness must leave a positive effective gap.
