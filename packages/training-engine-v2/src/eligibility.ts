import type { AssessmentState } from "./domain/assessment";
import {
  evaluateEquipmentRequirement,
  type EquipmentCapabilities,
} from "./domain/equipment";
import type { ExerciseDefinition } from "./domain/exercise";
import type { PainAndInjuryState } from "./domain/painInjury";
import type { TrainingRole } from "./domain/session";
import type { ReasonCode, ReasonSource } from "./reasonCodes";

export type RejectionReasonCode = Extract<
  ReasonCode,
  | "EQUIPMENT_UNAVAILABLE"
  | "SETUP_IMPOSSIBLE"
  | "PERSONAL_BLOCK"
  | "HARD_CONTRAINDICATION"
  | "CAPABILITY_MISSING"
  | "ROLE_MISMATCH"
  | "PAIN_REQUIRES_REVIEW"
>;

export interface RejectionReason {
  readonly code: RejectionReasonCode;
  readonly message: string;
  readonly source: ReasonSource;
  readonly evidence: readonly string[];
}

export interface CandidateEligibility {
  readonly exerciseId: string;
  readonly legal: boolean;
  readonly rejectionReasons: readonly RejectionReason[];
  readonly warnings: readonly RejectionReason[];
}

export interface HardEligibilityContext {
  readonly equipment: EquipmentCapabilities;
  readonly painAndInjury: PainAndInjuryState;
  readonly assessment: AssessmentState;
  readonly requestedRole?: TrainingRole;
  readonly satisfiedPrerequisiteIds: readonly string[];
}

export function evaluateHardEligibility(
  exercise: ExerciseDefinition,
  context: HardEligibilityContext,
): CandidateEligibility {
  const rejectionReasons: RejectionReason[] = [];
  const warnings: RejectionReason[] = [];

  for (const requirement of exercise.equipmentRequirements) {
    const result = evaluateEquipmentRequirement(context.equipment, requirement);
    if (!result.satisfied) {
      rejectionReasons.push({
        code: "EQUIPMENT_UNAVAILABLE",
        message: `${exercise.name} requires unavailable equipment: ${requirement.label}.`,
        source: "equipment",
        evidence: result.missingCapabilities,
      });
    }
  }

  if (context.requestedRole && !exercise.trainingRoles.includes(context.requestedRole)) {
    rejectionReasons.push({
      code: "ROLE_MISMATCH",
      message: `${exercise.name} is not defined for ${context.requestedRole}.`,
      source: "exercise_schema",
      evidence: [`roles: ${exercise.trainingRoles.join(", ")}`],
    });
  }

  const unsatisfiedPrerequisites = exercise.prerequisites.filter(
    (prerequisite) => !context.satisfiedPrerequisiteIds.includes(prerequisite.id),
  );
  for (const prerequisite of unsatisfiedPrerequisites) {
    rejectionReasons.push({
      code: "CAPABILITY_MISSING",
      message: prerequisite.description,
      source: prerequisite.type === "required_setup_skill" ? "setup" : "assessment",
      evidence: [prerequisite.id],
    });
  }

  for (const block of context.painAndInjury.personalExerciseBlocks) {
    const blocksExercise = block.exerciseIds?.includes(exercise.id) ?? false;
    const blocksFamily = block.exerciseFamilies?.includes(exercise.family) ?? false;
    if (blocksExercise || blocksFamily) {
      rejectionReasons.push({
        code: "PERSONAL_BLOCK",
        message: block.reason,
        source: "athlete_preference",
        evidence: [block.id],
      });
    }
  }

  for (const contraindication of context.painAndInjury.hardContraindications) {
    const blocksExercise = contraindication.exerciseIds?.includes(exercise.id) ?? false;
    const blocksStress = contraindication.stressTags?.some(
      (tag) =>
        exercise.loading.jointStressTags.includes(tag) ||
        exercise.contraindicatedStressTags.includes(tag),
    ) ?? false;
    if (blocksExercise || blocksStress) {
      rejectionReasons.push({
        code: "HARD_CONTRAINDICATION",
        message: contraindication.reason,
        source: "pain_injury",
        evidence: [contraindication.id],
      });
    }
  }

  for (const pain of context.painAndInjury.moderatePain) {
    const overlapsStress = pain.stressTags.some((tag) => exercise.cautionStressTags.includes(tag));
    if (overlapsStress) {
      warnings.push({
        code: "PAIN_REQUIRES_REVIEW",
        message: `Moderate pain requires prescription review: ${pain.description}`,
        source: "pain_injury",
        evidence: [pain.id],
      });
    }
  }

  return {
    exerciseId: exercise.id,
    legal: rejectionReasons.length === 0,
    rejectionReasons,
    warnings,
  };
}
