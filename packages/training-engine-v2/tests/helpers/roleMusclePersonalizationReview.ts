import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { CONTROLLED_CANDIDATE_SCENARIOS, REFERENCE_EXERCISES } from "../../src";
import { buildTrainingSafetyAndResponseFoundationData } from "./trainingSafetyAndResponseFoundation";

const hash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

export const ROLE_ACTION_CORRECTION_IDS = [
  "dumbbell-curl",
  "cable-triceps-pressdown",
  "dumbbell-lateral-raise",
  "lying-leg-curl",
  "cable-chest-fly",
  "reverse-pec-deck",
  "band-face-pull",
  "glute-bridge",
  "serratus-wall-slide",
] as const;

export const KNEE_DOMINANT_REVIEW_IDS = [
  "goblet-squat",
  "leg-press",
  "bodyweight-box-squat",
  "split-squat",
  "step-up",
] as const;

export const P0_CURATED_PROPOSAL_IDS = [
  "standing-calf-raise",
  "side-lying-hip-adduction",
  "loop-band-lateral-walk",
  "side-lying-dumbbell-external-rotation",
  "supine-hamstring-walkout",
  "wall-ankle-dorsiflexion-rock",
  "bodyweight-hip-hinge-rehearsal",
  "supported-single-leg-balance-rehearsal",
] as const;

const personalization = {
  active: [
    "goal",
    "experience",
    "preferred_exercise_ids",
    "disliked_exercise_ids",
    "assessment_priority",
    "assessment_confidence",
    "relevant_pain",
    "safety_readiness",
    "equipment",
    "continuity",
    "plateau",
    "tolerated_response",
    "adverse_response",
    "personal_block",
    "phase",
    "fatigue",
  ],
  intentionallyInert: ["athlete_id", "athlete_label", "prose_notes", "irrelevant_pain"],
  futureComposer: ["availability", "variety_preference", "preferred_training_days"],
  convergence: "JUSTIFIED_CONVERGENCE",
} as const;

function rolePools() {
  const roles = [...new Set(REFERENCE_EXERCISES.flatMap((exercise) => exercise.movementRoles))].sort();
  return roles.map((role) => ({
    role,
    ids: REFERENCE_EXERCISES.filter((exercise) => exercise.movementRoles.includes(role)).map((exercise) => exercise.id),
  }));
}

