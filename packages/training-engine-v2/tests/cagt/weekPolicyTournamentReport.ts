import { CAGT_GATE_ORDER } from "./contracts";
import { EXPECTED_CAGT_FINGERPRINTS } from "./report";
import { digest } from "./signatures";
import {
  ATOMIC_WEEK_POLICY_CANDIDATES, CANDIDATE_LATTICE_FINGERPRINT, COMPOSITE_WEEK_POLICY_CANDIDATES,
} from "./weekPolicyTournamentCandidates";
import { runWeekPolicyTournament } from "./weekPolicyTournamentMetrics";
import {
  ALL_POLICY_TOURNAMENT_SCENARIOS, CALIBRATION_COHORT_FINGERPRINT, CALIBRATION_POLICY_SCENARIOS,
  HOLDOUT_COHORT_FINGERPRINT, LOCKED_HOLDOUT_POLICY_SCENARIOS,
} from "./weekPolicyTournamentScenarios";
import { runWeekPolicyTournamentStress } from "./weekPolicyTournamentStress";
import { WEEK_POLICY_TOURNAMENT_VERSION } from "./weekPolicyTournamentContracts";

function summary<T extends { readonly scenarioResults: unknown }>(entry: T): Omit<T, "scenarioResults"> {
  return Object.fromEntries(Object.entries(entry).filter(([key]) => key !== "scenarioResults")) as Omit<T, "scenarioResults">;
}

export const WEEK_POLICY_OWNER_RECOMMENDATIONS = Object.freeze({
  assessment: { recommendation: "ASSESSMENT_A1_SINGLE_CLUSTER", classification: "CAGT_RECOMMENDED_FOR_OWNER_ADMISSION",
    reason: "One reviewed cluster remains one objective and does not recur without explicit authority." },
  direct: { recommendation: "DIRECT_D1_ONCE", classification: "CAGT_RECOMMENDED_FOR_OWNER_ADMISSION",
    reason: "D2 soft-ceiling flexibility produced no unique executable benefit; the predeclared fallback is D1." },
  capacity: { recommendation: "CAPACITY_C1_ONCE", classification: "CAGT_RECOMMENDED_FOR_OWNER_ADMISSION",
    reason: "C2 produced no unique repeat value; C1 preserves explicit supported capacity without mandatory recurrence." },
  strength: { recommendation: "STRENGTH_S2_BALANCED", classification: "CAGT_RECOMMENDED_FOR_OWNER_ADMISSION",
    reason: "Target two improved practice distribution while minimum one remained truthful; minimum-two variants failed constrained contexts." },
  muscle: { recommendation: "H1_H2_OWNER_DECISION", classification: "PARETO_FRONTIER_OWNER_DECISION_REQUIRED",
    reason: "H2 did not establish a decisive feasibility benefit over H1 and frequency cannot stand in for volume." },
  participation: { recommendation: "PARTICIPATION_P0_NONE", classification: "ADVISORY_ONLY_NOT_EXECUTABLE",
    reason: "Participation context did not lawfully change objectives, reservations, or sessions." },
  spacing: { recommendation: "SPACING_R0_PRESCRIPTION_PENDING", classification: "CAGT_RECOMMENDED_FOR_OWNER_ADMISSION",
    reason: "R1 did not prove unique late-tie value; R2 remains Prescription-dependent." },
  composite: { recommendation: "NO_COMPOSITE_ADMISSION_YET", classification: "PARETO_FRONTIER_OWNER_DECISION_REQUIRED",
    reason: "B1 is hard-gate clean but inherits unresolved H1/H2 and unproven D2/C2/R1 component choices." },
});

