import type { AssessmentState } from "./domain/assessment";
import type { EquipmentCapabilities } from "./domain/equipment";
import type { ExerciseDefinition } from "./domain/exercise";
import type { PainAndInjuryState } from "./domain/painInjury";
import type { MovementRole, MuscleGroup } from "./domain/primitives";
import type { SessionSection, TrainingRole } from "./domain/session";
import type { ReasonCode, ReasonSource } from "./reasonCodes";
import { evaluateHardEligibilityComponents } from "./candidate/eligibility";
import type {
  CandidatePainMatchTrace,
  PainEligibilityEvidenceTrace,
} from "./candidate/pain";

export type RejectionReasonCode = Extract<
  ReasonCode,
  | "EQUIPMENT_UNAVAILABLE"
  | "SETUP_IMPOSSIBLE"
  | "PERSONAL_BLOCK"
  | "HARD_CONTRAINDICATION"
  | "CAPABILITY_MISSING"
  | "ROLE_MISMATCH"
  | "TRAINING_NEED_MISMATCH"
  | "SECTION_MISMATCH"
  | "MOVEMENT_ROLE_MISMATCH"
  | "TARGET_MUSCLE_MISMATCH"
  | "PAIN_REQUIRES_REVIEW"
>;

export interface RejectionReason {
  readonly code: RejectionReasonCode;
  readonly message: string;
  readonly source: ReasonSource;
  readonly evidence: readonly string[];
  readonly painEvidence?: PainEligibilityEvidenceTrace;
}

export interface CandidateEligibility {
  readonly exerciseId: string;
  readonly legal: boolean;
  readonly rejectionReasons: readonly RejectionReason[];
  readonly warnings: readonly RejectionReason[];
  readonly painMatchTrace: CandidatePainMatchTrace;
}

export interface HardEligibilityContext {
  readonly equipment: EquipmentCapabilities;
  readonly painAndInjury: PainAndInjuryState;
  readonly assessment: AssessmentState;
  readonly requestedRole?: TrainingRole;
  readonly requestedSection?: SessionSection;
  readonly targetMovementRoles?: readonly MovementRole[];
  readonly targetMuscles?: readonly MuscleGroup[];
  readonly satisfiedPrerequisiteIds: readonly string[];
  readonly painMatchTrace?: CandidatePainMatchTrace;
}

export function evaluateHardEligibility(
  exercise: ExerciseDefinition,
  context: HardEligibilityContext,
): CandidateEligibility {
  return evaluateHardEligibilityComponents(exercise, context);
}
