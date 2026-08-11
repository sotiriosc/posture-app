import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CONTROLLED_CANDIDATE_SCENARIOS,
  FULL_GYM_EQUIPMENT,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  buildCandidatePainMatchTrace,
  buildExerciseStressProfile,
  deriveAlignmentPriorities,
  evaluateHardEligibility,
  getControlledCandidateScenario,
  jointCostComponent,
  painSuitabilityComponent,
  receiverDecision,
  runCandidateRankingLab,
  type AssessmentState,
  type BodyRegion,
  type CandidateNeed,
  type CandidateRequest,
  type CurrentDiscomfort,
  type ExerciseDefinition,
  type HardContraindication,
  type HistoricalSensitivity,
  type JointStressTag,
  type ModeratePain,
  type PainAndInjuryState,
  type RankedCandidate,
  type ScoreComponent,
} from "../../src";

const FIXED_AS_OF = "2026-08-10T00:00:00.000Z";
const AUDIT_BASELINE_HEAD = "1449d46e122cadd8a445e07365c242983afa64eb";
const EXPECTED_EXISTING_SCENARIO_FINGERPRINT =
  "d6a6452537e1436c3ecbbc035d9ea7a3126e772961012e4141b3302919f11782";

const EMPTY_ASSESSMENT: AssessmentState = {
  signals: [],
  historicalWeaknesses: [],
};

const KNEE_CONTROL_ASSESSMENT: AssessmentState = {
  signals: [
    {
      id: "pain-audit-knee-control",
      type: "control_finding",
      source: "movement_screen",
      confidence: "high",
      priority: "primary",
      region: "knee",
      movementRole: "squat",
      muscleGroup: "glutes",
      description: "Controlled knee-alignment signal for pain-semantics auditing.",
    },
  ],
  historicalWeaknesses: [],
};

const MATRIX_EXERCISE_IDS = {
  shoulderPush: ["push-up", "dumbbell-bench-press", "machine-chest-press"],
  lowBackHinge: ["dumbbell-romanian-deadlift", "cable-pull-through"],
  lowBackRow: [
    "machine-row",
    "seated-cable-row",
    "chest-supported-dumbbell-row",
    "one-arm-dumbbell-row",
  ],
  kneeSquat: ["goblet-squat", "leg-press", "bodyweight-box-squat"],
  singleLeg: ["split-squat", "step-up"],
} as const;

const STRESS_AUDIT_EXERCISE_IDS = [
  "push-up",
  "dumbbell-bench-press",
  "machine-chest-press",
  "dumbbell-romanian-deadlift",
  "cable-pull-through",
  "one-arm-dumbbell-row",
  "goblet-squat",
  "leg-press",
  "split-squat",
  "step-up",
] as const;

type PainSignalKind =
  | "none"
  | "current_discomfort"
  | "historical_sensitivity"
  | "moderate_pain"
  | "acute_severe_pain"
  | "hard_contraindication";

type StressMetadataSource =
  | "loading.jointStressTags"
  | "cautionStressTags"
  | "contraindicatedStressTags";

export interface PainFieldConsumptionRow {
  readonly field: string;
  readonly primaryOwnerGiver: string;
  readonly currentOutput: string;
  readonly downstreamReceiver: string;
  readonly behavioralEffect: string;
  readonly traceVisibility: string;
  readonly status: "UNUSED" | "PARTIALLY USED" | "FULLY USED";
}

export interface PainPipelineRow {
  readonly stage: string;
  readonly reads: string;
  readonly ignores: string;
  readonly reject: string;
  readonly warn: string;
  readonly score: string;
  readonly deferredResponsibility: string;
}

interface MatrixGroup {
  readonly id: string;
  readonly label: string;
  readonly request: CandidateRequest;
  readonly exerciseIds: readonly string[];
  readonly region: BodyRegion;
  readonly stressTags: readonly JointStressTag[];
}

export interface ModeratePainCalibrationScenario {
  readonly id: string;
  readonly label: string;
  readonly request: CandidateRequest;
  readonly exerciseIds: readonly string[];
  readonly region: BodyRegion;
  readonly stressTags: readonly JointStressTag[];
}

interface MatrixState {
  readonly label: string;
  readonly signalId: string;
  readonly kind: PainSignalKind;
  readonly severity: string;
  readonly effectOrResponse: string;
  readonly region: BodyRegion | "-";
  readonly stressTags: readonly JointStressTag[];
  readonly painAndInjury: PainAndInjuryState;
}

export interface PainMatrixRow {
  readonly matrixId: string;
  readonly matrix: string;
  readonly state: string;
  readonly candidateId: string;
  readonly outcome: "legal" | "rejected";
  readonly hardRejectionReason: string;
  readonly warning: string;
  readonly painSignalId: string;
  readonly painKind: PainSignalKind;
  readonly severity: string;
  readonly effectOrResponse: string;
  readonly region: string;
  readonly stressTags: readonly string[];
  readonly matchedExerciseStressTags: readonly string[];
  readonly matchedMetadataSources: readonly string[];
  readonly uniqueOverlapCount: number;
  readonly painCountedOverlap: number;
  readonly jointCountedOverlap: number;
  readonly responseRequirementStatus: string;
  readonly painSuitabilityRaw: number | null;
  readonly painSuitabilityWeightedContribution: number | null;
  readonly jointCostRaw: number | null;
  readonly jointCostWeightedContribution: number | null;
  readonly stabilityFit: number | null;
  readonly assessmentRelationship: string;
  readonly total: number | null;
  readonly rank: number | null;
}

export interface PainContrastRow {
  readonly contrast: string;
  readonly variant: string;
  readonly candidateId: string;
  readonly warning: string;
  readonly painSuitability: number;
  readonly jointCost: number;
  readonly stabilityFit: number;
  readonly assessmentFit: number;
  readonly alignmentFit: number;
  readonly capability: number | null;
  readonly relationship: string;
  readonly demandReductionRelevant: boolean | null;
  readonly total: number;
  readonly rank: number;
}

export interface StressTagAuditRow {
  readonly exerciseId: string;
  readonly tag: JointStressTag;
  readonly metadataSources: readonly StressMetadataSource[];
  readonly uniqueFactCount: number;
  readonly painSuitabilityCount: number;
  readonly jointCostCount: number;
  readonly warningResult: "warning" | "none";
  readonly hardContraindicationResult: "reject" | "legal";
  readonly acuteSevereResult: "reject" | "legal";
  readonly duplicateClassification:
    | "INTENTIONAL_DISTINCT_EVIDENCE"
    | "POTENTIAL_DOUBLE_COUNT"
    | "ACTUAL_DOUBLE_COUNT"
    | "RESOLVED_SOURCE_DEDUPLICATION"
    | "NOT_APPLICABLE";
}

export interface StressUniverseRow {
  readonly receiver: string;
  readonly jointStressTags: string;
  readonly cautionStressTags: string;
  readonly contraindicatedStressTags: string;
  readonly deduplication: string;
}

export interface RegionSideContrastRow {
  readonly contrast: string;
  readonly variant: string;
  readonly candidateId: string;
  readonly painSuitability: number;
  readonly jointCost: number;
  readonly stabilityFit: number;
  readonly capability: number | null;
  readonly relationship: string;
  readonly total: number;
  readonly rank: number;
}

export interface ContraindicatedOnlyProbe {
  readonly painSuitability: number;
  readonly jointCost: number;
  readonly warning: boolean;
  readonly hardContraindicationRejects: boolean;
  readonly acuteSevereRejects: boolean;
}

export interface PainAuditData {
  readonly baselineHead: string;
  readonly existingScenarioFingerprint: string;
  readonly expectedExistingScenarioFingerprint: string;
  readonly fieldConsumption: readonly PainFieldConsumptionRow[];
  readonly pipeline: readonly PainPipelineRow[];
  readonly matrix: readonly PainMatrixRow[];
  readonly severityContrasts: readonly PainContrastRow[];
  readonly requiredResponseContrasts: readonly PainContrastRow[];
  readonly discomfortEffectContrasts: readonly PainContrastRow[];
  readonly historicalModificationContrasts: readonly PainContrastRow[];
  readonly regionSideContrasts: readonly RegionSideContrastRow[];
  readonly stressTagAudit: readonly StressTagAuditRow[];
  readonly stressUniverse: readonly StressUniverseRow[];
  readonly contraindicatedOnlyProbe: ContraindicatedOnlyProbe;
}

function unique<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

function exercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing reference exercise ${id}.`);
  }

  return found;
}

function controlledRequest(id: string): CandidateRequest {
  const found = getControlledCandidateScenario(id);
  if (!found) {
    throw new Error(`Missing controlled scenario ${id}.`);
  }

  return {
    ...found.request,
    evaluationContext: { asOf: FIXED_AS_OF },
  };
}

function withAssessment(request: CandidateRequest, assessment: AssessmentState): CandidateRequest {
  return {
    ...request,
    assessment,
    alignmentPriorities: deriveAlignmentPriorities(assessment).priorities,
  };
}

function requestWithPool(input: {
  readonly request: CandidateRequest;
  readonly id: string;
  readonly exerciseIds: readonly string[];
  readonly need?: CandidateNeed;
  readonly assessment?: AssessmentState;
}): CandidateRequest {
  const assessed = input.assessment
    ? withAssessment(input.request, input.assessment)
    : input.request;

  return {
    ...assessed,
    id: input.id,
    evaluationContext: { asOf: FIXED_AS_OF },
    need: input.need ?? assessed.need,
    equipment: FULL_GYM_EQUIPMENT,
    painAndInjury: NO_PAIN_OR_INJURY,
    candidatePool: input.exerciseIds.map(exercise),
    satisfiedPrerequisiteIds: unique([
      ...assessed.satisfiedPrerequisiteIds,
      "push-up-plank-control",
      "hinge-control",
    ]),
    fatigueSignals: ["fresh"],
  };
}

function matrixGroups(): readonly MatrixGroup[] {
  const squatNeed: CandidateNeed = {
    id: "pain-audit-squat-accessory",
    whyNeeded: "Controlled pain audit across legal squat-pattern accessory candidates.",
    requestedRole: "secondary_strength",
    requestedSection: "accessory",
    targetMovementRoles: ["squat"],
    targetMuscles: ["quads", "glutes"],
    targetBodyRegions: ["knee", "hip", "ankle"],
    goal: "pain_aware_return",
  };
  const singleLegNeed: CandidateNeed = {
    id: "pain-audit-single-leg-accessory",
    whyNeeded: "Controlled pain audit across legal single-leg accessory candidates.",
    requestedRole: "secondary_strength",
    requestedSection: "accessory",
    targetMovementRoles: ["single_leg", "squat"],
    targetMuscles: ["quads", "glutes"],
    targetBodyRegions: ["knee", "hip", "ankle"],
    goal: "pain_aware_return",
  };

  return [
    {
      id: "shoulder-horizontal-push",
      label: "Shoulder Horizontal Push",
      request: requestWithPool({
        request: controlledRequest("horizontal-push-phase-1"),
        id: "pain-audit-shoulder-horizontal-push",
        exerciseIds: MATRIX_EXERCISE_IDS.shoulderPush,
        assessment: EMPTY_ASSESSMENT,
      }),
      exerciseIds: MATRIX_EXERCISE_IDS.shoulderPush,
      region: "shoulder",
      stressTags: ["horizontal_pressing"],
    },
    {
      id: "low-back-hinge",
      label: "Low-Back Hinge",
      request: requestWithPool({
        request: controlledRequest("lower-hinge-moderate-low-back-pain"),
        id: "pain-audit-low-back-hinge",
        exerciseIds: MATRIX_EXERCISE_IDS.lowBackHinge,
      }),
      exerciseIds: MATRIX_EXERCISE_IDS.lowBackHinge,
      region: "lumbar_spine",
      stressTags: ["loaded_hinge", "loaded_spinal_flexion"],
    },
    {
      id: "low-back-horizontal-row",
      label: "Low-Back Horizontal Row",
      request: requestWithPool({
        request: controlledRequest("horizontal-pull-low-back-discomfort"),
        id: "pain-audit-low-back-horizontal-row",
        exerciseIds: MATRIX_EXERCISE_IDS.lowBackRow,
      }),
      exerciseIds: MATRIX_EXERCISE_IDS.lowBackRow,
      region: "lumbar_spine",
      stressTags: ["loaded_hinge", "loaded_spinal_flexion"],
    },
    {
      id: "knee-squat",
      label: "Knee Squat",
      request: requestWithPool({
        request: controlledRequest("lower-squat-phase-3"),
        id: "pain-audit-knee-squat",
        exerciseIds: MATRIX_EXERCISE_IDS.kneeSquat,
        need: squatNeed,
        assessment: KNEE_CONTROL_ASSESSMENT,
      }),
      exerciseIds: MATRIX_EXERCISE_IDS.kneeSquat,
      region: "knee",
      stressTags: ["deep_knee_flexion", "loaded_knee_flexion"],
    },
    {
      id: "single-leg",
      label: "Single-Leg",
      request: requestWithPool({
        request: controlledRequest("lower-squat-phase-3"),
        id: "pain-audit-single-leg",
        exerciseIds: MATRIX_EXERCISE_IDS.singleLeg,
        need: singleLegNeed,
        assessment: KNEE_CONTROL_ASSESSMENT,
      }),
      exerciseIds: MATRIX_EXERCISE_IDS.singleLeg,
      region: "knee",
      stressTags: ["deep_knee_flexion", "loaded_knee_flexion"],
    },
  ];
}

export function buildModeratePainCalibrationScenarios(): readonly ModeratePainCalibrationScenario[] {
  return matrixGroups().map((group) => ({ ...group }));
}

function currentDiscomfort(input: {
  readonly id: string;
  readonly region: BodyRegion;
  readonly stressTags: readonly JointStressTag[];
  readonly severity: 1 | 2;
  readonly effect?: CurrentDiscomfort["effect"];
}): CurrentDiscomfort {
  return {
    kind: "current_discomfort",
    id: input.id,
    region: input.region,
    severity0To10: input.severity,
    stressTags: input.stressTags,
    effect: input.effect ?? "prefer_support",
    description: "Controlled current-discomfort signal for pain-semantics auditing.",
  };
}

function moderatePain(input: {
  readonly id: string;
  readonly region: BodyRegion;
  readonly stressTags: readonly JointStressTag[];
  readonly severity: 3 | 4 | 5 | 6;
  readonly requiredResponse?: ModeratePain["requiredResponse"];
}): ModeratePain {
  return {
    kind: "moderate_pain",
    id: input.id,
    region: input.region,
    severity0To10: input.severity,
    stressTags: input.stressTags,
    requiredResponse: input.requiredResponse ?? "avoid_aggravator",
    description: "Controlled moderate-pain signal for pain-semantics auditing.",
  };
}

function historicalSensitivity(input: {
  readonly id: string;
  readonly region: BodyRegion;
  readonly stressTags: readonly JointStressTag[];
  readonly preferredModification: NonNullable<HistoricalSensitivity["preferredModification"]>;
}): HistoricalSensitivity {
  return {
    kind: "historical_sensitivity",
    id: input.id,
    region: input.region,
    stressTags: input.stressTags,
    preferredModification: input.preferredModification,
    description: "Controlled historical-sensitivity signal for pain-semantics auditing.",
  };
}

function hardContraindication(input: {
  readonly id: string;
  readonly region?: BodyRegion;
  readonly stressTags?: readonly JointStressTag[];
  readonly exerciseIds?: readonly string[];
}): HardContraindication {
  return {
    kind: "hard_contraindication",
    id: input.id,
    region: input.region,
    exerciseIds: input.exerciseIds,
    stressTags: input.stressTags,
    reason: "Controlled hard contraindication for pain-semantics auditing.",
    source: "safety_rule",
  };
}

function relevantMatrixStates(group: MatrixGroup): readonly MatrixState[] {
  const base = `${group.id}-pain`;

  return [
    {
      label: "no pain",
      signalId: "-",
      kind: "none",
      severity: "-",
      effectOrResponse: "-",
      region: "-",
      stressTags: [],
      painAndInjury: NO_PAIN_OR_INJURY,
    },
    ...([1, 2] as const).map((severity): MatrixState => {
      const signal = currentDiscomfort({
        id: `${base}-discomfort-${severity}`,
        region: group.region,
        stressTags: group.stressTags,
        severity,
      });

      return {
        label: `discomfort severity ${severity}`,
        signalId: signal.id,
        kind: signal.kind,
        severity: String(signal.severity0To10),
        effectOrResponse: signal.effect,
        region: signal.region,
        stressTags: signal.stressTags,
        painAndInjury: {
          ...NO_PAIN_OR_INJURY,
          currentDiscomforts: [signal],
        },
      };
    }),
    ...([3, 4, 5, 6] as const).map((severity): MatrixState => {
      const signal = moderatePain({
        id: `${base}-moderate-${severity}`,
        region: group.region,
        stressTags: group.stressTags,
        severity,
      });

      return {
        label: `moderate severity ${severity}`,
        signalId: signal.id,
        kind: signal.kind,
        severity: String(signal.severity0To10),
        effectOrResponse: signal.requiredResponse,
        region: signal.region,
        stressTags: signal.stressTags,
        painAndInjury: {
          ...NO_PAIN_OR_INJURY,
          moderatePain: [signal],
        },
      };
    }),
    {
      label: "acute/severe",
      signalId: `${base}-acute-7`,
      kind: "acute_severe_pain",
      severity: "7",
      effectOrResponse: "urgentReviewRecommended=true",
      region: group.region,
      stressTags: group.stressTags,
      painAndInjury: {
        ...NO_PAIN_OR_INJURY,
        acuteSeverePain: [
          {
            kind: "acute_severe_pain",
            id: `${base}-acute-7`,
            region: group.region,
            severity0To10: 7,
            stressTags: group.stressTags,
            invalidatesTrainingRoles: [],
            urgentReviewRecommended: true,
            description: "Controlled acute/severe pain signal for pain-semantics auditing.",
          },
        ],
      },
    },
    {
      label: "hard contraindication",
      signalId: `${base}-hard-contraindication`,
      kind: "hard_contraindication",
      severity: "-",
      effectOrResponse: "source=safety_rule",
      region: group.region,
      stressTags: group.stressTags,
      painAndInjury: {
        ...NO_PAIN_OR_INJURY,
        hardContraindications: [
          hardContraindication({
            id: `${base}-hard-contraindication`,
            region: group.region,
            stressTags: group.stressTags,
          }),
        ],
      },
    },
  ];
}

function unrelatedStates(input: {
  readonly matrixId: string;
  readonly region: BodyRegion;
  readonly stressTags: readonly JointStressTag[];
}): readonly MatrixState[] {
  const signal = currentDiscomfort({
    id: `${input.matrixId}-unrelated-discomfort`,
    region: input.region,
    stressTags: input.stressTags,
    severity: 2,
  });

  return [
    {
      label: "no pain baseline",
      signalId: "-",
      kind: "none",
      severity: "-",
      effectOrResponse: "-",
      region: "-",
      stressTags: [],
      painAndInjury: NO_PAIN_OR_INJURY,
    },
    {
      label: "unrelated discomfort",
      signalId: signal.id,
      kind: signal.kind,
      severity: String(signal.severity0To10),
      effectOrResponse: signal.effect,
      region: signal.region,
      stressTags: signal.stressTags,
      painAndInjury: {
        ...NO_PAIN_OR_INJURY,
        currentDiscomforts: [signal],
      },
    },
  ];
}

function component(candidate: RankedCandidate, id: string): ScoreComponent {
  const found = candidate.components.find((scoreComponent) => scoreComponent.id === id);
  if (!found) {
    throw new Error(`Missing ${id} for ${candidate.exercise.id}.`);
  }

  return found;
}

function exerciseStressTags(candidate: ExerciseDefinition): readonly JointStressTag[] {
  return buildExerciseStressProfile(candidate).map((fact) => fact.tag);
}

function metadataSourcesForTag(
  candidate: ExerciseDefinition,
  tag: JointStressTag,
): readonly StressMetadataSource[] {
  const sourceNames = {
    joint_stress: "loading.jointStressTags",
    caution: "cautionStressTags",
    contraindicated: "contraindicatedStressTags",
  } as const;
  const fact = buildExerciseStressProfile(candidate).find((candidateFact) => candidateFact.tag === tag);

  return fact?.sources.map((source) => sourceNames[source]) ?? [];
}

function eligibilityFor(request: CandidateRequest, candidate: ExerciseDefinition) {
  return evaluateHardEligibility(candidate, {
    equipment: request.equipment,
    painAndInjury: request.painAndInjury,
    assessment: request.assessment,
    requestedRole: request.need.requestedRole,
    requestedSection: request.need.requestedSection,
    targetMovementRoles: request.need.targetMovementRoles,
    targetMuscles: request.need.targetMuscles,
    satisfiedPrerequisiteIds: request.satisfiedPrerequisiteIds,
  });
}

function assessmentRelationship(candidate: RankedCandidate | undefined): string {
  if (!candidate) {
    return "not_scored";
  }
  const traces = component(candidate, "assessment_fit").assessmentRelevance ?? [];
  if (traces.length === 0) {
    return "not_present";
  }

  return traces
    .map(
      (trace) =>
        `${trace.signalId}:${trace.relationship}; demandReduction=${trace.demandReductionContext.relevant ? "relevant" : "not_relevant"}`,
    )
    .join("; ");
}

function matrixRowsFor(input: {
  readonly matrixId: string;
  readonly matrixLabel: string;
  readonly request: CandidateRequest;
  readonly exerciseIds: readonly string[];
  readonly states: readonly MatrixState[];
}): readonly PainMatrixRow[] {
  return input.states.flatMap((state) => {
    const request: CandidateRequest = {
      ...input.request,
      id: `${input.request.id}-${state.label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
      painAndInjury: state.painAndInjury,
    };
    const result = runCandidateRankingLab(request);

    return input.exerciseIds.map((exerciseId): PainMatrixRow => {
      const candidate = exercise(exerciseId);
      const eligibility = eligibilityFor(request, candidate);
      const painTrace = eligibility.painMatchTrace;
      const ranked = result.rankedCandidates.find(
        (rankedCandidate) => rankedCandidate.exercise.id === exerciseId,
      );
      const matchedFacts = painTrace.signalMatches.filter(
        (match) => match.signalId === state.signalId,
      );
      const matchedTags = matchedFacts.map((match) => match.stressTag);
      const sourceNames = {
        joint_stress: "loading.jointStressTags",
        caution: "cautionStressTags",
        contraindicated: "contraindicatedStressTags",
      } as const;
      const matchedMetadataSources = matchedFacts.map(
        (match) =>
          `${match.stressTag}:${match.exerciseSources.map((source) => sourceNames[source]).join("+")}`,
      );
      const painComponent = ranked ? component(ranked, "pain_suitability") : undefined;
      const jointComponent = ranked ? component(ranked, "joint_cost") : undefined;
      const stabilityComponent = ranked ? component(ranked, "stability_fit") : undefined;

      return {
        matrixId: input.matrixId,
        matrix: input.matrixLabel,
        state: state.label,
        candidateId: exerciseId,
        outcome: eligibility.legal ? "legal" : "rejected",
        hardRejectionReason:
          eligibility.rejectionReasons
            .map((reason) => `${reason.code}:${reason.evidence.join(",")}`)
            .join("; ") || "-",
        warning:
          eligibility.warnings
            .map((warning) => `${warning.code}:${warning.evidence.join(",")}`)
            .join("; ") || "-",
        painSignalId: state.signalId,
        painKind: state.kind,
        severity: state.severity,
        effectOrResponse: state.effectOrResponse,
        region: state.region,
        stressTags: state.stressTags,
        matchedExerciseStressTags: matchedTags,
        matchedMetadataSources,
        uniqueOverlapCount: matchedFacts.length,
        painCountedOverlap: receiverDecision(
          painTrace,
          "pain_suitability",
        ).countedMatchUnitCount,
        jointCountedOverlap: receiverDecision(
          painTrace,
          "joint_cost",
        ).countedMatchUnitCount,
        responseRequirementStatus:
          painTrace.responseRequirements.find(
            (requirement) => requirement.signalId === state.signalId,
          )?.executionStatus ?? "none",
        painSuitabilityRaw: painComponent?.rawValue ?? null,
        painSuitabilityWeightedContribution: painComponent?.weightedContribution ?? null,
        jointCostRaw: jointComponent?.rawValue ?? null,
        jointCostWeightedContribution: jointComponent?.weightedContribution ?? null,
        stabilityFit: stabilityComponent?.rawValue ?? null,
        assessmentRelationship: assessmentRelationship(ranked),
        total: ranked?.total ?? null,
        rank: ranked?.rank ?? null,
      };
    });
  });
}

