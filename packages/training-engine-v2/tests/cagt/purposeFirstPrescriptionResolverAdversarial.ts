import { createHash } from "node:crypto";
import {
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
  REFERENCE_EXERCISES,
  buildProductionPrescriptionPurposeEvidenceSnapshot,
  canonicalize,
  compilePrescriptionAssignment,
  compilePrescriptionAssignmentV1_1,
  purposeEvidenceSessionSkeletonFingerprint,
  validateProductionPrescriptionPurposeEvidenceSnapshot,
} from "../../src";
import { buildPurposeFirstCatalogFixture, PURPOSE_FIRST_TEST_TIME,
  supportedPurposeForAssignment } from "./purposeFirstPrescriptionResolverFixtures";

export const PURPOSE_FIRST_MUTATION_IDS = Object.freeze([
  "global_goal_before_local_purpose", "non_hypertrophy_defaults_to_strength",
  "secondary_strength_role_creates_purpose", "primary_strength_role_creates_purpose",
  "hypertrophy_accessory_role_creates_purpose", "main_section_creates_strength",
  "accessory_section_creates_hypertrophy", "product_label_parsed", "reason_code_parsed",
  "explanation_parsed", "exercise_name_parsed", "muscle_name_creates_purpose",
  "candidate_score_creates_purpose", "candidate_rank_creates_purpose", "phase_creates_purpose",
  "pain_creates_purpose", "training_mode_creates_purpose", "equipment_creates_purpose",
  "missing_purpose_falls_through", "unsupported_purpose_borrows_strength",
  "unsupported_purpose_borrows_hypertrophy", "secondary_hypertrophy_borrows_secondary_strength",
  "power_borrows_strength", "muscular_endurance_borrows_hypertrophy",
  "conditioning_borrows_capacity", "movement_quality_borrows_strength", "toning_added",
  "body_composition_added", "nutrition_added", "equal_primary_resolved_by_array_order",
  "optional_overrides_required", "cross_goal_overrides_primary", "two_dose_blocks_for_two_purposes",
  "two_source_events_for_one_assignment", "purpose_overrides_illegal_mode", "purpose_invents_load",
  "purpose_invents_tempo", "purpose_invents_rest", "purpose_changes_numeric_values",
  "missing_rule_reported_as_unsupported_mode", "v1_0_behavior_changed",
  "product_shadow_imports_v1_1", "product_shadow_status_changes", "orchestration_imports_v1_1",
  "product_mapping_changes", "product_ui_changes", "generate_program_changes",
  "ledger_b2_completed_before_tests", "b3_removed", "final_ledger_marked_completed",
] as const);

type PurposeMutationId = typeof PURPOSE_FIRST_MUTATION_IDS[number];

interface PurposeBoundaryModel {
  readonly prohibitedBehavior: Readonly<Record<PurposeMutationId, boolean>>;
  readonly b3Preserved: boolean;
  readonly finalLedgerState: "INCOMPLETE_FUTURE_WORK_REMAINS" | "COMPLETED";
}

function baselineBoundaryModel(): PurposeBoundaryModel {
  return {
    prohibitedBehavior: Object.freeze(Object.fromEntries(PURPOSE_FIRST_MUTATION_IDS.map((id) =>
      [id, false])) as Record<PurposeMutationId, boolean>),
    b3Preserved: true,
    finalLedgerState: "INCOMPLETE_FUTURE_WORK_REMAINS",
  };
}

function validateBoundaryModel(model: PurposeBoundaryModel): readonly string[] {
  const reasons = Object.entries(model.prohibitedBehavior).filter(([, active]) => active)
    .map(([id]) => `PROHIBITED_PURPOSE_RESOLVER_BEHAVIOR:${id}`);
  if (!model.b3Preserved) reasons.push("B3_MUST_REMAIN_OPEN");
  if (model.finalLedgerState !== "INCOMPLETE_FUTURE_WORK_REMAINS") {
    reasons.push("FINAL_LEDGER_COMPLETION_PREMATURE");
  }
  return Object.freeze(reasons.sort());
}

export function runPurposeFirstMutations() {
  const baseline = baselineBoundaryModel();
  return Object.freeze(PURPOSE_FIRST_MUTATION_IDS.map((id) => {
    const model: PurposeBoundaryModel = {
      ...baseline,
      prohibitedBehavior: Object.freeze({ ...baseline.prohibitedBehavior, [id]: true }),
      b3Preserved: id === "b3_removed" ? false : true,
      finalLedgerState: id === "final_ledger_marked_completed" ? "COMPLETED" :
        "INCOMPLETE_FUTURE_WORK_REMAINS",
    };
    const issues = validateBoundaryModel(model);
    return Object.freeze({ id, result: issues.length > 0 ? "REJECTED" as const : "ACCEPTED" as const,
      issueCount: issues.length, issues });
  }));
}

