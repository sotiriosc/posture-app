import type {
  ExerciseDefinition,
  ExercisePhaseAnnotationProvenance,
  ExercisePhaseAnnotationReviewStatus,
  ExercisePhaseAnnotationScope,
  ExercisePhaseSuitabilityAnnotation,
} from "./domain/exercise";
import type { PhaseId } from "./domain/phase";
import type { SessionSection, TrainingRole } from "./domain/session";
import type { ScoreComponent } from "./scoringContracts";

export const CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY = {
  policyId: "CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN",
  activation: "PRODUCTION_AUTHORITY_REVISED_SEMANTIC_GATE_PASSED",
  categoryValues: {
    excellent: 8.8,
    good: 7.8,
    possible: 6.2,
    poor: 5.5,
  },
  phaseFamilyWeight: 1,
  unknownBehavior: "OMIT_COMPONENT_AND_WEIGHT",
  duplicateMechanicalBonuses: "OMITTED",
  continuityOwner: "INDEPENDENT",
} as const;

export type ContextualPhasePolicyScoringOmissionReason =
  | "NEEDS_REVIEW"
  | "UNKNOWN"
  | "NO_CONTEXTUAL_MATCH"
  | "CONFLICT"
  | "ACCEPTED_PROVENANCE_INCOMPLETE";

export interface ContextualPhasePolicyScoringTrace {
  readonly policyId: typeof CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY.policyId;
  readonly activeByDefault: true;
  readonly component: ScoreComponent | null;
  readonly componentWeightIncluded: boolean;
  readonly omissionReason: ContextualPhasePolicyScoringOmissionReason | null;
  readonly phase1MechanicalControlBonusApplied: false;
  readonly phase3LoadabilityBonusApplied: false;
  readonly automaticReplacementEffect: "none";
}

export const PHASE_ACCEPTED_PROVENANCE_SOURCE_TYPES = [
  "owner_decision",
  "human_exercise_science_review",
  "external_reference",
] as const;

const PHASE_IDS = new Set<PhaseId>(["phase_1", "phase_2", "phase_3"]);
const PHASE_SUITABILITIES = new Set(["poor", "possible", "good", "excellent"]);
const PHASE_REVIEW_STATUSES = new Set<ExercisePhaseAnnotationReviewStatus>([
  "accepted",
  "needs_review",
  "unknown",
]);
const PHASE_PROVENANCE_SOURCE_TYPES = new Set([
  "legacy_reference_catalog_migration",
  ...PHASE_ACCEPTED_PROVENANCE_SOURCE_TYPES,
  "unknown",
]);

export type ContextualPhaseEvidenceStatus =
  | "ACCEPTED_ANNOTATION"
  | "REVIEW_QUALIFIED_ANNOTATION"
  | "UNKNOWN_ANNOTATION"
  | "UNKNOWN_NO_MATCH"
  | "CONFLICTING_ANNOTATIONS";

export type ContextualPhaseSpecificity =
  | "role_and_section"
  | "section"
  | "training_role"
  | "general"
  | "none";

export interface ContextualPhaseResolutionTrace {
  readonly activePhase: PhaseId;
  readonly requestedRole: TrainingRole;
  readonly requestedSection: SessionSection | null;
  readonly candidateExerciseId: string;
  readonly consideredAnnotationIds: readonly string[];
  readonly matchingAnnotationIds: readonly string[];
  readonly selectedAnnotation: ExercisePhaseSuitabilityAnnotation | null;
  readonly specificity: ContextualPhaseSpecificity;
  readonly reviewStatus: ExercisePhaseAnnotationReviewStatus | null;
  readonly provenance: ExercisePhaseAnnotationProvenance | null;
  readonly unresolvedConflictIds: readonly string[];
  readonly evidenceStatus: ContextualPhaseEvidenceStatus;
  readonly productionScoringEligible: boolean;
}