export function buildWeekPolicyTournamentReport() {
  const tournament = runWeekPolicyTournament();
  const stress = runWeekPolicyTournamentStress();
  const candidates = [...tournament.atomic, ...tournament.composite];
  const candidateSummaries = candidates.map(summary);
  const scenarioEvidence = candidates.flatMap((candidate) => candidate.scenarioResults.map((scenario) => ({
    candidateId: candidate.candidateId, scenarioId: scenario.scenarioId, cohort: scenario.cohort,
    firstFailingGate: scenario.firstFailingGate, allocationStatus: scenario.allocationStatus,
    reservations: scenario.reservationCount, downstreamPipelines: scenario.downstreamPipelineCount,
    requiredCovered: scenario.requiredMinimumCovered, requiredTotal: scenario.requiredMinimumTotal,
    targetCovered: scenario.targetCovered, searchStatesExpanded: scenario.searchStatesExpanded,
    frameworkSignature: scenario.frameworkSignature, adaptiveSignature: scenario.adaptiveSignature,
    sessionSkeletonSignature: scenario.sessionSkeletonSignature,
  })));
  const holdout = candidates.map((candidate) => ({ candidateId: candidate.candidateId,
    passed: candidate.holdoutPass, hardGateFailures: candidate.scenarioResults
      .filter((entry) => entry.cohort === "holdout" && entry.firstFailingGate !== null)
      .map((entry) => [entry.scenarioId, entry.firstFailingGate]) }));
  return {
    version: WEEK_POLICY_TOURNAMENT_VERSION,
    classification: tournament.classification,
    authority: "OWNER_REVIEW_RECOMMENDATION_ONLY",
    candidateState: "CAGT_TEST_CANDIDATE_NOT_PRODUCTION",
    immutableGateOrder: CAGT_GATE_ORDER,
    atomicCandidateCount: ATOMIC_WEEK_POLICY_CANDIDATES.length,
    compositeCandidateCount: COMPOSITE_WEEK_POLICY_CANDIDATES.length,
    calibrationScenarioCount: CALIBRATION_POLICY_SCENARIOS.length,
    lockedHoldoutScenarioCount: LOCKED_HOLDOUT_POLICY_SCENARIOS.length,
    scenarioEvaluationCount: tournament.scenarioEvaluations,
    completeDownstreamPipelineCount: tournament.completeDownstreamPipelines,
    candidateSummaries, scenarioEvidence,
    calibration: candidates.map((entry) => ({ candidateId: entry.candidateId, passed: entry.calibrationPass })),
    holdout, paretoFrontier: tournament.paretoFrontier,
    dominatedCandidates: tournament.dominatedCandidates,
    incomparableCandidates: tournament.incomparableCandidates,
    ownerRecommendations: WEEK_POLICY_OWNER_RECOMMENDATIONS,
    stress,
    productionActivation: false,
    productionBehaviorChanged: false,
    cagtCoreFingerprint: EXPECTED_CAGT_FINGERPRINTS.combinedCagtTool,
    limitations: [
      "No production numeric policy is selected or activated.",
      "Direct D2, capacity C2, and spacing R1 soft-preference value was not established by the current allocator semantics.",
      "H1 and H2 remain an owner decision because frequency does not prove dose sufficiency.",
      "Prescription, final Sequencing, phase continuity, and Longitudinal Adaptation remain outside implemented authority.",
    ],
  };
}

export function buildWeekPolicyTournamentFingerprintPayloads() {
  const report = buildWeekPolicyTournamentReport();
  const candidates = report.candidateSummaries;
  return {
    frozenCandidateLattice: { version: WEEK_POLICY_TOURNAMENT_VERSION,
      atomic: ATOMIC_WEEK_POLICY_CANDIDATES, composite: COMPOSITE_WEEK_POLICY_CANDIDATES },
    calibrationCohort: CALIBRATION_POLICY_SCENARIOS,
    holdoutCohort: LOCKED_HOLDOUT_POLICY_SCENARIOS,
    atomicResults: candidates.filter((entry) => entry.family !== "composite"),
    compositeResults: candidates.filter((entry) => entry.family === "composite"),
    hardGateResults: candidates.map((entry) => [entry.candidateId, entry.hardGateFailures, entry.wrongLayerEffects, entry.downstreamRescue]),
    frameworkAdaptiveComparison: candidates.map((entry) => [entry.candidateId, entry.frameworkCollision, entry.adaptiveContentCollision,
      entry.expectedConvergence, entry.justifiedConvergence, entry.suspiciousConvergence]),
    duplicationResults: candidates.map((entry) => [entry.candidateId, entry.exactReservationRecurrence,
      entry.directAccessoryRecurrence, entry.assessmentRecurrence, entry.optionalRecurrence, entry.zeroMarginalValueCount]),
    constrainedHorizonResults: report.scenarioEvidence.filter((entry) => {
      const scenario = ALL_POLICY_TOURNAMENT_SCENARIOS.find((candidate) => candidate.id === entry.scenarioId)!;
      return scenario.opportunityCount <= 2 || scenario.condensedOpportunityOrders.length > 0 || scenario.cancelledOpportunityOrders.length > 0;
    }),
    searchCostResults: candidates.map((entry) => [entry.candidateId, entry.searchStatesExpanded, entry.searchInconclusiveRate]),
    paretoFrontier: { frontier: report.paretoFrontier, dominated: report.dominatedCandidates,
      incomparable: report.incomparableCandidates },
    ownerRecommendation: report.ownerRecommendations,
    holdoutVerification: { fingerprint: HOLDOUT_COHORT_FINGERPRINT, results: report.holdout },
    tournamentStressFuzz: report.stress,
  };
}

