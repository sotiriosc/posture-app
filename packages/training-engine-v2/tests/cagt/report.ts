import { CAGT_DIFFERENCE_DIMENSIONS, CAGT_GATE_AUTHORITY, CAGT_GATE_ORDER, CAGT_VERSION } from "./contracts";
import { buildCuratedCagtPairs, buildFourDayFrameworkCohort, runCuratedCagtPairs } from "./cohorts";
import { runCagtHumanLikeChains } from "./humanChains";
import { runCagtProductHorizonAdapter } from "./horizonAdapter";
import { runCagtWeekPolicyCalibration } from "./policyAdapter";
import { summarizeGateStates } from "./runner";
import { collisionRate, digest } from "./signatures";
import { buildNoRescueMutation, runCagtCounterfactualStress, runCagtExecutablePipelineStress,
  runCagtMetamorphicMutations } from "./stress";
import { CAGT_THRESHOLD_REGISTRY } from "./thresholds";
import { runCagtPair } from "./runner";

export const CAGT_METHOD_DEFINITION = "Causal Adaptation Gate Testing is a hierarchical counterfactual testing method in which a controlled input change is assigned to its canonical owner, the earliest layer legally permitted to respond, the latest layer by which a meaningful response is required, and the output dimensions allowed to change. Upstream invariants are protected, expected convergence is distinguished from unresponsiveness, and downstream variation cannot compensate for an earlier causal failure.";
export const CAGT_CONVERGENCE_CLASSIFICATIONS = ["EXPECTED_CONVERGENCE", "JUSTIFIED_CONVERGENCE", "MATERIAL_ADAPTATION",
  "OPTIONAL_VARIATION", "DIFFERENCE_DEFERRED_TO_LATER_OWNER", "TRACE_ONLY_DIFFERENCE_NOT_SUFFICIENT", "SUSPICIOUS_CONVERGENCE",
  "UNRESPONSIVE_TO_MATERIAL_INPUT", "OVER_ADAPTATION", "WRONG_LAYER_EFFECT", "DOWNSTREAM_RESCUE_REJECTED"] as const;
export const CAGT_DUPLICATION_CLASSIFICATIONS = ["PRODUCTIVE_STABILITY", "EXPECTED_FRAMEWORK", "JUSTIFIED_SHARED_SOLUTION",
  "OPTIONAL_REDUNDANCY", "ASSESSMENT_OVERREPETITION", "TEMPLATE_COLLISION", "UNKNOWN_REQUIRES_REVIEW"] as const;

export function buildCagtDuplicationBaseline(cohort = buildFourDayFrameworkCohort()) {
  return { frameworkRecurrence: collisionRate(cohort.map((entry) => entry.framework)),
    weeklyObjectiveRecurrence: collisionRate(cohort.map((entry) => entry.weeklyResponsibility)),
    allocationRecurrence: collisionRate(cohort.map((entry) => entry.weeklyAllocation)),
    selectedAnchorRecurrence: null, supportingWorkRecurrence: null, exactFullSessionRecurrence: null,
    optionalAccessoryRecurrence: null, assessmentWorkRecurrence: null, p0Recurrence: null,
    exerciseIdentityRecurrence: null, prescriptionHandoffRecurrence: null, repRecurrence: null,
    nullMeaning: "future_or_unavailable_gate_observe_only", classifications: CAGT_DUPLICATION_CLASSIFICATIONS };
}

