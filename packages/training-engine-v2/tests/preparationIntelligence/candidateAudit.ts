import {
  REFERENCE_EXERCISES,
  type PreparationCandidateAuditRow,
} from "../../src";

const canonicalPreparationIds = new Set([
  "ninety-ninety-breathing",
  "serratus-wall-slide",
  "dead-bug",
  "band-row",
  "bodyweight-box-squat",
  "bodyweight-hip-hinge-rehearsal",
  "glute-bridge",
  "band-face-pull",
  "pallof-press",
  "forearm-plank",
  "forearm-side-plank",
  "wall-ankle-dorsiflexion-rock",
  "single-leg-balance-rehearsal",
  "loop-band-lateral-walk",
  "side-lying-dumbbell-external-rotation",
  "bird-dog",
]);

export const currentProductionCatalogAudit: readonly PreparationCandidateAuditRow[] = Object.freeze(
  REFERENCE_EXERCISES.map((exercise) => canonicalPreparationIds.has(exercise.id)
    ? {
        sourceCatalog: "training_engine_v2" as const,
        sourceId: exercise.id,
        canonicalId: exercise.id,
        disposition: "already_production_canonical" as const,
        reason: "Reviewed V2 roles, mechanics, equipment, and Knowledge can serve a typed preparation need.",
      }
    : {
        sourceCatalog: "training_engine_v2" as const,
        sourceId: exercise.id,
        canonicalId: exercise.id,
        disposition: "deferred" as const,
        reason: "The production identity remains developmental or does not close a preparation coverage gap in this tranche.",
      }),
);

const productWarmupRows = [
  ["brisk-march-breath", null, "deferred", "General readiness requires an explicit policy and equipment realization."],
  ["supine-90-90-breath", "ninety-ninety-breathing", "same_realization_of_existing_identity", "Same supported breathing task."],
  ["ninety-ninety-switches", "moving-ninety-ninety-hip-switch", "legacy_suitable_for_canonical_migration", "Closes the dynamic hip-rotation range gap."],
  ["hip-shifts", "quadruped-hip-rock-back", "legacy_suitable_for_canonical_migration", "Closes the supported dynamic hip-flexion range gap."],
  ["wall-slides", "serratus-wall-slide", "deferred", "Generic wall-slide mechanics overlap the reviewed serratus identity and need a distinct mechanics case before admission."],
  ["scap-cars", null, "deferred", "General scapular range is not required by the current typed need set."],
  ["dead-bug-brace", "dead-bug", "same_realization_of_existing_identity", "Low-dose preparation is a prescription of Dead Bug."],
  ["bird-dog-brace", "bird-dog", "same_realization_of_existing_identity", "Low-dose preparation is a prescription of Bird Dog."],
  ["thoracic-open-book", null, "deferred", "No current typed thoracic-rotation coverage gap requires admission."],
  ["thread-the-needle", null, "deferred", "No current typed thoracic-rotation coverage gap requires admission."],
  ["ankle-mobility-rocks", "wall-ankle-dorsiflexion-rock", "same_realization_of_existing_identity", "V2 preserves the truthful wall requirement."],
  ["soleus-wall-drives", "wall-ankle-dorsiflexion-rock", "redundant", "Does not close a distinct range or mechanics gap."],
  ["glute-bridge-activation", "glute-bridge", "same_realization_of_existing_identity", "Activation dose does not create another identity."],
  ["band-lateral-walk", "loop-band-lateral-walk", "same_realization_of_existing_identity", "V2 preserves exact loop-band equipment truth."],
  ["serratus-wall-slide", "serratus-wall-slide", "same_realization_of_existing_identity", "Exact canonical V2 identity."],
  ["scap-pushup-plus", "scapular-push-up", "legacy_suitable_for_canonical_migration", "Provides a no-wall scapular protraction control option with wrist/loading boundaries."],
  ["hip-hinge-dowel", "bodyweight-hip-hinge-rehearsal", "same_realization_of_existing_identity", "A dowel is an optional setup cue, not a new identity."],
  ["bodyweight-good-morning-pattern", "bodyweight-hip-hinge-rehearsal", "same_realization_of_existing_identity", "Same unloaded hinge-rehearsal identity."],
  ["back-extension-hold-pattern", null, "deferred", "Higher local fatigue and setup ambiguity do not improve the compact preparation pool."],
  ["bodyweight-squat-to-box", "bodyweight-box-squat", "same_realization_of_existing_identity", "Exact box-supported rehearsal."],
  ["supported-squat-pattern", "bodyweight-squat-rehearsal", "legacy_suitable_for_canonical_migration", "Closes the unloaded squat rehearsal gap without requiring a box."],
  ["goblet-squat-pattern", "goblet-squat", "same_realization_of_existing_identity", "A low-load prescription does not create another identity."],
  ["pallof-iso-hold", "pallof-press", "deferred", "Isometric dosage needs a reviewed alternate dose mode before admission."],
  ["dead-bug-cross-connect", "dead-bug", "deferred", "Cross-connect mechanics are not needed to close the trunk-control gap."],
  ["side-plank-reach", "forearm-side-plank", "deferred", "Dynamic reach is not required by the current preparation pool."],
  ["band-row-primer", "band-row", "same_realization_of_existing_identity", "Primer dose is a legal activation prescription of Band Row."],
  ["incline-pushup-pattern", "push-up", "same_realization_of_existing_identity", "Elevated support is an existing Push-Up realization."],
  ["band-external-rotation", null, "deferred", "Anchor/type truth and a distinct equipment gap need review."],
  ["side-lying-external-rotation", "side-lying-dumbbell-external-rotation", "same_realization_of_existing_identity", "Exact dumbbell cuff-control identity."],
  ["wall-external-rotation-isometric", null, "deferred", "No current cuff-control coverage gap requires a second identity."],
  ["half-kneeling-knee-over-toe-rocks", "wall-ankle-dorsiflexion-rock", "redundant", "Overlaps ankle-range preparation without a proven distinct selection need."],
  ["wall-supported-deep-knee-bend-hold", null, "deferred", "Static deep-knee exposure needs a separate reviewed requirement."],
  ["hip-flexor-stretch-cooldown", "half-kneeling-hip-flexor-stretch", "legacy_suitable_for_canonical_migration", "Closes bounded hip-extension range and cooldown ownership."],
  ["calf-wall-stretch", "wall-ankle-dorsiflexion-rock", "redundant", "Dynamic ankle range already covers the admitted need without automatic passive stretching."],
  ["pec-doorway-stretch", null, "deferred", "No typed chest-stretch requirement or recovery benefit supports admission."],
  ["child-pose-breath", "ninety-ninety-breathing", "redundant", "A second downshift identity is not needed for the compact foundation."],
] as const;

