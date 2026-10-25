export type ComponentKind = "mlcc" | "shielded-power-inductor";

export type SpecificationStatus = "extracted" | "missing" | "ambiguous" | "conflicting";
export type SpecificationCategory = "identity" | "absolute-maximum" | "operating" | "typical" | "package";

export interface SourceEvidence {
  documentId: string;
  page: number;
  section?: string;
  table?: string;
  quote: string;
  chunkHash: string;
}

export interface NormalizedQuantity {
  min?: number;
  typical?: number;
  max?: number;
  unit: string;
}

export interface SpecificationValue {
  field: string;
  rawValue: string;
  normalized?: NormalizedQuantity;
  category?: SpecificationCategory;
  conditions: string[];
  evidence: SourceEvidence[];
  status: SpecificationStatus;
  manualReview?: boolean;
}

export interface DocumentIdentity {
  documentId: string;
  fileName: string;
  sha256: string;
  title?: string;
  revision?: string;
  publishedAt?: string;
}

export interface PartRecord {
  manufacturer: string;
  family?: string;
  orderingCode?: string;
  specifications: SpecificationValue[];
}

export interface ExtractionEnvelope {
  version: 1;
  document: DocumentIdentity;
  componentKind: ComponentKind;
  selectedOrderingCode?: string;
  part: PartRecord;
  missingFields: string[];
}

export type RequirementPriority = "mandatory" | "preference";

export interface WorkRequirement {
  field: string;
  rawValue: string;
  normalized?: NormalizedQuantity;
  priority: RequirementPriority;
}

export interface WorkConditions {
  componentKind: ComponentKind;
  requirements: WorkRequirement[];
  pcbChangeAllowed: false;
}

export type ReplacementVerdict =
  | "direct-replacement"
  | "conditional"
  | "not-recommended"
  | "insufficient-evidence";

export interface ComparisonRow {
  field: string;
  status: "pass" | "soft-difference" | "fail" | "insufficient-evidence";
  reasonCode: string;
  original?: SpecificationValue;
  candidate?: SpecificationValue;
  requirement?: WorkRequirement;
}

export interface ReplacementReport {
  verdict: ReplacementVerdict;
  reasonCodes: string[];
  comparisons: ComparisonRow[];
}

export interface ValidationIssue {
  path: string;
  code: string;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: ValidationIssue[] };

