import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CONTROLLED_CANDIDATE_SCENARIOS,
  FULL_GYM_EQUIPMENT,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  deriveAlignmentPriorities,
  evaluateHardEligibility,
  getControlledCandidateScenario,
  jointCostComponent,
  painSuitabilityComponent,
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
  "f5a39f62f2ef24026a7e3e490fe822204f6f7224870f5f1557d8f36556bf748d";

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
  return unique([
    ...candidate.loading.jointStressTags,
    ...candidate.cautionStressTags,
    ...candidate.contraindicatedStressTags,
  ]);
}

function metadataSourcesForTag(
  candidate: ExerciseDefinition,
  tag: JointStressTag,
): readonly StressMetadataSource[] {
  const sources: StressMetadataSource[] = [];
  if (candidate.loading.jointStressTags.includes(tag)) {
    sources.push("loading.jointStressTags");
  }
  if (candidate.cautionStressTags.includes(tag)) {
    sources.push("cautionStressTags");
  }
  if (candidate.contraindicatedStressTags.includes(tag)) {
    sources.push("contraindicatedStressTags");
  }

  return sources;
}

function countedPainOverlap(
  painAndInjury: PainAndInjuryState,
  candidate: ExerciseDefinition,
): number {
  const tags = new Set(exerciseStressTags(candidate));
  return [
    ...painAndInjury.currentDiscomforts,
    ...painAndInjury.moderatePain,
    ...painAndInjury.historicalSensitivities,
  ].reduce(
    (sum, pain) => sum + pain.stressTags.filter((tag) => tags.has(tag)).length,
    0,
  );
}

function overlapCount(left: readonly JointStressTag[], right: readonly JointStressTag[]): number {
  return left.filter((tag) => right.includes(tag)).length;
}

