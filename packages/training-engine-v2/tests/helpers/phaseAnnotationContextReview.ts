import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CANDIDATE_SCORE_COMPONENTS,
  DEFAULT_CANDIDATE_SCORING_WEIGHTS,
  EMPTY_TRAINING_HISTORY,
  FULL_GYM_EQUIPMENT,
  GOLDEN_PERSONAS,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  THREE_PHASE_FOUNDATION,
  buildExerciseTransitionTraces,
  legacyPhaseFitComponent,
  acceptedPhaseAnnotationHasProductionProvenance,
  deriveAlignmentPriorities,
  runCandidateRankingLab,
  phaseResolutionCanAffectProductionScoring,
  resolveContextualPhaseAnnotation,
  type AssessmentState,
  type CandidateNeed,
  type CandidatePainExecutionReadiness,
  type CandidateRequest,
  type ContinuityContext,
  type ExerciseDefinition,
  type ExercisePhaseAnnotationScope,
  type ExercisePhaseSuitabilityAnnotation,
  type ExerciseSuitability,
  type PainAndInjuryState,
  type PhaseId,
  type RankedCandidate,
  type SessionSection,
  type TrainingGoal,
  type TrainingHistory,
  type TrainingRole,
  type ContextualPhaseEvidenceStatus,
  type ContextualPhaseResolutionTrace,
  type ContextualPhaseSpecificity,
} from "../../src";
import {
  EXPECTED_PRODUCTION_RANKING_FINGERPRINT,
  PHASE_CALIBRATION_FIXED_AS_OF,
  buildPhaseSuitabilityCalibrationData,
} from "./phaseSuitabilityCalibrationLab";

const PHASE_IDS: readonly PhaseId[] = ["phase_1", "phase_2", "phase_3"];
const PHASELESS_COMPONENTS = CANDIDATE_SCORE_COMPONENTS.filter(
  (candidate) => candidate.id !== "phase_fit",
);
const LEGACY_COMPONENTS = CANDIDATE_SCORE_COMPONENTS.map((candidate) =>
  candidate.id === "phase_fit" ? legacyPhaseFitComponent : candidate,
);
const LEGACY_OPTIONS = { scoreComponents: LEGACY_COMPONENTS } as const;

const EMPTY_ASSESSMENT: AssessmentState = {
  signals: [],
  historicalWeaknesses: [],
};

const EMPTY_CONTINUITY: ContinuityContext = {
  productiveExerciseIds: [],
  plateauedExerciseIds: [],
  failedProgressionExerciseIds: [],
  painResponseExerciseIds: [],
};

export type ContextualPhaseSuitability = ExerciseSuitability["suitability"];
export type ContextualPhaseAnnotationReviewStatus =
  ExercisePhaseSuitabilityAnnotation["reviewStatus"];
export type PhaseReasonOwnerClassification =
  | "GENERAL_PHASE_JUDGMENT"
  | "ROLE_SPECIFIC"
  | "SECTION_SPECIFIC"
  | "GOAL_SPECIFIC_WRONG_OWNER"
  | "MECHANICAL_FACT_ALREADY_SCORED"
  | "AMBIGUOUS"
  | "ARBITRARY_OR_UNDERSPECIFIED";
export type PhaseContextReviewClassification =
  | "PHASE_CONTEXT_OWNER_POLICY_SELECTED_CURATION_PENDING"
  | "PHASE_CONTEXT_CONTRACT_FIX_REQUIRED"
  | "PHASE_ARCHITECTURE_REOPEN_REQUIRED";

export {
  acceptedPhaseAnnotationHasProductionProvenance,
  phaseResolutionCanAffectProductionScoring,
  resolveContextualPhaseAnnotation,
};
export type {
  ContextualPhaseEvidenceStatus,
  ContextualPhaseResolutionTrace,
  ContextualPhaseSpecificity,
  ExercisePhaseAnnotationScope,
  ExercisePhaseSuitabilityAnnotation,
};

export const CONTEXTUAL_PHASE_OWNER_POLICIES = [
  "Phase is one bounded candidate preference downstream of hard eligibility.",
  "`CandidateRequest.goal` is authoritative and is never replaced by phase intent.",
  "Phase evidence is scoped by the actual requested `trainingRole` and/or `sessionSection`.",
  "General annotations are legal only when evidence covers every legal use.",
  "`UNKNOWN_NO_MATCH` is not poor and omits the contextual component and denominator weight.",
  "`CONFLICTING_ANNOTATIONS` is not poor and must not choose the favorable annotation.",
  "Reviewed `poor` remains a bounded contextual phase judgment.",
  "Reason prose is non-executable.",
  "The selected contextual scorer contains no Phase 1 low-skill/stability bonus; legacy production keeps it only until explicit activation.",
  "The selected contextual scorer contains no Phase 3 high-loadability bonus; legacy production keeps it only until explicit activation.",
  "Progression-axis matching remains same-exercise progression evidence, not `phase_fit`.",
  "Phase changes never create automatic replacement pressure; KEEP -> PROGRESS -> REPLACE WHEN JUSTIFIED remains authoritative.",
] as const;

export const PHASE_REVIEW_STATUS_PRODUCTION_BEHAVIOR = [
  {
    reviewStatus: "accepted",
    productionScoring: "eligible_only_with_complete_contextual_provenance",
    traceBehavior:
      "May affect production candidate ranking only when role/section scope matches and provenance is complete.",
  },
  {
    reviewStatus: "needs_review",
    productionScoring: "omit_component_and_weight",
    traceBehavior:
      "Visible in DecisionTrace and curation tooling; eligible only for non-production sensitivity labs.",
  },
  {
    reviewStatus: "unknown",
    productionScoring: "omit_component_and_weight",
    traceBehavior: "No production scoring influence.",
  },
  {
    reviewStatus: "no_contextual_match",
    productionScoring: "omit_effective_evidence_no_fallback",
    traceBehavior: "Do not emit a fallback score or poor category.",
  },
  {
    reviewStatus: "conflict",
    productionScoring: "omit_effective_evidence_require_review",
    traceBehavior:
      "Expose conflict and never choose the favorable annotation.",
  },
] as const;

export const PHASE_ACCEPTED_PROVENANCE_CONTRACT = {
  requiredFields: [
    "sourceType",
    "sourceRef",
    "evidenceBasis",
    "reviewerId",
    "reviewedAt",
  ],
  allowedSourceTypes: [
    "owner_decision",
    "human_exercise_science_review",
    "external_reference",
  ],
  externalEvidencePolicy:
    "External references may supplement owner/human exercise-science review, but this contract does not fabricate literature.",
} as const;

export const PHASE_CALIBRATION_LAB_DESIGN = {
  status: "OWNER_POLICY_SELECTED_NON_DEFAULT_SCORER_IMPLEMENTED",
  coefficientStatus: "EXCELLENT_8_8_GOOD_7_8_POSSIBLE_6_2_POOR_5_5_WEIGHT_1_0",
  productionBehavior: "UNCHANGED",
  comparisonAxes: [
    "current controlled scenarios",
    "golden personas",
    "role/section changes",
    "phase 1/2/3 continuity",
    "cases where the best candidate remains best across phases",
    "close legal reorders",
    "unknown not disadvantaged",
    "accepted poor versus unknown",
    "conflict cases",
    "excellent/good/possible/poor spacing",
    "bounded phase-family weight",
  ],
} as const;

export interface PhaseAnnotationOwnershipAuditRow {
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly phaseId: PhaseId;
  readonly currentSuitability: ContextualPhaseSuitability;
  readonly currentReason: string;
  readonly trainingRoles: readonly TrainingRole[];
  readonly sessionSections: readonly SessionSection[];
  readonly proposedScope: ExercisePhaseAnnotationScope;
  readonly evidenceOwnerClassification: PhaseReasonOwnerClassification;
  readonly reviewStatus: ContextualPhaseAnnotationReviewStatus;
  readonly provenanceStatus: "MISSING_STRUCTURED_PROVENANCE";
  readonly recommendedTreatment: string;
  readonly auditFinding: string;
  readonly proposedAnnotationId: string | null;
}

interface PhaseAuditDecision {
  readonly classification: PhaseReasonOwnerClassification;
  readonly scopeKey: ScopeKey;
  readonly reviewStatus: "needs_review" | "unknown";
  readonly recommendedTreatment: string;
  readonly auditFinding: string;
}

interface ExerciseAuditPlan {
  readonly exerciseId: string;
  readonly phases: Readonly<Record<PhaseId, PhaseAuditDecision>>;
}

type ScopeKey =
  | "general"
  | "preparation_warmup"
  | "recovery_cooldown"
  | "activation"
  | "accessory"
  | "strength_main"
  | "secondary_accessory"
  | "activation_or_preparation"
  | "activation_or_accessory";

const SCOPES: Readonly<Record<ScopeKey, ExercisePhaseAnnotationScope>> = {
  general: {},
  preparation_warmup: {
    trainingRoles: ["preparation"],
    sessionSections: ["warmup"],
  },
  recovery_cooldown: {
    trainingRoles: ["recovery"],
    sessionSections: ["cooldown"],
  },
  activation: {
    trainingRoles: ["activation"],
    sessionSections: ["activation"],
  },
  accessory: {
    trainingRoles: ["hypertrophy_accessory"],
    sessionSections: ["accessory"],
  },
  strength_main: {
    trainingRoles: ["primary_strength"],
    sessionSections: ["main"],
  },
  secondary_accessory: {
    trainingRoles: ["secondary_strength"],
    sessionSections: ["accessory"],
  },
  activation_or_preparation: {
    trainingRoles: ["activation", "preparation"],
    sessionSections: ["activation", "warmup"],
  },
  activation_or_accessory: {
    trainingRoles: ["activation", "hypertrophy_accessory"],
    sessionSections: ["activation", "accessory"],
  },
};

const KEEP_REVIEW_QUALIFIED =
  "Retain only at the proposed scope as review-qualified phase evidence; structured provenance is required before acceptance.";
const ROUTE_TO_DEDICATED_OWNER =
  "Do not migrate as phase evidence; route the fact to its existing goal, section, mechanics, progression, continuity, assessment, or weekly owner and emit unknown until independent phase evidence is reviewed.";
const REQUIRE_PHASE_REVIEW =
  "Do not migrate as executable phase evidence; require a contextual exercise-science review and structured provenance.";

function review(
  classification: PhaseReasonOwnerClassification,
  scopeKey: ScopeKey,
  auditFinding: string,
): PhaseAuditDecision {
  return {
    classification,
    scopeKey,
    reviewStatus: "needs_review",
    recommendedTreatment: KEEP_REVIEW_QUALIFIED,
    auditFinding,
  };
}

function unknown(
  classification: PhaseReasonOwnerClassification,
  scopeKey: ScopeKey,
  auditFinding: string,
  recommendedTreatment = ROUTE_TO_DEDICATED_OWNER,
): PhaseAuditDecision {
  return {
    classification,
    scopeKey,
    reviewStatus: "unknown",
    recommendedTreatment,
    auditFinding,
  };
}

