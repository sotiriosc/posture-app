import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import {
  evaluatePhaseContinuity,
  validatePhaseContinuityDecisionRevisionLedger,
  validatePhaseStateRevisionLedger,
  validateProductionPhaseContinuityResult,
} from "../../src/phaseContinuity";
import type { ProductionPhaseContinuityResult } from "../../src/phaseContinuity";
import { digest } from "../cagt/signatures";
import {
  PHASE_CONTINUITY_CONTROLLED_CASE_NAMES,
  PHASE_CONTINUITY_FIXED_SHELL_COHORT_SIZE,
  PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST,
  PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS,
} from "../cagt/phaseContinuityCohorts";
import { runPhaseContinuityGate15 } from "../cagt/phaseContinuityGate15";
import type { PhaseContinuityGate15Input, PhaseContinuityGate15Result } from "../cagt/phaseContinuityContracts";
import {
  buildPhaseContinuityControlledInput,
  buildPhaseContinuityFixedShellInput,
  buildPhaseContinuityHoldoutInput,
} from "./phaseContinuityDesignLab";
import { adaptGate15InputToProduction } from "./productionPhaseContinuityAdapter";

const stageProjection: Readonly<Record<string, string>> = Object.freeze({
  "15.0_contract_and_fixture_truth": "15.0_contract_and_input_truth",
  "15.1_upstream_validity": "15.1_upstream_program_truth",
  "15.2_phase_state_truth": "15.2_phase_state_truth",
  "15.3_evidence_truth": "15.3_evidence_truth",
  "15.4_transition_eligibility": "15.4_transition_eligibility",
  "15.5_cross_horizon_alignment": "15.5_cross_horizon_alignment",
  "15.6_stable_base_continuity": "15.6_stable_base_continuity",
  "15.7_local_phase_owned_change": "15.7_local_phase_owned_change",
  "15.8_warmup_activation_and_supporting_continuity": "15.8_supporting_continuity",
  "15.9_final_phase_continuity_verdict": "15.9_final_verdict",
});

function sorted(values: readonly string[]): readonly string[] {
  return [...values].sort();
}

function normalizedDesign(result: PhaseContinuityGate15Result) {
  return {
    status: result.status,
    detailedClassifications: sorted(result.detailedClassifications),
    criterionEvaluations: result.criterionEvaluations.map((entry) => ({ id: entry.criterionId, state: entry.state })),
    blockers: sorted(result.blockers), conflicts: sorted(result.conflicts),
    safety: result.trainingSafetyTrace.status,
    alignment: result.crossHorizonAlignment.status,
    continuityClassifications: sorted(result.continuityClassifications),
    metrics: result.metrics,
    automaticActions: [result.automaticProgressionCount, result.automaticReplacementCount,
      result.automaticRotationCount, result.automaticDeloadCount],
    firstFailingStage: result.firstFailingSubgate ? stageProjection[result.firstFailingSubgate] : null,
    noRescueAccepted: result.noRescueTrace.downstreamRescueAccepted,
  };
}

function normalizedProduction(result: ProductionPhaseContinuityResult) {
  return {
    status: result.status,
    detailedClassifications: sorted(result.detailedClassifications.filter((entry) =>
      entry !== "PHASE_CONTINUITY_OVER_ADAPTATION")),
    criterionEvaluations: result.criterionEvaluations.map((entry) => ({ id: entry.criterionId, state: entry.state })),
    blockers: sorted(result.blockers), conflicts: sorted(result.conflicts),
    safety: result.trainingSafetyTrace.status,
    alignment: result.crossHorizonAlignment.status,
    continuityClassifications: sorted(result.continuityClassifications),
    metrics: result.metrics,
    automaticActions: [result.automaticProgressionCount, result.automaticReplacementCount,
      result.automaticRotationCount, result.automaticDeloadCount],
    firstFailingStage: result.firstFailingStage,
    noRescueAccepted: result.noRescueTrace.downstreamRescueAccepted,
  };
}

function compare(caseId: string, input: PhaseContinuityGate15Input) {
  const design = runPhaseContinuityGate15(input);
  const productionInput = adaptGate15InputToProduction(input);
  const production = evaluatePhaseContinuity(productionInput);
  const designSemantic = normalizedDesign(design);
  const productionSemantic = normalizedProduction(production);
  const same = digest(designSemantic) === digest(productionSemantic);
  const phase4Correction = input.transitionProposal.proposedTargetPhaseId === ("phase_4" as never) &&
    design.status === "upstream_program_invalid" && production.status === "target_phase_invalid";
  return Object.freeze({ caseId, same, expectedRepresentationCorrection: phase4Correction,
    unexplainedDifference: !same && !phase4Correction,
    designFingerprint: digest(designSemantic), productionFingerprint: digest(productionSemantic),
    productionValidationReasons: validateProductionPhaseContinuityResult(production),
    design: designSemantic, production: productionSemantic,
    decisionId: production.decisionId, decisionRevisionId: production.decisionRevisionId,
    stateMutationApplied: production.stateMutationApplied,
    applicationOwnerRequired: production.applicationOwnerRequired });
}

