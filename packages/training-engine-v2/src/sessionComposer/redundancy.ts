import type { CanonicalCompositionFact, SessionRedundancyTrace } from "./contracts";
import type { WorkingAssignment } from "./internal";

function overlap(left: readonly string[], right: readonly string[]): readonly string[] {
  const rightSet = new Set(right);
  return left.filter((entry) => rightSet.has(entry)).sort();
}

function assignmentsServeOverlappingPurpose(
  left: WorkingAssignment,
  right: WorkingAssignment,
): boolean {
  return left.coverage.some((leftCoverage) =>
    right.coverage.some((rightCoverage) => {
      const leftSelection = leftCoverage.need.selection;
      const rightSelection = rightCoverage.need.selection;
      return overlap(leftSelection.targetMovementRoles, rightSelection.targetMovementRoles).length > 0 ||
        overlap(leftSelection.targetActionFunctions, rightSelection.targetActionFunctions).length > 0 ||
        overlap(leftSelection.targetMuscles, rightSelection.targetMuscles).length > 0;
    }),
  );
}

export function evaluateSessionRedundancy(
  assignments: readonly WorkingAssignment[],
  facts: ReadonlyMap<string, CanonicalCompositionFact>,
): readonly SessionRedundancyTrace[] {
  const traces: SessionRedundancyTrace[] = [];
  for (let leftIndex = 0; leftIndex < assignments.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < assignments.length; rightIndex += 1) {
      const left = assignments[leftIndex];
      const right = assignments[rightIndex];
      const leftFact = facts.get(left.exerciseId)!;
      const rightFact = facts.get(right.exerciseId)!;
      const dimensions = [
        ...(leftFact.family === rightFact.family ? ["family"] : []),
        ...(overlap(leftFact.movementRoles, rightFact.movementRoles).length ? ["movement_role"] : []),
        ...(overlap(leftFact.actionFunctions, rightFact.actionFunctions).length ? ["action_function"] : []),
        ...(overlap(leftFact.primaryMuscles, rightFact.primaryMuscles).length ? ["primary_muscle"] : []),
        ...(leftFact.supportSignature === rightFact.supportSignature ? ["support"] : []),
        ...(leftFact.resistancePathSignature === rightFact.resistancePathSignature ? ["resistance_path"] : []),
      ];
      const redundant = dimensions.length >= 3 && assignmentsServeOverlappingPurpose(left, right);
      traces.push({
        leftExerciseId: left.exerciseId,
        rightExerciseId: right.exerciseId,
        overlappingDimensions: dimensions,
        verdict: redundant ? "redundant" : "complementary",
      });
    }
  }
  return traces;
}
