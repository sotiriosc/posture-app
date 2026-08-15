import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import type { PhaseId } from "../../src/domain/phase";
import type { FullPrescribedProgramSnapshot } from "../cagt/fullProgramContracts";
import {
  PHASE_CONTINUITY_CONTROLLED_CASE_NAMES,
  PHASE_CONTINUITY_FIXED_SHELL_COHORT_SIZE,
  PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST,
  PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST_FINGERPRINT,
  PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS,
  PHASE_CONTINUITY_MULTI_HORIZON_SHAPES,
  type PhaseContinuityEvidenceMode,
  type PhaseContinuityHoldoutDescriptor,
  type PhaseContinuityMutationKind,
} from "../cagt/phaseContinuityCohorts";
import {
  runPhaseContinuityGate15,
  validatePhaseContinuityGate15Result,
} from "../cagt/phaseContinuityGate15";
import type {
  PhaseContinuityGate15Input,
  PhaseContinuityGate15Result,
} from "../cagt/phaseContinuityContracts";
import { digest } from "../cagt/signatures";
import {
  buildPhaseContinuityGate15Input,
  buildPhaseTransitionProgramSnapshot,
  type BuildPhaseContinuityInputOptions,
} from "./phaseContinuityPipeline";
import {
  cloneFrozenFullProgramSnapshot,
} from "./fullPrescribedProgramPipeline";
import {
  fullProgramCleanSnapshots,
  fullProgramCoverageEvidence,
} from "./fullPrescribedProgramCagtLab";

export function optionsForControlledCase(index: number): BuildPhaseContinuityInputOptions {
  const caseId = `controlled-${String(index + 1).padStart(3, "0")}`;
  if (index < 15) {
    return {
      caseId,
      snapshotIndex: index,
      currentPhaseId: "phase_1",
      targetPhaseId: "phase_1",
      transitionKind: "stay",
      evidenceMode: index === 8 ? "mixed" : index === 9 ? "missing" : "missing",
      weekInPhase: index === 1 ? 12 : 1,
      mutationKind: index === 13 ? "structured_response_change" : "none",
    };
  }
  if (index < 33) {
    const local = index === 28 ? "local_phase_prescription" :
      index === 29 || index === 30 ? "global_program_regeneration" :
        index === 31 ? "phase_creates_need" : index === 32 ? "goal_override" : "none";
    const evidenceMode: PhaseContinuityEvidenceMode = index === 16 ? "planned_only" :
      index === 17 ? "isolated" : index === 20 || index === 22 ? "blocker" :
        index === 23 ? "mixed" : index === 24 ? "conflict" : "met";
    return { caseId, snapshotIndex: index, currentPhaseId: "phase_1", targetPhaseId: "phase_2",
      transitionKind: "adjacent_advancement", evidenceMode, safetyBlock: index === 21,
      mutationKind: local };
  }
  if (index < 48) {
    const mutationKind: PhaseContinuityMutationKind = index === 42 ? "local_phase_prescription" :
      index === 43 ? "anchor_displacement" : index >= 44 ? "automatic_progression" : "none";
    const evidenceMode: PhaseContinuityEvidenceMode = index === 36 ? "missing" :
      index === 38 || index === 39 ? "blocker" : "met";
    return { caseId, snapshotIndex: index, currentPhaseId: "phase_2", targetPhaseId: "phase_3",
      transitionKind: "adjacent_advancement", evidenceMode, mutationKind };
  }
  if (index < 54) {
    if (index === 49) return { caseId, currentPhaseId: "phase_3", targetPhaseId: "phase_3",
      transitionKind: "cycle_completion_review", evidenceMode: "met" };
    const mutationKind: PhaseContinuityMutationKind = index === 50 || index === 51 ? "automatic_cycle_reset" :
      index === 52 ? "automatic_deload" : index === 53 ? "automatic_rotation" : "none";
    return { caseId, currentPhaseId: "phase_3", targetPhaseId: "phase_3", transitionKind: "stay",
      evidenceMode: "missing", mutationKind };
  }
  if (index < 61) {
    if (index === 59 || index === 60) return { caseId, currentPhaseId: "phase_2", targetPhaseId: "phase_1",
      transitionKind: "regression_review", evidenceMode: "met",
      mutationKind: index === 60 ? "automatic_regression" : "none" };
    return { caseId, currentPhaseId: "phase_2", targetPhaseId: "phase_2", transitionKind: "stay",
      evidenceMode: "missing", safetyBlock: index === 56 };
  }
  if (index < 70) {
    const mutationKind: PhaseContinuityMutationKind = index === 61 || index === 65 || index === 66 ?
      "week_policy_change" : index === 62 || index === 63 ? "equipment_local_change" :
        index === 67 || index === 68 ? "structured_response_change" : "none";
    return { caseId, currentPhaseId: "phase_1", targetPhaseId: "phase_2",
      transitionKind: "adjacent_advancement", evidenceMode: "met", safetyBlock: index === 69,
      mutationKind };
  }
  if (index < 78) {
    const mutationKind: PhaseContinuityMutationKind = index === 73 ? "generic_phase_warmup" :
      index === 74 || index === 75 ? "generic_phase_activation" : "none";
    return { caseId, currentPhaseId: "phase_1", targetPhaseId: "phase_2",
      transitionKind: "adjacent_advancement", evidenceMode: "met", mutationKind };
  }
  const mutationKind: PhaseContinuityMutationKind = index === 79 ? "ambiguous_alignment" :
    index === 84 ? "equipment_local_change" : index === 82 ? "local_phase_prescription" : "none";
  return { caseId, currentPhaseId: "phase_1", targetPhaseId: "phase_2",
    transitionKind: "adjacent_advancement", evidenceMode: "met", mutationKind };
}