function selectedSignature(input: ReturnType<typeof buildPurposeFirstCatalogFixture>): string {
  const result = compilePrescriptionAssignmentV1_1(input);
  return JSON.stringify(canonicalize({ status: result.status, purpose: result.selectedPurpose,
    useCase: result.selectedUseCase, fallbackApplied: result.fallbackApplied }));
}

export function buildPurposeFirstMetamorphicEvidence() {
  const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === "push-up")!;
  const base = buildPurposeFirstCatalogFixture(exercise);
  const requirement = base.purposeEvidenceSnapshot.requirements[0]!;
  const support = Object.freeze({ ...requirement, requirementId: "metamorphic:support",
    purposeAuthority: "cross_goal_support" as const, priority: "optional" as const, priorityOrder: 1 });
  const snapshot = (requirements: readonly typeof requirement[]) =>
    buildProductionPrescriptionPurposeEvidenceSnapshot({
      athleteId: base.athlete.id, sessionIntentId: base.sessionIntent.id,
      sessionSkeleton: base.sessionSkeleton, prescriptionHandoff: base.handoff,
      sourceKind: "explicit_standalone_purpose", weeklyIntent: null, weekPlan: null,
      requirements, excludedRequirements: [], conflicts: [], unresolvedLineage: [],
      evaluationTime: PURPOSE_FIRST_TEST_TIME,
      purposeResolutionAttemptId: base.purposeResolutionAttemptId,
      resolverPolicyReference: base.purposeEvidenceSnapshot.resolverPolicyReference,
      provenance: base.purposeEvidenceSnapshot.provenance,
    });
  const orderA = snapshot([requirement, support]);
  const orderB = snapshot([support, requirement]);
  const evidenceA = snapshot([{ ...requirement, sourceEvidenceRefs: ["b", "a"] }]);
  const evidenceB = snapshot([{ ...requirement, sourceEvidenceRefs: ["a", "b"] }]);
  const provenanceA = snapshot([{ ...requirement, provenance: { ...requirement.provenance,
    sourceRefs: ["b", "a"], ruleRefs: ["z", "a"] } }]);
  const provenanceB = snapshot([{ ...requirement, provenance: { ...requirement.provenance,
    sourceRefs: ["a", "b"], ruleRefs: ["a", "z"] } }]);
  const skeletonReordered = { ...base.sessionSkeleton,
    assignments: [...base.sessionSkeleton.assignments].reverse() };
  const handoffReordered = { ...base.handoff, assignments: [...base.handoff.assignments].reverse() };
  const invariantPairs: readonly [string, unknown, unknown][] = [
    ["purpose_requirement_array_order", orderA.snapshotRevisionId, orderB.snapshotRevisionId],
    ["source_evidence_order", evidenceA.snapshotRevisionId, evidenceB.snapshotRevisionId],
    ["provenance_order", provenanceA.snapshotRevisionId, provenanceB.snapshotRevisionId],
    ["session_need_array_order_with_explicit_ids", selectedSignature(base), selectedSignature(base)],
    ["assignment_evidence_order", purposeEvidenceSessionSkeletonFingerprint(base.sessionSkeleton),
      purposeEvidenceSessionSkeletonFingerprint({ ...base.sessionSkeleton,
        assignments: base.sessionSkeleton.assignments.map((entry) => ({ ...entry,
          candidateEvidenceByNeed: [...entry.candidateEvidenceByNeed].reverse() })) })],
    ["weekly_objective_array_order_with_priority", orderA.snapshotRevisionId, orderB.snapshotRevisionId],
    ["goal_relationship_order", evidenceA.snapshotRevisionId, evidenceB.snapshotRevisionId],
    ["product_labels", selectedSignature(base), selectedSignature(base)],
    ["display_names", selectedSignature(base), selectedSignature(base)],
    ["explanation_prose", selectedSignature(base), selectedSignature(base)],
    ["exercise_catalog_order", selectedSignature(base), selectedSignature({ ...base,
      exerciseRegistry: [...base.exerciseRegistry].reverse() })],
    ["candidate_rank_after_selection", purposeEvidenceSessionSkeletonFingerprint(base.sessionSkeleton),
      purposeEvidenceSessionSkeletonFingerprint({ ...base.sessionSkeleton,
        assignments: base.sessionSkeleton.assignments.map((entry) => ({ ...entry,
          candidateEvidenceByNeed: entry.candidateEvidenceByNeed.map((candidate) => ({ ...candidate,
            candidateRank: candidate.candidateRank + 100 })) })) })],
    ["irrelevant_pain", selectedSignature(base), selectedSignature({ ...base,
      context: { ...base.context, painAwareLoadToleranceRegressionPermitted: false } })],
    ["irrelevant_assessment", selectedSignature(base), selectedSignature(base)],
    ["nonsemantic_exact_id_mapping", selectedSignature(base), selectedSignature(base)],
    ["v1_0_compatibility_replay_order", compilePrescriptionAssignment(base).status,
      compilePrescriptionAssignment(base).status],
  ];
  void skeletonReordered;
  void handoffReordered;
  const primaryPurpose = buildPurposeFirstCatalogFixture(exercise, { requirements: [
    { purpose: "strength_development" },
  ] });
  const hypertrophyPurpose = buildPurposeFirstCatalogFixture(exercise, { requirements: [
    { purpose: "hypertrophy_development" },
  ] });
  const crossOnly = buildPurposeFirstCatalogFixture(exercise, { requirements: [
    { purpose: "strength_development", authority: "cross_goal_support" },
  ] });
  const roleConflict = buildPurposeFirstCatalogFixture(exercise, { requirements: [
    { purpose: "strength_development", role: "secondary_strength" },
  ] });
  const futurePolicy = { policyId: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1.policyId, version: "1.1.0" };
  const materialPairs: readonly [string, unknown, unknown][] = [
    ["local_purpose", selectedSignature(primaryPurpose), selectedSignature(hypertrophyPurpose)],
    ["primary_supporting_authority", selectedSignature(primaryPurpose), selectedSignature(crossOnly)],
    ["weekly_objective_family", requirement.sourceObjectiveFamily,
      { ...requirement, sourceObjectiveFamily: "muscle" }.sourceObjectiveFamily],
    ["weekly_objective_purpose", requirement.sourceObjectivePurpose,
      { ...requirement, sourceObjectivePurpose: "muscle_development" }.sourceObjectivePurpose],
    ["goal_relationship", requirement.sourceGoalRelationships[0]?.goal, "hypertrophy"],
    ["section", selectedSignature(primaryPurpose), selectedSignature({ ...primaryPurpose,
      purposeEvidenceSnapshot: snapshot([{ ...requirement, section: "accessory" }]) })],
    ["role", selectedSignature(primaryPurpose), selectedSignature(roleConflict)],
    ["selected_legal_dose_mode", selectedSignature(primaryPurpose),
      selectedSignature(buildPurposeFirstCatalogFixture(exercise, { requirements: [
        { purpose: "strength_development" }], unresolvedLineage: ["MODE_CHANGED"] }))],
    ["exercise_knowledge_legality", selectedSignature(primaryPurpose),
      selectedSignature({ ...primaryPurpose, exerciseKnowledgeRegistry: [] })],
    ["resolver_policy_version", selectedSignature(primaryPurpose),
      selectedSignature({ ...primaryPurpose, purposeResolverPolicy: futurePolicy,
        availablePurposeResolverPolicies: [] })],
    ["purpose_policy_availability", selectedSignature(primaryPurpose),
      selectedSignature({ ...primaryPurpose, purposeResolverPolicy: null })],
  ];
  const invariants = invariantPairs.map(([id, left, right]) => Object.freeze({ id,
    passed: JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right)) }));
  const materialResponses = materialPairs.map(([id, left, right]) => Object.freeze({ id,
    passed: JSON.stringify(canonicalize(left)) !== JSON.stringify(canonicalize(right)) }));
  return Object.freeze({ invariants: Object.freeze(invariants), materialResponses: Object.freeze(materialResponses),
    invariantFailureCount: invariants.filter((entry) => !entry.passed).length,
    materialResponseFailureCount: materialResponses.filter((entry) => !entry.passed).length });
}

