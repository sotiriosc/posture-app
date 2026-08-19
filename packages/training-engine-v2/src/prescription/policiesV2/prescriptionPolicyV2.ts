import type { NumericTarget } from "../dose";
import type { EffortTarget } from "../executionStandard";
import { PRESCRIPTION_POLICY_SPECIFICITY_ORDER, PRESCRIPTION_POLICY_V1,
  type PrescriptionPolicyRuleVariant } from "../policies";
import type { EvidenceProvenance } from "../types";
import { PRESCRIPTION_POLICY_V2_REFERENCE,
  type PrescriptionPolicyUseCaseV2, type ProductionPrescriptionPolicyRuleV2,
  type ProductionPrescriptionPolicyV2, type PurposeSpecificPolicyCandidate } from "./policyContracts";

const exact = <Unit extends string>(value: number, unit: Unit): NumericTarget<Unit> => ({
  kind: "exact", value, unit,
});
const range = <Unit extends string>(min: number, max: number, unit: Unit): NumericTarget<Unit> => ({
  kind: "range", min, max, unit,
});
const rir = (min: number, max: number): EffortTarget => ({
  kind: "rir", target: { kind: "range", min, max },
});
const movementQuality = (): EffortTarget => ({
  kind: "quality_limited",
  requiredCriterionIds: [
    "b3:movement-quality:explicit-execution-criteria",
    "b3:movement-quality:stop-on-quality-loss",
  ],
  description: "Stop the set when the explicit execution criteria are no longer met.",
});
const provenance = (id: string): EvidenceProvenance => ({
  source: "policy",
  sourceRef: `PRESCRIPTION_POLICY_V2_PURPOSE_SPECIFIC_SUPPORTED_CORE@2.0.0:${id}`,
});

function rule(input: {
  readonly id: string;
  readonly useCase: PrescriptionPolicyUseCaseV2;
  readonly variant: PrescriptionPolicyRuleVariant;
  readonly count: NumericTarget<"count">;
  readonly repetitions: NumericTarget<"count">;
  readonly effort: EffortTarget;
  readonly rest: NumericTarget<"seconds">;
}): ProductionPrescriptionPolicyRuleV2 {
  return Object.freeze({
    ruleId: `PRESCRIPTION_POLICY_V2:${input.id}`,
    kind: "dose_rule",
    specificityLevel: input.variant === "regression" ?
      "experience_and_familiarity" : "explicit_session_goal",
    applicability: Object.freeze({
      useCase: input.useCase, doseMode: "repetition_sets", variant: input.variant,
    }),
    value: Object.freeze({
      unit: "sets", count: input.count, repetitions: input.repetitions,
      effort: input.effort, betweenUnitsRest: input.rest,
    }),
    overrideOfRuleIds: Object.freeze([]),
    conflictsWithRuleIds: Object.freeze([]),
    provenance: provenance(input.id),
  });
}

export const PRESCRIPTION_POLICY_V2_NEW_RULES = Object.freeze([
  rule({ id: "secondary_hypertrophy.SH1", useCase: "secondary_hypertrophy", variant: "default",
    count: exact(2, "count"), repetitions: range(6, 15, "count"), effort: rir(2, 3),
    rest: range(90, 180, "seconds") }),
  rule({ id: "movement_quality_main.MQ1.standard", useCase: "movement_quality_main", variant: "standard",
    count: exact(2, "count"), repetitions: range(5, 10, "count"), effort: movementQuality(),
    rest: range(60, 120, "seconds") }),
  rule({ id: "movement_quality_main.MQ1.regression", useCase: "movement_quality_main", variant: "regression",
    count: range(1, 2, "count"), repetitions: range(4, 8, "count"), effort: movementQuality(),
    rest: range(60, 120, "seconds") }),
  rule({ id: "movement_quality_accessory.MQ1", useCase: "movement_quality_accessory", variant: "default",
    count: range(1, 2, "count"), repetitions: range(6, 12, "count"), effort: movementQuality(),
    rest: range(45, 90, "seconds") }),
  rule({ id: "muscular_endurance_main.ME1.standard", useCase: "muscular_endurance_main", variant: "standard",
    count: range(2, 3, "count"), repetitions: range(15, 25, "count"), effort: rir(1, 3),
    rest: range(30, 90, "seconds") }),
  rule({ id: "muscular_endurance_main.ME1.regression", useCase: "muscular_endurance_main", variant: "regression",
    count: range(1, 2, "count"), repetitions: range(12, 20, "count"), effort: rir(2, 4),
    rest: range(45, 90, "seconds") }),
  rule({ id: "muscular_endurance_accessory.ME1", useCase: "muscular_endurance_accessory", variant: "default",
    count: range(1, 2, "count"), repetitions: range(15, 25, "count"), effort: rir(1, 4),
    rest: range(30, 75, "seconds") }),
]);

