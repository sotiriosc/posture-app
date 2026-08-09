export const REASON_CODES = [
  "EQUIPMENT_UNAVAILABLE",
  "SETUP_IMPOSSIBLE",
  "PERSONAL_BLOCK",
  "HARD_CONTRAINDICATION",
  "CAPABILITY_MISSING",
  "ROLE_MISMATCH",
  "PAIN_REQUIRES_REVIEW",
  "ASSESSMENT_PRIORITY_SUPPORTED",
  "ASSESSMENT_PRIORITY_CONFLICT",
  "ALIGNMENT_PRIORITY_SUPPORTED",
  "ALIGNMENT_PRIORITY_CONFLICT",
  "CONTINUITY_FAVORED",
  "PROGRESSION_AVAILABLE",
  "REPLACEMENT_JUSTIFIED",
  "PIPELINE_STAGE_RECORDED",
] as const;

export type ReasonCode = (typeof REASON_CODES)[number];

export type ReasonSource =
  | "equipment"
  | "setup"
  | "athlete_preference"
  | "pain_injury"
  | "exercise_schema"
  | "assessment"
  | "alignment"
  | "phase"
  | "history"
  | "optimizer"
  | "prescription"
  | "progression"
  | "validation";

export interface DecisionReason {
  readonly code: ReasonCode;
  readonly source: ReasonSource;
  readonly message: string;
  readonly evidence: readonly string[];
}

export function isReasonCode(value: string): value is ReasonCode {
  return REASON_CODES.includes(value as ReasonCode);
}
