import { CAGT_GATE_ORDER } from "./contracts";
import { EXPECTED_CAGT_FINGERPRINTS } from "./report";
import { digest } from "./signatures";
import { COHERENT_SESSION_SCENARIOS, SESSION_PROGRAM_INVARIANT } from "./coherentSessionProgram";
import { runWeekPolicyV1Admission, runWeekPolicyV1Stress } from "./weekPolicyV1Admission";
import {
  WEEK_POLICY_V1_AS_OF, WEEK_POLICY_V1_COMPOSITE, WEEK_POLICY_V1_OWNER_SELECTION,
  WEEK_POLICY_V1_SCOPE_COVERAGE, WEEK_POLICY_V1_SEED, WEEK_POLICY_V1_STATE, WEEK_POLICY_V1_VERSION,
} from "./weekPolicyV1Contracts";
import {
  EXPECTED_WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT, WEEK_POLICY_V1_HOLDOUT_MANIFEST,
  WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT,
} from "./weekPolicyV1Holdout";

export const FROZEN_PRODUCTION_FINGERPRINTS = Object.freeze({
  candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
  candidateComprehensive: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
  catalog: "bfb21d7dc91504de5da8f4cd92850c8bb97ca5a0ce5f65624d2db4971d5e1a91",
  knowledge: "e31f864adaa0707a22bfb92d172fc596476acc923fe023cedf3abfd3ece8ac73",
  sessionComposer: "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
  sessionIntentPlanner: "b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab",
  weekDesign: "903d034e50b2c210ad7ffee011e267e4f4d7ff9b396d9735a49f276909137047",
  policyHorizon: "ac7949f93f1ee3688f6c87ed316d89c886081853fa6cb7fab5746815187563cc",
  cagtCore: "80906606b78c2918137b4e5b13a4cd4fdabb8b424b7e6425c877d2b3b8cb504e",
  numericPolicyTournament: "d16dc08712211864cc0d2dfc2762e4c20c85f6dba053c64e6599f3b08a76d905",
});

export function buildWeekPolicyV1FingerprintPayloads() {
  const admission = runWeekPolicyV1Admission();
  const coherence = admission.coherentSession.results;
  const scenarioById = new Map(COHERENT_SESSION_SCENARIOS.map((entry) => [entry.id, entry]));
  const sectionResults = (archetype: "warmup" | "activation") => coherence.filter((entry) => {
    const scenario = scenarioById.get(entry.scenarioId)!;
    return archetype === "warmup" ? scenario.archetype.includes("warmup") : scenario.archetype.includes("activation");
  });
  return {
    ownerV1Selection: WEEK_POLICY_V1_OWNER_SELECTION,
    v1ScopedRuleSet: WEEK_POLICY_V1_SCOPE_COVERAGE,
    v1Composite: WEEK_POLICY_V1_COMPOSITE,
    newHoldoutManifest: WEEK_POLICY_V1_HOLDOUT_MANIFEST,
    calibrationResult: { passed: admission.calibrationPassed, count: admission.calibrationScenarioCount,
      requiredCoverageRate: admission.requiredCoverageRate },
    holdoutResult: { passed: admission.holdoutPassed, count: admission.holdoutScenarioCount,
      supportedCount: admission.supportedHoldoutScenarioCount, scopeGaps: admission.scopeGapResults },
    policyScopeCoverage: admission.scopeCoverage,
    coherentSessionInvariant: { invariant: SESSION_PROGRAM_INVARIANT, gateOrder: CAGT_GATE_ORDER,
      results: coherence.map((entry) => [entry.scenarioId, entry.result, entry.sessionProgramArgumentSignature]) },
    warmupOwnership: sectionResults("warmup").map((entry) => [entry.scenarioId, entry.result,
      entry.warmupNeedSignature, entry.preparationAssignmentSignature]),
    activationOwnership: sectionResults("activation").map((entry) => [entry.scenarioId, entry.result,
      entry.activationNeedSignature, entry.activationAssignmentSignature]),
    dependencyToFinalSelection: coherence.map((entry) => [entry.scenarioId, entry.dependencyGraphSignature,
      entry.mainAssignmentSignature, entry.failures]),
    firstSessionCanary: admission.firstSessionCanaries,
    allSessionHorizon: { passed: admission.allSessionHorizonPassed,
      completePipelines: admission.completeDownstreamPipelineCount },
    warmupRecurrence: coherence.filter((entry) => entry.recurrenceLane === "warmup")
      .map((entry) => [entry.scenarioId, entry.recurrence, entry.warmupIds]),
    activationRecurrence: coherence.filter((entry) => entry.recurrenceLane === "activation")
      .map((entry) => [entry.scenarioId, entry.recurrence, entry.activationIds]),
    assessmentVersusPreparationLanes: coherence.map((entry) => [entry.scenarioId,
      entry.failures.includes("ASSESSMENT_CLUSTER_MULTIPLICATION"), entry.warmupIds, entry.activationIds]),
    sectionAntiBloat: coherence.map((entry) => [entry.scenarioId, entry.warmupIds.length, entry.activationIds.length,
      entry.failures.filter((failure) => failure.includes("GENERIC") || failure.includes("OPTIONAL"))]),
    sessionProgramArgument: coherence.map((entry) => [entry.scenarioId, entry.result,
      entry.sessionProgramArgumentSignature, entry.sequencingGraphAcyclic]),
    v1AdmissionResult: { classification: admission.classification, hardFailures: admission.hardCagtFailures,
      underAdaptation: admission.underAdaptation, overAdaptation: admission.overAdaptation,
      downstreamRescueAttempts: admission.downstreamRescueAttempts, productionActivation: admission.productionActivation },
  };
}

