export const ENGINEERING_TOOL_SLUGS = [
  "engineering-converter",
  "passive-circuit-calculator",
  "rf-calculator",
] as const;

export type EngineeringToolSlug = (typeof ENGINEERING_TOOL_SLUGS)[number];

export interface EngineeringToolDefinition {
  slug: EngineeringToolSlug;
  logicalAppPath: `/tools/${EngineeringToolSlug}/app`;
  stateKeys: readonly string[];
}

const DEFINITIONS: Record<EngineeringToolSlug, EngineeringToolDefinition> = {
  "engineering-converter": {
    slug: "engineering-converter",
    logicalAppPath: "/tools/engineering-converter/app",
    stateKeys: ["from", "impedance", "mode", "to", "value"],
  },
  "passive-circuit-calculator": {
    slug: "passive-circuit-calculator",
    logicalAppPath: "/tools/passive-circuit-calculator/app",
    stateKeys: ["attenuation", "capacitance", "inductance", "load", "mode", "resistance", "series", "target", "topology", "vin", "z0"],
  },
  "rf-calculator": {
    slug: "rf-calculator",
    logicalAppPath: "/tools/rf-calculator/app",
    stateKeys: ["er", "frequency", "imaginary", "mode", "real", "velocityFactor", "z0"],
  },
};

export function isEngineeringToolSlug(slug: string): slug is EngineeringToolSlug {
  return (ENGINEERING_TOOL_SLUGS as readonly string[]).includes(slug);
}

export function getEngineeringToolDefinition(slug: string): EngineeringToolDefinition | undefined {
  return isEngineeringToolSlug(slug) ? DEFINITIONS[slug] : undefined;
}
