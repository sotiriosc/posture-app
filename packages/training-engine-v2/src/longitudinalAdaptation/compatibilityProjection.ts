import type { ProgressionDecision } from "../prescription/progressionEvidence";
import type { ProductionLongitudinalAdaptationActionDirective } from "./contracts";

export interface LegacyProgressionDecisionCompatibilityProjection {
  readonly disposition: "LEGACY_COMPATIBILITY_ONLY_NOT_PRODUCTION_AUTHORITY";
  readonly decision: ProgressionDecision | null;
  readonly reasonCodes: readonly string[];
}

export function projectProductionDirectiveToLegacyProgressionDecision(
  directive: ProductionLongitudinalAdaptationActionDirective | null,
): LegacyProgressionDecisionCompatibilityProjection {
  if (!directive) return Object.freeze({ disposition: "LEGACY_COMPATIBILITY_ONLY_NOT_PRODUCTION_AUTHORITY",
    decision: null, reasonCodes: Object.freeze(["AUTHORIZED_DIRECTIVE_REQUIRED"]) });
  const action = directive.action === "progress_prescription_axis" ? "progress_prescription" as const :
    directive.action === "regress_prescription_axis" ? "regress_prescription" as const :
    directive.action === "reopen_candidate_selection_for_replacement" ? "replace_exercise" as const :
    directive.action === "deload_review" ? "deload" as const : "hold" as const;
  return Object.freeze({ disposition: "LEGACY_COMPATIBILITY_ONLY_NOT_PRODUCTION_AUTHORITY",
    decision: Object.freeze({ exerciseId: directive.targetId, action,
      ...(directive.selectedAxis ? { axis: directive.selectedAxis } : {}),
      keepsExerciseStable: !["replace_exercise"].includes(action),
      reason: directive.reasonCodes.join(","), requiresHumanReview: true }),
    reasonCodes: Object.freeze(["LEGACY_PROGRESSION_DECISION_IS_COMPATIBILITY_PROJECTION_ONLY"]),
  });
}