export function buildControlledPainMatrix(): readonly PainMatrixRow[] {
  const groups = matrixGroups();
  const relevantRows = groups.flatMap((group) =>
    matrixRowsFor({
      matrixId: group.id,
      matrixLabel: group.label,
      request: group.request,
      exerciseIds: group.exerciseIds,
      states: relevantMatrixStates(group),
    }),
  );
  const byId = new Map(groups.map((group) => [group.id, group] as const));
  const unrelatedDefinitions = [
    {
      matrixId: "unrelated-wrist-during-squat",
      label: "Unrelated Wrist Discomfort During Squat",
      groupId: "knee-squat",
      region: "wrist" as const,
      stressTags: ["wrist_extension_loading"] as const,
    },
    {
      matrixId: "unrelated-knee-during-horizontal-pull",
      label: "Unrelated Knee Discomfort During Horizontal Pull",
      groupId: "low-back-horizontal-row",
      region: "knee" as const,
      stressTags: ["loaded_knee_flexion"] as const,
    },
    {
      matrixId: "unrelated-shoulder-during-hinge",
      label: "Unrelated Shoulder Discomfort During Hinge",
      groupId: "low-back-hinge",
      region: "shoulder" as const,
      stressTags: ["horizontal_pressing"] as const,
    },
  ];
  const unrelatedRows = unrelatedDefinitions.flatMap((definition) => {
    const group = byId.get(definition.groupId);
    if (!group) {
      throw new Error(`Missing matrix group ${definition.groupId}.`);
    }

    return matrixRowsFor({
      matrixId: definition.matrixId,
      matrixLabel: definition.label,
      request: group.request,
      exerciseIds: group.exerciseIds,
      states: unrelatedStates(definition),
    });
  });

  return [...relevantRows, ...unrelatedRows];
}

