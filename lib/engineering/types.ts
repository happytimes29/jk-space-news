export type EngineeringErrorCode =
  | "invalid_number"
  | "non_finite"
  | "non_positive"
  | "division_by_zero"
  | "out_of_range"
  | "conflicting_inputs"
  | "no_solution"
  | "already_matched"
  | "no_convergence"
  | "no_bracket"
  | "unsupported_geometry"
  | "invalid_state";

export interface EngineeringWarning {
  code: string;
  field?: string;
  details?: Record<string, number | string | boolean>;
}

export interface EngineeringError {
  code: EngineeringErrorCode;
  field?: string;
}

export type EngineeringResult<T> =
  | { ok: true; value: T; warnings: EngineeringWarning[] }
  | { ok: false; error: EngineeringError; warnings?: EngineeringWarning[] };

export function success<T>(value: T, warnings: EngineeringWarning[] = []): EngineeringResult<T> {
  return { ok: true, value, warnings };
}

export function failure(code: EngineeringErrorCode, field?: string): EngineeringResult<never> {
  return { ok: false, error: { code, ...(field ? { field } : {}) } };
}