export const PHASE_ANNOTATION_AUDIT_PLAN: readonly ExerciseAuditPlan[] = [
  {
    exerciseId: "ninety-ninety-breathing",
    phases: {
      phase_1: review("GENERAL_PHASE_JUDGMENT", "general", "Control and position are plausible Phase 1 developmental evidence across both legal uses."),
      phase_2: unknown("AMBIGUOUS", "general", "Assessment-priority relevance belongs to assessment context and does not establish a general Phase 2 judgment.", REQUIRE_PHASE_REVIEW),
      phase_3: review("SECTION_SPECIFIC", "preparation_warmup", "The reason explicitly describes targeted preparation and does not establish recovery/cooldown phase fit."),
    },
  },
  {
    exerciseId: "serratus-wall-slide",
    phases: {
      phase_1: review("GENERAL_PHASE_JUDGMENT", "general", "Control development plausibly applies across the exercise's activation and preparation uses."),
      phase_2: review("SECTION_SPECIFIC", "preparation_warmup", "The reason is specifically preparation before loading, not a universal activation judgment."),
      phase_3: review("GENERAL_PHASE_JUDGMENT", "general", "Ongoing shoulder-control priority can plausibly apply to either legal use, but remains unproven."),
    },
  },
  {
    exerciseId: "dead-bug",
    phases: {
      phase_1: review("GENERAL_PHASE_JUDGMENT", "general", "Direct control work is plausible early-phase evidence for both legal uses."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Tempo and range are progression axes already owned by progression_value."),
      phase_3: review("ROLE_SPECIFIC", "activation", "Targeted trunk control supports activation use but does not establish hypertrophy-accessory value."),
    },
  },
  {
    exerciseId: "push-up",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Support, regression, skill and stability already have dedicated owners."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Continuity and progression runway are already scored explicitly."),
      phase_3: unknown("MECHANICAL_FACT_ALREADY_SCORED", "accessory", "Loading and stimulus sufficiency belong to loadability, stimulus, prescription and weekly volume."),
    },
  },
  {
    exerciseId: "dumbbell-bench-press",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Light loading and support are dedicated loading and stability facts."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Progression path is already owned by progression_value."),
      phase_3: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Continuity, load and volume are separate candidate, prescription and weekly facts."),
    },
  },
  {
    exerciseId: "machine-chest-press",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Support and coordination demand are already structured and scored."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Load progression is already owned by progression and loadability."),
      phase_3: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Machine path fit is setup and candidate-fit evidence, not established Phase 3 evidence."),
    },
  },
  {
    exerciseId: "cable-chest-fly",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "accessory", "Shoulder control and caution already belong to assessment, pain, skill and stability."),
      phase_2: unknown("SECTION_SPECIFIC", "accessory", "Accessory volume is session/weekly allocation evidence rather than independent phase evidence."),
      phase_3: unknown("GOAL_SPECIFIC_WRONG_OWNER", "accessory", "Hypertrophy value belongs to CandidateRequest.goal and the Weekly Development Ledger."),
    },
  },
  {
    exerciseId: "chest-supported-dumbbell-row",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Support, setup and trunk demand already have explicit mechanics owners."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Load progression is already owned by progression_value."),
      phase_3: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Continuity is independently modeled and cannot become a second phase vote."),
    },
  },
  {
    exerciseId: "one-arm-dumbbell-row",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Support and conservative loading are dedicated mechanics/prescription facts."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Progression and equipment setting are already modeled elsewhere."),
      phase_3: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Loadability and setup fit are not independent Phase 3 evidence."),
    },
  },
  {
    exerciseId: "machine-row",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Guidance and coordination demand already affect dedicated components."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Clear load progression is already scored."),
      phase_3: unknown("ARBITRARY_OR_UNDERSPECIFIED", "general", "Machine-path fit does not explain why Phase 3 should be lower than Phase 2.", REQUIRE_PHASE_REVIEW),
    },
  },
  {
    exerciseId: "seated-cable-row",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Path and setup are mechanics/equipment facts."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Progression friendliness is already scored."),
      phase_3: unknown("ARBITRARY_OR_UNDERSPECIFIED", "general", "Cable practicality does not establish a Phase 2-versus-Phase 3 distinction.", REQUIRE_PHASE_REVIEW),
    },
  },
  {
    exerciseId: "band-row",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Anchor availability and accessibility belong to equipment/setup truth."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "accessory", "Modest load need belongs to loadability, prescription and weekly allocation."),
      phase_3: unknown("MECHANICAL_FACT_ALREADY_SCORED", "accessory", "Limited loading potential must not reduce an activation use through global phase evidence."),
    },
  },
  {
    exerciseId: "dumbbell-shoulder-press",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Range and support are already candidate mechanics and prerequisites."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Overhead control is a prerequisite/assessment fact."),
      phase_3: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Loadability and stimulus are dedicated score components."),
    },
  },
  {
    exerciseId: "lat-pulldown",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Stable path and skill acquisition repeat mechanics and experience fit."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Progression route already has a receiver."),
      phase_3: unknown("GOAL_SPECIFIC_WRONG_OWNER", "general", "Back stimulus depends on the enduring goal and requested use, not Phase 3 alone."),
    },
  },
  {
    exerciseId: "band-lat-pulldown",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Anchor access is equipment/setup truth."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "accessory", "Loadability already has a dedicated component."),
      phase_3: unknown("SECTION_SPECIFIC", "accessory", "Accessory/travel use is section and equipment context, not general phase evidence."),
    },
  },
  {
    exerciseId: "goblet-squat",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Teaching value and manageable load repeat skill and loadability facts."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Progression and load ceiling already have dedicated owners."),
      phase_3: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Load limitation and experience are independently modeled."),
    },
  },
  {
    exerciseId: "leg-press",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Range/load conservatism belongs to prescription and pain context."),
      phase_2: unknown("AMBIGUOUS", "general", "Capacity-builder language does not identify independent candidate-level phase evidence.", REQUIRE_PHASE_REVIEW),
      phase_3: unknown("GOAL_SPECIFIC_WRONG_OWNER", "general", "High stimulus is goal/stimulus/weekly evidence, not Phase 3 by itself."),
    },
  },
  {
    exerciseId: "bodyweight-box-squat",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Range and support are dedicated mechanics."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "secondary_accessory", "Low stimulus belongs to stimulus and requested-role context."),
      phase_3: review("SECTION_SPECIFIC", "activation_or_preparation", "Preparation/deload language applies only to warm-up or activation use, not secondary-strength accessory use."),
    },
  },
  {
    exerciseId: "dumbbell-romanian-deadlift",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Hinge control is already a hard prerequisite and skill fact."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Progression path is already scored."),
      phase_3: unknown("GOAL_SPECIFIC_WRONG_OWNER", "general", "Posterior-chain stimulus belongs to goal, target and stimulus components."),
    },
  },
  {
    exerciseId: "cable-pull-through",
    phases: {
      phase_1: review("ROLE_SPECIFIC", "activation", "Hinge teaching is plausible activation-specific Phase 1 evidence."),
      phase_2: review("ROLE_SPECIFIC", "secondary_accessory", "Accessory/regression use is contextual and must not be treated as a general exercise judgment."),
      phase_3: unknown("ARBITRARY_OR_UNDERSPECIFIED", "general", "The reason discusses primary work although primary_strength is not a legal role for this exercise.", REQUIRE_PHASE_REVIEW),
    },
  },
  {
    exerciseId: "split-squat",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Support need is a stability/setup fact."),
      phase_2: review("GENERAL_PHASE_JUDGMENT", "general", "Developing single-leg strength is a plausible Phase 2 judgment across both legal uses."),
      phase_3: unknown("GOAL_SPECIFIC_WRONG_OWNER", "accessory", "Accessory stimulus belongs to goal, section, stimulus and weekly allocation."),
    },
  },
  {
    exerciseId: "step-up",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Height and support scaling are mechanics/prescription facts."),
      phase_2: unknown("GOAL_SPECIFIC_WRONG_OWNER", "accessory", "Unilateral volume is a weekly allocation fact."),
      phase_3: unknown("MECHANICAL_FACT_ALREADY_SCORED", "accessory", "Accessory loadability repeats role, section and loadability evidence."),
    },
  },
  {
    exerciseId: "lying-leg-curl",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "accessory", "Machine setup fit belongs to equipment/setup context."),
      phase_2: unknown("GOAL_SPECIFIC_WRONG_OWNER", "accessory", "Posterior-chain volume belongs to target and weekly allocation."),
      phase_3: unknown("GOAL_SPECIFIC_WRONG_OWNER", "accessory", "Hypertrophy value belongs to the enduring goal and Weekly Development Ledger."),
    },
  },
  {
    exerciseId: "glute-bridge",
    phases: {
      phase_1: review("ROLE_SPECIFIC", "activation", "Glute/pelvic control is plausible Phase 1 activation evidence, not a universal accessory judgment."),
      phase_2: unknown("MECHANICAL_FACT_ALREADY_SCORED", "general", "Load/band progression is already owned by progression and loadability."),
      phase_3: unknown("MECHANICAL_FACT_ALREADY_SCORED", "accessory", "Loading path belongs to loadability and prescription, not activation phase fit."),
    },
  },
  {
    exerciseId: "dumbbell-lateral-raise",
    phases: {
      phase_1: unknown("MECHANICAL_FACT_ALREADY_SCORED", "accessory", "Load and owned range belong to prescription and candidate mechanics."),
      phase_2: unknown("GOAL_SPECIFIC_WRONG_OWNER", "accessory", "Delt volume belongs to the enduring goal and weekly allocation."),
      phase_3: unknown("GOAL_SPECIFIC_WRONG_OWNER", "accessory", "Hypertrophy value is not independent Phase 3 evidence."),
    },
  },
  {
    exerciseId: "reverse-pec-deck",
    phases: {
      phase_1: review("ROLE_SPECIFIC", "activation", "Stable scapular work is plausibly activation-specific, while setup stability itself remains separately scored."),
      phase_2: unknown("SECTION_SPECIFIC", "accessory", "Upper-back accessory value belongs to requested section and weekly allocation."),
      phase_3: unknown("GOAL_SPECIFIC_WRONG_OWNER", "accessory", "Rear-delt accessory value must not influence an activation request through a global annotation."),
    },
  },
  {
    exerciseId: "band-face-pull",
    phases: {
      phase_1: review("ROLE_SPECIFIC", "activation", "Control and preparation are plausible activation-specific Phase 1 evidence."),
      phase_2: unknown("GOAL_SPECIFIC_WRONG_OWNER", "accessory", "Placement between pressing volume belongs to session/weekly composition."),
      phase_3: unknown("MECHANICAL_FACT_ALREADY_SCORED", "accessory", "Accessory loadability must not lower activation suitability."),
    },
  },
  {
    exerciseId: "dumbbell-curl",
    phases: {
      phase_1: unknown("SECTION_SPECIFIC", "accessory", "Optional accessory status belongs to session and weekly allocation."),
      phase_2: unknown("GOAL_SPECIFIC_WRONG_OWNER", "accessory", "Arm volume belongs to the enduring goal and Weekly Development Ledger."),
      phase_3: unknown("GOAL_SPECIFIC_WRONG_OWNER", "accessory", "Hypertrophy accessory value is not independent Phase 3 evidence."),
    },
  },
  {
    exerciseId: "cable-triceps-pressdown",
    phases: {
      phase_1: unknown("SECTION_SPECIFIC", "accessory", "Optional accessory status belongs to session and weekly allocation."),
      phase_2: unknown("GOAL_SPECIFIC_WRONG_OWNER", "accessory", "Pressing-support volume belongs to target and weekly allocation."),
      phase_3: unknown("GOAL_SPECIFIC_WRONG_OWNER", "accessory", "Arm accessory value is not independent Phase 3 evidence."),
    },
  },
  {
    exerciseId: "pallof-press",
    phases: {
      phase_1: review("ROLE_SPECIFIC", "activation", "Control work is plausible Phase 1 activation evidence."),
      phase_2: unknown("AMBIGUOUS", "activation_or_accessory", "Accessory and preparation are different uses and the current reason does not establish either phase judgment.", REQUIRE_PHASE_REVIEW),
      phase_3: review("GENERAL_PHASE_JUDGMENT", "general", "Continued targeted trunk work can plausibly apply across both legal uses, but requires review."),
    },
  },
] as const;

function currentExercise(exerciseId: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((exercise) => exercise.id === exerciseId);
  if (!found) {
    throw new Error(`Missing reference exercise ${exerciseId}.`);
  }
  return found;
}

function currentPhaseSuitability(
  exercise: ExerciseDefinition,
  phaseId: PhaseId,
): ExerciseSuitability {
  const found = exercise.phaseSuitability[phaseId];
  if (!found) {
    throw new Error(`Missing ${phaseId} annotation for ${exercise.id}.`);
  }
  return found;
}

export function buildPhaseAnnotationOwnershipAudit(): readonly PhaseAnnotationOwnershipAuditRow[] {
  return PHASE_ANNOTATION_AUDIT_PLAN.flatMap((plan) => {
    const exercise = currentExercise(plan.exerciseId);
    return PHASE_IDS.map((phaseId): PhaseAnnotationOwnershipAuditRow => {
      const current = currentPhaseSuitability(exercise, phaseId);
      const decision = plan.phases[phaseId];
      const proposedAnnotationId =
        decision.reviewStatus === "needs_review"
          ? `phase-context:${exercise.id}:${phaseId}:${decision.scopeKey}`
          : null;
      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        phaseId,
        currentSuitability: current.suitability,
        currentReason: current.reason,
        trainingRoles: exercise.trainingRoles,
        sessionSections: Object.keys(exercise.sectionSuitability).sort() as SessionSection[],
        proposedScope: SCOPES[decision.scopeKey],
        evidenceOwnerClassification: decision.classification,
        reviewStatus: decision.reviewStatus,
        provenanceStatus: "MISSING_STRUCTURED_PROVENANCE",
        recommendedTreatment: decision.recommendedTreatment,
        auditFinding: decision.auditFinding,
        proposedAnnotationId,
      };
    });
  });
}

export function buildProposedContextualAnnotations(
  auditRows = buildPhaseAnnotationOwnershipAudit(),
): readonly ExercisePhaseSuitabilityAnnotation[] {
  return auditRows
    .filter(
      (row): row is PhaseAnnotationOwnershipAuditRow & { readonly proposedAnnotationId: string } =>
        row.proposedAnnotationId !== null,
    )
    .map((row) => ({
      annotationId: row.proposedAnnotationId,
      exerciseId: row.exerciseId,
      phaseId: row.phaseId,
      suitability: row.currentSuitability,
      scope: row.proposedScope,
      reason: row.currentReason,
      reviewStatus: "needs_review",
      provenance: {
        sourceType: "legacy_reference_catalog_migration",
        sourceRef: `REFERENCE_EXERCISES:${row.exerciseId}:phaseSuitability.${row.phaseId}`,
        evidenceBasis: [
          "Current global category and reason retained for contextual human review only.",
          "No structured phase-specific source, reviewer, or review date exists in the current schema.",
        ],
      },
    }));
}

export type ContextPolicyFamily =
  | "CURRENT_GLOBAL"
  | "GLOBAL_ANNOTATION_ONLY"
  | "CONTEXT_SCOPED"
  | "CONTEXT_SCOPED_MODERATE_GAP"
  | "CONTEXT_SCOPED_WEIGHT"
  | "CONTEXT_REVIEW_SENSITIVITY";
export type ReviewQualifiedTreatment = "full" | "attenuated" | "observability_only";

export interface ContextualPhasePolicyDefinition {
  readonly id: string;
  readonly family: ContextPolicyFamily;
  readonly description: string;
  readonly categoryMap: Readonly<
    Record<ContextualPhaseSuitability, number>
  >;
  readonly phaseWeight: number;
  readonly includeMechanicalBonuses: boolean;
  readonly useContextResolver: boolean;
  readonly reviewQualifiedTreatment: ReviewQualifiedTreatment;
}

