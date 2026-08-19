import type { ExerciseDefinition } from "../../domain/exercise";
import type { CandidateEligibility, HardEligibilityContext, RejectionReason } from "../../eligibility";
import type { CandidatePainMatchTrace } from "../pain";

export interface EligibilityComponentResult {
  readonly rejectionReasons: readonly RejectionReason[];
  readonly warnings: readonly RejectionReason[];
}

export interface HardEligibilityComponent {
  readonly id: string;
  evaluate(exercise: ExerciseDefinition, context: HardEligibilityContext): EligibilityComponentResult;
}

export function emptyEligibilityComponentResult(): EligibilityComponentResult {
  return {
    rejectionReasons: [],
    warnings: [],
  };
}

export function combineEligibilityComponentResults(input: {
  readonly exerciseId: string;
  readonly results: readonly EligibilityComponentResult[];
  readonly painMatchTrace: CandidatePainMatchTrace;
}): CandidateEligibility {
  const rejectionReasons = input.results.flatMap((result) => result.rejectionReasons);
  const warnings = input.results.flatMap((result) => result.warnings);

  return {
    exerciseId: input.exerciseId,
    legal: rejectionReasons.length === 0,
    rejectionReasons,
    warnings,
    painMatchTrace: input.painMatchTrace,
  };
}