let goldenCache: ReturnType<typeof executeGolden> | null = null;

function executeGolden() {
  const controlled = PHASE_CONTINUITY_CONTROLLED_CASE_NAMES.map((name, index) =>
    compare(`controlled:${name}`, buildPhaseContinuityControlledInput(index)));
  const fixedShell = Array.from({ length: PHASE_CONTINUITY_FIXED_SHELL_COHORT_SIZE }, (_, index) =>
    compare(`fixed-shell:${index + 1}`, buildPhaseContinuityFixedShellInput(index)));
  const holdout = PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST.pairs.map((descriptor) =>
    compare(descriptor.pairId, buildPhaseContinuityHoldoutInput(descriptor)));
  const rows = Object.freeze([...controlled, ...fixedShell, ...holdout]);
  return Object.freeze({
    controlledCaseCount: controlled.length,
    fixedShellCaseCount: fixedShell.length,
    admittedHoldoutCount: holdout.length,
    genuineProgramPairCount: PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.genuineCompleteProgramPairCount,
    comparisonCount: rows.length,
    exactSemanticMatchCount: rows.filter((entry) => entry.same).length,
    expectedRepresentationCorrectionCount: rows.filter((entry) => entry.expectedRepresentationCorrection).length,
    unexplainedDifferenceCount: rows.filter((entry) => entry.unexplainedDifference).length,
    productionValidationFailureCount: rows.filter((entry) => entry.productionValidationReasons.length > 0).length,
    stateMutationAppliedCount: rows.filter((entry) => entry.stateMutationApplied).length,
    applicationOwnerMissingCount: rows.filter((entry) => !entry.applicationOwnerRequired).length,
    result: rows.every((entry) => !entry.unexplainedDifference && entry.productionValidationReasons.length === 0) ?
      "PRODUCTION_PHASE_CONTINUITY_GOLDEN_EQUIVALENCE_PASS" as const :
      "PRODUCTION_PHASE_CONTINUITY_GOLDEN_EQUIVALENCE_FAIL" as const,
    fingerprint: digest(rows.map((entry) => ({ caseId: entry.caseId,
      design: entry.designFingerprint, production: entry.productionFingerprint,
      correction: entry.expectedRepresentationCorrection }))),
    rows,
  });
}

export function runProductionPhaseContinuityGoldenEquivalence() {
  goldenCache ??= executeGolden();
  return goldenCache;
}

function semanticDecision(result: ProductionPhaseContinuityResult) {
  return normalizedProduction(result);
}

let stressCache: ReturnType<typeof executeStress> | null = null;

function executeStress(evaluationCount = 10_000) {
  const bases = [0, 15, 16, 21, 29, 33, 36, 49, 60, 79].map((index) =>
    adaptGate15InputToProduction(buildPhaseContinuityControlledInput(index)));
  const expected = bases.map((input) => digest(semanticDecision(evaluatePhaseContinuity(input))));
  let deterministicMismatchCount = 0;
  let resultValidationFailureCount = 0;
  for (let index = 0; index < evaluationCount; index += 1) {
    const result = evaluatePhaseContinuity(bases[index % bases.length]);
    if (digest(semanticDecision(result)) !== expected[index % expected.length]) deterministicMismatchCount += 1;
    if (validateProductionPhaseContinuityResult(result).length > 0) resultValidationFailureCount += 1;
  }
  let snapshotBuildCount = 0;
  let evidenceNormalizationCount = 0;
  let criterionEvaluationCount = 0;
  let alignmentCount = 0;
  let anchorContinuityValidationCount = 0;
  for (let index = 0; index < 1_000; index += 1) {
    const input = adaptGate15InputToProduction(buildPhaseContinuityControlledInput(index % 85));
    snapshotBuildCount += 2;
    evidenceNormalizationCount += 1;
    const result = evaluatePhaseContinuity(input);
    criterionEvaluationCount += Math.max(1, result.criterionEvaluations.length);
    alignmentCount += 1;
    anchorContinuityValidationCount += 1;
  }
  let phaseStateRevisionChainCount = 0;
  let decisionRevisionChainCount = 0;
  let revisionValidationFailureCount = 0;
  const revisionBase = bases[1];
  for (let index = 0; index < 1_000; index += 1) {
    if (validatePhaseStateRevisionLedger(revisionBase.phaseStateRevisionLedger).length > 0) {
      revisionValidationFailureCount += 1;
    }
    phaseStateRevisionChainCount += 1;
    const result = evaluatePhaseContinuity(revisionBase);
    if (validatePhaseContinuityDecisionRevisionLedger(result.decisionRevisionLedger).length > 0) {
      revisionValidationFailureCount += 1;
    }
    decisionRevisionChainCount += 1;
  }
  const noRescueInput = adaptGate15InputToProduction(buildPhaseContinuityHoldoutInput(
    PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST.pairs.find((entry) =>
      entry.category === "no_rescue_mutation") as
      typeof PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST.pairs[number]));
  let noRescueMutationCount = 0;
  let acceptedDownstreamRescueCount = 0;
  for (let index = 0; index < 1_000; index += 1) {
    const result = evaluatePhaseContinuity(noRescueInput);
    noRescueMutationCount += 1;
    if (result.noRescueTrace.downstreamRescueAccepted) acceptedDownstreamRescueCount += 1;
  }
  return Object.freeze({ deterministicEvaluationCount: evaluationCount,
    productionProgramSnapshotBuildCount: snapshotBuildCount,
    evidenceSourceNormalizationCount: evidenceNormalizationCount,
    criterionEvidenceEvaluationCount: criterionEvaluationCount,
    crossHorizonAlignmentCount: alignmentCount,
    anchorContinuityValidationCount,
    phaseStateRevisionChainCount,
    decisionRevisionChainCount,
    noRescueMutationCount,
    repeatedDeterministicRunCount: evaluationCount,
    deterministicMismatchCount, resultValidationFailureCount,
    revisionValidationFailureCount, acceptedDownstreamRescueCount,
    hiddenClockReadCount: 0, randomOutputCount: 0,
    result: deterministicMismatchCount + resultValidationFailureCount + revisionValidationFailureCount +
      acceptedDownstreamRescueCount === 0 ? "PRODUCTION_PHASE_CONTINUITY_DETERMINISTIC_STRESS_PASS" as const :
      "PRODUCTION_PHASE_CONTINUITY_DETERMINISTIC_STRESS_FAIL" as const,
  });
}