export interface PhaseAnnotationValidationFinding {
  readonly severity: "error";
  readonly code: string;
  readonly message: string;
}

function scopeSpecificity(scope: ExercisePhaseAnnotationScope): ContextualPhaseSpecificity {
  const hasRole = (scope.trainingRoles?.length ?? 0) > 0;
  const hasSection = (scope.sessionSections?.length ?? 0) > 0;
  return hasRole && hasSection
    ? "role_and_section"
    : hasSection
      ? "section"
      : hasRole
        ? "training_role"
        : "general";
}

function specificityRank(specificity: ContextualPhaseSpecificity): number {
  return specificity === "role_and_section"
    ? 4
    : specificity === "section"
      ? 3
      : specificity === "training_role"
        ? 2
        : specificity === "general"
          ? 1
          : 0;
}

function scopeMatches(input: {
  readonly scope: ExercisePhaseAnnotationScope;
  readonly requestedRole: TrainingRole;
  readonly requestedSection: SessionSection | null;
}): boolean {
  const roleMatches =
    !input.scope.trainingRoles || input.scope.trainingRoles.includes(input.requestedRole);
  const sectionMatches =
    !input.scope.sessionSections ||
    (input.requestedSection !== null &&
      input.scope.sessionSections.includes(input.requestedSection));
  return roleMatches && sectionMatches;
}

function sameResolvedMeaning(
  left: ExercisePhaseSuitabilityAnnotation,
  right: ExercisePhaseSuitabilityAnnotation,
): boolean {
  return (
    left.suitability === right.suitability &&
    left.reviewStatus === right.reviewStatus &&
    scopeSpecificity(left.scope) === scopeSpecificity(right.scope) &&
    hasCompleteAcceptedProvenance(left) === hasCompleteAcceptedProvenance(right)
  );
}

function hasCompleteAcceptedProvenance(
  annotation: ExercisePhaseSuitabilityAnnotation,
): boolean {
  const generalScopeHasCoverage =
    scopeSpecificity(annotation.scope) !== "general" ||
    Boolean(
      annotation.provenance.legalUseCoverage &&
        annotation.provenance.legalUseCoverage.trainingRoles.length > 0 &&
        annotation.provenance.legalUseCoverage.sessionSections.length > 0,
    );
  return (
    annotation.reviewStatus === "accepted" &&
    PHASE_ACCEPTED_PROVENANCE_SOURCE_TYPES.includes(
      annotation.provenance
        .sourceType as (typeof PHASE_ACCEPTED_PROVENANCE_SOURCE_TYPES)[number],
    ) &&
    annotation.provenance.sourceRef.trim().length > 0 &&
    annotation.provenance.evidenceBasis.length > 0 &&
    annotation.provenance.evidenceBasis.every((item) => item.trim().length > 0) &&
    Boolean(annotation.provenance.reviewerId?.trim()) &&
    Boolean(
      annotation.provenance.reviewedAt &&
        !Number.isNaN(Date.parse(annotation.provenance.reviewedAt)),
    ) &&
    generalScopeHasCoverage
  );
}

export function acceptedPhaseAnnotationHasProductionProvenance(
  annotation: ExercisePhaseSuitabilityAnnotation,
): boolean {
  return hasCompleteAcceptedProvenance(annotation);
}

export function phaseResolutionCanAffectProductionScoring(
  resolution: ContextualPhaseResolutionTrace,
): boolean {
  return resolution.productionScoringEligible;
}