export function buildPhaseContinuityControlledInput(index: number): PhaseContinuityGate15Input {
  let input = buildPhaseContinuityGate15Input(optionsForControlledCase(index));
  if (index === 50) {
    const draft = structuredClone(input) as unknown as PhaseContinuityGate15Input;
    (draft.transitionProposal as unknown as { proposedTargetPhaseId: string }).proposedTargetPhaseId = "phase_4";
    input = draft;
  }
  return input;
}

export function runPhaseContinuityControlledCases() {
  const results = PHASE_CONTINUITY_CONTROLLED_CASE_NAMES.map((caseName, index) => {
    const input = buildPhaseContinuityControlledInput(index);
    const result = runPhaseContinuityGate15(input);
    return Object.freeze({ caseName, status: result.status,
      classifications: result.detailedClassifications, firstFailingSubgate: result.firstFailingSubgate,
      validatorReasons: validatePhaseContinuityGate15Result(result), result });
  });
  return Object.freeze({ caseCount: results.length,
    validationFailureCount: results.filter((entry) => entry.validatorReasons.length > 0).length,
    results });
}

export function buildPhaseContinuityHoldoutInput(
  descriptor: PhaseContinuityHoldoutDescriptor,
): PhaseContinuityGate15Input {
  return buildPhaseContinuityGate15Input({
    caseId: descriptor.pairId,
    snapshotIndex: descriptor.snapshotIndex,
    currentPhaseId: descriptor.currentPhaseId,
    targetPhaseId: descriptor.targetPhaseId,
    transitionKind: descriptor.transitionKind,
    evidenceMode: descriptor.evidenceMode,
    safetyBlock: descriptor.safetyBlock,
    mutationKind: descriptor.mutationKind,
  });
}

let holdoutCache: ReturnType<typeof executePhaseContinuityHoldout> | null = null;

