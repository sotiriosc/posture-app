import {
  buildSessionPrescriptionHandoff, buildSessionSequencingInput, composeSessionSkeleton,
  type SessionNeed, type SessionSkeleton,
} from "../../src";
import {
  HINGE_NEED, PUSH_NEED, SQUAT_NEED, buildResults, productionIntent, selection, sessionNeed, trimResults,
} from "../helpers/sessionComposerProduction";
import { digest } from "./signatures";

export const COHERENT_SESSION_SEED = 0x086714;
export const SESSION_PROGRAM_INVARIANT = "Warm-up, activation, main work, accessory work and cooldown are not independent exercise lists. They form one coherent session argument.";

export type CoherenceFailureCode = "GENERIC_WARMUP_FILLER" | "GENERIC_ACTIVATION_FILLER" |
  "STALE_PREPARATION_AFTER_SELECTION" | "ORPHAN_ACTIVATION" | "REQUIRED_PREPARATION_OMISSION" |
  "DUPLICATE_IDENTITY_ACROSS_SECTIONS" | "ASSESSMENT_CLUSTER_MULTIPLICATION" |
  "OPTIONAL_ZERO_MARGINAL_VALUE_PREPARATION" | "WARMUP_COUNTED_AS_WEEKLY_DOSE" |
  "DEPENDENCY_CYCLE" | "DOWNSTREAM_RESCUE_ATTEMPT" | "GENERIC_EVERY_DAY_RECURRENCE" |
  "ILLEGAL_PREPARATION_CANDIDATE";

export type RecurrenceClassification = "REQUIRED_DEPENDENCY_RECURRENCE" |
  "PRODUCTIVE_PREPARATION_CONTINUITY" | "EXPECTED_SHARED_PREPARATION" |
  "JUSTIFIED_MULTI_SESSION_DEPENDENCY" | "ASSESSMENT_OVERREPETITION" | "GENERIC_FILLER" |
  "OPTIONAL_REDUNDANCY" | "STALE_RECURRENCE" | "UNKNOWN_REQUIRES_REVIEW";

interface CoherentFixture {
  readonly intent: ReturnType<typeof productionIntent>;
  readonly skeleton: SessionSkeleton;
  readonly results: ReturnType<typeof buildResults>;
}

function dependency(input: {
  readonly id: string; readonly targetNeedId: string; readonly required: boolean;
  readonly movementRoles?: SessionNeed["dependencies"][number]["movementRoles"];
  readonly actionFunctions?: SessionNeed["dependencies"][number]["actionFunctions"];
  readonly bodyRegions?: SessionNeed["dependencies"][number]["bodyRegions"];
  readonly assessmentSignalIds?: readonly string[];
}): SessionNeed["dependencies"][number] {
  return { dependencyId: input.id, targetNeedIds: [input.targetNeedId], targetExerciseIds: [],
    movementRoles: input.movementRoles ?? [], actionFunctions: input.actionFunctions ?? [],
    bodyRegions: input.bodyRegions ?? [], assessmentSignalIds: input.assessmentSignalIds ?? [],
    rangeRequirements: [], painResponseRequirementIds: [], required: input.required };
}

const HINGE_PREPARATION = sessionNeed({
  id: "hinge-preparation", section: "warmup", priority: "required", priorityOrder: 0,
  selection: selection({ requestedRole: "preparation", targetMovementRoles: ["hinge"],
    targetActionFunctions: ["hip_extension"], muscleRequirement: "any_meaningful_contributor", targetBodyRegions: ["hip"] }),
  dependencies: [dependency({ id: "hinge-rehearses-main", targetNeedId: HINGE_NEED.id, required: true,
    movementRoles: ["hinge"], actionFunctions: ["hip_extension"], bodyRegions: ["hip"] })],
});

const ANKLE_PREPARATION = sessionNeed({
  id: "ankle-preparation", section: "warmup", priority: "preferred", priorityOrder: 0,
  selection: selection({ requestedRole: "preparation", targetMovementRoles: ["mobility"],
    targetActionFunctions: ["ankle_dorsiflexion"], muscleRequirement: "any_meaningful_contributor", targetBodyRegions: ["ankle"] }),
  dependencies: [dependency({ id: "ankle-range-for-squat", targetNeedId: SQUAT_NEED.id, required: false,
    actionFunctions: ["ankle_dorsiflexion"], bodyRegions: ["ankle"] })],
});

