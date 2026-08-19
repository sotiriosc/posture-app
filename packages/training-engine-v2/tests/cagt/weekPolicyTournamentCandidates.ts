import {
  TEST_CANDIDATE_STATE, WEEK_POLICY_TOURNAMENT_VERSION, type AtomicPolicyCandidate,
  type CompositePolicyCandidate, type FrequencyBand, type ObjectivePriority, type PolicyFamily,
} from "./weekPolicyTournamentContracts";
import { digest } from "./signatures";

const band = (minimum: number, target: number, softMaximum: number): FrequencyBand =>
  Object.freeze({ minimum, target, softMaximum });

function atomic(input: Omit<AtomicPolicyCandidate, "version" | "state">): AtomicPolicyCandidate {
  return Object.freeze({ ...input, version: WEEK_POLICY_TOURNAMENT_VERSION, state: TEST_CANDIDATE_STATE });
}

export const ATOMIC_WEEK_POLICY_CANDIDATES: readonly AtomicPolicyCandidate[] = Object.freeze([
  atomic({ id: "STRENGTH_S1_MINIMAL", family: "strength", scope: "required_major_strength_practice", priority: "required", band: band(1, 1, 2), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: false, ruleRefs: ["allocation_frequency_only", "no_dose_credit"] }),
  atomic({ id: "STRENGTH_S2_BALANCED", family: "strength", scope: "required_major_strength_practice", priority: "required", band: band(1, 2, 3), executable: true, ownerLeading: true, stressOnly: false, prescriptionDependent: false, ruleRefs: ["allocation_frequency_only", "no_dose_credit"] }),
  atomic({ id: "STRENGTH_S3_REQUIRED_TWO", family: "strength", scope: "required_major_strength_practice", priority: "required", band: band(2, 2, 3), executable: true, ownerLeading: false, stressOnly: true, prescriptionDependent: false, ruleRefs: ["allocation_frequency_only", "minimum_two_requires_evidence"] }),
  atomic({ id: "STRENGTH_S4_HIGH_FREQUENCY_STRESS", family: "strength", scope: "required_major_strength_practice", priority: "required", band: band(2, 3, 4), executable: true, ownerLeading: false, stressOnly: true, prescriptionDependent: false, ruleRefs: ["allocation_frequency_only", "high_frequency_stress"] }),
  atomic({ id: "STRENGTH_SP1_PREFERRED_ONCE", family: "strength", scope: "preferred_strength_practice", priority: "preferred", band: band(0, 1, 2), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: false, ruleRefs: ["preferred_minimum_zero"] }),
  atomic({ id: "STRENGTH_SP2_PREFERRED_DISTRIBUTED", family: "strength", scope: "preferred_strength_practice", priority: "preferred", band: band(0, 2, 3), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: false, ruleRefs: ["preferred_minimum_zero"] }),
  atomic({ id: "STRENGTH_SO1_OPTIONAL", family: "strength", scope: "explicit_optional_strength_practice", priority: "optional", band: band(0, 1, 1), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: false, ruleRefs: ["optional_minimum_zero", "unique_marginal_value_required"] }),

  atomic({ id: "MUSCLE_H1_SINGLE_FLEXIBLE", family: "muscle", scope: "required_muscle_development", priority: "required", band: band(1, 1, 2), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: true, ruleRefs: ["allocation_distribution_only", "no_volume_credit"] }),
  atomic({ id: "MUSCLE_H2_DISTRIBUTED", family: "muscle", scope: "required_muscle_development", priority: "required", band: band(1, 2, 3), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: true, ruleRefs: ["allocation_distribution_only", "no_volume_credit"] }),
  atomic({ id: "MUSCLE_H3_REQUIRED_TWO", family: "muscle", scope: "required_muscle_development", priority: "required", band: band(2, 2, 3), executable: true, ownerLeading: false, stressOnly: true, prescriptionDependent: true, ruleRefs: ["allocation_distribution_only", "minimum_two_requires_evidence"] }),
  atomic({ id: "MUSCLE_H4_HIGH_FREQUENCY_STRESS", family: "muscle", scope: "required_muscle_development", priority: "required", band: band(2, 3, 4), executable: true, ownerLeading: false, stressOnly: true, prescriptionDependent: true, ruleRefs: ["allocation_distribution_only", "high_frequency_stress"] }),
  atomic({ id: "MUSCLE_HP1_PREFERRED_ONCE", family: "muscle", scope: "preferred_muscle_development", priority: "preferred", band: band(0, 1, 2), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: true, ruleRefs: ["preferred_minimum_zero"] }),
  atomic({ id: "MUSCLE_HP2_PREFERRED_DISTRIBUTED", family: "muscle", scope: "preferred_muscle_development", priority: "preferred", band: band(0, 2, 3), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: true, ruleRefs: ["preferred_minimum_zero"] }),
  atomic({ id: "MUSCLE_HO1_OPTIONAL", family: "muscle", scope: "explicit_optional_muscle_development", priority: "optional", band: band(0, 1, 1), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: true, ruleRefs: ["optional_minimum_zero", "unique_marginal_value_required"] }),

  atomic({ id: "DIRECT_D1_ONCE", family: "direct", scope: "required_explicit_direct_objective", priority: "required", band: band(1, 1, 1), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: false, ruleRefs: ["direct_truth_only", "no_indirect_credit"] }),
  atomic({ id: "DIRECT_D2_FLEXIBLE_REPEAT", family: "direct", scope: "required_explicit_direct_objective", priority: "required", band: band(1, 1, 2), executable: true, ownerLeading: true, stressOnly: false, prescriptionDependent: false, ruleRefs: ["direct_truth_only", "repeat_requires_unique_value"] }),
  atomic({ id: "DIRECT_D3_TARGET_TWO", family: "direct", scope: "required_explicit_direct_objective", priority: "required", band: band(1, 2, 2), executable: true, ownerLeading: false, stressOnly: true, prescriptionDependent: false, ruleRefs: ["direct_truth_only", "target_two_stress"] }),
  atomic({ id: "DIRECT_DP1_PREFERRED", family: "direct", scope: "preferred_explicit_direct_objective", priority: "preferred", band: band(0, 1, 1), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: false, ruleRefs: ["preferred_minimum_zero", "no_indirect_credit"] }),
  atomic({ id: "DIRECT_DO1_OPTIONAL", family: "direct", scope: "optional_explicit_direct_objective", priority: "optional", band: band(0, 1, 1), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: false, ruleRefs: ["optional_minimum_zero", "unique_marginal_value_required"] }),

  atomic({ id: "ASSESSMENT_A1_SINGLE_CLUSTER", family: "assessment", scope: "one_reviewed_assessment_cluster", priority: "required", band: band(1, 1, 1), executable: true, ownerLeading: true, stressOnly: false, prescriptionDependent: false, ruleRefs: ["one_cluster_one_objective", "preferred_band_0_1_1"] }),
  atomic({ id: "ASSESSMENT_A2_REPEAT_OVERRIDE_STRESS", family: "assessment", scope: "separately_authorized_assessment_recurrence", priority: "required", band: band(1, 2, 2), executable: true, ownerLeading: false, stressOnly: true, prescriptionDependent: false, ruleRefs: ["explicit_repeat_override_required"] }),

  atomic({ id: "CAPACITY_C1_ONCE", family: "capacity", scope: "required_supported_carry_bracing_capacity", priority: "required", band: band(1, 1, 1), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: false, ruleRefs: ["supported_capacity_only", "not_systemic_conditioning"] }),
  atomic({ id: "CAPACITY_C2_FLEXIBLE_REPEAT", family: "capacity", scope: "required_supported_carry_bracing_capacity", priority: "required", band: band(1, 1, 2), executable: true, ownerLeading: true, stressOnly: false, prescriptionDependent: false, ruleRefs: ["supported_capacity_only", "repeat_requires_unique_value"] }),
  atomic({ id: "CAPACITY_C3_TARGET_TWO", family: "capacity", scope: "required_supported_carry_bracing_capacity", priority: "required", band: band(1, 2, 3), executable: true, ownerLeading: false, stressOnly: true, prescriptionDependent: false, ruleRefs: ["supported_capacity_only", "target_two_stress"] }),
  atomic({ id: "CAPACITY_CP1_PREFERRED", family: "capacity", scope: "preferred_supported_capacity", priority: "preferred", band: band(0, 1, 1), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: false, ruleRefs: ["preferred_minimum_zero", "not_systemic_conditioning"] }),
  atomic({ id: "CAPACITY_CO1_OPTIONAL", family: "capacity", scope: "optional_supported_capacity", priority: "optional", band: band(0, 1, 1), executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: false, ruleRefs: ["optional_minimum_zero", "unique_marginal_value_required"] }),

  atomic({ id: "PARTICIPATION_P0_NONE", family: "participation", scope: "overall_participation_advisory", priority: "advisory", band: null, executable: false, ownerLeading: false, stressOnly: false, prescriptionDependent: false, ruleRefs: ["no_executable_number"] }),
  atomic({ id: "PARTICIPATION_P1_BROAD_ADVISORY", family: "participation", scope: "overall_participation_advisory", priority: "advisory", band: band(1, 2, 4), executable: false, ownerLeading: false, stressOnly: false, prescriptionDependent: false, ruleRefs: ["advisory_only", "must_not_create_objectives"] }),
  atomic({ id: "PARTICIPATION_P2_TWO_DAY_FLOOR_STRESS", family: "participation", scope: "overall_participation_advisory", priority: "advisory", band: band(2, 2, 4), executable: false, ownerLeading: false, stressOnly: true, prescriptionDependent: false, ruleRefs: ["advisory_only", "one_opportunity_remains_allocation_valid"] }),

  atomic({ id: "SPACING_R0_PRESCRIPTION_PENDING", family: "spacing", scope: "allocation_spacing_state", priority: "allocation_preference", band: null, executable: true, ownerLeading: true, stressOnly: false, prescriptionDependent: true, ruleRefs: ["no_numeric_restriction", "prescription_pending"] }),
  atomic({ id: "SPACING_R1_PREFER_DISTRIBUTION", family: "spacing", scope: "late_lexicographic_distribution_preference", priority: "allocation_preference", band: null, executable: true, ownerLeading: false, stressOnly: false, prescriptionDependent: false, ruleRefs: ["late_tie_break_only", "no_elapsed_time_claim"] }),
  atomic({ id: "SPACING_R2_ONE_OPPORTUNITY_GAP_STRESS", family: "spacing", scope: "repeated_high_burden_objectives", priority: "allocation_preference", band: band(1, 1, 1), executable: true, ownerLeading: false, stressOnly: true, prescriptionDependent: true, ruleRefs: ["ordered_opportunity_gap_stress", "burden_unresolved"] }),
]);

