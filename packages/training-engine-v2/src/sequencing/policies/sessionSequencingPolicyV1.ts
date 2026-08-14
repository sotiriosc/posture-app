import type { SessionSection } from "../../domain/session";
import type {
  FinalSessionSequencingPolicyRule,
  ProductionFinalSessionSequencingPolicy,
} from "./contracts";

export const SESSION_SEQUENCING_POLICY_V1_ID =
  "SESSION_SEQUENCING_POLICY_V1_CAUSAL_SEQUENTIAL" as const;
export const SESSION_SEQUENCING_POLICY_V1_VERSION = "1.0.0" as const;
export const SESSION_SEQUENCING_POLICY_V1_REVIEWED_AT =
  "2026-08-13T22:15:00-04:00" as const;
export const SESSION_SEQUENCING_POLICY_V1_REVIEWER_ID = "PROJECT_OWNER" as const;

export const PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE = Object.freeze([
  "warmup",
  "activation",
  "main",
  "accessory",
  "cooldown",
] as const satisfies readonly SessionSection[]);

export const PRODUCTION_FINAL_SESSION_SEQUENCING_PHILOSOPHY = Object.freeze([
  "HARD_DEPENDENCIES_FIRST",
  "DOMINANT_PURPOSE_PRESERVED",
  "SUPPORTING_WORK_CONTEXTUAL",
  "FATIGUE_INTERFERENCE_BOUNDED",
  "SETUP_EFFICIENCY_LATE",
  "NO_INVENTED_TIME",
  "SEQUENTIAL_ONLY",
  "NO_ARTIFICIAL_ORDER_VARIATION",
] as const);

export const PRODUCTION_FINAL_SESSION_SEQUENCING_EVALUATION_ORDER = Object.freeze([
  "hard_input_validity",
  "training_safety",
  "assignment_preservation",
  "dependency_satisfaction",
  "section_precedence",
  "prescription_block_atomicity",
  "dominant_purpose_preservation",
  "required_need_priority",
  "planner_priority_vector",
  "supporting_work_context",
  "fatigue_interference",
  "accessory_priority",
  "cooldown_last",
  "setup_efficiency",
  "unknown_transition_burden",
  "canonical_assignment_tie_break",
] as const);

const sourceRef = "SESSION_SEQUENCING_POLICY_V1_CAUSAL_SEQUENTIAL@1.0.0";

function rule(input: {
  readonly id: string;
  readonly kind: FinalSessionSequencingPolicyRule["kind"];
  readonly authority: FinalSessionSequencingPolicyRule["authority"];
  readonly section?: FinalSessionSequencingPolicyRule["section"];
  readonly priority: number;
  readonly value: string;
}): FinalSessionSequencingPolicyRule {
  return Object.freeze({
    ruleId: `SESSION_SEQUENCING_POLICY_V1:${input.id}`,
    kind: input.kind,
    authority: input.authority,
    section: input.section ?? "all",
    priority: input.priority,
    value: input.value,
    provenance: { source: "policy" as const, sourceRef: `${sourceRef}:${input.id}` },
  });
}