export function buildContextualPhasePolicyScoringTrace(
  resolution: ContextualPhaseResolutionTrace,
): ContextualPhasePolicyScoringTrace {
  const selected = resolution.selectedAnnotation;
  const omissionReason: ContextualPhasePolicyScoringOmissionReason | null =
    resolution.evidenceStatus === "REVIEW_QUALIFIED_ANNOTATION"
      ? "NEEDS_REVIEW"
      : resolution.evidenceStatus === "UNKNOWN_ANNOTATION"
        ? "UNKNOWN"
        : resolution.evidenceStatus === "UNKNOWN_NO_MATCH"
          ? "NO_CONTEXTUAL_MATCH"
          : resolution.evidenceStatus === "CONFLICTING_ANNOTATIONS"
            ? "CONFLICT"
            : !resolution.productionScoringEligible
              ? "ACCEPTED_PROVENANCE_INCOMPLETE"
              : null;
  const value = selected
    ? CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY.categoryValues[
        selected.suitability
      ]
    : null;
  const component = omissionReason === null && value !== null
    ? {
        id: "phase_fit",
        family: "phase_suitability" as const,
        value,
        rawValue: value,
        weight: 0,
        unnormalizedWeight:
          CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY.phaseFamilyWeight,
        weightedContribution: 0,
        reason: `${selected?.exerciseId} accepted contextual phase suitability for ${resolution.activePhase} is ${selected?.suitability}.`,
        reasonCode: "PHASE_DEVELOPMENT_FIT" as const,
        source: "phase" as const,
      }
    : null;

  return {
    policyId: CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY.policyId,
    activeByDefault: true,
    component,
    componentWeightIncluded: component !== null,
    omissionReason,
    phase1MechanicalControlBonusApplied: false,
    phase3LoadabilityBonusApplied: false,
    automaticReplacementEffect: "none",
  };
}

export function resolveContextualPhaseAnnotation(input: {
  readonly phaseId: PhaseId;
  readonly requestedRole: TrainingRole;
  readonly requestedSection: SessionSection | null;
  readonly exerciseId: string;
  readonly annotations: readonly ExercisePhaseSuitabilityAnnotation[];
}): ContextualPhaseResolutionTrace {
  const considered = input.annotations
    .filter(
      (annotation) =>
        annotation.exerciseId === input.exerciseId && annotation.phaseId === input.phaseId,
    )
    .sort((left, right) => left.annotationId.localeCompare(right.annotationId));
  const matching = considered.filter((annotation) =>
    scopeMatches({
      scope: annotation.scope,
      requestedRole: input.requestedRole,
      requestedSection: input.requestedSection,
    }),
  );
  const highestRank = Math.max(
    0,
    ...matching.map((annotation) => specificityRank(scopeSpecificity(annotation.scope))),
  );
  const finalists = matching.filter(
    (annotation) => specificityRank(scopeSpecificity(annotation.scope)) === highestRank,
  );
  const conflict =
    finalists.length > 1 &&
    finalists.some((annotation) => !sameResolvedMeaning(annotation, finalists[0]));
  const selected = conflict ? null : finalists[0] ?? null;
  const evidenceStatus: ContextualPhaseEvidenceStatus = conflict
    ? "CONFLICTING_ANNOTATIONS"
    : selected?.reviewStatus === "accepted"
      ? "ACCEPTED_ANNOTATION"
      : selected?.reviewStatus === "needs_review"
        ? "REVIEW_QUALIFIED_ANNOTATION"
        : selected?.reviewStatus === "unknown"
          ? "UNKNOWN_ANNOTATION"
          : "UNKNOWN_NO_MATCH";
  const productionScoringEligible =
    evidenceStatus === "ACCEPTED_ANNOTATION" &&
    selected !== null &&
    hasCompleteAcceptedProvenance(selected);

  return {
    activePhase: input.phaseId,
    requestedRole: input.requestedRole,
    requestedSection: input.requestedSection,
    candidateExerciseId: input.exerciseId,
    consideredAnnotationIds: considered.map((annotation) => annotation.annotationId),
    matchingAnnotationIds: matching.map((annotation) => annotation.annotationId),
    selectedAnnotation: selected,
    specificity: selected ? scopeSpecificity(selected.scope) : "none",
    reviewStatus: selected?.reviewStatus ?? null,
    provenance: selected?.provenance ?? null,
    unresolvedConflictIds: conflict
      ? finalists.map((annotation) => annotation.annotationId).sort()
      : [],
    evidenceStatus,
    productionScoringEligible,
  };
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return (
    sortedLeft.length === sortedRight.length &&
    sortedLeft.every((value, index) => value === sortedRight[index])
  );
}

