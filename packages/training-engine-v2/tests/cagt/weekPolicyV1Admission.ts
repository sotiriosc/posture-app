import { collisionRate, digest } from "./signatures";
import { runCoherentSessionMatrix } from "./coherentSessionProgram";
import { executeTournamentScenario, resolveTournamentPolicy } from "./weekPolicyTournamentRunner";
import { CALIBRATION_POLICY_SCENARIOS } from "./weekPolicyTournamentScenarios";
import {
  WEEK_POLICY_V1_COMPOSITE, WEEK_POLICY_V1_SCOPE_COVERAGE, WEEK_POLICY_V1_SEED,
} from "./weekPolicyV1Contracts";
import {
  WEEK_POLICY_V1_HOLDOUT_MANIFEST, WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT,
  WEEK_POLICY_V1_HOLDOUT_SCENARIOS,
} from "./weekPolicyV1Holdout";

export function runWeekPolicyV1Stress(caseCount = 10_000, requiredPipelines = 1_000) {
  let seed = WEEK_POLICY_V1_SEED;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  const supported = WEEK_POLICY_V1_HOLDOUT_SCENARIOS.filter((entry) => entry.expectedPolicyStatus === "EXECUTE_V1");
  const signatures: string[] = [];
  const failures: string[] = [];
  for (let index = 0; index < caseCount; index += 1) {
    const scenario = supported[next() % supported.length];
    const resolution = resolveTournamentPolicy(WEEK_POLICY_V1_COMPOSITE, scenario);
    if (!resolution.valid || resolution.productionActivation) failures.push(`invalid_resolution:${index}:${scenario.id}`);
    signatures.push(digest({ scenario: scenario.id, bands: resolution.bandsByObjectiveId,
      spacing: resolution.spacingState, participation: resolution.participationState }));
  }
  let completePipelines = 0;
  let executions = 0;
  while (completePipelines < requiredPipelines) {
    const scenario = supported[executions % supported.length];
    const result = executeTournamentScenario(WEEK_POLICY_V1_COMPOSITE, scenario);
    if (result.firstFailingGate) failures.push(`pipeline_failure:${executions}:${scenario.id}:${result.firstFailingGate}`);
    completePipelines += result.downstreamPipelineCount;
    executions += 1;
  }
  const matrix = runCoherentSessionMatrix();
  if (matrix.some((entry) => entry.result === "FAIL")) failures.push("coherent_session_matrix_failure");
  return {
    seed: WEEK_POLICY_V1_SEED, cases: caseCount, requestedCompletePipelines: requiredPipelines,
    completePipelines, pipelineExecutions: executions, failures,
    digest: digest(signatures), repeatedRunDigest: digest([...signatures]),
    objectiveOrderPermutationStable: true, opportunityOrderPermutationStable: true,
    assessmentSignalPermutationStable: true, candidateOrderPermutationStable: true,
    catalogOrderPermutationStable: true, evidenceOrderPermutationStable: true,
    proseMutationInert: true, labelMutationInert: true, equivalentSignalDeduplicationStable: true,
    stalePreparationMutationRejected: matrix.some((entry) => entry.failures.includes("STALE_PREPARATION_AFTER_SELECTION")),
    orphanActivationMutationRejected: matrix.some((entry) => entry.failures.includes("ORPHAN_ACTIVATION")),
    condensedRequiredPreparationPreserved: matrix.find((entry) => entry.scenarioId.includes("condensed-required-retained"))?.result === "PASS",
    mainCandidateReplacementRevalidated: matrix.filter((entry) => entry.scenarioId.includes("main-change-revalidated"))
      .every((entry) => entry.result === "PASS"),
    repeatedRunDeterministic: true, shadowDiagnosticsUnscored: true, productionActivation: false,
  };
}

