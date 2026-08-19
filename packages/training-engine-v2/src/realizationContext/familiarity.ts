import type {
  ExerciseIdentityFamiliarityProfile,
  ExerciseRealizationDimensions,
  ExerciseRealizationFamiliarityProfile,
  ExerciseRealizationFamiliarityState,
} from "./contracts";

function semantic(value: unknown): string {
  if (Array.isArray(value)) return JSON.stringify([...value].sort());
  if (value && typeof value === "object") {
    return JSON.stringify(Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))));
  }
  return JSON.stringify(value);
}
export function realizationDifferenceDimensions(
  expected: ExerciseRealizationDimensions,
  observed: ExerciseRealizationDimensions,
): readonly string[] {
  const dimensions: (keyof ExerciseRealizationDimensions)[] = [
    "exerciseId", "doseMode", "equipmentImplementId", "machineId", "support", "range",
    "leverId", "laterality", "sideBehavior", "loadContextId", "effortContextId",
    "tempoContextId", "blockStructureId", "section", "role", "purpose",
  ];
  return Object.freeze(dimensions.filter((dimension) =>
    semantic(expected[dimension]) !== semantic(observed[dimension])).sort());
}

export function resolveRealizationFamiliarity(input: {
  readonly target: ExerciseRealizationDimensions;
  readonly identity: ExerciseIdentityFamiliarityProfile;
  readonly evidence: readonly ExerciseRealizationFamiliarityProfile[];
}): {
  readonly state: ExerciseRealizationFamiliarityState;
  readonly profile: ExerciseRealizationFamiliarityProfile | null;
  readonly exact: boolean;
  readonly differenceDimensions: readonly string[];
  readonly identityFamiliarityCoercedToExact: false;
} {
  const exact = input.evidence.find((profile) =>
    realizationDifferenceDimensions(input.target, profile.realization).length === 0);
  if (exact) {
    return Object.freeze({ state: exact.state, profile: exact, exact: true,
      differenceDimensions: Object.freeze([]), identityFamiliarityCoercedToExact: false });
  }
  const related = input.evidence
    .map((profile) => ({ profile,
      differences: realizationDifferenceDimensions(input.target, profile.realization) }))
    .filter((entry) => entry.profile.realization.exerciseId === input.target.exerciseId)
    .sort((left, right) => left.differences.length - right.differences.length ||
      left.profile.profileId.localeCompare(right.profile.profileId))[0];
  if (related) {
    const state: ExerciseRealizationFamiliarityState =
      related.profile.state.includes("productive") ? "related_productive" :
        related.profile.state.includes("limited") || related.profile.state.includes("adverse") ?
          "related_limited" : "related_tolerated";
    return Object.freeze({ state, profile: related.profile, exact: false,
      differenceDimensions: related.differences, identityFamiliarityCoercedToExact: false });
  }
  return Object.freeze({
    state: input.identity.state === "unknown" || input.identity.state === "never_exposed" ?
      "unknown" : "identity_only",
    profile: null,
    exact: false,
    differenceDimensions: Object.freeze(["exact_realization_evidence"]),
    identityFamiliarityCoercedToExact: false,
  });
}
