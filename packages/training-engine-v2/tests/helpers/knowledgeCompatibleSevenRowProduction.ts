import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CONTROLLED_CANDIDATE_SCENARIOS,
  GOLDEN_PERSONAS,
  REFERENCE_EXERCISES,
  THREE_PHASE_FOUNDATION,
  deriveAlignmentPriorities,
  runCandidateRankingLab,
  type CandidateRequest,
  type ExerciseDefinition,
} from "../../src";
import {
  CANDIDATE_SCORE_COMPONENTS,
  contextualPhaseFitComponent,
} from "../../src/candidate/scoring/components";
import { buildCurrentTrunkCurationFingerprints } from "./trunkMechanicsCurationProposal";

export const SEVEN_PRODUCTION_EXERCISE_IDS = [
  "forearm-plank",
  "forearm-side-plank",
  "machine-abdominal-crunch",
  "half-kneeling-high-to-low-cable-chop",
  "farmer-carry",
  "suitcase-carry",
  "wall-supported-suitcase-march",
] as const;

export const PRE_IMPLEMENTATION_PRODUCTION_RANKING_FINGERPRINT =
  "d6a6452537e1436c3ecbbc035d9ea7a3126e772961012e4141b3302919f11782";
export const PRE_IMPLEMENTATION_COMPREHENSIVE_FINGERPRINT =
  "216ec8c86ffc4bdf2310b6a88c03d10eca982f311df4f05fcf02485daa9c72b9";

const CONTEXTUAL_COMPONENTS = CANDIDATE_SCORE_COMPONENTS.map((candidate) =>
  candidate.id === "phase_fit" ? contextualPhaseFitComponent : candidate,
);

const TEXT_OWNERSHIP = [
  ["ExerciseDefinition.name", "ENGINE_DOMAIN_IDENTITY"],
  ["ExerciseDefinition.summary", "FUTURE_KNOWLEDGE_LAYER_CANDIDATE"],
  ["ExerciseDefinition.coachingFocus", "CURRENT_COMPACT_COACHING_FALLBACK"],
  ["section suitability reasons", "ENGINE_DECISION_EXPLANATION"],
  ["phase suitability reasons", "ENGINE_DECISION_EXPLANATION"],
  ["mechanics notes", "CURATION_OR_PROVENANCE"],
  ["stress notes", "CURATION_OR_PROVENANCE"],
  ["transition notes", "CURATION_OR_PROVENANCE"],
  ["DecisionTrace reasons", "ENGINE_DECISION_EXPLANATION"],
  ["reason codes", "NOT_PUBLIC_EDUCATIONAL_CONTENT"],
  ["prescription execution standards", "ENGINE_DOMAIN_IDENTITY"],
  ["pain-response explanations", "ENGINE_DECISION_EXPLANATION"],
] as const;

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function exercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Missing production exercise ${id}.`);
  return found;
}

function phase(id: string) {
  const found = THREE_PHASE_FOUNDATION.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Missing phase ${id}.`);
  return found;
}

function compactRanking(request: CandidateRequest, contextual: boolean) {
  const result = runCandidateRankingLab(
    request,
    contextual ? { scoreComponents: CONTEXTUAL_COMPONENTS } : {},
  );
  return result.rankedCandidates.map((candidate) => ({
    exerciseId: candidate.exercise.id,
    total: candidate.total,
    phaseValue:
      candidate.components.find((component) => component.id === "phase_fit")
        ?.value ?? null,
    phaseReason:
      candidate.components.find((component) => component.id === "phase_fit")
        ?.reason ?? null,
    continuityValue:
      candidate.components.find((component) => component.id === "continuity_value")
        ?.value ?? null,
  }));
}

function comparison(id: string, request: CandidateRequest) {
  const legacy = compactRanking(request, false);
  const contextual = compactRanking(request, true);
  return {
    id,
    phaseId: request.phase.id,
    legacyWinner: legacy[0]?.exerciseId ?? null,
    contextualWinner: contextual[0]?.exerciseId ?? null,
    winnerChanged: legacy[0]?.exerciseId !== contextual[0]?.exerciseId,
    orderChanged:
      JSON.stringify(legacy.map((row) => row.exerciseId)) !==
      JSON.stringify(contextual.map((row) => row.exerciseId)),
    legacy,
    contextual,
  };
}

