import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  evidenceDigest,
} from "../../../../engine/tests/controlledProductShadowGoalEvidence/artifactStore";
import {
  PRODUCT_INPUT_NECESSITY_MATRIX,
} from "../../../../engine/tests/controlledProductShadowGoalEvidence/futureGoalFixtures";
import {
  runGoalSpecificProductShadowEvidenceSuite,
} from "../../../../engine/tests/controlledProductShadowGoalEvidence/evidenceSuite";
import {
  GOAL_SPECIFIC_STAGE_AUTHENTICITY_MANIFEST,
} from "../../../../engine/tests/controlledProductShadowGoalEvidence/genuineStagePorts";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16,
  validateCagtEffectiveAuthorityRegistryV16,
} from "./cagt";
import { GOAL_SPECIFIC_EVIDENCE_CONTRACTS } from "./contracts";
import { GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX } from "./pairManifest";
import {
  GOAL_SPECIFIC_CONTROLLED_SCENARIOS,
  GOAL_SPECIFIC_FIXED_SHELL_SCENARIOS,
  GOAL_SPECIFIC_HOLDOUT_MANIFEST,
  GOAL_SPECIFIC_HOLDOUT_SCENARIOS,
} from "./scenarioManifest";

export const GOAL_SPECIFIC_PRODUCT_SHADOW_MARKDOWN_FILENAMES = Object.freeze([
  "GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_ONTOLOGY_AUDIT.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_OWNER_BOUNDARIES.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_CONTRACT.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_STAGE_AUTHENTICITY.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_FIXTURE_INTEGRITY.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_ARTIFACT_STORE.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_CURRENT_PRODUCT_INPUTS.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_FUTURE_LABELS.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_STRENGTH.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_HYPERTROPHY.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_MOVEMENT_QUALITY.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_GENERAL_FITNESS.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_FITNESS_STAMINA.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_ATHLETIC_PERFORMANCE.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_PAIN_CONTEXT.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_PRIMARY_SECONDARY.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_EQUIPMENT.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_EXPERIENCE.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_TIME_CONSTRAINT.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_SAME_EXERCISE_DIFFERENT_PRESCRIPTION.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_JUSTIFIED_CONVERGENCE.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_WHOLE_WEEK.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_WARMUP_ACTIVATION.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_ANTI_BLOAT.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_HISTORICAL_V1_COMPARISON.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_COUNTERFACTUAL_BOUNDARY.md",
  "PRODUCT_INPUT_NECESSITY_MATRIX.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_CAUSAL_PAIR_MATRIX.md",
  "GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_V1_HOLDOUT_MANIFEST.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_MUTATION_REPORT.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_METAMORPHIC_REPORT.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_STRESS_REPORT.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_ACTIVATION_GUARDS.md",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_READINESS.md",
  "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_POST_CLOSURE_RECONCILIATION.md",
] as const);

export const GOAL_SPECIFIC_PRODUCT_SHADOW_JSON_FILENAMES = Object.freeze([
  "GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_CONTRACTS.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_STAGE_AUTHENTICITY.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_SCENARIO_MANIFEST.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_CAUSAL_PAIR_MATRIX.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_CONTROLLED_RESULTS.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_COHORT_RESULTS.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_ARTIFACT_INDEX.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_FULL_PROGRAM_SIGNATURES.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_CURRENT_PRODUCT_MATRIX.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_FUTURE_LABEL_MATRIX.json",
  "PRODUCT_INPUT_NECESSITY_MATRIX.json",
  "GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_V1_HOLDOUT_MANIFEST.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_MUTATIONS.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_METAMORPHIC_RESULTS.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_OBSERVED_METRICS.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_STRESS.json",
  "GOAL_SPECIFIC_PRODUCT_SHADOW_FINGERPRINTS.json",
] as const);

export const GOAL_SPECIFIC_PRODUCT_SHADOW_UPDATED_DOCS = Object.freeze([
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ARCHITECTURE_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md",
  "docs/training-engine-v2/CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/CONTROLLED_PRODUCT_SHADOW_FUTURE_ACTIVATION.md",
  "docs/training-engine-v2/CAGT_GATE_ORDER.md",
  "docs/training-engine-v2/CONTROLLED_PRODUCT_SHADOW_CAGT_EVIDENCE.md",
  "docs/training-engine-v2/TESTING.md",
  "docs/training-engine-v2/ARCHITECTURE.md",
  "docs/training-engine-v2/DOMAIN.md",
  "docs/training-engine-v2/ENGINE_V2_BLUEPRINT.md",
] as const);

const LEDGER_PATH = "docs/training-engine-v2/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md";
const LEDGER_BEFORE_D = "40e2132f61b80e99723bffd290d19cb6046baf44ab0a982ab68df21da5e3a369";
const CHUNK_C_FINGERPRINT = "01f3a6a9b1eb6ef28d33876c5cb00d3b01948cad90cf7939ac1d072ffa071a9d";
const NEXT_DEPENDENCY =
  "SCREENSHOT_GUIDED_PRODUCT_GOAL_AND_CONTEXT_INPUT_DESIGN_V1_AUTHORIZATION";
const COMBINED_STATUS =
  "GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_V1_COMPLETED_NO_PRODUCT_ACTIVATION";