export function computeWeekPolicyV1Fingerprints(): Readonly<Record<string, string>> {
  const individual = Object.fromEntries(Object.entries(buildWeekPolicyV1FingerprintPayloads())
    .map(([key, value]) => [key, digest(value)]));
  return { ...individual, combinedWeekPolicyV1Admission: digest(individual) };
}

export const EXPECTED_WEEK_POLICY_V1_FINGERPRINTS: Readonly<Record<string, string>> = {
  ownerV1Selection: "819f7bc12040c210a2e60e5b7f9cce6242c341189615f83e3b6b20f63505baaa",
  v1ScopedRuleSet: "7d786d74c32431873a400936ffef538062fde12825c9cfae6095c8da531f3786",
  v1Composite: "8f88010ccaa618c07a4233596ef47b8c641b19d171cef8e6a3da32eb71c31cea",
  newHoldoutManifest: "6edc62f933676e500fdfaac8af5a15e6294df23b587d0edbf1cd0c54c0a07ab3",
  calibrationResult: "0c0fea599b9776d588989a722973709b2310f02635748543ad0f6696a89d09f7",
  holdoutResult: "416ee1262459066f065d4b9c2f023315045d4137395953a7352b1f9900d4f5af",
  policyScopeCoverage: "7d786d74c32431873a400936ffef538062fde12825c9cfae6095c8da531f3786",
  coherentSessionInvariant: "cdeedd41854495ce331220ca5ee1d89079a0c77b28bbc962fc486a4f24621a0d",
  warmupOwnership: "b5ac326d0191b54cf9a66baf4237b235b74051603a6adc8f9805d85206eea0a2",
  activationOwnership: "fc4e508ea80dc573890b6ee986e22e461e4aa5d82a823bec921ce9d2fefa4b93",
  dependencyToFinalSelection: "9736403a29f1a5416cc99a223fe55e137ca76edbe15274ce11b9f445a9d87522",
  firstSessionCanary: "8e1e428c4be7ab0786eb01dd5b22da817f20160a1817008d108370737613f6d6",
  allSessionHorizon: "80c16e03fd4dbbb12b065022cba28e08555254409098ba8427b21d1ad13a0e6a",
  warmupRecurrence: "6dd1cd538f3ce2481d1cd1c9ed156f3eee0f4c109a72cf9b20280f71ae0b597a",
  activationRecurrence: "c6c5aaeb9e02c9172ece149c601126c710e10c454627b993345d054fb2956123",
  assessmentVersusPreparationLanes: "e0f136d172bde4b7ee2a909e27da08b1e2c930da55075fe9c260e657acaef3c1",
  sectionAntiBloat: "95127e32e8c4f87929e8e97f8f33974f1e536b70d454f306dcda6cfa111f0673",
  sessionProgramArgument: "f83e6724f917dcd970ed90385800fc4a57d0a74973077581d6d63f38725ffaf0",
  v1AdmissionResult: "b2ce4acce41de733ce71a7d1aac9bc35f961a946bee25e7f9f050fbccbbf49bb",
  combinedWeekPolicyV1Admission: "21aac891d3ee9cd21e0a09bb1ec1b965d05addc0a72f4418890969bbbe60c1db",
};