function composite(input: Omit<CompositePolicyCandidate, "version" | "state" | "family">): CompositePolicyCandidate {
  return Object.freeze({ ...input, version: WEEK_POLICY_TOURNAMENT_VERSION, state: TEST_CANDIDATE_STATE, family: "composite" });
}

const refs = (strength: string, muscle: string, direct: string, assessment: string, capacity: string,
  participation: string, spacing: string): Readonly<Record<PolicyFamily, string>> =>
  Object.freeze({ strength, muscle, direct, assessment, capacity, participation, spacing });

export const COMPOSITE_WEEK_POLICY_CANDIDATES: readonly CompositePolicyCandidate[] = Object.freeze([
  composite({ id: "COMPOSITE_M0_MINIMAL_STABILITY", atomicCandidateIds: refs("STRENGTH_S1_MINIMAL", "MUSCLE_H1_SINGLE_FLEXIBLE", "DIRECT_D1_ONCE", "ASSESSMENT_A1_SINGLE_CLUSTER", "CAPACITY_C1_ONCE", "PARTICIPATION_P0_NONE", "SPACING_R0_PRESCRIPTION_PENDING"), noPolicyControl: false, ownerLeading: false, stressOnly: false }),
  composite({ id: "COMPOSITE_B1_BALANCED_CAUSAL", atomicCandidateIds: refs("STRENGTH_S2_BALANCED", "MUSCLE_H2_DISTRIBUTED", "DIRECT_D2_FLEXIBLE_REPEAT", "ASSESSMENT_A1_SINGLE_CLUSTER", "CAPACITY_C2_FLEXIBLE_REPEAT", "PARTICIPATION_P1_BROAD_ADVISORY", "SPACING_R1_PREFER_DISTRIBUTION"), noPolicyControl: false, ownerLeading: true, stressOnly: false }),
  composite({ id: "COMPOSITE_S1_STRENGTH_PRACTICE", atomicCandidateIds: refs("STRENGTH_S3_REQUIRED_TWO", "MUSCLE_H1_SINGLE_FLEXIBLE", "DIRECT_D2_FLEXIBLE_REPEAT", "ASSESSMENT_A1_SINGLE_CLUSTER", "CAPACITY_C2_FLEXIBLE_REPEAT", "PARTICIPATION_P1_BROAD_ADVISORY", "SPACING_R1_PREFER_DISTRIBUTION"), noPolicyControl: false, ownerLeading: false, stressOnly: false }),
  composite({ id: "COMPOSITE_H1_HYPERTROPHY_FLEXIBLE", atomicCandidateIds: refs("STRENGTH_S1_MINIMAL", "MUSCLE_H2_DISTRIBUTED", "DIRECT_D2_FLEXIBLE_REPEAT", "ASSESSMENT_A1_SINGLE_CLUSTER", "CAPACITY_C2_FLEXIBLE_REPEAT", "PARTICIPATION_P1_BROAD_ADVISORY", "SPACING_R1_PREFER_DISTRIBUTION"), noPolicyControl: false, ownerLeading: false, stressOnly: false }),
  composite({ id: "COMPOSITE_F1_HIGH_FREQUENCY_STRESS", atomicCandidateIds: refs("STRENGTH_S4_HIGH_FREQUENCY_STRESS", "MUSCLE_H4_HIGH_FREQUENCY_STRESS", "DIRECT_D3_TARGET_TWO", "ASSESSMENT_A2_REPEAT_OVERRIDE_STRESS", "CAPACITY_C3_TARGET_TWO", "PARTICIPATION_P2_TWO_DAY_FLOOR_STRESS", "SPACING_R2_ONE_OPPORTUNITY_GAP_STRESS"), noPolicyControl: false, ownerLeading: false, stressOnly: true }),
  composite({ id: "COMPOSITE_X0_NO_POLICY", atomicCandidateIds: null, noPolicyControl: true, ownerLeading: false, stressOnly: false }),
]);