export function buildCagtReportData(input: { stressCases?: number; pipelineCases?: number } = {}) {
  const curated = runCuratedCagtPairs(); const cohort = buildFourDayFrameworkCohort();
  const noRescue = runCagtPair({ ...buildNoRescueMutation(), shadowAfterFailure: true });
  const stress = runCagtCounterfactualStress(input.stressCases ?? 10_000);
  const pipelines = runCagtExecutablePipelineStress(input.pipelineCases ?? 1_000);
  const data = { version: CAGT_VERSION, method: CAGT_METHOD_DEFINITION,
    classification: "CAGT_READY_FOR_POLICY_ADMISSION_USE", gateSummary: summarizeGateStates(curated),
    curatedPairCount: curated.length, curatedPassCount: curated.filter((entry) => entry.finalScoredResult === "PASS").length,
    firstMeaningfulDifferences: curated.map((entry) => ({ contractId: entry.contractId,
      expectedWindow: [entry.expectedEarliestGate, entry.expectedLatestGate], firstMaterialDifference: entry.actualFirstMaterialDifferenceGate,
      classification: entry.classification, firstFailingGate: entry.firstFailingGate, noRescue: !entry.downstreamRescueAttempted })),
    fourDayCohort: { size: cohort.length, everyRowHasFourConfirmedOpportunities: cohort.every((entry) => entry.confirmedOpportunities === 4),
      frameworkCollisionRate: collisionRate(cohort.map((entry) => entry.framework)),
      adaptiveContentCollisionRate: collisionRate(cohort.map((entry) => entry.adaptiveSignature)), rows: cohort },
    duplication: buildCagtDuplicationBaseline(cohort), noRescue: { classification: noRescue.classification,
      firstFailingGate: noRescue.firstFailingGate, downstreamRescueAttempted: noRescue.downstreamRescueAttempted,
      downstreamDifferencesScored: noRescue.downstreamDifferencesScored,
      shadowUnscored: noRescue.gateResults.filter((entry) => entry.diagnosticOnly).every((entry) => !entry.scored) },
    policyCalibration: runCagtWeekPolicyCalibration(), productHorizon: runCagtProductHorizonAdapter(),
    humanLikeChains: runCagtHumanLikeChains(), stress, pipelines, metamorphic: runCagtMetamorphicMutations(),
    thresholdRegistry: CAGT_THRESHOLD_REGISTRY,
    observedMetrics: ["framework_collision_rate", "weekly_responsibility_collision_rate", "allocation_collision_rate",
      "session_need_collision_rate", "candidate_pool_collision_rate", "session_skeleton_collision_rate", "anchor_recurrence",
      "supporting_work_recurrence", "exact_session_recurrence", "p0_recurrence", "optional_accessory_recurrence",
      "assessment_recurrence", "same_rep_placeholder_rate", "first_material_difference_gate_distribution"],
    productionBehaviorChanged: false, limitations: ["post_prescription_week_validation_not_implemented",
      "full_prescribed_program_comparison_not_implemented", "phase_continuity_not_implemented",
      "longitudinal_decision_authority_not_implemented", "week_and_horizon_evidence_design_only"] };
  return { ...data, reportFingerprint: digest(data) };
}

export function buildCagtFingerprintPayloads() {
  const report = buildCagtReportData(); const pairs = buildCuratedCagtPairs();
  return { methodDefinition: CAGT_METHOD_DEFINITION, gateOrder: CAGT_GATE_ORDER, causalContract: pairs[0].contract,
    differenceVocabulary: CAGT_DIFFERENCE_DIMENSIONS, convergenceClassifications: CAGT_CONVERGENCE_CLASSIFICATIONS,
    noRescuePolicy: report.noRescue, thresholdRegistry: CAGT_THRESHOLD_REGISTRY,
    frameworkSignature: report.fourDayCohort.rows.map((entry) => entry.framework),
    adaptiveSignatures: report.fourDayCohort.rows.map((entry) => entry.adaptiveSignature),
    fixtureValidator: report.firstMeaningfulDifferences.map((entry) => [entry.contractId, entry.firstFailingGate]),
    firstDifferenceDetector: report.firstMeaningfulDifferences.map((entry) => entry.firstMaterialDifference),
    underAdaptationDetector: "latest_rightful_gate_without_material_response_fails",
    overAdaptationDetector: "material_response_before_earliest_gate_fails",
    shadowDiagnosticMode: report.noRescue.shadowUnscored, curatedPairMatrix: report.firstMeaningfulDifferences,
    fourDayFrameworkCohort: report.fourDayCohort, duplicationBaseline: report.duplication,
    policyCalibrationAdapter: report.policyCalibration, productHorizonAdapter: report.productHorizon,
    humanLikeChains: report.humanLikeChains, fuzzMetamorphicResults: { stress: report.stress, pipelines: report.pipelines,
      metamorphic: report.metamorphic }, implementationReadiness: { classification: report.classification,
      productionBehaviorChanged: false, limitations: report.limitations } };
}
export function computeCagtFingerprints(): Readonly<Record<string, string>> {
  const individual = Object.fromEntries(Object.entries(buildCagtFingerprintPayloads()).map(([key, value]) => [key, digest(value)]));
  return { ...individual, combinedCagtTool: digest(individual) };
}
export const EXPECTED_CAGT_FINGERPRINTS: Readonly<Record<string, string>> = {
  methodDefinition: "fe173e09dbd3c7f1f420522672afee55bfcec3ba37ea6df1f8af43bee232cd21",
  gateOrder: "92e0aa909adf65fc47e141fc1a647ea8b381facdd0b218f08145b3e15f1de6c8",
  causalContract: "f7f151d12fa30dc3aecfe668f63364c0ffaa58dbecb1bfde464552a6e9126b40",
  differenceVocabulary: "41baac1fec9700ec7d923f54bcfdce55d7c012e612163893fa9f44e447195cea",
  convergenceClassifications: "1882c3b73fd7a936daea3a8a93d6a00da10c27b15fcf721591c5e3107a1545bd",
  noRescuePolicy: "a719c628a55ded10f98019d803a147c38206705a79478850f8b292d8ccbb3ab6",
  thresholdRegistry: "e5fd7961df8a056e1c4a7f20c315d7d21f5c10bae977edf714e8e52186d08522",
  frameworkSignature: "72ca7ecf66346cb31d2ffe42c74242aa204de6ef6b6b0bdcb2e6e798966e0e14",
  adaptiveSignatures: "fc34c4ab2170df4d011792377fbc2077fb1b9d2212985e79fafa59e13f9479c5",
  fixtureValidator: "6018ede0f2528a1c8e507875ca00c822d8aba98d2aa61cea02262cc83dafca78",
  firstDifferenceDetector: "4bfdb6ab513d8a883723c17ec1d0a56be803d8ac83283b9087b40d14001e5678",
  underAdaptationDetector: "f0e175831984fb84a7b3f2911aff92dc9b66cbb41ed3b888df79503055f933cd",
  overAdaptationDetector: "224abf4dcdee4da72972e6a2d587b3318bc30100189fc8de16baa6908d04c38c",
  shadowDiagnosticMode: "b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b",
  curatedPairMatrix: "40db44cfb03be8c3f21f76014c979a914aab8cf93c5c0ddbfca6a229c26b89e1",
  fourDayFrameworkCohort: "697fef9113d43ed30d63030b8a8719c7615fed78d9579c6d1675435bcb6feb6e",
  duplicationBaseline: "edb177ce57ea5f74e2e6aff9fce5574e55109e196f3bc9cbf998144fdc95d03e",
  policyCalibrationAdapter: "e60a5e056371d6faa13efdc3f2caccbae2b629830511698ef709ea03c79941d1",
  productHorizonAdapter: "1ef6a4736713ff756801c3f17b98a24ef7072f633c1e9fb0329f09bdc88c9272",
  humanLikeChains: "aaacaf9b0a5c2dbe39092e529d670e6ca7c09b504c26a3667961f21ead7a5050",
  fuzzMetamorphicResults: "01d3ce4b70520d049da9ca81ffb1d30910f77481fde1526af080627dbf232433",
  implementationReadiness: "4ae59b8f0172ee3ce9a7a37db811a76acf095a248da6616f537477db6b71aeab",
  combinedCagtTool: "80906606b78c2918137b4e5b13a4cd4fdabb8b424b7e6425c877d2b3b8cb504e",
};