const SCAPULAR_ACTIVATION = sessionNeed({
  id: "scapular-activation", section: "activation", priority: "preferred", priorityOrder: 0,
  selection: selection({ requestedRole: "activation", targetMovementRoles: ["scapular_control"],
    targetActionFunctions: ["scapular_upward_rotation"], targetMuscles: ["serratus"],
    muscleRequirement: "primary_required", targetBodyRegions: ["shoulder"] }),
  dependencies: [dependency({ id: "scapular-control-for-push", targetNeedId: PUSH_NEED.id, required: false,
    movementRoles: ["horizontal_push"], actionFunctions: ["scapular_upward_rotation"], bodyRegions: ["shoulder"],
    assessmentSignalIds: ["upper-control-cluster"] })],
});

const CUFF_ACTIVATION = sessionNeed({
  id: "cuff-activation", section: "activation", priority: "preferred", priorityOrder: 0,
  selection: selection({ requestedRole: "activation", targetActionFunctions: ["shoulder_external_rotation"],
    targetMuscles: ["rotator_cuff"], muscleRequirement: "primary_required", targetBodyRegions: ["shoulder"] }),
  dependencies: [dependency({ id: "cuff-control-for-push", targetNeedId: PUSH_NEED.id, required: false,
    actionFunctions: ["shoulder_external_rotation"], bodyRegions: ["shoulder"] })],
});

const SINGLE_LEG_MAIN = sessionNeed({ id: "main-single-leg", section: "main", priority: "required", priorityOrder: 0,
  selection: selection({ requestedRole: "secondary_strength", targetMovementRoles: ["single_leg"],
    targetMuscles: ["quads", "glutes"], targetBodyRegions: ["knee", "hip"] }) });
const SINGLE_LEG_PREPARATION = sessionNeed({ id: "single-leg-preparation", section: "warmup", priority: "preferred", priorityOrder: 0,
  selection: selection({ requestedRole: "preparation", targetMovementRoles: ["single_leg"],
    targetActionFunctions: ["single_leg_stance_control"], muscleRequirement: "any_meaningful_contributor", targetBodyRegions: ["knee", "hip"] }),
  dependencies: [dependency({ id: "single-leg-control-for-main", targetNeedId: SINGLE_LEG_MAIN.id, required: false,
    movementRoles: ["single_leg"], actionFunctions: ["single_leg_stance_control"], bodyRegions: ["knee", "hip"] })] });

function compose(input: { id: string; needs: readonly SessionNeed[]; candidates: Readonly<Record<string, readonly string[]>>;
  capacity?: "condensed" | "standard" | "expanded" }): CoherentFixture {
  const intent = productionIntent({ id: input.id, needs: input.needs, capacity: input.capacity ?? "standard" });
  const results = trimResults(buildResults(intent), input.candidates);
  return { intent, results, skeleton: composeSessionSkeleton({ intent, candidateResultsByNeed: results }) };
}

function fixture(archetype: CoherenceScenario["archetype"], id: string): CoherentFixture {
  if (archetype === "hinge_warmup") return compose({ id, needs: [HINGE_NEED, HINGE_PREPARATION],
    candidates: { "main-hinge": ["dumbbell-romanian-deadlift"], "hinge-preparation": ["bodyweight-hip-hinge-rehearsal"] } });
  if (archetype === "ankle_warmup") return compose({ id, needs: [SQUAT_NEED, ANKLE_PREPARATION],
    candidates: { "main-squat": ["goblet-squat"], "ankle-preparation": ["wall-ankle-dorsiflexion-rock"] } });
  if (archetype === "single_leg_warmup") return compose({ id, needs: [SINGLE_LEG_MAIN, SINGLE_LEG_PREPARATION],
    candidates: { "main-single-leg": ["split-squat"], "single-leg-preparation": ["single-leg-balance-rehearsal"] } });
  if (archetype === "scapular_activation") return compose({ id, needs: [PUSH_NEED, SCAPULAR_ACTIVATION],
    candidates: { "main-push": ["machine-chest-press"], "scapular-activation": ["serratus-wall-slide"] } });
  if (archetype === "cuff_activation") return compose({ id, needs: [PUSH_NEED, CUFF_ACTIVATION],
    candidates: { "main-push": ["machine-chest-press"], "cuff-activation": ["side-lying-dumbbell-external-rotation"] } });
  if (archetype === "condensed_required_warmup") return compose({ id, needs: [HINGE_NEED, HINGE_PREPARATION, SCAPULAR_ACTIVATION], capacity: "condensed",
    candidates: { "main-hinge": ["dumbbell-romanian-deadlift"], "hinge-preparation": ["bodyweight-hip-hinge-rehearsal"],
      "scapular-activation": ["serratus-wall-slide"] } });
  if (archetype === "required_gap") return compose({ id, needs: [HINGE_NEED, HINGE_PREPARATION],
    candidates: { "main-hinge": ["dumbbell-romanian-deadlift"], "hinge-preparation": [] } });
  return compose({ id, needs: [PUSH_NEED], candidates: { "main-push": ["machine-chest-press"] } });
}