function goldenRequests(): readonly { readonly id: string; readonly request: CandidateRequest }[] {
  const base = CONTROLLED_CANDIDATE_SCENARIOS.find(
    (candidate) => candidate.id === "horizontal-pull-gym-neutral",
  );
  if (!base) throw new Error("Missing golden comparison base request.");
  return GOLDEN_PERSONAS.map((persona) => ({
    id: `golden:${persona.fixtureId}`,
    request: {
      ...base.request,
      id: `knowledge-compatible-golden-${persona.fixtureId}`,
      athlete: persona.athlete,
      goal: persona.athlete.primaryGoal,
      phase: phase(persona.currentState.phase.currentPhaseId),
      assessment: persona.assessment,
      alignmentPriorities: deriveAlignmentPriorities(persona.assessment).priorities,
      painAndInjury: persona.painAndInjury,
      equipment: persona.equipment,
      history: persona.history,
      candidatePool: REFERENCE_EXERCISES,
    },
  }));
}

function continuityRequests(): readonly { readonly id: string; readonly request: CandidateRequest }[] {
  const base = CONTROLLED_CANDIDATE_SCENARIOS.find(
    (candidate) => candidate.id === "horizontal-pull-gym-neutral",
  );
  if (!base) throw new Error("Missing continuity comparison base request.");
  return THREE_PHASE_FOUNDATION.map((candidatePhase) => ({
    id: `continuity:${candidatePhase.id}`,
    request: {
      ...base.request,
      id: `knowledge-compatible-continuity-${candidatePhase.id}`,
      phase: candidatePhase,
      continuity: {
        currentExerciseId: "machine-row",
        productiveExerciseIds: ["machine-row"],
        plateauedExerciseIds: [],
        failedProgressionExerciseIds: [],
        painResponseExerciseIds: [],
      },
      candidatePool: REFERENCE_EXERCISES,
    },
  }));
}

function stressSnapshot(id: string) {
  const candidate = exercise(id);
  return {
    exerciseId: id,
    jointStressTags: candidate.loading.jointStressTags,
    cautionStressTags: candidate.cautionStressTags,
    contraindicatedStressTags: candidate.contraindicatedStressTags,
    structured: (candidate.stressAnnotations ?? []).map((annotation) => ({
      tag: annotation.tag,
      exposureScope: annotation.exposureScope,
      sideScope: annotation.sideScope,
      reviewStatus: annotation.reviewStatus,
    })),
  };
}

const PRE_MIGRATION_STRESS = [
  { exerciseId: "one-arm-dumbbell-row", jointStressTags: ["loaded_hinge", "loaded_spinal_flexion", "grip_intensive"], cautionStressTags: ["loaded_hinge", "loaded_spinal_flexion", "grip_intensive"], contraindicatedStressTags: [], structured: [] },
  { exerciseId: "dumbbell-romanian-deadlift", jointStressTags: ["loaded_hinge", "loaded_spinal_flexion", "grip_intensive"], cautionStressTags: ["loaded_hinge", "loaded_spinal_flexion"], contraindicatedStressTags: ["loaded_spinal_flexion"], structured: [] },
  { exerciseId: "dumbbell-shoulder-press", jointStressTags: ["overhead_pressing", "loaded_spinal_extension"], cautionStressTags: ["overhead_pressing", "loaded_spinal_extension"], contraindicatedStressTags: [], structured: [] },
  { exerciseId: "glute-bridge", jointStressTags: ["loaded_spinal_extension"], cautionStressTags: ["loaded_spinal_extension"], contraindicatedStressTags: [], structured: [] },
  { exerciseId: "cable-pull-through", jointStressTags: ["loaded_hinge"], cautionStressTags: ["loaded_hinge"], contraindicatedStressTags: [], structured: [] },
] as const;

const PRE_MIGRATION_LONG_LEVER = [
  { exerciseId: "dead-bug", jointStressTags: ["long_lever_core"], cautionStressTags: ["long_lever_core"] },
  { exerciseId: "push-up", jointStressTags: ["horizontal_pressing", "wrist_extension_loading", "long_lever_core"], cautionStressTags: ["horizontal_pressing", "wrist_extension_loading"] },
  { exerciseId: "pallof-press", jointStressTags: ["long_lever_core"], cautionStressTags: ["long_lever_core"] },
] as const;

