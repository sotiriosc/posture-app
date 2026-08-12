import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CANDIDATE_SCORE_COMPONENTS,
  CONTROLLED_CANDIDATE_SCENARIOS,
  DEFAULT_CANDIDATE_SCORING_WEIGHTS,
  EMPTY_TRAINING_HISTORY,
  FULL_GYM_EQUIPMENT,
  GOLDEN_PERSONAS,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  THREE_PHASE_FOUNDATION,
  buildExerciseTransitionTraces,
  deriveAlignmentPriorities,
  legacyPhaseFitComponent,
  runCandidateRankingLab,
  type AssessmentState,
  type CandidateNeed,
  type CandidatePainExecutionReadiness,
  type CandidateRankingResult,
  type CandidateRequest,
  type CandidateScoringWeights,
  type CandidateScoreComponent,
  type ContinuityContext,
  type ExerciseDefinition,
  type ExperienceLevel,
  type PainAndInjuryState,
  type PhaseId,
  type RankedCandidate,
  type ScoreComponent,
  type TrainingGoal,
  type TrainingHistory,
} from "../../src";
import { component } from "../../src/candidate/scoring/utils";

export const PHASE_CALIBRATION_FIXED_AS_OF = "2026-08-10T00:00:00.000Z";
export const EXPECTED_PRODUCTION_RANKING_FINGERPRINT =
  "237de4c80d45c1da2bd60b88e624ccd5ba08d32a9f58d36241e52d1ca47fc118";

const PHASE_IDS: readonly PhaseId[] = ["phase_1", "phase_2", "phase_3"];
const GOALS: readonly TrainingGoal[] = [
  "hypertrophy",
  "strength",
  "posture_and_movement_quality",
  "general_fitness",
  "pain_aware_return",
  "conditioning",
];
const EXPERIENCES: readonly ExperienceLevel[] = [
  "novice",
  "beginner",
  "intermediate",
  "advanced",
];

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

const LEGACY_COMPONENTS = CANDIDATE_SCORE_COMPONENTS.map((candidate) =>
  candidate.id === "phase_fit" ? legacyPhaseFitComponent : candidate,
);
const LEGACY_OPTIONS = { scoreComponents: LEGACY_COMPONENTS } as const;

export type FieldConsumptionStatus = "UNUSED" | "PARTIALLY_USED" | "FULLY_USED";
export type OverlapClassification =
  | "INTENTIONAL_DISTINCT_SIGNAL"
  | "POTENTIAL_DOUBLE_COUNT"
  | "ACTUAL_DOUBLE_COUNT"
  | "UNUSED_SEMANTIC"
  | "NOT_APPLICABLE";
export type PhaseAnnotationClassification =
  | "WELL_JUSTIFIED"
  | "PLAUSIBLE_NEEDS_REVIEW"
  | "ARBITRARY_OR_UNDERSPECIFIED"
  | "CONTRADICTORY";
export type PhaseAuditClassification =
  | "PHASE_POLICY_READY_FOR_OWNER_DECISION"
  | "PHASE_CONTRACT_FIXES_REQUIRED_BEFORE_CALIBRATION"
  | "PHASE_ARCHITECTURE_NOT_READY";

export interface PhaseFieldConsumptionRow {
  readonly inputField: string;
  readonly giver: string;
  readonly currentReceiver: string;
  readonly currentOutput: string;
  readonly behavioralEffect: string;
  readonly traceVisibility: string;
  readonly status: FieldConsumptionStatus;
  readonly futureOwner: string;
}

export interface PhaseOverlapAuditRow {
  readonly comparedFacts: string;
  readonly classification: OverlapClassification;
  readonly finding: string;
}

export interface PhaseCatalogAuditRow {
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly trainingRoles: string;
  readonly movementRoles: string;
  readonly sectionSuitability: string;
  readonly phase1: string;
  readonly phase2: string;
  readonly phase3: string;
  readonly loadability: string;
  readonly skill: string;
  readonly stability: string;
  readonly coordination: string;
  readonly progressionAxes: string;
  readonly continuityPotential: string;
  readonly assessmentFeatureRole: string;
  readonly provenanceReviewStatus: string;
  readonly classification: PhaseAnnotationClassification;
  readonly auditReason: string;
}

export interface PhaseCandidateMatrixRow {
  readonly requestId: string;
  readonly need: string;
  readonly phaseId: PhaseId;
  readonly goal: TrainingGoal;
  readonly candidateId: string;
  readonly rank: number;
  readonly total: number;
  readonly phaseFit: number;
  readonly goalFit: number;
  readonly experienceFit: number;
  readonly skillFit: number;
  readonly stabilityFit: number;
  readonly loadability: number;
  readonly stimulusPotential: number;
  readonly progressionValue: number;
  readonly continuityValue: number;
  readonly assessmentFit: number;
  readonly painSuitability: number;
  readonly jointCost: number;
}

export interface PhaseRejectionMatrixRow {
  readonly requestId: string;
  readonly need: string;
  readonly phaseId: PhaseId;
  readonly exerciseId: string;
  readonly reasonCodes: readonly string[];
}

export interface PhaseOnlySummaryRow {
  readonly requestId: string;
  readonly need: string;
  readonly phaseId: PhaseId;
  readonly goal: TrainingGoal;
  readonly winner: string | null;
  readonly runnerUp: string | null;
  readonly legalCandidateIds: readonly string[];
}

export interface GoalMatrixRow {
  readonly phaseId: PhaseId;
  readonly requestGoal: TrainingGoal;
  readonly phasePrimaryGoal: TrainingGoal;
  readonly winner: string | null;
  readonly runnerUp: string | null;
  readonly winnerGoalFit: number | null;
  readonly legalCandidateIds: readonly string[];
}

export interface ExperienceMatrixRow {
  readonly phaseId: PhaseId;
  readonly experience: ExperienceLevel;
  readonly winner: string | null;
  readonly runnerUp: string | null;
  readonly legalCandidateIds: readonly string[];
  readonly freeWeightCandidateIds: readonly string[];
  readonly winnerExperienceFit: number | null;
  readonly winnerPhaseFit: number | null;
}

export interface ContinuityMatrixRow {
  readonly state: string;
  readonly phaseId: PhaseId;
  readonly winner: string | null;
  readonly currentExerciseRank: number | null;
  readonly currentExerciseTotal: number | null;
  readonly currentPhaseFit: number | null;
  readonly currentContinuityValue: number | null;
  readonly currentContinuityReasonCode: string | null;
  readonly currentProgressionValue: number | null;
  readonly transitionAutomaticSelectionEffects: readonly string[];
}

export interface PhaseInteractionRow {
  readonly scenario: string;
  readonly phaseId: PhaseId;
  readonly winner: string | null;
  readonly oneArmRowRank: number | null;
  readonly oneArmPhaseFit: number | null;
  readonly oneArmAssessmentFit: number | null;
  readonly oneArmPainSuitability: number | null;
  readonly oneArmReadiness: CandidatePainExecutionReadiness | "hard_rejected" | null;
  readonly hardRejectedIds: readonly string[];
  readonly assessmentTraceCount: number;
}

export interface PhasePolicyDefinition {
  readonly id: string;
  readonly family: "CURRENT" | "ANNOTATION_ONLY" | "NO_PHASE" | "WEIGHT" | "CATEGORICAL_GAP";
  readonly label: string;
  readonly description: string;
  readonly phaseWeight: number | null;
  readonly categoryMap: Readonly<Record<"excellent" | "good" | "possible" | "unspecified", number>> | null;
  readonly includeMechanicalBonuses: boolean;
}

export interface PhasePolicySummaryRow {
  readonly policyId: string;
  readonly rankChanges: number;
  readonly winnerChanges: number;
  readonly tiesCreated: number;
  readonly tiesBroken: number;
  readonly affectedCandidateIds: readonly string[];
}

export interface PhaseWinnerChangeRow {
  readonly policyId: string;
  readonly requestId: string;
  readonly need: string;
  readonly phaseId: PhaseId;
  readonly currentWinner: string;
  readonly experimentalWinner: string;
  readonly currentWinnerPhaseFit: number;
  readonly experimentalWinnerPhaseFit: number;
  readonly scoreMarginBefore: number;
  readonly scoreMarginAfter: number;
}

export interface PhaseRankThresholdRow {
  readonly requestId: string;
  readonly need: string;
  readonly phaseId: PhaseId;
  readonly nearestChangedWeight: number;
  readonly distanceFromCurrent: number;
  readonly currentWinner: string;
  readonly changedWinner: string;
}

export interface CoachingReviewRow {
  readonly scenario: string;
  readonly enduringGoal: TrainingGoal;
  readonly experience: ExperienceLevel;
  readonly phaseId: PhaseId;
  readonly currentWinner: string;
  readonly experimentalWinner: string;
  readonly whyCurrentWinnerWon: string;
  readonly whyExperimentalWinnerWon: string;
  readonly phaseComponentEffect: string;
  readonly otherComponentEffects: string;
  readonly continuityEffect: string;
  readonly assessmentEffect: string;
  readonly painReadiness: string;
  readonly verdict: "GOOD" | "PLAUSIBLE_NEEDS_REVIEW" | "QUESTIONABLE" | "WRONG";
}

export interface PhaseCounterfactualProof {
  readonly differentAnnotationOnlyChangesPhaseFit: boolean;
  readonly eligibilityUnchanged: boolean;
  readonly painReadinessUnchanged: boolean;
  readonly progressionAndTransitionUnchanged: boolean;
  readonly proseReasonDoesNotChangeScoring: boolean;
  readonly unspecifiedPhaseFit: number;
  readonly unspecifiedRemainsExplicit: boolean;
}

export interface CarrySupportAudit {
  readonly movementRoleExists: boolean;
  readonly referenceCarryExerciseIds: readonly string[];
  readonly scenarioIdsRequestingCarry: readonly string[];
  readonly sessionOrWeeklyAllocationExists: boolean;
  readonly finding: string;
}

export interface PhaseSuitabilityCalibrationData {
  readonly classification: PhaseAuditClassification;
  readonly fixedAsOf: string;
  readonly productionRankingFingerprint: string;
  readonly expectedProductionRankingFingerprint: string;
  readonly productionFingerprintMatches: boolean;
  readonly currentMath: {
    readonly excellent: number;
    readonly good: number;
    readonly possible: number;
    readonly unspecified: number;
    readonly phase3HighLoadabilityBonus: number;
    readonly phase1LowSkillStabilityBonus: number;
    readonly configuredWeight: number;
    readonly emittedTotalWeight: number;
    readonly normalizedWeight: number;
    readonly maximumRawPhaseFit: number;
    readonly maximumAggregateContribution: number;
    readonly maximumAggregateSpread: number;
  };
  readonly fieldConsumption: readonly PhaseFieldConsumptionRow[];
  readonly overlapAudit: readonly PhaseOverlapAuditRow[];
  readonly catalogAudit: readonly PhaseCatalogAuditRow[];
  readonly phaseOnlySummaries: readonly PhaseOnlySummaryRow[];
  readonly phaseCandidateMatrix: readonly PhaseCandidateMatrixRow[];
  readonly phaseRejectionMatrix: readonly PhaseRejectionMatrixRow[];
  readonly goalMatrix: readonly GoalMatrixRow[];
  readonly experienceMatrix: readonly ExperienceMatrixRow[];
  readonly continuityMatrix: readonly ContinuityMatrixRow[];
  readonly interactionMatrix: readonly PhaseInteractionRow[];
  readonly policies: readonly PhasePolicyDefinition[];
  readonly policySummaries: readonly PhasePolicySummaryRow[];
  readonly winnerChanges: readonly PhaseWinnerChangeRow[];
  readonly rankThresholds: readonly PhaseRankThresholdRow[];
  readonly mechanicalBonusOnlyMovements: readonly string[];
  readonly annotationRetainedMovements: readonly string[];
  readonly coachingReview: readonly CoachingReviewRow[];
  readonly counterfactualProof: PhaseCounterfactualProof;
  readonly carryAudit: CarrySupportAudit;
  readonly unresolvedExerciseScienceQuestions: readonly string[];
  readonly recommendedPolicyShape: readonly string[];
  readonly remainingP1: readonly string[];
  readonly experimentalFingerprint: string;
}