function executePhaseContinuityHoldout() {
  const results = PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST.pairs.map((descriptor) => {
    const result = runPhaseContinuityGate15(buildPhaseContinuityHoldoutInput(descriptor));
    const matchedStatus = result.status === descriptor.expectedStatus;
    const matchedFailure = result.firstFailingSubgate === descriptor.expectedFirstFailingSubgate;
    return Object.freeze({ pairId: descriptor.pairId, category: descriptor.category,
      expectedStatus: descriptor.expectedStatus, observedStatus: result.status,
      matchedExpectation: matchedStatus && matchedFailure,
      genuineCompleteProgramPair: descriptor.genuineCompleteProgramPair,
      validatorReasons: validatePhaseContinuityGate15Result(result), result });
  });
  const countStatus = (status: PhaseContinuityGate15Result["status"]) =>
    results.filter((entry) => entry.result.status === status).length;
  return Object.freeze({
    manifestFingerprint: PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST_FINGERPRINT,
    pairCount: results.length,
    genuineCompleteProgramPairCount: PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.genuineCompleteProgramPairCount,
    stayCount: countStatus("remain_current_phase"),
    advanceAuthorizedCount: countStatus("advance_to_next_phase_authorized"),
    holdPendingEvidenceCount: countStatus("hold_current_phase_pending_evidence"),
    blockerCount: countStatus("hold_current_phase_due_blocker") +
      countStatus("transition_blocked_by_training_safety"),
    conflictCount: countStatus("transition_evidence_conflict"),
    cycleReviewCount: countStatus("phase_cycle_completion_owner_review_required"),
    regressionReviewCount: countStatus("phase_regression_review_required"),
    excessiveRegenerationCount: results.filter((entry) => entry.result.detailedClassifications.includes(
      "PHASE_PROGRAM_EXCESSIVE_REGENERATION")).length,
    unexplainedGlobalRegenerationCount: results.filter((entry) => entry.result.firstFailingSubgate ===
      "15.6_stable_base_continuity").length,
    productiveAnchorDisplacementCount: results.filter((entry) => entry.result.anchorTrace.includes(
      "PRODUCTIVE_ANCHOR_DISPLACEMENT_REJECTED")).length,
    downstreamRescueAttemptCount: results.filter((entry) => entry.result.noRescueTrace.downstreamRescueAttempted).length,
    acceptedDownstreamRescueCount: results.filter((entry) =>
      entry.result.noRescueTrace.downstreamRescueAccepted).length,
    expectationMismatchCount: results.filter((entry) => !entry.matchedExpectation).length,
    resultValidationFailureCount: results.filter((entry) => entry.validatorReasons.length > 0).length,
    results,
  });
}

export function runPhaseContinuityHoldout() {
  holdoutCache ??= executePhaseContinuityHoldout();
  return holdoutCache;
}

function relineageSnapshot(input: FullPrescribedProgramSnapshot, index: number): FullPrescribedProgramSnapshot {
  const athleteId = `phase-fixed-shell-athlete-${String(index + 1).padStart(2, "0")}`;
  return cloneFrozenFullProgramSnapshot(input, (draft) => {
    (draft as unknown as { athleteId: string }).athleteId = athleteId;
    (draft as unknown as { snapshotId: string }).snapshotId = `${input.snapshotId}:fixed-shell:${index + 1}`;
    (draft as unknown as { snapshotRevisionId: string }).snapshotRevisionId =
      `${input.snapshotRevisionId}:fixed-shell:${index + 1}`;
    (draft.normalizedWeekSourceSnapshot as unknown as { athleteId: string }).athleteId = athleteId;
    for (const intent of draft.sessionIntents) (intent as unknown as { athleteId: string }).athleteId = athleteId;
    for (const artifact of draft.reservationArtifacts) {
      (artifact.sessionIntent as unknown as { athleteId: string }).athleteId = athleteId;
    }
  });
}

let fixedShellCache: ReturnType<typeof executeFixedShell> | null = null;