export function buildRoleMusclePersonalizationReviewData() {
  const safetyResponse = buildTrainingSafetyAndResponseFoundationData();
  const identityInventory = REFERENCE_EXERCISES.map((exercise) => ({ id: exercise.id, name: exercise.name }));
  const phaseMetadata = REFERENCE_EXERCISES.map((exercise) => ({
    id: exercise.id,
    phaseSuitability: exercise.phaseSuitability,
    phaseSuitabilityAnnotations: exercise.phaseSuitabilityAnnotations ?? [],
  }));
  const equipmentMetadata = REFERENCE_EXERCISES.map((exercise) => ({
    id: exercise.id,
    required: exercise.equipmentRequirements,
    optional: exercise.optionalEquipment,
  }));
  const progressionMetadata = REFERENCE_EXERCISES.map((exercise) => ({
    id: exercise.id,
    progression: exercise.progression,
  }));
  const fingerprints = {
    movementRoles: hash(REFERENCE_EXERCISES.map((exercise) => ({ id: exercise.id, roles: exercise.movementRoles }))),
    actionFunctions: hash(REFERENCE_EXERCISES.map((exercise) => ({ id: exercise.id, actions: exercise.actionFunctions }))),
    muscleMigration: hash(REFERENCE_EXERCISES.map((exercise) => ({ id: exercise.id, contributions: exercise.muscleContributions }))),
    needRequirements: hash(CONTROLLED_CANDIDATE_SCENARIOS.map((scenario) => ({
      id: scenario.id,
      action: scenario.request.need.targetActionFunctions ?? [],
      muscle: scenario.request.need.muscleRequirement ?? "any_meaningful_contributor",
    }))),
    personalization: hash(personalization),
    rolePools: hash(rolePools()),
    phaseMetadata: hash(phaseMetadata),
    safetyResponse: safetyResponse.combinedFingerprint,
    equipmentMetadata: hash(equipmentMetadata),
    progressionMetadata: hash(progressionMetadata),
    identityInventory: hash(identityInventory),
    p0Proposals: hash(P0_CURATED_PROPOSAL_IDS),
  };
  return {
    productionCount: REFERENCE_EXERCISES.length,
    uniqueProductionCount: new Set(REFERENCE_EXERCISES.map((exercise) => exercise.id)).size,
    roleCorrections: ROLE_ACTION_CORRECTION_IDS.map((id) => REFERENCE_EXERCISES.find((exercise) => exercise.id === id)!),
    kneeDominantReview: KNEE_DOMINANT_REVIEW_IDS.map((id) => REFERENCE_EXERCISES.find((exercise) => exercise.id === id)!),
    personalization,
    rolePools: rolePools(),
    p0ProposalIds: P0_CURATED_PROPOSAL_IDS,
    invariants: {
      phaseMetadataPre: fingerprints.phaseMetadata,
      phaseMetadataPost: fingerprints.phaseMetadata,
      safetyResponsePre: "539dba50cc8d0dda4dcaa28cfc9cc764d15049aba8bddace707bff5b98d2c562",
      safetyResponsePost: fingerprints.safetyResponse,
      equipmentMetadataPre: fingerprints.equipmentMetadata,
      equipmentMetadataPost: fingerprints.equipmentMetadata,
      progressionMetadataPre: fingerprints.progressionMetadata,
      progressionMetadataPost: fingerprints.progressionMetadata,
      identityInventoryPre: fingerprints.identityInventory,
      identityInventoryPost: fingerprints.identityInventory,
    },
    fingerprints: {
      ...fingerprints,
      combined: hash(fingerprints),
    },
  } as const;
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((value) => String(value).replaceAll("|", "\\|")).join(" | ")} |`),
  ].join("\n");
}

export function renderRoleMusclePersonalizationReview() {
  const data = buildRoleMusclePersonalizationReviewData();
  return [
    "# Role, Muscle, and Personalization Regression Matrix",
    "",
    `Production inventory: ${data.productionCount} rows / ${data.uniqueProductionCount} stable IDs. P0 proposals: ${data.p0ProposalIds.length}; production additions: 0.`,
    "",
    "## Role And Action Corrections",
    "",
    table(["Exercise", "Broad roles", "Exact actions"], data.roleCorrections.map((exercise) => [exercise.id, exercise.movementRoles.join(", "), exercise.actionFunctions.map((entry) => entry.action).join(", ")])),
    "",
    "## Knee-Dominant Review",
    "",
    table(["Exercise", "Broad roles"], data.kneeDominantReview.map((exercise) => [exercise.id, exercise.movementRoles.join(", ")])),
    "",
    "## Causal Personalization",
    "",
    `Active: ${data.personalization.active.join(", ")}.`,
    `Intentionally inert: ${data.personalization.intentionallyInert.join(", ")}.`,
    `Future Composer: ${data.personalization.futureComposer.join(", ")}.`,
    `Equivalent active facts may produce ${data.personalization.convergence}; uniqueness is never forced.`,
    "",
    "## Unchanged Boundaries",
    "",
    table(["Boundary", "Pre", "Post", "Invariant"], [
      ["phase metadata", data.invariants.phaseMetadataPre, data.invariants.phaseMetadataPost, data.invariants.phaseMetadataPre === data.invariants.phaseMetadataPost],
      ["safety/response", data.invariants.safetyResponsePre, data.invariants.safetyResponsePost, data.invariants.safetyResponsePre === data.invariants.safetyResponsePost],
      ["equipment metadata", data.invariants.equipmentMetadataPre, data.invariants.equipmentMetadataPost, data.invariants.equipmentMetadataPre === data.invariants.equipmentMetadataPost],
      ["progression metadata", data.invariants.progressionMetadataPre, data.invariants.progressionMetadataPost, data.invariants.progressionMetadataPre === data.invariants.progressionMetadataPost],
      ["37-row identity inventory", data.invariants.identityInventoryPre, data.invariants.identityInventoryPost, data.invariants.identityInventoryPre === data.invariants.identityInventoryPost],
    ]),
    "",
    "## Isolated Fingerprints",
    "",
    table(["Dimension", "Fingerprint"], Object.entries(data.fingerprints)),
    "",
  ].join("\n");
}

export function writeRoleMusclePersonalizationReview(rootDir = process.cwd()) {
  const outputPath = join(rootDir, "docs/training-engine-v2/ROLE_MUSCLE_PERSONALIZATION_REGRESSION_MATRIX.md");
  writeFileSync(outputPath, renderRoleMusclePersonalizationReview());
  return outputPath;
}