function phase(id: PhaseId) {
  const found = THREE_PHASE_FOUNDATION.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing phase ${id}.`);
  }
  return found;
}

function persona(id: string) {
  const found = GOLDEN_PERSONAS.find((candidate) => candidate.fixtureId === id);
  if (!found) {
    throw new Error(`Missing persona ${id}.`);
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

function need(input: CandidateNeed): CandidateNeed {
  return input;
}

const PHASE_NEEDS = [
  {
    label: "horizontal push main",
    goal: "strength",
    need: need({
      id: "phase-lab-horizontal-push-main",
      whyNeeded: "Controlled horizontal-push main candidate comparison.",
      requestedRole: "primary_strength",
      requestedSection: "main",
      targetMovementRoles: ["horizontal_push"],
      targetMuscles: ["chest", "triceps"],
      targetBodyRegions: ["shoulder", "elbow"],
      goal: "strength",
    }),
  },
  {
    label: "horizontal pull main",
    goal: "strength",
    need: need({
      id: "phase-lab-horizontal-pull-main",
      whyNeeded: "Controlled horizontal-pull main candidate comparison.",
      requestedRole: "primary_strength",
      requestedSection: "main",
      targetMovementRoles: ["horizontal_pull"],
      targetMuscles: ["mid_back", "lats"],
      targetBodyRegions: ["shoulder", "thoracic_spine"],
      goal: "strength",
    }),
  },
  {
    label: "vertical push secondary",
    goal: "strength",
    need: need({
      id: "phase-lab-vertical-push-secondary",
      whyNeeded: "Controlled vertical-push secondary candidate comparison.",
      requestedRole: "secondary_strength",
      requestedSection: "accessory",
      targetMovementRoles: ["vertical_push"],
      targetMuscles: ["front_delts", "triceps"],
      targetBodyRegions: ["shoulder", "elbow"],
      goal: "strength",
    }),
  },
  {
    label: "vertical pull secondary",
    goal: "strength",
    need: need({
      id: "phase-lab-vertical-pull-secondary",
      whyNeeded: "Controlled vertical-pull secondary candidate comparison.",
      requestedRole: "secondary_strength",
      requestedSection: "accessory",
      targetMovementRoles: ["vertical_pull"],
      targetMuscles: ["lats", "biceps"],
      targetBodyRegions: ["shoulder", "elbow"],
      goal: "strength",
    }),
  },
  {
    label: "squat main",
    goal: "strength",
    need: need({
      id: "phase-lab-squat-main",
      whyNeeded: "Controlled squat main candidate comparison.",
      requestedRole: "primary_strength",
      requestedSection: "main",
      targetMovementRoles: ["squat"],
      targetMuscles: ["quads", "glutes"],
      targetBodyRegions: ["knee", "hip", "ankle"],
      goal: "strength",
    }),
  },
  {
    label: "hinge secondary",
    goal: "strength",
    need: need({
      id: "phase-lab-hinge-secondary",
      whyNeeded: "Controlled hinge secondary candidate comparison.",
      requestedRole: "secondary_strength",
      requestedSection: "accessory",
      targetMovementRoles: ["hinge"],
      targetMuscles: ["hamstrings", "glutes"],
      targetBodyRegions: ["hip", "lumbar_spine"],
      goal: "strength",
    }),
  },
  {
    label: "single-leg accessory",
    goal: "hypertrophy",
    need: need({
      id: "phase-lab-single-leg-accessory",
      whyNeeded: "Controlled single-leg accessory candidate comparison.",
      requestedRole: "hypertrophy_accessory",
      requestedSection: "accessory",
      targetMovementRoles: ["single_leg", "squat"],
      targetMuscles: ["quads", "glutes"],
      targetBodyRegions: ["knee", "hip", "ankle"],
      goal: "hypertrophy",
    }),
  },
  {
    label: "trunk activation",
    goal: "posture_and_movement_quality",
    need: need({
      id: "phase-lab-trunk-activation",
      whyNeeded: "Controlled trunk activation candidate comparison.",
      requestedRole: "activation",
      requestedSection: "activation",
      targetMovementRoles: ["anti_extension_core", "anti_rotation_core"],
      targetMuscles: ["trunk"],
      targetBodyRegions: ["lumbar_spine", "pelvis"],
      goal: "posture_and_movement_quality",
    }),
  },
  {
    label: "scapular activation",
    goal: "posture_and_movement_quality",
    need: need({
      id: "phase-lab-scapular-activation",
      whyNeeded: "Controlled scapular activation candidate comparison.",
      requestedRole: "activation",
      requestedSection: "activation",
      targetMovementRoles: ["scapular_control", "horizontal_pull"],
      targetMuscles: ["serratus", "rear_delts", "upper_back", "rotator_cuff"],
      targetBodyRegions: ["shoulder", "thoracic_spine"],
      goal: "posture_and_movement_quality",
    }),
  },
  {
    label: "rear-delt accessory",
    goal: "hypertrophy",
    need: need({
      id: "phase-lab-rear-delt-accessory",
      whyNeeded: "Controlled rear-delt accessory candidate comparison.",
      requestedRole: "hypertrophy_accessory",
      requestedSection: "accessory",
      targetMovementRoles: ["horizontal_pull", "scapular_control"],
      targetMuscles: ["rear_delts", "upper_back"],
      targetBodyRegions: ["shoulder", "thoracic_spine"],
      goal: "hypertrophy",
    }),
  },
] as const satisfies readonly {
  readonly label: string;
  readonly goal: TrainingGoal;
  readonly need: CandidateNeed;
}[];

function makeRequest(input: {
  readonly id: string;
  readonly phaseId: PhaseId;
  readonly goal: TrainingGoal;
  readonly candidateNeed: CandidateNeed;
  readonly experience?: ExperienceLevel;
  readonly assessment?: AssessmentState;
  readonly painAndInjury?: PainAndInjuryState;
  readonly history?: TrainingHistory;
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
      id: `phase-lab-${input.experience ?? base.athlete.experience}`,
      experience: input.experience ?? base.athlete.experience,
      primaryGoal: input.goal,
    },
    goal: input.goal,
    phase: phase(input.phaseId),
    need: {
      ...input.candidateNeed,
      goal: input.goal,
    },
    assessment,
    alignmentPriorities: deriveAlignmentPriorities(assessment).priorities,
    painAndInjury: input.painAndInjury ?? NO_PAIN_OR_INJURY,
    equipment: FULL_GYM_EQUIPMENT,
    history: input.history ?? history(),
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

function score(candidate: RankedCandidate, id: string): ScoreComponent {
  const found = candidate.components.find((candidateComponent) => candidateComponent.id === id);
  if (!found) {
    throw new Error(`Missing ${id} for ${candidate.exercise.id}.`);
  }
  return found;
}

function ranked(result: CandidateRankingResult, exerciseId: string): RankedCandidate | undefined {
  return result.rankedCandidates.find((candidate) => candidate.exercise.id === exerciseId);
}

function winner(result: CandidateRankingResult): RankedCandidate | undefined {
  return result.rankedCandidates[0];
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

const CURRENT_CATEGORY_MAP = {
  excellent: 8.8,
  good: 7.8,
  possible: 6.2,
  unspecified: 5.5,
} as const;

const GENTLE_CATEGORY_MAP = {
  excellent: 8.0,
  good: 7.6,
  possible: 7.2,
  unspecified: 6.8,
} as const;

const MODERATE_CATEGORY_MAP = {
  excellent: 8.4,
  good: 7.7,
  possible: 6.8,
  unspecified: 6.2,
} as const;

export const PHASE_CALIBRATION_POLICIES: readonly PhasePolicyDefinition[] = [
  {
    id: "A_CURRENT",
    family: "CURRENT",
    label: "Current production phase component",
    description: "Current categories, current Phase 1/3 mechanical bonuses and weight 1.00.",
    phaseWeight: 1,
    categoryMap: CURRENT_CATEGORY_MAP,
    includeMechanicalBonuses: true,
  },
  {
    id: "B_ANNOTATION_ONLY",
    family: "ANNOTATION_ONLY",
    label: "Annotation only",
    description: "Current category map with both explicit mechanical bonuses removed.",
    phaseWeight: 1,
    categoryMap: CURRENT_CATEGORY_MAP,
    includeMechanicalBonuses: false,
  },
  {
    id: "C_NO_PHASE_COMPONENT",
    family: "NO_PHASE",
    label: "No phase component",
    description: "The copied experimental component array omits phase_fit.",
    phaseWeight: null,
    categoryMap: null,
    includeMechanicalBonuses: false,
  },
  ...([0.25, 0.5, 0.75, 1, 1.25] as const).map(
    (weight): PhasePolicyDefinition => ({
      id: `D_WEIGHT_${String(weight).replace(".", "")}`,
      family: "WEIGHT",
      label: `Phase weight ${weight.toFixed(2)}`,
      description: "Current component shape with only the phase_suitability family weight changed.",
      phaseWeight: weight,
      categoryMap: CURRENT_CATEGORY_MAP,
      includeMechanicalBonuses: true,
    }),
  ),
  {
    id: "E_GENTLE_GAP",
    family: "CATEGORICAL_GAP",
    label: "Gentle categorical gap",
    description: "Ordered 8.0/7.6/7.2/6.8 mapping with current mechanical bonuses.",
    phaseWeight: 1,
    categoryMap: GENTLE_CATEGORY_MAP,
    includeMechanicalBonuses: true,
  },
  {
    id: "E_MODERATE_GAP",
    family: "CATEGORICAL_GAP",
    label: "Moderate categorical gap",
    description: "Ordered 8.4/7.7/6.8/6.2 mapping with current mechanical bonuses.",
    phaseWeight: 1,
    categoryMap: MODERATE_CATEGORY_MAP,
    includeMechanicalBonuses: true,
  },
  {
    id: "E_CURRENT_GAP",
    family: "CATEGORICAL_GAP",
    label: "Current categorical gap control",
    description: "Current 8.8/7.8/6.2/5.5 mapping with current mechanical bonuses.",
    phaseWeight: 1,
    categoryMap: CURRENT_CATEGORY_MAP,
    includeMechanicalBonuses: true,
  },
];

function experimentalPhaseComponent(
  categoryMap: NonNullable<PhasePolicyDefinition["categoryMap"]>,
  includeMechanicalBonuses: boolean,
): CandidateScoreComponent {
  return {
    id: "phase_fit",
    score({ request, exercise }) {
      const suitability = exercise.phaseSuitability[request.phase.id]?.suitability;
      const category =
        suitability === "excellent" || suitability === "good" || suitability === "possible"
          ? suitability
          : "unspecified";
      const base = categoryMap[category];
      const phase3Stimulus =
        includeMechanicalBonuses &&
        request.phase.id === "phase_3" &&
        exercise.loading.loadability === "high"
          ? 0.8
          : 0;
      const phase1Control =
        includeMechanicalBonuses &&
        request.phase.id === "phase_1" &&
        exercise.loading.skillDemand === "low" &&
        exercise.loading.stabilityDemand !== "high"
          ? 0.5
          : 0;

      return component({
        id: "phase_fit",
        family: "phase_suitability",
        value: base + phase3Stimulus + phase1Control,
        reasonCode: "PHASE_DEVELOPMENT_FIT",
        reason: `Laboratory copy: ${exercise.name} is ${suitability ?? "unspecified"} for ${request.phase.id}.`,
        source: "phase",
      });
    },
  };
}

function policyOptions(policy: PhasePolicyDefinition): {
  readonly scoreComponents?: readonly CandidateScoreComponent[];
  readonly weights?: CandidateScoringWeights;
} {
  if (policy.family === "CURRENT") {
    return LEGACY_OPTIONS;
  }
  if (policy.family === "NO_PHASE") {
    return {
      scoreComponents: CANDIDATE_SCORE_COMPONENTS.filter((candidate) => candidate.id !== "phase_fit"),
    };
  }

  const copiedComponents = CANDIDATE_SCORE_COMPONENTS.map((candidate) =>
    candidate.id === "phase_fit"
      ? experimentalPhaseComponent(
          policy.categoryMap ?? CURRENT_CATEGORY_MAP,
          policy.includeMechanicalBonuses,
        )
      : candidate,
  );

  return {
    scoreComponents: copiedComponents,
    weights:
      policy.phaseWeight === null
        ? undefined
        : {
            ...DEFAULT_CANDIDATE_SCORING_WEIGHTS,
            phase_suitability: policy.phaseWeight,
          },
  };
}

export const PHASE_FIELD_CONSUMPTION: readonly PhaseFieldConsumptionRow[] = [
  {
    inputField: "PhaseIntent.id",
    giver: "THREE_PHASE_FOUNDATION -> CandidateRequest.phase",
    currentReceiver: "request interpreter, phaseFitComponent, assessment capability traces",
    currentOutput: "phase id, annotation lookup, Phase 1/3 bonus branch, capability-prior label",
    behavioralEffect: "selects the active phase annotation and phase-specific copied production branches",
    traceVisibility: "interpretedContext.phaseId and phase_fit reason; assessment evidence names the phase",
    status: "FULLY_USED",
    futureOwner: "Candidate Intelligence plus Session/Weekly Composer phase coherence",
  },
  {
    inputField: "PhaseIntent.name",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "none",
    traceVisibility: "absent from Candidate Intelligence output",
    status: "UNUSED",
    futureOwner: "adapter display and phase-plan explanation",
  },
  {
    inputField: "PhaseIntent.primaryGoal",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "none; goalFitComponent reads CandidateRequest.goal",
    currentOutput: "none",
    behavioralEffect: "does not overwrite or alter the enduring user goal",
    traceVisibility: "present only inside the serialized phase object on the request",
    status: "UNUSED",
    futureOwner: "phase-plan intent without replacing CandidateRequest.goal",
  },
  {
    inputField: "PhaseIntent.developedQualities",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "none at candidate scope",
    traceVisibility: "request input only",
    status: "UNUSED",
    futureOwner: "Session Composer, Weekly Composer and phase advancement",
  },
  {
    inputField: "PhaseIntent.priorityMuscles",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "none; eligibility and muscle_target_fit read CandidateNeed.targetMuscles",
    currentOutput: "none",
    behavioralEffect: "does not add muscle truth or duplicate request target-muscle scoring",
    traceVisibility: "request input only",
    status: "UNUSED",
    futureOwner: "Weekly Development Ledger target-band adjustment",
  },
  {
    inputField: "capabilityExpectation.movementRoles",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "does not legalize, reject or score a movement role",
    traceVisibility: "request input only",
    status: "UNUSED",
    futureOwner: "Session/Weekly Composer phase coverage",
  },
  {
    inputField: "capabilityExpectation.control",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "athleteCapability, featureDevelopment, phaseIntentDemandForDimension",
    currentOutput: "weak phase capability prior and phase-intent demand",
    behavioralEffect: "can change assessment/alignment influence when a relevant assessment exists",
    traceVisibility: "assessment demand/capability evidence",
    status: "PARTIALLY_USED",
    futureOwner: "candidate assessment context plus session prescription and advancement evidence",
  },
  {
    inputField: "capabilityExpectation.stability",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "stabilityFitComponent, athleteCapability, featureDevelopment",
    currentOutput: "stability target and weak phase capability prior",
    behavioralEffect: "changes stability_fit and can change bounded assessment/alignment influence",
    traceVisibility: "stability_fit reason and assessment capability evidence",
    status: "PARTIALLY_USED",
    futureOwner: "candidate fit, prescription and advancement evidence",
  },
  {
    inputField: "capabilityExpectation.coordination",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "athleteCapability and featureDevelopment",
    currentOutput: "weak coordination/scapular capability prior",
    behavioralEffect: "can change relevant assessment demand/capability reasoning",
    traceVisibility: "assessment capability evidence",
    status: "PARTIALLY_USED",
    futureOwner: "candidate fit, prescription and advancement evidence",
  },
  {
    inputField: "capabilityExpectation.technicalComplexity",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "does not alter skill_fit or eligibility",
    traceVisibility: "request input only",
    status: "UNUSED",
    futureOwner: "reviewed candidate challenge and prescription progression",
  },
  {
    inputField: "progressionIntent.loading",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "loadabilityComponent, phaseIntentDemandForDimension",
    currentOutput: "phase loading target and assessment phase-intent demand",
    behavioralEffect: "changes loadability and relevant assessment relationship values",
    traceVisibility: "loadability reason and assessment demand evidence",
    status: "PARTIALLY_USED",
    futureOwner: "candidate fit, prescription and weekly loading distribution",
  },
  {
    inputField: "progressionIntent.effort",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "does not affect candidate ranking",
    traceVisibility: "request input only",
    status: "UNUSED",
    futureOwner: "prescription and longitudinal adaptation",
  },
  {
    inputField: "progressionIntent.preferredProgressionAxes",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "progressionValueComponent",
    currentOutput: "count of matching same-exercise progression axes",
    behavioralEffect: "adds up to 2.2 raw progression_value without selecting a replacement",
    traceVisibility: "progression_value reason reports the match count",
    status: "PARTIALLY_USED",
    futureOwner: "same-exercise prescription progression",
  },
  {
    inputField: "progressionIntent.exerciseContinuityDefault",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "Phase 3 review_for_phase_fit creates no replacement pressure",
    traceVisibility: "request input only",
    status: "UNUSED",
    futureOwner: "reviewed composition/transition policy with KEEP + PROGRESS precedence",
  },
  {
    inputField: "advancementCriteria[].description",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "none",
    traceVisibility: "request input only",
    status: "UNUSED",
    futureOwner: "future phase advancement evaluator",
  },
  {
    inputField: "advancementCriteria[].evidenceSignals",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "none",
    traceVisibility: "request input only",
    status: "UNUSED",
    futureOwner: "future evidence-based phase advancement evaluator",
  },
  {
    inputField: "advancementCriteria[].blockingSignals",
    giver: "THREE_PHASE_FOUNDATION",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "none",
    traceVisibility: "request input only",
    status: "UNUSED",
    futureOwner: "future evidence-based phase advancement evaluator",
  },
  {
    inputField: "PhaseState.currentPhaseId",
    giver: "CurrentTrainingState",
    currentReceiver: "foundation validation only; CandidateRequest receives PhaseIntent directly",
    currentOutput: "valid/invalid known phase id",
    behavioralEffect: "does not enter Candidate Intelligence ranking",
    traceVisibility: "validation result, not candidate trace",
    status: "PARTIALLY_USED",
    futureOwner: "input adapter and phase-state/intent resolver",
  },
  {
    inputField: "PhaseState.weekInPhase",
    giver: "CurrentTrainingState",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "calendar time does not alter ranking or advance phase",
    traceVisibility: "absent",
    status: "UNUSED",
    futureOwner: "phase advancement context, never sole advancement authority",
  },
  {
    inputField: "PhaseState.metCriterionIds",
    giver: "CurrentTrainingState",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "none",
    traceVisibility: "absent",
    status: "UNUSED",
    futureOwner: "future phase advancement evaluator",
  },
  {
    inputField: "PhaseState.blockedCriterionIds",
    giver: "CurrentTrainingState",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "none",
    traceVisibility: "absent",
    status: "UNUSED",
    futureOwner: "future phase advancement evaluator",
  },
  {
    inputField: "ExerciseDefinition.phaseSuitability[phase].suitability",
    giver: "reference exercise curator",
    currentReceiver: "phaseFitComponent",
    currentOutput: "categorical base 8.8/7.8/6.2 or 5.5 fallback",
    behavioralEffect: "changes phase_fit for a legal candidate; never changes eligibility",
    traceVisibility: "phase_fit reason names the active category",
    status: "FULLY_USED",
    futureOwner: "reviewed Candidate Intelligence phase preference",
  },
  {
    inputField: "ExerciseDefinition.phaseSuitability[phase].reason",
    giver: "reference exercise curator",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "prose changes do not alter scoring",
    traceVisibility: "not copied into phase_fit reason or DecisionTrace",
    status: "UNUSED",
    futureOwner: "curation explanation and reviewer-facing provenance",
  },
  {
    inputField: "ExerciseDefinition.phaseSuitability provenance/review status",
    giver: "not represented in current schema",
    currentReceiver: "none",
    currentOutput: "none",
    behavioralEffect: "all categories execute without a phase-specific evidence-quality qualifier",
    traceVisibility: "absent",
    status: "UNUSED",
    futureOwner: "future reviewed phase-annotation contract",
  },
];

export const PHASE_OVERLAP_AUDIT: readonly PhaseOverlapAuditRow[] = [
  {
    comparedFacts: "phase_fit Phase 3 high-loadability bonus vs loadability",
    classification: "ACTUAL_DOUBLE_COUNT",
    finding: "Both components read exercise.loading.loadability; high loadability receives its normal loadability value and an extra +0.8 raw phase_fit in Phase 3.",
  },
  {
    comparedFacts: "phase_fit Phase 3 high-loadability bonus vs stimulus_potential",
    classification: "POTENTIAL_DOUBLE_COUNT",
    finding: "stimulus_potential reads loadingPotential rather than loadability, but the two catalog fields and phase rationale often express the same productive-stimulus story.",
  },
  {
    comparedFacts: "phase_fit Phase 1 low-skill bonus vs skill_fit",
    classification: "ACTUAL_DOUBLE_COUNT",
    finding: "The exact loading.skillDemand fact affects skill_fit and directly adds +0.5 phase_fit when the Phase 1 branch also passes stability.",
  },
  {
    comparedFacts: "phase_fit Phase 1 stability condition vs stability_fit",
    classification: "ACTUAL_DOUBLE_COUNT",
    finding: "The exact loading.stabilityDemand fact gates the Phase 1 bonus and is independently compared with phase capability in stability_fit.",
  },
  {
    comparedFacts: "phase_fit Phase 1 skill condition vs experience_fit",
    classification: "POTENTIAL_DOUBLE_COUNT",
    finding: "experience_fit averages skill and coordination demand, so the Phase 1 skill branch can reinforce an already favorable athlete-demand comparison.",
  },
  {
    comparedFacts: "curated phaseSuitability vs loadability/support/skill/stability/progression facts",
    classification: "POTENTIAL_DOUBLE_COUNT",
    finding: "Many annotation reasons explicitly cite load, support, control, setup or progression while dedicated components score those structured fields; prose is non-executable, but the curated category may encode the same judgment.",
  },
  {
    comparedFacts: "progressionIntent.preferredProgressionAxes vs progression_value",
    classification: "INTENTIONAL_DISTINCT_SIGNAL",
    finding: "This is the explicit receiver for same-exercise phase progression runway and does not create hidden replacement pressure.",
  },
  {
    comparedFacts: "PhaseIntent.priorityMuscles vs CandidateNeed.targetMuscles/muscle_target_fit",
    classification: "UNUSED_SEMANTIC",
    finding: "Phase priority muscles are not consumed, so request target-muscle truth remains authoritative and is not currently double counted.",
  },
  {
    comparedFacts: "PhaseIntent.primaryGoal vs CandidateRequest.goal/goal_fit",
    classification: "UNUSED_SEMANTIC",
    finding: "Phase primaryGoal has no behavioral receiver; CandidateRequest.goal remains the scoring authority, avoiding silent goal replacement but leaving conceptual naming ambiguity.",
  },
  {
    comparedFacts: "phase_fit vs assessment_fit",
    classification: "INTENTIONAL_DISTINCT_SIGNAL",
    finding: "phase_fit scores candidate phase preference; relevant assessment traces may separately use phase capability priors to judge developmental context.",
  },
  {
    comparedFacts: "phase_fit vs goal_fit and muscle_target_fit",
    classification: "INTENTIONAL_DISTINCT_SIGNAL",
    finding: "The enduring request goal and requested muscles remain separate authorities; phase category does not create either truth.",
  },
  {
    comparedFacts: "phase change vs transition relationships",
    classification: "NOT_APPLICABLE",
    finding: "Transition relationships are observational and never read phase; phase movement cannot activate automatic replacement.",
  },
];

const PHASE_ANNOTATION_REVIEWS: Readonly<
  Record<string, { readonly classification: PhaseAnnotationClassification; readonly reason: string }>
> = {
  "ninety-ninety-breathing": { classification: "WELL_JUSTIFIED", reason: "Control/preparation emphasis and declining main-stimulus relevance are internally coherent." },
  "serratus-wall-slide": { classification: "WELL_JUSTIFIED", reason: "Control-first preparation role and limited loading support the ordered annotations." },
  "dead-bug": { classification: "WELL_JUSTIFIED", reason: "Control emphasis and bounded progression runway support strong early-phase fit." },
  "push-up": { classification: "WELL_JUSTIFIED", reason: "Prerequisite/control needs and moderate load ceiling support possible-good-possible." },
  "dumbbell-bench-press": { classification: "WELL_JUSTIFIED", reason: "Supported loadable pressing and clear progression support later-phase continuity." },
  "machine-chest-press": { classification: "PLAUSIBLE_NEEDS_REVIEW", reason: "All-good treatment is plausible, but phase distinctions and machine-fit evidence are under-specified." },
  "cable-chest-fly": { classification: "WELL_JUSTIFIED", reason: "Accessory hypertrophy role and shoulder-control caveat support increasing phase fit." },
  "chest-supported-dumbbell-row": { classification: "PLAUSIBLE_NEEDS_REVIEW", reason: "Support and progression rationale are plausible but duplicate dedicated facts and lack phase provenance." },
  "one-arm-dumbbell-row": { classification: "PLAUSIBLE_NEEDS_REVIEW", reason: "Increasing fit is plausible, but high trunk/stability demand and phase rationale need review." },
  "machine-row": { classification: "ARBITRARY_OR_UNDERSPECIFIED", reason: "Phase 2 excellent versus Phase 3 good is justified by machine fit rather than a clearly phase-specific fact." },
  "seated-cable-row": { classification: "ARBITRARY_OR_UNDERSPECIFIED", reason: "Phase 2 excellent versus Phase 3 good lacks a reviewed developmental distinction." },
  "band-row": { classification: "WELL_JUSTIFIED", reason: "Accessible patterning and limited loading support declining later-phase preference." },
  "dumbbell-shoulder-press": { classification: "WELL_JUSTIFIED", reason: "Range/control prerequisite and high loadability support increasing fit." },
  "lat-pulldown": { classification: "WELL_JUSTIFIED", reason: "Stable early acquisition and clear load progression support good-excellent-excellent, subject to the catalog-wide provenance gap." },
  "band-lat-pulldown": { classification: "WELL_JUSTIFIED", reason: "Accessible early exposure and limited loadability support later possible ratings." },
  "goblet-squat": { classification: "WELL_JUSTIFIED", reason: "Manageable early loading and later load ceiling support good-excellent-possible." },
  "leg-press": { classification: "WELL_JUSTIFIED", reason: "Conservative early use and later high stimulus support possible-excellent-excellent." },
  "bodyweight-box-squat": { classification: "WELL_JUSTIFIED", reason: "Controllable early range and low stimulus ceiling support excellent-possible-possible." },
  "dumbbell-romanian-deadlift": { classification: "WELL_JUSTIFIED", reason: "Control prerequisite and strong progression runway support later excellent fit." },
  "cable-pull-through": { classification: "WELL_JUSTIFIED", reason: "Teaching value and moderate loading ceiling support good-good-possible." },
  "split-squat": { classification: "WELL_JUSTIFIED", reason: "Scalable support and productive accessory runway support increasing phase fit." },
  "step-up": { classification: "PLAUSIBLE_NEEDS_REVIEW", reason: "All-good treatment preserves continuity but does not explain phase-specific developmental preference." },
  "lying-leg-curl": { classification: "WELL_JUSTIFIED", reason: "Simple setup and direct hypertrophy role support increasing later-phase relevance." },
  "glute-bridge": { classification: "WELL_JUSTIFIED", reason: "Accessible control and later loading ceiling support excellent-good-possible." },
  "dumbbell-lateral-raise": { classification: "WELL_JUSTIFIED", reason: "Optional early use and direct later hypertrophy role support increasing fit." },
  "reverse-pec-deck": { classification: "PLAUSIBLE_NEEDS_REVIEW", reason: "Stable setup and hypertrophy role are plausible, but early activation versus accessory intent needs review." },
  "band-face-pull": { classification: "WELL_JUSTIFIED", reason: "Preparation/control value and limited loading support declining later-phase preference." },
  "dumbbell-curl": { classification: "PLAUSIBLE_NEEDS_REVIEW", reason: "Increasing accessory relevance is plausible, but phase rather than session/goal ownership is unclear." },
  "cable-triceps-pressdown": { classification: "PLAUSIBLE_NEEDS_REVIEW", reason: "Increasing accessory relevance is plausible, but phase rather than session/goal ownership is unclear." },
  "pallof-press": { classification: "PLAUSIBLE_NEEDS_REVIEW", reason: "Continued targeted trunk work is plausible, but good Phase 3 fit needs reviewed phase-specific rationale." },
  "forearm-plank": { classification: "WELL_JUSTIFIED", reason: "Scoped Phase 1 activation is owner-approved; later global migration values are non-authoritative." },
  "forearm-side-plank": { classification: "WELL_JUSTIFIED", reason: "Scoped Phase 1 lateral-control activation is owner-approved; later values remain non-scoring." },
  "machine-abdominal-crunch": { classification: "ARBITRARY_OR_UNDERSPECIFIED", reason: "No contextual annotation is accepted; direct hypertrophy utility is not independent phase evidence." },
  "half-kneeling-high-to-low-cable-chop": { classification: "WELL_JUSTIFIED", reason: "Scoped Phase 2 controlled-rotation capacity evidence is owner-approved." },
  "farmer-carry": { classification: "WELL_JUSTIFIED", reason: "Scoped Phase 2 capacity-main evidence is owner-approved." },
  "suitcase-carry": { classification: "WELL_JUSTIFIED", reason: "Scoped Phase 2 unilateral capacity-main evidence is owner-approved." },
  "wall-supported-suitcase-march": { classification: "WELL_JUSTIFIED", reason: "Scoped Phase 1 supported loaded-bracing activation is owner-approved." },
};

function suitabilityList(values: ExerciseDefinition["sectionSuitability"]): string {
  const entries = Object.entries(values);
  return entries.length === 0
    ? "none"
    : entries.map(([key, value]) => `${key}:${value?.suitability ?? "unspecified"}`).join(", ");
}

function phaseSuitabilityLabel(exercise: ExerciseDefinition, phaseId: PhaseId): string {
  const value = exercise.phaseSuitability[phaseId];
  return value ? `${value.suitability}: ${value.reason}` : "unspecified: no annotation";
}

function assessmentFeatureRole(exercise: ExerciseDefinition): string {
  const profile = exercise.mechanics?.scapularMechanics;
  if (!profile) {
    return "none modeled";
  }
  return [
    `serratus=${profile.serratusContribution.level}`,
    `upward_rotation=${profile.upwardRotationControl.level}`,
    `retraction=${profile.retractionDemand.level}`,
    `external_rotation=${profile.externalRotationContribution.level}`,
    `loaded_stability=${profile.loadedScapularControl.level}`,
    `profile=${profile.reviewStatus}`,
  ].join(", ");
}

function buildCatalogAudit(): readonly PhaseCatalogAuditRow[] {
  return REFERENCE_EXERCISES.map((exercise) => {
    const review = PHASE_ANNOTATION_REVIEWS[exercise.id];
    if (!review) {
      throw new Error(`Missing phase annotation review for ${exercise.id}.`);
    }
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      trainingRoles: exercise.trainingRoles.join(", "),
      movementRoles: exercise.movementRoles.join(", "),
      sectionSuitability: suitabilityList(exercise.sectionSuitability),
      phase1: phaseSuitabilityLabel(exercise, "phase_1"),
      phase2: phaseSuitabilityLabel(exercise, "phase_2"),
      phase3: phaseSuitabilityLabel(exercise, "phase_3"),
      loadability: exercise.loading.loadability,
      skill: exercise.loading.skillDemand,
      stability: exercise.loading.stabilityDemand,
      coordination: exercise.loading.coordinationDemand,
      progressionAxes: exercise.progression.progressionAxes.join(", ") || "none",
      continuityPotential:
        exercise.progression.progressionAxes.length > 0
          ? "same-exercise progression runway present"
          : "no same-exercise axis modeled",
      assessmentFeatureRole: assessmentFeatureRole(exercise),
      provenanceReviewStatus: "phase-specific provenance/review status not modeled; reason prose only",
      classification: review.classification,
      auditReason: review.reason,
    };
  });
}

function buildProductionRankingFingerprint(): string {
  const rows = CONTROLLED_CANDIDATE_SCENARIOS.map((scenario) => {
    const result = runCandidateRankingLab(
      {
        ...scenario.request,
        evaluationContext: { asOf: PHASE_CALIBRATION_FIXED_AS_OF },
      },
      LEGACY_OPTIONS,
    );
    return {
      id: scenario.id,
      ranked: result.rankedCandidates.map((candidate) => [
        candidate.exercise.id,
        candidate.rank,
        candidate.total,
      ]),
      rejected: result.hardRejectedCandidates.map((candidate) => [
        candidate.exercise.id,
        candidate.eligibility.rejectionReasons.map((reason) => reason.code),
      ]),
    };
  });
  return hash(rows);
}

interface PhaseLabRequest {
  readonly label: string;
  readonly goal: TrainingGoal;
  readonly phaseId: PhaseId;
  readonly request: CandidateRequest;
}

function buildPhaseOnlyRequests(): readonly PhaseLabRequest[] {
  return PHASE_NEEDS.flatMap((entry) =>
    PHASE_IDS.map((phaseId): PhaseLabRequest => ({
      label: entry.label,
      goal: entry.goal,
      phaseId,
      request: makeRequest({
        id: `phase-only-${entry.need.id}-${phaseId}`,
        phaseId,
        goal: entry.goal,
        candidateNeed: entry.need,
      }),
    })),
  );
}

function phaseCandidateRow(
  labRequest: PhaseLabRequest,
  candidate: RankedCandidate,
): PhaseCandidateMatrixRow {
  return {
    requestId: labRequest.request.id,
    need: labRequest.label,
    phaseId: labRequest.phaseId,
    goal: labRequest.goal,
    candidateId: candidate.exercise.id,
    rank: candidate.rank,
    total: candidate.total,
    phaseFit: score(candidate, "phase_fit").rawValue,
    goalFit: score(candidate, "goal_fit").rawValue,
    experienceFit: score(candidate, "experience_fit").rawValue,
    skillFit: score(candidate, "skill_fit").rawValue,
    stabilityFit: score(candidate, "stability_fit").rawValue,
    loadability: score(candidate, "loadability").rawValue,
    stimulusPotential: score(candidate, "stimulus_potential").rawValue,
    progressionValue: score(candidate, "progression_value").rawValue,
    continuityValue: score(candidate, "continuity_value").rawValue,
    assessmentFit: score(candidate, "assessment_fit").rawValue,
    painSuitability: score(candidate, "pain_suitability").rawValue,
    jointCost: score(candidate, "joint_cost").rawValue,
  };
}

function buildPhaseOnlyMatrix(input: readonly PhaseLabRequest[]): {
  readonly summaries: readonly PhaseOnlySummaryRow[];
  readonly candidates: readonly PhaseCandidateMatrixRow[];
  readonly rejections: readonly PhaseRejectionMatrixRow[];
  readonly results: ReadonlyMap<string, CandidateRankingResult>;
} {
  const resultEntries = input.map((labRequest) => [
    labRequest.request.id,
    runCandidateRankingLab(labRequest.request, LEGACY_OPTIONS),
  ] as const);
  const results = new Map(resultEntries);
  const summaries: PhaseOnlySummaryRow[] = [];
  const candidates: PhaseCandidateMatrixRow[] = [];
  const rejections: PhaseRejectionMatrixRow[] = [];

  for (const labRequest of input) {
    const result = results.get(labRequest.request.id);
    if (!result) {
      throw new Error(`Missing result for ${labRequest.request.id}.`);
    }
    summaries.push({
      requestId: labRequest.request.id,
      need: labRequest.label,
      phaseId: labRequest.phaseId,
      goal: labRequest.goal,
      winner: result.rankedCandidates[0]?.exercise.id ?? null,
      runnerUp: result.rankedCandidates[1]?.exercise.id ?? null,
      legalCandidateIds: result.rankedCandidates.map((candidate) => candidate.exercise.id),
    });
    candidates.push(
      ...result.rankedCandidates.map((candidate) => phaseCandidateRow(labRequest, candidate)),
    );
    rejections.push(
      ...result.hardRejectedCandidates.map((candidate): PhaseRejectionMatrixRow => ({
        requestId: labRequest.request.id,
        need: labRequest.label,
        phaseId: labRequest.phaseId,
        exerciseId: candidate.exercise.id,
        reasonCodes: candidate.eligibility.rejectionReasons.map((reason) => reason.code),
      })),
    );
  }

  return { summaries, candidates, rejections, results };
}

const GOAL_MATRIX_NEED = need({
  id: "phase-lab-goal-horizontal-pull-accessory",
  whyNeeded: "Compare enduring goals on one truthful horizontal-pull accessory need.",
  requestedRole: "secondary_strength",
  requestedSection: "accessory",
  targetMovementRoles: ["horizontal_pull"],
  targetMuscles: ["mid_back", "lats", "rear_delts"],
  targetBodyRegions: ["shoulder", "thoracic_spine"],
  goal: "general_fitness",
});

function buildGoalMatrix(): readonly GoalMatrixRow[] {
  return PHASE_IDS.flatMap((phaseId) =>
    GOALS.map((requestGoal): GoalMatrixRow => {
      const result = runCandidateRankingLab(makeRequest({
        id: `phase-goal-${phaseId}-${requestGoal}`,
        phaseId,
        goal: requestGoal,
        candidateNeed: GOAL_MATRIX_NEED,
      }), LEGACY_OPTIONS);
      const selected = winner(result);
      return {
        phaseId,
        requestGoal,
        phasePrimaryGoal: phase(phaseId).primaryGoal,
        winner: selected?.exercise.id ?? null,
        runnerUp: result.rankedCandidates[1]?.exercise.id ?? null,
        winnerGoalFit: selected ? score(selected, "goal_fit").rawValue : null,
        legalCandidateIds: result.rankedCandidates.map((candidate) => candidate.exercise.id),
      };
    }),
  );
}

function buildExperienceMatrix(): readonly ExperienceMatrixRow[] {
  const horizontalPush = PHASE_NEEDS.find((entry) => entry.label === "horizontal push main");
  if (!horizontalPush) {
    throw new Error("Missing horizontal-push phase need.");
  }
  return PHASE_IDS.flatMap((phaseId) =>
    EXPERIENCES.map((experience): ExperienceMatrixRow => {
      const result = runCandidateRankingLab(makeRequest({
        id: `phase-experience-${phaseId}-${experience}`,
        phaseId,
        goal: "strength",
        candidateNeed: horizontalPush.need,
        experience,
      }), LEGACY_OPTIONS);
      const selected = winner(result);
      const freeWeights = result.rankedCandidates.filter((candidate) =>
        candidate.exercise.id === "dumbbell-bench-press" || candidate.exercise.id === "push-up",
      );
      return {
        phaseId,
        experience,
        winner: selected?.exercise.id ?? null,
        runnerUp: result.rankedCandidates[1]?.exercise.id ?? null,
        legalCandidateIds: result.rankedCandidates.map((candidate) => candidate.exercise.id),
        freeWeightCandidateIds: freeWeights.map((candidate) => candidate.exercise.id),
        winnerExperienceFit: selected ? score(selected, "experience_fit").rawValue : null,
        winnerPhaseFit: selected ? score(selected, "phase_fit").rawValue : null,
      };
    }),
  );
}

interface ContinuityStateDefinition {
  readonly id: string;
  readonly continuity: ContinuityContext;
  readonly history: TrainingHistory;
}

function buildContinuityStates(): readonly ContinuityStateDefinition[] {
  const currentExerciseId = "chest-supported-dumbbell-row";
  const current = {
    ...EMPTY_CONTINUITY,
    currentExerciseId,
  };
  return [
    { id: "current", continuity: current, history: history() },
    {
      id: "productive",
      continuity: { ...current, productiveExerciseIds: [currentExerciseId] },
      history: history(),
    },
    {
      id: "stable",
      continuity: current,
      history: history({
        exerciseHistory: {
          events: [],
          stableExerciseIds: [currentExerciseId],
          blockedExerciseIds: [],
        },
      }),
    },
    {
      id: "ready_to_progress",
      continuity: current,
      history: history({
        progressionState: {
          ...EMPTY_TRAINING_HISTORY.progressionState,
          readyToProgressExerciseIds: [currentExerciseId],
        },
      }),
    },
    {
      id: "plateaued",
      continuity: { ...current, plateauedExerciseIds: [currentExerciseId] },
      history: history({
        progressionState: {
          ...EMPTY_TRAINING_HISTORY.progressionState,
          stalledExerciseIds: [currentExerciseId],
        },
      }),
    },
    {
      id: "failed_progression",
      continuity: { ...current, failedProgressionExerciseIds: [currentExerciseId] },
      history: history(),
    },
    {
      id: "pain_response",
      continuity: { ...current, painResponseExerciseIds: [currentExerciseId] },
      history: history(),
    },
    {
      id: "productive_stable_ready",
      continuity: { ...current, productiveExerciseIds: [currentExerciseId] },
      history: history({
        exerciseHistory: {
          events: [],
          stableExerciseIds: [currentExerciseId],
          blockedExerciseIds: [],
        },
        progressionState: {
          ...EMPTY_TRAINING_HISTORY.progressionState,
          readyToProgressExerciseIds: [currentExerciseId],
        },
      }),
    },
  ];
}

function buildContinuityMatrix(
  policy?: PhasePolicyDefinition,
): readonly ContinuityMatrixRow[] {
  const horizontalPull = PHASE_NEEDS.find((entry) => entry.label === "horizontal pull main");
  if (!horizontalPull) {
    throw new Error("Missing horizontal-pull phase need.");
  }
  const transitionEffects = unique(
    buildExerciseTransitionTraces(
      REFERENCE_EXERCISES.find((candidate) => candidate.id === "chest-supported-dumbbell-row") ??
        REFERENCE_EXERCISES[0],
      REFERENCE_EXERCISES,
    ).map((trace) => trace.automaticSelectionEffect),
  );
  return buildContinuityStates().flatMap((state) =>
    PHASE_IDS.map((phaseId): ContinuityMatrixRow => {
      const result = runCandidateRankingLab(
        makeRequest({
          id: `phase-continuity-${state.id}-${phaseId}`,
          phaseId,
          goal: "strength",
          candidateNeed: horizontalPull.need,
          continuity: state.continuity,
          history: state.history,
        }),
        policy ? policyOptions(policy) : LEGACY_OPTIONS,
      );
      const current = ranked(result, "chest-supported-dumbbell-row");
      const phaseFit = current?.components.find((candidate) => candidate.id === "phase_fit");
      const continuityValue = current?.components.find(
        (candidate) => candidate.id === "continuity_value",
      );
      const progressionValue = current?.components.find(
        (candidate) => candidate.id === "progression_value",
      );
      return {
        state: state.id,
        phaseId,
        winner: winner(result)?.exercise.id ?? null,
        currentExerciseRank: current?.rank ?? null,
        currentExerciseTotal: current?.total ?? null,
        currentPhaseFit: phaseFit?.rawValue ?? null,
        currentContinuityValue: continuityValue?.rawValue ?? null,
        currentContinuityReasonCode: continuityValue?.reasonCode ?? null,
        currentProgressionValue: progressionValue?.rawValue ?? null,
        transitionAutomaticSelectionEffects: transitionEffects,
      };
    }),
  );
}

export function buildPhasePolicyContinuityDisruptions(): Readonly<Record<string, number>> {
  const current = buildContinuityMatrix();
  return Object.fromEntries(
    PHASE_CALIBRATION_POLICIES.map((policy) => {
      const experimental = buildContinuityMatrix(policy);
      const disruptions = current.filter(
        (row, index) => row.winner !== experimental[index]?.winner,
      ).length;
      return [policy.id, disruptions] as const;
    }),
  );
}

const ROW_POOL = REFERENCE_EXERCISES.filter((candidate) =>
  [
    "machine-row",
    "seated-cable-row",
    "chest-supported-dumbbell-row",
    "one-arm-dumbbell-row",
  ].includes(candidate.id),
);

function relevantRowAssessment(): AssessmentState {
  return {
    signals: [
      {
        id: "phase-lab-loaded-scapular-stability",
        type: "control_finding",
        source: "movement_screen",
        confidence: "high",
        priority: "primary",
        severity: "mild",
        region: "shoulder",
        movementRole: "scapular_control",
        muscleGroup: "upper_back",
        assessmentFeatures: ["loaded_scapular_stability"],
        description: "Controlled loaded-scapular-stability signal for phase interaction review.",
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
          id: "phase-lab-current-low-back",
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
        id: `phase-lab-moderate-${input.requiredResponse ?? "avoid_aggravator"}`,
        region: "lumbar_spine",
        severity0To10: 4,
        stressTags: ["loaded_hinge", "loaded_spinal_flexion"],
        requiredResponse: input.requiredResponse ?? "avoid_aggravator",
        description: "Controlled moderate low-back pain response requirement.",
      },
    ],
  };
}

function buildInteractionMatrix(): readonly PhaseInteractionRow[] {
  const horizontalPull = PHASE_NEEDS.find((entry) => entry.label === "horizontal pull main");
  if (!horizontalPull) {
    throw new Error("Missing horizontal-pull phase need.");
  }
  const scenarios: readonly {
    readonly id: string;
    readonly assessment?: AssessmentState;
    readonly painAndInjury?: PainAndInjuryState;
    readonly continuity?: ContinuityContext;
    readonly trainingHistory?: TrainingHistory;
  }[] = [
    { id: "neutral" },
    { id: "relevant_assessment", assessment: relevantRowAssessment() },
    { id: "current_discomfort", painAndInjury: rowPain({ kind: "current" }) },
    {
      id: "moderate_candidate_review",
      painAndInjury: rowPain({ kind: "moderate", requiredResponse: "avoid_aggravator" }),
    },
    {
      id: "moderate_prescription_required",
      painAndInjury: rowPain({ kind: "moderate", requiredResponse: "reduce_load_and_range" }),
    },
    {
      id: "moderate_role_substitution",
      painAndInjury: rowPain({ kind: "moderate", requiredResponse: "substitute_role" }),
    },
    {
      id: "productive_continuity",
      continuity: {
        ...EMPTY_CONTINUITY,
        currentExerciseId: "one-arm-dumbbell-row",
        productiveExerciseIds: ["one-arm-dumbbell-row"],
      },
      trainingHistory: history({
        exerciseHistory: {
          events: [],
          stableExerciseIds: ["one-arm-dumbbell-row"],
          blockedExerciseIds: [],
        },
      }),
    },
    {
      id: "hard_contraindication",
      painAndInjury: {
        ...NO_PAIN_OR_INJURY,
        hardContraindications: [
          {
            kind: "hard_contraindication",
            id: "phase-lab-one-arm-row-hard-block",
            exerciseIds: ["one-arm-dumbbell-row"],
            reason: "Controlled hard contraindication invariant.",
            source: "clinician",
          },
        ],
      },
    },
  ];

  return scenarios.flatMap((scenario) =>
    PHASE_IDS.map((phaseId): PhaseInteractionRow => {
      const result = runCandidateRankingLab(makeRequest({
        id: `phase-interaction-${scenario.id}-${phaseId}`,
        phaseId,
        goal: "strength",
        candidateNeed: horizontalPull.need,
        assessment: scenario.assessment,
        painAndInjury: scenario.painAndInjury,
        continuity: scenario.continuity,
        history: scenario.trainingHistory,
        candidatePool: ROW_POOL,
      }), LEGACY_OPTIONS);
      const oneArm = ranked(result, "one-arm-dumbbell-row");
      const oneArmRejected = result.hardRejectedCandidates.some(
        (candidate) => candidate.exercise.id === "one-arm-dumbbell-row",
      );
      return {
        scenario: scenario.id,
        phaseId,
        winner: winner(result)?.exercise.id ?? null,
        oneArmRowRank: oneArm?.rank ?? null,
        oneArmPhaseFit: oneArm ? score(oneArm, "phase_fit").rawValue : null,
        oneArmAssessmentFit: oneArm ? score(oneArm, "assessment_fit").rawValue : null,
        oneArmPainSuitability: oneArm ? score(oneArm, "pain_suitability").rawValue : null,
        oneArmReadiness: oneArm
          ? oneArm.painExecutionReadiness.readiness
          : oneArmRejected
            ? "hard_rejected"
            : null,
        hardRejectedIds: result.hardRejectedCandidates.map((candidate) => candidate.exercise.id),
        assessmentTraceCount:
          oneArm?.components.find((candidate) => candidate.id === "assessment_fit")
            ?.assessmentRelevance?.length ?? 0,
      };
    }),
  );
}

function tiePairs(result: CandidateRankingResult): ReadonlySet<string> {
  const pairs = new Set<string>();
  for (let leftIndex = 0; leftIndex < result.rankedCandidates.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < result.rankedCandidates.length; rightIndex += 1) {
      const left = result.rankedCandidates[leftIndex];
      const right = result.rankedCandidates[rightIndex];
      if (left && right && left.total === right.total) {
        pairs.add([left.exercise.id, right.exercise.id].sort().join("|"));
      }
    }
  }
  return pairs;
}

function phasePolicyResults(
  requests: readonly PhaseLabRequest[],
): ReadonlyMap<string, CandidateRankingResult> {
  const entries = PHASE_CALIBRATION_POLICIES.flatMap((policy) =>
    requests.map((labRequest) => [
      `${policy.id}|${labRequest.request.id}`,
      runCandidateRankingLab(labRequest.request, policyOptions(policy)),
    ] as const),
  );
  return new Map(entries);
}

function policyResult(
  results: ReadonlyMap<string, CandidateRankingResult>,
  policyId: string,
  requestId: string,
): CandidateRankingResult {
  const result = results.get(`${policyId}|${requestId}`);
  if (!result) {
    throw new Error(`Missing ${policyId} result for ${requestId}.`);
  }
  return result;
}

function buildPolicySummaries(
  requests: readonly PhaseLabRequest[],
  results: ReadonlyMap<string, CandidateRankingResult>,
): readonly PhasePolicySummaryRow[] {
  return PHASE_CALIBRATION_POLICIES.map((policy): PhasePolicySummaryRow => {
    let rankChanges = 0;
    let winnerChanges = 0;
    let tiesCreated = 0;
    let tiesBroken = 0;
    const affectedCandidateIds: string[] = [];

    for (const labRequest of requests) {
      const current = policyResult(results, "A_CURRENT", labRequest.request.id);
      const experimental = policyResult(results, policy.id, labRequest.request.id);
      if (winner(current)?.exercise.id !== winner(experimental)?.exercise.id) {
        winnerChanges += 1;
      }
      for (const currentCandidate of current.rankedCandidates) {
        const changed = ranked(experimental, currentCandidate.exercise.id);
        if (changed && changed.rank !== currentCandidate.rank) {
          rankChanges += 1;
          affectedCandidateIds.push(currentCandidate.exercise.id);
        }
      }
      const currentTies = tiePairs(current);
      const experimentalTies = tiePairs(experimental);
      tiesCreated += [...experimentalTies].filter((pair) => !currentTies.has(pair)).length;
      tiesBroken += [...currentTies].filter((pair) => !experimentalTies.has(pair)).length;
    }

    return {
      policyId: policy.id,
      rankChanges,
      winnerChanges,
      tiesCreated,
      tiesBroken,
      affectedCandidateIds: unique(affectedCandidateIds),
    };
  });
}

function runnerMargin(result: CandidateRankingResult): number {
  const first = result.rankedCandidates[0];
  const second = result.rankedCandidates[1];
  if (!first || !second) {
    return 0;
  }
  return Number((first.total - second.total).toFixed(3));
}

function buildWinnerChanges(
  requests: readonly PhaseLabRequest[],
  results: ReadonlyMap<string, CandidateRankingResult>,
): readonly PhaseWinnerChangeRow[] {
  return PHASE_CALIBRATION_POLICIES.flatMap((policy) =>
    requests.flatMap((labRequest): readonly PhaseWinnerChangeRow[] => {
      const current = policyResult(results, "A_CURRENT", labRequest.request.id);
      const experimental = policyResult(results, policy.id, labRequest.request.id);
      const currentWinner = winner(current);
      const experimentalWinner = winner(experimental);
      if (
        !currentWinner ||
        !experimentalWinner ||
        currentWinner.exercise.id === experimentalWinner.exercise.id
      ) {
        return [];
      }
      return [{
        policyId: policy.id,
        requestId: labRequest.request.id,
        need: labRequest.label,
        phaseId: labRequest.phaseId,
        currentWinner: currentWinner.exercise.id,
        experimentalWinner: experimentalWinner.exercise.id,
        currentWinnerPhaseFit: score(currentWinner, "phase_fit").rawValue,
        experimentalWinnerPhaseFit:
          experimentalWinner.components.find((candidate) => candidate.id === "phase_fit")?.rawValue ?? 0,
        scoreMarginBefore: runnerMargin(current),
        scoreMarginAfter: runnerMargin(experimental),
      }];
    }),
  );
}

function buildRankThresholds(
  requests: readonly PhaseLabRequest[],
  results: ReadonlyMap<string, CandidateRankingResult>,
): readonly PhaseRankThresholdRow[] {
  const weightPolicies = PHASE_CALIBRATION_POLICIES.filter(
    (policy) => policy.family === "WEIGHT" && policy.phaseWeight !== 1,
  );
  return requests.flatMap((labRequest): readonly PhaseRankThresholdRow[] => {
    const current = policyResult(results, "A_CURRENT", labRequest.request.id);
    const currentWinner = winner(current);
    if (!currentWinner) {
      return [];
    }
    const changes = weightPolicies.flatMap((policy) => {
      const experimental = policyResult(results, policy.id, labRequest.request.id);
      const changedWinner = winner(experimental);
      return changedWinner && changedWinner.exercise.id !== currentWinner.exercise.id
        ? [{ policy, changedWinner }]
        : [];
    }).sort(
      (left, right) =>
        Math.abs((left.policy.phaseWeight ?? 1) - 1) -
          Math.abs((right.policy.phaseWeight ?? 1) - 1) ||
        (left.policy.phaseWeight ?? 1) - (right.policy.phaseWeight ?? 1),
    );
    const nearest = changes[0];
    return nearest
      ? [{
          requestId: labRequest.request.id,
          need: labRequest.label,
          phaseId: labRequest.phaseId,
          nearestChangedWeight: nearest.policy.phaseWeight ?? 1,
          distanceFromCurrent: Math.abs((nearest.policy.phaseWeight ?? 1) - 1),
          currentWinner: currentWinner.exercise.id,
          changedWinner: nearest.changedWinner.exercise.id,
        }]
      : [];
  });
}

function phaseMovementFindings(
  requests: readonly PhaseLabRequest[],
  results: ReadonlyMap<string, CandidateRankingResult>,
): {
  readonly mechanicalBonusOnly: readonly string[];
  readonly annotationRetained: readonly string[];
} {
  const mechanicalBonusOnly: string[] = [];
  const annotationRetained: string[] = [];
  for (const needEntry of PHASE_NEEDS) {
    const matchingRequests = requests.filter((candidate) => candidate.label === needEntry.label);
    const candidateIds = unique(
      matchingRequests.flatMap((candidate) =>
        policyResult(results, "A_CURRENT", candidate.request.id).rankedCandidates.map(
          (rankedCandidate) => rankedCandidate.exercise.id,
        ),
      ),
    );
    for (const candidateId of candidateIds) {
      for (const labRequest of matchingRequests) {
        const currentRank = ranked(
          policyResult(results, "A_CURRENT", labRequest.request.id),
          candidateId,
        )?.rank ?? null;
        const annotationRank = ranked(
          policyResult(results, "B_ANNOTATION_ONLY", labRequest.request.id),
          candidateId,
        )?.rank ?? null;
        if (currentRank !== annotationRank) {
          mechanicalBonusOnly.push(
            `${needEntry.label}/${labRequest.phaseId}/${candidateId}: current rank ${currentRank ?? "-"} -> annotation-only rank ${annotationRank ?? "-"}`,
          );
        }
      }
      const currentRanks = matchingRequests.map((candidate) =>
        ranked(policyResult(results, "A_CURRENT", candidate.request.id), candidateId)?.rank ?? null,
      );
      const annotationRanks = matchingRequests.map((candidate) =>
        ranked(policyResult(results, "B_ANNOTATION_ONLY", candidate.request.id), candidateId)?.rank ?? null,
      );
      const annotationMoves = new Set(annotationRanks).size > 1;
      const label = `${needEntry.label}/${candidateId}: current=[${currentRanks.join(",")}], annotation-only=[${annotationRanks.join(",")}]`;
      if (annotationMoves) {
        annotationRetained.push(label);
      }
    }
  }
  return {
    mechanicalBonusOnly: mechanicalBonusOnly.sort(),
    annotationRetained: annotationRetained.sort(),
  };
}

function topComponentReason(candidate: RankedCandidate, includePhase: boolean): string {
  return [...candidate.components]
    .filter((candidateComponent) => includePhase || candidateComponent.id !== "phase_fit")
    .sort(
      (left, right) =>
        right.weightedContribution - left.weightedContribution ||
        left.id.localeCompare(right.id),
    )
    .slice(0, 3)
    .map((candidateComponent) =>
      `${candidateComponent.id}=${candidateComponent.rawValue.toFixed(3)} (${candidateComponent.weightedContribution.toFixed(6)})`,
    )
    .join("; ");
}

function comparativeAdvantages(
  result: CandidateRankingResult,
  selectedId: string,
  alternativeId: string,
): string {
  const selected = ranked(result, selectedId);
  const alternative = ranked(result, alternativeId);
  if (!selected || !alternative) {
    return "comparison unavailable";
  }
  const alternativeById = new Map(
    alternative.components.map((candidateComponent) => [candidateComponent.id, candidateComponent]),
  );
  const advantages = selected.components
    .flatMap((candidateComponent) => {
      const other = alternativeById.get(candidateComponent.id);
      const contributionDelta = other
        ? candidateComponent.weightedContribution - other.weightedContribution
        : candidateComponent.weightedContribution;
      return contributionDelta > 0
        ? [{
            id: candidateComponent.id,
            raw: candidateComponent.rawValue,
            contributionDelta,
          }]
        : [];
    })
    .sort(
      (left, right) =>
        right.contributionDelta - left.contributionDelta || left.id.localeCompare(right.id),
    )
    .slice(0, 4);
  return advantages.length > 0
    ? advantages
        .map((advantage) =>
          `${advantage.id}=${advantage.raw.toFixed(3)} (advantage ${advantage.contributionDelta.toFixed(6)})`,
        )
        .join("; ")
    : "no positive component advantage; rounded tie/order fallback applies";
}

function buildCoachingReview(
  requests: readonly PhaseLabRequest[],
  results: ReadonlyMap<string, CandidateRankingResult>,
): readonly CoachingReviewRow[] {
  return PHASE_CALIBRATION_POLICIES.flatMap((policy) =>
    requests.flatMap((labRequest): readonly CoachingReviewRow[] => {
      const current = policyResult(results, "A_CURRENT", labRequest.request.id);
      const experimental = policyResult(results, policy.id, labRequest.request.id);
      const currentTopTwo = current.rankedCandidates.slice(0, 2).map((candidate) => candidate.exercise.id);
      const experimentalTopTwo = experimental.rankedCandidates.slice(0, 2).map((candidate) => candidate.exercise.id);
      if (currentTopTwo.join("|") === experimentalTopTwo.join("|")) {
        return [];
      }
      const currentWinner = winner(current);
      const experimentalWinner = winner(experimental);
      if (!currentWinner || !experimentalWinner) {
        return [];
      }
      const experimentalPhase = experimentalWinner.components.find(
        (candidate) => candidate.id === "phase_fit",
      );
      return [{
        scenario: `${policy.id} / ${labRequest.label}${currentWinner.exercise.id === experimentalWinner.exercise.id ? " / top-two reorder" : " / winner change"}`,
        enduringGoal: labRequest.goal,
        experience: labRequest.request.athlete.experience,
        phaseId: labRequest.phaseId,
        currentWinner: currentWinner.exercise.id,
        experimentalWinner: experimentalWinner.exercise.id,
        whyCurrentWinnerWon: comparativeAdvantages(
          current,
          currentWinner.exercise.id,
          experimentalWinner.exercise.id,
        ),
        whyExperimentalWinnerWon: comparativeAdvantages(
          experimental,
          experimentalWinner.exercise.id,
          currentWinner.exercise.id,
        ),
        phaseComponentEffect: `current ${score(currentWinner, "phase_fit").rawValue.toFixed(3)}; experimental ${experimentalPhase?.rawValue.toFixed(3) ?? "omitted"}`,
        otherComponentEffects: topComponentReason(experimentalWinner, false),
        continuityEffect: `${score(currentWinner, "continuity_value").rawValue.toFixed(3)} -> ${score(experimentalWinner, "continuity_value").rawValue.toFixed(3)}`,
        assessmentEffect: `${score(currentWinner, "assessment_fit").rawValue.toFixed(3)} -> ${score(experimentalWinner, "assessment_fit").rawValue.toFixed(3)}`,
        painReadiness: `${currentWinner.painExecutionReadiness.readiness} -> ${experimentalWinner.painExecutionReadiness.readiness}`,
        verdict:
          policy.family === "NO_PHASE"
            ? "QUESTIONABLE"
            : "PLAUSIBLE_NEEDS_REVIEW",
      }];
    }),
  );
}

function scoreValueSignature(candidate: RankedCandidate, omitPhase = false): readonly (readonly [string, number])[] {
  return candidate.components
    .filter((candidateComponent) => !omitPhase || candidateComponent.id !== "phase_fit")
    .map((candidateComponent) => [candidateComponent.id, candidateComponent.rawValue] as const);
}

function counterfactualExercise(input: {
  readonly id: string;
  readonly phase2Suitability?: "possible" | "good" | "excellent";
  readonly reason?: string;
}): ExerciseDefinition {
  const base = REFERENCE_EXERCISES.find((candidate) => candidate.id === "machine-row");
  if (!base) {
    throw new Error("Missing machine-row counterfactual base.");
  }
  const phaseSuitability = input.phase2Suitability
    ? {
        ...base.phaseSuitability,
        phase_2: {
          suitability: input.phase2Suitability,
          reason: input.reason ?? "Controlled phase annotation counterfactual.",
        },
      }
    : Object.fromEntries(
        Object.entries(base.phaseSuitability).filter(([phaseId]) => phaseId !== "phase_2"),
      );
  return {
    ...base,
    id: input.id,
    name: "Mechanically Identical Counterfactual Row",
    phaseSuitability,
  };
}

function buildCounterfactualProof(): PhaseCounterfactualProof {
  const horizontalPull = PHASE_NEEDS.find((entry) => entry.label === "horizontal pull main");
  if (!horizontalPull) {
    throw new Error("Missing horizontal-pull phase need.");
  }
  const excellent = counterfactualExercise({
    id: "phase-counterfactual-excellent",
    phase2Suitability: "excellent",
  });
  const possible = counterfactualExercise({
    id: "phase-counterfactual-possible",
    phase2Suitability: "possible",
  });
  const annotationResult = runCandidateRankingLab(makeRequest({
    id: "phase-counterfactual-annotation-only",
    phaseId: "phase_2",
    goal: "strength",
    candidateNeed: horizontalPull.need,
    candidatePool: [excellent, possible],
  }), LEGACY_OPTIONS);
  const excellentRanked = ranked(annotationResult, excellent.id);
  const possibleRanked = ranked(annotationResult, possible.id);
  if (!excellentRanked || !possibleRanked) {
    throw new Error("Counterfactual candidates unexpectedly failed eligibility.");
  }

  const reasonA = counterfactualExercise({
    id: "phase-counterfactual-reason-a",
    phase2Suitability: "good",
    reason: "First prose reason.",
  });
  const reasonB = counterfactualExercise({
    id: "phase-counterfactual-reason-b",
    phase2Suitability: "good",
    reason: "Completely different prose with no executable authority.",
  });
  const reasonResult = runCandidateRankingLab(makeRequest({
    id: "phase-counterfactual-reason-text",
    phaseId: "phase_2",
    goal: "strength",
    candidateNeed: horizontalPull.need,
    candidatePool: [reasonA, reasonB],
  }), LEGACY_OPTIONS);
  const reasonARanked = ranked(reasonResult, reasonA.id);
  const reasonBRanked = ranked(reasonResult, reasonB.id);
  if (!reasonARanked || !reasonBRanked) {
    throw new Error("Reason-text counterfactual candidates unexpectedly failed eligibility.");
  }

  const unspecified = counterfactualExercise({ id: "phase-counterfactual-unspecified" });
  const unspecifiedResult = runCandidateRankingLab(makeRequest({
    id: "phase-counterfactual-unspecified-result",
    phaseId: "phase_2",
    goal: "strength",
    candidateNeed: horizontalPull.need,
    candidatePool: [unspecified],
  }), LEGACY_OPTIONS);
  const unspecifiedRanked = ranked(unspecifiedResult, unspecified.id);
  if (!unspecifiedRanked) {
    throw new Error("Unspecified phase counterfactual unexpectedly failed eligibility.");
  }
  const unspecifiedPhase = score(unspecifiedRanked, "phase_fit");

  return {
    differentAnnotationOnlyChangesPhaseFit:
      JSON.stringify(scoreValueSignature(excellentRanked, true)) ===
        JSON.stringify(scoreValueSignature(possibleRanked, true)) &&
      score(excellentRanked, "phase_fit").rawValue !== score(possibleRanked, "phase_fit").rawValue,
    eligibilityUnchanged:
      excellentRanked.eligibility.legal &&
      possibleRanked.eligibility.legal &&
      excellentRanked.eligibility.rejectionReasons.length === 0 &&
      possibleRanked.eligibility.rejectionReasons.length === 0,
    painReadinessUnchanged:
      excellentRanked.painExecutionReadiness.readiness ===
      possibleRanked.painExecutionReadiness.readiness,
    progressionAndTransitionUnchanged:
      score(excellentRanked, "progression_value").rawValue ===
        score(possibleRanked, "progression_value").rawValue &&
      score(excellentRanked, "continuity_value").rawValue ===
        score(possibleRanked, "continuity_value").rawValue &&
      JSON.stringify(excellent.progression) === JSON.stringify(possible.progression),
    proseReasonDoesNotChangeScoring:
      JSON.stringify(scoreValueSignature(reasonARanked)) ===
      JSON.stringify(scoreValueSignature(reasonBRanked)),
    unspecifiedPhaseFit: unspecifiedPhase.rawValue,
    unspecifiedRemainsExplicit:
      unspecifiedPhase.rawValue === 5.5 && unspecifiedPhase.reason.includes("unspecified"),
  };
}

function buildCarryAudit(): CarrySupportAudit {
  const referenceCarryExerciseIds = REFERENCE_EXERCISES.filter((candidate) =>
    candidate.movementRoles.includes("carry"),
  ).map((candidate) => candidate.id);
  const scenarioIdsRequestingCarry = CONTROLLED_CANDIDATE_SCENARIOS.filter((scenario) =>
    scenario.request.need.targetMovementRoles.includes("carry"),
  ).map((scenario) => scenario.id);
  return {
    movementRoleExists: true,
    referenceCarryExerciseIds,
    scenarioIdsRequestingCarry,
    sessionOrWeeklyAllocationExists: false,
    finding:
      "Farmer and suitcase carries now provide canonical production candidates, while controlled scenarios and concrete session/week allocation remain intentionally unimplemented.",
  };
}

const UNRESOLVED_EXERCISE_SCIENCE_QUESTIONS = [
  "Should the explicit Phase 1 skill/stability and Phase 3 loadability bonuses be removed because their exact facts already have dedicated components?",
  "What reviewed evidence should distinguish excellent, good, possible and unspecified phase suitability for each exercise?",
  "Should phase annotations gain their own provenance and review-status contract before any category is treated as settled exercise science?",
  "What categorical gaps and phase-family weight create useful developmental preference without overpowering goal, continuity or assessment truth?",
  "Should PhaseIntent.primaryGoal be renamed or reframed so it cannot be mistaken for the athlete's enduring CandidateRequest.goal?",
  "Which phase differences belong in candidate selection versus prescription, session composition, weekly target bands or progression policy?",
  "When a productive exercise has lower current phase preference, what evidence should justify replacement rather than KEEP + PROGRESS?",
  "How should phase appropriateness be validated for vertical-push pools where the current reference catalog has only one truthful secondary-strength candidate?",
  "Which longitudinal outcomes should validate phase annotations, phase advancement and exercise continuity across phases?",
] as const;

const RECOMMENDED_POLICY_SHAPE = [
  "Keep phase as one bounded, inspectable candidate-level preference; it must not become eligibility or replace the enduring user goal.",
  "Prefer reviewed exercise phase annotations as the phase_fit evidence channel, with explicit provenance/review status added in a later approved metadata change.",
  "Remove or independently justify direct mechanical bonuses that reread loadability, skill and stability facts already owned by dedicated components.",
  "Retain phase progression-axis matching in progression_value because it describes same-exercise runway rather than phase_fit or replacement.",
  "Let the project owner choose the final category gaps and weight after reviewing winner changes and near ties; this laboratory does not select those production values.",
  "Preserve KEEP + PROGRESS across phase boundaries and leave whole-session, whole-week, dosage and advancement coherence to their future owners.",
] as const;

export function buildPhaseSuitabilityCalibrationData(): PhaseSuitabilityCalibrationData {
  const productionRankingFingerprint = buildProductionRankingFingerprint();
  const phaseRequests = buildPhaseOnlyRequests();
  const phaseOnly = buildPhaseOnlyMatrix(phaseRequests);
  const policyResults = phasePolicyResults(phaseRequests);
  const policySummaries = buildPolicySummaries(phaseRequests, policyResults);
  const winnerChanges = buildWinnerChanges(phaseRequests, policyResults);
  const rankThresholds = buildRankThresholds(phaseRequests, policyResults);
  const phaseMovements = phaseMovementFindings(phaseRequests, policyResults);
  const coachingReview = buildCoachingReview(phaseRequests, policyResults);
  const catalogAudit = buildCatalogAudit();
  const goalMatrix = buildGoalMatrix();
  const experienceMatrix = buildExperienceMatrix();
  const continuityMatrix = buildContinuityMatrix();
  const interactionMatrix = buildInteractionMatrix();
  const counterfactualProof = buildCounterfactualProof();
  const carryAudit = buildCarryAudit();
  const baselineResult = phaseOnly.results.values().next().value as CandidateRankingResult | undefined;
  const emittedTotalWeight =
    baselineResult?.rankedCandidates[0]?.score.aggregate.totalWeight ?? 16.2;
  const normalizedWeight = 1 / emittedTotalWeight;
  const experimentalFingerprint = hash({
    phaseCandidateMatrix: phaseOnly.candidates,
    phaseRejectionMatrix: phaseOnly.rejections,
    goalMatrix,
    experienceMatrix,
    continuityMatrix,
    interactionMatrix,
    policySummaries,
    winnerChanges,
    rankThresholds,
    phaseMovements,
    coachingReview,
    counterfactualProof,
  });

  return {
    classification: "PHASE_POLICY_READY_FOR_OWNER_DECISION",
    fixedAsOf: PHASE_CALIBRATION_FIXED_AS_OF,
    productionRankingFingerprint,
    expectedProductionRankingFingerprint: EXPECTED_PRODUCTION_RANKING_FINGERPRINT,
    productionFingerprintMatches:
      productionRankingFingerprint === EXPECTED_PRODUCTION_RANKING_FINGERPRINT,
    currentMath: {
      excellent: 8.8,
      good: 7.8,
      possible: 6.2,
      unspecified: 5.5,
      phase3HighLoadabilityBonus: 0.8,
      phase1LowSkillStabilityBonus: 0.5,
      configuredWeight: 1,
      emittedTotalWeight,
      normalizedWeight,
      maximumRawPhaseFit: 9.6,
      maximumAggregateContribution: 9.6 / emittedTotalWeight,
      maximumAggregateSpread: (9.6 - 5.5) / emittedTotalWeight,
    },
    fieldConsumption: PHASE_FIELD_CONSUMPTION,
    overlapAudit: PHASE_OVERLAP_AUDIT,
    catalogAudit,
    phaseOnlySummaries: phaseOnly.summaries,
    phaseCandidateMatrix: phaseOnly.candidates,
    phaseRejectionMatrix: phaseOnly.rejections,
    goalMatrix,
    experienceMatrix,
    continuityMatrix,
    interactionMatrix,
    policies: PHASE_CALIBRATION_POLICIES,
    policySummaries,
    winnerChanges,
    rankThresholds,
    mechanicalBonusOnlyMovements: phaseMovements.mechanicalBonusOnly,
    annotationRetainedMovements: phaseMovements.annotationRetained,
    coachingReview,
    counterfactualProof,
    carryAudit,
    unresolvedExerciseScienceQuestions: UNRESOLVED_EXERCISE_SCIENCE_QUESTIONS,
    recommendedPolicyShape: RECOMMENDED_POLICY_SHAPE,
    remainingP1: [
      "Project-owner approval of the final Candidate Intelligence phase policy.",
      "Implementation and full revalidation of the approved phase policy before Session Composer.",
    ],
    experimentalFingerprint,
  };
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function table(
  headers: readonly string[],
  rows: readonly (readonly (string | number)[])[],
): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) =>
      `| ${row.map((value) => escapeCell(String(value))).join(" | ")} |`,
    ),
  ].join("\n");
}

function fixed(value: number | null, digits = 3): string {
  return value === null ? "-" : value.toFixed(digits);
}

function list(values: readonly string[]): string {
  return values.length > 0 ? values.join(", ") : "none";
}

export function renderPhaseSuitabilityCalibrationReview(
  data: PhaseSuitabilityCalibrationData,
): string {
  const catalogCounts = Object.fromEntries(
    ([
      "WELL_JUSTIFIED",
      "PLAUSIBLE_NEEDS_REVIEW",
      "ARBITRARY_OR_UNDERSPECIFIED",
      "CONTRADICTORY",
    ] as const).map((classification) => [
      classification,
      data.catalogAudit.filter((row) => row.classification === classification).length,
    ]),
  );
  const policyCurrent = data.policySummaries.find((row) => row.policyId === "A_CURRENT");

  return [
    "# Phase Suitability Calibration Review",
    "",
    "`ENGINE_V2_BLUEPRINT.md` is authoritative. This report is deterministic audit and non-production sensitivity evidence. It does not change production phase scores, phase metadata, exercise metadata, weights, rankings, goal behavior, experience behavior, pain behavior, assessment behavior, continuity, prescription, Session Composer or Weekly Composer.",
    "",
    `Fixed evaluation time: \`${data.fixedAsOf}\`.`,
    "",
    `Production 22-scenario ranking fingerprint: \`${data.productionRankingFingerprint}\` (${data.productionFingerprintMatches ? "matches the captured HEAD 7aa7ccd baseline" : "CHANGED"}).`,
    "",
    `Experimental phase-laboratory fingerprint: \`${data.experimentalFingerprint}\`.`,
    "",
    `Phase audit classification: **${data.classification}**`,
    "",
    "This classification means the architecture and evidence are ready for the project owner to choose a policy. It does not mean a production phase policy was selected, implemented or approved.",
    "",
    "## Owner Doctrine Used",
    "",
    "- The user's enduring `CandidateRequest.goal` remains the goal in every phase.",
    "- Phase describes developmental emphasis and programming context, not equipment identity or a replacement command.",
    "- Every phase still requires a rational stimulus aligned with the user's goal.",
    "- Productive legal exercises may cross phase boundaries through KEEP + PROGRESS.",
    "- Candidate phase fit answers only how appropriate one legal candidate is for the current developmental phase.",
    "",
    "## Phase Field-Consumption Inventory",
    "",
    table(
      [
        "Input Field",
        "Giver",
        "Current Receiver",
        "Current Output",
        "Behavioral Effect",
        "Trace Visibility",
        "Status",
        "Future Owner",
      ],
      data.fieldConsumption.map((row) => [
        row.inputField,
        row.giver,
        row.currentReceiver,
        row.currentOutput,
        row.behavioralEffect,
        row.traceVisibility,
        row.status,
        row.futureOwner,
      ]),
    ),
    "",
    "Key inventory findings:",
    "",
    "- `PhaseIntent.primaryGoal`, `developedQualities`, `priorityMuscles`, capability movement roles, technical complexity, effort, continuity default and all advancement content have no Candidate Intelligence behavior.",
    "- `PhaseState` is not a CandidateRequest input. Only `currentPhaseId` is checked by foundation validation; week and criterion state do not rank candidates or advance a phase.",
    "- Capability control/stability/coordination and loading intent influence more than `phase_fit`: they also enter stability, loadability and assessment demand/capability reasoning.",
    "- `exerciseContinuityDefault=review_for_phase_fit` in Phase 3 is currently inert. Treating it later as replacement pressure would conflict with KEEP + PROGRESS.",
    "- Exercise phase reason prose is non-executable and absent from the score trace; phase-specific provenance/review status is not represented in the schema.",
    "",
    "## Current Production Formula",
    "",
    table(
      ["Term", "Raw Value", "Aggregate Effect"],
      [
        ["excellent", fixed(data.currentMath.excellent), fixed(data.currentMath.excellent / data.currentMath.emittedTotalWeight, 6)],
        ["good", fixed(data.currentMath.good), fixed(data.currentMath.good / data.currentMath.emittedTotalWeight, 6)],
        ["possible", fixed(data.currentMath.possible), fixed(data.currentMath.possible / data.currentMath.emittedTotalWeight, 6)],
        ["unspecified/fallback", fixed(data.currentMath.unspecified), fixed(data.currentMath.unspecified / data.currentMath.emittedTotalWeight, 6)],
        ["Phase 3 + high loadability", `+${fixed(data.currentMath.phase3HighLoadabilityBonus)}`, fixed(data.currentMath.phase3HighLoadabilityBonus / data.currentMath.emittedTotalWeight, 6)],
        ["Phase 1 + low skill + stability not high", `+${fixed(data.currentMath.phase1LowSkillStabilityBonus)}`, fixed(data.currentMath.phase1LowSkillStabilityBonus / data.currentMath.emittedTotalWeight, 6)],
      ],
    ),
    "",
    `Configured family weight is **${data.currentMath.configuredWeight.toFixed(2)}**. The 18 emitted components have total configured weight **${data.currentMath.emittedTotalWeight.toFixed(1)}**, so the exact normalized phase weight is **1/${data.currentMath.emittedTotalWeight.toFixed(1)} = ${data.currentMath.normalizedWeight.toFixed(9)}** (the trace stores ${data.currentMath.normalizedWeight.toFixed(6)}). Maximum raw phase_fit is **${data.currentMath.maximumRawPhaseFit.toFixed(1)}**; its exact maximum aggregate contribution is **${data.currentMath.maximumAggregateContribution.toFixed(6)}**. The full fallback-to-maximum aggregate spread is **${data.currentMath.maximumAggregateSpread.toFixed(6)}**.`,
    "",
    "## Responsibility And Double-Count Audit",
    "",
    table(
      ["Compared Facts", "Classification", "Finding"],
      data.overlapAudit.map((row) => [
        row.comparedFacts,
        row.classification,
        row.finding,
      ]),
    ),
    "",
    "The explicit Phase 3 loadability branch and Phase 1 skill/stability branch are actual repeated consumption of the same structured facts. Correlation with stimulus, experience and curated annotation rationale is potential rather than automatically actual double counting. Goal, muscle and assessment remain distinct authorities.",
    "",
    "## Reference-Catalog Phase Audit",
    "",
    `Catalog classifications: WELL_JUSTIFIED=${catalogCounts.WELL_JUSTIFIED}; PLAUSIBLE_NEEDS_REVIEW=${catalogCounts.PLAUSIBLE_NEEDS_REVIEW}; ARBITRARY_OR_UNDERSPECIFIED=${catalogCounts.ARBITRARY_OR_UNDERSPECIFIED}; CONTRADICTORY=${catalogCounts.CONTRADICTORY}. These are audit judgments about internal coherence, not missing provenance supplied after the fact.`,
    "",
    table(
      [
        "Exercise",
        "Training Roles",
        "Movement Roles",
        "Section Suitability",
        "Phase 1",
        "Phase 2",
        "Phase 3",
        "Loadability",
        "Skill",
        "Stability",
        "Coordination",
        "Progression Axes",
        "Continuity Potential",
        "Assessment Feature Role",
        "Phase Provenance / Review",
        "Classification",
        "Audit Reason",
      ],
      data.catalogAudit.map((row) => [
        `${row.exerciseId} / ${row.exerciseName}`,
        row.trainingRoles,
        row.movementRoles,
        row.sectionSuitability,
        row.phase1,
        row.phase2,
        row.phase3,
        row.loadability,
        row.skill,
        row.stability,
        row.coordination,
        row.progressionAxes,
        row.continuityPotential,
        row.assessmentFeatureRole,
        row.provenanceReviewStatus,
        row.classification,
        row.auditReason,
      ]),
    ),
    "",
    "No phase annotation has a phase-specific provenance or review-status field. Existing reason text cannot substitute for that contract and is not read by scoring.",
    "",
    "## Phase-Only Controlled Matrix",
    "",
    "Only `CandidateRequest.phase` changes within each three-row need group. Athlete, intermediate experience, enduring goal, full-gym equipment, training need, assessment, pain, history, continuity, fatigue, prerequisites and evaluation time remain fixed.",
    "",
    table(
      ["Need", "Goal", "Phase", "Winner", "Runner-Up", "Legal Candidates"],
      data.phaseOnlySummaries.map((row) => [
        row.need,
        row.goal,
        row.phaseId,
        row.winner ?? "none",
        row.runnerUp ?? "none",
        list(row.legalCandidateIds),
      ]),
    ),
    "",
    "Vertical-push secondary has only one truthful legal reference candidate. The matrix reports that catalog limitation instead of manufacturing a comparison.",
    "",
    "### Every Legal Candidate",
    "",
    table(
      [
        "Need",
        "Phase",
        "Candidate",
        "Rank",
        "Total",
        "phase_fit",
        "goal_fit",
        "experience_fit",
        "skill_fit",
        "stability_fit",
        "loadability",
        "stimulus_potential",
        "progression_value",
        "continuity_value",
        "assessment_fit",
        "pain_suitability",
        "joint_cost",
      ],
      data.phaseCandidateMatrix.map((row) => [
        row.need,
        row.phaseId,
        row.candidateId,
        row.rank,
        fixed(row.total),
        fixed(row.phaseFit),
        fixed(row.goalFit),
        fixed(row.experienceFit),
        fixed(row.skillFit),
        fixed(row.stabilityFit),
        fixed(row.loadability),
        fixed(row.stimulusPotential),
        fixed(row.progressionValue),
        fixed(row.continuityValue),
        fixed(row.assessmentFit),
        fixed(row.painSuitability),
        fixed(row.jointCost),
      ]),
    ),
    "",
    "### Every Hard Rejection",
    "",
    "These are expected training-need and equipment/prerequisite truth outcomes from evaluating the complete 30-exercise reference catalog for every phase-only request. Phase never changes these reasons.",
    "",
    table(
      ["Need", "Phase", "Exercise", "Reason Codes"],
      data.phaseRejectionMatrix.map((row) => [
        row.need,
        row.phaseId,
        row.exerciseId,
        list(row.reasonCodes),
      ]),
    ),
    "",
    "## Goal-Independence Matrix",
    "",
    "The phase is held constant while `CandidateRequest.goal` and the mirrored need goal vary on one truthful horizontal-pull accessory need. Then the same goal is visible across all three phases.",
    "",
    table(
      ["Phase", "Request Goal", "Phase primaryGoal", "Winner", "Runner-Up", "Winner goal_fit", "Legal Candidates"],
      data.goalMatrix.map((row) => [
        row.phaseId,
        row.requestGoal,
        row.phasePrimaryGoal,
        row.winner ?? "none",
        row.runnerUp ?? "none",
        fixed(row.winnerGoalFit),
        list(row.legalCandidateIds),
      ]),
    ),
    "",
    "`CandidateRequest.goal` is the goal-fit scoring authority. `PhaseIntent.primaryGoal` is unused and neither changes the goal component nor overwrites the user's goal. Conditioning has no dedicated goal-fit branch in the current component and therefore receives the default raw value; that is explicit current behavior, not a phase conclusion.",
    "",
    "## Experience-Independence Matrix",
    "",
    "Goal, phase, horizontal-push need, equipment and every other input are fixed while experience varies.",
    "",
    table(
      ["Phase", "Experience", "Winner", "Runner-Up", "Winner experience_fit", "Winner phase_fit", "Legal Free-Weight/Bodyweight Candidates", "Full Legal Pool"],
      data.experienceMatrix.map((row) => [
        row.phaseId,
        row.experience,
        row.winner ?? "none",
        row.runnerUp ?? "none",
        fixed(row.winnerExperienceFit),
        fixed(row.winnerPhaseFit),
        list(row.freeWeightCandidateIds),
        list(row.legalCandidateIds),
      ]),
    ),
    "",
    "Phase 1 does not hard-gate the pool to machines: dumbbell bench press and push-up remain legal for every experience. Advanced does not create instability preference, and Phase 3 does not replace the independent experience-fit calculation. Phase and experience can both affect totals, including repeated skill-related facts identified in the overlap audit.",
    "",
    "## Continuity Across Phases",
    "",
    table(
      ["State", "Phase", "Winner", "Current Rank / Total", "Current phase_fit", "Current continuity", "Continuity Reason", "Current progression", "Transition Auto Effect"],
      data.continuityMatrix.map((row) => [
        row.state,
        row.phaseId,
        row.winner ?? "none",
        `${row.currentExerciseRank ?? "-"} / ${fixed(row.currentExerciseTotal)}`,
        fixed(row.currentPhaseFit),
        fixed(row.currentContinuityValue),
        row.currentContinuityReasonCode ?? "-",
        fixed(row.currentProgressionValue),
        list(row.transitionAutomaticSelectionEffects),
      ]),
    ),
    "",
    "### Policy F - Continuity-Preserving Contrast",
    "",
    "This observability-only contrast keeps the current exercise and its continuity evidence fixed while phase changes. Productive, stable and ready-to-progress rows show where continuity and phase preference coexist or disagree; no secret continuity override is added.",
    "",
    "Productive, stable and ready-to-progress evidence remains active in every phase. `readyToProgress` raises same-exercise `progression_value`; it does not request replacement. Plateau, failed progression and pain response remain explicit reconsideration evidence. Phase change alone does not activate a transition, and every reviewed relationship retains `automaticSelectionEffect=none`. A phase-fit disadvantage can move rank but never becomes a hard gate.",
    "",
    "## Pain And Assessment Interaction",
    "",
    table(
      ["Scenario", "Phase", "Winner", "One-Arm Rank", "One-Arm phase_fit", "assessment_fit", "pain_suitability", "Pain Readiness", "Hard Rejections", "Assessment Traces"],
      data.interactionMatrix.map((row) => [
        row.scenario,
        row.phaseId,
        row.winner ?? "none",
        row.oneArmRowRank ?? "-",
        fixed(row.oneArmPhaseFit),
        fixed(row.oneArmAssessmentFit),
        fixed(row.oneArmPainSuitability),
        row.oneArmReadiness ?? "-",
        list(row.hardRejectedIds),
        row.assessmentTraceCount,
      ]),
    ),
    "",
    "The relevant assessment remains independently traceable across phases. Current and moderate pain keep their canonical score/readiness authority; phase cannot turn candidate review, prescription or role-substitution work into executable behavior. The hard-contraindicated candidate remains rejected in every phase. Productive continuity remains visible without bypassing pain or eligibility.",
    "",
    "## Policy Sensitivity Laboratory",
    "",
    table(
      ["Policy", "Family", "Phase Weight", "Category Map", "Mechanical Bonuses", "Description"],
      data.policies.map((policy) => [
        policy.id,
        policy.family,
        policy.phaseWeight ?? "omitted",
        policy.categoryMap
          ? `${policy.categoryMap.excellent}/${policy.categoryMap.good}/${policy.categoryMap.possible}/${policy.categoryMap.unspecified}`
          : "none",
        policy.includeMechanicalBonuses ? "yes" : "no",
        policy.description,
      ]),
    ),
    "",
    table(
      ["Policy", "Rank Changes", "Winner Changes", "Ties Created", "Ties Broken", "Affected Candidates"],
      data.policySummaries.map((row) => [
        row.policyId,
        row.rankChanges,
        row.winnerChanges,
        row.tiesCreated,
        row.tiesBroken,
        list(row.affectedCandidateIds),
      ]),
    ),
    "",
    `Current-control self-comparison: rank changes=${policyCurrent?.rankChanges ?? 0}, winner changes=${policyCurrent?.winnerChanges ?? 0}. Rank movement is sensitivity evidence only; it is not evidence that a policy is better.`,
    "",
    "### Winner Changes",
    "",
    data.winnerChanges.length > 0
      ? table(
          ["Policy", "Need", "Phase", "Current Winner", "Experimental Winner", "Current Winner phase_fit", "Experimental Winner phase_fit", "Margin Before", "Margin After"],
          data.winnerChanges.map((row) => [
            row.policyId,
            row.need,
            row.phaseId,
            row.currentWinner,
            row.experimentalWinner,
            fixed(row.currentWinnerPhaseFit),
            fixed(row.experimentalWinnerPhaseFit),
            fixed(row.scoreMarginBefore),
            fixed(row.scoreMarginAfter),
          ]),
        )
      : "No tested policy changed a winner.",
    "",
    "### Smallest Weight Thresholds",
    "",
    data.rankThresholds.length > 0
      ? table(
          ["Need", "Phase", "Nearest Changed Weight", "Distance From 1.00", "Current Winner", "Changed Winner"],
          data.rankThresholds.map((row) => [
            row.need,
            row.phaseId,
            row.nearestChangedWeight.toFixed(2),
            row.distanceFromCurrent.toFixed(2),
            row.currentWinner,
            row.changedWinner,
          ]),
        )
      : "No tested phase weight from 0.25 through 1.25 changed a winner; no winner threshold is claimed outside the tested grid.",
    "",
    "### Phase Movement Attribution",
    "",
    "Movement caused only by explicit Phase 1/3 mechanical bonuses:",
    "",
    data.mechanicalBonusOnlyMovements.length > 0
      ? data.mechanicalBonusOnlyMovements.map((finding) => `- ${finding}`).join("\n")
      : "- None in the tested legal pools.",
    "",
    "Movement that remains with annotation-only phase_fit:",
    "",
    data.annotationRetainedMovements.length > 0
      ? data.annotationRetainedMovements.map((finding) => `- ${finding}`).join("\n")
      : "- None in the tested legal pools.",
    "",
    "## Human Coaching Review",
    "",
    "Meaningful means a winner change or a top-two ordering/membership change. All such changes are shown below; lower-pool rank movements remain counted in the policy summaries.",
    "",
    data.coachingReview.length > 0
      ? table(
          ["Scenario", "Enduring Goal", "Experience", "Phase", "Current Winner", "Experimental Winner", "Why Current Won", "Why Experimental Won", "Phase Effect", "Other Effects", "Continuity", "Assessment", "Pain Readiness", "Verdict"],
          data.coachingReview.map((row) => [
            row.scenario,
            row.enduringGoal,
            row.experience,
            row.phaseId,
            row.currentWinner,
            row.experimentalWinner,
            row.whyCurrentWinnerWon,
            row.whyExperimentalWinnerWon,
            row.phaseComponentEffect,
            row.otherComponentEffects,
            row.continuityEffect,
            row.assessmentEffect,
            row.painReadiness,
            row.verdict,
          ]),
        )
      : "No tested policy changed a winner or top-two ordering.",
    "",
    "`QUESTIONABLE` for no-phase cases means removing developmental candidate evidence entirely needs owner justification; it is not an automatic recommendation to retain current math. Other changes remain `PLAUSIBLE_NEEDS_REVIEW` because score movement alone cannot settle coaching quality.",
    "",
    "## Phase-Annotation Counterfactuals",
    "",
    table(
      ["Invariant", "Result"],
      [
        ["Mechanically identical candidates with different phase annotations differ only through phase_fit", data.counterfactualProof.differentAnnotationOnlyChangesPhaseFit ? "PASS" : "FAIL"],
        ["Changing only phaseSuitability leaves eligibility unchanged", data.counterfactualProof.eligibilityUnchanged ? "PASS" : "FAIL"],
        ["Changing only phaseSuitability leaves pain readiness unchanged", data.counterfactualProof.painReadinessUnchanged ? "PASS" : "FAIL"],
        ["Changing only phaseSuitability leaves progression and transition behavior unchanged", data.counterfactualProof.progressionAndTransitionUnchanged ? "PASS" : "FAIL"],
        ["Changing only phase reason prose leaves scoring unchanged", data.counterfactualProof.proseReasonDoesNotChangeScoring ? "PASS" : "FAIL"],
        ["Unspecified phase annotation remains explicit fallback", `${data.counterfactualProof.unspecifiedRemainsExplicit ? "PASS" : "FAIL"}; phase_fit=${data.counterfactualProof.unspecifiedPhaseFit.toFixed(3)}`],
      ],
    ),
    "",
    "Unspecified means the explicit 5.5 fallback. It does not become excellent, easy, safe or preferred, and it does not alter legal truth.",
    "",
    "## Candidate Phase Fit vs Composer Phase Coherence",
    "",
    "Candidate Intelligence owns one legal exercise's inspectable phase appropriateness and bounded developmental preference. It does not own complete-session phase expression, section allocation, exercise cooperation, redundancy, sequencing, dosage or unresolved pain-response execution.",
    "",
    "Future Session Composer owns warm-up/activation/main/accessory/cooldown cooperation, combinations, fatigue, redundancy and session-level phase expression. Future Weekly Composer owns weekly volume, frequency, recovery spacing, coverage, priority frequency, stress budgets, carries and phase-wide stimulus distribution.",
    "",
    "## Weekly Development Ledger Handoff",
    "",
    "The future Weekly Composer should derive individualized target bands, not universal quotas:",
    "",
    "- Muscle exposure: minimum, target range, soft ceiling, and direct versus meaningful secondary credit.",
    "- Movement exposure: push, pull, squat, hinge, single-leg, trunk, scapular-control needs, and carry where appropriate.",
    "- Assessment-priority exposure.",
    "- Joint/stress exposure.",
    "- Recovery spacing.",
    "- Capacity exposure: grip, trunk, loaded gait and conditioning.",
    "",
    "Targets should begin from experience-level priors and adjust for enduring goal, phase, pain, assessment, priority muscles, available days/time, equipment, adherence, fatigue and response history. Candidate Intelligence does not implement this ledger.",
    "",
    "## Carry Handoff",
    "",
    table(
      ["Question", "Finding"],
      [
        ["MovementRole contains carry", data.carryAudit.movementRoleExists ? "yes" : "no"],
        ["Reference carry exercises", list(data.carryAudit.referenceCarryExerciseIds)],
        ["Candidate scenarios requesting carry", list(data.carryAudit.scenarioIdsRequestingCarry)],
        ["Concrete session/week carry allocation", data.carryAudit.sessionOrWeeklyAllocationExists ? "yes" : "no"],
      ],
    ),
    "",
    data.carryAudit.finding,
    "",
    "A carry is not mandatory filler. Future selection should require a real need such as grip capacity, trunk capacity, loaded gait, unilateral control, work capacity, conditioning or assessment-relevant asymmetry. Placement must consider pulling grip fatigue, hinge/trunk fatigue, unilateral loading already present, next-day recovery, equipment, duration and carry-specific prescription units.",
    "",
    "## Phase Advancement Boundary",
    "",
    "Advancement criteria are represented but unconsumed. This task does not implement them. Future advancement must evaluate exposure, adherence, movement competency, progression history, pain stability, fatigue/recovery and phase-specific milestones. Calendar time alone must never advance a phase.",
    "",
    "## Unresolved Exercise-Science Questions",
    "",
    data.unresolvedExerciseScienceQuestions.map((question) => `- ${question}`).join("\n"),
    "",
    "## Recommended Policy Shape",
    "",
    data.recommendedPolicyShape.map((recommendation) => `- ${recommendation}`).join("\n"),
    "",
    "This recommends a semantic shape, not production coefficients, category values, metadata edits or a selected policy. Those require explicit project-owner approval.",
    "",
    "## Explicit Uncertainty",
    "",
    "The controlled reference catalog is small, several pools contain only two candidates, vertical-push secondary contains one, annotations lack phase-specific provenance, and no longitudinal outcome data validates a phase coefficient or category gap. Rank stability or movement inside these pools cannot establish physiological superiority. Whole-session and whole-week effects remain untested because their composers do not yet exist.",
    "",
    "## Final Classification And Remaining P1",
    "",
    `Phase audit: **${data.classification}**`,
    "",
    "Remaining Candidate Intelligence P1 work:",
    "",
    data.remainingP1.map((item) => `- ${item}`).join("\n"),
    "",
    "Overall Candidate Intelligence remains **TARGETED_FIXES_REQUIRED_BEFORE_SESSION_COMPOSITION**. Do not start Session Composer until the owner approves a phase policy, that policy is implemented in a separate reviewed change, and final readiness is revalidated.",
    "",
    "## Blueprint Maintenance",
    "",
    "No blueprint amendment is required by this audit. The blueprint already establishes phase as first-class, preserves the user goal, rejects machine-only/hardest-is-best shortcuts, allows continuity across phases, and assigns complete-session/week coherence to future composers. Temporary policy grids, current score values and test counts remain in this report only.",
    "",
  ].join("\n");
}

