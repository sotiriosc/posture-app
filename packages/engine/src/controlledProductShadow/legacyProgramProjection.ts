import type { Program } from "../types";
import { PRODUCT_LEGACY_PROGRAM_SHADOW_PROJECTION_REFERENCE,
  type ProductExerciseIdentityRegistry, type ProductLegacyProgramShadowProjection } from "./contracts";
import { deriveProductLegacyProgramRevision } from "./productSnapshotAdapter";

export function projectLegacyProgramForControlledShadow(input: {
  readonly program: Program;
  readonly identityRegistry: ProductExerciseIdentityRegistry;
}): ProductLegacyProgramShadowProjection {
  const byId = new Map(input.identityRegistry.entries.map((entry) => [entry.productExerciseId, entry]));
  const unresolved = new Set<string>();
  const days = [...input.program.week].sort((left, right) => left.dayIndex - right.dayIndex).map((day) => Object.freeze({
    dayIndex: day.dayIndex, sections: Object.freeze(day.routine.map((item) => {
      const mapping = byId.get(item.exerciseId);
      if (!mapping?.v2ExerciseId) unresolved.add(`PRODUCT_EXERCISE_IDENTITY_UNRESOLVED:${item.exerciseId}`);
      return Object.freeze({ section: item.section ?? "main", productExerciseId: item.exerciseId,
        v2ExerciseId: mapping?.v2ExerciseId ?? null,
        identityClassification: mapping?.classification ?? "ambiguous_requires_review" as const,
        sets: typeof item.sets === "number" ? item.sets : null, reps: item.reps ?? null,
        duration: item.durationSec ?? null });
    })) }));
  return Object.freeze({ projectionContract: PRODUCT_LEGACY_PROGRAM_SHADOW_PROJECTION_REFERENCE,
    programId: input.program.id, programRevisionId: deriveProductLegacyProgramRevision(input.program),
    phaseIndex: input.program.phaseIndex ?? null, cycleIndex: input.program.cycleIndex ?? null,
    weekIndex: input.program.weekIndex ?? null, daysPerWeek: input.program.daysPerWeek,
    days: Object.freeze(days), unresolvedMappings: Object.freeze([...unresolved].sort()),
    candidateAuthority: false, prescriptionAuthority: false, performanceAuthority: false,
    provenance: Object.freeze(["legacy-product-program:comparison-only", "legacy-program:not-v2-authority"]) });
}