export function buildKnowledgeCompatibleSevenRowProductionData() {
  const controlledComparisons = CONTROLLED_CANDIDATE_SCENARIOS.map((candidate) =>
    comparison(`controlled:${candidate.id}`, candidate.request),
  );
  const goldenComparisons = goldenRequests().map((candidate) =>
    comparison(candidate.id, candidate.request),
  );
  const continuityComparisons = continuityRequests().map((candidate) =>
    comparison(candidate.id, candidate.request),
  );
  const allComparisons = [
    ...controlledComparisons,
    ...goldenComparisons,
    ...continuityComparisons,
  ];
  const activationFailures = allComparisons
    .filter((row) => row.winnerChanged)
    .filter((row) => {
      const winner = row.contextual.find(
        (candidate) => candidate.exerciseId === row.contextualWinner,
      );
      return winner?.phaseValue === null;
    })
    .map((row) => ({
      scenarioId: row.id,
      legacyWinner: row.legacyWinner,
      contextualWinner: row.contextualWinner,
      reason: "Winner changed without an accepted contextual phase component on the new winner.",
    }));
  const phaseAnnotations = REFERENCE_EXERCISES.flatMap((candidate) =>
    (candidate.phaseSuitabilityAnnotations ?? []).map((annotation) => ({
      annotationId: annotation.annotationId,
      exerciseId: annotation.exerciseId,
      phaseId: annotation.phaseId,
      reviewStatus: annotation.reviewStatus,
      suitability: annotation.suitability,
      scope: annotation.scope,
      provenance: annotation.provenance,
    })),
  );
  const postMigrationStress = PRE_MIGRATION_STRESS.map((row) =>
    stressSnapshot(row.exerciseId),
  );
  const postMigrationLongLever = PRE_MIGRATION_LONG_LEVER.map((row) =>
    stressSnapshot(row.exerciseId),
  );
  const sevenRows = SEVEN_PRODUCTION_EXERCISE_IDS.map(exercise);
  const behavior = buildCurrentTrunkCurationFingerprints();
  const phasePayload = {
    policyId: "CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN",
    productionActivated: false,
    activationFailures,
    comparisons: allComparisons,
    annotations: phaseAnnotations,
  };
  const stressPayload = {
    before: PRE_MIGRATION_STRESS,
    after: postMigrationStress,
  };
  const longLeverPayload = {
    before: PRE_MIGRATION_LONG_LEVER,
    after: postMigrationLongLever,
  };
  const catalogPayload = sevenRows;
  const supportPayload = sevenRows.map((candidate) => ({
    exerciseId: candidate.id,
    support: candidate.mechanics?.support ?? null,
    resistancePath: candidate.mechanics?.resistancePath ?? null,
  }));
  const rolePoolPayload = sevenRows.map((candidate) => ({
    exerciseId: candidate.id,
    movementRoles: candidate.movementRoles,
    trainingRoles: candidate.trainingRoles,
    sections: Object.keys(candidate.sectionSuitability).sort(),
  }));
  const knowledgePayload = {
    stableExerciseIds: SEVEN_PRODUCTION_EXERCISE_IDS,
    canonicalCatalogCount: REFERENCE_EXERCISES.length,
    canonicalCatalogCountOfSevenIds: REFERENCE_EXERCISES.filter((candidate) =>
      SEVEN_PRODUCTION_EXERCISE_IDS.includes(
        candidate.id as (typeof SEVEN_PRODUCTION_EXERCISE_IDS)[number],
      ),
    ).length,
    libraryImplemented: false,
    knowledgeLayerImplemented: false,
    secondCatalogCreated: false,
    coachingRailImplemented: false,
    uiImplemented: false,
    engineKnowledgeDependency: false,
    canonicalIdentitySeam: "ExerciseDefinition.id",
    illustrativeAdapter: "resolveExerciseKnowledge({ exerciseId, context, reasonCodes?, mechanicsIds?, stressTags? })",
    textOwnership: TEXT_OWNERSHIP,
    coachingFocus: sevenRows.map((candidate) => ({
      exerciseId: candidate.id,
      values: candidate.coachingFocus,
    })),
  };

  return {
    classification: "SEVEN_ROWS_PRODUCTION_PHASE_ACTIVATION_GATE_FAILED",
    catalogSizeBefore: 30,
    catalogSizeAfter: REFERENCE_EXERCISES.length,
    controlledComparisons,
    goldenComparisons,
    continuityComparisons,
    activationFailures,
    productionContextualPhaseActivated: false,
    phaseFingerprint: hash(phasePayload),
    stressMigrationFingerprint: hash(stressPayload),
    longLeverMigrationFingerprint: hash(longLeverPayload),
    sevenRowCatalogFingerprint: hash(catalogPayload),
    supportStanceFingerprint: hash(supportPayload),
    roleCandidatePoolFingerprint: hash(rolePoolPayload),
    knowledgeCompatibilityFingerprint: hash(knowledgePayload),
    productionRankingBefore: PRE_IMPLEMENTATION_PRODUCTION_RANKING_FINGERPRINT,
    productionRankingAfter: behavior.productionRanking,
    comprehensiveBefore: PRE_IMPLEMENTATION_COMPREHENSIVE_FINGERPRINT,
    comprehensiveAfter: behavior.comprehensiveBehavior,
    fullCatalogFingerprint: behavior.referenceCatalog,
    phaseAnnotations,
    stressBefore: PRE_MIGRATION_STRESS,
    stressAfter: postMigrationStress,
    longLeverBefore: PRE_MIGRATION_LONG_LEVER,
    longLeverAfter: postMigrationLongLever,
    knowledgePayload,
  } as const;
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(String).join(" | ")} |`),
  ].join("\n");
}

export function renderKnowledgeCompatibleSevenRowProductionReport(
  data = buildKnowledgeCompatibleSevenRowProductionData(),
): string {
  const changes = [
    ...data.controlledComparisons,
    ...data.goldenComparisons,
    ...data.continuityComparisons,
  ].filter((row) => row.orderChanged);
  return [
    "# Knowledge-Compatible Seven-Row Production Report",
    "",
    `Classification: **${data.classification}**.`,
    "",
    `Catalog size: ${data.catalogSizeBefore} -> ${data.catalogSizeAfter}. Contextual production phase activated: **${data.productionContextualPhaseActivated}**.`,
    "",
    "## Phase Dual Run",
    "",
    table(
      ["Scenario", "Legacy winner", "Contextual winner", "Winner changed", "Order changed"],
      changes.map((row) => [row.id, row.legacyWinner, row.contextualWinner, row.winnerChanged, row.orderChanged]),
    ),
    "",
    "Activation failures:",
    ...data.activationFailures.map((failure) =>
      `- ${failure.scenarioId}: ${failure.legacyWinner} -> ${failure.contextualWinner}. ${failure.reason}`,
    ),
    "",
    "## Fingerprints",
    "",
    table(
      ["Contract", "Fingerprint"],
      [
        ["Phase dual-run and annotations", data.phaseFingerprint],
        ["Current-row stress migration", data.stressMigrationFingerprint],
        ["Long-lever migration", data.longLeverMigrationFingerprint],
        ["Seven-row catalog", data.sevenRowCatalogFingerprint],
        ["Seven-row support/stance", data.supportStanceFingerprint],
        ["New role candidate pools", data.roleCandidatePoolFingerprint],
        ["Knowledge compatibility", data.knowledgeCompatibilityFingerprint],
        ["Full production catalog", data.fullCatalogFingerprint],
      ],
    ),
    "",
    `Production ranking: ${data.productionRankingBefore} -> ${data.productionRankingAfter}.`,
    "",
    `Comprehensive behavior: ${data.comprehensiveBefore} -> ${data.comprehensiveAfter}.`,
    "",
    "The seven rows are production catalog knowledge, not session composition. No Library, Knowledge Layer, Coaching Rail, UI, second catalog, automatic substitution, automatic progression, or workout-length policy is implemented.",
    "",
  ].join("\n");
}

if (process.argv[1]?.endsWith("knowledgeCompatibleSevenRowProduction.ts")) {
  const outputPath = join(
    process.cwd(),
    "../../docs/training-engine-v2/KNOWLEDGE_COMPATIBLE_SEVEN_ROW_PRODUCTION_REPORT.md",
  );
  writeFileSync(
    outputPath,
    renderKnowledgeCompatibleSevenRowProductionReport(),
  );
}