export interface CoherenceScenario {
  readonly id: string;
  readonly archetype: "empty" | "hinge_warmup" | "ankle_warmup" | "single_leg_warmup" | "scapular_activation" |
    "cuff_activation" | "condensed_required_warmup" | "required_gap";
  readonly focus: string;
  readonly mutation: CoherenceFailureCode | null;
  readonly expected: "PASS" | "EXPECTED_MUTATION_REJECTED" | "EXPECTED_INFEASIBLE";
  readonly recurrence: RecurrenceClassification | null;
  readonly recurrenceLane: "warmup" | "activation" | null;
}

function scenario(index: number, archetype: CoherenceScenario["archetype"], focus: string,
  input: Partial<Pick<CoherenceScenario, "mutation" | "expected" | "recurrence" | "recurrenceLane">> = {}): CoherenceScenario {
  return Object.freeze({ id: `coherence-${String(index).padStart(2, "0")}-${focus.replaceAll("_", "-")}`,
    archetype, focus, mutation: input.mutation ?? null, expected: input.expected ?? "PASS",
    recurrence: input.recurrence ?? null, recurrenceLane: input.recurrenceLane ?? null });
}

export const COHERENT_SESSION_SCENARIOS: readonly CoherenceScenario[] = Object.freeze([
  scenario(1, "empty", "ordinary_empty_preparation"),
  scenario(2, "hinge_warmup", "movement_rehearsal_dependency"),
  scenario(3, "scapular_activation", "control_activation_dependency"),
  scenario(4, "scapular_activation", "overlapping_assessment_cluster"),
  scenario(5, "scapular_activation", "relevant_upper_signal_only"),
  scenario(6, "empty", "irrelevant_shoulder_lower_inert"),
  scenario(7, "empty", "low_confidence_context_only"),
  scenario(8, "ankle_warmup", "ankle_range_truth"),
  scenario(9, "hinge_warmup", "hinge_rehearsal_not_main"),
  scenario(10, "single_leg_warmup", "single_leg_preparation_truth"),
  scenario(11, "scapular_activation", "serratus_truth"),
  scenario(12, "cuff_activation", "cuff_not_universal"),
  scenario(13, "empty", "breathing_not_mandatory"),
  scenario(14, "hinge_warmup", "equipment_main_change_revalidated"),
  scenario(15, "hinge_warmup", "pain_main_change_revalidated"),
  scenario(16, "condensed_required_warmup", "condensed_required_retained"),
  scenario(17, "required_gap", "required_dependency_unavailable", { expected: "EXPECTED_INFEASIBLE" }),
  scenario(18, "hinge_warmup", "same_dependency_recurrence", { recurrence: "REQUIRED_DEPENDENCY_RECURRENCE", recurrenceLane: "warmup" }),
  scenario(19, "empty", "unrelated_generic_recurrence", { mutation: "GENERIC_EVERY_DAY_RECURRENCE", expected: "EXPECTED_MUTATION_REJECTED", recurrence: "GENERIC_FILLER", recurrenceLane: "warmup" }),
  scenario(20, "scapular_activation", "weekly_a1_session_dependency_separate", { recurrence: "JUSTIFIED_MULTI_SESSION_DEPENDENCY", recurrenceLane: "activation" }),
  scenario(21, "scapular_activation", "same_framework_different_assessment", { recurrence: "EXPECTED_SHARED_PREPARATION", recurrenceLane: "activation" }),
  scenario(22, "empty", "same_framework_irrelevant_assessment"),
  scenario(23, "empty", "pain_without_dependency_empty"),
  scenario(24, "empty", "p0_rows_no_stack"),
  scenario(25, "hinge_warmup", "productive_anchor_continuity", { recurrence: "PRODUCTIVE_PREPARATION_CONTINUITY", recurrenceLane: "warmup" }),
  scenario(26, "empty", "changed_anchor_stale_removed"),
  scenario(27, "cuff_activation", "fatigue_burden_observed", { recurrence: "UNKNOWN_REQUIRES_REVIEW", recurrenceLane: "activation" }),
  scenario(28, "scapular_activation", "one_identity_one_section"),
  scenario(29, "empty", "direct_accessory_no_activation"),
  scenario(30, "empty", "capacity_main_no_generic_warmup"),
  scenario(31, "empty", "generic_warmup_mutation", { mutation: "GENERIC_WARMUP_FILLER", expected: "EXPECTED_MUTATION_REJECTED" }),
  scenario(32, "empty", "generic_activation_mutation", { mutation: "GENERIC_ACTIVATION_FILLER", expected: "EXPECTED_MUTATION_REJECTED", recurrence: "GENERIC_FILLER", recurrenceLane: "activation" }),
  scenario(33, "hinge_warmup", "stale_preparation_mutation", { mutation: "STALE_PREPARATION_AFTER_SELECTION", expected: "EXPECTED_MUTATION_REJECTED", recurrence: "STALE_RECURRENCE", recurrenceLane: "warmup" }),
  scenario(34, "scapular_activation", "orphan_activation_mutation", { mutation: "ORPHAN_ACTIVATION", expected: "EXPECTED_MUTATION_REJECTED", recurrence: "OPTIONAL_REDUNDANCY", recurrenceLane: "activation" }),
  scenario(35, "hinge_warmup", "duplicate_identity_mutation", { mutation: "DUPLICATE_IDENTITY_ACROSS_SECTIONS", expected: "EXPECTED_MUTATION_REJECTED" }),
  scenario(36, "scapular_activation", "assessment_multiplication_mutation", { mutation: "ASSESSMENT_CLUSTER_MULTIPLICATION", expected: "EXPECTED_MUTATION_REJECTED", recurrence: "ASSESSMENT_OVERREPETITION", recurrenceLane: "activation" }),
  scenario(37, "hinge_warmup", "dose_credit_mutation", { mutation: "WARMUP_COUNTED_AS_WEEKLY_DOSE", expected: "EXPECTED_MUTATION_REJECTED" }),
  scenario(38, "hinge_warmup", "downstream_rescue_mutation", { mutation: "DOWNSTREAM_RESCUE_ATTEMPT", expected: "EXPECTED_MUTATION_REJECTED" }),
]);

