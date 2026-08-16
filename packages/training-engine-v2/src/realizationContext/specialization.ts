import { ATHLETE_SPECIALIZATION_PRIORITY_PROFILE_CONTRACT_REFERENCE,
  type AthleteSpecializationPriorityProfile } from "./contracts";

export function validateSpecializationPriorityProfile(
  profile: AthleteSpecializationPriorityProfile,
): readonly string[] {
  const reasons: string[] = [];
  if (profile.contractReference.contractId !==
      ATHLETE_SPECIALIZATION_PRIORITY_PROFILE_CONTRACT_REFERENCE.contractId ||
      profile.contractReference.contractVersion !==
      ATHLETE_SPECIALIZATION_PRIORITY_PROFILE_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("SPECIALIZATION_PROFILE_VERSION_INVALID");
  }
  if (!profile.profileId.trim() || !profile.athleteId.trim()) {
    reasons.push("SPECIALIZATION_PROFILE_IDENTITY_REQUIRED");
  }
  if (profile.unlimitedVolumeAuthorized) reasons.push("SPECIALIZATION_UNLIMITED_VOLUME_FORBIDDEN");
  if (profile.exerciseSelectionAuthorized) reasons.push("SPECIALIZATION_EXERCISE_SELECTION_FORBIDDEN");
  if (profile.safetyOverrideAuthorized) reasons.push("SPECIALIZATION_SAFETY_OVERRIDE_FORBIDDEN");
  const ids = new Set<string>();
  for (const priority of profile.priorities) {
    if (!priority.priorityId.trim() || !priority.targetId.trim() || !priority.reason.trim()) {
      reasons.push("SPECIALIZATION_PRIORITY_INCOMPLETE");
    }
    if (ids.has(priority.priorityId)) reasons.push(`DUPLICATE_SPECIALIZATION_PRIORITY:${priority.priorityId}`);
    ids.add(priority.priorityId);
  }
  return Object.freeze([...new Set(reasons)].sort());
}