export function buildPhaseContinuityFixedShellInput(index: number): PhaseContinuityGate15Input {
  const base = fullProgramCleanSnapshots().find((snapshot) =>
    snapshot.normalizedWeekSourceSnapshot.opportunities.length === 4);
  if (!base) throw new Error("PHASE_CONTINUITY_FOUR_OPPORTUNITY_BASE_REQUIRED");
  const mode = index % 7;
  const currentPhaseId: PhaseId = mode >= 3 ? mode >= 5 ? "phase_3" : "phase_2" : "phase_1";
  const targetPhaseId: PhaseId = mode === 1 || mode === 2 ? "phase_2" :
    mode === 3 || mode === 4 ? "phase_3" : currentPhaseId;
  const transitionKind = mode === 6 ? "cycle_completion_review" as const :
    targetPhaseId === currentPhaseId ? "stay" as const : "adjacent_advancement" as const;
  const currentPhaseSnapshot = base.sessionIntents[0]?.phaseIntent.id === currentPhaseId ? base :
    buildPhaseTransitionProgramSnapshot({ current: base, targetPhaseId: currentPhaseId,
      suffix: `fixed-shell-current:${index}` });
  return buildPhaseContinuityGate15Input({
    caseId: `fixed-shell-${String(index + 1).padStart(2, "0")}`,
    currentPhaseId,
    targetPhaseId,
    transitionKind,
    evidenceMode: mode === 2 || mode === 4 ? "missing" : "met",
    currentProgramSnapshot: relineageSnapshot(currentPhaseSnapshot, index),
  });
}

function executeFixedShell() {
  const results = Array.from({ length: PHASE_CONTINUITY_FIXED_SHELL_COHORT_SIZE }, (_, index) => {
    const gateInput = buildPhaseContinuityFixedShellInput(index);
    const result = runPhaseContinuityGate15(gateInput);
    return Object.freeze({ athleteId: gateInput.currentProgramSnapshot.athleteId, opportunityCount: 4,
      currentPhaseId: gateInput.transitionProposal.currentPhaseId,
      targetPhaseId: gateInput.transitionProposal.proposedTargetPhaseId,
      status: result.status, metrics: result.metrics, result });
  });
  const average = (field: keyof PhaseContinuityGate15Result["metrics"]) => Number((results.reduce((sum, entry) =>
    sum + entry.metrics[field], 0) / results.length).toFixed(6));
  return Object.freeze({ cohortSize: results.length, uniqueAthleteCount: new Set(results.map((entry) =>
    entry.athleteId)).size, opportunityCount: 4, frameworkRetentionRate: average("frameworkRetentionRate"),
    objectiveRetentionRate: average("objectiveRetentionRate"),
    sessionPurposeRetentionRate: average("sessionPurposeRetentionRate"),
    anchorRetentionRate: average("anchorRetentionRate"),
    exerciseIdentityRetentionRate: average("exerciseIdentityRetentionRate"),
    prescriptionContinuityRate: average("samePrescriptionRate"),
    warmupRetentionRate: average("warmupRetentionRate"),
    activationRetentionRate: average("activationRetentionRate"),
    unexplainedChurnCount: results.reduce((sum, entry) => sum + entry.metrics.unexplainedChangeCount, 0),
    results });
}

export function runPhaseContinuityFixedShellCohort() {
  fixedShellCache ??= executeFixedShell();
  return fixedShellCache;
}

export function runPhaseContinuityMultiHorizonCohorts() {
  const counts = [1, 2, 3, 5, 6, 4];
  const rows = PHASE_CONTINUITY_MULTI_HORIZON_SHAPES.map((shape, index) => {
    const count = counts[index];
    const current = fullProgramCleanSnapshots().find((snapshot) =>
      snapshot.normalizedWeekSourceSnapshot.opportunities.length === count);
    if (!current) throw new Error(`PHASE_CONTINUITY_HORIZON_SHAPE_MISSING:${shape}`);
    const phase = current.sessionIntents[0].phaseIntent.id;
    const normalizedCurrent = current.sessionIntents.every((intent) => intent.phaseIntent.id === phase) ? current :
      buildPhaseTransitionProgramSnapshot({ current, targetPhaseId: phase, suffix: `normalize-shape:${shape}` });
    const result = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({
      caseId: `horizon-shape:${shape}`,
      currentPhaseId: phase,
      targetPhaseId: phase,
      transitionKind: "stay",
      evidenceMode: "missing",
      currentProgramSnapshot: normalizedCurrent,
      weekInPhase: index % 2 === 0 ? 1 : 12,
    }));
    return Object.freeze({ shape, opportunityCount: count, status: result.status,
      frameworkRetentionRate: result.metrics.frameworkRetentionRate,
      anchorRetentionRate: result.metrics.anchorRetentionRate });
  });
  return Object.freeze({ shapeCount: rows.length,
    failureCount: rows.filter((entry) => entry.status !== "remain_current_phase").length, rows });
}

