import { digest } from "./signatures";
import type {
  ObjectivePolicyFamily, ObjectivePriority, TournamentObjectiveFixture, TournamentScenario,
} from "./weekPolicyTournamentContracts";

function objective(
  id: string,
  family: ObjectivePolicyFamily,
  priority: ObjectivePriority,
  priorityOrder: number,
  input: { readonly uniqueMarginalValue?: boolean; readonly assessmentRepeatAuthorized?: boolean } = {},
): TournamentObjectiveFixture {
  return Object.freeze({ id, family, priority, priorityOrder, explicit: true,
    uniqueMarginalValue: input.uniqueMarginalValue ?? true,
    ...(input.assessmentRepeatAuthorized === undefined ? {} : { assessmentRepeatAuthorized: input.assessmentRepeatAuthorized }) });
}

const strength = (priority: ObjectivePriority = "required", order = 0) => objective(`strength-${priority}-${order}`, "strength", priority, order);
const muscle = (priority: ObjectivePriority = "required", order = 1) => objective(`muscle-${priority}-${order}`, "muscle", priority, order);
const direct = (priority: ObjectivePriority = "required", order = 1) => objective(`direct-${priority}-${order}`, "direct", priority, order);
const assessment = (authorized = false, priority: ObjectivePriority = "required", order = 1) =>
  objective(`assessment-${priority}-${order}`, "assessment", priority, order, { assessmentRepeatAuthorized: authorized });
const capacity = (priority: ObjectivePriority = "required", order = 1) => objective(`capacity-${priority}-${order}`, "capacity", priority, order);

function scenario(input: {
  readonly id: string;
  readonly cohort: TournamentScenario["cohort"];
  readonly opportunities: number;
  readonly objectives: readonly TournamentObjectiveFixture[];
  readonly condensed?: readonly number[];
  readonly cancelled?: readonly number[];
  readonly bodyweight?: readonly number[];
  readonly unknownEquipment?: readonly number[];
  readonly consecutive?: boolean;
  readonly context?: TournamentScenario["context"];
  readonly expectedConvergence?: boolean;
  readonly materialAdaptiveDifference?: boolean;
}): TournamentScenario {
  return Object.freeze({
    id: input.id, cohort: input.cohort, locked: input.cohort === "holdout", opportunityCount: input.opportunities,
    condensedOpportunityOrders: Object.freeze([...(input.condensed ?? [])]),
    cancelledOpportunityOrders: Object.freeze([...(input.cancelled ?? [])]),
    bodyweightOpportunityOrders: Object.freeze([...(input.bodyweight ?? [])]),
    unknownEquipmentOpportunityOrders: Object.freeze([...(input.unknownEquipment ?? [])]),
    consecutive: input.consecutive ?? false, context: input.context ?? "ordinary",
    objectives: Object.freeze([...input.objectives]), expectedConvergence: input.expectedConvergence ?? false,
    materialAdaptiveDifference: input.materialAdaptiveDifference ?? true,
  });
}

export const CALIBRATION_POLICY_SCENARIOS: readonly TournamentScenario[] = Object.freeze([
  scenario({ id: "cal-two-day-strength", cohort: "calibration", opportunities: 2, objectives: [strength()] }),
  scenario({ id: "cal-three-day-general", cohort: "calibration", opportunities: 3, objectives: [strength(), capacity("preferred")] }),
  scenario({ id: "cal-three-day-hypertrophy", cohort: "calibration", opportunities: 3, objectives: [strength(), muscle()] }),
  scenario({ id: "cal-four-day-hypertrophy", cohort: "calibration", opportunities: 4, objectives: [strength(), muscle()] }),
  scenario({ id: "cal-four-day-strength", cohort: "calibration", opportunities: 4, objectives: [strength(), strength("preferred", 1)] }),
  scenario({ id: "cal-mixed-equipment", cohort: "calibration", opportunities: 3, objectives: [strength(), muscle("preferred")], bodyweight: [1] }),
  scenario({ id: "cal-travel", cohort: "calibration", opportunities: 2, objectives: [strength(), capacity("preferred")], bodyweight: [0], context: "travel" }),
  scenario({ id: "cal-consecutive", cohort: "calibration", opportunities: 3, objectives: [strength(), muscle("preferred")], consecutive: true }),
  scenario({ id: "cal-low-back-sensitive", cohort: "calibration", opportunities: 3, objectives: [strength(), capacity("preferred")], context: "pain_aware" }),
  scenario({ id: "cal-shoulder-sensitive", cohort: "calibration", opportunities: 3, objectives: [strength(), direct("preferred")], context: "pain_aware" }),
  scenario({ id: "cal-knee-sensitive", cohort: "calibration", opportunities: 3, objectives: [strength(), muscle("preferred")], context: "pain_aware" }),
  scenario({ id: "cal-grip-sensitive", cohort: "calibration", opportunities: 3, objectives: [strength(), capacity("optional")], context: "pain_aware" }),
  scenario({ id: "cal-assessment-priority", cohort: "calibration", opportunities: 3, objectives: [strength(), assessment(false)] }),
  scenario({ id: "cal-direct-priority", cohort: "calibration", opportunities: 3, objectives: [strength(), direct()] }),
  scenario({ id: "cal-productive-stable", cohort: "calibration", opportunities: 3, objectives: [strength(), muscle("preferred")], context: "productive_continuity", expectedConvergence: true, materialAdaptiveDifference: false }),
  scenario({ id: "cal-missed-reallocation", cohort: "calibration", opportunities: 3, objectives: [strength(), direct("preferred")], cancelled: [0] }),
  scenario({ id: "cal-two-opportunity-constrained", cohort: "calibration", opportunities: 2, objectives: [strength(), muscle()], condensed: [1] }),
  scenario({ id: "cal-adverse-response", cohort: "calibration", opportunities: 2, objectives: [strength(), capacity("preferred")], context: "adverse_response" }),
  scenario({ id: "cal-one-opportunity", cohort: "calibration", opportunities: 1, objectives: [strength(), direct("preferred")], condensed: [0] }),
]);