export const MINIMAL_COMPOSITE = COMPOSITE_WEEK_POLICY_CANDIDATES[0];

export function atomicCandidate(id: string): AtomicPolicyCandidate {
  const candidate = ATOMIC_WEEK_POLICY_CANDIDATES.find((entry) => entry.id === id);
  if (!candidate) throw new Error(`Unknown atomic policy candidate: ${id}`);
  return candidate;
}

export function candidateFamily(id: string): PolicyFamily | "composite" {
  return ATOMIC_WEEK_POLICY_CANDIDATES.find((entry) => entry.id === id)?.family ?? "composite";
}

export function validateAtomicCandidate(candidate: AtomicPolicyCandidate): readonly string[] {
  const failures: string[] = [];
  if (candidate.version !== WEEK_POLICY_TOURNAMENT_VERSION) failures.push("INVALID_POLICY_VERSION");
  if (candidate.state !== TEST_CANDIDATE_STATE) failures.push("INVALID_CANDIDATE_STATE");
  if (!candidate.id || !candidate.scope || candidate.ruleRefs.length === 0) failures.push("EXPLICIT_SCOPE_AND_RULES_REQUIRED");
  if (candidate.band) {
    const values = [candidate.band.minimum, candidate.band.target, candidate.band.softMaximum];
    if (!values.every(Number.isInteger) || values.some((value) => value < 0)) failures.push("BANDS_MUST_BE_NONNEGATIVE_INTEGERS");
    if (candidate.band.minimum > candidate.band.target || candidate.band.target > candidate.band.softMaximum) failures.push("INVALID_BAND_ORDER");
    if ((candidate.priority === "preferred" || candidate.priority === "optional") && candidate.band.minimum !== 0) failures.push("NON_REQUIRED_MINIMUM_MUST_BE_ZERO");
  }
  if (candidate.family === "capacity" && candidate.scope.includes("conditioning")) failures.push("UNSUPPORTED_CONDITIONING_SCOPE");
  if (candidate.ruleRefs.some((rule) => rule.includes("phase_multiplier"))) failures.push("PHASE_MULTIPLIER_PROHIBITED");
  return failures;
}

export function candidateForPriority(family: PolicyFamily, priority: ObjectivePriority): AtomicPolicyCandidate {
  const exact = ATOMIC_WEEK_POLICY_CANDIDATES.find((entry) => entry.family === family && entry.priority === priority && !entry.stressOnly);
  if (exact) return exact;
  const fallbackIds: Readonly<Record<PolicyFamily, string>> = {
    strength: "STRENGTH_S1_MINIMAL", muscle: "MUSCLE_H1_SINGLE_FLEXIBLE", direct: "DIRECT_D1_ONCE",
    assessment: "ASSESSMENT_A1_SINGLE_CLUSTER", capacity: "CAPACITY_C1_ONCE",
    participation: "PARTICIPATION_P0_NONE", spacing: "SPACING_R0_PRESCRIPTION_PENDING",
  };
  return atomicCandidate(fallbackIds[family]);
}

export const CANDIDATE_LATTICE_FINGERPRINT = digest({
  version: WEEK_POLICY_TOURNAMENT_VERSION,
  atomic: ATOMIC_WEEK_POLICY_CANDIDATES,
  composite: COMPOSITE_WEEK_POLICY_CANDIDATES,
});