function contrastRows(input: {
  readonly contrast: string;
  readonly request: CandidateRequest;
  readonly variants: readonly { readonly label: string; readonly painAndInjury: PainAndInjuryState }[];
  readonly exerciseIds: readonly string[];
}): readonly PainContrastRow[] {
  return input.variants.flatMap((variant) => {
    const request: CandidateRequest = {
      ...input.request,
      id: `${input.request.id}-${variant.label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
      painAndInjury: variant.painAndInjury,
    };
    const result = runCandidateRankingLab(request);

    return input.exerciseIds.map((exerciseId): PainContrastRow => {
      const ranked = result.rankedCandidates.find(
        (candidate) => candidate.exercise.id === exerciseId,
      );
      if (!ranked) {
        throw new Error(`Expected legal contrast candidate ${exerciseId}.`);
      }
      const eligibility = eligibilityFor(request, exercise(exerciseId));
      const assessmentTrace = component(ranked, "assessment_fit").assessmentRelevance?.[0];

      return {
        contrast: input.contrast,
        variant: variant.label,
        candidateId: exerciseId,
        warning: eligibility.warnings.map((warning) => warning.code).join(",") || "none",
        painSuitability: component(ranked, "pain_suitability").rawValue,
        jointCost: component(ranked, "joint_cost").rawValue,
        stabilityFit: component(ranked, "stability_fit").rawValue,
        assessmentFit: component(ranked, "assessment_fit").rawValue,
        alignmentFit: component(ranked, "alignment_fit").rawValue,
        capability: assessmentTrace?.demandCapability.currentCapability ?? null,
        relationship: assessmentTrace?.relationship ?? "not_present",
        demandReductionRelevant: assessmentTrace?.demandReductionContext.relevant ?? null,
        total: ranked.total,
        rank: ranked.rank,
      };
    });
  });
}

function buildSeverityContrasts(): readonly PainContrastRow[] {
  const group = matrixGroups().find((candidate) => candidate.id === "low-back-hinge");
  if (!group) {
    throw new Error("Missing low-back hinge matrix group.");
  }

  return contrastRows({
    contrast: "moderate severity",
    request: group.request,
    exerciseIds: group.exerciseIds,
    variants: ([3, 4, 5, 6] as const).map((severity) => ({
      label: String(severity),
      painAndInjury: {
        ...NO_PAIN_OR_INJURY,
        moderatePain: [
          moderatePain({
            id: "pain-audit-same-moderate-signal",
            region: group.region,
            stressTags: group.stressTags,
            severity,
          }),
        ],
      },
    })),
  });
}

function buildRequiredResponseContrasts(): readonly PainContrastRow[] {
  const group = matrixGroups().find((candidate) => candidate.id === "low-back-hinge");
  if (!group) {
    throw new Error("Missing low-back hinge matrix group.");
  }
  const responses = [
    "avoid_aggravator",
    "reduce_load_and_range",
    "substitute_role",
  ] as const;

  return contrastRows({
    contrast: "moderate requiredResponse",
    request: group.request,
    exerciseIds: group.exerciseIds,
    variants: responses.map((requiredResponse) => ({
      label: requiredResponse,
      painAndInjury: {
        ...NO_PAIN_OR_INJURY,
        moderatePain: [
          moderatePain({
            id: "pain-audit-same-moderate-response-signal",
            region: group.region,
            stressTags: group.stressTags,
            severity: 4,
            requiredResponse,
          }),
        ],
      },
    })),
  });
}

function effectContrastRequest(): CandidateRequest {
  const group = matrixGroups().find((candidate) => candidate.id === "knee-squat");
  if (!group) {
    throw new Error("Missing knee squat matrix group.");
  }

  return {
    ...group.request,
    id: "pain-audit-effect-contrast",
    candidatePool: [exercise("goblet-squat")],
  };
}

function buildDiscomfortEffectContrasts(): readonly PainContrastRow[] {
  const effects = ["monitor", "prefer_support", "reduce_range", "reduce_load"] as const;

  return contrastRows({
    contrast: "current discomfort effect",
    request: effectContrastRequest(),
    exerciseIds: ["goblet-squat"],
    variants: effects.map((effect) => ({
      label: effect,
      painAndInjury: {
        ...NO_PAIN_OR_INJURY,
        currentDiscomforts: [
          currentDiscomfort({
            id: "pain-audit-same-discomfort-effect-signal",
            region: "knee",
            stressTags: ["loaded_knee_flexion"],
            severity: 2,
            effect,
          }),
        ],
      },
    })),
  });
}

function buildHistoricalModificationContrasts(): readonly PainContrastRow[] {
  const modifications = ["monitor", "increase_support", "reduce_range", "reduce_load"] as const;

  return contrastRows({
    contrast: "historical preferredModification",
    request: effectContrastRequest(),
    exerciseIds: ["goblet-squat"],
    variants: modifications.map((preferredModification) => ({
      label: preferredModification,
      painAndInjury: {
        ...NO_PAIN_OR_INJURY,
        historicalSensitivities: [
          historicalSensitivity({
            id: "pain-audit-same-historical-modification-signal",
            region: "knee",
            stressTags: ["loaded_knee_flexion"],
            preferredModification,
          }),
        ],
      },
    })),
  });
}

function buildRegionSideContrasts(): readonly RegionSideContrastRow[] {
  const group = matrixGroups().find((candidate) => candidate.id === "low-back-hinge");
  if (!group) {
    throw new Error("Missing low-back hinge matrix group.");
  }

  const regionRows = (["lumbar_spine", "shoulder"] as const).map((region) => {
    const request: CandidateRequest = {
      ...group.request,
      id: `pain-audit-region-${region}`,
      candidatePool: [exercise("cable-pull-through")],
      painAndInjury: {
        ...NO_PAIN_OR_INJURY,
        moderatePain: [
          moderatePain({
            id: "pain-audit-same-region-signal",
            region,
            stressTags: group.stressTags,
            severity: 4,
          }),
        ],
      },
    };
    const ranked = runCandidateRankingLab(request).rankedCandidates[0];
    if (!ranked) {
      throw new Error("Expected legal cable pull-through region contrast.");
    }
    const trace = component(ranked, "assessment_fit").assessmentRelevance?.[0];

    return {
      contrast: "same stress tags, different region",
      variant: region,
      candidateId: ranked.exercise.id,
      painSuitability: component(ranked, "pain_suitability").rawValue,
      jointCost: component(ranked, "joint_cost").rawValue,
      stabilityFit: component(ranked, "stability_fit").rawValue,
      capability: trace?.demandCapability.currentCapability ?? null,
      relationship: trace?.relationship ?? "not_present",
      total: ranked.total,
      rank: ranked.rank,
    } satisfies RegionSideContrastRow;
  });
  const sideRows = (["left", "right"] as const).map((side) => {
    const request: CandidateRequest = {
      ...group.request,
      id: `pain-audit-side-${side}`,
      candidatePool: [exercise("cable-pull-through")],
      painAndInjury: {
        ...NO_PAIN_OR_INJURY,
        historicalInjuries: [
          {
            kind: "historical_injury",
            id: "pain-audit-same-history-side-signal",
            region: "lumbar_spine",
            side,
            status: "managed",
            relevantStressTags: group.stressTags,
            description: "Controlled historical injury side contrast.",
          },
        ],
      },
    };
    const ranked = runCandidateRankingLab(request).rankedCandidates[0];
    if (!ranked) {
      throw new Error("Expected legal cable pull-through side contrast.");
    }
    const trace = component(ranked, "assessment_fit").assessmentRelevance?.[0];

    return {
      contrast: "same historical injury, different side",
      variant: side,
      candidateId: ranked.exercise.id,
      painSuitability: component(ranked, "pain_suitability").rawValue,
      jointCost: component(ranked, "joint_cost").rawValue,
      stabilityFit: component(ranked, "stability_fit").rawValue,
      capability: trace?.demandCapability.currentCapability ?? null,
      relationship: trace?.relationship ?? "not_present",
      total: ranked.total,
      rank: ranked.rank,
    } satisfies RegionSideContrastRow;
  });

  return [...regionRows, ...sideRows];
}

function sourceProbeRequest(painAndInjury: PainAndInjuryState): CandidateRequest {
  return {
    ...controlledRequest("horizontal-pull-gym-neutral"),
    id: "pain-audit-source-probe",
    evaluationContext: { asOf: FIXED_AS_OF },
    painAndInjury,
    equipment: FULL_GYM_EQUIPMENT,
    fatigueSignals: ["fresh"],
  };
}

function buildStressTagAudit(): readonly StressTagAuditRow[] {
  return STRESS_AUDIT_EXERCISE_IDS.flatMap((exerciseId) => {
    const candidate = exercise(exerciseId);

    return exerciseStressTags(candidate).map((tag): StressTagAuditRow => {
      const metadataSources = metadataSourcesForTag(candidate, tag);
      const currentTrace = buildCandidatePainMatchTrace({
        exercise: candidate,
        painAndInjury: {
          ...NO_PAIN_OR_INJURY,
          currentDiscomforts: [currentDiscomfort({
            id: `${exerciseId}-${tag}-current-source-probe`,
            region: "general",
            stressTags: [tag],
            severity: 2,
          })],
        },
      });
      const moderateTrace = buildCandidatePainMatchTrace({
        exercise: candidate,
        painAndInjury: {
          ...NO_PAIN_OR_INJURY,
          moderatePain: [moderatePain({
            id: `${exerciseId}-${tag}-moderate-source-probe`,
            region: "general",
            stressTags: [tag],
            severity: 4,
          })],
        },
      });
      const hardTrace = buildCandidatePainMatchTrace({
        exercise: candidate,
        painAndInjury: {
          ...NO_PAIN_OR_INJURY,
          hardContraindications: [hardContraindication({
            id: `${exerciseId}-${tag}-hard-source-probe`,
            stressTags: [tag],
          })],
        },
      });
      const acuteTrace = buildCandidatePainMatchTrace({
        exercise: candidate,
        painAndInjury: {
          ...NO_PAIN_OR_INJURY,
          acuteSeverePain: [{
            kind: "acute_severe_pain",
            id: `${exerciseId}-${tag}-acute-source-probe`,
            region: "general",
            severity0To10: 7,
            stressTags: [tag],
            invalidatesTrainingRoles: [],
            urgentReviewRecommended: true,
            description: "Controlled acute source probe.",
          }],
        },
      });
      const painSuitabilityCount = receiverDecision(
        currentTrace,
        "pain_suitability",
      ).countedMatchUnitCount;
      const jointCostCount = receiverDecision(
        currentTrace,
        "joint_cost",
      ).countedMatchUnitCount;
      const warningResult = receiverDecision(
        moderateTrace,
        "moderate_warning",
      ).affectedSignalIds.length > 0
        ? "warning"
        : "none";
      const hardContraindicationResult = receiverDecision(
        hardTrace,
        "hard_contraindication",
      ).executionStatus === "hard_rejected"
        ? "reject"
        : "legal";
      const acuteSevereResult = receiverDecision(
        acuteTrace,
        "acute_severe_eligibility",
      ).executionStatus === "hard_rejected"
        ? "reject"
        : "legal";

      return {
        exerciseId,
        tag,
        metadataSources,
        uniqueFactCount: 1,
        painSuitabilityCount,
        jointCostCount,
        warningResult,
        hardContraindicationResult,
        acuteSevereResult,
        duplicateClassification:
          metadataSources.includes("loading.jointStressTags") &&
          metadataSources.includes("cautionStressTags")
            ? "RESOLVED_SOURCE_DEDUPLICATION"
            : "NOT_APPLICABLE",
      };
    });
  });
}

function buildContraindicatedOnlyProbe(): ContraindicatedOnlyProbe {
  const base = exercise("machine-row");
  const candidate: ExerciseDefinition = {
    ...base,
    id: "pain-audit-contraindicated-only-probe",
    loading: {
      ...base.loading,
      jointStressTags: [],
    },
    cautionStressTags: [],
    contraindicatedStressTags: ["high_impact"],
  };
  const discomfort = currentDiscomfort({
    id: "pain-audit-contraindicated-only-current",
    region: "knee",
    stressTags: ["high_impact"],
    severity: 2,
  });
  const currentRequest = sourceProbeRequest({
    ...NO_PAIN_OR_INJURY,
    currentDiscomforts: [discomfort],
  });
  const moderateRequest = sourceProbeRequest({
    ...NO_PAIN_OR_INJURY,
    moderatePain: [moderatePain({
      id: "pain-audit-contraindicated-only-moderate",
      region: "knee",
      stressTags: ["high_impact"],
      severity: 4,
    })],
  });
  const hardRequest = sourceProbeRequest({
    ...NO_PAIN_OR_INJURY,
    hardContraindications: [
      hardContraindication({
        id: "pain-audit-contraindicated-only-hard",
        stressTags: ["high_impact"],
      }),
    ],
  });
  const acuteRequest = sourceProbeRequest({
    ...NO_PAIN_OR_INJURY,
    acuteSeverePain: [
      {
        kind: "acute_severe_pain",
        id: "pain-audit-contraindicated-only-acute",
        region: "knee",
        severity0To10: 7,
        stressTags: ["high_impact"],
        invalidatesTrainingRoles: [],
        urgentReviewRecommended: true,
        description: "Controlled contraindicated-only acute probe.",
      },
    ],
  });

  return {
    painSuitability: painSuitabilityComponent.score({ request: currentRequest, exercise: candidate }).rawValue,
    jointCost: jointCostComponent.score({ request: currentRequest, exercise: candidate }).rawValue,
    warning: eligibilityFor(moderateRequest, candidate).warnings.length > 0,
    hardContraindicationRejects: !eligibilityFor(hardRequest, candidate).legal,
    acuteSevereRejects: !eligibilityFor(acuteRequest, candidate).legal,
  };
}

function buildExistingScenarioFingerprint(): string {
  const rows = CONTROLLED_CANDIDATE_SCENARIOS.map((scenario) => {
    const result = runCandidateRankingLab({
      ...scenario.request,
      evaluationContext: { asOf: FIXED_AS_OF },
    });

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

  return createHash("sha256").update(JSON.stringify(rows)).digest("hex");
}

export const PAIN_FIELD_CONSUMPTION: readonly PainFieldConsumptionRow[] = [
  { field: "HistoricalInjury.kind", primaryOwnerGiver: "normalized athlete/history adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "collection membership supplies the category; the field itself is not read", traceVisibility: "input only", status: "UNUSED" },
  { field: "HistoricalInjury.id", primaryOwnerGiver: "normalized athlete/history adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "none", traceVisibility: "absent", status: "UNUSED" },
  { field: "HistoricalInjury.status", primaryOwnerGiver: "normalized athlete/history adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "resolved, managed, and recurring are identical", traceVisibility: "absent", status: "UNUSED" },
  { field: "HistoricalInjury.region", primaryOwnerGiver: "normalized athlete/history adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "none", traceVisibility: "absent", status: "UNUSED" },
  { field: "HistoricalInjury.side", primaryOwnerGiver: "normalized athlete/history adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "left, right, bilateral, and absent are identical", traceVisibility: "absent", status: "UNUSED" },
  { field: "HistoricalInjury.relevantStressTags", primaryOwnerGiver: "normalized athlete/history adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "does not enter eligibility, warning, pain suitability, joint cost, stability, or assessment context", traceVisibility: "absent", status: "UNUSED" },
  { field: "HistoricalInjury.description", primaryOwnerGiver: "normalized athlete/history adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "none", traceVisibility: "absent", status: "UNUSED" },
  { field: "HistoricalSensitivity.kind", primaryOwnerGiver: "athlete/coach adapter", currentOutput: "canonical signal kind", downstreamReceiver: "pain trace and receiver policies", behavioralEffect: "selects owned receiver policies without changing coefficient magnitude", traceVisibility: "native signal trace", status: "FULLY USED" },
  { field: "HistoricalSensitivity.id", primaryOwnerGiver: "athlete/coach adapter", currentOutput: "canonical match identity, score reason, response and assessment evidence", downstreamReceiver: "pain receivers, demandReductionContext, row diagnostics", behavioralEffect: "keeps distinct signals separately traceable", traceVisibility: "native signal/match/response trace", status: "FULLY USED" },
  { field: "HistoricalSensitivity.region", primaryOwnerGiver: "athlete/coach adapter", currentOutput: "canonical signal trace and assessment context", downstreamReceiver: "pain trace and developmentalRelationship", behavioralEffect: "can scope a non-monitor modification to an assessment/candidate context", traceVisibility: "native signal and assessment trace", status: "FULLY USED" },
  { field: "HistoricalSensitivity.stressTags", primaryOwnerGiver: "athlete/coach adapter", currentOutput: "canonical matches, pain_suitability, joint_cost, assessment context", downstreamReceiver: "pain receiver policies and assessment trace", behavioralEffect: "0.4 per unique signal/tag pain unit; 0.35 per qualifying unique joint unit; may justify demand reduction", traceVisibility: "native matched tag/source and receiver counts", status: "FULLY USED" },
  { field: "HistoricalSensitivity.preferredModification", primaryOwnerGiver: "athlete/coach adapter", currentOutput: "structured response requirement and exact assessment action", downstreamReceiver: "response ownership and developmentalRelationship", behavioralEffect: "monitor is observation-only; other actions are explicitly deferred to their future owner", traceVisibility: "native response and assessment trace", status: "FULLY USED" },
  { field: "HistoricalSensitivity.description", primaryOwnerGiver: "athlete/coach adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "none", traceVisibility: "absent", status: "UNUSED" },
  { field: "CurrentDiscomfort.kind", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical signal kind", downstreamReceiver: "pain trace and receiver policies", behavioralEffect: "selects owned receiver policies without changing coefficient magnitude", traceVisibility: "native signal trace", status: "FULLY USED" },
  { field: "CurrentDiscomfort.id", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical match identity, score reason, response and assessment evidence", downstreamReceiver: "pain receivers, demandReductionContext, row diagnostics", behavioralEffect: "keeps distinct signals separately traceable", traceVisibility: "native signal/match/response trace", status: "FULLY USED" },
  { field: "CurrentDiscomfort.severity0To10", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical signal and match severity", downstreamReceiver: "trace consumers", behavioralEffect: "severity 1 and 2 remain numerically identical pending calibration", traceVisibility: "native signal/match/eligibility trace", status: "PARTIALLY USED" },
  { field: "CurrentDiscomfort.region", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical signal trace, capability adjustment, and scoped assessment context", downstreamReceiver: "pain trace, athleteCapability, developmentalRelationship", behavioralEffect: "matching assessment-signal region applies existing capability context and may establish demand-reduction relevance", traceVisibility: "native signal and assessment trace", status: "FULLY USED" },
  { field: "CurrentDiscomfort.stressTags", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical matches, pain_suitability, joint_cost, assessment context", downstreamReceiver: "pain receiver policies and assessment trace", behavioralEffect: "0.9 per unique signal/tag pain unit; 0.8 per qualifying unique joint unit; may justify demand reduction", traceVisibility: "native matched tag/source and receiver counts", status: "FULLY USED" },
  { field: "CurrentDiscomfort.effect", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "structured response requirement and exact assessment action", downstreamReceiver: "response ownership and developmentalRelationship", behavioralEffect: "monitor is observation-only; support/range/load actions are explicitly deferred and not scored", traceVisibility: "native response and assessment trace", status: "FULLY USED" },
  { field: "CurrentDiscomfort.description", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "none", traceVisibility: "absent", status: "UNUSED" },
  { field: "ModeratePain.kind", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical signal kind", downstreamReceiver: "pain trace and receiver policies", behavioralEffect: "selects warning, suitability, joint, and assessment receiver policies", traceVisibility: "native signal trace", status: "FULLY USED" },
  { field: "ModeratePain.id", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical match identity, warning, score, response, and assessment evidence", downstreamReceiver: "pain receivers, demandReductionContext, row diagnostics", behavioralEffect: "emits at most one warning per signal/candidate and keeps distinct signals traceable", traceVisibility: "native signal/match/eligibility/response trace", status: "FULLY USED" },
  { field: "ModeratePain.severity0To10", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical signal, match, and warning severity", downstreamReceiver: "trace consumers", behavioralEffect: "severity 3 through 6 remain numerically identical pending calibration", traceVisibility: "native signal/match/eligibility trace", status: "PARTIALLY USED" },
  { field: "ModeratePain.region", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical signal trace, capability adjustment, and scoped assessment context", downstreamReceiver: "pain trace, athleteCapability, developmentalRelationship", behavioralEffect: "matching assessment-signal region applies existing capability context and can establish assessment relevance", traceVisibility: "native signal and assessment trace", status: "FULLY USED" },
  { field: "ModeratePain.stressTags", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical warning, pain_suitability, joint_cost, and assessment matches", downstreamReceiver: "pain receiver policies and assessment trace", behavioralEffect: "warning on any structured source; 1.8 per unique signal/tag pain unit; 1.4 per qualifying unique joint unit", traceVisibility: "native matched tag/source and receiver counts", status: "FULLY USED" },
  { field: "ModeratePain.requiredResponse", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "structured response requirement and exact assessment action", downstreamReceiver: "candidate review, prescription, or Session Intent / Session Composer", behavioralEffect: "numeric scores remain identical; ownership and deferred execution status differ", traceVisibility: "native response, warning, and assessment trace", status: "FULLY USED" },
  { field: "ModeratePain.description", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "warning message", downstreamReceiver: "painReviewEligibility", behavioralEffect: "changes warning prose only", traceVisibility: "warning message", status: "FULLY USED" },
  { field: "AcuteSeverePain.kind", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical signal kind", downstreamReceiver: "acute eligibility and response trace", behavioralEffect: "selects the explicit acute authority filter", traceVisibility: "native signal trace", status: "FULLY USED" },
  { field: "AcuteSeverePain.id", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical match, rejection, urgency, and response evidence", downstreamReceiver: "acute eligibility and DecisionTrace", behavioralEffect: "identifies rejection and unresolved urgency evidence", traceVisibility: "native signal/match/eligibility/response trace", status: "FULLY USED" },
  { field: "AcuteSeverePain.severity0To10", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical signal, match, and eligibility severity", downstreamReceiver: "trace consumers", behavioralEffect: "severity 7 through 10 remain identical under the preserved acute authority filter", traceVisibility: "native signal/match/eligibility trace", status: "PARTIALLY USED" },
  { field: "AcuteSeverePain.region", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical signal and match region", downstreamReceiver: "trace consumers", behavioralEffect: "observability only at Candidate Intelligence scope", traceVisibility: "native signal/match trace", status: "PARTIALLY USED" },
  { field: "AcuteSeverePain.stressTags", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "canonical matched facts and explicit acute criterion", downstreamReceiver: "acute eligibility", behavioralEffect: "rejects only when a canonical match has joint_stress provenance; caution/contraindicated-only remains legal", traceVisibility: "native matched tag/source and criterion", status: "FULLY USED" },
  { field: "AcuteSeverePain.invalidatesTrainingRoles", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "hard rejection criterion", downstreamReceiver: "acute eligibility", behavioralEffect: "rejects candidates evaluated for an explicitly invalidated requested role", traceVisibility: "native training-role criterion", status: "FULLY USED" },
  { field: "AcuteSeverePain.urgentReviewRecommended", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "structured urgent-review requirement", downstreamReceiver: "DecisionTrace and external urgent review", behavioralEffect: "preserved whether the candidate is legal or already rejected", traceVisibility: "native signal and response trace", status: "FULLY USED" },
  { field: "AcuteSeverePain.description", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "hard-rejection message", downstreamReceiver: "contraindicationEligibility", behavioralEffect: "changes rejection prose only", traceVisibility: "rejection message", status: "FULLY USED" },
  { field: "HardContraindication.kind", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "canonical signal kind", downstreamReceiver: "hard eligibility", behavioralEffect: "selects explicit hard authority", traceVisibility: "native signal trace", status: "FULLY USED" },
  { field: "HardContraindication.id", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "canonical match and rejection identity", downstreamReceiver: "hard eligibility and DecisionTrace", behavioralEffect: "identifies exact hard criteria", traceVisibility: "native signal/match/eligibility trace", status: "FULLY USED" },
  { field: "HardContraindication.region", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "none", traceVisibility: "absent", status: "UNUSED" },
  { field: "HardContraindication.exerciseIds", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "hard rejection", downstreamReceiver: "hard eligibility", behavioralEffect: "exact exercise ID match rejects", traceVisibility: "native exercise-ID criterion", status: "FULLY USED" },
  { field: "HardContraindication.stressTags", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "canonical matched facts and hard criterion", downstreamReceiver: "hard eligibility", behavioralEffect: "joint_stress or contraindicated provenance rejects; caution-only does not", traceVisibility: "native matched tag/source and criterion", status: "FULLY USED" },
  { field: "HardContraindication.reason", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "hard-rejection message", downstreamReceiver: "contraindicationEligibility", behavioralEffect: "changes rejection prose only", traceVisibility: "rejection message", status: "FULLY USED" },
  { field: "HardContraindication.source", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "hard authority provenance", downstreamReceiver: "eligibility evidence and DecisionTrace", behavioralEffect: "does not change rejection magnitude; preserves who supplied the authority", traceVisibility: "native signal and criterion trace", status: "FULLY USED" },
  { field: "PersonalExerciseBlock.kind", primaryOwnerGiver: "athlete/coach", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "collection membership supplies the category", traceVisibility: "input only", status: "UNUSED" },
  { field: "PersonalExerciseBlock.id", primaryOwnerGiver: "athlete/coach", currentOutput: "rejection evidence", downstreamReceiver: "personalBlockEligibility", behavioralEffect: "identifies block evidence", traceVisibility: "rejection evidence", status: "FULLY USED" },
  { field: "PersonalExerciseBlock.exerciseIds", primaryOwnerGiver: "athlete/coach", currentOutput: "hard preference rejection", downstreamReceiver: "personalBlockEligibility", behavioralEffect: "exact exercise ID match rejects", traceVisibility: "block ID, not matched criterion", status: "FULLY USED" },
  { field: "PersonalExerciseBlock.exerciseFamilies", primaryOwnerGiver: "athlete/coach", currentOutput: "hard preference rejection", downstreamReceiver: "personalBlockEligibility", behavioralEffect: "exercise-family match rejects", traceVisibility: "block ID, not matched criterion", status: "FULLY USED" },
  { field: "PersonalExerciseBlock.reason", primaryOwnerGiver: "athlete/coach", currentOutput: "rejection message", downstreamReceiver: "personalBlockEligibility", behavioralEffect: "changes rejection prose only", traceVisibility: "rejection message", status: "FULLY USED" },
  { field: "PersonalExerciseBlock.createdBy", primaryOwnerGiver: "athlete/coach", currentOutput: "none; output source is athlete_preference", downstreamReceiver: "none", behavioralEffect: "athlete and coach are identical", traceVisibility: "absent", status: "UNUSED" },
];

export const PAIN_PIPELINE: readonly PainPipelineRow[] = [
  { stage: "pain/injury input", reads: "typed PainAndInjuryState collections", ignores: "HistoricalInjury remains intentionally unconsumed", reject: "no", warn: "no", score: "no", deferredResponsibility: "upstream owns observation/normalization and diagnosis; V2 does not diagnose" },
  { stage: "canonical pain evidence", reads: "pain signal IDs/kinds/regions/severity/actions/tags plus structured exercise stress metadata", ignores: "exercise ID/name/prose/equipment as inferred stress", reject: "no", warn: "no", score: "no", deferredResponsibility: "creates one deterministic signalId+stressTag fact with source provenance" },
  { stage: "hard contraindication eligibility", reads: "exact exercise IDs or canonical hard stress matches through joint_stress/contraindicated provenance", ignores: "caution-only hard overlap", reject: "yes", warn: "no", score: "no", deferredResponsibility: "preserves athlete_report/clinician/coach/safety_rule authority" },
  { stage: "acute/severe eligibility", reads: "requested-role invalidation or canonical joint_stress match", ignores: "caution-only and contraindicated-only matches as hard authority", reject: "yes", warn: "no", score: "no", deferredResponsibility: "urgent review remains structured and unresolved even when candidate is legal or rejected" },
  { stage: "moderate-pain warning", reads: "canonical moderate matches from any structured stress source", ignores: "none of the structured source types", reject: "no", warn: "yes", score: "no", deferredResponsibility: "one warning per signal/candidate includes response ownership and execution status" },
  { stage: "pain_suitability", reads: "unique current/moderate/historical signal-tag facts from every structured source", ignores: "severity/action as score magnitude; HistoricalInjury; acute/hard signals", reject: "no", warn: "reason code only", score: "yes", deferredResponsibility: "relative compatibility among legal candidates" },
  { stage: "joint_cost", reads: "unique owned facts with joint_stress or caution provenance; axial loading; joint accumulation", ignores: "contraindicated-only facts as cost units; severity/action as score magnitude", reject: "no", warn: "reason code only", score: "yes", deferredResponsibility: "session-level accumulation remains future composition work" },
  { stage: "stability_fit", reads: "exercise stability demand and phase target", ignores: "all pain inputs", reject: "no", warn: "no", score: "yes", deferredResponsibility: "pain-related support preference belongs to an explicit future receiver" },
  { stage: "assessment demand/capability", reads: "canonical stress facts plus independent structured region/movement context and exact requested actions", ignores: "HistoricalInjury and unmodeled side", reject: "no", warn: "no", score: "indirectly through assessment/alignment when relevant", deferredResponsibility: "does not execute load/range/support or role substitution" },
  { stage: "candidate aggregate / trace", reads: "legal candidates, receiver counts, structured eligibility evidence, and response requirements", ignores: "rejected-candidate score values", reject: "already decided upstream", warn: "eligibility warnings retained", score: "weighted mean", deferredResponsibility: "prescription, composition, and progression receivers remain unimplemented" },
];

export const PAIN_STRESS_UNIVERSE: readonly StressUniverseRow[] = [
  { receiver: "moderate warning", jointStressTags: "read", cautionStressTags: "read", contraindicatedStressTags: "read", deduplication: "one warning per signal/candidate; canonical signal-tag facts retain every source" },
  { receiver: "pain_suitability", jointStressTags: "read", cautionStressTags: "read", contraindicatedStressTags: "read", deduplication: "one unit per signalId+stressTag regardless of source count or duplicate tag occurrence" },
  { receiver: "joint_cost", jointStressTags: "read", cautionStressTags: "read", contraindicatedStressTags: "visible, not counted alone", deduplication: "one unit per qualifying signalId+stressTag even when joint and caution both establish it" },
  { receiver: "hard contraindication", jointStressTags: "read", cautionStressTags: "visible, not authority alone", contraindicatedStressTags: "read", deduplication: "canonical facts plus exact exercise-ID criteria; authority source retained" },
  { receiver: "acute/severe eligibility", jointStressTags: "read", cautionStressTags: "visible, not authority alone", contraindicatedStressTags: "visible, not authority alone", deduplication: "canonical facts; requested-role invalidation remains independent hard authority" },
  { receiver: "assessment demand-reduction context", jointStressTags: "read", cautionStressTags: "read", contraindicatedStressTags: "read", deduplication: "canonical stress facts; region and movement context remain independent structured matches" },
];

export function buildPainAuditData(): PainAuditData {
  return {
    baselineHead: AUDIT_BASELINE_HEAD,
    existingScenarioFingerprint: buildExistingScenarioFingerprint(),
    expectedExistingScenarioFingerprint: EXPECTED_EXISTING_SCENARIO_FINGERPRINT,
    fieldConsumption: PAIN_FIELD_CONSUMPTION,
    pipeline: PAIN_PIPELINE,
    matrix: buildControlledPainMatrix(),
    severityContrasts: buildSeverityContrasts(),
    requiredResponseContrasts: buildRequiredResponseContrasts(),
    discomfortEffectContrasts: buildDiscomfortEffectContrasts(),
    historicalModificationContrasts: buildHistoricalModificationContrasts(),
    regionSideContrasts: buildRegionSideContrasts(),
    stressTagAudit: buildStressTagAudit(),
    stressUniverse: PAIN_STRESS_UNIVERSE,
    contraindicatedOnlyProbe: buildContraindicatedOnlyProbe(),
  };
}

function table(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  const escape = (value: string) => value.replaceAll("|", "\\|").replaceAll("\n", "<br>");
  return [
    `| ${headers.map(escape).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => escape(cell)).join(" | ")} |`),
  ].join("\n");
}

function fmt(value: number | null, digits = 3): string {
  return value === null ? "-" : value.toFixed(digits);
}

function list(values: readonly string[]): string {
  return values.length > 0 ? values.join(", ") : "-";
}

function contrastTable(rows: readonly PainContrastRow[]): string {
  return table(
    [
      "Variant",
      "Candidate",
      "Warning",
      "Pain",
      "Joint",
      "Stability",
      "Assessment",
      "Alignment",
      "Capability",
      "Relationship / Reduction",
      "Total / Rank",
    ],
    rows.map((row) => [
      row.variant,
      row.candidateId,
      row.warning,
      row.painSuitability.toFixed(3),
      row.jointCost.toFixed(3),
      row.stabilityFit.toFixed(3),
      row.assessmentFit.toFixed(3),
      row.alignmentFit.toFixed(3),
      fmt(row.capability),
      `${row.relationship} / ${row.demandReductionRelevant === null ? "not_present" : row.demandReductionRelevant ? "relevant" : "not_relevant"}`,
      `${row.total.toFixed(3)} / ${row.rank}`,
    ]),
  );
}

function matrixTable(rows: readonly PainMatrixRow[]): string {
  return table(
    [
      "State",
      "Candidate",
      "Outcome",
      "Hard Rejection",
      "Warning",
      "Signal",
      "Region / Tags",
      "Matched Stress / Metadata Sources",
      "Counts U/P/J",
      "Pain Raw / Weighted",
      "Joint Raw / Weighted",
      "Stability",
      "Assessment / Demand Reduction",
      "Total / Rank",
    ],
    rows.map((row) => [
      row.state,
      row.candidateId,
      row.outcome,
      row.hardRejectionReason,
      row.warning,
      `${row.painSignalId}; ${row.painKind}; severity=${row.severity}; effect/response=${row.effectOrResponse}`,
      `${row.region}; ${list(row.stressTags)}`,
      `${list(row.matchedExerciseStressTags)}; ${list(row.matchedMetadataSources)}`,
      `${row.uniqueOverlapCount}/${row.painCountedOverlap}/${row.jointCountedOverlap}`,
      `${fmt(row.painSuitabilityRaw)} / ${fmt(row.painSuitabilityWeightedContribution, 6)}`,
      `${fmt(row.jointCostRaw)} / ${fmt(row.jointCostWeightedContribution, 6)}`,
      fmt(row.stabilityFit),
      row.assessmentRelationship,
      `${fmt(row.total)} / ${row.rank ?? "-"}`,
    ]),
  );
}

export function renderPainSemanticsCalibrationReview(data: PainAuditData): string {
  const matrixIds = unique(data.matrix.map((row) => row.matrixId));
  const matrixSections = matrixIds.flatMap((matrixId) => {
    const rows = data.matrix.filter((row) => row.matrixId === matrixId);
    const title = rows[0]?.matrix ?? matrixId;
    return [`### ${title}`, "", matrixTable(rows), ""];
  });
  const resolvedDuplicateRows = data.stressTagAudit.filter(
    (row) => row.duplicateClassification === "RESOLVED_SOURCE_DEDUPLICATION",
  );

  return [
    "# Pain Semantics And Calibration Review",
    "",
    `Audit baseline: \`${data.baselineHead}\` on \`engine-v2/candidate-intelligence\`.` ,
    "",
    "Scope: post-contract deterministic evidence. Pain/joint coefficients, exercise metadata, phase values, component weights, severity calibration, prescription, and Session Composer remain unchanged. Training Engine V2 consumes normalized training inputs and does not diagnose injury or disease.",
    "",
    "## Audit Result",
    "",
    "Candidate pain decisions now derive from one deterministic, source-aware evidence set. Receiver policies retain independent warning, scoring, hard-authority, acute-authority, assessment-context, and deferred-response responsibilities. Joint/caution provenance no longer multiplies one physiological match unit, and stability fit no longer reads pain.",
    "",
    "Final state: **PAIN_CONTRACT_READY_FOR_HUMAN_CALIBRATION**",
    "",
    `Post-contract controlled-scenario ranking fingerprint: \`${data.existingScenarioFingerprint}\` (${data.existingScenarioFingerprint === data.expectedExistingScenarioFingerprint ? "matches the reviewed post-contract fixture" : "CHANGED"}).`,
    "",
    "## Authority And Method",
    "",
    "Reviewed authority: `ENGINE_V2_BLUEPRINT.md`, `DOMAIN.md`, `SCORING.md`, and `FINAL_CANDIDATE_INTELLIGENCE_REVIEW.md`. Reviewed runtime paths: the pain domain, contraindication and pain-review eligibility, pain suitability, joint cost, stability fit, athlete capability, developmental relationship, row diagnostics, and every pain-related controlled test/scenario.",
    "",
    `All requests use fixed \`evaluationContext.asOf=${FIXED_AS_OF}\`. The controlled matrix contains ${data.matrix.length} candidate/state rows. Rejected candidates show score fields as \`-\` because hard eligibility removes them before candidate scoring; unchanged legal values remain printed.`,
    "",
    "## Field Consumption Inventory",
    "",
    table(
      ["Input Field", "Primary Owner / Giver", "Current Output", "Downstream Receiver", "Current Behavioral Effect", "Trace Visibility", "Status"],
      data.fieldConsumption.map((row) => [row.field, row.primaryOwnerGiver, row.currentOutput, row.downstreamReceiver, row.behavioralEffect, row.traceVisibility, row.status]),
    ),
    "",
    "Key field conclusions:",
    "",
    "- Every `HistoricalInjury` field is currently dead input for Candidate Intelligence.",
    "- Current and moderate severity values are visible in native trace output but still do not scale candidate scores; that policy remains for human calibration.",
    "- `ModeratePain.requiredResponse`, `AcuteSeverePain.urgentReviewRecommended`, and `HardContraindication.source` are preserved in structured response or eligibility evidence.",
    "- Region remains structured assessment context; side is explicit as unknown for current matchable signal types and `HistoricalInjury.side` remains unconsumed.",
    "- Current effect and historical preferred modification retain their exact action and truthful observation/deferred ownership status without changing score magnitude.",
    "",
    "## Current Decision Pipeline",
    "",
    "```text",
    "pain/injury input",
    "  -> canonical source-aware candidate pain facts",
    "  -> explicit receiver policies and response ownership",
    "  -> hard contraindication + acute/severe eligibility",
    "  -> moderate-pain review warning",
    "  -> legal candidate pool",
    "  -> pain_suitability",
    "  -> joint_cost",
    "  -> stability_fit",
    "  -> assessment capability + demand-reduction context (when assessment exists)",
    "  -> weighted candidate total + DecisionTrace",
    "```",
    "",
    table(
      ["Stage", "Reads", "Ignores", "Can Reject", "Can Warn", "Can Score", "Deferred Responsibility"],
      data.pipeline.map((row) => [row.stage, row.reads, row.ignores, row.reject, row.warn, row.score, row.deferredResponsibility]),
    ),
    "",
    "## Current Formulas",
    "",
    "The component helper clamps each computed value to `[0, 10]`; `rawValue` is the post-clamp component value.",
    "",
    "```text",
    "pain_suitability = 8.2",
    "  - discomfortOverlap * 0.9",
    "  - moderateOverlap * 1.8",
    "  - sensitivityOverlap * 0.4",
    "",
    "joint_cost = 8.8",
    "  - activeOverlap * 0.8",
    "  - moderateOverlap * 1.4",
    "  - historicalOverlap * 0.35",
    "  - axialCost * 0.35",
    "  - jointAccumulation",
    "",
    "axialCost = demandValue(axialLoading) - 1",
    "jointAccumulation = 0.7 when joint_stress_accumulated is present, else 0",
    "```",
    "",
    "The emitted 18-component candidate score has total weight `16.2`. `pain_suitability` has configured weight `1.2`, normalized weight `0.074074`; `joint_cost` has configured weight `0.8`, normalized weight `0.049383`; `stability_fit` has configured weight `0.7`, normalized weight `0.043210`. Each weighted contribution is raw component value multiplied by the exact unrounded configured-weight share, then rounded to six decimals. The aggregate is the weighted mean and is rounded to three decimals for `total`.",
    "",
    "`pain_suitability` emits `PAIN_SUITABLE` with no current/moderate/sensitivity overlap and `PAIN_REQUIRES_REVIEW` otherwise. `joint_cost` emits `PAIN_REQUIRES_REVIEW` only for current or moderate overlap; historical overlap alone retains `JOINT_COST_ACCEPTABLE`. Moderate warning eligibility emits `PAIN_REQUIRES_REVIEW` on caution overlap. Hard contraindication and acute/severe matches emit `HARD_CONTRAINDICATION` and prevent all scoring.",
    "",
    "## Moderate Severity Contrast",
    "",
    "Severity 3, 4, 5, and 6 produce identical warning state, pain suitability, joint cost, stability fit, assessment/alignment values, totals, and ranks for otherwise identical low-back hinge requests. The supplied severity remains visible in canonical, warning, and score-component evidence; scaling is intentionally deferred.",
    "",
    contrastTable(data.severityContrasts),
    "",
    "## Required Response Contrast",
    "",
    "`avoid_aggravator`, `reduce_load_and_range`, and `substitute_role` remain numerically identical, but their structured requirements now identify candidate review, prescription, and Session Intent / Session Composer ownership respectively. None is falsely reported as executed.",
    "",
    contrastTable(data.requiredResponseContrasts),
    "",
    "## Current Discomfort Effect Contrast",
    "",
    "Pain suitability, joint cost, stability fit, and capability ignore the effect value as score magnitude. `monitor` is observation-only; `prefer_support`, `reduce_range`, and `reduce_load` preserve distinct actions and deferred owners. Actionable values can still establish the existing scoped assessment context but are not executed here.",
    "",
    contrastTable(data.discomfortEffectContrasts),
    "",
    "## Historical Modification Contrast",
    "",
    "Pain suitability and joint cost ignore preferred modification as score magnitude. `monitor` remains observation-only; `increase_support`, `reduce_range`, and `reduce_load` retain distinct structured actions and truthful deferred owners while preserving existing assessment-context semantics.",
    "",
    contrastTable(data.historicalModificationContrasts),
    "",
    "## Region And Side Contrast",
    "",
    "With identical stress tags, pain suitability, joint cost, warning behavior, stability fit, totals, and ranks do not change by region. Region can still change the generic assessment capability trace (`-0.35` moderate or `-0.15` current when the pain region equals the assessment-signal region), and can establish demand-reduction context when no stress overlap exists. `HistoricalInjury.side` has no receiver and produces no trace or score difference.",
    "",
    table(
      ["Contrast", "Variant", "Candidate", "Pain", "Joint", "Stability", "Capability", "Relationship", "Total / Rank"],
      data.regionSideContrasts.map((row) => [row.contrast, row.variant, row.candidateId, row.painSuitability.toFixed(3), row.jointCost.toFixed(3), row.stabilityFit.toFixed(3), fmt(row.capability), row.relationship, `${row.total.toFixed(3)} / ${row.rank}`]),
    ),
    "",
    "## Stress-Tag Source And Counting Audit",
    "",
    table(
      ["Receiver", "loading.jointStressTags", "cautionStressTags", "contraindicatedStressTags", "Deduplication"],
      data.stressUniverse.map((row) => [row.receiver, row.jointStressTags, row.cautionStressTags, row.contraindicatedStressTags, row.deduplication]),
    ),
    "",
    "The canonical unit is `signalId + stressTag`. Duplicate tag occurrences within one signal and duplicate exercise metadata sources do not multiply that fact; all matching sources remain visible as provenance. Distinct signal IDs remain distinct evidence.",
    "",
    `Across the required representative exercises, ${resolvedDuplicateRows.length} exercise/tag rows are classified \`RESOLVED_SOURCE_DEDUPLICATION\`: every one now has one pain-suitability unit and one joint-cost unit despite joint+caution provenance.`,
    "",
    table(
      ["Exercise", "Tag", "Metadata Sources", "Unique Facts", "Pain Count", "Joint Count", "Moderate Warning", "Hard Contra", "Acute/Severe", "Classification"],
      data.stressTagAudit.map((row) => [row.exerciseId, row.tag, row.metadataSources.join(" + "), String(row.uniqueFactCount), String(row.painSuitabilityCount), String(row.jointCostCount), row.warningResult, row.hardContraindicationResult, row.acuteSevereResult, row.duplicateClassification]),
    ),
    "",
    "### Contraindicated-Only Probe",
    "",
    `A synthetic exercise with \`high_impact\` only in \`contraindicatedStressTags\` proves the source roles: current discomfort gives pain suitability ${data.contraindicatedOnlyProbe.painSuitability.toFixed(3)}; joint cost remains ${data.contraindicatedOnlyProbe.jointCost.toFixed(3)}; moderate warning is ${data.contraindicatedOnlyProbe.warning ? "present" : "absent"}; an explicit hard contraindication ${data.contraindicatedOnlyProbe.hardContraindicationRejects ? "rejects" : "does not reject"}; acute/severe stress overlap ${data.contraindicatedOnlyProbe.acuteSevereRejects ? "rejects" : "does not reject"}. Thus contraindicated tags affect soft pain suitability and explicit hard-contraindication matching, but are neither an automatic hard gate nor part of acute/severe matching or joint cost.`,
    "",
    "Moderate warning now observes canonical matches from joint, caution, and contraindicated sources and emits at most one warning per signal/candidate. Hard and acute receivers intentionally keep narrower authority filters, and the trace identifies both matched and qualifying sources.",
    "",
    "## Controlled Pain Matrix",
    "",
    "Counts are `U/P/J`: canonical unique matched facts, units counted by pain suitability, and units counted by joint cost. Weighted values use the unchanged 18-component denominator. Acute/severe signals use stress overlap with an empty `invalidatesTrainingRoles` list so the table isolates receiver authority; hard contraindications use stress tags rather than exercise IDs.",
    "",
    ...matrixSections,
    "## Unrelated-Pain Finding",
    "",
    "The unrelated pain examples have zero matched stress tags, no pain-suitability or joint-cost change, no warning, and no hard rejection. They are now fully score-neutral: `stability_fit` reads only exercise stability demand and phase expectation, so each unrelated-pain row is identical to its no-pain baseline.",
    "",
    "## Component Ownership Audit",
    "",
    table(
      ["Owner", "Current Finding", "Ownership Assessment"],
      [
        ["Hard eligibility", "Explicit exercise/stress contraindications and acute role/joint overlap reject before scoring.", "Correct layer; source provenance, qualifying criteria, severity, role evidence, and urgency are structured."],
        ["Pain review warning", "Any canonical moderate stress match emits one warning per signal/candidate.", "Correct non-hard receiver; required response and defer status are attached."],
        ["Pain suitability", "Unique current/moderate/historical signal-tag facts compare legal candidates.", "Correct direct-compatibility owner with native tag/source/count trace."],
        ["Joint cost", "Unique joint/caution-qualified facts, axial loading, and accumulated joint fatigue affect cost.", "Correct exposure owner; duplicate source charging is removed and contraindicated-only facts remain visible but uncharged."],
        ["Stability fit", "Exercise stability demand is compared with phase expectation.", "Correct owner; pain no longer leaks into this component."],
        ["Assessment/demand reduction", "Canonical stress facts plus region/movement context and exact actions can change developmental relationship.", "Correct scoped receiver; execution remains truthfully deferred."],
        ["Prescription", "Not implemented in Candidate Intelligence.", "Future owner for load, range, support, tempo, effort, and volume actions."],
        ["Session Composer", "Not implemented and not started.", "Future owner for role substitution, ordering, accumulated stress, replacement context, and session redirection."],
      ],
    ),
    "",
    "One canonical matched truth now supports multiple explicit receiver policies. Pain suitability owns direct compatibility, joint cost owns qualified stress exposure, warning owns review observability, hard/acute receivers own distinct authority, and assessment owns contextual developmental reasoning; no receiver reconstructs stress truth independently.",
    "",
    "## Required-Response Ownership",
    "",
    "### avoid_aggravator",
    "",
    "Candidate Intelligence preserves this as `policy_unresolved_candidate_review_required`. It does not silently convert the request into hard authority or claim that a later prescription/composition action is executable.",
    "",
    "### reduce_load_and_range",
    "",
    "Primary future receiver is prescription because load and range modify the selected exercise. Current status is `deferred_unexecutable_at_candidate_layer`; no automatic modification or extra score magnitude is invented.",
    "",
    "### substitute_role",
    "",
    "Primary future receiver is Session Intent / Session Composer because isolated candidate scoring cannot replace a requested role while preserving session purpose and coverage. Current status is `deferred_unexecutable_at_candidate_layer`; training-role truth remains hard and no substitution is performed.",
    "",
    "## Human Exercise-Science Review",
    "",
    "The following are **HUMAN_EXERCISE_SCIENCE_REVIEW** questions, not conclusions encoded by this audit:",
    "",
    "- Should severity 3 and severity 6 be identical once stress overlap and required response are held constant?",
    "- Should severity influence use linear scaling, categorical bands, response-based policy, or a combination?",
    "- Should severity affect relative pain suitability, review urgency, prescription requirements, or all three with separate bounds?",
    "- Is pain intensity alone ever sufficient for hard exclusion, or must hard exclusion require an explicit role/stress prohibition or contraindication source?",
    "- Should `requiredResponse` and specific stress overlap carry more authority than the raw severity number?",
    "- Should future source-specific physiology distinguish joint exposure from caution provenance, and if so what new explicit evidence would justify more than one canonical unit?",
    "- Which explicit support mechanics and pain actions should a future prescription or composition receiver require before preferring support?",
    "",
    "## Findings By Priority",
    "",
    "### P0",
    "",
    "- None. Explicit hard contraindications remain hard, legal candidates cannot score through a hard rejection, behavior is deterministic, and no diagnostic inference was found.",
    "",
    "### P1",
    "",
    "- Establish a human-reviewed moderate-severity policy and calibrate the frozen pain/joint coefficients against the now-settled canonical counting unit. Severity 3 through 6 remain numerically identical.",
    "",
    "### P2",
    "",
    "- Decide whether and how `HistoricalInjury` should influence Candidate Intelligence; every field is currently unused and invisible.",
    "- Validate or normalize duplicate tags and duplicate same-kind pain signals at the input boundary if they are not intended to stack.",
    "",
    "## Blueprint Maintenance",
    "",
    "The blueprint now records the enduring rule that pain decisions derive from canonical source-aware matched facts while receiver authority remains independent. Multiple metadata sources for one signal/tag fact do not automatically represent multiple physiological units.",
    "",
    "## Remaining Calibration Boundary",
    "",
    "The deterministic `CandidatePainMatchTrace` now records signal identity, severity, region, canonical signal/tag matches, all structured metadata sources, receiver-specific units, explicit criteria, response ownership, and execution/defer status. Human review may now choose severity policy and calibrate the unchanged coefficients without compensating for a hidden counting defect.",
    "",
    "This boundary does not authorize ranking-weight changes, exercise-science calibration, automatic role substitution, Session Composer, prescription, or medical diagnosis.",
    "",
  ].join("\n");
}

export function writePainSemanticsCalibrationReview(rootDir = process.cwd()): {
  readonly outputPath: string;
  readonly data: PainAuditData;
} {
  const data = buildPainAuditData();
  const outputPath = join(
    rootDir,
    "docs/training-engine-v2/PAIN_SEMANTICS_AND_CALIBRATION_REVIEW.md",
  );
  writeFileSync(outputPath, renderPainSemanticsCalibrationReview(data));

  return { outputPath, data };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = writePainSemanticsCalibrationReview();
  console.log(`Wrote ${result.outputPath}`);
  console.log(
    JSON.stringify(
      {
        matrixRows: result.data.matrix.length,
        fieldRows: result.data.fieldConsumption.length,
        stressRows: result.data.stressTagAudit.length,
        rankingFingerprint: result.data.existingScenarioFingerprint,
        finalState: "PAIN_CONTRACT_READY_FOR_HUMAN_CALIBRATION",
      },
      null,
      2,
    ),
  );
}
