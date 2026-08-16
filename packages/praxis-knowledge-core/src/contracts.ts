export const KNOWLEDGE_CORE_CONTRACT = Object.freeze({
  contractId: "PRAXIS_EXERCISE_KNOWLEDGE_CORE",
  contractVersion: "1.0.0",
} as const);

export const KNOWLEDGE_ENTRY_CONTRACT = Object.freeze({
  contractId: "EXERCISE_KNOWLEDGE_ENTRY",
  contractVersion: "1.0.0",
} as const);

export const KNOWLEDGE_FACT_CONTRACT = Object.freeze({
  contractId: "EXERCISE_KNOWLEDGE_FACT",
  contractVersion: "1.0.0",
} as const);

export const KNOWLEDGE_PRESENTATION_MAP_CONTRACT = Object.freeze({
  contractId: "EXERCISE_KNOWLEDGE_PRESENTATION_MAP",
  contractVersion: "1.0.0",
} as const);

export const REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT = Object.freeze({
  contractId: "EXERCISE_REALIZATION_KNOWLEDGE_OVERRIDE",
  contractVersion: "1.0.0",
} as const);

export const KNOWLEDGE_PROVENANCE_CONTRACT = Object.freeze({
  contractId: "EXERCISE_KNOWLEDGE_PROVENANCE",
  contractVersion: "1.0.0",
} as const);

export const COMPACT_FALLBACK_PROJECTION_CONTRACT = Object.freeze({
  contractId: "EXERCISE_KNOWLEDGE_COMPACT_FALLBACK_PROJECTION",
  contractVersion: "1.0.0",
} as const);

export const KNOWLEDGE_COMPLETENESS_AUDIT_CONTRACT = Object.freeze({
  contractId: "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_AUDIT",
  contractVersion: "1.0.0",
} as const);

export const KNOWLEDGE_CURATION_WAVE_CONTRACT = Object.freeze({
  contractId: "EXERCISE_KNOWLEDGE_CURATION_WAVE",
  contractVersion: "1.0.0",
} as const);

export type KnowledgeContractReference =
  | typeof KNOWLEDGE_CORE_CONTRACT
  | typeof KNOWLEDGE_ENTRY_CONTRACT
  | typeof KNOWLEDGE_FACT_CONTRACT
  | typeof KNOWLEDGE_PRESENTATION_MAP_CONTRACT
  | typeof REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT
  | typeof KNOWLEDGE_PROVENANCE_CONTRACT
  | typeof COMPACT_FALLBACK_PROJECTION_CONTRACT
  | typeof KNOWLEDGE_COMPLETENESS_AUDIT_CONTRACT
  | typeof KNOWLEDGE_CURATION_WAVE_CONTRACT;

export const KNOWLEDGE_FACT_KINDS = [
  "setup_instruction",
  "execution_instruction",
  "movement_pattern",
  "watch_for",
  "mechanics_explanation",
  "equipment_boundary",
  "safety_boundary",
] as const;

export type ExerciseKnowledgeFactKind = (typeof KNOWLEDGE_FACT_KINDS)[number];
export type ExerciseKnowledgeReviewStatus = "accepted" | "needs_review";

export interface ExerciseKnowledgeProvenance {
  readonly contract: typeof KNOWLEDGE_PROVENANCE_CONTRACT;
  readonly sourceType:
    | "owner_decision"
    | "human_exercise_science_review"
    | "external_reference"
    | "equipment_capability_truth"
    | "unknown";
  readonly sourceRef: string;
  readonly evidenceBasis: readonly string[];
}

export interface ExerciseKnowledgeApplicability {
  readonly realizationIds: readonly string[];
  readonly contexts: readonly ("workout" | "library" | "curation")[];
}

export interface ExerciseKnowledgeFact {
  readonly contract: typeof KNOWLEDGE_FACT_CONTRACT;
  readonly id: string;
  readonly exerciseId: string;
  readonly kind: ExerciseKnowledgeFactKind;
  readonly canonicalStatement: string;
  readonly compactInstruction?: string;
  readonly applicability: ExerciseKnowledgeApplicability;
  readonly reviewStatus: ExerciseKnowledgeReviewStatus;
  readonly provenance: readonly ExerciseKnowledgeProvenance[];
  readonly futureDeeperOnly?: boolean;
}

export interface ExerciseKnowledgePresentationMap {
  readonly contract: typeof KNOWLEDGE_PRESENTATION_MAP_CONTRACT;
  readonly exerciseId: string;
  readonly focus: string;
  readonly cues: readonly string[];
  readonly setup: readonly string[];
  readonly during: readonly string[];
  readonly pattern: readonly string[];
  readonly watchFor: readonly string[];
  readonly compactFallbackRefs?: {
    readonly summary: string;
    readonly coachingFocus: readonly string[];
  };
}

export interface ExerciseRealizationKnowledgeOverride {
  readonly contract: typeof REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT;
  readonly id: string;
  readonly exerciseId: string;
  readonly realizationId: string;
  readonly addSetupRefs?: readonly string[];
  readonly replaceSetupRefs?: readonly string[];
  readonly addDuringRefs?: readonly string[];
  readonly replaceDuringRefs?: readonly string[];
  readonly addWatchForRefs?: readonly string[];
  readonly replaceWatchForRefs?: readonly string[];
  readonly focusRef?: string;
  readonly equipmentBoundaryRefs?: readonly string[];
  readonly reviewStatus: ExerciseKnowledgeReviewStatus;
  readonly provenance: readonly ExerciseKnowledgeProvenance[];
}

export interface ExerciseKnowledgeEntry {
  readonly contract: typeof KNOWLEDGE_ENTRY_CONTRACT;
  readonly exerciseId: string;
  readonly canonicalName: string;
  readonly facts: readonly ExerciseKnowledgeFact[];
  readonly presentation: ExerciseKnowledgePresentationMap;
  readonly realizationOverrides: readonly ExerciseRealizationKnowledgeOverride[];
  readonly relatedMechanicsIds: readonly string[];
  readonly relatedMovementRoleIds: readonly string[];
  readonly relatedActionFunctionIds: readonly string[];
  readonly relatedStressTags: readonly string[];
  readonly relatedPainTopicIds: readonly string[];
  readonly reviewStatus: ExerciseKnowledgeReviewStatus;
  readonly provenance: readonly ExerciseKnowledgeProvenance[];
  readonly unresolvedClaims: readonly string[];
}

export interface PraxisExerciseKnowledgeCore {
  readonly contract: typeof KNOWLEDGE_CORE_CONTRACT;
  readonly entries: readonly ExerciseKnowledgeEntry[];
}

export interface ExerciseKnowledgeCompactFallback {
  readonly contract: typeof COMPACT_FALLBACK_PROJECTION_CONTRACT;
  readonly exerciseId: string;
  readonly summary: string;
  readonly coachingFocus: readonly string[];
  readonly sourceFactIds: readonly string[];
}

export interface KnowledgeValidationFinding {
  readonly severity: "error" | "warning";
  readonly code: string;
  readonly targetId: string;
  readonly message: string;
}