const RULES: readonly FinalSessionSequencingPolicyRule[] = Object.freeze([
  rule({ id: "preserve.assignments", kind: "hard_invariant", authority: "hard", priority: 1, value: "PRESERVE_EVERY_ASSIGNMENT_EXACTLY_ONCE" }),
  rule({ id: "preserve.identity", kind: "hard_invariant", authority: "hard", priority: 2, value: "PRESERVE_ASSIGNMENT_SOURCE_PRESCRIPTION_AND_REVISION_IDENTITY" }),
  rule({ id: "preserve.blocks", kind: "hard_invariant", authority: "hard", priority: 3, value: "PRESERVE_DOSE_BLOCK_ORDER_AND_WITHIN_EXERCISE_REST" }),
  rule({ id: "preserve.dependencies", kind: "hard_invariant", authority: "hard", priority: 4, value: "PRESERVE_COMPOSER_DEPENDENCIES" }),
  rule({ id: "section.precedence", kind: "section_precedence", authority: "hard", priority: 5, value: "warmup>activation>main>accessory>cooldown" }),
  rule({ id: "execution.sequential", kind: "execution_mode", authority: "hard", priority: 6, value: "SEQUENTIAL_ASSIGNMENT_EXECUTION_ONLY" }),
  rule({ id: "execution.no_pairing", kind: "execution_mode", authority: "hard", priority: 7, value: "PAIRING_PROHIBITED" }),

  rule({ id: "warmup.dependencies", kind: "section_order", authority: "lexicographic", section: "warmup", priority: 1, value: "hard_dependency_order" }),
  rule({ id: "warmup.required", kind: "section_order", authority: "lexicographic", section: "warmup", priority: 2, value: "required_preparation_priority" }),
  rule({ id: "warmup.dependent_priority", kind: "section_order", authority: "lexicographic", section: "warmup", priority: 3, value: "dependent_need_planner_priority" }),
  rule({ id: "warmup.shared", kind: "section_order", authority: "lexicographic", section: "warmup", priority: 4, value: "shared_dependency_coverage" }),
  rule({ id: "warmup.coherence", kind: "section_order", authority: "lexicographic", section: "warmup", priority: 5, value: "supporting_work_coherence" }),
  rule({ id: "warmup.interference", kind: "interference", authority: "lexicographic", section: "warmup", priority: 6, value: "fatigue_interference" }),
  rule({ id: "warmup.setup", kind: "setup_preference", authority: "late_preference", section: "warmup", priority: 7, value: "setup_relationship_only" }),
  rule({ id: "warmup.tie", kind: "section_order", authority: "late_preference", section: "warmup", priority: 8, value: "canonical_assignment_identity" }),

  rule({ id: "activation.dependencies", kind: "section_order", authority: "lexicographic", section: "activation", priority: 1, value: "hard_control_dependencies" }),
  rule({ id: "activation.required", kind: "section_order", authority: "lexicographic", section: "activation", priority: 2, value: "required_activation_priority" }),
  rule({ id: "activation.dependent_priority", kind: "section_order", authority: "lexicographic", section: "activation", priority: 3, value: "dependent_need_planner_priority" }),
  rule({ id: "activation.shared", kind: "section_order", authority: "lexicographic", section: "activation", priority: 4, value: "shared_coverage" }),
  rule({ id: "activation.low_fatigue", kind: "interference", authority: "lexicographic", section: "activation", priority: 5, value: "low_fatigue_main_support" }),
  rule({ id: "activation.setup", kind: "setup_preference", authority: "late_preference", section: "activation", priority: 6, value: "setup_relationship_only" }),
  rule({ id: "activation.tie", kind: "section_order", authority: "late_preference", section: "activation", priority: 7, value: "canonical_assignment_identity" }),

  rule({ id: "main.dependencies", kind: "section_order", authority: "lexicographic", section: "main", priority: 1, value: "hard_dependency_order" }),
  rule({ id: "main.dominant", kind: "section_order", authority: "lexicographic", section: "main", priority: 2, value: "dominant_session_responsibility" }),
  rule({ id: "main.required", kind: "section_order", authority: "lexicographic", section: "main", priority: 3, value: "required_need_priority" }),
  rule({ id: "main.planner", kind: "section_order", authority: "lexicographic", section: "main", priority: 4, value: "planner_priority_order" }),
  rule({ id: "main.ownership", kind: "section_order", authority: "lexicographic", section: "main", priority: 5, value: "primary_strength_or_dominant_capacity" }),
  rule({ id: "main.readiness", kind: "section_order", authority: "lexicographic", section: "main", priority: 6, value: "unresolved_execution_readiness_protection" }),
  rule({ id: "main.interference", kind: "interference", authority: "lexicographic", section: "main", priority: 7, value: "fatigue_interference_protection" }),
  rule({ id: "main.continuity", kind: "section_order", authority: "late_preference", section: "main", priority: 8, value: "productive_assignment_continuity" }),
  rule({ id: "main.setup", kind: "setup_preference", authority: "late_preference", section: "main", priority: 9, value: "setup_relationship_only" }),
  rule({ id: "main.tie", kind: "section_order", authority: "late_preference", section: "main", priority: 10, value: "canonical_assignment_identity" }),

  rule({ id: "accessory.dependencies", kind: "section_order", authority: "lexicographic", section: "accessory", priority: 1, value: "hard_dependencies" }),
  rule({ id: "accessory.required", kind: "section_order", authority: "lexicographic", section: "accessory", priority: 2, value: "required_accessory" }),
  rule({ id: "accessory.planner", kind: "section_order", authority: "lexicographic", section: "accessory", priority: 3, value: "planner_priority" }),
  rule({ id: "accessory.direct", kind: "section_order", authority: "lexicographic", section: "accessory", priority: 4, value: "required_direct_objective" }),
  rule({ id: "accessory.preferred", kind: "section_order", authority: "lexicographic", section: "accessory", priority: 5, value: "preferred_work" }),
  rule({ id: "accessory.optional", kind: "section_order", authority: "lexicographic", section: "accessory", priority: 6, value: "optional_work" }),
  rule({ id: "accessory.interference", kind: "interference", authority: "lexicographic", section: "accessory", priority: 7, value: "fatigue_interference" }),
  rule({ id: "accessory.setup", kind: "setup_preference", authority: "late_preference", section: "accessory", priority: 8, value: "setup_relationship_only" }),
  rule({ id: "accessory.tie", kind: "section_order", authority: "late_preference", section: "accessory", priority: 9, value: "canonical_assignment_identity" }),

  rule({ id: "cooldown.dependencies", kind: "section_order", authority: "lexicographic", section: "cooldown", priority: 1, value: "hard_dependencies" }),
  rule({ id: "cooldown.required", kind: "section_order", authority: "lexicographic", section: "cooldown", priority: 2, value: "required_recovery_priority" }),
  rule({ id: "cooldown.planner", kind: "section_order", authority: "lexicographic", section: "cooldown", priority: 3, value: "planner_priority" }),
  rule({ id: "cooldown.setup", kind: "setup_preference", authority: "late_preference", section: "cooldown", priority: 4, value: "setup_relationship_only" }),
  rule({ id: "cooldown.tie", kind: "section_order", authority: "late_preference", section: "cooldown", priority: 5, value: "canonical_assignment_identity" }),
  rule({ id: "timing.no_invention", kind: "transition_timing", authority: "hard", priority: 1, value: "EXPLICIT_OR_UNKNOWN" }),
]);

