import type { ExerciseActionFunction } from "../domain/exercise";
import type {
  BodyRegion,
  JointStressTag,
  MovementRole,
  MuscleGroup,
} from "../domain/primitives";
import type { SessionSection } from "../domain/session";

export const PREPARATION_CATEGORIES = [
  "general_readiness",
  "breathing_position",
  "dynamic_mobility",
  "range_access",
  "activation_control",
  "movement_rehearsal",
  "exercise_acclimation",
  "cooldown_downshift",
] as const;

export type PreparationCategory = (typeof PREPARATION_CATEGORIES)[number];

export const PREPARATION_EVIDENCE_CLASSIFICATIONS = [
  "supported_evidence",
  "reasonable_biomechanical_inference",
  "praxis_coaching_doctrine",
  "insufficient_evidence",
] as const;

export type PreparationEvidenceClassification =
  (typeof PREPARATION_EVIDENCE_CLASSIFICATIONS)[number];

export interface PreparationEvidenceReference {
  readonly referenceId: string;
  readonly classification: PreparationEvidenceClassification;
  readonly citation: string;
  readonly sourceUrl: string;
  readonly finding: string;
  readonly boundary: string;
}

export interface PreparationTaxonomyEntry {
  readonly category: PreparationCategory;
  readonly order: number;
  readonly intendedSections: readonly SessionSection[];
  readonly developmentalCredit: false;
  readonly purpose: string;
  readonly ownershipBoundary: string;
}

export type PreparationOwnership = "shared" | "assignment_local";
export type PreparationSetupComplexity = "low" | "moderate" | "high";
export type PreparationFatigueCost = "minimal" | "low" | "moderate" | "high";

export interface PreparationDosageBoundary {
  readonly doseMode:
    | "breath_cycles"
    | "dynamic_repetitions"
    | "static_hold"
    | "duration"
    | "exercise_specific_sets";
  readonly minimum: number | null;
  readonly maximum: number | null;
  readonly unit: "breaths" | "repetitions" | "seconds" | "sets";
  readonly explanation: string;
}

export interface PreparationKnowledgeProfile {
  readonly exerciseId: string;
  readonly categories: readonly PreparationCategory[];
  readonly movementRoles: readonly MovementRole[];
  readonly actionFunctions: readonly ExerciseActionFunction[];
  readonly targetMuscles: readonly MuscleGroup[];
  readonly bodyRegions: readonly BodyRegion[];
  readonly mechanicalStressTags: readonly JointStressTag[];
  readonly equipmentRequirementIds: readonly string[];
  readonly setupComplexity: PreparationSetupComplexity;
  readonly fatigueCost: PreparationFatigueCost;
  readonly intendedSections: readonly SessionSection[];
  readonly compatibleDemandIds: readonly string[];
  readonly incompatibleConditionIds: readonly string[];
  readonly painConsiderations: readonly string[];
  readonly prerequisiteIds: readonly string[];
  readonly ownership: PreparationOwnership;
  readonly dosage: PreparationDosageBoundary;
  readonly timingConstraints: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly explanation: string;
}

export const PREPARATION_CANDIDATE_DISPOSITIONS = [
  "already_production_canonical",
  "legacy_suitable_for_canonical_migration",
  "same_realization_of_existing_identity",
  "genuine_missing_identity",
  "redundant",
  "unsupported",
  "deferred",
] as const;

export type PreparationCandidateDisposition =
  (typeof PREPARATION_CANDIDATE_DISPOSITIONS)[number];

export interface PreparationCandidateAuditRow {
  readonly sourceCatalog: "training_engine_v2" | "product_exercises" | "product_warmup_library";
  readonly sourceId: string;
  readonly canonicalId: string | null;
  readonly disposition: PreparationCandidateDisposition;
  readonly reason: string;
}
