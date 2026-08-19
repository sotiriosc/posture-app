import { ATHLETE_AUTHORED_PROGRAMMING_BRIEF_CONTRACT_REFERENCE,
  type AthleteAuthoredProgrammingBrief } from "./contracts";

export function validateAthleteAuthoredProgrammingBrief(
  brief: AthleteAuthoredProgrammingBrief,
): readonly string[] {
  const reasons: string[] = [];
  if (brief.contractReference.contractId !==
      ATHLETE_AUTHORED_PROGRAMMING_BRIEF_CONTRACT_REFERENCE.contractId ||
      brief.contractReference.contractVersion !==
      ATHLETE_AUTHORED_PROGRAMMING_BRIEF_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("PROGRAMMING_BRIEF_VERSION_INVALID");
  }
  if (!brief.briefId.trim() || !brief.athleteId.trim()) reasons.push("PROGRAMMING_BRIEF_IDENTITY_REQUIRED");
  if (brief.provenance.length === 0) reasons.push("PROGRAMMING_BRIEF_PROVENANCE_REQUIRED");
  if (brief.completedPerformanceClaimed) reasons.push("PROGRAMMING_BRIEF_CANNOT_CLAIM_PERFORMANCE");
  if (brief.equipmentCapabilityClaimed) reasons.push("PROGRAMMING_BRIEF_CANNOT_PROVE_EQUIPMENT");
  if (brief.exactDoseAuthorityClaimed) reasons.push("PROGRAMMING_BRIEF_CANNOT_PROVE_DOSE");
  const substitutionTargets = new Set<string>();
  for (const substitution of brief.exerciseSubstitutionRequests) {
    const key = `${substitution.fromExerciseId}:${substitution.toExerciseId}`;
    if (substitutionTargets.has(key)) reasons.push(`DUPLICATE_SUBSTITUTION_REQUEST:${key}`);
    substitutionTargets.add(key);
  }
  return Object.freeze([...new Set(reasons)].sort());
}

export function stableAnchorDisposition(input: {
  readonly brief: AthleteAuthoredProgrammingBrief;
  readonly exerciseId: string;
  readonly legal: boolean;
  readonly tolerated: boolean;
  readonly equipmentAvailable: boolean;
}): "preserve" | "cannot_realize" | "not_requested" {
  if (!input.brief.preferredStableExerciseIds.includes(input.exerciseId)) return "not_requested";
  return input.legal && input.tolerated && input.equipmentAvailable ? "preserve" : "cannot_realize";
}