export const SESSION_SEQUENCING_POLICY_V1: ProductionFinalSessionSequencingPolicy = Object.freeze({
  policyId: SESSION_SEQUENCING_POLICY_V1_ID,
  version: SESSION_SEQUENCING_POLICY_V1_VERSION,
  state: "reviewed_not_activated",
  reviewer: SESSION_SEQUENCING_POLICY_V1_REVIEWER_ID,
  reviewedAt: SESSION_SEQUENCING_POLICY_V1_REVIEWED_AT,
  philosophy: PRODUCTION_FINAL_SESSION_SEQUENCING_PHILOSOPHY,
  sectionPrecedence: PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE,
  executionMode: "SEQUENTIAL_ASSIGNMENT_EXECUTION_ONLY",
  pairingDisposition: "SESSION_PAIRING_AND_SUPERSET_POLICY_REVIEW",
  pairingPermitted: false,
  evaluationOrder: PRODUCTION_FINAL_SESSION_SEQUENCING_EVALUATION_ORDER,
  rules: RULES,
  conflicts: [],
  setupPolicy: Object.freeze({
    relationshipIsDuration: false,
    preference: "late_lexicographic_only",
  } as const),
  interferencePolicy: Object.freeze({
    additiveScorePermitted: false,
    potentialIsHardRejection: false,
    preference: "after_purpose_and_priority",
  } as const),
  timingPolicy: Object.freeze({
    inventedTimePermitted: false,
    absentSetupDuration: "unknown",
    absentRecovery: "not_prescribed",
    absentSectionBoundaryDuration: "unknown",
  } as const),
  provenance: {
    source: "policy" as const,
    sourceRef: "docs/training-engine-v2/FINAL_SESSION_SEQUENCING_POLICY_V1_CONTRACT.md",
    notes: "Owner-admitted V1 semantics graduated to production source without activation.",
  },
  activationAuthorized: false,
});

/** Frozen compatibility projection for historical design/CAGT evidence. */
export const SESSION_SEQUENCING_POLICY_V1_ADMISSION_PROJECTION = Object.freeze({
  policyId: SESSION_SEQUENCING_POLICY_V1.policyId,
  version: SESSION_SEQUENCING_POLICY_V1.version,
  state: "OWNER_SELECTED_FOR_FINAL_CAGT_ADMISSION_NOT_PRODUCTION" as const,
  reviewedAt: SESSION_SEQUENCING_POLICY_V1.reviewedAt,
  reviewerId: SESSION_SEQUENCING_POLICY_V1.reviewer,
  philosophy: SESSION_SEQUENCING_POLICY_V1.philosophy,
  sectionPrecedence: SESSION_SEQUENCING_POLICY_V1.sectionPrecedence,
  executionMode: SESSION_SEQUENCING_POLICY_V1.executionMode,
  pairingDisposition: SESSION_SEQUENCING_POLICY_V1.pairingDisposition,
  automaticSelectionPermitted: false,
  productionActivationAuthorized: false,
});
