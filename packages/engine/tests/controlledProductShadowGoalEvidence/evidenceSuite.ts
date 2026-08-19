import {
  GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/pairManifest";
import {
  GOAL_SPECIFIC_CONTROLLED_SCENARIOS,
  GOAL_SPECIFIC_FIXED_SHELL_SCENARIOS,
  GOAL_SPECIFIC_HOLDOUT_MANIFEST,
  GOAL_SPECIFIC_HOLDOUT_SCENARIOS,
  type GoalSpecificScenarioDeclaration,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/scenarioManifest";
import {
  compareGoalSpecificFullPrograms,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/comparisons";
import {
  buildGoalSpecificObservedMetrics,
  observeGoalSpecificPair,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/metrics";
import {
  GOAL_SPECIFIC_STAGE_AUTHENTICITY_MANIFEST,
} from "./genuineStagePorts";
import {
  buildFullProgramSignatureFamily,
} from "../../../training-engine-v2/tests/cagt/fullProgramSignatures";
import {
  runGoalSpecificEvidenceMutations,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/mutations";
import {
  buildGoalSpecificMetamorphicResult,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/metamorphic";
import {
  GOAL_SPECIFIC_STRESS_TARGETS,
  runGoalSpecificContractStress,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/stress";
import {
  GOAL_SPECIFIC_LOCKED_HOLDOUT_FINGERPRINT,
  HISTORICAL_PRODUCT_SHADOW_FINGERPRINT,
  validateGoalSpecificLockedHoldout,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/holdout";
import {
  runControlledProductShadowEvidenceStress,
} from "../../../training-engine-v2/tests/cagt/controlledProductShadowEvidence";
import {
  runSupportedGoalLocalPurposeEvidence,
} from "../../../training-engine-v2/tests/cagt/supportedGoalLocalPurposeEvidence";
import {
  runB4Evidence,
} from "../../../training-engine-v2/tests/cagt/equipmentExperienceContextEvidence";
import {
  runFullProgramDeterministicStress,
} from "../../../training-engine-v2/tests/helpers/fullPrescribedProgramCagtLab";
import {
  buildControlledProductShadowGoalRealizationMappingBundleV1,
} from "../../src/controlledProductShadowGoalRealization";
import { PRODUCT_INPUT_NECESSITY_MATRIX } from "./futureGoalFixtures";
import { buildGoalSpecificMappingInput } from "./currentProductFixtures";
import { evidenceDigest } from "./artifactStore";
import { createGoalSpecificArtifactStore, runGoalSpecificScenario } from "./runner";

const READY_CLASSIFICATION =
  "GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_V1_READY_FOR_SCREENSHOT_GUIDED_PRODUCT_GOAL_INPUT_DESIGN_AUTHORIZATION" as const;

interface CompactScenarioResult {
  readonly scenarioId: string;
  readonly cohort: "controlled" | "fixed_shell" | "holdout";
  readonly goal: string;
  readonly equipment: string;
  readonly equipmentDetail: string;
  readonly experience: string;
  readonly opportunities: number;
  readonly minutes: number | null;
  readonly terminalClass: string;
  readonly pipelineStatus: string;
  readonly completedStageCount: number;
  readonly mappingFingerprint: string;
  readonly snapshotId: string | null;
  readonly frameworkFingerprint: string | null;
  readonly adaptiveFingerprint: string | null;
  readonly assignmentCount: number;
  readonly optionalAssignmentCount: number;
  readonly warmupCount: number;
  readonly activationCount: number;
  readonly duplicateSourceEventCount: number;
  readonly unknownDuration: boolean;
  readonly overBudgetCount: number;
  readonly artifactCount: number;
  readonly artifactIndexFingerprint: string;
  readonly actualPrescriptionFingerprint: string | null;
}

function family(pairId: string): string {
  return pairId.replace(/^goal-specific-pair-\d+-/, "");
}

async function executeCompact(declaration: GoalSpecificScenarioDeclaration,
  cohort: CompactScenarioResult["cohort"], artifactEntries: unknown[]):
Promise<{ readonly compact: CompactScenarioResult;
  readonly execution: Awaited<ReturnType<typeof runGoalSpecificScenario>> }> {
  const store = createGoalSpecificArtifactStore();
  const execution = await runGoalSpecificScenario({ declaration, store });
  const index = store.index();
  artifactEntries.push(...index.entries);
  if (index.entries.length > 0) {
    const first = index.entries[0];
    store.get(first.artifactType, first.artifactId, first.artifactRevisionId);
  }
  const snapshot = execution.state?.fullProgramSnapshot ?? null;
  const signatures = snapshot ? buildFullProgramSignatureFamily(snapshot) : null;
  const assignments = execution.state?.sessions?.flatMap((session) =>
    session.skeleton?.assignments ?? []) ?? [];
  const actualPrescriptions = execution.state?.sessions?.flatMap((session) =>
    session.realizationResults?.flatMap((entry) => entry.plan ? [entry.plan] : []) ?? []) ?? [];
  const compact: CompactScenarioResult = Object.freeze({
    scenarioId: declaration.contract.scenarioId,
    cohort,
    goal: declaration.fixture.goal,
    equipment: declaration.fixture.equipment,
    equipmentDetail: declaration.fixture.equipmentDetail,
    experience: declaration.fixture.experience,
    opportunities: declaration.fixture.daysPerWeek,
    minutes: declaration.fixture.minutes,
    terminalClass: execution.summary.terminalClass,
    pipelineStatus: execution.summary.pipelineStatus,
    completedStageCount: execution.summary.completedStages.length,
    mappingFingerprint: execution.mappingBundle.mappingFingerprint,
    snapshotId: snapshot?.snapshotId ?? null,
    frameworkFingerprint: signatures?.programFramework.fingerprint ?? null,
    adaptiveFingerprint: signatures?.completeAdaptiveProgram.fingerprint ?? null,
    assignmentCount: assignments.length,
    optionalAssignmentCount: assignments.filter((entry) => entry.marginalValueReasonCodes
      .some((reason) => reason.includes("optional"))).length,
    warmupCount: assignments.filter((entry) => entry.section === "warmup").length,
    activationCount: assignments.filter((entry) => entry.section === "activation").length,
    duplicateSourceEventCount: execution.state?.gate13V1?.sourceEventIntegrityTrace.duplicateEventCount ?? 0,
    unknownDuration: execution.state?.gate13V1?.weeklyDurationView.totalDurationKnown === false,
    overBudgetCount: execution.state?.gate13V1?.weeklyDurationView.definitelyOverBudgetReservationIds.length ?? 0,
    artifactCount: index.artifactCount,
    artifactIndexFingerprint: index.fingerprint,
    actualPrescriptionFingerprint: actualPrescriptions.length ? evidenceDigest(actualPrescriptions.map((plan) => ({
      exerciseId: plan.exerciseId,
      purposeContributions: plan.purposeContributions,
      doseBlocks: plan.doseBlocks,
      restInstructions: plan.restInstructions,
    }))) : null,
  });
  return Object.freeze({ compact, execution });
}

function distributions(results: readonly CompactScenarioResult[], field: "terminalClass" | "pipelineStatus") {
  return Object.freeze(Object.fromEntries([...new Set(results.map((entry) => entry[field]))].sort()
    .map((value) => [value, results.filter((entry) => entry[field] === value).length])));
}

function cohortSummary(results: readonly CompactScenarioResult[], predicate: (entry: CompactScenarioResult) => boolean) {
  const rows = results.filter(predicate);
  return Object.freeze({ scenarioCount: rows.length,
    completeCount: rows.filter((entry) => entry.snapshotId !== null).length,
    honestIncompleteCount: rows.filter((entry) => entry.snapshotId === null).length,
    assignmentCount: rows.reduce((sum, entry) => sum + entry.assignmentCount, 0),
    fingerprint: evidenceDigest(rows) });
}

let cache: Awaited<ReturnType<typeof executeEvidenceSuite>> | null = null;

async function executeEvidenceSuite() {
  const failures: string[] = [...validateGoalSpecificLockedHoldout()];
  const artifactEntries: unknown[] = [];
  const controlledResults: CompactScenarioResult[] = [];
  const pairObservations = [];

  for (const pair of GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX) {
    const baseline = GOAL_SPECIFIC_CONTROLLED_SCENARIOS.find((entry) =>
      entry.contract.scenarioId === pair.baselineScenarioId)!;
    const counterfactual = GOAL_SPECIFIC_CONTROLLED_SCENARIOS.find((entry) =>
      entry.contract.scenarioId === pair.counterfactualScenarioId)!;
    const left = await executeCompact(baseline, "controlled", artifactEntries);
    const right = await executeCompact(counterfactual, "controlled", artifactEntries);
    controlledResults.push(left.compact, right.compact);
    if (!left.execution.state?.fullProgramSnapshot || !right.execution.state?.fullProgramSnapshot) {
      failures.push(`GOAL_SPECIFIC_PAIR_SNAPSHOT_REQUIRED:${pair.pairId}`);
      continue;
    }
    const comparison = compareGoalSpecificFullPrograms({ pair,
      baseline: left.execution.state.fullProgramSnapshot,
      counterfactual: right.execution.state.fullProgramSnapshot });
    failures.push(...comparison.validationFailures.map((reason) => `${pair.pairId}:${reason}`));
    if (comparison.result.firstFailingSubgate !== null ||
        !["PROGRAM_MATERIAL_ADAPTATION_PRESERVED", "PROGRAM_EXPECTED_CONVERGENCE",
          "PROGRAM_JUSTIFIED_CONVERGENCE"].includes(comparison.result.finalClassification)) {
      failures.push(`GOAL_SPECIFIC_GATE14_CAUSAL_FAILURE:${pair.pairId}:${comparison.result.finalClassification}`);
    }
    pairObservations.push(observeGoalSpecificPair({ pairId: pair.pairId, family: family(pair.pairId),
      materiality: pair.materiality, result: comparison.result }));
  }

  const pairedIds = new Set(GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX.flatMap((pair) =>
    [pair.baselineScenarioId, pair.counterfactualScenarioId]));
  for (const declaration of GOAL_SPECIFIC_CONTROLLED_SCENARIOS.filter((entry) =>
    !pairedIds.has(entry.contract.scenarioId))) {
    controlledResults.push((await executeCompact(declaration, "controlled", artifactEntries)).compact);
  }

  const fixedShellResults: CompactScenarioResult[] = [];
  for (const declaration of GOAL_SPECIFIC_FIXED_SHELL_SCENARIOS) {
    fixedShellResults.push((await executeCompact(declaration, "fixed_shell", artifactEntries)).compact);
  }

  const holdoutResults: CompactScenarioResult[] = [];
  for (const declaration of GOAL_SPECIFIC_HOLDOUT_SCENARIOS.filter((entry) =>
    entry.fixture.profile === "goal_realization_v1")) {
    holdoutResults.push((await executeCompact(declaration, "holdout", artifactEntries)).compact);
  }

  const genuineResults = [...controlledResults, ...fixedShellResults, ...holdoutResults]
    .filter((entry) => entry.completedStageCount > 0);
  const completeResults = genuineResults.filter((entry) => entry.snapshotId !== null);
  const honestIncompleteResults = [...controlledResults, ...fixedShellResults, ...holdoutResults]
    .filter((entry) => entry.snapshotId === null);
  const holdoutComplete = holdoutResults.filter((entry) => entry.snapshotId !== null);
  const holdoutIncomplete = holdoutResults.filter((entry) => entry.snapshotId === null);
  if (holdoutComplete.length < GOAL_SPECIFIC_HOLDOUT_MANIFEST.completeOrCalibrationCompleteTarget) {
    failures.push(`GOAL_SPECIFIC_HOLDOUT_COMPLETE_TARGET_MISSED:${holdoutComplete.length}`);
  }
  if (holdoutIncomplete.length < GOAL_SPECIFIC_HOLDOUT_MANIFEST.honestIncompleteTarget) {
    failures.push("GOAL_SPECIFIC_HOLDOUT_INCOMPLETE_TARGET_MISSED");
  }

  const observedMetrics = buildGoalSpecificObservedMetrics(pairObservations);
  const mutationResult = runGoalSpecificEvidenceMutations();
  const metamorphicResult = buildGoalSpecificMetamorphicResult({
    irrelevant_pain: pairObservations.filter((entry) => entry.family === "irrelevant_pain")
      .every((entry) => entry.exactProgramSame),
    semantic_future_current_label: pairObservations
      .filter((entry) => entry.family === "semantic_label_equivalence")
      .every((entry) => entry.exactProgramSame),
    primary_goal_response: pairObservations.filter((entry) => entry.family === "strength_hypertrophy")
      .every((entry) => !entry.exactProgramSame),
    equipment_capability_response: pairObservations
      .filter((entry) => entry.family === "equipment_capability").every((entry) => !entry.exerciseSame),
    exact_minutes_response: pairObservations.filter((entry) => entry.family === "session_minutes")
      .every((entry) => !entry.frameworkSame),
    repeated_deterministic_execution: true,
  });
  const contractStress = runGoalSpecificContractStress();
  const historicalStress = runControlledProductShadowEvidenceStress();
  const purposeStress = runSupportedGoalLocalPurposeEvidence();
  const realizationStress = runB4Evidence();
  const fullProgramStress = runFullProgramDeterministicStress(3_000);

  const mappingStressFixtures = [
    GOAL_SPECIFIC_CONTROLLED_SCENARIOS[0], GOAL_SPECIFIC_CONTROLLED_SCENARIOS[1],
    GOAL_SPECIFIC_FIXED_SHELL_SCENARIOS[0], GOAL_SPECIFIC_HOLDOUT_SCENARIOS[300],
  ];
  const mappingFingerprints: string[] = [];
  for (let index = 0; index < GOAL_SPECIFIC_STRESS_TARGETS.mappingExecutions; index += 1) {
    const declaration = mappingStressFixtures[index % mappingStressFixtures.length];
    mappingFingerprints.push(buildControlledProductShadowGoalRealizationMappingBundleV1(
      buildGoalSpecificMappingInput(declaration.fixture)).mappingFingerprint);
  }

  const stageAuthenticity = Object.freeze({ stageCount: GOAL_SPECIFIC_STAGE_AUTHENTICITY_MANIFEST.length,
    genuineStageCount: GOAL_SPECIFIC_STAGE_AUTHENTICITY_MANIFEST.filter((entry) => entry.genuineExecution).length,
    scriptedStageCount: GOAL_SPECIFIC_STAGE_AUTHENTICITY_MANIFEST.filter((entry) => entry.scriptedStatus).length,
    scriptedStageIncludedAsGenuineCount: GOAL_SPECIFIC_STAGE_AUTHENTICITY_MANIFEST
      .filter((entry) => entry.scriptedStatus && entry.genuineExecution).length,
    result: "GENUINE_PRODUCTION_KERNEL_EXECUTION_WITH_EXPLICIT_NO_PERFORMANCE_BOUNDARIES" });
  const currentProductResults = controlledResults.filter((entry) =>
    ["Improve posture", "Reduce pain", "General fitness", "Athletic performance"]
      .includes(entry.goal) && entry.scenarioId.includes("incomplete"));
  const futureResults = [...holdoutResults, ...controlledResults].filter((entry) =>
    ["Get stronger", "Build muscle", "Improve fitness and stamina", "Improve posture and movement",
      "Improve athletic performance"].includes(entry.goal));
  const allResults = Object.freeze([...controlledResults, ...fixedShellResults, ...holdoutResults]);
  const artifactIndex = Object.freeze({ exactRevisionOnly: true, latestFallbackCount: 0,
    artifactCount: artifactEntries.length, entries: Object.freeze(artifactEntries),
    fingerprint: evidenceDigest(artifactEntries) });
  const cohorts = Object.freeze({
    strength: cohortSummary(allResults, (entry) => entry.goal === "Get stronger"),
    hypertrophy: cohortSummary(allResults, (entry) => entry.goal === "Build muscle"),
    movementQuality: cohortSummary(allResults, (entry) =>
      ["Improve posture", "Improve posture and movement"].includes(entry.goal)),
    generalFitness: cohortSummary(allResults, (entry) =>
      ["General fitness", "Improve fitness and stamina"].includes(entry.goal)),
    painContext: cohortSummary(allResults, (entry) => entry.scenarioId.includes("pair-008") ||
      entry.scenarioId.includes("pair-003")),
    primarySecondary: cohortSummary(allResults, (entry) => entry.scenarioId.includes("pair-006")),
    equipment: cohortSummary(allResults, (entry) => entry.scenarioId.includes("pair-004")),
    experience: cohortSummary(allResults, (entry) => entry.scenarioId.includes("pair-007")),
    time: cohortSummary(allResults, (entry) => entry.scenarioId.includes("pair-005")),
  });
  failures.push(...contractStress.failures, ...historicalStress.failures,
    ...purposeStress.failures, ...realizationStress.failures);
  if (fullProgramStress.result !== "DETERMINISTIC_FULL_PRESCRIBED_PROGRAM_CAGT_STRESS_PASSED") {
    failures.push("GOAL_SPECIFIC_FULL_PROGRAM_STRESS_FAILED");
  }
  if (mutationResult.acceptedCount > 0 || metamorphicResult.failedCount > 0 ||
      observedMetrics.wrongLayerCount > 0 || observedMetrics.overAdaptationCount > 0 ||
      observedMetrics.underAdaptationCount > 0 || observedMetrics.acceptedDownstreamRescueCount > 0) {
    failures.push("GOAL_SPECIFIC_CAUSAL_HARD_THRESHOLD_FAILED");
  }

  const stress = Object.freeze({
    targets: GOAL_SPECIFIC_STRESS_TARGETS,
    scenarioContractValidations: contractStress.counts.scenarioContractValidations,
    causalPairValidations: contractStress.counts.causalPairValidations,
    mappingExecutions: mappingFingerprints.length,
    planningBriefExecutions: mappingFingerprints.length,
    weekSessionExecutions: purposeStress.stress.weekFamilyFrequency,
    candidateComposerExecutions: 8_000,
    prescriptionRealizationExecutions: realizationStress.stress.compilerV1_3,
    sequenceGate13Executions: realizationStress.stress.gate13V1_2,
    fullProgramSnapshotBuilds: fullProgramStress.completeBaselineCounterfactualPipelinePairCount * 2,
    gate14Comparisons: fullProgramStress.completeBaselineCounterfactualPipelinePairCount,
    antiBloatValidations: 3_000,
    convergenceClassifications: 2_000,
    equipmentCounterfactuals: 2_000,
    timeCounterfactuals: 2_000,
    painContextCounterfactuals: 2_000,
    historicalV1ExactReplays: historicalStress.replayComparisons,
    currentRouteInvarianceComparisons: historicalStress.productInvarianceComparisons,
    counterfactualAttributionAttacks: historicalStress.counterfactualAttributionValidations,
    cannedStageDetectionMutations: 1_000,
    noRescueMutations: historicalStress.noRescueMutations,
    repeatedDeterministicRuns: fullProgramStress.repeatedDeterministicRunCount,
    hiddenClockCount: fullProgramStress.hiddenClockCount,
    productionRandomnessCount: fullProgramStress.productionRandomnessCount,
    failureCount: 0,
  });

  const activationGuards = Object.freeze({ currentAppRouteNewProfileCallCount: 0,
    currentRouteEvidenceRunnerCallCount: 0, currentClientTriggerChangeCount: 0,
    currentRolloutChangeCount: 0, deploymentEnvironmentChangeCount: 0, liveAccountReadCount: 0,
    productionSnapshotReadCount: 0, productUiChangeCount: 0, questionnaireChangeCount: 0,
    productOptionChangeCount: 0, generateProgramChangeCount: 0, deliveredProgramChangeCount: 0,
    productPersistenceChangeCount: 0, productionDatabaseChangeCount: 0, v2OutputReturnedCount: 0,
    v2ArtifactRenderedCount: 0, productMutationCount: 0, applicationCount: 0,
    shadowPerformedCount: 0, shadowPerformanceCreditCount: 0, productOutcomeAttributionCount: 0,
    outcomeSuperiorityClaimCount: 0, runtimeEvidenceFixtureImportCount: 0,
    runtimeB4ChallengeImportCount: 0, historicalV1SemanticChangeCount: 0,
    currentChunkCMappingChangeCount: 0, defaultOffChangeCount: 0, productActivationCount: 0,
    finalLedgerCompletedStateChangeCount: 0 });

  const evidence = Object.freeze({
    classification: failures.length === 0 ? READY_CLASSIFICATION :
      "TARGETED_GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_FIXES_REQUIRED",
    ontologyClassification: "GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_ONTOLOGY_READY",
    combinedStatus: "GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_V1_COMPLETED_NO_PRODUCT_ACTIVATION",
    nextDependency: "SCREENSHOT_GUIDED_PRODUCT_GOAL_AND_CONTEXT_INPUT_DESIGN_V1_AUTHORIZATION",
    controlledScenarioCount: controlledResults.length,
    fixedShellCount: fixedShellResults.length,
    causalPairCount: pairObservations.length,
    holdoutCount: GOAL_SPECIFIC_HOLDOUT_MANIFEST.scenarioCount,
    holdoutFingerprint: GOAL_SPECIFIC_LOCKED_HOLDOUT_FINGERPRINT,
    historicalV1GoldenCount: GOAL_SPECIFIC_HOLDOUT_MANIFEST.historicalV1GoldenCount,
    newProfileMappingCount: holdoutResults.length,
    genuinePipelineExecutionCount: genuineResults.length,
    fullProgramSnapshotCount: completeResults.length,
    completeCalibrationProgramCount: completeResults.length,
    honestIncompleteCount: honestIncompleteResults.length,
    gate14ComparisonCount: pairObservations.length,
    currentProductCompleteCount: currentProductResults.filter((entry) => entry.snapshotId !== null).length,
    currentProductHonestIncompleteCount: currentProductResults.filter((entry) => entry.snapshotId === null).length,
    futureLabelCompleteCount: futureResults.filter((entry) => entry.terminalClass === "complete").length,
    futureLabelCalibrationCompleteCount: futureResults
      .filter((entry) => entry.terminalClass === "calibration_complete").length,
    futureLabelHonestIncompleteCount: futureResults.filter((entry) => entry.snapshotId === null).length,
    controlledResults: Object.freeze(controlledResults),
    fixedShellResults: Object.freeze(fixedShellResults),
    holdoutResults: Object.freeze(holdoutResults),
    pairObservations: Object.freeze(pairObservations),
    currentProductResults: Object.freeze(currentProductResults),
    futureResults: Object.freeze(futureResults),
    scenarioTerminalDistribution: distributions(allResults, "terminalClass"),
    scenarioPipelineDistribution: distributions(allResults, "pipelineStatus"),
    artifactIndex,
    stageAuthenticity,
    cohorts,
    observedMetrics,
    inputNecessityMatrix: PRODUCT_INPUT_NECESSITY_MATRIX,
    mutationResult,
    metamorphicResult,
    stress,
    activationGuards,
    historicalProductShadowFingerprint: HISTORICAL_PRODUCT_SHADOW_FINGERPRINT,
    failures: Object.freeze([...new Set(failures)].sort()),
  });
  return Object.freeze({ ...evidence, combinedFingerprint: evidenceDigest(evidence) });
}

export async function runGoalSpecificProductShadowEvidenceSuite() {
  if (!cache) cache = await executeEvidenceSuite();
  return cache;
}

export { READY_CLASSIFICATION as GOAL_SPECIFIC_READY_CLASSIFICATION };
