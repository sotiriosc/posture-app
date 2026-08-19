import type { CandidateRankingResult, RankedCandidate } from "../candidate";
import type { ExerciseDefinition } from "../domain/exercise";
import type { SessionContinuityEvidence } from "../domain/session";
import type { CanonicalCompositionFact } from "./contracts";

export function deriveCanonicalCompositionFact(input: {
  readonly exercise: ExerciseDefinition;
  readonly candidate: RankedCandidate;
  readonly continuity: SessionContinuityEvidence;
}): CanonicalCompositionFact {
  if (input.candidate.exercise.id !== input.exercise.id) {
    throw new Error("Composition fact candidate/exercise identity mismatch.");
  }
  const support = input.exercise.mechanics?.support;
  return {
    exerciseId: input.exercise.id,
    legalSections: Object.keys(input.exercise.sectionSuitability).sort() as CanonicalCompositionFact["legalSections"],
    legalRoles: [...input.exercise.trainingRoles].sort(),
    movementRoles: [...input.exercise.movementRoles].sort(),
    actionFunctions: input.exercise.actionFunctions.map((entry) => entry.action).sort(),
    primaryMuscles: [...input.exercise.primaryMuscles].sort(),
    bodyRegions: [...input.exercise.bodyRegions].sort(),
    family: input.exercise.family,
    supportSignature: support
      ? `${support.basePosition}:${support.supportAmount}:${support.supportContacts.map((entry) => entry.source).sort().join("+")}`
      : "unknown",
    resistancePathSignature: input.exercise.mechanics?.resistancePath?.resistancePath ?? "unknown",
    setupSignature: input.exercise.equipmentRequirements.map((entry) => entry.id).sort().join("+") || "none",
    localFatigue: input.exercise.loading.localFatigue,
    systemicFatigue: input.exercise.loading.systemicFatigue,
    axialLoading: input.exercise.loading.axialLoading,
    intrinsicStressTags: (input.exercise.stressAnnotations ?? [])
      .filter((entry) => entry.exposureScope === "intrinsic")
      .map((entry) => entry.tag)
      .sort(),
    potentialStressTags: (input.exercise.stressAnnotations ?? [])
      .filter((entry) => entry.exposureScope !== "intrinsic")
      .map((entry) => entry.tag)
      .sort(),
    continuityEvidence:
      input.continuity.identities.find((entry) => entry.exerciseId === input.exercise.id) ?? null,
  };
}

export function deriveCanonicalCompositionFacts(input: {
  readonly candidateResultsByNeed: Readonly<Record<string, CandidateRankingResult>>;
  readonly continuity: SessionContinuityEvidence;
}): ReadonlyMap<string, CanonicalCompositionFact> {
  const facts = new Map<string, CanonicalCompositionFact>();
  for (const result of Object.values(input.candidateResultsByNeed)) {
    for (const candidate of result.rankedCandidates) {
      const existing = facts.get(candidate.exercise.id);
      const derived = deriveCanonicalCompositionFact({
        exercise: candidate.exercise,
        candidate,
        continuity: input.continuity,
      });
      if (existing && JSON.stringify(existing) !== JSON.stringify(derived)) {
        throw new Error(`Inconsistent canonical composition fact for ${candidate.exercise.id}.`);
      }
      facts.set(candidate.exercise.id, derived);
    }
  }
  return facts;
}