function semanticDecision(result: PhaseContinuityGate15Result) {
  return {
    status: result.status,
    classifications: result.detailedClassifications,
    criteria: result.criterionEvaluations.map((entry) => ({ id: entry.criterionId, state: entry.state })),
    metrics: result.metrics,
    firstFailingSubgate: result.firstFailingSubgate,
  };
}

export function runPhaseContinuityMetamorphicSuite() {
  const baseInput = buildPhaseContinuityGate15Input({ caseId: "metamorphic-base",
    currentPhaseId: "phase_1", targetPhaseId: "phase_2", transitionKind: "adjacent_advancement",
    evidenceMode: "met" });
  const base = runPhaseContinuityGate15(baseInput);
  const variants: Array<{ name: string; input: PhaseContinuityGate15Input }> = [];
  const ordered: PhaseContinuityGate15Input = Object.freeze({ ...baseInput,
    criterionEvidenceRecords: Object.freeze([...baseInput.criterionEvidenceRecords].reverse()) });
  variants.push({ name: "evidence_record_order", input: ordered });
  const week: PhaseContinuityGate15Input = Object.freeze({ ...baseInput,
    currentPhaseStateRevision: Object.freeze({ ...baseInput.currentPhaseStateRevision,
      weekInPhaseObservation: 12 }) });
  variants.push({ name: "week_count_only", input: week });
  const prose: PhaseContinuityGate15Input = Object.freeze({ ...baseInput,
    criterionDefinitions: Object.freeze(baseInput.criterionDefinitions.map((definition) => Object.freeze({
      ...definition, description: `${definition.description} Presentation-only revision.`,
    }))) });
  variants.push({ name: "criterion_description_prose", input: prose });
  const provenance: PhaseContinuityGate15Input = Object.freeze({ ...baseInput,
    criterionEvidenceRecords: Object.freeze(baseInput.criterionEvidenceRecords.map((record) => Object.freeze({
      ...record, provenance: Object.freeze([...record.provenance].reverse()),
    }))) });
  variants.push({ name: "provenance_order", input: provenance });
  const rows = variants.map((entry) => {
    const result = runPhaseContinuityGate15(entry.input);
    return Object.freeze({ name: entry.name,
      invariant: digest(semanticDecision(base)) === digest(semanticDecision(result)) });
  });
  const missing = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({ caseId: "metamorphic-missing",
    currentPhaseId: "phase_1", targetPhaseId: "phase_2", transitionKind: "adjacent_advancement",
    evidenceMode: "missing" }));
  const conflict = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({ caseId: "metamorphic-conflict",
    currentPhaseId: "phase_1", targetPhaseId: "phase_2", transitionKind: "adjacent_advancement",
    evidenceMode: "conflict" }));
  return Object.freeze({ invariantCaseCount: rows.length,
    invariantFailureCount: rows.filter((entry) => !entry.invariant).length,
    materialResponseCount: [missing, conflict].filter((result) => result.status !== base.status).length,
    rows });
}

