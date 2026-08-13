import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES,
  PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST,
  PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST_FINGERPRINT,
  PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES,
  PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_FINGERPRINT,
  PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_MANIFEST,
  buildPrescriptionNumericCalibrationScenarios,
  buildPrescriptionNumericLockedHoldoutScenarios,
  buildPrescriptionNumericTournamentReport,
  computePrescriptionNumericTournamentFingerprints,
  renderPrescriptionAtomicResultsMarkdown,
  renderPrescriptionCandidateManifestMarkdown,
  renderPrescriptionCompositeResultsMarkdown,
  renderPrescriptionHoldoutMarkdown,
  renderPrescriptionNumericTournamentMarkdown,
  renderPrescriptionOwnerRecommendationMarkdown,
  renderPrescriptionParetoMarkdown,
  renderSimpleReport,
} from "../tests/cagt/prescriptionPolicyTournament";
import {
  CURRENT_NUMERIC_TOURNAMENT_DISPOSITION,
  CURRENT_NUMERIC_TOURNAMENT_PROVISIONAL_CLASSIFICATION,
  CURRENT_NUMERIC_TOURNAMENT_RETAINED_FINGERPRINT,
  DISCLOSED_REGRESSION_COHORT_DISPOSITION,
} from "../tests/cagt/prescriptionTournamentEvaluatorHardening";
import { digest } from "../tests/cagt/signatures";

const report = buildPrescriptionNumericTournamentReport();
const fingerprints = computePrescriptionNumericTournamentFingerprints();
const docs = resolve(process.cwd(), "../../docs/training-engine-v2");

function candidateSummary(entry: (typeof report.tournament.atomic)[number]) {
  const { scenarioResults, ...summary } = entry;
  const countBy = <T extends string>(values: readonly T[]): Readonly<Record<T, number>> =>
    Object.freeze(values.reduce<Record<T, number>>((acc, value) => {
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    }, {} as Record<T, number>));
  return {
    ...summary,
    scenarioResultCount: scenarioResults.length,
    scenarioResultsFingerprint: digest(scenarioResults),
    statusCounts: countBy(scenarioResults.map((scenario) => scenario.status)),
    durationDeterminabilityCounts: countBy(scenarioResults.map((scenario) => scenario.durationDeterminability)),
    doseModesCovered: [...new Set(scenarioResults.flatMap((scenario) =>
      scenario.plan?.doseBlocks.map((block) => block.dose.mode) ?? []))].sort(),
    failingScenarios: scenarioResults
      .filter((scenario) => scenario.firstFailingGate !== null)
      .map((scenario) => ({
        scenarioId: scenario.scenarioId,
        cohort: scenario.cohort,
        status: scenario.status,
        exerciseId: scenario.plan?.exerciseId ?? null,
        firstFailingGate: scenario.firstFailingGate,
        hardGateFailures: scenario.hardGateFailures,
        underAdaptation: scenario.underAdaptation,
        overAdaptation: scenario.overAdaptation,
        wrongLayerEffects: scenario.wrongLayerEffects,
        planFingerprint: scenario.plan ? digest(scenario.plan) : null,
      })),
  };
}

function table(rows: readonly (readonly (string | number)[])[]): string {
  return rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
}

function markNumericReportProvisional(contents: string): string {
  const notice = [
    "> CAGT evaluator-validity update (2026-08-13): this numeric tournament output is retained as",
    `> \`${CURRENT_NUMERIC_TOURNAMENT_PROVISIONAL_CLASSIFICATION}\`, with disposition`,
    `> \`${CURRENT_NUMERIC_TOURNAMENT_DISPOSITION}\`. The retained tournament fingerprint is`,
    `> \`${CURRENT_NUMERIC_TOURNAMENT_RETAINED_FINGERPRINT}\`; the prior locked holdout is now`,
    `> \`${DISCLOSED_REGRESSION_COHORT_DISPOSITION}\`. No owner recommendation or production policy is activated here.`,
  ].join("\n");
  return contents.replace(/\n/, `\n\n${notice}\n`);
}

function sourceEventReport(): string {
  const all = [...report.tournament.atomic, ...report.tournament.composite];
  const balanced = report.tournament.composite.find((entry) =>
    entry.candidateId === "RX_COMPOSITE_B1_BALANCED_CAUSAL")!;
  return renderSimpleReport("Prescription Numeric Source Event Report", `
Candidate/scenario evaluations: ${report.scenarioEvaluationCount}.

Complete downstream pipelines: ${report.completeDownstreamPipelines}.

Balanced composite source-event duplications: ${balanced.sourceEventDuplication}.

Balanced composite revision errors: ${balanced.revisionErrors}.

All compiled fixtures retain one source exposure event and one final revision per assignment. Production policy activated: **no**.

${table([
    ["Candidate", "Source dup", "Revision errors", "Substitution double count", "Valid rate"],
    ...all.filter((entry) => entry.family === "composite").map((entry) => [
      entry.candidateId,
      entry.sourceEventDuplication,
      entry.revisionErrors,
      entry.substitutionDoubleCount,
      entry.validCompiledFixtureRate,
    ]),
  ])}
`);
}

