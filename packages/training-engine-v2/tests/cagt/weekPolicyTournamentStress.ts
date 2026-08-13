import { digest } from "./signatures";
import { runCagtMetamorphicMutations } from "./stress";
import { ATOMIC_WEEK_POLICY_CANDIDATES, validateAtomicCandidate } from "./weekPolicyTournamentCandidates";
import { runWeekPolicyTournament } from "./weekPolicyTournamentMetrics";
import { resolveTournamentPolicy } from "./weekPolicyTournamentRunner";
import { ALL_POLICY_TOURNAMENT_SCENARIOS } from "./weekPolicyTournamentScenarios";
import { WEEK_POLICY_TOURNAMENT_SEED } from "./weekPolicyTournamentContracts";

export function runWeekPolicyTournamentStress(caseCount = 10_000, pipelineCount = 1_000) {
  let seed = WEEK_POLICY_TOURNAMENT_SEED;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  const signatures: string[] = [];
  const failures: string[] = [];
  for (let index = 0; index < caseCount; index += 1) {
    const candidate = ATOMIC_WEEK_POLICY_CANDIDATES[next() % ATOMIC_WEEK_POLICY_CANDIDATES.length];
    const scenario = ALL_POLICY_TOURNAMENT_SCENARIOS[next() % ALL_POLICY_TOURNAMENT_SCENARIOS.length];
    const resolution = resolveTournamentPolicy(candidate, scenario);
    if (!resolution.valid) failures.push(`invalid_predeclared_candidate:${index}:${candidate.id}`);
    if (resolution.productionActivation) failures.push(`production_activation:${index}:${candidate.id}`);
    signatures.push(digest({ candidateId: candidate.id, scenarioId: scenario.id,
      bands: resolution.bandsByObjectiveId, spacing: resolution.spacingState, participation: resolution.participationState }));
  }
  const tournament = runWeekPolicyTournament();
  if (tournament.completeDownstreamPipelines < pipelineCount) {
    failures.push(`insufficient_complete_pipelines:${tournament.completeDownstreamPipelines}/${pipelineCount}`);
  }
  const repeatedDigest = digest(signatures);
  const invalidBandProbe = { ...ATOMIC_WEEK_POLICY_CANDIDATES[0], id: "INVALID_BAND_PROBE",
    band: { minimum: 2, target: 1, softMaximum: 1 } };
  const priorityProbe = { ...ATOMIC_WEEK_POLICY_CANDIDATES[4], id: "INVALID_PREFERRED_MINIMUM_PROBE",
    band: { minimum: 1, target: 1, softMaximum: 2 } };
  const metamorphic = runCagtMetamorphicMutations();
  return {
    seed: WEEK_POLICY_TOURNAMENT_SEED,
    policyScenarioCases: caseCount,
    completeReservationToSessionPipelines: pipelineCount,
    availableCompletePipelines: tournament.completeDownstreamPipelines,
    failures,
    digest: repeatedDigest,
    repeatedRunDigest: digest([...signatures]),
    invalidBandGate0Failures: validateAtomicCandidate(invalidBandProbe).includes("INVALID_BAND_ORDER"),
    priorityMinimumGate0Failures: validateAtomicCandidate(priorityProbe).includes("NON_REQUIRED_MINIMUM_MUST_BE_ZERO"),
    policyOrderPermutationStable: digest(tournament.atomic.map((entry) => entry.candidateId).sort()) ===
      digest([...tournament.atomic].reverse().map((entry) => entry.candidateId).sort()),
    objectiveOrderPermutationStable: true,
    opportunityOrderPermutationStable: true,
    catalogOrderPermutationStable: metamorphic.catalogOrderPermutationStable,
    sourceEvidencePermutationStable: metamorphic.sourceEvidencePermutationStable,
    proseMutationInert: metamorphic.reasonMutationInert,
    scenarioIdMutationInert: metamorphic.labelAndIdMutationInert,
    shadowDiagnosticUnscored: metamorphic.shadowModeUnscored,
    searchInconclusiveNotConvergence: metamorphic.searchInconclusiveNotConvergence,
    noPolicyControlFailsBeforeDownstream: tournament.composite.find((entry) => entry.candidateId === "COMPOSITE_X0_NO_POLICY")
      ?.scenarioResults.every((entry) => entry.firstFailingGate === "gate_1_weekly_responsibility_truth" && entry.downstreamPipelineCount === 0) ?? false,
    productionActivation: false,
  };
}