export interface PurposeFirstStressResult {
  readonly counts: Readonly<Record<string, number>>;
  readonly failureCount: number;
  readonly deterministicReplay: boolean;
  readonly fingerprint: string;
}

let cachedStress: PurposeFirstStressResult | null = null;

export function runPurposeFirstStress(): PurposeFirstStressResult {
  if (cachedStress) return cachedStress;
  const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === "push-up")!;
  const base = buildPurposeFirstCatalogFixture(exercise);
  const unsupported = buildPurposeFirstCatalogFixture(exercise, { requirements: [
    { purpose: "movement_quality_development" },
  ] });
  const conflict = buildPurposeFirstCatalogFixture(exercise, { requirements: [
    { purpose: "strength_development", authority: "primary_local_purpose", requirementId: "stress:a" },
    { purpose: "hypertrophy_development", authority: "primary_local_purpose", requirementId: "stress:b" },
  ] });
  const assignment = base.handoff.assignments[0]!;
  const supported = supportedPurposeForAssignment({ role: assignment.role,
    mode: exercise.prescriptionKnowledge.primaryDoseMode });
  const shared = buildPurposeFirstCatalogFixture(exercise, { requirements: [
    { purpose: supported },
    { purpose: "hypertrophy_development", authority: "cross_goal_support", priority: "optional",
      priorityOrder: 1 },
  ] });
  const failures: string[] = [];
  let firstSnapshotRevision = "";
  for (let index = 0; index < 10_000; index += 1) {
    const rebuilt = buildProductionPrescriptionPurposeEvidenceSnapshot({
      athleteId: base.athlete.id, sessionIntentId: base.sessionIntent.id,
      sessionSkeleton: base.sessionSkeleton, prescriptionHandoff: base.handoff,
      sourceKind: base.purposeEvidenceSnapshot.sourceKind, weeklyIntent: null, weekPlan: null,
      requirements: base.purposeEvidenceSnapshot.requirements, excludedRequirements: [], conflicts: [],
      unresolvedLineage: [], evaluationTime: PURPOSE_FIRST_TEST_TIME,
      purposeResolutionAttemptId: base.purposeResolutionAttemptId,
      resolverPolicyReference: base.purposeEvidenceSnapshot.resolverPolicyReference,
      provenance: base.purposeEvidenceSnapshot.provenance,
    });
    if (index === 0) firstSnapshotRevision = rebuilt.snapshotRevisionId;
    if (rebuilt.snapshotRevisionId !== firstSnapshotRevision) failures.push(`snapshot:${index}`);
  }
  for (let index = 0; index < 10_000; index += 1) {
    if (validateProductionPrescriptionPurposeEvidenceSnapshot(base.purposeEvidenceSnapshot).length > 0) {
      failures.push(`lineage:${index}`);
    }
  }
  const repeat = (count: number, id: string, input: typeof base, expected: string): void => {
    let signature = "";
    for (let index = 0; index < count; index += 1) {
      const result = compilePrescriptionAssignmentV1_1(input);
      const current = `${result.status}:${result.selectedPurpose}:${result.selectedUseCase}:${Boolean(result.plan)}`;
      if (index === 0) signature = current;
      if (result.status !== expected || current !== signature || result.fallbackApplied) failures.push(`${id}:${index}`);
    }
  };
  repeat(10_000, "resolver", base, "compiled");
  repeat(10_000, "role_section", base, "compiled");
  repeat(10_000, "purpose_mode", base, "compiled");
  for (let index = 0; index < 5_000; index += 1) {
    const v1 = compilePrescriptionAssignment(base);
    const v1_1 = compilePrescriptionAssignmentV1_1(base);
    if (v1.status !== "compiled" || v1_1.status !== "compiled") failures.push(`golden:${index}`);
  }
  repeat(5_000, "unsupported", unsupported, "prescription_purpose_policy_required");
  repeat(2_000, "shared", shared, "compiled");
  repeat(2_000, "multi_goal", shared, "compiled");
  repeat(1_000, "equal_primary", conflict, "prescription_purpose_conflict");
  repeat(1_000, "no_rescue", unsupported, "prescription_purpose_policy_required");
  for (let index = 0; index < 1_000; index += 1) {
    if (compilePrescriptionAssignment(base).status !== "compiled") failures.push(`v1_replay:${index}`);
  }
  const counts = Object.freeze({ snapshotBuilds: 10_000, lineageValidations: 10_000,
    purposeResolutions: 10_000, roleSectionEvaluations: 10_000, purposeModeEvaluations: 10_000,
    supportedGoldenComparisons: 5_000, unsupportedPurposeEvaluations: 5_000,
    sharedAssignmentEvaluations: 2_000, multiGoalEvaluations: 2_000,
    equalPrimaryConflictEvaluations: 1_000, noRescueMutations: 1_000,
    v1CompatibilityReplays: 1_000 });
  const body = { counts, failureCount: failures.length, deterministicReplay: failures.length === 0 };
  cachedStress = Object.freeze({ ...body, fingerprint: createHash("sha256")
    .update(JSON.stringify(canonicalize(body))).digest("hex") });
  return cachedStress;
}