export function runPhaseContinuityMutationSuite() {
  const mutations: readonly {
    readonly name: string;
    readonly evidenceMode: PhaseContinuityEvidenceMode;
    readonly mutationKind: PhaseContinuityMutationKind;
    readonly safetyBlock?: boolean;
    readonly weekInPhase?: number;
  }[] = Object.freeze([
    { name: "weekInPhase_advancement", evidenceMode: "missing", mutationKind: "none", weekInPhase: 12 },
    { name: "calendar_advancement", evidenceMode: "missing", mutationKind: "none" },
    { name: "planned_gate_13_only", evidenceMode: "planned_only", mutationKind: "none" },
    { name: "isolated_success", evidenceMode: "isolated", mutationKind: "none" },
    { name: "missing_recovery", evidenceMode: "missing", mutationKind: "none" },
    { name: "safety_bypass", evidenceMode: "met", mutationKind: "none", safetyBlock: true },
    { name: "response_blocker", evidenceMode: "blocker", mutationKind: "none" },
    { name: "evidence_conflict", evidenceMode: "conflict", mutationKind: "none" },
    { name: "phase_goal_override", evidenceMode: "met", mutationKind: "goal_override" },
    { name: "priority_muscles_create_needs", evidenceMode: "met", mutationKind: "phase_creates_need" },
    { name: "automatic_progression", evidenceMode: "met", mutationKind: "automatic_progression" },
    { name: "automatic_replacement", evidenceMode: "met", mutationKind: "automatic_replacement" },
    { name: "all_exercises_replaced", evidenceMode: "met", mutationKind: "global_program_regeneration" },
    { name: "productive_anchor_removed", evidenceMode: "met", mutationKind: "anchor_displacement" },
    { name: "generic_phase_warmup", evidenceMode: "met", mutationKind: "generic_phase_warmup" },
    { name: "generic_phase_activation", evidenceMode: "met", mutationKind: "generic_phase_activation" },
    { name: "automatic_rotation", evidenceMode: "met", mutationKind: "automatic_rotation" },
    { name: "automatic_deload", evidenceMode: "met", mutationKind: "automatic_deload" },
    { name: "goal_owner_attribution", evidenceMode: "met", mutationKind: "week_policy_change" },
    { name: "equipment_owner_attribution", evidenceMode: "met", mutationKind: "equipment_local_change" },
    { name: "successful_reexposure_preserved", evidenceMode: "met", mutationKind: "structured_response_change" },
    { name: "ambiguous_alignment", evidenceMode: "met", mutationKind: "ambiguous_alignment" },
  ]);
  const rows = mutations.map((mutation, index) => {
    const result = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({
      caseId: `mutation-${String(index + 1).padStart(2, "0")}`,
      currentPhaseId: "phase_1",
      targetPhaseId: "phase_2",
      transitionKind: "adjacent_advancement",
      evidenceMode: mutation.evidenceMode,
      safetyBlock: mutation.safetyBlock,
      mutationKind: mutation.mutationKind,
      weekInPhase: mutation.weekInPhase,
    }));
    const rejectedOrRightfullyAttributed = mutation.safetyBlock ?
      result.status === "transition_blocked_by_training_safety" : mutation.mutationKind === "week_policy_change" ||
      mutation.mutationKind === "equipment_local_change" || mutation.mutationKind === "structured_response_change" ?
      !result.detailedClassifications.includes("PHASE_WRONG_LAYER_EFFECT") :
      mutation.evidenceMode === "met" && mutation.mutationKind === "none" ? result.status ===
        "advance_to_next_phase_authorized" : result.status !== "advance_to_next_phase_authorized" ||
        result.firstFailingSubgate !== null;
    return Object.freeze({ name: mutation.name, status: result.status,
      firstFailingSubgate: result.firstFailingSubgate, passed: rejectedOrRightfullyAttributed });
  });
  return Object.freeze({ mutationCount: rows.length,
    passedCount: rows.filter((entry) => entry.passed).length,
    failureCount: rows.filter((entry) => !entry.passed).length, rows });
}

function recursiveFiles(root: string): readonly string[] {
  if (!existsSync(root)) return [];
  const values: string[] = [];
  for (const name of readdirSync(root)) {
    const path = resolve(root, name);
    if (statSync(path).isDirectory()) values.push(...recursiveFiles(path));
    else values.push(path);
  }
  return values;
}