function countedJointOverlap(
  painAndInjury: PainAndInjuryState,
  candidate: ExerciseDefinition,
): number {
  const painTags = [
    ...painAndInjury.currentDiscomforts.flatMap((pain) => pain.stressTags),
    ...painAndInjury.moderatePain.flatMap((pain) => pain.stressTags),
    ...painAndInjury.historicalSensitivities.flatMap((pain) => pain.stressTags),
  ];

  return (
    overlapCount(candidate.loading.jointStressTags, painTags) +
    overlapCount(candidate.cautionStressTags, painTags)
  );
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
      const ranked = result.rankedCandidates.find(
        (rankedCandidate) => rankedCandidate.exercise.id === exerciseId,
      );
      const matchedTags = state.stressTags.filter((tag) =>
        exerciseStressTags(candidate).includes(tag),
      );
      const matchedMetadataSources = matchedTags.map(
        (tag) => `${tag}:${metadataSourcesForTag(candidate, tag).join("+")}`,
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
        uniqueOverlapCount: unique(matchedTags).length,
        painCountedOverlap: countedPainOverlap(state.painAndInjury, candidate),
        jointCountedOverlap: countedJointOverlap(state.painAndInjury, candidate),
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
      const painSuitabilityCount = 1;
      const jointCostCount =
        Number(candidate.loading.jointStressTags.includes(tag)) +
        Number(candidate.cautionStressTags.includes(tag));
      const warningResult = candidate.cautionStressTags.includes(tag) ? "warning" : "none";
      const hardContraindicationResult =
        candidate.loading.jointStressTags.includes(tag) ||
        candidate.contraindicatedStressTags.includes(tag)
          ? "reject"
          : "legal";
      const acuteSevereResult = candidate.loading.jointStressTags.includes(tag)
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
          jointCostCount > 1 ? "ACTUAL_DOUBLE_COUNT" : "NOT_APPLICABLE",
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
    warning: eligibilityFor(currentRequest, candidate).warnings.length > 0,
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
  { field: "HistoricalSensitivity.kind", primaryOwnerGiver: "athlete/coach adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "collection membership supplies the category", traceVisibility: "input only", status: "UNUSED" },
  { field: "HistoricalSensitivity.id", primaryOwnerGiver: "athlete/coach adapter", currentOutput: "score reason and assessment demand-reduction evidence", downstreamReceiver: "pain_suitability, demandReductionContext, row diagnostics", behavioralEffect: "identifies matched evidence but does not change magnitude", traceVisibility: "partial", status: "PARTIALLY USED" },
  { field: "HistoricalSensitivity.region", primaryOwnerGiver: "athlete/coach adapter", currentOutput: "assessment demand-reduction match", downstreamReceiver: "developmentalRelationship", behavioralEffect: "can scope a non-monitor modification to an assessment/candidate context", traceVisibility: "assessment trace only", status: "PARTIALLY USED" },
  { field: "HistoricalSensitivity.stressTags", primaryOwnerGiver: "athlete/coach adapter", currentOutput: "pain_suitability, joint_cost, assessment context, row diagnostic", downstreamReceiver: "candidate scoring and assessment trace", behavioralEffect: "0.4 per pain overlap; 0.35 per joint/caution occurrence; may justify demand reduction", traceVisibility: "score reason/count and assessment IDs; matched tags/sources are not native trace fields", status: "FULLY USED" },
  { field: "HistoricalSensitivity.preferredModification", primaryOwnerGiver: "athlete/coach adapter", currentOutput: "binary demand-reduction relevance", downstreamReceiver: "developmentalRelationship", behavioralEffect: "monitor is ignored; increase_support, reduce_range, and reduce_load are treated identically", traceVisibility: "non-monitor value appears in assessment evidence", status: "PARTIALLY USED" },
  { field: "HistoricalSensitivity.description", primaryOwnerGiver: "athlete/coach adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "none", traceVisibility: "absent", status: "UNUSED" },
  { field: "CurrentDiscomfort.kind", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "collection membership supplies the category", traceVisibility: "input only", status: "UNUSED" },
  { field: "CurrentDiscomfort.id", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "interpreted pain ID, score reason, assessment evidence", downstreamReceiver: "request trace, pain_suitability, demandReductionContext, row diagnostics", behavioralEffect: "identifies evidence but does not change magnitude", traceVisibility: "partial", status: "PARTIALLY USED" },
  { field: "CurrentDiscomfort.severity0To10", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "severity 1 and 2 are identical", traceVisibility: "absent", status: "UNUSED" },
  { field: "CurrentDiscomfort.region", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "capability adjustment and scoped demand-reduction context", downstreamReceiver: "athleteCapability, developmentalRelationship, row diagnostics", behavioralEffect: "matching assessment-signal region applies -0.15 capability; may establish context even without tag overlap", traceVisibility: "indirect capability evidence/context", status: "PARTIALLY USED" },
  { field: "CurrentDiscomfort.stressTags", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "pain_suitability, joint_cost, assessment context, row diagnostic", downstreamReceiver: "candidate scoring and assessment trace", behavioralEffect: "0.9 per pain overlap; 0.8 per joint/caution occurrence; may justify demand reduction", traceVisibility: "score reason/count and assessment IDs; matched tags/sources are not native trace fields", status: "FULLY USED" },
  { field: "CurrentDiscomfort.effect", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "binary demand-reduction relevance", downstreamReceiver: "developmentalRelationship", behavioralEffect: "monitor is ignored; prefer_support, reduce_range, and reduce_load are treated identically; no direct prescription exists", traceVisibility: "matched ID only; exact effect is absent", status: "PARTIALLY USED" },
  { field: "CurrentDiscomfort.description", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "none", traceVisibility: "absent", status: "UNUSED" },
  { field: "ModeratePain.kind", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "collection membership supplies the category", traceVisibility: "input only", status: "UNUSED" },
  { field: "ModeratePain.id", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "interpreted pain ID, warning evidence, score reason, assessment evidence", downstreamReceiver: "request trace, pain warning, pain_suitability, demandReductionContext, row diagnostics", behavioralEffect: "identifies evidence but does not change magnitude", traceVisibility: "partial", status: "PARTIALLY USED" },
  { field: "ModeratePain.severity0To10", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "severity 3, 4, 5, and 6 are identical", traceVisibility: "absent", status: "UNUSED" },
  { field: "ModeratePain.region", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "capability adjustment and scoped demand-reduction context", downstreamReceiver: "athleteCapability, developmentalRelationship", behavioralEffect: "matching assessment-signal region applies -0.35 capability; can establish assessment context", traceVisibility: "indirect capability evidence/context", status: "PARTIALLY USED" },
  { field: "ModeratePain.stressTags", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "warning, pain_suitability, joint_cost, assessment context, row diagnostic", downstreamReceiver: "eligibility warning, candidate scoring, assessment trace", behavioralEffect: "warning on caution overlap; 1.8 per pain overlap; 1.4 per joint/caution occurrence", traceVisibility: "warning evidence, score reason/count, assessment ID; native matched tag/source trace is absent", status: "FULLY USED" },
  { field: "ModeratePain.requiredResponse", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "none", downstreamReceiver: "none implemented", behavioralEffect: "avoid_aggravator, reduce_load_and_range, and substitute_role are identical", traceVisibility: "absent", status: "UNUSED" },
  { field: "ModeratePain.description", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "warning message", downstreamReceiver: "painReviewEligibility", behavioralEffect: "changes warning prose only", traceVisibility: "warning message", status: "FULLY USED" },
  { field: "AcuteSeverePain.kind", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "collection membership supplies the category", traceVisibility: "input only", status: "UNUSED" },
  { field: "AcuteSeverePain.id", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "interpreted pain ID and rejection evidence", downstreamReceiver: "request trace and contraindicationEligibility", behavioralEffect: "identifies rejection evidence", traceVisibility: "rejection evidence", status: "FULLY USED" },
  { field: "AcuteSeverePain.severity0To10", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "severity 7 through 10 are identical", traceVisibility: "absent", status: "UNUSED" },
  { field: "AcuteSeverePain.region", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "none", traceVisibility: "absent", status: "UNUSED" },
  { field: "AcuteSeverePain.stressTags", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "hard rejection", downstreamReceiver: "contraindicationEligibility", behavioralEffect: "rejects only on loading.jointStressTags overlap; caution and contraindicated-only tags are ignored", traceVisibility: "signal ID only, not matched tag/source", status: "PARTIALLY USED" },
  { field: "AcuteSeverePain.invalidatesTrainingRoles", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "hard rejection", downstreamReceiver: "contraindicationEligibility", behavioralEffect: "rejects every candidate evaluated for a listed requested role", traceVisibility: "signal ID only, not matched role", status: "FULLY USED" },
  { field: "AcuteSeverePain.urgentReviewRecommended", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "true and false are identical", traceVisibility: "absent", status: "UNUSED" },
  { field: "AcuteSeverePain.description", primaryOwnerGiver: "athlete/assessment adapter", currentOutput: "hard-rejection message", downstreamReceiver: "contraindicationEligibility", behavioralEffect: "changes rejection prose only", traceVisibility: "rejection message", status: "FULLY USED" },
  { field: "HardContraindication.kind", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "collection membership supplies the category", traceVisibility: "input only", status: "UNUSED" },
  { field: "HardContraindication.id", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "interpreted pain ID and rejection evidence", downstreamReceiver: "request trace and contraindicationEligibility", behavioralEffect: "identifies rejection evidence", traceVisibility: "rejection evidence", status: "FULLY USED" },
  { field: "HardContraindication.region", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "none", traceVisibility: "absent", status: "UNUSED" },
  { field: "HardContraindication.exerciseIds", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "hard rejection", downstreamReceiver: "contraindicationEligibility", behavioralEffect: "exact exercise ID match rejects", traceVisibility: "signal ID, not matched exercise criterion", status: "FULLY USED" },
  { field: "HardContraindication.stressTags", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "hard rejection", downstreamReceiver: "contraindicationEligibility", behavioralEffect: "loading.jointStressTags or contraindicatedStressTags overlap rejects; caution-only overlap does not", traceVisibility: "signal ID, not matched tag/source", status: "PARTIALLY USED" },
  { field: "HardContraindication.reason", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "hard-rejection message", downstreamReceiver: "contraindicationEligibility", behavioralEffect: "changes rejection prose only", traceVisibility: "rejection message", status: "FULLY USED" },
  { field: "HardContraindication.source", primaryOwnerGiver: "athlete/clinician/coach/safety adapter", currentOutput: "none; output source is hard-coded pain_injury", downstreamReceiver: "none", behavioralEffect: "athlete_report, clinician, coach, and safety_rule are identical", traceVisibility: "absent", status: "UNUSED" },
  { field: "PersonalExerciseBlock.kind", primaryOwnerGiver: "athlete/coach", currentOutput: "none", downstreamReceiver: "none", behavioralEffect: "collection membership supplies the category", traceVisibility: "input only", status: "UNUSED" },
  { field: "PersonalExerciseBlock.id", primaryOwnerGiver: "athlete/coach", currentOutput: "rejection evidence", downstreamReceiver: "personalBlockEligibility", behavioralEffect: "identifies block evidence", traceVisibility: "rejection evidence", status: "FULLY USED" },
  { field: "PersonalExerciseBlock.exerciseIds", primaryOwnerGiver: "athlete/coach", currentOutput: "hard preference rejection", downstreamReceiver: "personalBlockEligibility", behavioralEffect: "exact exercise ID match rejects", traceVisibility: "block ID, not matched criterion", status: "FULLY USED" },
  { field: "PersonalExerciseBlock.exerciseFamilies", primaryOwnerGiver: "athlete/coach", currentOutput: "hard preference rejection", downstreamReceiver: "personalBlockEligibility", behavioralEffect: "exercise-family match rejects", traceVisibility: "block ID, not matched criterion", status: "FULLY USED" },
  { field: "PersonalExerciseBlock.reason", primaryOwnerGiver: "athlete/coach", currentOutput: "rejection message", downstreamReceiver: "personalBlockEligibility", behavioralEffect: "changes rejection prose only", traceVisibility: "rejection message", status: "FULLY USED" },
  { field: "PersonalExerciseBlock.createdBy", primaryOwnerGiver: "athlete/coach", currentOutput: "none; output source is athlete_preference", downstreamReceiver: "none", behavioralEffect: "athlete and coach are identical", traceVisibility: "absent", status: "UNUSED" },
];

export const PAIN_PIPELINE: readonly PainPipelineRow[] = [
  { stage: "pain/injury input", reads: "typed PainAndInjuryState collections", ignores: "no validation or canonical matched-stress trace is produced here", reject: "no", warn: "no", score: "no", deferredResponsibility: "upstream owns observation/normalization and diagnosis; V2 does not diagnose" },
  { stage: "hard contraindication eligibility", reads: "hard exerciseIds; hard stressTags against joint+contraindicated; acute invalidated roles; acute stressTags against joint", ignores: "hard region/source; caution-only hard overlap; acute severity/region/urgent flag/contraindicated-only tags", reject: "yes", warn: "no", score: "no", deferredResponsibility: "none when explicit hard truth matches" },
  { stage: "acute/severe eligibility", reads: "implemented inside contraindicationEligibility using requested role or jointStressTags overlap", ignores: "severity value, region, urgentReviewRecommended, cautionStressTags, contraindicatedStressTags", reject: "yes", warn: "no", score: "no", deferredResponsibility: "urgent review is not emitted separately" },
  { stage: "moderate-pain warning", reads: "moderate stressTags against cautionStressTags; id and description", ignores: "severity, region, requiredResponse, joint-only tags, contraindicated-only tags", reject: "no", warn: "yes", score: "no", deferredResponsibility: "warning text says prescription review, but no executable requirement is emitted" },
  { stage: "pain_suitability", reads: "current, moderate, and historical-sensitivity stressTags against a deduped joint+caution+contraindicated union", ignores: "severity, region, effect, requiredResponse, preferredModification, historical injury, acute pain", reject: "no", warn: "reason code only", score: "yes", deferredResponsibility: "relative suitability only" },
  { stage: "joint_cost", reads: "current, moderate, and historical-sensitivity stressTags against joint and caution lists separately; axial loading; joint accumulation", ignores: "contraindicatedStressTags, severity, region, effect/response/modification, historical injury, acute pain", reject: "no", warn: "reason code only", score: "yes", deferredResponsibility: "session-level accumulation remains future composition work" },
  { stage: "stability_fit", reads: "whether any current or moderate record exists plus exercise stability demand and phase target", ignores: "pain kind detail, region, tags, severity, effect, requiredResponse, actual support metadata", reject: "no", warn: "no", score: "yes", deferredResponsibility: "support selection/prescription is not implemented" },
  { stage: "assessment demand/capability", reads: "current/moderate region for capability; non-monitor current effect; all moderate signals; non-monitor historical modification; union stress/context", ignores: "pain severity and requiredResponse; historical injury; side", reject: "no", warn: "no", score: "indirectly through assessment/alignment when a relevant assessment signal exists", deferredResponsibility: "does not execute load/range/support or role substitution" },
  { stage: "candidate aggregate / trace", reads: "legal candidates and emitted component values", ignores: "unconsumed pain fields and rejected-candidate score values", reject: "already decided upstream", warn: "eligibility warnings retained", score: "weighted mean", deferredResponsibility: "prescription, composition, and progression receivers are not implemented here" },
];

export const PAIN_STRESS_UNIVERSE: readonly StressUniverseRow[] = [
  { receiver: "painReviewEligibility", jointStressTags: "ignored", cautionStressTags: "read", contraindicatedStressTags: "ignored", deduplication: "boolean some() per moderate signal" },
  { receiver: "pain_suitability", jointStressTags: "read", cautionStressTags: "read", contraindicatedStressTags: "read", deduplication: "exercise union is Set-deduped; duplicate/multiple input pain tags can still stack" },
  { receiver: "joint_cost", jointStressTags: "read", cautionStressTags: "read", contraindicatedStressTags: "ignored", deduplication: "none across sources; the same tag in joint+caution counts twice" },
  { receiver: "hard contraindication", jointStressTags: "read", cautionStressTags: "ignored", contraindicatedStressTags: "read", deduplication: "boolean match" },
  { receiver: "acute/severe eligibility", jointStressTags: "read", cautionStressTags: "ignored", contraindicatedStressTags: "ignored", deduplication: "boolean match" },
  { receiver: "assessment demand-reduction context", jointStressTags: "read", cautionStressTags: "read", contraindicatedStressTags: "read", deduplication: "exercise union is Set-deduped" },
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
  const duplicateRows = data.stressTagAudit.filter(
    (row) => row.duplicateClassification === "ACTUAL_DOUBLE_COUNT",
  );

  return [
    "# Pain Semantics And Calibration Review",
    "",
    `Audit baseline: \`${data.baselineHead}\` on \`engine-v2/candidate-intelligence\`.` ,
    "",
    "Scope: deterministic audit and documentation only. No pain coefficient, joint coefficient, hard gate, warning, exercise metadata, phase value, component weight, or ranking behavior is changed here. Training Engine V2 consumes normalized training inputs and does not diagnose injury or disease.",
    "",
    "## Audit Result",
    "",
    "The pain architecture has recognizable owners, hard contraindications remain upstream of scoring, moderate/current pain is visible, and behavior is deterministic. Calibration is not yet the next safe step: the candidate layer does not consume severity or `requiredResponse`, stress-tag receivers use inconsistent universes, `joint_cost` demonstrably counts many duplicated joint/caution tags twice, and `stability_fit` gives a global low-stability bonus for unrelated pain with no shared stress fact.",
    "",
    "Final state: **PAIN_CONTRACT_FIXES_REQUIRED_BEFORE_CALIBRATION**",
    "",
    `Existing controlled-scenario ranking fingerprint: \`${data.existingScenarioFingerprint}\` (${data.existingScenarioFingerprint === data.expectedExistingScenarioFingerprint ? "unchanged from audit baseline" : "CHANGED"}).`,
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
    "- Current and moderate severity values are valid domain distinctions but have no candidate behavior or native trace output.",
    "- `ModeratePain.requiredResponse`, `AcuteSeverePain.urgentReviewRecommended`, and `HardContraindication.source` are not consumed or deferred through an explicit requirement trace.",
    "- Region is partially consumed by assessment capability/context logic; side is not consumed.",
    "- Current effect and historical preferred modification are binary assessment-context switches: `monitor` is excluded and all actionable values are otherwise equivalent at this layer.",
    "",
    "## Current Decision Pipeline",
    "",
    "```text",
    "pain/injury input",
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
    "Severity 3, 4, 5, and 6 produce identical warning state, pain suitability, joint cost, stability fit, assessment/alignment values, totals, and ranks for otherwise identical low-back hinge requests. The severity number is not present in component or warning traces.",
    "",
    contrastTable(data.severityContrasts),
    "",
    "## Required Response Contrast",
    "",
    "`avoid_aggravator`, `reduce_load_and_range`, and `substitute_role` produce identical candidate behavior and traces. Candidate Intelligence neither executes nor emits an unresolved structured response requirement.",
    "",
    contrastTable(data.requiredResponseContrasts),
    "",
    "## Current Discomfort Effect Contrast",
    "",
    "Pain suitability, joint cost, stability fit, and capability ignore the effect value. In assessment developmental context, `monitor` is excluded; `prefer_support`, `reduce_range`, and `reduce_load` all set the same demand-reduction relevance and can change assessment/alignment contributions when the candidate is below capability. Those three actions are not distinguished or executed.",
    "",
    contrastTable(data.discomfortEffectContrasts),
    "",
    "## Historical Modification Contrast",
    "",
    "Pain suitability and joint cost ignore the preferred-modification value. In assessment developmental context, `monitor` is excluded; `increase_support`, `reduce_range`, and `reduce_load` are behaviorally equivalent, although their exact value appears in assessment evidence text.",
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
    "`pain_suitability` counts one matched tag once when the same exercise tag appears in multiple metadata sources because it constructs a `Set`. It does not deduplicate duplicate tags supplied inside pain arrays or the same tag supplied by multiple pain signals. `joint_cost` adds joint-list and caution-list matches, so a tag present in both is charged twice. That is observed arithmetic, not merely a possible future risk.",
    "",
    `Across the required representative exercises, ${duplicateRows.length} exercise/tag rows are classified \`ACTUAL_DOUBLE_COUNT\`. No current code or domain contract labels the duplicate source occurrences as distinct units of joint cost.`,
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
    "Warning and scoring do not share one stress universe. A moderate signal can change pain suitability on a joint-only or contraindicated-only tag without a warning; a caution-only tag can warn and affect pain suitability/joint cost but cannot trigger explicit hard-contraindication or acute matching. The native trace reports signal IDs and aggregate counts, not the matched tag and metadata source needed to explain this discrepancy.",
    "",
    "## Controlled Pain Matrix",
    "",
    "Counts are `U/P/J`: unique matched stress facts, overlap currently counted by pain suitability, and overlap currently counted by joint cost. Weighted values use the fixed 18-component denominator. Acute/severe signals use stress overlap with an empty `invalidatesTrainingRoles` list so the table isolates stress-universe behavior. Hard contraindications use stress tags rather than exercise IDs.",
    "",
    ...matrixSections,
    "## Unrelated-Pain Finding",
    "",
    "The unrelated pain examples have zero matched stress tags, no pain-suitability or joint-cost change, no warning, and no hard rejection. They are not fully neutral: `stability_fit` checks only whether any current/moderate record exists and adds `0.8` to every low-stability candidate. Therefore unrelated wrist discomfort raises the low-stability leg press and box squat, unrelated knee discomfort raises the low-stability machine/cable/chest-supported rows, and unrelated shoulder discomfort leaves the two moderate-stability hinge candidates unchanged. This global bonus can change totals and ordering despite no explicit shared stress fact.",
    "",
    "## Component Ownership Audit",
    "",
    table(
      ["Owner", "Current Finding", "Ownership Assessment"],
      [
        ["Hard eligibility", "Explicit exercise/stress contraindications and acute role/joint overlap reject before scoring.", "Correct layer, but hard and acute stress universes differ and provenance/urgent flags are not traced."],
        ["Pain review warning", "Moderate caution overlap emits a review warning.", "Correct layer, but it ignores severity/requiredResponse and sees a narrower universe than scoring."],
        ["Pain suitability", "Current/moderate/historical-sensitivity overlap compares legal candidates.", "Correct primary owner for direct compatibility; missing matched-tag/source trace and unconsumed response semantics."],
        ["Joint cost", "Joint/caution overlap, axial loading, and accumulated joint fatigue affect cost.", "Correct owner for exposure, but duplicated joint/caution facts are charged twice and partially duplicate direct pain suitability."],
        ["Stability fit", "Any current/moderate record globally rewards low stability.", "Ownership leak: pain compatibility/support preference is asserted without relevance or support metadata."],
        ["Assessment/demand reduction", "Region, stress context, current effect, and historical modification can change developmental relationship.", "Scoped receiver is valid, but it cannot execute the requested pain response and treats actionable variants as equivalent."],
        ["Prescription", "Not implemented in Candidate Intelligence.", "Future owner for load, range, support, tempo, effort, and volume actions."],
        ["Session Composer", "Not implemented and not started.", "Future owner for role substitution, ordering, accumulated stress, replacement context, and session redirection."],
      ],
    ),
    "",
    "The same pain signal currently reaches pain suitability and joint cost through overlapping stress evidence, and can also trigger a global stability bonus plus assessment influence. Multiple receivers are not inherently wrong, but each needs a distinct semantic quantity. Current duplicate source counting and the unscoped stability bonus do not establish that distinction.",
    "",
    "## Required-Response Ownership Options",
    "",
    "### avoid_aggravator",
    "",
    "- Candidate hard gate: appropriate only if the input contract explicitly elevates matched exposure to prohibited truth. Risk: a broad stress tag or self-reported response becomes indistinguishable from a hard contraindication.",
    "- Strong candidate demotion plus unresolved requirement: preserves legal alternatives while making the concern visible. Risk: a legal winner may still be unusable if no downstream layer can satisfy avoidance.",
    "- Prescription/session instruction: appropriate when aggravation can be avoided through range, setup, load, or replacement context. Risk: Candidate Intelligence cannot prove executability today.",
    "",
    "No current authority establishes one universal choice. Candidate Intelligence should at minimum emit a structured matched response requirement with execution status rather than silently treating the field as absent.",
    "",
    "### reduce_load_and_range",
    "",
    "Primary future receiver is prescription because load and range modify the selected exercise. Candidate ranking may still account for whether a candidate can truthfully support those modifications. Risk: a ranking penalty without a prescription requirement loses the requested action; automatic modification without validated prescription capabilities invents safety certainty.",
    "",
    "### substitute_role",
    "",
    "Primary future receiver is Session Intent / Session Composer because isolated candidate scoring cannot replace a requested role while preserving session purpose and coverage. Candidate Intelligence should emit `deferred/unexecutable_at_candidate_layer` with the matched signal and requested response. Risk: letting one candidate component substitute roles would bypass training-need truth; ignoring it lets the original role proceed without the requested redirection.",
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
    "- Are joint exposure and caution annotation genuinely distinct cost evidence when they repeat the same tag, and if so what explicit units distinguish them?",
    "- When pain is unrelated to candidate stress, should low stability receive any generic preference, or must support preference be signal- and mechanics-specific?",
    "",
    "## Findings By Priority",
    "",
    "### P0",
    "",
    "- None. Explicit hard contraindications remain hard, legal candidates cannot score through a hard rejection, behavior is deterministic, and no diagnostic inference was found.",
    "",
    "### P1",
    "",
    "- Define one canonical, source-aware stress-match contract before tuning pain or joint coefficients. Warning, pain suitability, joint cost, hard contraindication, and acute/severe eligibility currently consume different universes.",
    "- Remove or explicitly justify actual duplicate charging of the same joint/caution stress tag in `joint_cost`; coefficient calibration cannot compensate for an unsettled counting unit.",
    "- Consume or explicitly defer `ModeratePain.requiredResponse`; current traces cannot distinguish avoidance, load/range reduction, and role substitution.",
    "- Scope the pain-driven `stability_fit` effect to relevant evidence and an owned semantic quantity; unrelated pain currently changes low-stability candidate totals without shared stress.",
    "- Establish a human-reviewed moderate-severity policy only after the match/count/response contracts are fixed. Severity 3 through 6 are currently identical.",
    "- Preserve acute review/provenance truth in structured output: `urgentReviewRecommended` and hard-contraindication `source` currently disappear, while acute and hard stress matching differ.",
    "",
    "### P2",
    "",
    "- Decide whether and how `HistoricalInjury` should influence Candidate Intelligence; every field is currently unused and invisible.",
    "- Add native matched pain tag, metadata source, unique fact count, and counted overlap to traces so audit tooling does not need to reconstruct them.",
    "- Decide whether current effect and historical modification variants need distinct candidate observability even when execution belongs to prescription.",
    "- Validate or normalize duplicate tags and duplicate same-kind pain signals at the input boundary if they are not intended to stack.",
    "",
    "## Blueprint Maintenance",
    "",
    "No blueprint amendment is made. The authoritative blueprint already separates pain categories, eligibility, ranking, prescription, composition, and progression; it also prohibits diagnosis. Current formulas, duplicate-count findings, unconsumed fields, and calibration questions are implementation-review evidence rather than new enduring architecture.",
    "",
    "## Recommended Targeted Implementation Boundary",
    "",
    "Before any calibration values change, add a deterministic source-aware `PainMatchTrace` (exact name open) that derives one canonical set of matched stress facts per candidate and records signal ID/kind, severity, region, matched tag, metadata source, unique fact count, receiver-specific counted units, required response, and execution/defer status. Reuse that evidence in warning, pain suitability, joint cost, hard/acute matching, stability relevance, and assessment context while preserving each layer's distinct authority.",
    "",
    "Then make the smallest contract fixes: resolve the joint/caution duplicate unit; scope or remove the unrelated global stability bonus; emit `requiredResponse` and urgent/provenance requirements to the correct future receiver without implementing Session Composer or prescription. Only after those contracts are tested should human review choose severity categories and calibrate pain/joint coefficients.",
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
        finalState: "PAIN_CONTRACT_FIXES_REQUIRED_BEFORE_CALIBRATION",
      },
      null,
      2,
    ),
  );
}