export const PURPOSE_SPECIFIC_POLICY_CANDIDATES = Object.freeze([
  ["SH1", "secondary_hypertrophy", true, ["broad_load_hypertrophy", "non_failure_supported"],
    ["two_sets", "six_to_fifteen_repetitions", "ninety_to_one_hundred_eighty_seconds"]],
  ["SH2", "secondary_hypertrophy", false, ["broad_load_hypertrophy"],
    ["shorter_rest_tradeoff", "closer_to_failure_tradeoff"]],
  ["SH3", "secondary_hypertrophy", false, ["broad_load_hypertrophy"],
    ["wider_range", "lower_minimum_volume"]],
  ["MQ1", "movement_quality", true, ["quality_skill_practice", "non_clinical_scope"],
    ["quality_limited", "no_adaptation_credit"]],
  ["MQ2", "movement_quality", false, ["quality_skill_practice"],
    ["shorter_rest", "single_accessory_set"]],
  ["MQ3", "movement_quality", false, ["quality_skill_practice"],
    ["higher_volume", "longer_rest"]],
  ["ME1", "muscular_endurance", true, ["local_endurance_specificity", "older_candidate_bounds_qualified"],
    ["local_only", "no_systemic_claim", "no_failure_requirement"]],
  ["ME2", "muscular_endurance", false, ["local_endurance_specificity"],
    ["lower_repetition_band"]],
  ["ME3", "muscular_endurance", false, ["local_endurance_specificity"],
    ["higher_repetition_band", "shorter_rest"]],
].map(([candidateId, family, ownerPreferred, evidenceEnvelope, consequenceBounds]) => Object.freeze({
  candidateId, family, ownerPreferred, evidenceEnvelope, consequenceBounds,
})) as readonly PurposeSpecificPolicyCandidate[]);

export const PRESCRIPTION_POLICY_V2: ProductionPrescriptionPolicyV2 = Object.freeze({
  policyId: PRESCRIPTION_POLICY_V2_REFERENCE.policyId,
  version: PRESCRIPTION_POLICY_V2_REFERENCE.version,
  state: "reviewed_not_activated",
  reviewer: "sotiriosc",
  reviewedAt: "2026-08-15T18:30:00-04:00",
  philosophy: "Reuse the frozen supported core and add only owner-admitted purpose-specific rules.",
  specificityOrder: PRESCRIPTION_POLICY_SPECIFICITY_ORDER,
  inheritedPolicyReference: Object.freeze({
    policyId: PRESCRIPTION_POLICY_V1.policyId, version: PRESCRIPTION_POLICY_V1.version,
  }),
  inheritedRuleCount: PRESCRIPTION_POLICY_V1.rules.length,
  rules: Object.freeze([...PRESCRIPTION_POLICY_V1.rules, ...PRESCRIPTION_POLICY_V2_NEW_RULES]),
  conflicts: Object.freeze([]),
  provenance: Object.freeze({
    source: "policy", sourceRef: "SUPPORTED_GOAL_AND_LOCAL_PURPOSE_POLICY@1.0.0",
    notes: "V1 rules are retained by reference; only SH1, MQ1, and ME1 are new.",
  }),
  activationAuthorized: false,
});

export function findPrescriptionPolicyV2DoseRule(input: {
  readonly policy: ProductionPrescriptionPolicyV2;
  readonly useCase: PrescriptionPolicyUseCaseV2;
  readonly variant: PrescriptionPolicyRuleVariant;
}): ProductionPrescriptionPolicyRuleV2 | null {
  return input.policy.rules.find((entry) => entry.applicability.useCase === input.useCase &&
    entry.applicability.doseMode === "repetition_sets" &&
    entry.applicability.variant === input.variant) ?? null;
}
