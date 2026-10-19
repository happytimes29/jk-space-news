import { complexAdd, complexReciprocal, type Complex } from "./complex";
import { smithPoint, type SmithPoint } from "./smith";
import { failure, success, type EngineeringResult } from "./types";

export interface NetworkStep {
  id: string;
  connection: "series" | "shunt";
  component: "R" | "L" | "C";
  value: number;
}

function validateFrequency(frequencyHz: number): EngineeringResult<true> {
  if (!Number.isFinite(frequencyHz)) return failure("non_finite", "frequencyHz");
  return frequencyHz > 0 ? success(true) : failure("non_positive", "frequencyHz");
}

function validateLoad(load: Complex): EngineeringResult<true> {
  if (!Number.isFinite(load.re) || !Number.isFinite(load.im)) return failure("non_finite", "load");
  return load.re >= 0 ? success(true) : failure("out_of_range", "load");
}

export function componentImpedance(step: NetworkStep, frequencyHz: number): EngineeringResult<Complex> {
  const frequency = validateFrequency(frequencyHz);
  if (!frequency.ok) return frequency;
  if (!step || !["series", "shunt"].includes(step.connection) || !["R", "L", "C"].includes(step.component)) return failure("invalid_state", "step");
  if (!Number.isFinite(step.value)) return failure("non_finite", "value");
  if (step.value <= 0) return failure("non_positive", "value");
  const omega = 2 * Math.PI * frequencyHz;
  if (step.component === "R") return success({ re: step.value, im: 0 });
  if (step.component === "L") return success({ re: 0, im: omega * step.value });
  return success({ re: 0, im: -1 / (omega * step.value) });
}

export function applyNetworkStep(load: Complex, step: NetworkStep, frequencyHz: number): EngineeringResult<Complex> {
  const validLoad = validateLoad(load);
  if (!validLoad.ok) return validLoad;
  const component = componentImpedance(step, frequencyHz);
  if (!component.ok) return component;
  if (step.connection === "series") return success(complexAdd(load, component.value));
  if (load.re === 0 && load.im === 0) return success({ re: 0, im: 0 });

  const loadAdmittance = complexReciprocal(load);
  const componentAdmittance = complexReciprocal(component.value);
  if (!loadAdmittance.ok) return loadAdmittance;
  if (!componentAdmittance.ok) return componentAdmittance;
  return complexReciprocal(complexAdd(loadAdmittance.value, componentAdmittance.value));
}

export function applyNetwork(load: Complex, steps: readonly NetworkStep[], frequencyHz: number): EngineeringResult<Complex> {
  let current = load;
  const validLoad = validateLoad(load);
  if (!validLoad.ok) return validLoad;
  for (const step of steps) {
    const next = applyNetworkStep(current, step, frequencyHz);
    if (!next.ok) return next;
    current = next.value;
  }
  return success(current);
}

export function sampleNetworkStep(
  load: Complex,
  step: NetworkStep,
  frequencyHz: number,
  referenceOhms: number,
  sampleCount = 48,
): EngineeringResult<SmithPoint[]> {
  const validLoad = validateLoad(load);
  if (!validLoad.ok) return validLoad;
  const validComponent = componentImpedance(step, frequencyHz);
  if (!validComponent.ok) return validComponent;
  if (!Number.isInteger(sampleCount) || sampleCount < 2) return failure("out_of_range", "sampleCount");

  const points: SmithPoint[] = [];
  for (let index = 0; index < sampleCount; index += 1) {
    const fraction = index / (sampleCount - 1);
    let value: Complex;
    if (fraction === 0) {
      value = load;
    } else if (step.connection === "series") {
      value = complexAdd(load, {
        re: validComponent.value.re * fraction,
        im: validComponent.value.im * fraction,
      });
    } else if (load.re === 0 && load.im === 0) {
      value = load;
    } else {
      const loadAdmittance = complexReciprocal(load);
      const componentAdmittance = complexReciprocal(validComponent.value);
      if (!loadAdmittance.ok) return loadAdmittance;
      if (!componentAdmittance.ok) return componentAdmittance;
      const impedance = complexReciprocal(complexAdd(loadAdmittance.value, {
        re: componentAdmittance.value.re * fraction,
        im: componentAdmittance.value.im * fraction,
      }));
      if (!impedance.ok) return impedance;
      value = impedance.value;
    }
    const point = smithPoint(value, referenceOhms);
    if (!point.ok) return point;
    points.push(point.value);
  }
  return success(points);
}