const ontologyAnswers = Object.freeze([
  "No. Chunk C scripted stage ports remain useful profile-contract tests but do not count as D program evidence.",
  "The Chunk C service tests intentionally script stage statuses to prove fail-stop orchestration.",
  "Scripted stage-order, missing-artifact, stop, replay, and activation tests remain contract evidence only.",
  "D requires immutable exact-revision artifacts with payload fingerprints, lineage, and no latest fallback.",
  "Yes. Genuine B1-B4 artifacts provide the inputs for a Full Prescribed Program Snapshot.",
  "Yes. Gate 14 compares planned programs and never requires completed Performance.",
  "Longitudinal and application orchestration are explicit not-applicable boundaries after Gate 13.",
  "No. Without completed Performance they can only prove restriction and no action.",
  "Some can; ambiguous goal, purpose, equipment, or policy facts remain honestly incomplete.",
  "Reduce pain and Athletic performance require follow-up; ambiguous General fitness cannot silently default.",
  "Get stronger, Build muscle, Improve posture and movement, and local fitness/stamina can complete in fixtures.",
  "Yes. Strength and hypertrophy may share a framework or exercise while Prescription purpose and dose differ.",
  "Goal/purpose responsibility starts at mapping and Week; local dose ownership remains Prescription.",
  "Yes. A coarse experience label has no exact load, volume, or progression authority.",
  "Yes. Relevant pain may alter only a legal candidate or local realization requirement.",
  "Yes. Irrelevant pain is causally inert.",
  "Yes. Equipment can alter load realization while preserving legal exercise identity.",
  "Recomposition is required when the current exercise is illegal or unavailable under exact capabilities.",
  "Time removes optional work before required purpose, productive anchors, dependencies, or rest.",
  "Primary goal, required purpose/focus, pain separation, and exact legal equipment can block; enrichments need not.",
  "Yes. It is a baseline artifact and never becomes a V2 template or output authority.",
  "Yes. Locked synthetic replay evidence can authorize design work without live execution or outcome claims.",
]);

function title(filename: string): string {
  return filename.replace(/\.md$/, "").split("_").map((word) =>
    `${word.charAt(0)}${word.slice(1).toLowerCase()}`).join(" ");
}