export function writePhaseSuitabilityCalibrationReview(rootDir = process.cwd()): {
  readonly outputPath: string;
  readonly data: PhaseSuitabilityCalibrationData;
} {
  const data = buildPhaseSuitabilityCalibrationData();
  const outputPath = join(
    rootDir,
    "docs/training-engine-v2/PHASE_SUITABILITY_CALIBRATION_REVIEW.md",
  );
  writeFileSync(outputPath, renderPhaseSuitabilityCalibrationReview(data));
  return { outputPath, data };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = writePhaseSuitabilityCalibrationReview();
  console.log(`Wrote ${result.outputPath}`);
  console.log(JSON.stringify({
    classification: result.data.classification,
    productionFingerprintMatches: result.data.productionFingerprintMatches,
    catalogExercises: result.data.catalogAudit.length,
    phaseOnlyRequests: result.data.phaseOnlySummaries.length,
    legalCandidateRows: result.data.phaseCandidateMatrix.length,
    hardRejectionRows: result.data.phaseRejectionMatrix.length,
    policyVariants: result.data.policies.length,
    winnerChanges: result.data.winnerChanges.length,
    coachingReviewRows: result.data.coachingReview.length,
    experimentalFingerprint: result.data.experimentalFingerprint,
  }, null, 2));
}
