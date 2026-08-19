import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  EXPECTED_PRESCRIPTION_EVALUATOR_HARDENING_FINGERPRINTS,
  PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST,
  buildPrescriptionEvaluatorHardeningReport,
  renderBlindEvaluatorContractMarkdown,
  renderCounterfactualContractMarkdown,
  renderDurationIntervalContractMarkdown,
  renderEvaluatorSelfTestMarkdown,
  renderEvaluatorValidityAuditMarkdown,
  renderFullSessionPipelineMarkdown,
  renderPerformanceIndependenceMarkdown,
  renderRestPlacementAuditMarkdown,
  renderV2CausalResultsMarkdown,
  renderV2H1H2ReportMarkdown,
  renderV2HoldoutManifestMarkdown,
  renderV2ImplementationReadinessMarkdown,
  renderV2SpacingReportMarkdown,
  renderV2ValidityReportMarkdown,
} from "../tests/cagt/prescriptionTournamentEvaluatorHardening";

const report = buildPrescriptionEvaluatorHardeningReport();
const docs = resolve(process.cwd(), "../../docs/training-engine-v2");

function table(rows: readonly (readonly (string | number | boolean)[])[]): string {
  return rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
}

function classificationCounts() {
  return Object.fromEntries([...new Set(report.candidateEvidence.map((entry) => entry.classification))]
    .sort()
    .map((classification) => [
      classification,
      report.candidateEvidence.filter((entry) => entry.classification === classification).length,
    ]));
}

function renderV2FullSessionReportMarkdown(): string {
  const multiAssignmentCount = PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST.scenarios
    .filter((entry) => entry.assignmentCount >= 2).length;
  const tags = [...new Set(PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST.scenarios
    .flatMap((entry) => entry.contextTags))].sort();
  return `# Prescription Tournament V2 Full Session Report

Classification: \`${report.classification}\`.

The V2 holdout is built from production Session Intent Planner, Candidate Intelligence, Session Composer, valid SessionSkeletons, and SessionPrescriptionHandoff objects.

Assignment-only V1 fixtures are disclosed regression pipelines, not full-session evidence.

- V2 locked scenarios: ${report.v2HoldoutCount}
- Multi-assignment full sessions: ${multiAssignmentCount}
- Full-session candidate pipelines: ${report.fullSessionPipelineCount}
- Full-session performance-linkage pipelines: ${report.fullSessionPerformanceLinkagePipelineCount}

${table([
    ["Scenario", "Assignments", "Exercises", "Tags"],
    ...PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST.scenarios.slice(0, 16).map((entry) => [
      entry.scenarioId,
      entry.assignmentCount,
      entry.exerciseIds.join(", "),
      entry.contextTags.slice(0, 5).join(", "),
    ]),
  ])}

Tag coverage: ${tags.join(", ")}.
`;
}

function renderV2DurationReportMarkdown(): string {
  return `# Prescription Tournament V2 Duration Report

No fake duration constants are used for admission, Pareto, or capacity decisions.

- Fully known duration cases: ${report.durationSummary.fullyKnownDurationCases}
- Bounded duration cases: ${report.durationSummary.boundedDurationCases}
- Unknown duration cases: ${report.durationSummary.unknownDurationCases}
- Definitely over budget cases: ${report.durationSummary.definitelyOverBudgetCases}
- Possibly over budget cases: ${report.durationSummary.possiblyOverBudgetCases}

Rest placement finding: \`${report.restPlacement.finding}\`.

Duration fingerprint: \`${report.fingerprints.durationInterval}\`.
`;
}

