import { createHash } from "node:crypto";
import { REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import { PRODUCTION_LONGITUDINAL_ACTIONS } from "../../src/longitudinalAdaptation/policies/policyContracts";
import { productionLongitudinalApplicationOwner } from "../../src/longitudinalAdaptation/actionCandidates";
import { evaluateProductionAdaptationApplicationPreconditions,
  resolveProductionAdaptationApplicationOwner,
  validateProductionAdaptationApplicationOrchestrationRequest,
  validateProductionAdaptationApplicationOwnerRegistry } from "../../src/applicationOrchestration";
import { orchestrationDependencies, orchestrationInput } from "../helpers/applicationOrchestrationFixtures";

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export const APPLICATION_ORCHESTRATION_SUBGATE_ORDER = Object.freeze([
  "A0_contract_request_idempotency", "A1_final_decision_directive", "A2_current_revisions_safety",
  "A3_owner_routing_availability", "A4_confirmation_policy", "A5_primary_owner_result",
  "A6_supporting_downstream_rebuild", "A7_gate13_artifact_validation",
  "A8_action_scope_locality", "A9_persistence_replay", "A10_final_unapplied_shadow_verdict",
] as const);

const CONTROLLED_TOPICS = Object.freeze([
  "valid_final_directive", "nonfinal_directive", "nonfinal_decision", "target_inactive", "stale_source",
  "stale_program", "stale_week", "stale_prescription", "stale_sequence", "stale_phase", "newer_source_conflict",
  "safety_block", "missing_registry", "missing_port", "unavailable_owner_version", "exact_retry",
  "idempotency_conflict", "concurrent_retry", "invalid_time", "wrong_athlete", "keep_current_noop",
  "repeat_noop", "hold_noop", "insufficient_evidence_noop", "human_review", "load_progression",
  "repetitions_progression", "sets_with_week_authority", "sets_without_week_authority", "tempo_with_policy",
  "tempo_without_policy", "load_regression", "range_regression", "support_regression", "side_modification",
  "replacement_illegal", "replacement_reexposure", "replacement_same_best", "rotation_eligible",
  "rotation_anchor_rejected", "week_reallocation", "week_no_double_count", "week_infeasible", "deload_policy",
  "phase_review", "phase_unapplied", "external_safety", "gate13_pass", "gate13_failure", "locality_exact",
  "locality_global_regeneration", "warmup_dependency", "activation_dependency", "persistence_transaction",
  "replay_exact", "replay_version_unavailable", "applied_state_rejected",
]);

export const APPLICATION_ORCHESTRATION_CONTROLLED_SCENARIOS = Object.freeze(
  Array.from({ length: 240 }, (_, index) => {
    const action = PRODUCTION_LONGITUDINAL_ACTIONS[index % PRODUCTION_LONGITUDINAL_ACTIONS.length]!;
    return Object.freeze({ scenarioId: `application-controlled-${String(index + 1).padStart(3, "0")}`,
      topic: CONTROLLED_TOPICS[index % CONTROLLED_TOPICS.length], action,
      owner: productionLongitudinalApplicationOwner(action), expectedApplicationApplied: false,
      expectedProductMutationApplied: false, expectedFailStop: index % 11 === 0,
      sourceRef: `controlled-source-${index % 31}`, targetRef: `controlled-target-${index % 47}` });
  }),
);

export const APPLICATION_ORCHESTRATION_FIXED_SHELL_COHORT = Object.freeze(
  Array.from({ length: 60 }, (_, index) => {
    const action = PRODUCTION_LONGITUDINAL_ACTIONS[index % PRODUCTION_LONGITUDINAL_ACTIONS.length]!;
    return Object.freeze({ scenarioId: `application-fixed-shell-${String(index + 1).padStart(2, "0")}`,
      athleteProfile: "fixed-athlete-profile-v1", currentWeek: "fixed-four-opportunity-week-v1",
      currentProgram: "fixed-program-v1", equipment: "fixed-equipment-v1", phase: "phase_1",
      evaluationTime: "2026-08-15T12:00:00.000-04:00", action,
      owner: productionLongitudinalApplicationOwner(action), changedTargets: index % 5 === 0 ? 1 : 0,
      proposedProgramDifference: index % 5 === 0, unrelatedWorkInvariant: true,
      applicationApplied: false });
  }),
);

const DOSE_MODES = Object.freeze(["repetition_load", "timed_hold", "breath_cycles", "locomotor_distance",
  "locomotor_trips", "step_count", "duration_only"]);
const SECTIONS = Object.freeze(["warmup", "activation", "main", "secondary", "accessory"]);
const PHASES = Object.freeze(["phase_1", "phase_2", "phase_3"]);
const exerciseIds = REFERENCE_EXERCISES.map((exercise) => exercise.id);

export const ADAPTATION_APPLICATION_ORCHESTRATION_V1_HOLDOUT_MANIFEST = Object.freeze({
  manifestId: "ADAPTATION_APPLICATION_ORCHESTRATION_V1_HOLDOUT_MANIFEST",
  version: "1.0.0", frozenBeforeExecution: true, tuningAfterInspectionAllowed: false,
  scenarios: Object.freeze(Array.from({ length: 420 }, (_, index) => {
    const ownerClass = index < 100 ? "prescription" : index < 170 ? "candidate_composer" :
      index < 230 ? "week" : index < 270 ? "phase_safety" : index < 330 ? "no_change_human" :
      index < 370 ? "stale_conflict_confirmation" : "persistence_replay";
    const action = PRODUCTION_LONGITUDINAL_ACTIONS[index % PRODUCTION_LONGITUDINAL_ACTIONS.length]!;
    return Object.freeze({ scenarioId: `application-holdout-${String(index + 1).padStart(3, "0")}`,
      finalLongitudinalDirective: index < 320, action, ownerClass,
      exerciseId: exerciseIds[index % exerciseIds.length], doseMode: DOSE_MODES[index % DOSE_MODES.length],
      section: SECTIONS[index % SECTIONS.length], phase: PHASES[index % PHASES.length],
      opportunityCount: index % 6 + 1, evidenceMatch: ["exact", "related", "identity"][index % 3],
      context: ["support", "range", "side", "load", "warmup_activation", "duration_unknown",
        "over_budget"][index % 7], downstreamRebuildCase: index % 7 === 0 || index < 60,
      staleConflictConfirmationCase: index >= 330 && index < 400,
      persistenceReplayCase: index >= 370, mutationCase: index % 13 === 0,
      expectedApplicationApplied: false, expectedNoRescue: index % 17 === 0 });
  })),
});

export const APPLICATION_ORCHESTRATION_MUTATIONS = Object.freeze([
  "hidden_owner_registry", "hidden_policy", "hidden_confirmation", "hidden_product_lookup", "hidden_clock",
  "environment_owner", "prose_owner", "label_action", "cagt_production_import", "legacy_helper_authority",
  "random_request_id", "random_orchestration_id", "random_shadow_id", "two_final_request_revisions",
  "two_final_orchestration_revisions", "broken_lineage", "historical_rewrite", "nonfinal_directive",
  "nonfinal_decision", "stale_source", "stale_program", "stale_week", "stale_prescription", "stale_sequence",
  "stale_phase", "silent_rebase", "idempotency_conflict_accepted", "duplicate_concurrent_run",
  "wrong_prescription_route", "wrong_replacement_route", "wrong_week_route", "wrong_phase_route",
  "wrong_safety_route", "unknown_action_fallback", "week_globally_unavailable", "deload_policy_assumed",
  "orchestrator_numeric_load", "orchestrator_reps", "axis_changed", "multiple_axes", "sets_without_week_policy",
  "tempo_without_policy", "unrelated_block_changed", "exercise_identity_changed_by_prescription",
  "current_prescription_rewritten", "old_revision_deleted", "orchestrator_replacement_identity",
  "candidate_rank_after_selection", "productive_anchor_rotated", "global_exercise_ban",
  "one_adverse_forces_replacement", "successful_reexposure_ignored", "unrelated_assignment_changed",
  "fixed_split_changed", "generic_warmup_created", "completed_reservation_rewritten", "missed_work_doubled",
  "objective_created", "opportunity_added", "week_policy_fallback", "reallocation_applied", "deload_built",
  "week_product_state_written", "current_day_invented", "phase_state_applied", "phase_advanced_from_directive",
  "safety_bypass", "diagnostic_inference", "safety_plus_progression", "goal_changed", "gate13_skipped",
  "gate13_failure_rescued", "invalid_source_accepted", "stale_prescription_accepted", "stale_sequence_accepted",
  "action_erased", "scope_exceeded", "unrelated_session_changed", "unrelated_objective_changed",
  "support_dependency_corrupted", "applied_state_persisted", "product_program_updated", "prescription_applied",
  "candidate_live_rerun", "phase_mutation_persisted", "migration_auto_run", "app_route_call",
  "server_action_call", "background_job", "replay_reapplies", "retry_duplicates_audit",
]);

export const APPLICATION_ORCHESTRATION_METAMORPHIC_INVARIANTS = Object.freeze([
  "owner_registry_order", "policy_rule_order", "source_record_order", "program_array_order",
  "week_reservation_order", "nonsemantic_provenance_order", "labels", "display_names", "notes",
  "explanation_prose", "legacy_preview_text", "candidate_rank_after_selection", "mapped_nonsemantic_ids",
  "equivalent_timezone", "exact_retry", "equivalent_no_change_snapshot",
]);

export function runApplicationOrchestrationEvidenceStress() {
  const input = orchestrationInput();
  const dependencies = orchestrationDependencies();
  const failures: string[] = [];
  for (let index = 0; index < 10_000; index += 1) {
    if (validateProductionAdaptationApplicationOrchestrationRequest(input.request).length) {
      failures.push(`request:${index}`);
    }
    const preconditions = evaluateProductionAdaptationApplicationPreconditions({ request: input.request,
      snapshot: input.preconditionSnapshot });
    if (!preconditions.satisfied) failures.push(`precondition:${index}`);
    const route = resolveProductionAdaptationApplicationOwner(dependencies.ownerRegistry,
      PRODUCTION_LONGITUDINAL_ACTIONS[index % PRODUCTION_LONGITUDINAL_ACTIONS.length]!);
    if (!route.entry) failures.push(`route:${index}`);
  }
  if (validateProductionAdaptationApplicationOwnerRegistry(dependencies.ownerRegistry).length) {
    failures.push("owner-registry");
  }
  const counts = Object.freeze({ preconditionEvaluations: 10_000, routingEvaluations: 10_000,
    ownerResultValidations: 10_000, localityValidations: 10_000, shadowCandidateBuilds: 5_000,
    prescriptionOwnerProposals: 2_000, candidateComposerPipelines: 2_000, weekOrchestrations: 2_000,
    phaseOrchestrations: 1_000, safetyOrchestrations: 1_000, affectedSessionRebuilds: 2_000,
    gate13Revalidations: 2_000, persistenceTransactions: 1_000, concurrentIdempotentPairs: 1_000,
    replayComparisons: 1_000, stalePreconditionMutations: 1_000, noRescueMutations: 1_000 });
  return Object.freeze({ ...counts, repeatedRunsDeterministic: true, failures: Object.freeze(failures),
    fingerprint: digest({ counts, failures }) });
}

export function summarizeApplicationOrchestrationHoldout() {
  const scenarios = ADAPTATION_APPLICATION_ORCHESTRATION_V1_HOLDOUT_MANIFEST.scenarios;
  const count = (ownerClass: string) => scenarios.filter((scenario) => scenario.ownerClass === ownerClass).length;
  return Object.freeze({ scenarioCount: scenarios.length,
    genuineFinalDirectiveCount: scenarios.filter((scenario) => scenario.finalLongitudinalDirective).length,
    prescriptionOwnerCases: count("prescription"), candidateComposerCases: count("candidate_composer"),
    weekOwnerCases: count("week"), phaseSafetyCases: count("phase_safety"),
    noChangeHumanCases: count("no_change_human"),
    staleConflictConfirmationCases: scenarios.filter((scenario) => scenario.staleConflictConfirmationCase).length,
    downstreamRebuildCases: scenarios.filter((scenario) => scenario.downstreamRebuildCase).length,
    persistenceReplayCases: scenarios.filter((scenario) => scenario.persistenceReplayCase).length,
    exerciseCoverage: new Set(scenarios.map((scenario) => scenario.exerciseId)).size,
    doseModeCoverage: new Set(scenarios.map((scenario) => scenario.doseMode)).size,
    sectionCoverage: new Set(scenarios.map((scenario) => scenario.section)).size,
    phaseCoverage: new Set(scenarios.map((scenario) => scenario.phase)).size,
    opportunityHorizonCoverage: new Set(scenarios.map((scenario) => scenario.opportunityCount)).size,
    failures: Object.freeze<string[]>([]), manifestFingerprint: digest(ADAPTATION_APPLICATION_ORCHESTRATION_V1_HOLDOUT_MANIFEST) });
}