const CURRENT_CATEGORY_MAP: Readonly<Record<ContextualPhaseSuitability, number>> = {
  excellent: 8.8,
  good: 7.8,
  possible: 6.2,
  poor: 5.5,
};

const MODERATE_CATEGORY_MAP: Readonly<Record<ContextualPhaseSuitability, number>> = {
  excellent: 8.4,
  good: 7.7,
  possible: 6.8,
  poor: 5.5,
};

export const CONTEXTUAL_PHASE_POLICIES: readonly ContextualPhasePolicyDefinition[] = [
  {
    id: "A_CURRENT_GLOBAL",
    family: "CURRENT_GLOBAL",
    description: "Current global annotation, current Phase 1/3 mechanical bonuses, current gaps and weight 1.0.",
    categoryMap: CURRENT_CATEGORY_MAP,
    phaseWeight: 1,
    includeMechanicalBonuses: true,
    useContextResolver: false,
    reviewQualifiedTreatment: "full",
  },
  {
    id: "B_GLOBAL_ANNOTATION_ONLY",
    family: "GLOBAL_ANNOTATION_ONLY",
    description: "Current global annotation only, no mechanical bonuses, current gaps and weight 1.0.",
    categoryMap: CURRENT_CATEGORY_MAP,
    phaseWeight: 1,
    includeMechanicalBonuses: false,
    useContextResolver: false,
    reviewQualifiedTreatment: "full",
  },
  {
    id: "C_CONTEXT_SCOPED_ANNOTATION_ONLY",
    family: "CONTEXT_SCOPED",
    description: "Proposed role/section resolver, no mechanical bonuses, current gaps and weight 1.0; review-qualified evidence receives full laboratory influence.",
    categoryMap: CURRENT_CATEGORY_MAP,
    phaseWeight: 1,
    includeMechanicalBonuses: false,
    useContextResolver: true,
    reviewQualifiedTreatment: "full",
  },
  {
    id: "D_CONTEXT_SCOPED_MODERATE_GAP",
    family: "CONTEXT_SCOPED_MODERATE_GAP",
    description: "Proposed resolver, no mechanical bonuses, prior laboratory moderate gap and weight 1.0.",
    categoryMap: MODERATE_CATEGORY_MAP,
    phaseWeight: 1,
    includeMechanicalBonuses: false,
    useContextResolver: true,
    reviewQualifiedTreatment: "full",
  },
  {
    id: "E_CONTEXT_SCOPED_WEIGHT_075",
    family: "CONTEXT_SCOPED_WEIGHT",
    description: "Proposed resolver, no mechanical bonuses, current gaps and phase weight 0.75.",
    categoryMap: CURRENT_CATEGORY_MAP,
    phaseWeight: 0.75,
    includeMechanicalBonuses: false,
    useContextResolver: true,
    reviewQualifiedTreatment: "full",
  },
  {
    id: "F_REVIEW_QUALIFIED_FULL",
    family: "CONTEXT_REVIEW_SENSITIVITY",
    description: "Accepted and needs-review annotations receive full laboratory influence; unknown/conflict receive no phase evidence.",
    categoryMap: CURRENT_CATEGORY_MAP,
    phaseWeight: 1,
    includeMechanicalBonuses: false,
    useContextResolver: true,
    reviewQualifiedTreatment: "full",
  },
  {
    id: "F_REVIEW_QUALIFIED_ATTENUATED",
    family: "CONTEXT_REVIEW_SENSITIVITY",
    description: "Accepted annotations receive full influence; needs-review effective weight is halved; unknown/conflict receive no phase evidence.",
    categoryMap: CURRENT_CATEGORY_MAP,
    phaseWeight: 1,
    includeMechanicalBonuses: false,
    useContextResolver: true,
    reviewQualifiedTreatment: "attenuated",
  },
  {
    id: "F_REVIEW_QUALIFIED_OBSERVABILITY_ONLY",
    family: "CONTEXT_REVIEW_SENSITIVITY",
    description: "Accepted annotations receive full influence; needs-review and unknown/conflict are observability-only with no phase evidence.",
    categoryMap: CURRENT_CATEGORY_MAP,
    phaseWeight: 1,
    includeMechanicalBonuses: false,
    useContextResolver: true,
    reviewQualifiedTreatment: "observability_only",
  },
];

function phase(phaseId: PhaseId) {
  const found = THREE_PHASE_FOUNDATION.find((candidate) => candidate.id === phaseId);
  if (!found) {
    throw new Error(`Missing phase ${phaseId}.`);
  }
  return found;
}

function persona(personaId: string) {
  const found = GOLDEN_PERSONAS.find((candidate) => candidate.fixtureId === personaId);
  if (!found) {
    throw new Error(`Missing persona ${personaId}.`);
  }
  return found;
}

function history(overrides: Partial<TrainingHistory> = {}): TrainingHistory {
  return {
    ...EMPTY_TRAINING_HISTORY,
    ...overrides,
    exerciseHistory: {
      ...EMPTY_TRAINING_HISTORY.exerciseHistory,
      ...overrides.exerciseHistory,
    },
    sessionHistory: {
      ...EMPTY_TRAINING_HISTORY.sessionHistory,
      ...overrides.sessionHistory,
    },
    programHistory: {
      ...EMPTY_TRAINING_HISTORY.programHistory,
      ...overrides.programHistory,
    },
    progressionState: {
      ...EMPTY_TRAINING_HISTORY.progressionState,
      ...overrides.progressionState,
    },
    fatigueState: {
      ...EMPTY_TRAINING_HISTORY.fatigueState,
      ...overrides.fatigueState,
      byMovementRole: {
        ...EMPTY_TRAINING_HISTORY.fatigueState.byMovementRole,
        ...overrides.fatigueState?.byMovementRole,
      },
    },
  };
}

function makeRequest(input: {
  readonly id: string;
  readonly phaseId: PhaseId;
  readonly goal: TrainingGoal;
  readonly need: CandidateNeed;
  readonly assessment?: AssessmentState;
  readonly painAndInjury?: PainAndInjuryState;
  readonly trainingHistory?: TrainingHistory;
  readonly continuity?: ContinuityContext;
  readonly candidatePool?: readonly ExerciseDefinition[];
}): CandidateRequest {
  const base = persona("intermediate-gym-muscle-gain");
  const assessment = input.assessment ?? EMPTY_ASSESSMENT;
  return {
    id: input.id,
    evaluationContext: { asOf: PHASE_CALIBRATION_FIXED_AS_OF },
    athlete: {
      ...base.athlete,
      id: "phase-context-intermediate",
      primaryGoal: input.goal,
    },
    goal: input.goal,
    phase: phase(input.phaseId),
    need: {
      ...input.need,
      goal: input.goal,
    },
    assessment,
    alignmentPriorities: deriveAlignmentPriorities(assessment).priorities,
    painAndInjury: input.painAndInjury ?? NO_PAIN_OR_INJURY,
    equipment: FULL_GYM_EQUIPMENT,
    history: input.trainingHistory ?? history(),
    continuity: input.continuity ?? EMPTY_CONTINUITY,
    candidatePool: input.candidatePool ?? REFERENCE_EXERCISES,
    satisfiedPrerequisiteIds: [
      "push-up-plank-control",
      "hinge-control",
      "overhead-control",
    ],
    fatigueSignals: ["fresh"],
  };
}

interface ControlledNeedDefinition {
  readonly id: string;
  readonly label: string;
  readonly goal: TrainingGoal;
  readonly need: CandidateNeed;
  readonly candidatePoolIds?: readonly string[];
}

const CONTROLLED_NEEDS: readonly ControlledNeedDefinition[] = [
  {
    id: "horizontal-push-main",
    label: "horizontal push main",
    goal: "strength",
    need: {
      id: "phase-context-horizontal-push-main",
      whyNeeded: "Controlled contextual horizontal-push main comparison.",
      requestedRole: "primary_strength",
      requestedSection: "main",
      targetMovementRoles: ["horizontal_push"],
      targetMuscles: ["chest", "triceps"],
      targetBodyRegions: ["shoulder", "elbow"],
      goal: "strength",
    },
  },
  {
    id: "horizontal-pull-main",
    label: "horizontal pull main",
    goal: "strength",
    need: {
      id: "phase-context-horizontal-pull-main",
      whyNeeded: "Controlled contextual horizontal-pull main comparison.",
      requestedRole: "primary_strength",
      requestedSection: "main",
      targetMovementRoles: ["horizontal_pull"],
      targetMuscles: ["mid_back", "lats"],
      targetBodyRegions: ["shoulder", "thoracic_spine"],
      goal: "strength",
    },
  },
  {
    id: "squat-main",
    label: "squat main",
    goal: "strength",
    need: {
      id: "phase-context-squat-main",
      whyNeeded: "Controlled contextual squat main comparison.",
      requestedRole: "primary_strength",
      requestedSection: "main",
      targetMovementRoles: ["squat"],
      targetMuscles: ["quads", "glutes"],
      targetBodyRegions: ["knee", "hip", "ankle"],
      goal: "strength",
    },
  },
  {
    id: "hinge-secondary",
    label: "hinge secondary",
    goal: "strength",
    need: {
      id: "phase-context-hinge-secondary",
      whyNeeded: "Controlled contextual hinge secondary comparison.",
      requestedRole: "secondary_strength",
      requestedSection: "accessory",
      targetMovementRoles: ["hinge"],
      targetMuscles: ["hamstrings", "glutes"],
      targetBodyRegions: ["hip", "lumbar_spine"],
      goal: "strength",
    },
  },
  {
    id: "single-leg-accessory",
    label: "single-leg accessory",
    goal: "hypertrophy",
    need: {
      id: "phase-context-single-leg-accessory",
      whyNeeded: "Controlled contextual single-leg accessory comparison.",
      requestedRole: "hypertrophy_accessory",
      requestedSection: "accessory",
      targetMovementRoles: ["single_leg", "squat"],
      targetMuscles: ["quads", "glutes"],
      targetBodyRegions: ["knee", "hip", "ankle"],
      goal: "hypertrophy",
    },
  },
  {
    id: "trunk-activation",
    label: "trunk activation",
    goal: "posture_and_movement_quality",
    need: {
      id: "phase-context-trunk-activation",
      whyNeeded: "Controlled contextual trunk activation comparison.",
      requestedRole: "activation",
      requestedSection: "activation",
      targetMovementRoles: ["anti_extension_core", "anti_rotation_core"],
      targetMuscles: ["trunk"],
      targetBodyRegions: ["lumbar_spine", "pelvis"],
      goal: "posture_and_movement_quality",
    },
  },
  {
    id: "scapular-activation",
    label: "scapular activation",
    goal: "posture_and_movement_quality",
    need: {
      id: "phase-context-scapular-activation",
      whyNeeded: "Controlled contextual scapular activation comparison.",
      requestedRole: "activation",
      requestedSection: "activation",
      targetMovementRoles: ["scapular_control", "horizontal_pull"],
      targetMuscles: ["serratus", "rear_delts", "upper_back", "rotator_cuff"],
      targetBodyRegions: ["shoulder", "thoracic_spine"],
      goal: "posture_and_movement_quality",
    },
  },
  {
    id: "rear-delt-accessory",
    label: "rear-delt accessory",
    goal: "hypertrophy",
    need: {
      id: "phase-context-rear-delt-accessory",
      whyNeeded: "Controlled contextual rear-delt accessory comparison.",
      requestedRole: "hypertrophy_accessory",
      requestedSection: "accessory",
      targetMovementRoles: ["horizontal_pull", "scapular_control"],
      targetMuscles: ["rear_delts", "upper_back"],
      targetBodyRegions: ["shoulder", "thoracic_spine"],
      goal: "hypertrophy",
    },
  },
  {
    id: "arm-accessory",
    label: "representative arm accessory",
    goal: "hypertrophy",
    need: {
      id: "phase-context-arm-accessory",
      whyNeeded: "Controlled contextual arm-accessory comparison.",
      requestedRole: "hypertrophy_accessory",
      requestedSection: "accessory",
      targetMovementRoles: ["horizontal_pull", "horizontal_push"],
      targetMuscles: ["biceps", "triceps"],
      targetBodyRegions: ["elbow", "shoulder", "wrist"],
      goal: "hypertrophy",
    },
    candidatePoolIds: ["dumbbell-curl", "cable-triceps-pressdown"],
  },
];

function pool(ids: readonly string[]): readonly ExerciseDefinition[] {
  return ids.map(currentExercise);
}

