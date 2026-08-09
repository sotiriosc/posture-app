import type { ExerciseDefinition } from "../../domain/exercise";
import type { CandidateEligibility, HardEligibilityContext } from "../../eligibility";
import { capabilityEligibility } from "./capabilityEligibility";
import { contraindicationEligibility } from "./contraindicationEligibility";
import { equipmentEligibility } from "./equipmentEligibility";
import { painReviewEligibility } from "./painReviewEligibility";
import { personalBlockEligibility } from "./personalBlockEligibility";
import { roleEligibility } from "./roleEligibility";
import { setupEligibility } from "./setupEligibility";
import {
  combineEligibilityComponentResults,
  type HardEligibilityComponent,
} from "./types";

export const HARD_ELIGIBILITY_COMPONENTS: readonly HardEligibilityComponent[] = [
  equipmentEligibility,
  setupEligibility,
  personalBlockEligibility,
  contraindicationEligibility,
  capabilityEligibility,
  roleEligibility,
  painReviewEligibility,
];

export function evaluateHardEligibilityComponents(
  exercise: ExerciseDefinition,
  context: HardEligibilityContext,
  components: readonly HardEligibilityComponent[] = HARD_ELIGIBILITY_COMPONENTS,
): CandidateEligibility {
  return combineEligibilityComponentResults({
    exerciseId: exercise.id,
    results: components.map((component) => component.evaluate(exercise, context)),
  });
}

export * from "./capabilityEligibility";
export * from "./contraindicationEligibility";
export * from "./equipmentEligibility";
export * from "./painReviewEligibility";
export * from "./personalBlockEligibility";
export * from "./roleEligibility";
export * from "./setupEligibility";
export * from "./types";
