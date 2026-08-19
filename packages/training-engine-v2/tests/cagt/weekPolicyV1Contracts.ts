import type { CompositePolicyCandidate, TournamentScenario } from "./weekPolicyTournamentContracts";
import { digest } from "./signatures";

export const WEEK_POLICY_V1_VERSION = "1.0.0";
export const WEEK_POLICY_V1_AS_OF = "2026-08-12T22:00:00-04:00";
export const WEEK_POLICY_V1_SEED = 0x086713;
export const WEEK_POLICY_V1_STATE = "OWNER_SELECTED_FOR_FINAL_CAGT_ADMISSION_NOT_PRODUCTION" as const;

export const WEEK_POLICY_V1_OWNER_SELECTION = Object.freeze({
  sourceType: "owner_decision" as const,
  reviewerId: "sotiriosc",
  reviewedAt: WEEK_POLICY_V1_AS_OF,
  sourceRef: "docs/training-engine-v2/WEEK_POLICY_V1_OWNER_SELECTION.md#week-policy-v1-causal-core-candidate",
  candidateId: "WEEK_POLICY_V1_CAUSAL_CORE_CANDIDATE",
  status: WEEK_POLICY_V1_STATE,
  strength: { required: [1, 2, 3], preferred: [0, 1, 2], optional: [0, 1, 1], candidate: "STRENGTH_S2_BALANCED" },
  muscle: { required: [1, 1, 2], preferred: [0, 1, 2], optional: [0, 1, 1], candidate: "MUSCLE_H1_SINGLE_FLEXIBLE" },
  direct: { required: [1, 1, 1], preferred: [0, 1, 1], optional: [0, 1, 1], candidate: "DIRECT_D1_ONCE" },
  assessment: { required: [1, 1, 1], preferred: [0, 1, 1], candidate: "ASSESSMENT_A1_SINGLE_CLUSTER" },
  capacity: { required: [1, 1, 1], preferred: [0, 1, 1], optional: [0, 1, 1], candidate: "CAPACITY_C1_ONCE" },
  participation: "PARTICIPATION_P0_NONE",
  spacing: "SPACING_R0_PRESCRIPTION_PENDING",
  deferred: [
    "H2_DEFERRED_PENDING_PRESCRIPTION_DISTRIBUTION_EVIDENCE",
    "D2_DEFERRED_NO_UNIQUE_EXECUTABLE_VALUE",
    "C2_DEFERRED_NO_UNIQUE_REPEAT_VALUE",
  ],
  productionActivation: false,
});

export const WEEK_POLICY_V1_COMPOSITE: CompositePolicyCandidate = Object.freeze({
  id: "WEEK_POLICY_V1_CAUSAL_CORE_CANDIDATE",
  version: "1.0.0",
  state: "CAGT_TEST_CANDIDATE_NOT_PRODUCTION",
  family: "composite",
  atomicCandidateIds: Object.freeze({
    strength: "STRENGTH_S2_BALANCED",
    muscle: "MUSCLE_H1_SINGLE_FLEXIBLE",
    direct: "DIRECT_D1_ONCE",
    assessment: "ASSESSMENT_A1_SINGLE_CLUSTER",
    capacity: "CAPACITY_C1_ONCE",
    participation: "PARTICIPATION_P0_NONE",
    spacing: "SPACING_R0_PRESCRIPTION_PENDING",
  }),
  noPolicyControl: false,
  ownerLeading: true,
  stressOnly: false,
});

export type V1PolicyScope = "required_primary_strength" | "preferred_strength" | "optional_strength" |
  "required_primary_hypertrophy" | "preferred_muscle" | "optional_muscle" | "required_direct" |
  "preferred_direct" | "optional_direct" | "required_assessment_cluster" | "preferred_assessment_cluster" |
  "required_supported_capacity" | "preferred_supported_capacity" | "optional_supported_capacity" |
  "participation_advisory" | "spacing_prescription_pending" | "general_fitness_movement" |
  "posture_movement_quality" | "systemic_conditioning" | "external_sport_load" | "recovery_session" |
  "phase_override" | "direct_secondary_dose" | "prescription_informed_muscle_distribution";