export const LOCKED_HOLDOUT_POLICY_SCENARIOS: readonly TournamentScenario[] = Object.freeze([
  scenario({ id: "holdout-one-opportunity", cohort: "holdout", opportunities: 1, objectives: [strength(), muscle("preferred")] }),
  scenario({ id: "holdout-two-opportunities", cohort: "holdout", opportunities: 2, objectives: [strength(), direct()] }),
  scenario({ id: "holdout-three-opportunities", cohort: "holdout", opportunities: 3, objectives: [strength(), muscle()] }),
  scenario({ id: "holdout-four-opportunities", cohort: "holdout", opportunities: 4, objectives: [strength(), capacity()] }),
  scenario({ id: "holdout-five-opportunities", cohort: "holdout", opportunities: 5, objectives: [strength(), muscle("preferred")] }),
  scenario({ id: "holdout-six-opportunities", cohort: "holdout", opportunities: 6, objectives: [strength(), direct("preferred")] }),
  scenario({ id: "holdout-irregular-cycle", cohort: "holdout", opportunities: 4, objectives: [strength(), muscle("preferred")], consecutive: true }),
  scenario({ id: "holdout-mixed-gym-home", cohort: "holdout", opportunities: 3, objectives: [strength(), direct("preferred")], bodyweight: [1] }),
  scenario({ id: "holdout-cancelled", cohort: "holdout", opportunities: 3, objectives: [strength(), capacity("preferred")], cancelled: [1] }),
  scenario({ id: "holdout-consecutive", cohort: "holdout", opportunities: 2, objectives: [strength(), muscle("preferred")], consecutive: true }),
  scenario({ id: "holdout-condensed", cohort: "holdout", opportunities: 2, objectives: [strength(), direct("preferred")], condensed: [0] }),
  scenario({ id: "holdout-explicit-direct", cohort: "holdout", opportunities: 3, objectives: [strength(), direct()] }),
  scenario({ id: "holdout-assessment", cohort: "holdout", opportunities: 3, objectives: [strength(), assessment(false)] }),
  scenario({ id: "holdout-pain-aware", cohort: "holdout", opportunities: 3, objectives: [strength(), muscle("preferred")], context: "pain_aware" }),
  scenario({ id: "holdout-productive-continuity", cohort: "holdout", opportunities: 3, objectives: [strength(), capacity("preferred")], context: "productive_continuity" }),
  scenario({ id: "holdout-adverse-response", cohort: "holdout", opportunities: 2, objectives: [strength(), direct("preferred")], context: "adverse_response" }),
  scenario({ id: "holdout-travel", cohort: "holdout", opportunities: 2, objectives: [strength(), capacity("optional")], bodyweight: [0], context: "travel" }),
  scenario({ id: "holdout-below-minimum", cohort: "holdout", opportunities: 1, objectives: [strength(), muscle()], condensed: [0] }),
  scenario({ id: "holdout-extra-opportunities", cohort: "holdout", opportunities: 6, objectives: [strength(), assessment(true)] }),
  scenario({ id: "holdout-irrelevant-pain", cohort: "holdout", opportunities: 3, objectives: [strength(), direct("preferred")], context: "pain_aware", expectedConvergence: true, materialAdaptiveDifference: false }),
  scenario({ id: "holdout-same-framework-adaptive-difference", cohort: "holdout", opportunities: 4, objectives: [strength(), muscle()], materialAdaptiveDifference: true }),
  scenario({ id: "holdout-same-facts-expected-convergence", cohort: "holdout", opportunities: 4, objectives: [strength(), muscle()], expectedConvergence: true, materialAdaptiveDifference: false }),
  scenario({ id: "holdout-unknown-equipment-search", cohort: "holdout", opportunities: 2, objectives: [strength()], unknownEquipment: [1] }),
]);

export const ALL_POLICY_TOURNAMENT_SCENARIOS = Object.freeze([
  ...CALIBRATION_POLICY_SCENARIOS, ...LOCKED_HOLDOUT_POLICY_SCENARIOS,
]);

export const CALIBRATION_COHORT_FINGERPRINT = digest(CALIBRATION_POLICY_SCENARIOS);
export const HOLDOUT_COHORT_FINGERPRINT = digest(LOCKED_HOLDOUT_POLICY_SCENARIOS);
