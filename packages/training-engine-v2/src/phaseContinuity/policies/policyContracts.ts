import type { PhaseId } from "../../domain/phase";
import type {
  ProductionPhaseEvidenceClassification,
  ProductionPhaseEvidenceOwner,
  ProductionPhaseEvidenceQuality,
} from "../sourceContracts";

export interface PhaseContinuityPolicyReference {
  readonly policyId: "PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT";
  readonly version: "1.0.0";
}

export const PRODUCTION_PHASE_CRITERION_DOMAINS = [
  "execution_quality",
  "active_objective_realization",
  "tolerance",
  "training_safety",
  "recoverability",
  "progression_evidence",
  "continuity_runway",
  "adherence_or_completion",
  "unresolved_requirement_state",
  "coach_or_owner_review",
] as const;
export type ProductionPhaseCriterionDomain = typeof PRODUCTION_PHASE_CRITERION_DOMAINS[number];

export interface ProductionPhaseCriterionDefinition {
  readonly criterionId: string;
  readonly currentPhaseId: PhaseId;
  readonly targetPhaseId: PhaseId;
  readonly domain: ProductionPhaseCriterionDomain;
  readonly requirementPriority: "required" | "blocking" | "review_only";
  readonly acceptedEvidenceOwners: readonly ProductionPhaseEvidenceOwner[];
  readonly requiredEvidenceQuality: ProductionPhaseEvidenceQuality;
  readonly repeatedEvidenceRequirement: "required" | "not_required";
  readonly blockingEvidenceClasses: readonly ProductionPhaseEvidenceClassification[];
  readonly conflictingEvidenceBehavior: "hold_for_review" | "block";
  readonly reviewStatus: "owner_accepted" | "needs_review" | "unknown";
  readonly reviewer: "phase_continuity_policy_owner";
  readonly reviewedAt: string;
  readonly provenance: readonly string[];
  readonly description: string;
}

export interface ProductionPhaseContinuityPolicy {
  readonly reference: PhaseContinuityPolicyReference;
  readonly state: "OWNER_SELECTED_FOR_PRODUCTION_KERNEL_NOT_ACTIVATED";
  readonly reviewer: "phase_continuity_policy_owner";
  readonly reviewedAt: string;
  readonly philosophy: readonly string[];
  readonly criterionDefinitionIds: readonly string[];
  readonly automaticAdvancement: false;
  readonly automaticRegression: false;
  readonly automaticCycleReset: false;
  readonly automaticProgression: false;
  readonly automaticReplacement: false;
  readonly automaticRotation: false;
  readonly automaticDeload: false;
  readonly provenance: readonly string[];
}

export type ExplicitPhaseContinuityPolicyInput =
  | ProductionPhaseContinuityPolicy
  | PhaseContinuityPolicyReference
  | null;