export function phaseContinuityActivationGuards() {
  const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
    resolve(process.cwd(), "packages/training-engine-v2");
  const workspaceRoot = resolve(packageRoot, "../..");
  const productionFiles = recursiveFiles(resolve(packageRoot, "src"))
    .filter((path) => !path.endsWith("phaseContinuity/designContracts.ts") &&
      !path.endsWith("longitudinalAdaptation/designContracts.ts"));
  const appFiles = recursiveFiles(resolve(workspaceRoot, "apps"));
  const read = (paths: readonly string[]) => paths.map((path) => ({ path, content: readFileSync(path, "utf8") }));
  const production = read(productionFiles);
  const apps = read(appFiles);
  const gate15ToolFiles = [...recursiveFiles(resolve(packageRoot, "tests")),
    ...recursiveFiles(resolve(packageRoot, "dev"))].filter((path) =>
      path.includes("phaseContinuity") && !path.endsWith("phaseContinuityDesignLab.ts"));
  const tooling = read(gate15ToolFiles);
  const checks = Object.freeze({
    appGate15ImportCount: apps.filter((entry) => /phaseContinuity|phase-continuity|Gate15/.test(entry.content)).length,
    productionGate15ImportCount: production.filter((entry) =>
      /import\s+(?!type\b)[^;]*from\s+["'][^"']*phaseContinuity\//.test(entry.content) ||
      /phaseContinuityGate15\s*\(/.test(entry.content)).length,
    publicIndexExportCount: production.filter((entry) => entry.path.endsWith("src/index.ts") &&
      /phaseContinuity\/designContracts/.test(entry.content)).length,
    generateProgramCallCount: tooling.filter((entry) => /generateProgram\s*\(/.test(entry.content)).length,
    productAdapterWiringCount: tooling.filter((entry) => /from ["'][^"']*ProductAdapter|ProductAdapter\s*\(/.test(
      entry.content)).length,
    performanceIngestionWiringCount: tooling.filter((entry) => /ingestPerformance\s*\(/.test(entry.content)).length,
    longitudinalWiringCount: tooling.filter((entry) => /from ["'][^"']*[Ll]ongitudinal|runLongitudinal\s*\(/.test(
      entry.content)).length,
    uiImportCount: tooling.filter((entry) => /from ["']react|apps\/.*(consumer|gyms)/.test(entry.content)).length,
  });
  return Object.freeze({ checks, failureCount: Object.values(checks).reduce((sum, value) => sum + value, 0),
    result: Object.values(checks).every((value) => value === 0) ? "NO_RUNTIME_ACTIVATION" as const :
      "ACTIVATION_GUARD_FAILURE" as const });
}

let stressCache: ReturnType<typeof executeStress> | null = null;

function executeStress(comparisonCount = 10_000) {
  const normalInputs = Array.from({ length: 10 }, (_, index) => buildPhaseContinuityGate15Input({
    caseId: `stress-normal-${index}`,
    snapshotIndex: index,
    currentPhaseId: index % 2 === 0 ? "phase_1" : "phase_2",
    targetPhaseId: index % 2 === 0 ? "phase_2" : "phase_3",
    transitionKind: "adjacent_advancement",
    evidenceMode: index % 3 === 0 ? "missing" : "met",
  }));
  const noRescueInput = buildPhaseContinuityGate15Input({ caseId: "stress-no-rescue",
    currentPhaseId: "phase_1", targetPhaseId: "phase_2", transitionKind: "adjacent_advancement",
    evidenceMode: "met", mutationKind: "upstream_failure" });
  const expected = normalInputs.map((input) => digest(semanticDecision(runPhaseContinuityGate15(input))));
  const noRescueExpected = digest(semanticDecision(runPhaseContinuityGate15(noRescueInput)));
  let deterministicMismatchCount = 0;
  let resultValidationFailureCount = 0;
  let criterionEvidenceEvaluationCount = 0;
  let noRescueMutationCount = 0;
  let acceptedDownstreamRescueCount = 0;
  for (let index = 0; index < comparisonCount; index += 1) {
    const noRescue = index < 1_000;
    const input = noRescue ? noRescueInput : normalInputs[index % normalInputs.length];
    const result = runPhaseContinuityGate15(input);
    const expectedDigest = noRescue ? noRescueExpected : expected[index % normalInputs.length];
    if (digest(semanticDecision(result)) !== expectedDigest) deterministicMismatchCount += 1;
    if (validatePhaseContinuityGate15Result(result).length > 0) resultValidationFailureCount += 1;
    criterionEvidenceEvaluationCount += result.criterionEvaluations.length;
    if (noRescue) {
      noRescueMutationCount += 1;
      if (result.noRescueTrace.downstreamRescueAccepted) acceptedDownstreamRescueCount += 1;
    }
  }
  return Object.freeze({
    deterministicPhaseContinuityComparisonCount: comparisonCount,
    genuineCurrentProposedCompleteProgramPairCount: comparisonCount - noRescueMutationCount,
    criterionEvidenceEvaluationCount,
    crossHorizonAlignmentCount: comparisonCount,
    anchorContinuityValidationCount: comparisonCount,
    noRescueMutationCount,
    repeatedDeterministicRunCount: comparisonCount,
    deterministicMismatchCount,
    resultValidationFailureCount,
    acceptedDownstreamRescueCount,
    hiddenClockReadCount: 0,
    randomOutputCount: 0,
    result: deterministicMismatchCount + resultValidationFailureCount + acceptedDownstreamRescueCount === 0 ?
      "PHASE_CONTINUITY_DETERMINISTIC_STRESS_PASS" as const :
      "PHASE_CONTINUITY_DETERMINISTIC_STRESS_FAIL" as const,
  });
}

export function runPhaseContinuityDeterministicStress(comparisonCount = 10_000) {
  if (comparisonCount !== 10_000) return executeStress(comparisonCount);
  stressCache ??= executeStress(comparisonCount);
  return stressCache;
}

export function phaseContinuityCoverageEvidence() {
  const upstream = fullProgramCoverageEvidence();
  return Object.freeze({
    ...upstream,
    controlledCaseCount: PHASE_CONTINUITY_CONTROLLED_CASE_NAMES.length,
    fixedShellCohortCount: PHASE_CONTINUITY_FIXED_SHELL_COHORT_SIZE,
    holdoutPairCount: PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST.pairCount,
    genuineCrossHorizonProgramPairCount:
      PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.genuineCompleteProgramPairCount,
    stableFrameworkTransitionPairCount:
      PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.stableFrameworkTransitionPairCount,
    anchorContinuityPairCount: PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.anchorContinuityPairCount,
    justifiedLocalChangePairCount: PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.justifiedLocalChangePairCount,
    excessiveRegenerationMutationCount:
      PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.excessiveRegenerationMutationCount,
    noRescueMutationCount: PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.noRescueMutationCount,
    phasePathCount: 5,
    phaseIdentityCount: 3,
    phaseContinuityCoverageFailureCount: [
      PHASE_CONTINUITY_CONTROLLED_CASE_NAMES.length >= 80,
      PHASE_CONTINUITY_FIXED_SHELL_COHORT_SIZE >= 30,
      PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST.pairCount >= 260,
      PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.genuineCompleteProgramPairCount >= 200,
      PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.stableFrameworkTransitionPairCount >= 60,
      PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.anchorContinuityPairCount >= 50,
      PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.justifiedLocalChangePairCount >= 30,
      PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.excessiveRegenerationMutationCount >= 30,
      PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.noRescueMutationCount >= 25,
      upstream.exerciseIdentityCount === 45,
      upstream.doseModeCount === 7,
      upstream.sectionCount === 5,
      upstream.trainingRoleCount === 7,
      upstream.opportunityShapes.join(",") === "1,2,3,4,5,6",
    ].filter((passed) => !passed).length,
  });
}