const compactReport = {
  version: report.version,
  classification: report.classification,
  currentTournamentDisposition: report.currentTournamentDisposition,
  currentTournamentProvisionalClassification: report.currentTournamentProvisionalClassification,
  candidateValuesUnchanged: report.candidateValuesUnchanged,
  retainedCurrentTournamentFingerprint: report.retainedCurrentTournamentFingerprint,
  currentHoldoutDisposition: report.currentHoldoutDisposition,
  disclosedRegressionFingerprint: report.disclosedRegressionFingerprint,
  v2HoldoutCount: report.v2HoldoutCount,
  v2HoldoutFingerprint: report.v2HoldoutFingerprint,
  assignmentPipelineCount: report.assignmentPipelineCount,
  fullSessionPipelineCount: report.fullSessionPipelineCount,
  fullSessionPerformanceLinkagePipelineCount: report.fullSessionPerformanceLinkagePipelineCount,
  classificationCounts: classificationCounts(),
  nonDominatedCandidates: report.nonDominatedCandidates,
  dominatedCandidates: report.dominatedCandidates,
  equalSemanticCandidates: report.equalSemanticCandidates,
  aggregateCausalSummary: report.aggregateCausalSummary,
  durationSummary: report.durationSummary,
  blindness: report.blindness,
  selfTests: report.selfTests,
  h1h2: report.h1h2,
  spacing: report.spacing,
  performanceIndependence: report.performanceIndependence,
  restPlacement: report.restPlacement,
  productionFingerprints: report.productionFingerprints,
  fingerprints: report.fingerprints,
  expectedFingerprints: EXPECTED_PRESCRIPTION_EVALUATOR_HARDENING_FINGERPRINTS,
  remainingEvaluatorLimitations: report.remainingEvaluatorLimitations,
  blockersBeforeOwnerNumericPolicySelection: report.blockersBeforeOwnerNumericPolicySelection,
  blockersBeforeProductionPrescriptionCompiler: report.blockersBeforeProductionPrescriptionCompiler,
  blockersBeforePostPrescriptionWeekValidation: report.blockersBeforePostPrescriptionWeekValidation,
  exactNextDependency: report.exactNextDependency,
};

mkdirSync(docs, { recursive: true });

const files: Readonly<Record<string, string>> = {
  "PRESCRIPTION_TOURNAMENT_EVALUATOR_VALIDITY_AUDIT.md": renderEvaluatorValidityAuditMarkdown(report),
  "PRESCRIPTION_TOURNAMENT_BLIND_EVALUATOR_CONTRACT.md": renderBlindEvaluatorContractMarkdown(report),
  "PRESCRIPTION_TOURNAMENT_COUNTERFACTUAL_CONTRACT.md": renderCounterfactualContractMarkdown(report),
  "PRESCRIPTION_TOURNAMENT_FULL_SESSION_PIPELINE.md": renderFullSessionPipelineMarkdown(report),
  "PRESCRIPTION_TOURNAMENT_DURATION_INTERVAL_CONTRACT.md": renderDurationIntervalContractMarkdown(report),
  "PRESCRIPTION_TOURNAMENT_REST_PLACEMENT_AUDIT.md": renderRestPlacementAuditMarkdown(report),
  "PRESCRIPTION_TOURNAMENT_PERFORMANCE_INDEPENDENCE.md": renderPerformanceIndependenceMarkdown(report),
  "PRESCRIPTION_TOURNAMENT_EVALUATOR_SELF_TEST.md": renderEvaluatorSelfTestMarkdown(report),
  "PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST.md": renderV2HoldoutManifestMarkdown(),
  "PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST.json": `${JSON.stringify(PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST, null, 2)}\n`,
  "PRESCRIPTION_TOURNAMENT_V2_VALIDITY_REPORT.md": renderV2ValidityReportMarkdown(report),
  "PRESCRIPTION_TOURNAMENT_V2_VALIDITY_REPORT.json": `${JSON.stringify(compactReport, null, 2)}\n`,
  "PRESCRIPTION_TOURNAMENT_V2_FULL_SESSION_REPORT.md": renderV2FullSessionReportMarkdown(),
  "PRESCRIPTION_TOURNAMENT_V2_CAUSAL_RESULTS.md": renderV2CausalResultsMarkdown(report),
  "PRESCRIPTION_TOURNAMENT_V2_DURATION_REPORT.md": renderV2DurationReportMarkdown(),
  "PRESCRIPTION_TOURNAMENT_V2_H1_H2_REPORT.md": renderV2H1H2ReportMarkdown(report),
  "PRESCRIPTION_TOURNAMENT_V2_SPACING_REPORT.md": renderV2SpacingReportMarkdown(report),
  "PRESCRIPTION_TOURNAMENT_V2_IMPLEMENTATION_READINESS.md": renderV2ImplementationReadinessMarkdown(report),
};

for (const [name, contents] of Object.entries(files)) {
  writeFileSync(resolve(docs, name), contents);
}

process.stdout.write(`${report.classification}: ${report.v2HoldoutCount} V2 holdout sessions; ${report.fullSessionPipelineCount} full-session pipelines; owner recommendations withdrawn.\n`);