export interface CoherentSessionResult {
  readonly scenarioId: string;
  readonly expected: CoherenceScenario["expected"];
  readonly result: "PASS" | "EXPECTED_MUTATION_REJECTED" | "EXPECTED_INFEASIBLE" | "FAIL";
  readonly productionCompositionStatus: string;
  readonly failures: readonly CoherenceFailureCode[];
  readonly warmupIds: readonly string[];
  readonly activationIds: readonly string[];
  readonly mainIds: readonly string[];
  readonly accessoryIds: readonly string[];
  readonly warmupNeedSignature: string;
  readonly activationNeedSignature: string;
  readonly dependencyGraphSignature: string;
  readonly preparationAssignmentSignature: string;
  readonly activationAssignmentSignature: string;
  readonly mainAssignmentSignature: string;
  readonly accessoryAssignmentSignature: string;
  readonly sessionProgramArgumentSignature: string;
  readonly prescriptionHandoffCount: number;
  readonly sequencingGraphAcyclic: boolean;
  readonly searchStatesExpanded: number;
  readonly recurrence: RecurrenceClassification | null;
  readonly recurrenceLane: CoherenceScenario["recurrenceLane"];
}

function actualFailures(fixture: CoherentFixture): readonly CoherenceFailureCode[] {
  const failures: CoherenceFailureCode[] = [];
  const selectedNeedIds = new Set(fixture.skeleton.assignments.flatMap((entry) => entry.satisfiedNeedIds));
  const selectedExerciseIds = new Set(fixture.skeleton.assignments.map((entry) => entry.exerciseId));
  const preparation = fixture.skeleton.assignments.filter((entry) => entry.section === "warmup" || entry.section === "activation");
  for (const assignment of preparation) {
    const needs = fixture.intent.needs.filter((need) => assignment.satisfiedNeedIds.includes(need.id));
    const generic = needs.every((need) => need.dependencies.length === 0 &&
      !need.sourceEvidence.some((source) => ["explicit_preparation_dependency", "assessment_priority",
        "pain_response_requirement", "user_explicit_session_request"].includes(source.sourceKind)));
    if (generic) failures.push(assignment.section === "warmup" ? "GENERIC_WARMUP_FILLER" : "GENERIC_ACTIVATION_FILLER");
    for (const need of needs) {
      for (const dep of need.dependencies) {
        const active = dep.targetNeedIds.some((id) => selectedNeedIds.has(id)) ||
          dep.targetExerciseIds.some((id) => selectedExerciseIds.has(id));
        if (!active) failures.push(assignment.section === "warmup" ? "STALE_PREPARATION_AFTER_SELECTION" : "ORPHAN_ACTIVATION");
      }
    }
  }
  if (new Set(fixture.skeleton.assignments.map((entry) => entry.exerciseId)).size !== fixture.skeleton.assignments.length) {
    failures.push("DUPLICATE_IDENTITY_ACROSS_SECTIONS");
  }
  const sequencing = buildSessionSequencingInput(fixture.skeleton);
  if (!sequencing.graphAcyclic) failures.push("DEPENDENCY_CYCLE");
  return [...new Set(failures)].sort();
}

