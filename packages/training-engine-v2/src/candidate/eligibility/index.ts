import type { ExerciseDefinition } from "../../domain/exercise";
import type { CandidateEligibility, HardEligibilityContext } from "../../eligibility";
import { capabilityEligibility } from "./capabilityEligibility";
import { contraindicationEligibility } from "./contraindicationEligibility";
import { equipmentEligibility } from "./equipmentEligibility";
import { painReviewEligibility } from "./painReviewEligibility";
import { personalBlockEligibility } from "./personalBlockEligibility";
import { roleEligibility } from "./roleEligibility";
import { setupEligibility } from "./setupEligibility";
import { buildCandidatePainMatchTrace } from "../pain";
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
  const painMatchTrace = context.painMatchTrace ?? buildCandidatePainMatchTrace({
    exercise,
    painAndInjury: context.painAndInjury,
    requestedRole: context.requestedRole,
  });
  const resolvedContext: HardEligibilityContext = {
    ...context,
    painMatchTrace,
  };

  return combineEligibilityComponentResults({
    exerciseId: exercise.id,
    results: components.map((component) => component.evaluate(exercise, resolvedContext)),
    painMatchTrace,
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