export function buildWeekPolicyV1Report() {
  const admission = runWeekPolicyV1Admission();
  const stress = runWeekPolicyV1Stress();
  const results = admission.coherentSession.results;
  return {
    version: WEEK_POLICY_V1_VERSION, asOf: WEEK_POLICY_V1_AS_OF, seed: WEEK_POLICY_V1_SEED,
    authority: "WEEK_POLICY_V1_OWNER_ADMISSION_AND_COHERENT_SESSION_PROGRAM_CAGT",
    candidateState: WEEK_POLICY_V1_STATE, selectedRules: WEEK_POLICY_V1_OWNER_SELECTION,
    ...admission, stress, immutableGateOrder: CAGT_GATE_ORDER,
    manifestFingerprintExpected: EXPECTED_WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT,
    manifestFingerprintMatched: WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT ===
      EXPECTED_WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT,
    warmupRecurrenceClassifications: [...new Set(results.filter((entry) => entry.recurrenceLane === "warmup")
      .flatMap((entry) => entry.recurrence ? [entry.recurrence] : []))].sort(),
    activationRecurrenceClassifications: [...new Set(results.filter((entry) => entry.recurrenceLane === "activation")
      .flatMap((entry) => entry.recurrence ? [entry.recurrence] : []))].sort(),
    productionFingerprints: FROZEN_PRODUCTION_FINGERPRINTS,
    cagtCoreFingerprint: EXPECTED_CAGT_FINGERPRINTS.combinedCagtTool,
    fingerprints: computeWeekPolicyV1Fingerprints(),
  };
}

function percent(value: number): string { return `${(value * 100).toFixed(1)}%`; }
function json(value: unknown): string { return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``; }
function title(name: string, report = buildWeekPolicyV1Report()): string {
  return `# ${name}\n\nClassification: \`${report.classification}\`.\n\nCandidate state: \`${report.candidateState}\`. Production activation: **no**.\n`;
}