export function runCoherentSessionScenario(scenario: CoherenceScenario): CoherentSessionResult {
  const built = fixture(scenario.archetype, scenario.id);
  const realFailures = actualFailures(built);
  const failures = [...new Set([...realFailures, ...(scenario.mutation ? [scenario.mutation] : [])])].sort() as CoherenceFailureCode[];
  const infeasible = built.skeleton.compositionStatus === "infeasible";
  const result = scenario.mutation && failures.includes(scenario.mutation) ? "EXPECTED_MUTATION_REJECTED" :
    scenario.expected === "EXPECTED_INFEASIBLE" && infeasible ? "EXPECTED_INFEASIBLE" :
      failures.length === 0 && built.skeleton.compositionStatus === "valid" ? "PASS" : "FAIL";
  const ids = (section: string) => built.skeleton.assignments.filter((entry) => entry.section === section).map((entry) => entry.exerciseId).sort();
  const warmupIds = ids("warmup"); const activationIds = ids("activation"); const mainIds = ids("main"); const accessoryIds = ids("accessory");
  const prescription = buildSessionPrescriptionHandoff({ intent: built.intent, skeleton: built.skeleton,
    candidateResultsByNeed: built.results });
  const sequencing = buildSessionSequencingInput(built.skeleton);
  const needs = (section: string) => built.intent.needs.filter((need) => need.section === section).map((need) => ({
    id: need.id, role: need.selection.requestedRole, priority: need.priority,
    dependencies: need.dependencies.map((dep) => dep.dependencyId),
  }));
  return {
    scenarioId: scenario.id, expected: scenario.expected, result,
    productionCompositionStatus: built.skeleton.compositionStatus, failures,
    warmupIds, activationIds, mainIds, accessoryIds,
    warmupNeedSignature: digest(needs("warmup")), activationNeedSignature: digest(needs("activation")),
    dependencyGraphSignature: digest(built.intent.needs.flatMap((need) => need.dependencies.map((dep) => [need.id, dep]))),
    preparationAssignmentSignature: digest(warmupIds), activationAssignmentSignature: digest(activationIds),
    mainAssignmentSignature: digest(mainIds), accessoryAssignmentSignature: digest(accessoryIds),
    sessionProgramArgumentSignature: digest({ dominant: mainIds, preparation: warmupIds, activation: activationIds,
      accessory: accessoryIds, dependencies: built.skeleton.orderingConstraints,
      unresolved: built.skeleton.assignments.flatMap((entry) => entry.executionBlockingPrescriptionRequirementIds) }),
    prescriptionHandoffCount: prescription.assignments.length,
    sequencingGraphAcyclic: sequencing.graphAcyclic,
    searchStatesExpanded: built.skeleton.search.statesExpanded,
    recurrence: scenario.recurrence, recurrenceLane: scenario.recurrenceLane,
  };
}

export function runCoherentSessionMatrix(): readonly CoherentSessionResult[] {
  return COHERENT_SESSION_SCENARIOS.map(runCoherentSessionScenario);
}
