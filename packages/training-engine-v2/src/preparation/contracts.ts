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