function blockStructureReport(): string {
  const rows = report.tournament.atomic
    .filter((entry) => entry.family === "block_structure")
    .map((entry) => [
      entry.candidateId,
      entry.classification,
      entry.averageBlockCount,
      entry.preparatoryBlockCount,
      entry.developmentalBlockCount,
      entry.backoffBlockCount,
      entry.constrainedSessionFailures,
    ]);
  return renderSimpleReport("Prescription Numeric Block Structure Report", `
Gate 9 validates source identity and block legality. Gate 10 keeps duration and constrained-session burden explicit. Gate 11 remains planned/actual response foundation only.

${table([
    ["Candidate", "Classification", "Avg blocks", "Prep", "Development", "Backoff", "Constrained failures"],
    ...rows,
  ])}
`);
}

function warmupActivationReport(): string {
  const rows = report.tournament.atomic
    .filter((entry) => entry.family === "preparation" || entry.family === "activation")
    .map((entry) => [
      entry.candidateId,
      entry.classification,
      entry.warmupActivationBloat,
      entry.preparatoryMiscredit,
      entry.overAdaptation,
      entry.validCompiledFixtureRate,
    ]);
  return renderSimpleReport("Prescription Numeric Warmup Activation Report", `
Preparatory and activation candidates remain bounded, observation-oriented, and ineligible for weekly developmental credit unless explicitly developmental work is selected.

${table([
    ["Candidate", "Classification", "Bloat", "Prep miscredit", "Over", "Valid rate"],
    ...rows,
  ])}
`);
}

function durationReport(): string {
  const rows = report.tournament.atomic
    .filter((entry) => entry.family === "duration" || entry.family === "exact_phase_tempo" || entry.family === "tempo_intent")
    .map((entry) => [
      entry.candidateId,
      entry.classification,
      entry.durationFullyDeterminable,
      entry.durationPartiallyDeterminable,
      entry.durationUnknownDueToPrescription,
      entry.durationUnknownDueToSequencing,
      entry.exactTimingBurdenCount,
    ]);
  return renderSimpleReport("Prescription Numeric Duration Report", `
Duration determinability remains a design/compiler result. Final Sequencing transition and setup timing are still outside this activation.

${table([
    ["Candidate", "Classification", "Full", "Partial", "Unknown Rx", "Unknown Seq", "Exact timing burden"],
    ...rows,
  ])}
`);
}

function distributionReport(): string {
  return renderSimpleReport("Prescription Numeric H1 H2 Distribution Report", `
Result: \`${report.tournament.distribution.result}\`.

Fingerprint: \`${report.tournament.distribution.fingerprint}\`.

Single-opportunity H1 range: ${report.tournament.distribution.h1SingleOpportunity.developmentalSetRange.join("-")} developmental sets.

Distributed H2 per-session range: ${report.tournament.distribution.h2DistributedOpportunities.developmentalSetRangePerSession.join("-")} developmental sets.

Additive-error mutation: \`${report.tournament.distribution.h2AdditiveErrorMutation}\`.

Distribution remains evidence-only and response-dependent. No Week allocation or automatic progression is activated.
`);
}

function spacingReport(): string {
  return renderSimpleReport("Prescription Numeric Spacing Report", `
Fingerprint: \`${report.tournament.spacing.fingerprint}\`.

Concentrated session: \`${report.tournament.spacing.concentratedSession}\`.

Distributed sessions: \`${report.tournament.spacing.distributedSessions}\`.

Consecutive opportunities: \`${report.tournament.spacing.consecutiveOpportunities}\`.

Separated opportunities: \`${report.tournament.spacing.separatedOpportunities}\`.

Unknown timestamps: \`${report.tournament.spacing.unknownTimestamps}\`.

Spacing stays unresolved without timestamps and response evidence. No automatic spacing rule is activated.
`);
}

function implementationReadinessReport(): string {
  return renderSimpleReport("Prescription Numeric Implementation Readiness", `
Classification: \`${report.classification}\`.

Numeric policy activated: **no**.

Production behavior changed: **no**.

Full Prescription design fingerprint retained: \`${report.productionFingerprints.fullPrescriptionDesign}\`.

Exact next dependency: ${report.exactNextDependency}

Production-policy blockers:
${report.blockersBeforeProductionPolicy.map((entry) => `- ${entry}`).join("\n")}

Production-compiler blockers:
${report.blockersBeforeProductionCompiler.map((entry) => `- ${entry}`).join("\n")}

Post-Prescription Week validation blockers:
${report.blockersBeforePostPrescriptionWeekValidation.map((entry) => `- ${entry}`).join("\n")}
`);
}

