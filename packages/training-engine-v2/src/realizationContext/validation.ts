import {
  ATHLETE_TRAINING_EXPERIENCE_PROFILE_CONTRACT_REFERENCE,
  EXERCISE_IDENTITY_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
  EXERCISE_REALIZATION_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
  REALIZATION_FAMILIARITY_FRESHNESS_POLICY_REQUIRED,
  type AthleteTrainingExperienceProfile,
  type ExerciseIdentityFamiliarityProfile,
  type ExerciseRealizationFamiliarityProfile,
  type PrescriptionRampUpResult,
} from "./contracts";

function validTime(value: string): boolean {
  return value.trim().length > 0 && Number.isFinite(Date.parse(value));
}
export function validateAthleteTrainingExperienceProfile(
  profile: AthleteTrainingExperienceProfile,
): readonly string[] {
  const reasons: string[] = [];
  if (profile.contractReference.contractId !==
      ATHLETE_TRAINING_EXPERIENCE_PROFILE_CONTRACT_REFERENCE.contractId ||
      profile.contractReference.contractVersion !==
      ATHLETE_TRAINING_EXPERIENCE_PROFILE_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("ATHLETE_EXPERIENCE_PROFILE_VERSION_INVALID");
  }
  if (!profile.profileId.trim() || !profile.athleteId.trim()) reasons.push("ATHLETE_EXPERIENCE_IDENTITY_REQUIRED");
  if (!validTime(profile.evaluationTime)) reasons.push("ATHLETE_EXPERIENCE_EVALUATION_TIME_INVALID");
  if (profile.lastConsistentTrainingDate && !validTime(profile.lastConsistentTrainingDate)) {
    reasons.push("LAST_CONSISTENT_TRAINING_DATE_INVALID");
  }
  for (const range of [profile.lifetimeResistanceTrainingYears, profile.consistentTrainingYears]) {
    if (range && (range.min < 0 || (range.max !== null && range.max < range.min))) {
      reasons.push("TRAINING_YEAR_RANGE_INVALID");
    }
  }
  if (profile.provenance.length === 0) reasons.push("ATHLETE_EXPERIENCE_PROVENANCE_REQUIRED");
  return Object.freeze([...new Set(reasons)].sort());
}

export function validateExerciseIdentityFamiliarityProfile(
  profile: ExerciseIdentityFamiliarityProfile,
): readonly string[] {
  const reasons: string[] = [];
  if (profile.contractReference.contractId !==
      EXERCISE_IDENTITY_FAMILIARITY_PROFILE_CONTRACT_REFERENCE.contractId ||
      profile.contractReference.contractVersion !==
      EXERCISE_IDENTITY_FAMILIARITY_PROFILE_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("IDENTITY_FAMILIARITY_VERSION_INVALID");
  }
  if (!profile.profileId.trim() || !profile.athleteId.trim() || !profile.exerciseId.trim()) {
    reasons.push("IDENTITY_FAMILIARITY_IDENTITY_REQUIRED");
  }
  if (profile.completedExposureCount !== null && profile.completedExposureCount < 0) {
    reasons.push("IDENTITY_EXPOSURE_COUNT_INVALID");
  }
  if (profile.lastExposureAt && !validTime(profile.lastExposureAt)) reasons.push("IDENTITY_LAST_EXPOSURE_TIME_INVALID");
  if (!validTime(profile.evaluationTime)) reasons.push("IDENTITY_EVALUATION_TIME_INVALID");
  return Object.freeze(reasons);
}

export function validateExerciseRealizationFamiliarityProfile(
  profile: ExerciseRealizationFamiliarityProfile,
): readonly string[] {
  const reasons: string[] = [];
  if (profile.contractReference.contractId !==
      EXERCISE_REALIZATION_FAMILIARITY_PROFILE_CONTRACT_REFERENCE.contractId ||
      profile.contractReference.contractVersion !==
      EXERCISE_REALIZATION_FAMILIARITY_PROFILE_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("REALIZATION_FAMILIARITY_VERSION_INVALID");
  }
  if (!profile.profileId.trim() || !profile.athleteId.trim() ||
      !profile.realization.exerciseId.trim() || !profile.realization.blockStructureId.trim()) {
    reasons.push("REALIZATION_FAMILIARITY_IDENTITY_REQUIRED");
  }
  if (!validTime(profile.evaluatedAt)) reasons.push("REALIZATION_FAMILIARITY_TIME_INVALID");
  if (profile.freshness === "recent_policy_dependent") {
    reasons.push(REALIZATION_FAMILIARITY_FRESHNESS_POLICY_REQUIRED);
  }
  return Object.freeze(reasons);
}

export function validatePrescriptionRampUpResult(result: PrescriptionRampUpResult): readonly string[] {
  const reasons: string[] = [];
  if (result.blocks.length > 4) reasons.push("RAMP_BLOCK_LIMIT_EXCEEDED");
  if (result.developmentalCreditCount !== 0 || result.blocks.some((block) => block.developmentalCredit)) {
    reasons.push("RAMP_DEVELOPMENTAL_CREDIT_FORBIDDEN");
  }
  if (new Set(result.blocks.map((block) => block.sourceExposureEventId)).size > 1) {
    reasons.push("RAMP_DUPLICATE_SOURCE_EVENT_FORBIDDEN");
  }
  if (result.blocks.some((block, index) => block.ordinal !== index + 1)) {
    reasons.push("RAMP_ORDER_INVALID");
  }
  return Object.freeze(reasons);
}