export function computeWeekPolicyTournamentFingerprints(): Readonly<Record<string, string>> {
  const individual = Object.fromEntries(Object.entries(buildWeekPolicyTournamentFingerprintPayloads())
    .map(([key, value]) => [key, digest(value)]));
  return { ...individual, combinedNumericPolicyTournament: digest(individual) };
}

export const WEEK_POLICY_TOURNAMENT_FOUNDATION_FINGERPRINTS = Object.freeze({
  candidateLattice: CANDIDATE_LATTICE_FINGERPRINT,
  calibrationCohort: CALIBRATION_COHORT_FINGERPRINT,
  holdoutCohort: HOLDOUT_COHORT_FINGERPRINT,
});

export const EXPECTED_WEEK_POLICY_TOURNAMENT_FINGERPRINTS: Readonly<Record<string, string>> = {
  frozenCandidateLattice: "097a115c4e8fd156dcf02e8acc6be7452feeb5cd67c08cb308406999cbfdf6bf",
  calibrationCohort: "f08159555bcdbbda2bf7d9a735e3831f543f804cb767db37e583cc72277b796d",
  holdoutCohort: "677aef37cbc6b31e11d46ad412234115b38a7abeba6226b0cdc84073b4875db1",
  atomicResults: "92b3f4c97cb410e2e498c622e07b378f6a33f7c80b8de1dfd6c7d6c0f1cf8f7a",
  compositeResults: "2ef5ab9b62d6ee804af817e9349d98f1ebd886835c4811dd0dbed432c7e9bd1e",
  hardGateResults: "730b7f1a68028ccbed6dba7d4ccfa37cb5326be7d91f072c0a4157761ed476f0",
  frameworkAdaptiveComparison: "cf035eba7b6ef53837d604a6cb8a51561b77345c65c25846922a6d8f0ac89523",
  duplicationResults: "274f00bc85c9b73124b58158fc4c9a848af69169c0de7b5abd61ae5dae878fae",
  constrainedHorizonResults: "3c5673fb4f55d1adcaee90b609ded5f19197f5ce200a3825bc32a6eddff4a15b",
  searchCostResults: "d88de0255f00fe58adc46e94e3691a74b0d49cede54b8653bea2b9adc9adc747",
  paretoFrontier: "e4e8aee5bee4ceeb1449fb00d697e03bd449abbd2ec25029c59b8ec342abc8e1",
  ownerRecommendation: "fd7bfe4329fd200789b8e0c76100fcb28a2188c998ee60507638275ec8fc7642",
  holdoutVerification: "66894e35def0969d8b44fb884756db7cc3a3124d4c203fe43a24cd5ee95722a4",
  tournamentStressFuzz: "b90b2dbf7f30b59a7063e99e799a9552b0a8eb6d8b3ea913189cdbef5ee865d9",
  combinedNumericPolicyTournament: "d16dc08712211864cc0d2dfc2762e4c20c85f6dba053c64e6599f3b08a76d905",
};

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function candidateTable(rows: ReturnType<typeof buildWeekPolicyTournamentReport>["candidateSummaries"]): string {
  return rows.map((entry) => `| ${entry.candidateId} | ${entry.classification} | ${entry.hardGateFailures} | ${percent(entry.requiredCoverageRate)} | ${entry.reservationCount} | ${entry.searchStatesExpanded} |`).join("\n");
}

export function renderWeekPolicyTournamentMarkdown(report = buildWeekPolicyTournamentReport()): string {
  return `# CAGT Weekly Numeric Policy Tournament\n\nClassification: \`${report.classification}\`.\n\nAuthority: \`${report.authority}\`. No candidate is production policy.\n\n## Execution\n\n- ${report.atomicCandidateCount} atomic candidates and ${report.compositeCandidateCount} fixed composites.\n- ${report.calibrationScenarioCount} calibration and ${report.lockedHoldoutScenarioCount} locked holdout scenarios.\n- ${report.scenarioEvaluationCount} candidate/scenario evaluations.\n- ${report.completeDownstreamPipelineCount} complete production Planner/Candidate/Composer pipelines.\n- ${report.stress.policyScenarioCases} deterministic stress combinations and ${report.stress.completeReservationToSessionPipelines} audited complete pipelines.\n\n## Results\n\n| Candidate | Classification | Hard failures | Required coverage | Reservations | Search states |\n|---|---|---:|---:|---:|---:|\n${candidateTable(report.candidateSummaries)}\n\n## Owner Review\n\n${Object.entries(report.ownerRecommendations).map(([family, value]) => `- **${family}:** \`${value.recommendation}\` - ${value.reason}`).join("\n")}\n\nThe balanced composite B1 is not activated. Design evidence is not production proof.\n`;
}

export function renderAtomicResultsMarkdown(report = buildWeekPolicyTournamentReport()): string {
  return `# CAGT Weekly Atomic Policy Results\n\nAll rows remain \`CAGT_TEST_CANDIDATE_NOT_PRODUCTION\`.\n\n| Candidate | Classification | Hard failures | Required coverage | Reservations | Search states |\n|---|---|---:|---:|---:|---:|\n${candidateTable(report.candidateSummaries.filter((entry) => entry.family !== "composite"))}\n`;
}