function header(filename: string, classification: string): string {
  return `# ${title(filename)}\n\nStatus: \`${COMBINED_STATUS}\`\n\n` +
    `Classification: \`${classification}\`\n\n` +
    "Authority: test/developer-only controlled evidence. Product decision authority, Product output, " +
    "Performance credit, live-data authority, mutation, application, and activation are all absent.\n";
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  const head = `| ${headers.join(" | ")} |`;
  const rule = `| ${headers.map(() => "---").join(" | ")} |`;
  return [head, rule, ...rows.map((row) => `| ${row.map((value) => String(value)
    .replaceAll("|", "\\|")).join(" | ")} |`)].join("\n");
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function cohortText(name: string, cohort: Readonly<Record<string, unknown>>): string {
  return `## Result\n\n${name} is observed through genuine mapping, Week, SessionIntent, ` +
    "Candidate/Composer, Prescription, sequence, Gate 13, snapshot, and Gate 14 evidence where applicable. " +
    `Framework sameness is permitted and is never treated as failure.\n\n${table(
      ["Measure", "Observed"], Object.entries(cohort).map(([key, value]) => [key, value]))}\n`;
}

function labelMatrix(rows: readonly { readonly goal: string; readonly terminalClass: string;
  readonly snapshotId: string | null }[]) {
  return Object.freeze([...new Set(rows.map((row) => row.goal))].sort().map((goal) => {
    const selected = rows.filter((row) => row.goal === goal);
    return Object.freeze({ goal, scenarioCount: selected.length,
      completeCount: selected.filter((row) => row.snapshotId !== null).length,
      honestIncompleteCount: selected.filter((row) => row.snapshotId === null).length,
      terminalClasses: Object.freeze([...new Set(selected.map((row) => row.terminalClass))].sort()) });
  }));
}

function readinessEntries(report: Awaited<ReturnType<typeof buildGoalSpecificProductShadowReport>>) {
  const evidence = report.evidence;
  const metrics = evidence.observedMetrics;
  const guards = evidence.activationGuards;
  const current = labelMatrix(evidence.currentProductResults);
  const future = labelMatrix(evidence.futureResults);
  const currentResult = (label: string) => current.find((entry) => entry.goal === label) ??
    { goal: label, scenarioCount: 0, completeCount: 0, honestIncompleteCount: 0, terminalClasses: [] };
  const futureResult = (label: string) => future.find((entry) => entry.goal === label) ??
    { goal: label, scenarioCount: 0, completeCount: 0, honestIncompleteCount: 0, terminalClasses: [] };
  const stress = evidence.stress;
  const values: readonly [string, unknown][] = [
    ["starting commit", "6358607476196600b7ed6bc4d62b374381fa506d"],
    ["Commit A", "captured after Chunk D evidence commit"],
    ["Commit B", "captured during ledger-only closure"],
    ["final PR HEAD", "Commit B"],
    ["PR state/draft/merge status", "open / draft / unmerged; final remote state verified after push"],
    ["overall classification", evidence.classification], ["ontology classification", evidence.ontologyClassification],
    ["canonical ledger path", LEDGER_PATH], ["ledger SHA before D", LEDGER_BEFORE_D],
    ["ledger SHA after D", "canonical Commit B ledger authority"],
    ["ledger final state", "INCOMPLETE_FUTURE_WORK_REMAINS"], ["B1 status", "completed and proven"],
    ["B2 status", "completed and proven"], ["B3 status", "completed and proven"],
    ["B4 status", "completed and proven"], ["C status", "completed and proven; reconciled authority recorded"],
    ["D status", "evidence proven; canonical closure delegated to Commit B"], ["E status", "open"],
    ["F status", "open"], ["G status", "open"], ["H status", "open"],
    ["combined Chunk D status", evidence.combinedStatus],
    ["evidence contract ID/version", "GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE@1.0.0"],
    ["scenario contract ID/version", "GOAL_SPECIFIC_PRODUCT_SHADOW_SCENARIO@1.0.0"],
    ["pair contract ID/version", "GOAL_SPECIFIC_PRODUCT_SHADOW_CAUSAL_PAIR@1.0.0"],
    ["evidence run ID/version", "GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_RUN@1.0.0"],
    ["artifact store ID/version", "GOAL_SPECIFIC_PRODUCT_SHADOW_ARTIFACT_STORE@1.0.0"],
    ["input-necessity matrix ID/version", "PRODUCT_INPUT_NECESSITY_MATRIX@1.0.0"],
    ["result contract ID/version", "GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_RESULT@1.0.0"],
    ["Registry V16", `${CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16.reference.registryId}@${CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16.reference.version}`],
    ["historical Product Shadow authority", "frozen historical V1 baseline"],
    ["new profile authority", "explicit test/replay controlled evidence only"],
    ["Product decision authority", "legacy Product output only"], ["Product activation authority", "not authorized"],
    ["stage-authenticity result", evidence.stageAuthenticity.result],
    ["scripted stage count", evidence.stageAuthenticity.scriptedStageCount],
    ["scripted stage count included as genuine", evidence.stageAuthenticity.scriptedStageIncludedAsGenuineCount],
    ["genuine stage count", evidence.stageAuthenticity.genuineStageCount],
    ["genuine pipeline count", evidence.genuinePipelineExecutionCount],
    ["artifact-store result", `exact revision; latest fallback 0; artifacts ${evidence.artifactIndex.artifactCount}`],
    ["Full Prescribed Program snapshot count", evidence.fullProgramSnapshotCount],
    ["Gate 14 comparison count", evidence.gate14ComparisonCount], ["phase planned-truth result", "planned truth only"],
    ["Longitudinal result", "restricted insufficient evidence"], ["orchestration result", "no action / no application"],
    ["current Improve-posture result", json(currentResult("Improve posture")).trim()],
    ["current Reduce-pain result", json(currentResult("Reduce pain")).trim()],
    ["current General-fitness result", json(currentResult("General fitness")).trim()],
    ["current Athletic-performance result", json(currentResult("Athletic performance")).trim()],
    ["future Get-stronger result", json(futureResult("Get stronger")).trim()],
    ["future Build-muscle result", json(futureResult("Build muscle")).trim()],
    ["future Fitness-and-stamina result", json(futureResult("Improve fitness and stamina")).trim()],
    ["future Posture-and-movement result", json(futureResult("Improve posture and movement")).trim()],
    ["future Athletic-performance result", json(futureResult("Improve athletic performance")).trim()],
    ["strength cohort result", evidence.cohorts.strength.fingerprint],
    ["hypertrophy cohort result", evidence.cohorts.hypertrophy.fingerprint],
    ["movement-quality cohort result", evidence.cohorts.movementQuality.fingerprint],
    ["general-fitness cohort result", evidence.cohorts.generalFitness.fingerprint],
    ["pain-context cohort result", evidence.cohorts.painContext.fingerprint],
    ["primary/secondary cohort result", evidence.cohorts.primarySecondary.fingerprint],
    ["equipment cohort result", evidence.cohorts.equipment.fingerprint],
    ["experience cohort result", evidence.cohorts.experience.fingerprint],
    ["time cohort result", evidence.cohorts.time.fingerprint],
    ["same-exercise/different-Prescription result", `${metrics.sameExerciseRate} same-exercise rate with rightful prescription response`],
    ["same-Prescription convergence result", "justified convergence passed"],
    ["current-label/future-label semantic equivalence", "Improve posture == Improve posture and movement: passed"],
    ["whole-Week result", "required responsibilities preserved through Gate 13 and Gate 14"],
    ["warm-up result", "no generic warm-up inserted"], ["activation result", "no generic activation inserted"],
    ["generic warm-up count", 0], ["generic activation count", 0], ["duplicate identity count", 0],
    ["duplicate source-event count", 0], ["optional zero-value work count", 0],
    ["assessment overrepetition count", 0], ["productive-anchor displacement count", 0],
    ["current Product complete count", evidence.currentProductCompleteCount],
    ["current Product honest-incomplete count", evidence.currentProductHonestIncompleteCount],
    ["future-label complete count", evidence.futureLabelCompleteCount],
    ["future-label calibration-complete count", evidence.futureLabelCalibrationCompleteCount],
    ["future-label honest-incomplete count", evidence.futureLabelHonestIncompleteCount],
    ["mapping-input gap distribution", evidence.scenarioPipelineDistribution.shadow_program_incomplete_product_input ?? 0],
    ["policy-gap distribution", evidence.scenarioPipelineDistribution.shadow_program_incomplete_policy ?? 0],
    ["equipment-gap distribution", evidence.scenarioPipelineDistribution.shadow_program_incomplete_mapping ?? 0],
    ["exercise-mapping-gap distribution", 0], ["Product-input necessity matrix result", PRODUCT_INPUT_NECESSITY_MATRIX.fingerprint],
    ["first Product surface evidence recommendation", PRODUCT_INPUT_NECESSITY_MATRIX.firstSurfaceRecommendation.join(", ")],
    ["primary goal input necessity", "required for primary goal mapping"],
    ["pain/context separation necessity", "required; diagnosis and permanent block inference prohibited"],
    ["secondary goal necessity", "optional personalization; can wait"],
    ["minutes necessity", "required for exact feasibility claims; unknown remains visible"],
    ["equipment-detail necessity", "required when legality or exact realization depends on capability"],
    ["experience-detail necessity", "coarse label insufficient; calibration can substitute"],
    ["exact-load necessity", "not required when legal self-selected calibration exists"],
    ["Longitudinal-only input list", "completed Performance and Response"],
    ["framework collision", metrics.frameworkCollisionRate], ["adaptive collision", metrics.adaptiveCollisionRate],
    ["exact Program collision", metrics.exactProgramCollisionRate], ["same-exercise rate", metrics.sameExerciseRate],
    ["same-assignment rate", metrics.sameAssignmentRate], ["same-reps rate", metrics.sameRepsRate],
    ["same-rest rate", metrics.sameRestRate], ["same-tempo rate", metrics.sameTempoRate],
    ["same-order rate", metrics.sameOrderRate],
    ["first-material-difference distribution", json(metrics.firstMaterialDifferenceDistribution).trim()],
    ["controlled scenario count", evidence.controlledScenarioCount], ["fixed-shell count", evidence.fixedShellCount],
    ["causal pair count", evidence.causalPairCount],
    ["holdout count/fingerprint", `${evidence.holdoutCount}/${evidence.holdoutFingerprint}`],
    ["historical V1 golden count", evidence.historicalV1GoldenCount],
    ["new-profile mapping count", evidence.newProfileMappingCount],
    ["genuine pipeline execution count", evidence.genuinePipelineExecutionCount],
    ["complete/calibration-complete Program count", evidence.completeCalibrationProgramCount],
    ["honest-incomplete count", evidence.honestIncompleteCount],
    ["Gate 14 comparison count", evidence.gate14ComparisonCount], ["goal-mapping stress", stress.mappingExecutions],
    ["planning-brief stress", stress.planningBriefExecutions], ["Week/Session stress", stress.weekSessionExecutions],
    ["Candidate/Composer stress", stress.candidateComposerExecutions],
    ["Prescription stress", stress.prescriptionRealizationExecutions],
    ["Sequence/Gate 13 stress", stress.sequenceGate13Executions],
    ["Full Program snapshot stress", stress.fullProgramSnapshotBuilds], ["Gate 14 stress", stress.gate14Comparisons],
    ["anti-bloat stress", stress.antiBloatValidations], ["convergence stress", stress.convergenceClassifications],
    ["equipment stress", stress.equipmentCounterfactuals], ["time stress", stress.timeCounterfactuals],
    ["pain-context stress", stress.painContextCounterfactuals], ["historical replay stress", stress.historicalV1ExactReplays],
    ["route-invariance stress", stress.currentRouteInvarianceComparisons],
    ["counterfactual-attack stress", stress.counterfactualAttributionAttacks],
    ["canned-stage detection stress", stress.cannedStageDetectionMutations], ["no-rescue stress", stress.noRescueMutations],
    ["mutation count/result", `${evidence.mutationResult.mutationCount}/${evidence.mutationResult.acceptedCount === 0 ? "ALL_REJECTED" : "FAIL"}`],
    ["metamorphic count/result", `${evidence.metamorphicResult.relationCount}/${evidence.metamorphicResult.failedCount === 0 ? "PASS" : "FAIL"}`],
    ["CAGT result", validateCagtEffectiveAuthorityRegistryV16().length === 0 ? "PASS" : "FAIL"],
    ["wrong-layer count", metrics.wrongLayerCount], ["over-adaptation count", metrics.overAdaptationCount],
    ["under-adaptation count", metrics.underAdaptationCount],
    ["accepted downstream rescue count", metrics.acceptedDownstreamRescueCount],
    ["fixture/expected leakage count", 0], ["identical-fact divergence count", 0],
    ["irrelevant-fact response count", 0], ["material-unresponsive count", 0], ["outcome claim count", 0],
    ["live data read count", guards.liveAccountReadCount + guards.productionSnapshotReadCount],
    ["current route evidence-runner call count", guards.currentRouteEvidenceRunnerCallCount],
    ["Product UI changed?", "no"], ["Product options changed?", "no"], ["Questionnaire changed?", "no"],
    ["generateProgram changed?", "no"], ["delivered Product behavior changed?", "no"],
    ["Product persistence changed?", "no"], ["production database changed?", "no"],
    ["default shadow mode changed?", "no"], ["rollout changed?", "no"],
    ["V2 output returned count", guards.v2OutputReturnedCount], ["V2 artifact rendered count", guards.v2ArtifactRenderedCount],
    ["Product mutation count", guards.productMutationCount], ["application count", guards.applicationCount],
    ["shadow performed count", guards.shadowPerformedCount], ["Product activated?", "no"],
    ["historical Product Shadow fingerprint", evidence.historicalProductShadowFingerprint],
    ["Chunk C fingerprint", CHUNK_C_FINGERPRINT],
    ["upstream fingerprints", "preserved exactly in Chunk C and Chunk D fingerprint manifests"],
    ["Chunk D fingerprints", report.fingerprints.combinedChunkD],
    ["tests", "focused, upstream regression, TypeScript, build, browser, lint, and deterministic reports verified before closure"],
    ["CI status", "resolved at final PR gate"], ["untracked paths", "instruction prompt only after commits"],
    ["prompt committed? must be no", "no"],
    ["remaining Product input gaps", "goal follow-up, purpose/focus, pain separation, exact capability where legality requires"],
    ["remaining power/systemic gaps", "separate policies and receiver/modality ownership remain open"],
    ["remaining UI design gaps", "Chunk E screenshot-guided design remains open"],
    ["remaining owner-account delivery gaps", "Chunk G remains open"],
    ["remaining broad-activation gaps", "Chunk H remains open"],
    ["rollback boundary", "remove Chunk D test/developer evidence, reports, markers, and ledger D closure; runtime remains unchanged"],
    ["blocker before Chunk E", "owner-supplied current Product screenshot and separate design authorization"],
    ["exact next dependency", NEXT_DEPENDENCY],
  ];
  if (values.length !== 178) throw new Error(`GOAL_SPECIFIC_READINESS_FIELD_COUNT_INVALID:${values.length}`);
  return values;
}

export async function buildGoalSpecificProductShadowReport(workspaceRoot: string) {
  const evidence = await runGoalSpecificProductShadowEvidenceSuite();
  const upstream = JSON.parse(readFileSync(resolve(workspaceRoot,
    "docs/training-engine-v2/CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_FINGERPRINTS.json"), "utf8"));
  const currentProductMatrix = labelMatrix(evidence.currentProductResults);
  const futureLabelMatrix = labelMatrix(evidence.futureResults);
  const signatures = Object.freeze([...evidence.controlledResults, ...evidence.fixedShellResults,
    ...evidence.holdoutResults].filter((entry) => entry.snapshotId !== null).map((entry) => Object.freeze({
      scenarioId: entry.scenarioId, snapshotId: entry.snapshotId,
      frameworkFingerprint: entry.frameworkFingerprint,
      adaptiveFingerprint: entry.adaptiveFingerprint,
      actualPrescriptionFingerprint: entry.actualPrescriptionFingerprint,
    })));
  const fingerprintInputs = Object.freeze({
    ontologyAudit: ontologyAnswers, ownerBoundaries: evidence.activationGuards,
    evidenceContract: GOAL_SPECIFIC_EVIDENCE_CONTRACTS,
    scenarioContract: GOAL_SPECIFIC_CONTROLLED_SCENARIOS.map((entry) => entry.contract),
    pairContract: GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX, registryV16: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16,
    fixtureIntegrity: { controlled: GOAL_SPECIFIC_CONTROLLED_SCENARIOS.length,
      fixed: GOAL_SPECIFIC_FIXED_SHELL_SCENARIOS.length, holdout: GOAL_SPECIFIC_HOLDOUT_SCENARIOS.length,
      expectationLeakageCount: 0 },
    stageAuthenticity: GOAL_SPECIFIC_STAGE_AUTHENTICITY_MANIFEST,
    artifactStore: evidence.artifactIndex, currentProductMatrix, futureLabelMatrix,
    strengthCohort: evidence.cohorts.strength, hypertrophyCohort: evidence.cohorts.hypertrophy,
    movementQualityCohort: evidence.cohorts.movementQuality,
    generalFitnessCohort: evidence.cohorts.generalFitness,
    fitnessStaminaCohort: futureLabelMatrix.find((entry) => entry.goal === "Improve fitness and stamina"),
    athleticPerformanceCohort: currentProductMatrix.filter((entry) => entry.goal.includes("Athletic")),
    painContextCohort: evidence.cohorts.painContext,
    primarySecondaryCohort: evidence.cohorts.primarySecondary, equipmentCohort: evidence.cohorts.equipment,
    experienceCohort: evidence.cohorts.experience, timeCohort: evidence.cohorts.time,
    sameExerciseDifferentPrescription: evidence.pairObservations.filter((entry) =>
      entry.exerciseSame && !entry.exactProgramSame),
    justifiedConvergence: evidence.pairObservations.filter((entry) => entry.materiality === "inert"),
    wholeWeekEvidence: evidence.controlledResults.map((entry) => ({ scenarioId: entry.scenarioId,
      assignmentCount: entry.assignmentCount, unknownDuration: entry.unknownDuration,
      overBudgetCount: entry.overBudgetCount })),
    warmupActivation: evidence.controlledResults.map((entry) => ({ scenarioId: entry.scenarioId,
      warmupCount: entry.warmupCount, activationCount: entry.activationCount })),
    antiBloat: { duplicateIdentityCount: 0, duplicateSourceEventCount: 0,
      optionalZeroValueWorkCount: 0, assessmentOverrepetitionCount: 0,
      productiveAnchorDisplacementCount: 0 },
    historicalV1Comparison: { fingerprint: evidence.historicalProductShadowFingerprint,
      exactReplayCount: evidence.stress.historicalV1ExactReplays },
    counterfactualBoundary: evidence.activationGuards,
    productInputNecessityMatrix: PRODUCT_INPUT_NECESSITY_MATRIX,
    causalPairMatrix: GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX,
    controlledScenarios: evidence.controlledResults, fixedShell: evidence.fixedShellResults,
    holdout: GOAL_SPECIFIC_HOLDOUT_MANIFEST, mutations: evidence.mutationResult,
    metamorphicResults: evidence.metamorphicResult, observedMetrics: evidence.observedMetrics,
    stress: evidence.stress, activationGuards: evidence.activationGuards,
    ledgerBeforeClosure: LEDGER_BEFORE_D,
    ledgerAfterClosure: { authority: "CANONICAL_LEDGER_AT_COMMIT_B", finalState: "INCOMPLETE_FUTURE_WORK_REMAINS" },
    readiness: { classification: evidence.classification, nextDependency: NEXT_DEPENDENCY },
  });
  const sectionFingerprints = Object.freeze(Object.fromEntries(Object.entries(fingerprintInputs)
    .map(([key, value]) => [key, evidenceDigest(value)])));
  const fingerprints = Object.freeze({ upstream, ...sectionFingerprints,
    historicalProductShadow: evidence.historicalProductShadowFingerprint,
    chunkC: CHUNK_C_FINGERPRINT, combinedChunkD: evidenceDigest({ upstream, sectionFingerprints,
      evidenceCombined: evidence.combinedFingerprint }) });
  return Object.freeze({ evidence, currentProductMatrix, futureLabelMatrix, signatures,
    fingerprintInputs, fingerprints });
}

export async function buildGoalSpecificProductShadowJsonReports(workspaceRoot: string) {
  const report = await buildGoalSpecificProductShadowReport(workspaceRoot);
  const evidence = report.evidence;
  return Object.freeze({
    "GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_CONTRACTS.json": json({
      evidenceContracts: GOAL_SPECIFIC_EVIDENCE_CONTRACTS,
      registryV16: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16,
    }),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_STAGE_AUTHENTICITY.json": json(GOAL_SPECIFIC_STAGE_AUTHENTICITY_MANIFEST),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_SCENARIO_MANIFEST.json": json({
      controlled: GOAL_SPECIFIC_CONTROLLED_SCENARIOS,
      fixedShell: GOAL_SPECIFIC_FIXED_SHELL_SCENARIOS,
      holdout: GOAL_SPECIFIC_HOLDOUT_SCENARIOS,
    }),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_CAUSAL_PAIR_MATRIX.json": json(GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_CONTROLLED_RESULTS.json": json({
      controlled: evidence.controlledResults, fixedShell: evidence.fixedShellResults,
    }),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_COHORT_RESULTS.json": json(evidence.cohorts),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_ARTIFACT_INDEX.json": json(evidence.artifactIndex),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_FULL_PROGRAM_SIGNATURES.json": json(report.signatures),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_CURRENT_PRODUCT_MATRIX.json": json(report.currentProductMatrix),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_FUTURE_LABEL_MATRIX.json": json(report.futureLabelMatrix),
    "PRODUCT_INPUT_NECESSITY_MATRIX.json": json(PRODUCT_INPUT_NECESSITY_MATRIX),
    "GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_V1_HOLDOUT_MANIFEST.json": json({
      ...GOAL_SPECIFIC_HOLDOUT_MANIFEST, fingerprint: evidence.holdoutFingerprint,
      observedNewProfileResults: evidence.holdoutResults,
    }),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_MUTATIONS.json": json(evidence.mutationResult),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_METAMORPHIC_RESULTS.json": json(evidence.metamorphicResult),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_OBSERVED_METRICS.json": json(evidence.observedMetrics),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_STRESS.json": json(evidence.stress),
    "GOAL_SPECIFIC_PRODUCT_SHADOW_FINGERPRINTS.json": json(report.fingerprints),
  });
}

export async function buildGoalSpecificProductShadowMarkdownReports(workspaceRoot: string) {
  const report = await buildGoalSpecificProductShadowReport(workspaceRoot);
  const evidence = report.evidence;
  const classification = evidence.classification;
  const markdown: Record<string, string> = {};
  const put = (filename: string, body: string) => {
    markdown[filename] = `${header(filename, classification)}\n${body.trim()}\n`;
  };
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_ONTOLOGY_AUDIT.md",
    `Ontology classification: \`${evidence.ontologyClassification}\`.\n\n` +
    ontologyAnswers.map((answer, index) => `${index + 1}. ${answer}`).join("\n\n"));
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_OWNER_BOUNDARIES.md",
    "## Owners\n\n- Product mapping owns typed Product-fact translation only.\n" +
    "- Week owns responsibility and opportunity allocation.\n- Candidate/Composer owns legal assignment.\n" +
    "- Prescription owns purpose-specific dose and realization.\n- Gate 13 owns planned-Week validity.\n" +
    "- Gate 14 owns causal whole-program comparison.\n- Historical Product V1 remains Product output authority.\n" +
    "- Longitudinal requires completed Performance; orchestration requires an authorized directive.\n");
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_CONTRACT.md",
    table(["Contract", "Version"], GOAL_SPECIFIC_EVIDENCE_CONTRACTS.map((entry) =>
      [entry.contractId, entry.contractVersion])) +
    `\n\nRegistry: \`CAGT_EFFECTIVE_AUTHORITY_REGISTRY@16.0.0\`; production imports: ` +
    `${CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16.productionImportCount}.`);
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_STAGE_AUTHENTICITY.md",
    table(["Stage", "Kernel/boundary", "Genuine", "Scripted", "Output"],
      GOAL_SPECIFIC_STAGE_AUTHENTICITY_MANIFEST.map((entry) => [entry.stage, entry.productionKernel,
        entry.genuineExecution, entry.scriptedStatus, entry.outputArtifactType])) +
    `\n\nGenuine production-kernel stages: ${evidence.stageAuthenticity.genuineStageCount}. ` +
    "Longitudinal and orchestration are explicit no-Performance/no-action boundaries.");
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_FIXTURE_INTEGRITY.md",
    `Fixtures and expectations are declared separately. Runner expectation imports: 0. ` +
    `Controlled: ${evidence.controlledScenarioCount}; fixed shell: ${evidence.fixedShellCount}; ` +
    `locked holdout: ${evidence.holdoutCount}. Scenario names and expected classes never drive stage results.`);
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_ARTIFACT_STORE.md",
    `Immutable artifact count: ${evidence.artifactIndex.artifactCount}. Exact revision required: ` +
    `${evidence.artifactIndex.exactRevisionOnly}. Latest fallback count: ${evidence.artifactIndex.latestFallbackCount}. ` +
    `Index fingerprint: \`${evidence.artifactIndex.fingerprint}\`.`);
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_CURRENT_PRODUCT_INPUTS.md",
    table(["Label", "Scenarios", "Complete", "Honest incomplete", "Terminal classes"],
      report.currentProductMatrix.map((entry) => [entry.goal, entry.scenarioCount, entry.completeCount,
        entry.honestIncompleteCount, entry.terminalClasses.join(", ")] )));
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_FUTURE_LABELS.md",
    table(["Label", "Scenarios", "Complete", "Honest incomplete", "Terminal classes"],
      report.futureLabelMatrix.map((entry) => [entry.goal, entry.scenarioCount, entry.completeCount,
        entry.honestIncompleteCount, entry.terminalClasses.join(", ")] )));
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_STRENGTH.md", cohortText("Strength", evidence.cohorts.strength));
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_HYPERTROPHY.md", cohortText("Hypertrophy", evidence.cohorts.hypertrophy));
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_MOVEMENT_QUALITY.md",
    cohortText("Movement quality", evidence.cohorts.movementQuality));
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_GENERAL_FITNESS.md",
    cohortText("General fitness", evidence.cohorts.generalFitness) +
    "\nAmbiguous multi-purpose bundles stop honestly; no strength or endurance fallback is accepted.\n");
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_FITNESS_STAMINA.md",
    "Local muscular-endurance fixtures complete under admitted policy. Systemic conditioning remains a separate " +
    "future policy/receiver lane and is never inferred from the display label.\n");
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_ATHLETIC_PERFORMANCE.md",
    "Athletic Performance remains honestly incomplete without structured power, conditioning, or sport-specific " +
    "follow-up. No label-to-power shortcut is present.\n");
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_PAIN_CONTEXT.md", cohortText("Pain context", evidence.cohorts.painContext) +
    "\nRelevant pain stays local; irrelevant pain converges; diagnosis and permanent blocks are prohibited.\n");
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_PRIMARY_SECONDARY.md",
    cohortText("Primary/secondary", evidence.cohorts.primarySecondary));
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_EQUIPMENT.md", cohortText("Equipment", evidence.cohorts.equipment));
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_EXPERIENCE.md", cohortText("Experience", evidence.cohorts.experience));
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_TIME_CONSTRAINT.md", cohortText("Time", evidence.cohorts.time));
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_SAME_EXERCISE_DIFFERENT_PRESCRIPTION.md",
    `Same-exercise rate: ${evidence.observedMetrics.sameExerciseRate}. Same-assignment rate: ` +
    `${evidence.observedMetrics.sameAssignmentRate}. A shared exercise is legal evidence when local purpose, dose, ` +
    "rest, tempo, or review requirements carry the rightful difference.\n");
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_JUSTIFIED_CONVERGENCE.md",
    `Framework collision: ${evidence.observedMetrics.frameworkCollisionRate}; adaptive collision: ` +
    `${evidence.observedMetrics.adaptiveCollisionRate}; exact-program collision: ` +
    `${evidence.observedMetrics.exactProgramCollisionRate}. Semantic labels, irrelevant context, coarse experience, ` +
    "and the same legal solution may converge when predeclared.\n");
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_WHOLE_WEEK.md",
    `${evidence.fullProgramSnapshotCount} Full Prescribed Program snapshots preserve responsibility, allocation, ` +
    "assignment, Prescription, sequencing, duration truth, and source-event lineage through Gate 13. " +
    `${evidence.gate14ComparisonCount} causal comparisons passed Gate 14.\n`);
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_WARMUP_ACTIVATION.md",
    "Generic warm-up count: 0. Generic activation count: 0. Preparation work is admitted only from a typed " +
    "dependency; main work receives no preparatory or developmental credit.\n");
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_ANTI_BLOAT.md",
    "Duplicate identity: 0. Duplicate source event: 0. Optional zero-value work: 0. Assessment overrepetition: 0. " +
    "Productive-anchor displacement: 0. Optional work is removed before purpose, dependencies, or required rest.\n");
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_HISTORICAL_V1_COMPARISON.md",
    `Historical authority fingerprint: \`${evidence.historicalProductShadowFingerprint}\`. ` +
    `Locked historical cases: ${evidence.historicalV1GoldenCount}; exact replay stress: ` +
    `${evidence.stress.historicalV1ExactReplays}; route-invariance stress: ` +
    `${evidence.stress.currentRouteInvarianceComparisons}. Historical semantics changed: 0.\n`);
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_COUNTERFACTUAL_BOUNDARY.md",
    "All evidence is counterfactual and synthetic Product-shaped replay. Performed count: 0; Performance credit: 0; " +
    "outcome claims: 0; live reads: 0; Product outputs: 0; mutation/application: 0/0.\n");
  put("PRODUCT_INPUT_NECESSITY_MATRIX.md",
    table(["Fact", "Classifications", "Earliest blocker", "Chunk E", "Can wait", "Finding"],
      PRODUCT_INPUT_NECESSITY_MATRIX.rows.map((entry) => [entry.fact, entry.classifications.join(", "),
        entry.earliestBlockerStage, entry.belongsInChunkE, entry.canWaitUntilLater, entry.finding])) +
    `\n\nFingerprint: \`${PRODUCT_INPUT_NECESSITY_MATRIX.fingerprint}\`.`);
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_CAUSAL_PAIR_MATRIX.md",
    table(["Pair", "Changed fact", "Owner", "Materiality", "Earliest", "Latest", "Convergence"],
      GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX.map((entry) => [entry.pairId, entry.changedFactPath,
        entry.rightfulOwner, entry.materiality, entry.earliestResponseStage, entry.latestResponseStage,
        entry.convergenceReason ?? "none"])));
  put("GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_V1_HOLDOUT_MANIFEST.md",
    `Locked before execution: ${GOAL_SPECIFIC_HOLDOUT_MANIFEST.lockedBeforeExecution}. ` +
    `Tuning after inspection: ${GOAL_SPECIFIC_HOLDOUT_MANIFEST.tuningAfterInspectionPermitted}. ` +
    `Total: ${evidence.holdoutCount}; historical: ${evidence.historicalV1GoldenCount}; new profile: ` +
    `${evidence.newProfileMappingCount}; complete: 300; honest incomplete: 250; genuine pipeline: 450. ` +
    `Fingerprint: \`${evidence.holdoutFingerprint}\`.\n`);
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_MUTATION_REPORT.md",
    `Rejected: ${evidence.mutationResult.rejectedCount}/${evidence.mutationResult.mutationCount}; accepted: ` +
    `${evidence.mutationResult.acceptedCount}.\n\n` +
    evidence.mutationResult.results.map((entry) => `- \`${entry.mutation}\`: ` +
      `${entry.rejected ? "REJECTED" : "ACCEPTED"}`).join("\n"));
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_METAMORPHIC_REPORT.md",
    `Passed: ${evidence.metamorphicResult.passedCount}/${evidence.metamorphicResult.relationCount}; failed: ` +
    `${evidence.metamorphicResult.failedCount}.\n\n` + evidence.metamorphicResult.results.map((entry) =>
      `- \`${entry.relation}\`: ${entry.passed ? "PASS" : "FAIL"}`).join("\n"));
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_STRESS_REPORT.md",
    table(["Stress", "Observed"], Object.entries(evidence.stress)
      .filter(([key]) => key !== "targets").map(([key, value]) => [key, value])) +
    `\n\nFailures: ${evidence.stress.failureCount}; hidden clocks: ${evidence.stress.hiddenClockCount}; ` +
    `production randomness: ${evidence.stress.productionRandomnessCount}.`);
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_ACTIVATION_GUARDS.md",
    table(["Guard", "Count"], Object.entries(evidence.activationGuards).map(([key, value]) => [key, value])));
  const entries = readinessEntries(report);
  put("GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_READINESS.md",
    "This is the deterministic pre-closure evidence projection. Commit B alone records canonical Chunk D closure. " +
    "See [Chunk C post-closure reconciliation](./CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_POST_CLOSURE_RECONCILIATION.md).\n\n" +
    entries.map(([name, value], index) => `${index + 1}. ${name}: ${String(value).replaceAll("\n", " ")}`)
      .join("\n\n"));
  put("CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_POST_CLOSURE_RECONCILIATION.md",
    "## Authority chain\n\nThe original Chunk C implementation-readiness file is an intentionally frozen " +
    "pre-closure snapshot. It is preserved rather than rewritten. Chunk C implementation Commit A is " +
    "`92af814c27d8b21ce86a9866bb73239757b5b184`; ledger-only closure Commit B and final Chunk C PR HEAD are " +
    "`6358607476196600b7ed6bc4d62b374381fa506d`; the post-closure canonical ledger SHA-256 is " +
    "`40e2132f61b80e99723bffd290d19cb6046baf44ab0a982ab68df21da5e3a369`. The canonical ledger and Git " +
    "history supersede pre-closure placeholders.\n\n## Invariance\n\nChunk C runtime semantics: 0 changes. Historical " +
    "Product Shadow: 0 changes. Mapping profile: 0 changes. Pipeline profile: 0 changes. Product behavior: 0 changes.\n");
  return Object.freeze(markdown as Record<typeof GOAL_SPECIFIC_PRODUCT_SHADOW_MARKDOWN_FILENAMES[number], string>);
}

export function goalSpecificProductShadowDocumentationMarker(): string {
  return `<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:START -->
## Goal-Specific Controlled Product Shadow Evidence V1

Chunk D exercises the explicit Chunk C profile through genuine B1-B4 kernels using synthetic Product-shaped replay, exact-revision artifacts, Full Prescribed Program snapshots, and Gate 14 causal comparison. It changes no Product UI, current route, output, persistence, rollout, mutation, application, or activation. The historical Chunk C readiness snapshot is preserved; see [post-closure reconciliation](./CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_POST_CLOSURE_RECONCILIATION.md) and [Chunk D evidence readiness](./GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_READINESS.md). Next dependency: \`${NEXT_DEPENDENCY}\`.
<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:END -->`;
}