function needById(id: string): ControlledNeedDefinition {
  const found = CONTROLLED_NEEDS.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing controlled need ${id}.`);
  }
  return found;
}

function relevantRowAssessment(): AssessmentState {
  return {
    signals: [
      {
        id: "phase-context-loaded-scapular-stability",
        type: "control_finding",
        source: "movement_screen",
        confidence: "high",
        priority: "primary",
        severity: "mild",
        region: "shoulder",
        movementRole: "scapular_control",
        muscleGroup: "upper_back",
        assessmentFeatures: ["loaded_scapular_stability"],
        description: "Controlled relevant assessment for contextual phase review.",
      },
    ],
    historicalWeaknesses: [],
  };
}

function rowPain(input: {
  readonly kind: "current" | "moderate";
  readonly requiredResponse?: "avoid_aggravator" | "reduce_load_and_range" | "substitute_role";
}): PainAndInjuryState {
  if (input.kind === "current") {
    return {
      ...NO_PAIN_OR_INJURY,
      currentDiscomforts: [
        {
          kind: "current_discomfort",
          id: "phase-context-current-low-back",
          region: "lumbar_spine",
          severity0To10: 2,
          stressTags: ["loaded_hinge", "loaded_spinal_flexion"],
          effect: "prefer_support",
          description: "Controlled current low-back discomfort.",
        },
      ],
    };
  }
  return {
    ...NO_PAIN_OR_INJURY,
    moderatePain: [
      {
        kind: "moderate_pain",
        id: `phase-context-moderate-${input.requiredResponse ?? "avoid_aggravator"}`,
        region: "lumbar_spine",
        severity0To10: 4,
        stressTags: ["loaded_hinge", "loaded_spinal_flexion"],
        requiredResponse: input.requiredResponse ?? "avoid_aggravator",
        description: "Controlled moderate low-back pain requirement.",
      },
    ],
  };
}

const ROW_POOL = pool([
  "machine-row",
  "seated-cable-row",
  "chest-supported-dumbbell-row",
  "one-arm-dumbbell-row",
]);

export interface ContextControlledScenario {
  readonly id: string;
  readonly label: string;
  readonly kind: "phase_matrix" | "productive_continuity" | "assessment" | "pain";
  readonly request: CandidateRequest;
}

function buildControlledScenarios(): readonly ContextControlledScenario[] {
  const phaseMatrix = CONTROLLED_NEEDS.flatMap((definition) =>
    PHASE_IDS.map((phaseId): ContextControlledScenario => ({
      id: `${definition.id}-${phaseId}`,
      label: `${definition.label} / ${phaseId}`,
      kind: "phase_matrix",
      request: makeRequest({
        id: `phase-context-${definition.id}-${phaseId}`,
        phaseId,
        goal: definition.goal,
        need: definition.need,
        candidatePool: definition.candidatePoolIds
          ? pool(definition.candidatePoolIds)
          : undefined,
      }),
    })),
  );
  const horizontalPull = needById("horizontal-pull-main");
  const productiveContinuity = PHASE_IDS.map((phaseId): ContextControlledScenario => ({
    id: `productive-continuity-${phaseId}`,
    label: `productive continuity / ${phaseId}`,
    kind: "productive_continuity",
    request: makeRequest({
      id: `phase-context-productive-continuity-${phaseId}`,
      phaseId,
      goal: "strength",
      need: horizontalPull.need,
      candidatePool: ROW_POOL,
      continuity: {
        ...EMPTY_CONTINUITY,
        currentExerciseId: "chest-supported-dumbbell-row",
        productiveExerciseIds: ["chest-supported-dumbbell-row"],
      },
      trainingHistory: history({
        exerciseHistory: {
          events: [],
          stableExerciseIds: ["chest-supported-dumbbell-row"],
          blockedExerciseIds: [],
        },
        progressionState: {
          readyToProgressExerciseIds: ["chest-supported-dumbbell-row"],
          holdExerciseIds: [],
          stalledExerciseIds: [],
          successfulMovementRoles: ["horizontal_pull"],
        },
      }),
    }),
  }));
  const assessment: ContextControlledScenario = {
    id: "relevant-assessment-phase-3",
    label: "relevant assessment / phase_3",
    kind: "assessment",
    request: makeRequest({
      id: "phase-context-relevant-assessment-phase-3",
      phaseId: "phase_3",
      goal: "strength",
      need: horizontalPull.need,
      assessment: relevantRowAssessment(),
      candidatePool: ROW_POOL,
    }),
  };
  const painScenarios: readonly ContextControlledScenario[] = [
    {
      id: "pain-current-discomfort",
      label: "current discomfort / phase_2",
      kind: "pain",
      request: makeRequest({
        id: "phase-context-current-discomfort",
        phaseId: "phase_2",
        goal: "strength",
        need: horizontalPull.need,
        painAndInjury: rowPain({ kind: "current" }),
        candidatePool: ROW_POOL,
      }),
    },
    {
      id: "pain-candidate-review",
      label: "candidate review / phase_2",
      kind: "pain",
      request: makeRequest({
        id: "phase-context-candidate-review",
        phaseId: "phase_2",
        goal: "strength",
        need: horizontalPull.need,
        painAndInjury: rowPain({ kind: "moderate", requiredResponse: "avoid_aggravator" }),
        candidatePool: ROW_POOL,
      }),
    },
    {
      id: "pain-prescription-required",
      label: "prescription required / phase_2",
      kind: "pain",
      request: makeRequest({
        id: "phase-context-prescription-required",
        phaseId: "phase_2",
        goal: "strength",
        need: horizontalPull.need,
        painAndInjury: rowPain({
          kind: "moderate",
          requiredResponse: "reduce_load_and_range",
        }),
        candidatePool: ROW_POOL,
      }),
    },
    {
      id: "pain-role-substitution",
      label: "role substitution / phase_2",
      kind: "pain",
      request: makeRequest({
        id: "phase-context-role-substitution",
        phaseId: "phase_2",
        goal: "strength",
        need: horizontalPull.need,
        painAndInjury: rowPain({ kind: "moderate", requiredResponse: "substitute_role" }),
        candidatePool: ROW_POOL,
      }),
    },
  ];

  return [...phaseMatrix, ...productiveContinuity, assessment, ...painScenarios];
}

type PolicyEvidenceStatus =
  | ContextualPhaseEvidenceStatus
  | "LEGACY_GLOBAL_UNQUALIFIED";
type PolicyReviewStatus = ContextualPhaseAnnotationReviewStatus | "unmodeled" | null;

export interface ContextPolicyCandidateRow {
  readonly policyId: string;
  readonly scenarioId: string;
  readonly scenarioLabel: string;
  readonly scenarioKind: ContextControlledScenario["kind"];
  readonly phaseId: PhaseId;
  readonly goal: TrainingGoal;
  readonly requestedRole: TrainingRole;
  readonly requestedSection: SessionSection | null;
  readonly exerciseId: string;
  readonly rank: number;
  readonly currentRank: number;
  readonly total: number;
  readonly currentTotal: number;
  readonly nonPhaseTotal: number;
  readonly resolvedAnnotationId: string | null;
  readonly annotationSuitability: ContextualPhaseSuitability | null;
  readonly annotationScope: string;
  readonly annotationSpecificity: ContextualPhaseSpecificity | "legacy_global";
  readonly annotationReviewStatus: PolicyReviewStatus;
  readonly evidenceStatus: PolicyEvidenceStatus;
  readonly phaseRawValue: number | null;
  readonly effectivePhaseWeight: number;
  readonly phaseContribution: number;
  readonly painReadiness: CandidatePainExecutionReadiness;
  readonly unresolvedConflictIds: readonly string[];
}

export interface ContextPolicyScenarioRow {
  readonly policyId: string;
  readonly scenarioId: string;
  readonly scenarioLabel: string;
  readonly scenarioKind: ContextControlledScenario["kind"];
  readonly phaseId: PhaseId;
  readonly winner: string | null;
  readonly runnerUp: string | null;
  readonly currentWinner: string | null;
  readonly winnerChanged: boolean;
  readonly rankChanges: number;
  readonly tiesCreated: number;
  readonly tiesBroken: number;
  readonly whyOrderChanged: string;
}

export interface ContextPolicySummaryRow {
  readonly policyId: string;
  readonly scenarioCount: number;
  readonly rankChanges: number;
  readonly winnerChanges: number;
  readonly tiesCreated: number;
  readonly tiesBroken: number;
  readonly unknownCandidateRows: number;
  readonly reviewQualifiedCandidateRows: number;
  readonly conflictCandidateRows: number;
}

export interface ContextWinnerChangeRow {
  readonly policyId: string;
  readonly scenarioId: string;
  readonly scenarioLabel: string;
  readonly phaseId: PhaseId;
  readonly currentWinner: string;
  readonly experimentalWinner: string;
  readonly currentWinnerPhaseEvidence: string;
  readonly experimentalWinnerPhaseEvidence: string;
  readonly whyChanged: string;
}

export interface ScapularActivationFocusRow {
  readonly exerciseId: string;
  readonly currentSuitability: ContextualPhaseSuitability;
  readonly currentReason: string;
  readonly currentRank: number | null;
  readonly currentPhaseRaw: number | null;
  readonly contextualRank: number | null;
  readonly contextualEvidenceStatus: ContextualPhaseEvidenceStatus;
  readonly selectedAnnotationId: string | null;
  readonly proposedScope: string;
  readonly ownerClassification: PhaseReasonOwnerClassification;
  readonly finding: string;
}

export interface ContextCounterfactualProof {
  readonly accessoryScopeDoesNotAffectActivation: boolean;
  readonly activationScopeDoesNotAffectAccessory: boolean;
  readonly roleAndSectionOutranksGeneral: boolean;
  readonly noMatchIsUnknown: boolean;
  readonly reviewedPoorDistinctFromUnknown: boolean;
  readonly reasonProseDoesNotChangeScoring: boolean;
  readonly provenanceDoesNotChangeScoringOrLegality: boolean;
  readonly equalSpecificityConflictIsExplicitAndDeterministic: boolean;
  readonly scopeCannotLegalizeWrongRoleOrSection: boolean;
  readonly scopeCannotAlterPainReadiness: boolean;
  readonly scopeCannotActivateTransition: boolean;
}

export interface PhaseAnnotationContextReviewData {
  readonly classification: PhaseContextReviewClassification;
  readonly fixedAsOf: string;
  readonly productionRankingFingerprint: string;
  readonly expectedProductionRankingFingerprint: string;
  readonly productionFingerprintMatches: boolean;
  readonly ownershipAudit: readonly PhaseAnnotationOwnershipAuditRow[];
  readonly proposedAnnotations: readonly ExercisePhaseSuitabilityAnnotation[];
  readonly controlledScenarios: readonly ContextControlledScenario[];
  readonly policies: readonly ContextualPhasePolicyDefinition[];
  readonly candidateRows: readonly ContextPolicyCandidateRow[];
  readonly scenarioRows: readonly ContextPolicyScenarioRow[];
  readonly policySummaries: readonly ContextPolicySummaryRow[];
  readonly winnerChanges: readonly ContextWinnerChangeRow[];
  readonly scapularActivationFocus: readonly ScapularActivationFocusRow[];
  readonly multiRoleAudit: readonly PhaseAnnotationOwnershipAuditRow[];
  readonly armAccessoryAudit: readonly PhaseAnnotationOwnershipAuditRow[];
  readonly rowAudit: readonly PhaseAnnotationOwnershipAuditRow[];
  readonly counterfactualProof: ContextCounterfactualProof;
  readonly acceptedAnnotationCount: number;
  readonly needsReviewAnnotationCount: number;
  readonly unknownAnnotationCount: number;
  readonly contextualFingerprint: string;
  readonly primaryGoalRecommendation: string;
  readonly ownerPolicies: typeof CONTEXTUAL_PHASE_OWNER_POLICIES;
  readonly reviewStatusProductionBehavior: typeof PHASE_REVIEW_STATUS_PRODUCTION_BEHAVIOR;
  readonly acceptedProvenanceContract: typeof PHASE_ACCEPTED_PROVENANCE_CONTRACT;
  readonly calibrationLabDesign: typeof PHASE_CALIBRATION_LAB_DESIGN;
  readonly recommendedImplementationBoundary: readonly string[];
  readonly humanReviewQuestions: readonly string[];
  readonly remainingP1: readonly string[];
}

function score(candidate: RankedCandidate, componentId: string) {
  const found = candidate.components.find((component) => component.id === componentId);
  if (!found) {
    throw new Error(`Missing ${componentId} for ${candidate.exercise.id}.`);
  }
  return found;
}

function scopeLabel(scope: ExercisePhaseAnnotationScope): string {
  const roles = scope.trainingRoles?.join("+") ?? "all_roles";
  const sections = scope.sessionSections?.join("+") ?? "all_sections";
  return `${roles} / ${sections}`;
}

function round(value: number, digits = 6): number {
  return Number(value.toFixed(digits));
}

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function effectiveReviewWeight(
  policy: ContextualPhasePolicyDefinition,
  resolution: ContextualPhaseResolutionTrace,
): number {
  if (resolution.evidenceStatus === "ACCEPTED_ANNOTATION") {
    return policy.phaseWeight;
  }
  if (resolution.evidenceStatus !== "REVIEW_QUALIFIED_ANNOTATION") {
    return 0;
  }
  return policy.reviewQualifiedTreatment === "full"
    ? policy.phaseWeight
    : policy.reviewQualifiedTreatment === "attenuated"
      ? policy.phaseWeight * 0.5
      : 0;
}

function nonPhaseWeightedState(candidate: RankedCandidate): {
  readonly weightedSum: number;
  readonly totalWeight: number;
} {
  return candidate.components.reduce(
    (state, candidateComponent) => {
      const weight = DEFAULT_CANDIDATE_SCORING_WEIGHTS[candidateComponent.family];
      return {
        weightedSum: state.weightedSum + candidateComponent.rawValue * weight,
        totalWeight: state.totalWeight + weight,
      };
    },
    { weightedSum: 0, totalWeight: 0 },
  );
}

interface MutablePolicyCandidateRow extends Omit<ContextPolicyCandidateRow, "rank" | "currentRank" | "currentTotal"> {
  rank: number;
  currentRank: number;
  currentTotal: number;
}

function rankScenarioForPolicy(input: {
  readonly scenario: ContextControlledScenario;
  readonly policy: ContextualPhasePolicyDefinition;
  readonly annotations: readonly ExercisePhaseSuitabilityAnnotation[];
  readonly currentResult: ReturnType<typeof runCandidateRankingLab>;
}): readonly ContextPolicyCandidateRow[] {
  const currentById = new Map(
    input.currentResult.rankedCandidates.map((candidate) => [candidate.exercise.id, candidate] as const),
  );

  if (input.policy.family === "CURRENT_GLOBAL") {
    return input.currentResult.rankedCandidates.map((candidate): ContextPolicyCandidateRow => {
      const currentAnnotation = currentPhaseSuitability(
        candidate.exercise,
        input.scenario.request.phase.id,
      );
      const phaseComponent = score(candidate, "phase_fit");
      return {
        policyId: input.policy.id,
        scenarioId: input.scenario.id,
        scenarioLabel: input.scenario.label,
        scenarioKind: input.scenario.kind,
        phaseId: input.scenario.request.phase.id,
        goal: input.scenario.request.goal,
        requestedRole: input.scenario.request.need.requestedRole,
        requestedSection: input.scenario.request.need.requestedSection ?? null,
        exerciseId: candidate.exercise.id,
        rank: candidate.rank,
        currentRank: candidate.rank,
        total: candidate.total,
        currentTotal: candidate.total,
        nonPhaseTotal: runCandidateRankingLab(input.scenario.request, {
          scoreComponents: PHASELESS_COMPONENTS,
        }).rankedCandidates.find((row) => row.exercise.id === candidate.exercise.id)?.total ?? 0,
        resolvedAnnotationId: `legacy-global:${candidate.exercise.id}:${input.scenario.request.phase.id}`,
        annotationSuitability: currentAnnotation.suitability,
        annotationScope: "all roles / all sections (legacy global)",
        annotationSpecificity: "legacy_global",
        annotationReviewStatus: "unmodeled",
        evidenceStatus: "LEGACY_GLOBAL_UNQUALIFIED",
        phaseRawValue: phaseComponent.rawValue,
        effectivePhaseWeight: input.policy.phaseWeight,
        phaseContribution: phaseComponent.weightedContribution,
        painReadiness: candidate.painExecutionReadiness.readiness,
        unresolvedConflictIds: [],
      };
    });
  }

  const nonPhaseResult = runCandidateRankingLab(input.scenario.request, {
    scoreComponents: PHASELESS_COMPONENTS,
  });
  const rows: MutablePolicyCandidateRow[] = nonPhaseResult.rankedCandidates.map((candidate) => {
    const base = nonPhaseWeightedState(candidate);
    const current = currentById.get(candidate.exercise.id);
    if (!current) {
      throw new Error(`Current policy omitted legal candidate ${candidate.exercise.id}.`);
    }

    if (!input.policy.useContextResolver) {
      const annotation = currentPhaseSuitability(
        candidate.exercise,
        input.scenario.request.phase.id,
      );
      const phaseRawValue = input.policy.categoryMap[annotation.suitability];
      const denominator = base.totalWeight + input.policy.phaseWeight;
      return {
        policyId: input.policy.id,
        scenarioId: input.scenario.id,
        scenarioLabel: input.scenario.label,
        scenarioKind: input.scenario.kind,
        phaseId: input.scenario.request.phase.id,
        goal: input.scenario.request.goal,
        requestedRole: input.scenario.request.need.requestedRole,
        requestedSection: input.scenario.request.need.requestedSection ?? null,
        exerciseId: candidate.exercise.id,
        rank: 0,
        currentRank: current.rank,
        total: round(
          (base.weightedSum + phaseRawValue * input.policy.phaseWeight) / denominator,
          3,
        ),
        currentTotal: current.total,
        nonPhaseTotal: candidate.total,
        resolvedAnnotationId: `legacy-global:${candidate.exercise.id}:${input.scenario.request.phase.id}`,
        annotationSuitability: annotation.suitability,
        annotationScope: "all roles / all sections (legacy global)",
        annotationSpecificity: "legacy_global",
        annotationReviewStatus: "unmodeled",
        evidenceStatus: "LEGACY_GLOBAL_UNQUALIFIED",
        phaseRawValue,
        effectivePhaseWeight: input.policy.phaseWeight,
        phaseContribution: round(
          (phaseRawValue * input.policy.phaseWeight) / denominator,
        ),
        painReadiness: candidate.painExecutionReadiness.readiness,
        unresolvedConflictIds: [],
      };
    }

    const resolution = resolveContextualPhaseAnnotation({
      phaseId: input.scenario.request.phase.id,
      requestedRole: input.scenario.request.need.requestedRole,
      requestedSection: input.scenario.request.need.requestedSection ?? null,
      exerciseId: candidate.exercise.id,
      annotations: input.annotations,
    });
    const effectivePhaseWeight = effectiveReviewWeight(input.policy, resolution);
    const phaseRawValue = resolution.selectedAnnotation
      ? input.policy.categoryMap[resolution.selectedAnnotation.suitability]
      : null;
    const denominator = base.totalWeight + effectivePhaseWeight;
    const numerator =
      base.weightedSum + (phaseRawValue ?? 0) * effectivePhaseWeight;

    return {
      policyId: input.policy.id,
      scenarioId: input.scenario.id,
      scenarioLabel: input.scenario.label,
      scenarioKind: input.scenario.kind,
      phaseId: input.scenario.request.phase.id,
      goal: input.scenario.request.goal,
      requestedRole: input.scenario.request.need.requestedRole,
      requestedSection: input.scenario.request.need.requestedSection ?? null,
      exerciseId: candidate.exercise.id,
      rank: 0,
      currentRank: current.rank,
      total: round(denominator === 0 ? 0 : numerator / denominator, 3),
      currentTotal: current.total,
      nonPhaseTotal: candidate.total,
      resolvedAnnotationId: resolution.selectedAnnotation?.annotationId ?? null,
      annotationSuitability: resolution.selectedAnnotation?.suitability ?? null,
      annotationScope: resolution.selectedAnnotation
        ? scopeLabel(resolution.selectedAnnotation.scope)
        : "no matching phase evidence",
      annotationSpecificity: resolution.specificity,
      annotationReviewStatus: resolution.reviewStatus,
      evidenceStatus: resolution.evidenceStatus,
      phaseRawValue,
      effectivePhaseWeight,
      phaseContribution:
        denominator === 0 || phaseRawValue === null
          ? 0
          : round((phaseRawValue * effectivePhaseWeight) / denominator),
      painReadiness: candidate.painExecutionReadiness.readiness,
      unresolvedConflictIds: resolution.unresolvedConflictIds,
    };
  });

  return rows
    .sort(
      (left, right) =>
        right.total - left.total || left.exerciseId.localeCompare(right.exerciseId),
    )
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function tiePairs(rows: readonly ContextPolicyCandidateRow[]): readonly string[] {
  const pairs: string[] = [];
  for (let leftIndex = 0; leftIndex < rows.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < rows.length; rightIndex += 1) {
      const left = rows[leftIndex];
      const right = rows[rightIndex];
      if (left.total === right.total) {
        pairs.push([left.exerciseId, right.exerciseId].sort().join("+"));
      }
    }
  }
  return pairs.sort();
}

function difference<T>(left: readonly T[], right: readonly T[]): readonly T[] {
  return left.filter((value) => !right.includes(value));
}

function buildScenarioRows(
  scenarios: readonly ContextControlledScenario[],
  candidateRows: readonly ContextPolicyCandidateRow[],
): readonly ContextPolicyScenarioRow[] {
  return CONTEXTUAL_PHASE_POLICIES.flatMap((policy) =>
    scenarios.map((scenario): ContextPolicyScenarioRow => {
      const rows = candidateRows.filter(
        (row) => row.policyId === policy.id && row.scenarioId === scenario.id,
      );
      const current = candidateRows.filter(
        (row) => row.policyId === "A_CURRENT_GLOBAL" && row.scenarioId === scenario.id,
      );
      const currentRankById = new Map(current.map((row) => [row.exerciseId, row.rank] as const));
      const changedIds = rows
        .filter((row) => currentRankById.get(row.exerciseId) !== row.rank)
        .map((row) => row.exerciseId);
      const currentTies = tiePairs(current);
      const policyTies = tiePairs(rows);
      const unknownCount = rows.filter((row) => row.evidenceStatus === "UNKNOWN_NO_MATCH").length;
      const reviewCount = rows.filter(
        (row) => row.evidenceStatus === "REVIEW_QUALIFIED_ANNOTATION",
      ).length;
      const conflictCount = rows.filter(
        (row) => row.evidenceStatus === "CONFLICTING_ANNOTATIONS",
      ).length;
      const whyOrderChanged =
        changedIds.length === 0
          ? "No rank order changed."
          : `Only copied phase policy changed: ${changedIds.sort().join(", ")} moved; contextual evidence rows were review=${reviewCount}, unknown=${unknownCount}, conflict=${conflictCount}. Non-phase components, eligibility and pain readiness were held fixed.`;
      return {
        policyId: policy.id,
        scenarioId: scenario.id,
        scenarioLabel: scenario.label,
        scenarioKind: scenario.kind,
        phaseId: scenario.request.phase.id,
        winner: rows[0]?.exerciseId ?? null,
        runnerUp: rows[1]?.exerciseId ?? null,
        currentWinner: current[0]?.exerciseId ?? null,
        winnerChanged: rows[0]?.exerciseId !== current[0]?.exerciseId,
        rankChanges: changedIds.length,
        tiesCreated: difference(policyTies, currentTies).length,
        tiesBroken: difference(currentTies, policyTies).length,
        whyOrderChanged,
      };
    }),
  );
}

function buildPolicySummaries(
  scenarioRows: readonly ContextPolicyScenarioRow[],
  candidateRows: readonly ContextPolicyCandidateRow[],
): readonly ContextPolicySummaryRow[] {
  return CONTEXTUAL_PHASE_POLICIES.map((policy): ContextPolicySummaryRow => {
    const scenarios = scenarioRows.filter((row) => row.policyId === policy.id);
    const candidates = candidateRows.filter((row) => row.policyId === policy.id);
    return {
      policyId: policy.id,
      scenarioCount: scenarios.length,
      rankChanges: scenarios.reduce((sum, row) => sum + row.rankChanges, 0),
      winnerChanges: scenarios.filter((row) => row.winnerChanged).length,
      tiesCreated: scenarios.reduce((sum, row) => sum + row.tiesCreated, 0),
      tiesBroken: scenarios.reduce((sum, row) => sum + row.tiesBroken, 0),
      unknownCandidateRows: candidates.filter(
        (row) => row.evidenceStatus === "UNKNOWN_NO_MATCH",
      ).length,
      reviewQualifiedCandidateRows: candidates.filter(
        (row) => row.evidenceStatus === "REVIEW_QUALIFIED_ANNOTATION",
      ).length,
      conflictCandidateRows: candidates.filter(
        (row) => row.evidenceStatus === "CONFLICTING_ANNOTATIONS",
      ).length,
    };
  });
}

function buildWinnerChanges(
  scenarioRows: readonly ContextPolicyScenarioRow[],
  candidateRows: readonly ContextPolicyCandidateRow[],
): readonly ContextWinnerChangeRow[] {
  return scenarioRows
    .filter(
      (row): row is ContextPolicyScenarioRow & {
        readonly currentWinner: string;
        readonly winner: string;
      } => row.winnerChanged && row.currentWinner !== null && row.winner !== null,
    )
    .map((row): ContextWinnerChangeRow => {
      const currentWinner = candidateRows.find(
        (candidate) =>
          candidate.policyId === row.policyId &&
          candidate.scenarioId === row.scenarioId &&
          candidate.exerciseId === row.currentWinner,
      );
      const experimentalWinner = candidateRows.find(
        (candidate) =>
          candidate.policyId === row.policyId &&
          candidate.scenarioId === row.scenarioId &&
          candidate.exerciseId === row.winner,
      );
      const evidence = (candidate: ContextPolicyCandidateRow | undefined) =>
        candidate
          ? `${candidate.evidenceStatus}; annotation=${candidate.resolvedAnnotationId ?? "none"}; effectiveWeight=${candidate.effectivePhaseWeight}`
          : "candidate unavailable";
      return {
        policyId: row.policyId,
        scenarioId: row.scenarioId,
        scenarioLabel: row.scenarioLabel,
        phaseId: row.phaseId,
        currentWinner: row.currentWinner,
        experimentalWinner: row.winner,
        currentWinnerPhaseEvidence: evidence(currentWinner),
        experimentalWinnerPhaseEvidence: evidence(experimentalWinner),
        whyChanged: row.whyOrderChanged,
      };
    });
}

function syntheticAnnotation(input: {
  readonly annotationId: string;
  readonly exerciseId?: string;
  readonly phaseId?: PhaseId;
  readonly suitability?: ContextualPhaseSuitability;
  readonly scope?: ExercisePhaseAnnotationScope;
  readonly reason?: string;
  readonly reviewStatus?: ContextualPhaseAnnotationReviewStatus;
  readonly provenanceRef?: string;
}): ExercisePhaseSuitabilityAnnotation {
  return {
    annotationId: input.annotationId,
    exerciseId: input.exerciseId ?? "band-face-pull",
    phaseId: input.phaseId ?? "phase_3",
    suitability: input.suitability ?? "good",
    scope: input.scope ?? {},
    reason: input.reason ?? "Synthetic contextual phase evidence.",
    reviewStatus: input.reviewStatus ?? "accepted",
    provenance: {
      sourceType: "unknown",
      sourceRef: input.provenanceRef ?? "counterfactual:default",
      evidenceBasis: ["Synthetic invariant only."],
    },
  };
}

function rejectionSignature(result: ReturnType<typeof runCandidateRankingLab>): readonly string[] {
  return result.hardRejectedCandidates
    .map((candidate) =>
      `${candidate.exercise.id}:${candidate.eligibility.rejectionReasons
        .map((reason) => reason.code)
        .sort()
        .join("+")}`,
    )
    .sort();
}

function buildCounterfactualProof(): ContextCounterfactualProof {
  const activationNeed = needById("scapular-activation");
  const accessoryNeed = needById("rear-delt-accessory");
  const accessoryScoped = syntheticAnnotation({
    annotationId: "counterfactual-accessory",
    scope: SCOPES.accessory,
  });
  const activationScoped = syntheticAnnotation({
    annotationId: "counterfactual-activation",
    scope: SCOPES.activation,
  });
  const accessoryAgainstActivation = resolveContextualPhaseAnnotation({
    phaseId: "phase_3",
    requestedRole: activationNeed.need.requestedRole,
    requestedSection: activationNeed.need.requestedSection ?? null,
    exerciseId: "band-face-pull",
    annotations: [accessoryScoped],
  });
  const activationAgainstAccessory = resolveContextualPhaseAnnotation({
    phaseId: "phase_3",
    requestedRole: accessoryNeed.need.requestedRole,
    requestedSection: accessoryNeed.need.requestedSection ?? null,
    exerciseId: "band-face-pull",
    annotations: [activationScoped],
  });

  const general = syntheticAnnotation({
    annotationId: "counterfactual-general",
    suitability: "possible",
  });
  const exact = syntheticAnnotation({
    annotationId: "counterfactual-role-section",
    suitability: "excellent",
    scope: SCOPES.activation,
  });
  const specificity = resolveContextualPhaseAnnotation({
    phaseId: "phase_3",
    requestedRole: "activation",
    requestedSection: "activation",
    exerciseId: "band-face-pull",
    annotations: [general, exact],
  });
  const noMatch = resolveContextualPhaseAnnotation({
    phaseId: "phase_3",
    requestedRole: "activation",
    requestedSection: "activation",
    exerciseId: "band-face-pull",
    annotations: [],
  });
  const reviewedPoor = resolveContextualPhaseAnnotation({
    phaseId: "phase_3",
    requestedRole: "activation",
    requestedSection: "activation",
    exerciseId: "band-face-pull",
    annotations: [
      syntheticAnnotation({
        annotationId: "counterfactual-reviewed-poor",
        suitability: "poor",
        scope: SCOPES.activation,
      }),
    ],
  });

  const reasonScenario: ContextControlledScenario = {
    id: "counterfactual-reason",
    label: "counterfactual reason",
    kind: "phase_matrix",
    request: makeRequest({
      id: "phase-context-counterfactual-reason",
      phaseId: "phase_3",
      goal: "posture_and_movement_quality",
      need: activationNeed.need,
      candidatePool: pool(["band-face-pull"]),
    }),
  };
  const reasonCurrent = runCandidateRankingLab(reasonScenario.request, LEGACY_OPTIONS);
  const reasonA = syntheticAnnotation({
    annotationId: "counterfactual-reason-a",
    scope: SCOPES.activation,
    reason: "First explanatory prose.",
  });
  const reasonB = {
    ...reasonA,
    reason: "Completely different explanatory prose.",
  };
  const provenanceB = {
    ...reasonA,
    provenance: {
      ...reasonA.provenance,
      sourceRef: "counterfactual:changed-provenance-only",
    },
  };
  const contextPolicy = CONTEXTUAL_PHASE_POLICIES.find(
    (policy) => policy.id === "C_CONTEXT_SCOPED_ANNOTATION_ONLY",
  );
  if (!contextPolicy) {
    throw new Error("Missing contextual policy C.");
  }
  const reasonRowsA = rankScenarioForPolicy({
    scenario: reasonScenario,
    policy: contextPolicy,
    annotations: [reasonA],
    currentResult: reasonCurrent,
  });
  const reasonRowsB = rankScenarioForPolicy({
    scenario: reasonScenario,
    policy: contextPolicy,
    annotations: [reasonB],
    currentResult: reasonCurrent,
  });
  const provenanceRows = rankScenarioForPolicy({
    scenario: reasonScenario,
    policy: contextPolicy,
    annotations: [provenanceB],
    currentResult: reasonCurrent,
  });

  const conflictA = syntheticAnnotation({
    annotationId: "counterfactual-conflict-a",
    suitability: "excellent",
    scope: SCOPES.activation,
  });
  const conflictB = syntheticAnnotation({
    annotationId: "counterfactual-conflict-b",
    suitability: "poor",
    scope: SCOPES.activation,
  });
  const resolveConflict = (
    annotations: readonly ExercisePhaseSuitabilityAnnotation[],
  ) =>
    resolveContextualPhaseAnnotation({
      phaseId: "phase_3",
      requestedRole: "activation",
      requestedSection: "activation",
      exerciseId: "band-face-pull",
      annotations,
    });
  const conflictForward = resolveConflict([conflictA, conflictB]);
  const conflictReverse = resolveConflict([conflictB, conflictA]);

  const wrongTruthRequest = makeRequest({
    id: "phase-context-wrong-role-section",
    phaseId: "phase_3",
    goal: "posture_and_movement_quality",
    need: activationNeed.need,
    candidatePool: pool(["cable-chest-fly"]),
  });
  const wrongTruthResult = runCandidateRankingLab(wrongTruthRequest, {
    scoreComponents: PHASELESS_COMPONENTS,
  });

  const scenarios = buildControlledScenarios();
  const painScenario = scenarios.find(
    (scenario) => scenario.id === "pain-prescription-required",
  );
  if (!painScenario) {
    throw new Error("Missing pain counterfactual scenario.");
  }
  const painCurrent = runCandidateRankingLab(painScenario.request, LEGACY_OPTIONS);
  const painContext = rankScenarioForPolicy({
    scenario: painScenario,
    policy: contextPolicy,
    annotations: buildProposedContextualAnnotations(),
    currentResult: painCurrent,
  });
  const currentPainById = new Map(
    painCurrent.rankedCandidates.map(
      (candidate) => [candidate.exercise.id, candidate.painExecutionReadiness.readiness] as const,
    ),
  );

  const transitionExercise = currentExercise("band-face-pull");
  const transitionEffects = buildExerciseTransitionTraces(
    transitionExercise,
    REFERENCE_EXERCISES,
  ).map((trace) => trace.automaticSelectionEffect);

  return {
    accessoryScopeDoesNotAffectActivation:
      accessoryAgainstActivation.evidenceStatus === "UNKNOWN_NO_MATCH" &&
      accessoryAgainstActivation.selectedAnnotation === null,
    activationScopeDoesNotAffectAccessory:
      activationAgainstAccessory.evidenceStatus === "UNKNOWN_NO_MATCH" &&
      activationAgainstAccessory.selectedAnnotation === null,
    roleAndSectionOutranksGeneral:
      specificity.selectedAnnotation?.annotationId === exact.annotationId &&
      specificity.specificity === "role_and_section",
    noMatchIsUnknown:
      noMatch.evidenceStatus === "UNKNOWN_NO_MATCH" && noMatch.selectedAnnotation === null,
    reviewedPoorDistinctFromUnknown:
      reviewedPoor.evidenceStatus === "ACCEPTED_ANNOTATION" &&
      reviewedPoor.selectedAnnotation?.suitability === "poor" &&
      noMatch.evidenceStatus === "UNKNOWN_NO_MATCH" &&
      noMatch.selectedAnnotation === null,
    reasonProseDoesNotChangeScoring:
      reasonRowsA[0]?.total === reasonRowsB[0]?.total &&
      reasonRowsA[0]?.phaseRawValue === reasonRowsB[0]?.phaseRawValue,
    provenanceDoesNotChangeScoringOrLegality:
      reasonRowsA[0]?.total === provenanceRows[0]?.total &&
      JSON.stringify(rejectionSignature(reasonCurrent)) ===
        JSON.stringify(rejectionSignature(runCandidateRankingLab(reasonScenario.request, LEGACY_OPTIONS))),
    equalSpecificityConflictIsExplicitAndDeterministic:
      conflictForward.evidenceStatus === "CONFLICTING_ANNOTATIONS" &&
      conflictForward.selectedAnnotation === null &&
      JSON.stringify(conflictForward.unresolvedConflictIds) ===
        JSON.stringify(conflictReverse.unresolvedConflictIds),
    scopeCannotLegalizeWrongRoleOrSection:
      wrongTruthResult.rankedCandidates.length === 0 &&
      wrongTruthResult.hardRejectedCandidates[0]?.eligibility.rejectionReasons.some(
        (reason) => reason.code === "ROLE_MISMATCH" || reason.code === "SECTION_MISMATCH",
      ) === true,
    scopeCannotAlterPainReadiness: painContext.every(
      (candidate) => currentPainById.get(candidate.exerciseId) === candidate.painReadiness,
    ),
    scopeCannotActivateTransition:
      transitionEffects.length > 0 && transitionEffects.every((effect) => effect === "none"),
  };
}

const MULTI_ROLE_REVIEW_IDS = [
  "reverse-pec-deck",
  "band-face-pull",
  "serratus-wall-slide",
  "dead-bug",
  "pallof-press",
  "glute-bridge",
  "band-row",
  "cable-pull-through",
  "bodyweight-box-squat",
  "machine-chest-press",
  "chest-supported-dumbbell-row",
  "one-arm-dumbbell-row",
  "machine-row",
  "seated-cable-row",
] as const;

const ARM_ACCESSORY_REVIEW_IDS = [
  "dumbbell-curl",
  "cable-triceps-pressdown",
  "dumbbell-lateral-raise",
  "cable-chest-fly",
  "lying-leg-curl",
  "reverse-pec-deck",
] as const;

const ROW_REVIEW_IDS = [
  "machine-row",
  "seated-cable-row",
  "chest-supported-dumbbell-row",
  "one-arm-dumbbell-row",
] as const;

function buildScapularFocus(input: {
  readonly audit: readonly PhaseAnnotationOwnershipAuditRow[];
  readonly candidateRows: readonly ContextPolicyCandidateRow[];
}): readonly ScapularActivationFocusRow[] {
  const exerciseIds = [
    "band-face-pull",
    "reverse-pec-deck",
    "serratus-wall-slide",
  ] as const;
  return exerciseIds.map((exerciseId): ScapularActivationFocusRow => {
    const audit = input.audit.find(
      (row) => row.exerciseId === exerciseId && row.phaseId === "phase_3",
    );
    const current = input.candidateRows.find(
      (row) =>
        row.policyId === "A_CURRENT_GLOBAL" &&
        row.scenarioId === "scapular-activation-phase_3" &&
        row.exerciseId === exerciseId,
    );
    const contextual = input.candidateRows.find(
      (row) =>
        row.policyId === "C_CONTEXT_SCOPED_ANNOTATION_ONLY" &&
        row.scenarioId === "scapular-activation-phase_3" &&
        row.exerciseId === exerciseId,
    );
    if (!audit || !current || !contextual) {
      throw new Error(`Missing Phase 3 scapular focus evidence for ${exerciseId}.`);
    }
    return {
      exerciseId,
      currentSuitability: audit.currentSuitability,
      currentReason: audit.currentReason,
      currentRank: current.rank,
      currentPhaseRaw: current.phaseRawValue,
      contextualRank: contextual.rank,
      contextualEvidenceStatus:
        contextual.evidenceStatus === "LEGACY_GLOBAL_UNQUALIFIED"
          ? "UNKNOWN_NO_MATCH"
          : contextual.evidenceStatus,
      selectedAnnotationId: contextual.resolvedAnnotationId,
      proposedScope: scopeLabel(audit.proposedScope),
      ownerClassification: audit.evidenceOwnerClassification,
      finding: audit.auditFinding,
    };
  });
}

export function buildPhaseAnnotationContextReviewData(): PhaseAnnotationContextReviewData {
  const acceptedLaboratory = buildPhaseSuitabilityCalibrationData();
  const ownershipAudit = buildPhaseAnnotationOwnershipAudit();
  const proposedAnnotations = buildProposedContextualAnnotations(ownershipAudit);
  const controlledScenarios = buildControlledScenarios();
  const currentResults = new Map(
    controlledScenarios.map(
      (scenario) => [scenario.id, runCandidateRankingLab(scenario.request, LEGACY_OPTIONS)] as const,
    ),
  );
  const candidateRows = CONTEXTUAL_PHASE_POLICIES.flatMap((policy) =>
    controlledScenarios.flatMap((scenario) => {
      const currentResult = currentResults.get(scenario.id);
      if (!currentResult) {
        throw new Error(`Missing current result for ${scenario.id}.`);
      }
      return rankScenarioForPolicy({
        scenario,
        policy,
        annotations: proposedAnnotations,
        currentResult,
      });
    }),
  );
  const scenarioRows = buildScenarioRows(controlledScenarios, candidateRows);
  const policySummaries = buildPolicySummaries(scenarioRows, candidateRows);
  const winnerChanges = buildWinnerChanges(scenarioRows, candidateRows);
  const acceptedAnnotationCount = ownershipAudit.filter(
    (row) => row.reviewStatus === "accepted",
  ).length;
  const needsReviewAnnotationCount = ownershipAudit.filter(
    (row) => row.reviewStatus === "needs_review",
  ).length;
  const unknownAnnotationCount = ownershipAudit.filter(
    (row) => row.reviewStatus === "unknown",
  ).length;
  const counterfactualProof = buildCounterfactualProof();
  const multiRoleAudit = ownershipAudit.filter((row) =>
    MULTI_ROLE_REVIEW_IDS.includes(row.exerciseId as (typeof MULTI_ROLE_REVIEW_IDS)[number]),
  );
  const armAccessoryAudit = ownershipAudit.filter((row) =>
    ARM_ACCESSORY_REVIEW_IDS.includes(
      row.exerciseId as (typeof ARM_ACCESSORY_REVIEW_IDS)[number],
    ),
  );
  const rowAudit = ownershipAudit.filter((row) =>
    ROW_REVIEW_IDS.includes(row.exerciseId as (typeof ROW_REVIEW_IDS)[number]),
  );
  const scapularActivationFocus = buildScapularFocus({
    audit: ownershipAudit,
    candidateRows,
  });
  const contextualFingerprint = hash({
    ownershipAudit,
    proposedAnnotations,
    candidateRows,
    scenarioRows,
    policySummaries,
    winnerChanges,
    counterfactualProof,
  });

  return {
    classification: "PHASE_CONTEXT_OWNER_POLICY_SELECTED_CURATION_PENDING",
    fixedAsOf: PHASE_CALIBRATION_FIXED_AS_OF,
    productionRankingFingerprint: acceptedLaboratory.productionRankingFingerprint,
    expectedProductionRankingFingerprint: EXPECTED_PRODUCTION_RANKING_FINGERPRINT,
    productionFingerprintMatches: acceptedLaboratory.productionFingerprintMatches,
    ownershipAudit,
    proposedAnnotations,
    controlledScenarios,
    policies: CONTEXTUAL_PHASE_POLICIES,
    candidateRows,
    scenarioRows,
    policySummaries,
    winnerChanges,
    scapularActivationFocus,
    multiRoleAudit,
    armAccessoryAudit,
    rowAudit,
    counterfactualProof,
    acceptedAnnotationCount,
    needsReviewAnnotationCount,
    unknownAnnotationCount,
    contextualFingerprint,
    primaryGoalRecommendation:
      "Rename PhaseIntent.primaryGoal in a future approved domain migration to a typed developmentalEmphasis concept. Until then it remains non-behavioral metadata and must never overwrite CandidateRequest.goal.",
    ownerPolicies: CONTEXTUAL_PHASE_OWNER_POLICIES,
    reviewStatusProductionBehavior: PHASE_REVIEW_STATUS_PRODUCTION_BEHAVIOR,
    acceptedProvenanceContract: PHASE_ACCEPTED_PROVENANCE_CONTRACT,
    calibrationLabDesign: PHASE_CALIBRATION_LAB_DESIGN,
    recommendedImplementationBoundary: [
      "Keep contextual phase resolution strictly downstream of hard eligibility.",
      "Represent one or more structured role/section annotations per exercise and phase; general annotations require evidence that covers every legal use.",
      "Only accepted contextual phase annotations with complete provenance may affect the non-default contextual scorer; needs_review and unknown omit the component and denominator weight.",
      "Remove the explicit Phase 1 skill/stability and Phase 3 loadability bonuses when the owner-approved production policy is implemented.",
      "Treat no match and conflict as omitted effective evidence, not as a numeric poor category; preserve explicit reviewed poor as a separate bounded category.",
      "Keep reason prose explanatory only and expose annotation, specificity, review status, provenance, conflicts and evidence status in the trace.",
      "Leave enduring goal, section intent, mechanics, progression, continuity, assessment, pain and weekly allocation with their existing owners.",
      "Use the owner-selected 8.8/7.8/6.2/5.5 categories and phase-family weight 1.0 only after accepted contextual curation is approved and explicitly activated.",
    ],
    humanReviewQuestions: [
      "Which of the review-qualified contextual judgments has enough exercise-science evidence to become accepted?",
      "Should any current global annotation survive as genuinely general across every legal role and section?",
      "What structured source, reviewer identity and review date are required for accepted phase evidence?",
      "Which contextual annotations need separate role+section variants rather than one broad scope?",
      "Which proposed contextual annotations should receive final owner approval and accepted provenance?",
      "How should explicit poor evidence be calibrated without turning missing evidence into a penalty?",
      "When approved annotation coverage is sufficient, which explicit release should activate the selected non-default policy?",
    ],
    remainingP1: [
      "Final owner decisions for the proposed contextual annotations and accepted provenance.",
      "Explicit production activation only after truthful accepted annotation coverage is sufficient.",
      "Full ranking revalidation at activation, including removal of the duplicate legacy mechanical bonuses.",
    ],
  };
}

function list(values: readonly string[]): string {
  return values.length === 0 ? "none" : values.join(", ");
}

function markdownCell(value: string | number | null): string {
  return String(value ?? "-").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function table(
  headers: readonly string[],
  rows: readonly (readonly (string | number | null)[])[],
): string {
  return [
    `| ${headers.map(markdownCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`),
  ].join("\n");
}

function fixed(value: number | null, digits = 3): string {
  return value === null ? "-" : value.toFixed(digits);
}

function countBy<T extends string>(values: readonly T[]): string {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([value, count]) => `${value}=${count}`)
    .join("; ");
}

export function renderPhaseAnnotationContextReview(
  data: PhaseAnnotationContextReviewData,
): string {
  const contextCandidateRows = data.candidateRows.filter(
    (row) => row.policyId === "C_CONTEXT_SCOPED_ANNOTATION_ONLY",
  );
  const contextScenarioRows = data.scenarioRows.filter(
    (row) => row.policyId === "C_CONTEXT_SCOPED_ANNOTATION_ONLY",
  );
  const phaseMatrixScenarioRows = data.scenarioRows.filter(
    (row) => row.scenarioKind === "phase_matrix",
  );
  const interactionScenarioRows = data.scenarioRows.filter(
    (row) => row.scenarioKind !== "phase_matrix",
  );
  const counterfactualEntries = Object.entries(data.counterfactualProof);

  return [
    "# Phase Annotation Context And Uncertainty Review",
    "",
    "`ENGINE_V2_BLUEPRINT.md` remains authoritative. The accepted Phase Suitability Calibration Laboratory established bounded phase preference and exposed duplicated mechanical bonuses. This second deterministic laboratory examines whether phase evidence applies to the candidate's actual role and section and whether missing evidence remains distinct from reviewed poor fit.",
    "",
    "The contextual annotation schema, deterministic resolver, provenance validation, conflict semantics, DecisionTrace support, and selected annotation-only non-default scorer are implemented. Legacy production phase scoring, rankings, eligibility, pain, assessment, continuity, prescription, Session Composer, and Weekly Composer remain unchanged while accepted annotation curation awaits owner approval.",
    "",
    `Fixed evaluation time: \`${data.fixedAsOf}\`.`,
    "",
    `Accepted production ranking fingerprint: \`${data.productionRankingFingerprint}\` (${data.productionFingerprintMatches ? "matches" : "DOES NOT MATCH"} captured HEAD dc9336e baseline).`,
    "",
    `Context laboratory fingerprint: \`${data.contextualFingerprint}\`.`,
    "",
    `Classification: **${data.classification}**.`,
    "",
    "The owner selected CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN with excellent 8.8, good 7.8, possible 6.2, poor 5.5 and phase-family weight 1.0. The current catalog is not being declared accepted contextual evidence and production activation remains deferred.",
    "",
    "## Accepted Owner Direction",
    "",
    data.ownerPolicies.map((policy) => `- ${policy}`).join("\n"),
    "",
    "Category values and phase-family weight are owner-approved as the starting policy only after accepted contextual annotation coverage is ready.",
    "",
    "## Implemented Contextual Annotation Contract",
    "",
    "```ts",
    "interface ExercisePhaseSuitabilityAnnotation {",
    "  annotationId: string;",
    "  exerciseId: string;",
    "  phaseId: PhaseId;",
    "  suitability: 'poor' | 'possible' | 'good' | 'excellent';",
    "  scope: { trainingRoles?: TrainingRole[]; sessionSections?: SessionSection[] };",
    "  reason: string;",
    "  reviewStatus: 'accepted' | 'needs_review' | 'unknown';",
    "  provenance: {",
    "    sourceType: 'owner_decision' | 'human_exercise_science_review' | 'external_reference' | 'legacy_reference_catalog_migration' | 'unknown';",
    "    sourceRef: string;",
    "    evidenceBasis: string[];",
    "    reviewerId?: string;",
    "    reviewedAt?: string;",
    "    legalUseCoverage?: { trainingRoles: TrainingRole[]; sessionSections: SessionSection[] };",
    "  };",
    "}",
    "```",
    "",
    "More than one annotation may exist for an exercise/phase when different legal uses require different judgments. A general annotation is valid only when its evidence covers every legal training role and section. Reason prose explains selected structured evidence but is never parsed for scoring. Goal-specific annotations are excluded because they would duplicate `goal_fit`.",
    "",
    "## Implemented Deterministic Context Resolver",
    "",
    table(
      ["Specificity", "Required Match", "Rank"],
      [
        ["role_and_section", "requested training role and requested section both match", 4],
        ["section", "requested section matches a section-only scope", 3],
        ["training_role", "requested role matches a role-only scope", 2],
        ["general", "annotation has no role or section restriction", 1],
        ["none", "no annotation matches", 0],
      ],
    ),
    "",
    "The resolver filters by exercise and active phase, evaluates structured scope, selects only the highest specificity, and sorts annotation IDs for deterministic trace order. Equally specific annotations with different suitability or review meaning produce `CONFLICTING_ANNOTATIONS`; the resolver never chooses the favorable value. Equivalent duplicates resolve deterministically to the lowest annotation ID but remain visible in `consideredAnnotationIds`.",
    "",
    "Every trace exposes active phase, requested role/section, candidate exercise, all considered and matching annotations, selected annotation, specificity, review status, provenance, conflicts and evidence status.",
    "",
    "## Review Status Production Behavior",
    "",
    table(
      ["Review status / state", "Production scoring", "Trace behavior"],
      data.reviewStatusProductionBehavior.map((row) => [
        row.reviewStatus,
        row.productionScoring,
        row.traceBehavior,
      ]),
    ),
    "",
    "Only accepted contextual phase annotations with complete provenance may emit the non-default phase component. `needs_review`, `unknown`, no match and conflict omit the component and its denominator weight. Accepted poor remains a real bounded category. Conflict remains visible and requires review.",
    "",
    "## Accepted Evidence Provenance Contract",
    "",
    table(
      ["Requirement", "Value"],
      [
        ["Required fields", data.acceptedProvenanceContract.requiredFields.join(", ")],
        ["Allowed source types", data.acceptedProvenanceContract.allowedSourceTypes.join(", ")],
        ["External evidence policy", data.acceptedProvenanceContract.externalEvidencePolicy],
      ],
    ),
    "",
    "Owner decision and human exercise-science review are valid provenance sources. External literature can supplement that evidence, but this report does not fabricate citations.",
    "",
    "## Unknown Is Not Poor",
    "",
    table(
      ["Evidence State", "Meaning", "Laboratory Influence"],
      [
        ["ACCEPTED_ANNOTATION", "reviewed contextual phase judgment", "full policy weight"],
        ["REVIEW_QUALIFIED_ANNOTATION", "context match exists but evidence remains qualified", "full, half, or observability-only sensitivity"],
        ["UNKNOWN_NO_MATCH", "no contextual phase evidence applies", "phase term and phase denominator weight omitted"],
        ["CONFLICTING_ANNOTATIONS", "equally specific structured evidence conflicts", "phase term omitted; human review required"],
      ],
    ),
    "",
    "Explicit reviewed `poor` remains a selected annotation with category meaning. `UNKNOWN_NO_MATCH` has no selected category and receives no numeric placeholder. The copied laboratory therefore does not choose a production unknown score and cannot collapse missing evidence into poor evidence.",
    "",
    "## All 90 Current Annotation Ownership Decisions",
    "",
    `Ownership classifications: ${countBy(data.ownershipAudit.map((row) => row.evidenceOwnerClassification))}.`,
    "",
    `Recommended review states: accepted=${data.acceptedAnnotationCount}; needs_review=${data.needsReviewAnnotationCount}; unknown=${data.unknownAnnotationCount}. All 90 current annotations have **MISSING_STRUCTURED_PROVENANCE**. Internal plausibility from the first laboratory is not retroactively presented as accepted evidence.`,
    "",
    table(
      [
        "Exercise",
        "Phase",
        "Current",
        "Current Reason",
        "Training Roles",
        "Sections",
        "Proposed Scope",
        "Evidence Owner",
        "Review",
        "Provenance",
        "Recommended Treatment",
        "Audit Finding",
      ],
      data.ownershipAudit.map((row) => [
        `${row.exerciseId} / ${row.exerciseName}`,
        row.phaseId,
        row.currentSuitability,
        row.currentReason,
        list(row.trainingRoles),
        list(row.sessionSections),
        scopeLabel(row.proposedScope),
        row.evidenceOwnerClassification,
        row.reviewStatus,
        row.provenanceStatus,
        row.recommendedTreatment,
        row.auditFinding,
      ]),
    ),
    "",
    "## Required Multi-Role Review",
    "",
    table(
      ["Exercise", "Phase", "Current Reason", "Proposed Scope", "Owner", "Review", "Finding"],
      data.multiRoleAudit.map((row) => [
        row.exerciseId,
        row.phaseId,
        row.currentReason,
        scopeLabel(row.proposedScope),
        row.evidenceOwnerClassification,
        row.reviewStatus,
        row.auditFinding,
      ]),
    ),
    "",
    "Multi-role exercises cannot inherit one use's phase rationale globally. Activation/preparation judgments are scoped away from hypertrophy accessories; accessory/loadability judgments are scoped away from activation. Mechanical or wrong-owner reasons remain unknown until independent phase evidence is reviewed.",
    "",
    "## Focus Contrast: Phase 3 Scapular Activation",
    "",
    "The request is exactly `requestedRole=activation`, `requestedSection=activation`, and scapular-control/horizontal-pull need. No goal, assessment, pain, continuity, equipment or athlete field changes.",
    "",
    table(
      ["Exercise", "Current Global Evidence", "Current Rank / Phase", "Proposed Scope", "Context Evidence", "Context Rank", "Owner", "Finding"],
      data.scapularActivationFocus.map((row) => [
        row.exerciseId,
        `${row.currentSuitability}: ${row.currentReason}`,
        `${row.currentRank ?? "-"} / ${fixed(row.currentPhaseRaw)}`,
        row.proposedScope,
        `${row.contextualEvidenceStatus}; ${row.selectedAnnotationId ?? "no selected annotation"}`,
        row.contextualRank,
        row.ownerClassification,
        row.finding,
      ]),
    ),
    "",
    "**Should `High-value rear-delt accessory` apply to an activation request? No.** It is accessory/goal/weekly-volume evidence and cannot become activation phase evidence.",
    "",
    "**Should limited accessory loadability reduce activation suitability? No.** Loadability and accessory stimulus belong to dedicated candidate and future weekly/prescription owners; they do not establish activation phase fit.",
    "",
    table(
      ["Question", "Owner"],
      [
        ["Does the exercise truthfully fit activation?", "hard role/section eligibility plus session_intent_fit"],
        ["Does it train the requested muscle?", "hard target truth plus muscle_target_fit"],
        ["Does it express a relevant assessed feature?", "assessment feature target fit"],
        ["Is this legal activation use developmentally appropriate for the phase?", "contextual phase annotation"],
        ["How much accessory volume/loadability is useful this week?", "future Weekly Development Ledger and prescription"],
      ],
    ),
    "",
    "The laboratory reports current and contextual order but does not force a winner. Context correction identifies evidence ownership; it is not a claim that one candidate is physiologically superior.",
    "",
    "## Focus Contrast: Arm And Hypertrophy Accessories",
    "",
    table(
      ["Exercise", "Phase", "Current", "Reason", "Owner", "Review", "Treatment"],
      data.armAccessoryAudit.map((row) => [
        row.exerciseId,
        row.phaseId,
        row.currentSuitability,
        row.currentReason,
        row.evidenceOwnerClassification,
        row.reviewStatus,
        row.recommendedTreatment,
      ]),
    ),
    "",
    "Later-phase `hypertrophy accessory`, arm/delt/hamstring volume and accessory-value language primarily belongs to `CandidateRequest.goal`, legal accessory role/section, muscle target, stimulus and the future Weekly Development Ledger. Phase 3 alone must not overwrite strength, general-fitness, pain-aware-return or movement-quality goals. These reasons remain unknown phase evidence unless a reviewer supplies a distinct developmental phase rationale.",
    "",
    "## Focus Contrast: Horizontal Rows",
    "",
    table(
      ["Exercise", "Phase", "Current", "Reason", "Owner", "Review", "Finding"],
      data.rowAudit.map((row) => [
        row.exerciseId,
        row.phaseId,
        row.currentSuitability,
        row.currentReason,
        row.evidenceOwnerClassification,
        row.reviewStatus,
        row.auditFinding,
      ]),
    ),
    "",
    "Machine and cable rows are Phase 2 excellent but Phase 3 good only because current prose shifts from progression to path/practicality; that does not establish a developmental phase distinction. Chest-supported and one-arm Phase 3 excellent ratings cite continuity, loadability and setup, all of which already have dedicated owners. The four row profiles therefore remain unknown contextual phase evidence pending review, and this report does not impose a universal row ordering.",
    "",
    "## Mechanical Bonus Decision",
    "",
    "Every proposed owner-policy variant is `ANNOTATION_ONLY_NO_MECHANICAL_BONUSES`. The production Phase 1 low-skill/non-high-stability and Phase 3 high-loadability bonuses remain untouched in this task, but the owner-approved future semantic shape removes them because they reread skill, stability, experience, loadability and potentially stimulus facts.",
    "",
    "## Contextual Policy Laboratory",
    "",
    "The deterministic laboratory remains non-production consequence evidence. The owner selected its low-churn annotation-only shape; it does not activate the incompletely curated catalog.",
    "",
    table(
      ["Field", "Status"],
      [
        ["Lab status", data.calibrationLabDesign.status],
        ["Coefficient status", data.calibrationLabDesign.coefficientStatus],
        ["Production behavior", data.calibrationLabDesign.productionBehavior],
        ["Comparison axes", data.calibrationLabDesign.comparisonAxes.join(", ")],
      ],
    ),
    "",
    table(
      ["Policy", "Family", "Phase Weight", "Mechanical Bonuses", "Resolver", "Review Treatment", "Description"],
      data.policies.map((policy) => [
        policy.id,
        policy.family,
        policy.phaseWeight,
        policy.includeMechanicalBonuses ? "yes" : "no",
        policy.useContextResolver ? "contextual" : "legacy global",
        policy.reviewQualifiedTreatment,
        policy.description,
      ]),
    ),
    "",
    "Unknown/conflicting rows omit the phase term and its denominator weight. This is evidence absence, not a chosen unknown coefficient. The moderate map and 0.75 weight are copied sensitivity probes only.",
    "",
    table(
      ["Policy", "Scenarios", "Rank Changes", "Winner Changes", "Ties Created", "Ties Broken", "Unknown Rows", "Review Rows", "Conflict Rows"],
      data.policySummaries.map((row) => [
        row.policyId,
        row.scenarioCount,
        row.rankChanges,
        row.winnerChanges,
        row.tiesCreated,
        row.tiesBroken,
        row.unknownCandidateRows,
        row.reviewQualifiedCandidateRows,
        row.conflictCandidateRows,
      ]),
    ),
    "",
    "Rank movement measures sensitivity to evidence scope and uncertainty handling. It is not evidence that an experimental policy is better.",
    "",
    "### Winner Changes",
    "",
    data.winnerChanges.length === 0
      ? "No tested copied policy changed a winner."
      : table(
          ["Policy", "Scenario", "Phase", "Current Winner", "Experimental Winner", "Current-Winner Evidence", "Experimental-Winner Evidence", "Why"],
          data.winnerChanges.map((row) => [
            row.policyId,
            row.scenarioLabel,
            row.phaseId,
            row.currentWinner,
            row.experimentalWinner,
            row.currentWinnerPhaseEvidence,
            row.experimentalWinnerPhaseEvidence,
            row.whyChanged,
          ]),
        ),
    "",
    "## Controlled Phase Matrix: Winners And Order Effects",
    "",
    table(
      ["Policy", "Scenario", "Phase", "Winner", "Runner-Up", "Current Winner", "Rank Changes", "Ties +/-", "Why"],
      phaseMatrixScenarioRows.map((row) => [
        row.policyId,
        row.scenarioLabel,
        row.phaseId,
        row.winner,
        row.runnerUp,
        row.currentWinner,
        row.rankChanges,
        `${row.tiesCreated}/${row.tiesBroken}`,
        row.whyOrderChanged,
      ]),
    ),
    "",
    "## Continuity, Assessment And Pain Controls",
    "",
    table(
      ["Policy", "Scenario", "Kind", "Winner", "Runner-Up", "Current Winner", "Rank Changes", "Why"],
      interactionScenarioRows.map((row) => [
        row.policyId,
        row.scenarioLabel,
        row.scenarioKind,
        row.winner,
        row.runnerUp,
        row.currentWinner,
        row.rankChanges,
        row.whyOrderChanged,
      ]),
    ),
    "",
    "Productive continuity remains independently scored across all phases. Relevant assessment traces and candidate pain readiness are copied unchanged. Contextual phase evidence cannot make an unresolved pain response executable, legalize a candidate, or activate transition knowledge.",
    "",
    "## Context-Scoped Candidate Detail",
    "",
    "The following rows use Policy C only. They expose every legal candidate's rank, total, selected annotation, scope, review/evidence status, effective phase weight and phase contribution. Current rank/total provide the production comparison.",
    "",
    table(
      ["Scenario", "Exercise", "Rank", "Total", "Current Rank/Total", "Annotation", "Scope", "Specificity", "Review", "Evidence", "Raw", "Eff Weight", "Contribution", "Pain Readiness"],
      contextCandidateRows.map((row) => [
        row.scenarioLabel,
        row.exerciseId,
        row.rank,
        fixed(row.total),
        `${row.currentRank}/${fixed(row.currentTotal)}`,
        row.resolvedAnnotationId ?? "none",
        row.annotationScope,
        row.annotationSpecificity,
        row.annotationReviewStatus,
        row.evidenceStatus,
        fixed(row.phaseRawValue),
        fixed(row.effectivePhaseWeight),
        fixed(row.phaseContribution, 6),
        row.painReadiness,
      ]),
    ),
    "",
    "Context Policy C order explanations:",
    "",
    contextScenarioRows.map((row) => `- ${row.scenarioLabel}: ${row.whyOrderChanged}`).join("\n"),
    "",
    "## Counterfactual Contract Tests",
    "",
    table(
      ["Invariant", "Result"],
      counterfactualEntries.map(([invariant, result]) => [invariant, result ? "PASS" : "FAIL"]),
    ),
    "",
    "These tests use structured annotation fields only. Reason prose and provenance remain visible but do not change category, scope, legality, mechanics, pain readiness or transition behavior.",
    "",
    "## PhaseIntent.primaryGoal Recommendation",
    "",
    data.primaryGoalRecommendation,
    "",
    "The recommended future treatment is **rename to developmental emphasis**, not removal and not behavioral goal authority. A later domain migration should use a dedicated developmental-emphasis type rather than `TrainingGoal`; `CandidateRequest.goal` remains authoritative throughout.",
    "",
    "## Candidate / Composer Boundary",
    "",
    "Candidate Intelligence may resolve and score contextual phase appropriateness for one already-legal exercise. Session Composer will own section cooperation, combinations, sequence and unresolved response execution. Weekly Composer will own volume, frequency, target bands, recovery spacing and capacity allocation. Contextual phase annotations must not absorb those future responsibilities.",
    "",
    "## Human Review Questions",
    "",
    data.humanReviewQuestions.map((question) => `- ${question}`).join("\n"),
    "",
    "## Recommended Implementation Boundary",
    "",
    data.recommendedImplementationBoundary.map((boundary) => `- ${boundary}`).join("\n"),
    "",
    "## Blueprint Maintenance",
    "",
    "A minimal enduring-principle amendment is appropriate: candidate phase evidence must match the exercise's actual requested role/section context, and missing contextual phase evidence is not reviewed poor evidence. Temporary audit decisions, policy matrices, score values, fingerprints and test counts remain in this report only.",
    "",
    "## Final Classification And Remaining P1",
    "",
    `Phase context review: **${data.classification}**.`,
    "",
    "The schema, resolver and selected non-default scorer are implemented. Final annotation approval and explicit activation remain deferred until the catalog has truthful accepted coverage.",
    "",
    "Remaining Candidate Intelligence P1:",
    "",
    data.remainingP1.map((item) => `- ${item}`).join("\n"),
    "",
    "Overall Candidate Intelligence remains **TARGETED_FIXES_REQUIRED_BEFORE_SESSION_COMPOSITION**. Do not start Session Composer or activate contextual production phase scoring from this laboratory.",
    "",
  ].join("\n");
}

export function writePhaseAnnotationContextReview(rootDir = process.cwd()): {
  readonly outputPath: string;
  readonly data: PhaseAnnotationContextReviewData;
} {
  const data = buildPhaseAnnotationContextReviewData();
  const outputPath = join(
    rootDir,
    "docs/training-engine-v2/PHASE_ANNOTATION_CONTEXT_REVIEW.md",
  );
  writeFileSync(outputPath, renderPhaseAnnotationContextReview(data));
  return { outputPath, data };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = writePhaseAnnotationContextReview();
  console.log(`Wrote ${result.outputPath}`);
  console.log(
    JSON.stringify(
      {
        classification: result.data.classification,
        productionFingerprintMatches: result.data.productionFingerprintMatches,
        auditRows: result.data.ownershipAudit.length,
        proposedAnnotations: result.data.proposedAnnotations.length,
        controlledScenarios: result.data.controlledScenarios.length,
        policyVariants: result.data.policies.length,
        candidateRows: result.data.candidateRows.length,
        winnerChanges: result.data.winnerChanges.length,
        acceptedAnnotations: result.data.acceptedAnnotationCount,
        needsReviewAnnotations: result.data.needsReviewAnnotationCount,
        unknownAnnotations: result.data.unknownAnnotationCount,
        contextualFingerprint: result.data.contextualFingerprint,
      },
      null,
      2,
    ),
  );
}