export function renderCompositeResultsMarkdown(report = buildWeekPolicyTournamentReport()): string {
  return `# CAGT Weekly Composite Policy Results\n\nNo composite is selected or activated.\n\n| Candidate | Classification | Hard failures | Required coverage | Reservations | Search states |\n|---|---|---:|---:|---:|---:|\n${candidateTable(report.candidateSummaries.filter((entry) => entry.family === "composite"))}\n`;
}

export function renderParetoMarkdown(report = buildWeekPolicyTournamentReport()): string {
  return `# CAGT Weekly Policy Pareto Frontier\n\nNo additive score is used. Framework collision, uniqueness, or allocation count alone cannot establish dominance.\n\n## Frontier\n\n${report.paretoFrontier.map((id) => `- \`${id}\``).join("\n")}\n\n## Dominated\n\n${report.dominatedCandidates.map((entry) => `- \`${entry.candidateId}\` by ${entry.dominatedBy.map((id) => `\`${id}\``).join(", ")}`).join("\n")}\n\nIncomparable pairs are retained in the JSON evidence (${report.incomparableCandidates.length} pairs).\n`;
}

export function renderHoldoutMarkdown(report = buildWeekPolicyTournamentReport()): string {
  return `# CAGT Weekly Policy Holdout Report\n\nThe ${report.lockedHoldoutScenarioCount}-scenario holdout was frozen independently of the ${report.calibrationScenarioCount}-scenario calibration cohort. Candidate values are not tuned after holdout inspection.\n\n${report.holdout.map((entry) => `- \`${entry.candidateId}\`: ${entry.passed ? "pass" : `fail (${entry.hardGateFailures.length})`}`).join("\n")}\n`;
}

export function renderDuplicationMarkdown(report = buildWeekPolicyTournamentReport()): string {
  return `# CAGT Weekly Policy Duplication Report\n\n| Candidate | Framework collision | Adaptive collision | Exact reservation recurrence | Assessment recurrence | Optional zero-value |\n|---|---:|---:|---:|---:|---:|\n${report.candidateSummaries.map((entry) => `| ${entry.candidateId} | ${percent(entry.frameworkCollision)} | ${percent(entry.adaptiveContentCollision)} | ${entry.exactReservationRecurrence} | ${entry.assessmentRecurrence} | ${entry.zeroMarginalValueCount} |`).join("\n")}\n\nShared frameworks are legal; suspicious adaptive sameness is evaluated separately.\n`;
}

export function renderSearchCostMarkdown(report = buildWeekPolicyTournamentReport()): string {
  return `# CAGT Weekly Policy Search Cost Report\n\nNo production search bound is selected.\n\n| Candidate | States expanded | Inconclusive rate | Reservations |\n|---|---:|---:|---:|\n${report.candidateSummaries.map((entry) => `| ${entry.candidateId} | ${entry.searchStatesExpanded} | ${percent(entry.searchInconclusiveRate)} | ${entry.reservationCount} |`).join("\n")}\n`;
}

export function renderOwnerRecommendationMarkdown(report = buildWeekPolicyTournamentReport()): string {
  return `# CAGT Weekly Policy Owner Recommendation\n\nThese are CAGT recommendations for owner review, not production authority.\n\n${Object.entries(report.ownerRecommendations).map(([family, value]) => `## ${family[0].toUpperCase()}${family.slice(1)}\n\n- Recommendation: \`${value.recommendation}\`\n- Classification: \`${value.classification}\`\n- Evidence: ${value.reason}\n`).join("\n")}\nProduction numeric policy activated: **no**.\n`;
}

export function renderAdmissionReadinessMarkdown(report = buildWeekPolicyTournamentReport()): string {
  return `# CAGT Weekly Policy Admission Readiness\n\nClassification: \`${report.classification}\`.\n\nThe executable adapter, immutable Gate 0-12 ordering, locked holdout, downstream production feasibility checks, and deterministic stress harness are ready. Numeric activation remains blocked by owner selection, unresolved H1/H2 distribution, unproven D2/C2/R1 marginal value, Prescription-dependent dose and spacing, production Week implementation, and final production validation.\n\nNo production behavior or public package export changed.\n`;
}