export const WEEK_POLICY_V1_SCOPE_COVERAGE = Object.freeze([
  { scope: "required_primary_strength", status: "covered", rule: "STRENGTH_S2_BALANCED" },
  { scope: "preferred_strength", status: "covered", rule: "0/1/2" },
  { scope: "optional_strength", status: "covered", rule: "0/1/1" },
  { scope: "required_primary_hypertrophy", status: "covered", rule: "MUSCLE_H1_SINGLE_FLEXIBLE" },
  { scope: "preferred_muscle", status: "covered", rule: "0/1/2" },
  { scope: "optional_muscle", status: "covered", rule: "0/1/1" },
  { scope: "required_direct", status: "covered", rule: "DIRECT_D1_ONCE" },
  { scope: "preferred_direct", status: "covered", rule: "0/1/1" },
  { scope: "optional_direct", status: "covered", rule: "0/1/1" },
  { scope: "required_assessment_cluster", status: "covered", rule: "ASSESSMENT_A1_SINGLE_CLUSTER" },
  { scope: "preferred_assessment_cluster", status: "covered", rule: "0/1/1" },
  { scope: "required_supported_capacity", status: "covered", rule: "CAPACITY_C1_ONCE" },
  { scope: "preferred_supported_capacity", status: "covered", rule: "0/1/1" },
  { scope: "optional_supported_capacity", status: "covered", rule: "0/1/1" },
  { scope: "participation_advisory", status: "covered", rule: "PARTICIPATION_P0_NONE" },
  { scope: "spacing_prescription_pending", status: "covered", rule: "SPACING_R0_PRESCRIPTION_PENDING" },
  { scope: "general_fitness_movement", status: "unresolved", rule: "WEEKLY_POLICY_REQUIRED" },
  { scope: "posture_movement_quality", status: "unresolved", rule: "WEEKLY_POLICY_REQUIRED" },
  { scope: "systemic_conditioning", status: "unresolved", rule: "WEEKLY_POLICY_REQUIRED" },
  { scope: "external_sport_load", status: "unresolved", rule: "WEEKLY_POLICY_REQUIRED" },
  { scope: "recovery_session", status: "unresolved", rule: "WEEKLY_POLICY_REQUIRED" },
  { scope: "phase_override", status: "unresolved", rule: "WEEKLY_POLICY_REQUIRED" },
  { scope: "direct_secondary_dose", status: "unresolved", rule: "WEEKLY_POLICY_REQUIRED" },
  { scope: "prescription_informed_muscle_distribution", status: "unresolved", rule: "WEEKLY_POLICY_REQUIRED" },
] as const satisfies readonly { scope: V1PolicyScope; status: "covered" | "unresolved"; rule: string }[]);

export interface V1HoldoutScenario extends TournamentScenario {
  readonly policyScope: V1PolicyScope;
  readonly expectedPolicyStatus: "EXECUTE_V1" | "WEEKLY_POLICY_REQUIRED";
  readonly coherenceFocus: string;
}

export interface WeekPolicyV1HoldoutManifest {
  readonly manifestId: "CAGT_WEEK_POLICY_V1_HOLDOUT_MANIFEST";
  readonly version: "1.0.0";
  readonly fixedSeed: typeof WEEK_POLICY_V1_SEED;
  readonly frozenBeforeExecution: true;
  readonly priorHoldoutScenarioIdsExcluded: true;
  readonly scenarios: readonly V1HoldoutScenario[];
}

export function fingerprintV1HoldoutManifest(manifest: WeekPolicyV1HoldoutManifest): string {
  return digest(manifest);
}

export function assertV1HoldoutManifestFingerprint(manifest: WeekPolicyV1HoldoutManifest,
  expectedFingerprint: string): void {
  const actual = fingerprintV1HoldoutManifest(manifest);
  if (actual !== expectedFingerprint) throw new Error(`WEEK_POLICY_V1_HOLDOUT_FINGERPRINT_MISMATCH:${expectedFingerprint}:${actual}`);
}