export function renderOwnerSelection(report = buildWeekPolicyV1Report()): string {
  return `${title("Week Policy V1 Owner Selection", report)}\n## Week Policy V1 Causal Core Candidate\n\n${json(report.selectedRules)}\n\nH1 is selected. H2 is deferred pending Prescription-informed distribution evidence. D2 and C2 are deferred because neither established unique executable repeat value.\n`;
}
export function renderAdmission(report = buildWeekPolicyV1Report()): string {
  return `${title("CAGT Week Policy V1 Admission Report", report)}\n- Calibration: ${report.calibrationPassed ? "pass" : "fail"} (${report.calibrationScenarioCount} scenarios)\n- Locked holdout: ${report.holdoutPassed ? "pass" : "fail"} (${report.holdoutScenarioCount} scenarios)\n- Complete downstream pipelines: ${report.completeDownstreamPipelineCount}\n- Hard CAGT failures: ${report.hardCagtFailures}\n- Required weekly coverage: ${percent(report.requiredCoverageRate)}\n- First-session canary: ${report.firstSessionCanaryPassed ? "pass" : "fail"}\n- All-session horizon: ${report.allSessionHorizonPassed ? "pass" : "fail"}\n\nThe selected causal core is admitted only for covered scope. Eight policy scopes remain explicit blockers to full-scope production Week authorization.\n`;
}
export function renderHoldoutManifest(): string {
  return `# CAGT Week Policy V1 Holdout Manifest\n\nFingerprint: \`${WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT}\`.\n\nFrozen before execution: **yes**. Prior 23-scenario holdout IDs excluded: **yes**. Fixed seed: \`${WEEK_POLICY_V1_SEED}\`.\n\n${WEEK_POLICY_V1_HOLDOUT_MANIFEST.scenarios.map((entry) => `- \`${entry.id}\`: \`${entry.policyScope}\` -> \`${entry.expectedPolicyStatus}\``).join("\n")}\n`;
}
export function renderHoldoutReport(report = buildWeekPolicyV1Report()): string {
  return `${title("CAGT Week Policy V1 Holdout Report", report)}\nManifest: \`${report.manifestFingerprint}\` (${report.manifestFingerprintMatched ? "matched" : "mismatch"}).\n\n${report.scopeGapResults.map((entry) => `- \`${entry.scenarioId}\`: \`${entry.status}\``).join("\n")}\n\nSupported V1 scenarios pass without tuning after holdout inspection. Scope-gap rows abstain with \`WEEKLY_POLICY_REQUIRED\`.\n`;
}
export function renderScopeCoverage(report = buildWeekPolicyV1Report()): string {
  return `${title("CAGT Week Policy V1 Scope Coverage", report)}\n| Scope | Status | Rule |\n|---|---|---|\n${report.scopeCoverage.map((entry) => `| ${entry.scope} | ${entry.status} | ${entry.rule} |`).join("\n")}\n`;
}
export function renderCoherentSession(report = buildWeekPolicyV1Report()): string {
  return `${title("CAGT Coherent Session Program Report", report)}\nInvariant: ${SESSION_PROGRAM_INVARIANT}\n\n- Scenarios: ${report.coherentSession.scenarioCount}\n- Hard failures: ${report.coherentSession.hardFailureCount}\n- Warm-up ownership: ${report.coherentSession.warmupOwnershipPassed ? "pass" : "fail"}\n- Activation ownership: ${report.coherentSession.activationOwnershipPassed ? "pass" : "fail"}\n- Dependency graph acyclic: ${report.coherentSession.results.every((entry) => entry.sequencingGraphAcyclic) ? "yes" : "no"}\n\nEmpty warm-up and activation sections remain valid. Populated assignments require a typed objective and active dependency to final selected work.\n`;
}
export function renderCoherenceMatrix(report = buildWeekPolicyV1Report()): string {
  return `${title("CAGT Warm-up Activation Coherence Matrix", report)}\n| Scenario | Result | Warm-up | Activation | Main | Failures |\n|---|---|---|---|---|---|\n${report.coherentSession.results.map((entry) => `| ${entry.scenarioId} | ${entry.result} | ${entry.warmupIds.join(", ") || "empty"} | ${entry.activationIds.join(", ") || "empty"} | ${entry.mainIds.join(", ") || "empty"} | ${entry.failures.join(", ") || "none"} |`).join("\n")}\n`;
}
export function renderRecurrence(report = buildWeekPolicyV1Report()): string {
  return `${title("CAGT Warm-up Activation Recurrence Report", report)}\nWarm-up classifications: ${report.warmupRecurrenceClassifications.map((entry) => `\`${entry}\``).join(", ") || "none observed"}.\n\nActivation classifications: ${report.activationRecurrenceClassifications.map((entry) => `\`${entry}\``).join(", ") || "none observed"}.\n\nNo generic every-day recurrence is admitted. Mutation rows demonstrate rejection of generic filler and stale recurrence.\n`;
}
export function renderSessionArgument(report = buildWeekPolicyV1Report()): string {
  return `${title("CAGT Session Program Argument Report", report)}\nEvery passing populated preparation assignment has a structured need, a legal section/role identity, and a dependency to selected main work. Final-selection changes are revalidated; stale preparation, orphan activation, cross-section identity duplication, assessment multiplication, preparation dose credit, and downstream rescue mutations are rejected.\n\nArgument signatures: ${report.coherentSession.results.length}; hard failures: ${report.coherentSession.hardFailureCount}.\n`;
}
export function renderFirstCanary(report = buildWeekPolicyV1Report()): string {
  return `${title("CAGT First Session Canary Report", report)}\nResult: **${report.firstSessionCanaryPassed ? "pass" : "fail"}**. A first-session failure stops later horizon scoring.\n\n| Scenario | State | First failing gate | Later sessions scored |\n|---|---|---|---|\n${report.firstSessionCanaries.map((entry) => `| ${entry.scenarioId} | ${entry.state} | ${entry.firstFailingGate ?? "none"} | ${entry.laterSessionsScored} |`).join("\n")}\n`;
}
export function renderHorizon(report = buildWeekPolicyV1Report()): string {
  return `${title("CAGT All Sessions Horizon Report", report)}\nResult: **${report.allSessionHorizonPassed ? "pass" : "fail"}**. All ${report.completeDownstreamPipelineCount} materialized reservation-to-session pipelines preserve causal gate order; no later session compensates for an earlier failure.\n`;
}
export function renderReadiness(report = buildWeekPolicyV1Report()): string {
  const gaps = report.scopeCoverage.filter((entry) => entry.status === "unresolved");
  return `${title("Week Policy V1 Implementation Readiness", report)}\nRecommendation: \`${report.classification}\`.\n\nThe covered numeric core is ready for a separate production Week implementation authorization. It is not activated here. Remaining policy gaps:\n\n${gaps.map((entry) => `- \`${entry.scope}\`: \`${entry.rule}\``).join("\n")}\n\nProduction Week Planner/Composer, Prescription-informed distribution and spacing, final Sequencing, and Longitudinal Adaptation remain outside this authorization.\n`;
}
