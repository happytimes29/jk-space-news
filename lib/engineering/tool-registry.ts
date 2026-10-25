export const ENGINEERING_TOOL_SLUGS = [
  "datasheet-workbench",
  "engineering-converter",
  "passive-circuit-calculator",
  "rf-calculator",
  "smith-chart",
  "transmission-line",
] as const;

export type EngineeringToolSlug = (typeof ENGINEERING_TOOL_SLUGS)[number];

export interface EngineeringToolDefinition {
  slug: EngineeringToolSlug;
  logicalAppPath: `/tools/${EngineeringToolSlug}/app`;
  stateKeys: readonly string[];
}

const DEFINITIONS: Record<EngineeringToolSlug, EngineeringToolDefinition> = {
  "datasheet-workbench": {
    slug: "datasheet-workbench",
    logicalAppPath: "/tools/datasheet-workbench/app",
    stateKeys: [],
  },
  "engineering-converter": {
    slug: "engineering-converter",
    logicalAppPath: "/tools/engineering-converter/app",
    stateKeys: ["from", "impedance", "mode", "to", "value"],
  },
  "passive-circuit-calculator": {
    slug: "passive-circuit-calculator",
    logicalAppPath: "/tools/passive-circuit-calculator/app",
    stateKeys: ["attenuation", "c", "circuit", "f", "l", "load", "mode", "r", "series", "target", "topology", "vin", "z0"],
  },
  "rf-calculator": {
    slug: "rf-calculator",
    logicalAppPath: "/tools/rf-calculator/app",
    stateKeys: ["er", "frequency", "imaginary", "mode", "real", "velocityFactor", "z0"],
  },
  "smith-chart": {
    slug: "smith-chart",
    logicalAppPath: "/tools/smith-chart/app",
    stateKeys: ["frequency", "mode", "r", "reference", ...Array.from({ length: 20 }, (_, index) => `step${index}`), "x"],
  },
  "transmission-line": {
    slug: "transmission-line",
    logicalAppPath: "/tools/transmission-line/app",
    stateKeys: ["er", "frequency", "gapM", "heightM", "kind", "lengthM", "mode", "target", "thicknessM", "unit", "widthM"],
  },
};

export function isEngineeringToolSlug(slug: string): slug is EngineeringToolSlug {
  return (ENGINEERING_TOOL_SLUGS as readonly string[]).includes(slug);
}

export function getEngineeringToolDefinition(slug: string): EngineeringToolDefinition | undefined {
  return isEngineeringToolSlug(slug) ? DEFINITIONS[slug] : undefined;
}
