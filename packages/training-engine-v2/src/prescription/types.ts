export type PrescriptionId = string;
export type PerformanceRecordId = string;
export type SourceExposureEventId = string;
export type ExerciseId = string;
export type ISODateTimeString = string;

export type PrescriptionEvidenceSource =
  | "prescription_contract"
  | "exercise_definition"
  | "assessment_priority"
  | "pain_response_requirement"
  | "coach_review"
  | "athlete_report"
  | "sensor"
  | "future_vision_adapter"
  | "policy"
  | "synthetic_contract_fixture"
  | "unknown";

export interface EvidenceProvenance {
  readonly source: PrescriptionEvidenceSource;
  readonly sourceRef: string;
  readonly notes?: string;
}

export type PrescriptionSide = "left" | "right";

export type PrescriptionLaterality =
  | { readonly kind: "bilateral" }
  | { readonly kind: "single_side"; readonly side: PrescriptionSide }
  | { readonly kind: "each_side" }
  | {
      readonly kind: "alternating";
      readonly startingSide?: PrescriptionSide;
    };

export type SideRelationship =
  | "same_side"
  | "opposite_side"
  | "independent"
  | "not_applicable"
  | "unknown";

export interface PrescriptionSideBehavior {
  readonly movementSide?: PrescriptionLaterality;
  readonly loadSide?: PrescriptionSide;
  readonly supportSide?: PrescriptionSide;
  readonly startingSide?: PrescriptionSide;
  readonly sideRelationship?: SideRelationship;
  readonly alternates?: boolean;
}

export interface PrescriptionValidationFinding {
  readonly severity: "info" | "warning" | "error";
  readonly code: string;
  readonly message: string;
  readonly targetId?: string;
}

export function prescriptionFinding(
  severity: PrescriptionValidationFinding["severity"],
  code: string,
  message: string,
  targetId?: string,
): PrescriptionValidationFinding {
  return { severity, code, message, targetId };
}