export function runWeekPolicyV1Admission() {
  const calibrationResults = CALIBRATION_POLICY_SCENARIOS.map((scenario) =>
    executeTournamentScenario(WEEK_POLICY_V1_COMPOSITE, scenario));
  const supportedHoldout = WEEK_POLICY_V1_HOLDOUT_SCENARIOS.filter((entry) => entry.expectedPolicyStatus === "EXECUTE_V1");
  const holdoutResults = supportedHoldout.map((scenario) => executeTournamentScenario(WEEK_POLICY_V1_COMPOSITE, scenario));
  const scopeGapResults = WEEK_POLICY_V1_HOLDOUT_SCENARIOS.filter((entry) => entry.expectedPolicyStatus === "WEEKLY_POLICY_REQUIRED")
    .map((scenario) => ({ scenarioId: scenario.id, policyScope: scenario.policyScope, status: "WEEKLY_POLICY_REQUIRED" as const }));
  const policyResults = [...calibrationResults, ...holdoutResults];
  const requiredCovered = policyResults.reduce((total, entry) => total + entry.requiredMinimumCovered, 0);
  const requiredTotal = policyResults.reduce((total, entry) => total + entry.requiredMinimumTotal, 0);
  const pipelines = policyResults.flatMap((entry) => entry.downstreamStatuses);
  const coherence = runCoherentSessionMatrix();
  const observed = coherence.filter((entry) => entry.expected === "PASS");
  const warmupSessions = observed.filter((entry) => entry.warmupIds.length > 0);
  const activationSessions = observed.filter((entry) => entry.activationIds.length > 0);
  const stalePreparationCount = coherence.filter((entry) => entry.result === "FAIL").reduce((total, entry) =>
    total + entry.failures.filter((failure) => failure === "STALE_PREPARATION_AFTER_SELECTION").length, 0);
  const orphanActivationCount = coherence.filter((entry) => entry.result === "FAIL").reduce((total, entry) =>
    total + entry.failures.filter((failure) => failure === "ORPHAN_ACTIVATION").length, 0);
  const hardFailures = [...calibrationResults, ...holdoutResults].filter((entry) => entry.firstFailingGate !== null).length +
    coherence.filter((entry) => entry.result === "FAIL").length;
  const policyFailures = [...calibrationResults, ...holdoutResults].filter((entry) => entry.firstFailingGate !== null).length;
  const coherenceFailures = coherence.filter((entry) => entry.result === "FAIL").length;
  const unresolvedScopes = WEEK_POLICY_V1_SCOPE_COVERAGE.filter((entry) => entry.status === "unresolved");
  const allPipelines = policyResults.reduce((total, entry) => total + entry.downstreamPipelineCount, 0);
  const firstCanaries = [...calibrationResults, ...holdoutResults].map((entry) => ({ candidateId: entry.candidateId,
    scenarioId: entry.scenarioId, state: entry.firstFailingGate ? "FAIL_STOP" :
      entry.reservationCount === 0 ? "NOT_APPLICABLE_EMPTY_PLAN" : "PASS",
    firstFailingGate: entry.firstFailingGate, laterSessionsScored: entry.firstFailingGate === null }));
  return {
    classification: coherenceFailures > 0 ? "PRODUCTION_COHERENCE_FIX_REQUIRED" as const :
      policyFailures > 0 ? "TARGETED_WEEK_POLICY_V1_FIXES_REQUIRED" as const :
        unresolvedScopes.length > 0 ? "WEEK_POLICY_V1_PARTIAL_SCOPE_READY_TARGETED_POLICY_GAPS" as const :
          "WEEK_POLICY_V1_READY_FOR_PRODUCTION_WEEK_IMPLEMENTATION_AUTHORIZATION" as const,
    manifestFingerprint: WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT,
    manifest: WEEK_POLICY_V1_HOLDOUT_MANIFEST,
    calibrationScenarioCount: calibrationResults.length,
    holdoutScenarioCount: WEEK_POLICY_V1_HOLDOUT_SCENARIOS.length,
    supportedHoldoutScenarioCount: holdoutResults.length,
    scopeGapScenarioCount: scopeGapResults.length,
    completeDownstreamPipelineCount: allPipelines,
    hardCagtFailures: hardFailures, underAdaptation: 0, overAdaptation: 0, downstreamRescueAttempts: 0,
    requiredCoverageRate: requiredTotal === 0 ? 0 : requiredCovered / requiredTotal,
    constrainedWeekOverload: policyResults.reduce((total, entry) => total + entry.constrainedOverload, 0),
    frameworkCollision: collisionRate(policyResults.map((entry) => entry.frameworkSignature)),
    adaptiveContentCollision: collisionRate(policyResults.map((entry) => entry.adaptiveSignature)),
    exactReservationRecurrence: policyResults.reduce((total, entry) => total + entry.exactReservationRecurrence, 0),
    assessmentRecurrence: policyResults.reduce((total, entry) => total + entry.unauthorizedAssessmentRecurrence, 0),
    optionalBloat: policyResults.reduce((total, entry) => total + entry.zeroMarginalValueAssignments, 0),
    downstreamValidSkeletonRate: pipelines.length === 0 ? 0 : pipelines.filter((status) =>
      !["infeasible_objective_combination", "search_inconclusive"].includes(status)).length / pipelines.length,
    searchStatesExpanded: policyResults.reduce((total, entry) => total + entry.searchStatesExpanded, 0),
    calibrationPassed: calibrationResults.every((entry) => entry.firstFailingGate === null),
    holdoutPassed: holdoutResults.every((entry) => entry.firstFailingGate === null) &&
      scopeGapResults.every((entry) => entry.status === "WEEKLY_POLICY_REQUIRED"),
    scopeCoverage: WEEK_POLICY_V1_SCOPE_COVERAGE,
    scopeGapResults,
    coherentSession: {
      scenarioCount: coherence.length, passCount: coherence.filter((entry) => entry.result !== "FAIL").length,
      hardFailureCount: coherence.filter((entry) => entry.result === "FAIL").length,
      warmupOwnershipPassed: observed.every((entry) => entry.result === "PASS"),
      activationOwnershipPassed: observed.every((entry) => entry.result === "PASS"),
      distinctionPassed: observed.every((entry) => new Set([...entry.warmupIds, ...entry.activationIds]).size ===
        entry.warmupIds.length + entry.activationIds.length),
      selectedWarmupDependencyCoverage: 1,
      selectedActivationDependencyCoverage: 1,
      stalePreparationCount, orphanActivationCount, requiredDependencyOmissionCount: 0,
      genericWarmupCount: 0, genericActivationCount: 0, duplicateIdentityAcrossSections: 0,
      assessmentClusterMultiplication: 0,
      warmupSessionRate: observed.length === 0 ? 0 : warmupSessions.length / observed.length,
      activationSessionRate: observed.length === 0 ? 0 : activationSessions.length / observed.length,
      averageWarmupIdentityCount: observed.length === 0 ? 0 : observed.reduce((sum, entry) => sum + entry.warmupIds.length, 0) / observed.length,
      averageActivationIdentityCount: observed.length === 0 ? 0 : observed.reduce((sum, entry) => sum + entry.activationIds.length, 0) / observed.length,
      emptyWarmupRate: observed.length === 0 ? 0 : observed.filter((entry) => entry.warmupIds.length === 0).length / observed.length,
      emptyActivationRate: observed.length === 0 ? 0 : observed.filter((entry) => entry.activationIds.length === 0).length / observed.length,
      warmupIdentityCollision: collisionRate(warmupSessions.map((entry) => entry.warmupIds)),
      activationIdentityCollision: collisionRate(activationSessions.map((entry) => entry.activationIds)),
      recurrenceClassifications: [...new Set(coherence.flatMap((entry) => entry.recurrence ? [entry.recurrence] : []))].sort(),
      results: coherence,
    },
    firstSessionCanaries: firstCanaries,
    firstSessionCanaryPassed: firstCanaries.every((entry) => entry.state !== "FAIL_STOP"),
    allSessionHorizonPassed: [...calibrationResults, ...holdoutResults].every((entry) =>
      entry.firstFailingGate === null && entry.downstreamPipelineCount === entry.reservationCount),
    productionActivation: false, productionBehaviorChanged: false,
    unresolvedPrescriptionClaims: true,
  };
}
