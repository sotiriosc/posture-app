import type {
  AthleteTrainingExperienceProfile,
  ExperienceAuthority,
  ExerciseIdentityFamiliarityProfile,
  ExerciseRealizationFamiliarityProfile,
} from "./contracts";

export interface ExperienceAuthorityResolution {
  readonly authority: ExperienceAuthority;
  readonly emptyEngineHistoryImpliesNovice: false;
  readonly lifetimeYearsProvideExactLoadAuthority: false;
  readonly coarseExperienceProvidesExactDoseAuthority: false;
  readonly reasonCodes: readonly string[];
}

export function resolveExperienceAuthority(input: {
  readonly experience: AthleteTrainingExperienceProfile;
  readonly identityFamiliarity: ExerciseIdentityFamiliarityProfile;
  readonly realizationFamiliarity: ExerciseRealizationFamiliarityProfile;
  readonly hasExactCompletedPerformance: boolean;
  readonly hasRepeatedRelatedCompletedPerformance: boolean;
  readonly hasCoachReviewedCurrentRealizationHistory: boolean;
  readonly hasAuthenticatedAthleteCurrentRealizationReport: boolean;
}): ExperienceAuthorityResolution {
  let authority: ExperienceAuthority = "unknown";
  const reasons: string[] = [];

  if (input.hasExactCompletedPerformance) {
    authority = "exact_completed_performance_current_realization";
    reasons.push("EXACT_COMPLETED_PERFORMANCE_FIRST");
  } else if (input.hasRepeatedRelatedCompletedPerformance) {
    authority = "repeated_completed_performance_related_realizations";
    reasons.push("RELATED_COMPLETED_PERFORMANCE_REMAINS_RELATED");
  } else if (input.hasCoachReviewedCurrentRealizationHistory) {
    authority = "coach_reviewed_current_realization_history";
    reasons.push("COACH_REVIEWED_CURRENT_REALIZATION_CONTEXT");
  } else if (input.hasAuthenticatedAthleteCurrentRealizationReport) {
    authority = "authenticated_athlete_current_realization_report";
    reasons.push("ATHLETE_REPORT_IS_CONTEXT_NOT_COMPLETED_PERFORMANCE");
  } else if (input.identityFamiliarity.state !== "unknown") {
    authority = "identity_familiarity";
    reasons.push("IDENTITY_FAMILIARITY_DOES_NOT_PROVE_EXACT_REALIZATION");
  } else if (input.experience.recentConsistencyState !== "unknown") {
    authority = "recent_training_consistency";
    reasons.push("RECENT_CONSISTENCY_BEFORE_GLOBAL_LABEL");
  } else {
    authority = "coarse_experience_level";
    reasons.push("COARSE_EXPERIENCE_CONTEXT_ONLY");
  }

  if (input.realizationFamiliarity.state === "exact_current_adverse") {
    reasons.push("EXACT_ADVERSE_EVIDENCE_OVERRIDES_GLOBAL_EXPERIENCE");
  }
  if (input.experience.lifetimeResistanceTrainingYears?.min !== undefined &&
      input.experience.lifetimeResistanceTrainingYears.min >= 20) {
    reasons.push("TWENTY_PLUS_YEARS_PRESERVED_WITHOUT_EXACT_DOSE_INFERENCE");
  }

  return Object.freeze({
    authority,
    emptyEngineHistoryImpliesNovice: false,
    lifetimeYearsProvideExactLoadAuthority: false,
    coarseExperienceProvidesExactDoseAuthority: false,
    reasonCodes: Object.freeze(reasons),
  });
}