const { tournament, ...reportSummary } = report;
const compactTournament = {
  classification: tournament.classification,
  numericPolicyActivated: tournament.numericPolicyActivated,
  productionBehaviorChanged: tournament.productionBehaviorChanged,
  currentTournamentDisposition: CURRENT_NUMERIC_TOURNAMENT_DISPOSITION,
  currentTournamentProvisionalClassification: CURRENT_NUMERIC_TOURNAMENT_PROVISIONAL_CLASSIFICATION,
  retainedCurrentTournamentFingerprint: CURRENT_NUMERIC_TOURNAMENT_RETAINED_FINGERPRINT,
  disclosedRegressionCohortDisposition: DISCLOSED_REGRESSION_COHORT_DISPOSITION,
  scenarioManifest: {
    calibration: buildPrescriptionNumericCalibrationScenarios(),
    lockedHoldout: buildPrescriptionNumericLockedHoldoutScenarios(),
  },
  calibrationScenarioCount: tournament.calibrationScenarioCount,
  lockedHoldoutScenarioCount: tournament.lockedHoldoutScenarioCount,
  scenarioEvaluationCount: tournament.scenarioEvaluationCount,
  completeDownstreamPipelines: tournament.completeDownstreamPipelines,
  paretoFrontier: tournament.paretoFrontier,
  dominatedCandidates: tournament.dominatedCandidates,
  incomparableCandidates: tournament.incomparableCandidates,
  ownerRecommendations: tournament.ownerRecommendations,
  distribution: tournament.distribution,
  spacing: tournament.spacing,
  stress: tournament.stress,
  atomic: tournament.atomic.map(candidateSummary),
  composite: tournament.composite.map(candidateSummary),
};

const manifestJson = {
  candidateManifest: PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST,
  candidateManifestFingerprint: PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST_FINGERPRINT,
  lockedHoldoutManifest: PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_MANIFEST,
  lockedHoldoutFingerprint: PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_FINGERPRINT,
  calibrationScenarios: buildPrescriptionNumericCalibrationScenarios(),
  lockedHoldoutScenarios: buildPrescriptionNumericLockedHoldoutScenarios(),
};

mkdirSync(docs, { recursive: true });
const files: Readonly<Record<string, string>> = {
  "PRESCRIPTION_NUMERIC_POLICY_TOURNAMENT.md": renderPrescriptionNumericTournamentMarkdown(report),
  "PRESCRIPTION_NUMERIC_POLICY_TOURNAMENT.json": `${JSON.stringify({ ...reportSummary, tournament: compactTournament, fingerprints }, null, 2)}\n`,
  "PRESCRIPTION_NUMERIC_POLICY_CANDIDATE_MANIFEST.md": renderPrescriptionCandidateManifestMarkdown(),
  "PRESCRIPTION_NUMERIC_POLICY_CANDIDATE_MANIFEST.json": `${JSON.stringify(manifestJson, null, 2)}\n`,
  "PRESCRIPTION_NUMERIC_ATOMIC_RESULTS.md": renderPrescriptionAtomicResultsMarkdown(report),
  "PRESCRIPTION_NUMERIC_COMPOSITE_RESULTS.md": renderPrescriptionCompositeResultsMarkdown(report),
  "PRESCRIPTION_NUMERIC_PARETO_FRONTIER.md": renderPrescriptionParetoMarkdown(report),
  "PRESCRIPTION_NUMERIC_HOLDOUT_REPORT.md": renderPrescriptionHoldoutMarkdown(report),
  "PRESCRIPTION_NUMERIC_SOURCE_EVENT_REPORT.md": sourceEventReport(),
  "PRESCRIPTION_NUMERIC_BLOCK_STRUCTURE_REPORT.md": blockStructureReport(),
  "PRESCRIPTION_NUMERIC_WARMUP_ACTIVATION_REPORT.md": warmupActivationReport(),
  "PRESCRIPTION_NUMERIC_DURATION_REPORT.md": durationReport(),
  "PRESCRIPTION_NUMERIC_H1_H2_DISTRIBUTION_REPORT.md": distributionReport(),
  "PRESCRIPTION_NUMERIC_SPACING_REPORT.md": spacingReport(),
  "PRESCRIPTION_NUMERIC_OWNER_RECOMMENDATION.md": renderPrescriptionOwnerRecommendationMarkdown(report),
  "PRESCRIPTION_NUMERIC_IMPLEMENTATION_READINESS.md": implementationReadinessReport(),
};

for (const [name, contents] of Object.entries(files)) {
  writeFileSync(resolve(docs, name), name.endsWith(".md") ? markNumericReportProvisional(contents) : contents);
}

process.stdout.write(`${report.classification}: ${report.scenarioEvaluationCount} evaluations; ${report.completeDownstreamPipelines} complete pipelines; production activation false.\n`);
