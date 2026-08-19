import type { PhaseId } from "../../domain/phase";
import type {
  ProductionPhaseCriterionDefinition,
  ProductionPhaseCriterionDomain,
} from "./policyContracts";
import type {
  ProductionPhaseEvidenceClassification,
  ProductionPhaseEvidenceOwner,
  ProductionPhaseEvidenceQuality,
} from "../sourceContracts";

const REVIEWED_AT = "2026-08-14T12:00:00-04:00";

function required(
  criterionId: string,
  currentPhaseId: PhaseId,
  targetPhaseId: PhaseId,
  domain: ProductionPhaseCriterionDomain,
  acceptedEvidenceOwners: readonly ProductionPhaseEvidenceOwner[],
  requiredEvidenceQuality: ProductionPhaseEvidenceQuality,
  repeatedEvidenceRequirement: "required" | "not_required",
  description: string,
): ProductionPhaseCriterionDefinition {
  return Object.freeze({
    criterionId,
    currentPhaseId,
    targetPhaseId,
    domain,
    requirementPriority: "required",
    acceptedEvidenceOwners: Object.freeze([...acceptedEvidenceOwners]),
    requiredEvidenceQuality,
    repeatedEvidenceRequirement,
    blockingEvidenceClasses: Object.freeze<ProductionPhaseEvidenceClassification[]>([
      "contradicts_criterion",
      "mixed_evidence",
      "invalid_source",
    ]),
    conflictingEvidenceBehavior: "hold_for_review",
    reviewStatus: "owner_accepted",
    reviewer: "phase_continuity_policy_owner",
    reviewedAt: REVIEWED_AT,
    provenance: Object.freeze([
      "owner-policy:PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT@1.0.0",
      "production-kernel:PRODUCTION_PHASE_CONTINUITY_KERNEL@1.0.0",
    ]),
    description,
  });
}

export const PRODUCTION_PHASE_1_TO_2_CRITERIA = Object.freeze([
  required("p1-p2-repeatable-execution", "phase_1", "phase_2", "execution_quality",
    ["performance_summary", "completed_session_summary"], "validated_completed", "required",
    "Required active foundational work has repeated completed execution-quality support."),
  required("p1-p2-tolerated-exposure", "phase_1", "phase_2", "tolerance",
    ["training_response_receiver"], "reviewed_structured", "required",
    "Relevant completed exposure has repeated tolerance support and no unresolved worsening response."),
  required("p1-p2-program-coherence", "phase_1", "phase_2", "active_objective_realization",
    ["planned_program_truth"], "planned_only", "not_required",
    "Current and proposed planned programs retain valid production Gate 13 truth."),
  required("p1-p2-no-unresolved-blocker", "phase_1", "phase_2", "unresolved_requirement_state",
    ["training_safety", "training_response_receiver"], "reviewed_structured", "not_required",
    "No unresolved safety or required prescription-response blocker remains."),
  required("p1-p2-evidence-sufficiency", "phase_1", "phase_2", "adherence_or_completion",
    ["performance_summary", "completed_session_summary", "product_adherence"],
    "validated_completed", "required", "Completed evidence is sufficiently sourced and repeated."),
]);

export const PRODUCTION_PHASE_2_TO_3_CRITERIA = Object.freeze([
  required("p2-p3-productive-progression", "phase_2", "phase_3", "progression_evidence",
    ["progression_readiness"], "reviewed_structured", "required",
    "Repeated evidence supports productive continuation or progression review without selecting progression."),
  required("p2-p3-recoverability", "phase_2", "phase_3", "recoverability",
    ["training_response_receiver", "completed_session_summary", "athlete_report"],
    "reviewed_structured", "required", "Explicit recovery and tolerance evidence supports phase review."),
  required("p2-p3-stable-execution", "phase_2", "phase_3", "execution_quality",
    ["performance_summary", "completed_session_summary"], "validated_completed", "required",
    "Required active Phase 2 work retains stable completed execution quality."),
  required("p2-p3-no-unresolved-limiter", "phase_2", "phase_3", "unresolved_requirement_state",
    ["training_safety", "training_response_receiver", "product_adherence"],
    "reviewed_structured", "not_required", "No unresolved safety, response, prescription, or adherence limiter remains."),
  required("p2-p3-program-continuity", "phase_2", "phase_3", "continuity_runway",
    ["planned_program_truth", "progression_readiness"], "reviewed_structured", "not_required",
    "The proposed Phase 3 program preserves productive active structure unless another owner justifies change."),
]);

export const PRODUCTION_PHASE_CONTINUITY_V1_CRITERIA = Object.freeze([
  ...PRODUCTION_PHASE_1_TO_2_CRITERIA,
  ...PRODUCTION_PHASE_2_TO_3_CRITERIA,
]);