export function renderCagtMarkdown(data = buildCagtReportData()): string {
  const gateRows = data.gateSummary.map((row) => `| ${row.gate} | ${row.authority} | ${row.pass} | ${row.justifiedConvergence} | ${row.deferred} | ${row.failStop} | ${row.notReached} |`).join("\n");
  const pairRows = data.firstMeaningfulDifferences.map((row) => `| ${row.contractId} | ${row.expectedWindow.filter(Boolean).join(" to ") || "none"} | ${row.firstMaterialDifference ?? "none"} | ${row.classification} | ${row.firstFailingGate ?? "none"} | ${row.noRescue} |`).join("\n");
  return `# CAGT Gated Stress Report\n\nClassification: \`${data.classification}\`.\n\n${data.method}\n\n## Gate Summary\n\n| Gate | Authority | Pass | Justified convergence | Deferred | Fail-stop | Not reached |\n|---|---|---:|---:|---:|---:|---:|\n${gateRows}\n\n## Causal Pairs\n\n| Pair | Expected window | First material difference | Classification | First failing gate | No rescue |\n|---|---|---|---|---|---|\n${pairRows}\n\n## Stress\n\n- One-variable pairs: ${data.stress.cases}; failures: ${data.stress.failures.length}; digest: \`${data.stress.digest}\`.\n- Executable pipelines: ${data.pipelines.cases}; failures: ${data.pipelines.failures.length}; digest: \`${data.pipelines.digest}\`.\n- Four-day cohort: ${data.fourDayCohort.size}; framework collision: ${data.fourDayCohort.frameworkCollisionRate}; adaptive collision: ${data.fourDayCohort.adaptiveContentCollisionRate}.\n- Downstream rescue mutation: ${data.noRescue.classification}; downstream differences scored: ${data.noRescue.downstreamDifferencesScored}.\n\nDesign-only evidence is not production proof. Not-implemented gates do not pass.\n`;
}

export const CAGT_GATE_AUTHORITY_REPORT = CAGT_GATE_AUTHORITY;