export function validateExercisePhaseAnnotation(
  annotation: ExercisePhaseSuitabilityAnnotation,
  exercise: ExerciseDefinition,
): readonly PhaseAnnotationValidationFinding[] {
  const findings: PhaseAnnotationValidationFinding[] = [];
  const add = (code: string, message: string): void => {
    findings.push({ severity: "error", code, message });
  };

  if (annotation.exerciseId !== exercise.id) {
    add("phase_annotation_exercise_mismatch", "Annotation exerciseId must match its exercise.");
  }
  if (annotation.annotationId.trim().length === 0) {
    add("missing_phase_annotation_id", "Contextual phase annotationId is required.");
  }
  if (annotation.reason.trim().length === 0) {
    add("missing_phase_annotation_reason", "Contextual phase reason is required for trace only.");
  }
  if (!PHASE_IDS.has(annotation.phaseId)) {
    add("invalid_phase_annotation_phase", "Contextual phase annotation phaseId is invalid.");
  }
  if (!PHASE_SUITABILITIES.has(annotation.suitability)) {
    add(
      "invalid_phase_annotation_suitability",
      "Contextual phase annotation suitability is invalid.",
    );
  }
  if (!PHASE_REVIEW_STATUSES.has(annotation.reviewStatus)) {
    add(
      "invalid_phase_annotation_review_status",
      "Contextual phase annotation reviewStatus is invalid.",
    );
  }
  if (!PHASE_PROVENANCE_SOURCE_TYPES.has(annotation.provenance.sourceType)) {
    add(
      "invalid_phase_annotation_source_type",
      "Contextual phase annotation provenance sourceType is invalid.",
    );
  }

  const scopedRoles = annotation.scope.trainingRoles;
  const scopedSections = annotation.scope.sessionSections;
  if (scopedRoles && scopedRoles.length === 0) {
    add(
      "empty_phase_annotation_role_scope",
      "Omit trainingRoles for general or section-only evidence; an explicit empty scope is ambiguous.",
    );
  }
  if (scopedSections && scopedSections.length === 0) {
    add(
      "empty_phase_annotation_section_scope",
      "Omit sessionSections for general or role-only evidence; an explicit empty scope is ambiguous.",
    );
  }
  for (const role of scopedRoles ?? []) {
    if (!exercise.trainingRoles.includes(role)) {
      add(
        "phase_annotation_role_outside_legal_use",
        `Contextual phase annotation role ${role} is not a legal role for this exercise.`,
      );
    }
  }
  for (const section of scopedSections ?? []) {
    if (!(section in exercise.sectionSuitability)) {
      add(
        "phase_annotation_section_outside_legal_use",
        `Contextual phase annotation section ${section} is not a legal section for this exercise.`,
      );
    }
  }

  if (annotation.reviewStatus === "accepted" && !hasCompleteAcceptedProvenance(annotation)) {
    add(
      "accepted_phase_annotation_incomplete_provenance",
      "Accepted contextual phase evidence requires an allowed source, source reference, evidence basis, reviewer identity, and valid reviewedAt.",
    );
  }

  if (
    annotation.reviewStatus === "accepted" &&
    scopeSpecificity(annotation.scope) === "general"
  ) {
    const coverage = annotation.provenance.legalUseCoverage;
    const legalSections = Object.keys(exercise.sectionSuitability);
    if (
      !coverage ||
      !sameSet(coverage.trainingRoles, exercise.trainingRoles) ||
      !sameSet(coverage.sessionSections, legalSections)
    ) {
      add(
        "general_phase_annotation_missing_legal_use_coverage",
        "Accepted general phase evidence must document coverage of every legal training role and session section.",
      );
    }
  }

  return findings;
}