export const productWarmupLibraryAudit: readonly PreparationCandidateAuditRow[] = Object.freeze(
  productWarmupRows.map(([sourceId, canonicalId, disposition, reason]) => ({
    sourceCatalog: "product_warmup_library" as const,
    sourceId,
    canonicalId,
    disposition,
    reason,
  })),
);

const productExerciseIds = [
  "cat-cow", "wall-slides", "foam-roll-upper-back", "glute-bridges", "band-pull-aparts",
  "scapular-pushups", "dead-bug", "standing-brace-march", "wall-supported-carry-march",
  "band-offset-march-hold", "prone-ytw", "hip-flexor-stretch", "thread-the-needle",
  "chin-tucks", "doorway-pec-stretch", "thoracic-rotation", "wall-angel-hold", "bird-dog",
  "hamstring-stretch", "side-lying-open-book", "ankle-mobility", "banded-lat-stretch",
  "breathing-90-90", "hip-hinge-drill", "dumbbell-side-lying-external-rotation",
  "machine-shoulder-external-rotation",
] as const;

const productExerciseCanonical: Readonly<Record<string, string>> = {
  "wall-slides": "serratus-wall-slide",
  "glute-bridges": "glute-bridge",
  "scapular-pushups": "scapular-push-up",
  "dead-bug": "dead-bug",
  "hip-flexor-stretch": "half-kneeling-hip-flexor-stretch",
  "bird-dog": "bird-dog",
  "ankle-mobility": "wall-ankle-dorsiflexion-rock",
  "breathing-90-90": "ninety-ninety-breathing",
  "hip-hinge-drill": "bodyweight-hip-hinge-rehearsal",
  "dumbbell-side-lying-external-rotation": "side-lying-dumbbell-external-rotation",
};

export const productExerciseCatalogAudit: readonly PreparationCandidateAuditRow[] = Object.freeze(
  productExerciseIds.map((sourceId) => {
    const canonicalId = productExerciseCanonical[sourceId] ?? null;
    const migrated = sourceId === "scapular-pushups" || sourceId === "hip-flexor-stretch";
    return {
      sourceCatalog: "product_exercises" as const,
      sourceId,
      canonicalId,
      disposition: migrated
        ? "legacy_suitable_for_canonical_migration" as const
        : canonicalId
          ? "same_realization_of_existing_identity" as const
          : "deferred" as const,
      reason: canonicalId
        ? "The V2 canonical identity owns the reviewed mechanics and equipment boundary."
        : "This Product row does not close a proven compact V2 preparation gap.",
    };
  }),
);

export const preparationCandidateAudit = Object.freeze([
  ...currentProductionCatalogAudit,
  ...productWarmupLibraryAudit,
  ...productExerciseCatalogAudit,
]);

export const PREPARATION_FOUNDATION_ADMITTED_IDS = Object.freeze([
  "moving-ninety-ninety-hip-switch",
  "quadruped-hip-rock-back",
  "scapular-push-up",
  "bodyweight-squat-rehearsal",
  "half-kneeling-hip-flexor-stretch",
]);