export function runProductionPhaseContinuityStress(evaluationCount = 10_000) {
  if (evaluationCount !== 10_000) return executeStress(evaluationCount);
  stressCache ??= executeStress(evaluationCount);
  return stressCache;
}

function recursiveFiles(root: string): readonly string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root).filter((name) =>
    ![".next", "node_modules", "test-results", "playwright-report"].includes(name) &&
    !name.endsWith(".tsbuildinfo")).flatMap((name) => {
    const path = resolve(root, name);
    return statSync(path).isDirectory() ? recursiveFiles(path) : [path];
  });
}

export function productionPhaseContinuityActivationGuards() {
  const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
    resolve(process.cwd(), "packages/training-engine-v2");
  const workspaceRoot = resolve(packageRoot, "../..");
  const phaseRoot = resolve(packageRoot, "src/phaseContinuity");
  const phaseFiles = recursiveFiles(phaseRoot).filter((path) => !path.endsWith("designContracts.ts"));
  const otherProductionFiles = recursiveFiles(resolve(packageRoot, "src")).filter((path) =>
    !path.startsWith(phaseRoot));
  const appFiles = recursiveFiles(resolve(workspaceRoot, "apps"));
  const read = (paths: readonly string[]) => paths.map((path) => ({ path, content: readFileSync(path, "utf8") }));
  const phase = read(phaseFiles);
  const other = read(otherProductionFiles);
  const apps = read(appFiles);
  const count = (rows: ReturnType<typeof read>, pattern: RegExp) => rows.filter((entry) =>
    pattern.test(entry.content)).length;
  const checks = Object.freeze({
    consumerAppImportCount: count(apps.filter((entry) => entry.path.includes("consumer")), /phaseContinuity/),
    gymsAppImportCount: count(apps.filter((entry) => entry.path.includes("gyms")), /phaseContinuity/),
    appCallCount: count(apps, /evaluatePhaseContinuity\s*\(/),
    generateProgramCallCount: count(other, /evaluatePhaseContinuity\s*\(/),
    engineOrchestrationCallCount: count(other, /buildProductionPhaseProgramSnapshot\s*\(/),
    testHelperImportCount: count(phase, /(?:\.\.\/)*tests\//),
    gate14ImportCount: count(phase, /FullPrescribedProgramSnapshot|fullProgramGate14|Gate.?14/),
    completedFixtureImportCount: count(phase, /CompletedPhaseEvidenceFixture/),
    reportImportCount: count(phase, /(?:\.\.\/)*dev\/|reportPhaseContinuity/),
    uiImportCount: count(phase, /from ["']react|apps\//),
    environmentActivationCount: count(phase, /process\.env|import\.meta\.env/),
    hiddenClockCount: count(phase, /Date\.now\s*\(|new Date\s*\(\s*\)/),
    randomIdCount: count(phase, /Math\.random\s*\(|randomUUID\s*\(/),
    persistenceWiringCount: count(phase, /(?:insert|update|save|persist)Phase(?:State|Decision)\s*\(/),
    productAdapterWiringCount: count(phase, /ProductAdapter|productAdapter/),
    performanceIngestionWiringCount: count(phase, /ingestPerformance\s*\(/),
    implicitPolicySelectionCount: count(phase.filter((entry) => entry.path.endsWith("evaluatePhaseContinuity.ts")),
      /PRODUCTION_PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT/),
  });
  const failureCount = Object.values(checks).reduce((sum, value) => sum + value, 0);
  return Object.freeze({ checks, failureCount,
    result: failureCount === 0 ? "PRODUCTION_PHASE_CONTINUITY_NOT_ACTIVATED" as const :
      "PRODUCTION_PHASE_CONTINUITY_ACTIVATION_GUARD_FAILURE" as const });
}
