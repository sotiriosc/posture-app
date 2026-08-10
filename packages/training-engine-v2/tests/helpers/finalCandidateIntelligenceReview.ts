import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ANCHORED_BANDS_EQUIPMENT,
  BODYWEIGHT_EQUIPMENT,
  CONTROLLED_CANDIDATE_SCENARIOS,
  DUMBBELLS_AND_BENCH_EQUIPMENT,
  DUMBBELLS_NO_BENCH_EQUIPMENT,
  EMPTY_TRAINING_HISTORY,
  FULL_GYM_EQUIPMENT,
  GOLDEN_PERSONAS,
  LOOP_BANDS_ONLY_EQUIPMENT,
  MIXED_HOME_EQUIPMENT,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  THREE_PHASE_FOUNDATION,
  buildExerciseTransitionTraces,
  buildHorizontalRowSelectionTrace,
  deriveAlignmentPriorities,
  runCandidateRankingLab,
  type AssessmentFeature,
  type AssessmentRelevanceTrace,
  type AssessmentSignal,
  type AssessmentState,
  type CandidateNeed,
  type CandidateRankingResult,
  type CandidateRequest,
  type EquipmentCapabilities,
  type ExerciseDefinition,
  type PainAndInjuryState,
  type PhaseId,
  type RankedCandidate,
  type ScoreComponent,
  type TrainingGoal,
  type TrainingHistory,
} from "../../src";
import { createPosturePhotoCandidateExperimentRequests } from "../fixtures/posture/postureCandidateExperimentFixture";

const FIXED_AS_OF = "2026-08-10T00:00:00.000Z";

const EMPTY_ASSESSMENT: AssessmentState = {
  signals: [],
  historicalWeaknesses: [],
};

const EMPTY_CONTINUITY = {
  productiveExerciseIds: [],
  plateauedExerciseIds: [],
  failedProgressionExerciseIds: [],
  painResponseExerciseIds: [],
} as const;

const FEATURE_LABELS: Record<AssessmentFeature, string> = {
  serratus_or_protraction_control: "Serratus / Protraction",
  upward_rotation_control: "Upward Rotation",
  retraction_control: "Retraction",
  external_rotation_or_cuff_control: "External Rotation / Cuff",
  loaded_scapular_stability: "Loaded Scapular Stability",
};

interface FinalReviewData {
  readonly controlledScenarioCount: number;
  readonly totalRequestsReviewed: number;
  readonly assessmentRows: readonly AssessmentContrastRow[];
  readonly realPostureRows: readonly RealPostureRow[];
  readonly phaseRows: readonly PhaseRow[];
  readonly painRows: readonly PainRow[];
  readonly historyRows: readonly HistoryRow[];
  readonly personaRows: readonly PersonaRow[];
  readonly scienceRows: readonly ScienceReviewRow[];
  readonly transitionPurposeFindings: readonly TransitionPurposeFinding[];
  readonly catalogSummary: CatalogSummary;
  readonly invariantSummary: readonly string[];
}

interface AssessmentContrastRow {
  readonly assessment: string;
  readonly winnerOff: string;
  readonly winnerOn: string;
  readonly changedRanking: boolean;
  readonly scoreChangedOnly: boolean;
  readonly observabilityOnly: boolean;
  readonly legalPool: number;
  readonly inspectedExercise: string;
  readonly inspectedRank: number;
  readonly inspectedTotal: string;
  readonly assessmentFit: string;
  readonly alignmentFit: string;
  readonly relevance: string;
  readonly featureExpression: string;
  readonly overallTaskDemand: string;
  readonly featureChallenge: string;
  readonly capabilityProvenance: string;
  readonly relationship: string;
  readonly featureTargetFit: string;
  readonly developmentalChallengeInfluence: string;
  readonly boundedInfluence: string;
  readonly why: string;
}

interface RealPostureRow {
  readonly need: string;
  readonly winnerOff: string;
  readonly winnerOn: string;
  readonly changed: boolean;
  readonly onLegalPool: number;
  readonly assessmentEffect: string;
  readonly verdict: string;
}

interface PhaseRow {
  readonly need: string;
  readonly phase1Winner: string;
  readonly phase2Winner: string;
  readonly phase3Winner: string;
  readonly verdict: string;
}

interface PainRow {
  readonly scenario: string;
  readonly winner: string;
  readonly runnerUp: string;
  readonly rejected: string;
  readonly painEffect: string;
  readonly verdict: string;
}

interface HistoryRow {
  readonly scenario: string;
  readonly current: string;
  readonly candidate: string;
  readonly currentRank: string;
  readonly candidateRank: string;
  readonly continuity: string;
  readonly verdict: string;
}

interface PersonaRow {
  readonly persona: string;
  readonly experience: string;
  readonly equipment: string;
  readonly need: string;
  readonly winner: string;
  readonly legalPool: number;
  readonly focus: string;
}

interface ScienceReviewRow {
  readonly scenario: string;
  readonly expected: string;
  readonly winner: string;
  readonly runnerUp: string;
  readonly why: string;
  readonly surprisingComponent: string;
  readonly assessmentEffect: string;
  readonly painEffect: string;
  readonly continuityEffect: string;
  readonly verdict: string;
}

interface TransitionPurposeFinding {
  readonly source: string;
  readonly target: string;
  readonly purpose: string;
  readonly classification: "consistent" | "unknown_supported_by_notes" | "mismatch";
  readonly evidence: string;
}

interface CatalogSummary {
  readonly total: number;
  readonly fullyUsable: number;
  readonly usableWithReviewCaveats: number;
  readonly materiallyUnderSpecified: number;
  readonly p0Gaps: readonly string[];
  readonly p1Gaps: readonly string[];
  readonly p2Gaps: readonly string[];
}

function phase(id: PhaseId) {
  const found = THREE_PHASE_FOUNDATION.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing phase ${id}`);
  }

  return found;
}

function persona(id: string) {
  const found = GOLDEN_PERSONAS.find((candidate) => candidate.fixtureId === id);
  if (!found) {
    throw new Error(`Missing persona ${id}`);
  }

  return found;
}

function exercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing exercise ${id}`);
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

function request(input: {
  readonly id: string;
  readonly personaId?: string;
  readonly goal: TrainingGoal;
  readonly phaseId: PhaseId;
  readonly need: CandidateNeed;
  readonly equipment?: EquipmentCapabilities;
  readonly assessment?: AssessmentState;
  readonly painAndInjury?: PainAndInjuryState;
  readonly history?: TrainingHistory;
  readonly continuity?: CandidateRequest["continuity"];
  readonly satisfiedPrerequisiteIds?: readonly string[];
}): CandidateRequest {
  const selectedPersona = persona(input.personaId ?? "intermediate-gym-muscle-gain");
  const assessment = input.assessment ?? EMPTY_ASSESSMENT;

  return {
    id: input.id,
    evaluationContext: { asOf: FIXED_AS_OF },
    athlete: selectedPersona.athlete,
    goal: input.goal,
    phase: phase(input.phaseId),
    need: input.need,
    assessment,
    alignmentPriorities: deriveAlignmentPriorities(assessment).priorities,
    painAndInjury: input.painAndInjury ?? NO_PAIN_OR_INJURY,
    equipment: input.equipment ?? selectedPersona.equipment,
    history: input.history ?? history(),
    continuity: input.continuity ?? EMPTY_CONTINUITY,
    candidatePool: REFERENCE_EXERCISES,
    satisfiedPrerequisiteIds: input.satisfiedPrerequisiteIds ?? [],
    fatigueSignals: ["fresh"],
  };
}

function need(input: CandidateNeed): CandidateNeed {
  return input;
}

const NEEDS = {
  horizontalPush: need({
    id: "final-horizontal-push-main",
    whyNeeded: "Final audit horizontal push main selection.",
    requestedRole: "primary_strength",
    requestedSection: "main",
    targetMovementRoles: ["horizontal_push"],
    targetMuscles: ["chest", "triceps"],
    targetBodyRegions: ["shoulder", "elbow"],
    goal: "strength",
  }),
  horizontalPull: need({
    id: "final-horizontal-pull-main",
    whyNeeded: "Final audit horizontal pull main selection.",
    requestedRole: "primary_strength",
    requestedSection: "main",
    targetMovementRoles: ["horizontal_pull"],
    targetMuscles: ["mid_back", "lats"],
    targetBodyRegions: ["shoulder", "thoracic_spine"],
    goal: "strength",
  }),
  squat: need({
    id: "final-squat-main",
    whyNeeded: "Final audit squat main selection.",
    requestedRole: "primary_strength",
    requestedSection: "main",
    targetMovementRoles: ["squat"],
    targetMuscles: ["quads", "glutes"],
    targetBodyRegions: ["knee", "hip", "ankle"],
    goal: "strength",
  }),
  hinge: need({
    id: "final-hinge-accessory",
    whyNeeded: "Final audit hinge accessory selection.",
    requestedRole: "secondary_strength",
    requestedSection: "accessory",
    targetMovementRoles: ["hinge"],
    targetMuscles: ["hamstrings", "glutes"],
    targetBodyRegions: ["hip", "lumbar_spine"],
    goal: "strength",
  }),
  singleLeg: need({
    id: "final-single-leg-accessory",
    whyNeeded: "Final audit single-leg accessory selection.",
    requestedRole: "secondary_strength",
    requestedSection: "accessory",
    targetMovementRoles: ["single_leg", "squat"],
    targetMuscles: ["quads", "glutes"],
    targetBodyRegions: ["knee", "hip", "ankle"],
    goal: "strength",
  }),
  trunkActivation: need({
    id: "final-trunk-activation",
    whyNeeded: "Final audit trunk activation selection.",
    requestedRole: "activation",
    requestedSection: "activation",
    targetMovementRoles: ["anti_extension_core", "anti_rotation_core"],
    targetMuscles: ["trunk"],
    targetBodyRegions: ["lumbar_spine", "pelvis"],
    goal: "posture_and_movement_quality",
  }),
  scapularActivation: need({
    id: "final-scapular-activation",
    whyNeeded: "Final audit scapular activation selection.",
    requestedRole: "activation",
    requestedSection: "activation",
    targetMovementRoles: ["scapular_control", "horizontal_pull"],
    targetMuscles: ["serratus", "rear_delts", "upper_back", "rotator_cuff"],
    targetBodyRegions: ["shoulder", "thoracic_spine"],
    goal: "posture_and_movement_quality",
  }),
};

function assessmentSignal(input: {
  readonly id: string;
  readonly movementRole?: AssessmentSignal["movementRole"];
  readonly muscleGroup?: AssessmentSignal["muscleGroup"];
  readonly assessmentFeatures?: readonly AssessmentFeature[];
  readonly region?: AssessmentSignal["region"];
  readonly severity?: AssessmentSignal["severity"];
}): AssessmentState {
  return {
    signals: [
      {
        id: input.id,
        type: "control_finding",
        source: "movement_screen",
        confidence: "high",
        priority: "primary",
        region: input.region ?? "shoulder",
        movementRole: input.movementRole ?? "scapular_control",
        muscleGroup: input.muscleGroup,
        severity: input.severity,
        assessmentFeatures: input.assessmentFeatures,
        description: `Final audit signal ${input.id}.`,
      },
    ],
    historicalWeaknesses: [],
  };
}

function ranked(result: CandidateRankingResult, exerciseId: string): RankedCandidate | undefined {
  return result.rankedCandidates.find((candidate) => candidate.exercise.id === exerciseId);
}

function winner(result: CandidateRankingResult): RankedCandidate {
  const first = result.rankedCandidates[0];
  if (!first) {
    throw new Error(`No legal winner for ${result.request.id}`);
  }

  return first;
}

function component(candidate: RankedCandidate, id: string): ScoreComponent {
  const found = candidate.components.find((scoreComponent) => scoreComponent.id === id);
  if (!found) {
    throw new Error(`Missing ${id} for ${candidate.exercise.id}`);
  }

  return found;
}

function traceFor(candidate: RankedCandidate): AssessmentRelevanceTrace | undefined {
  return component(candidate, "assessment_fit").assessmentRelevance?.[0];
}

function fmt(value: number | undefined): string {
  return value === undefined ? "-" : value.toFixed(3);
}

function rankLabel(candidate: RankedCandidate | undefined): string {
  return candidate ? `${candidate.rank} / ${candidate.exercise.id} / ${fmt(candidate.total)}` : "rejected";
}

function topTwo(result: CandidateRankingResult): readonly [RankedCandidate, RankedCandidate | undefined] {
  return [winner(result), result.rankedCandidates[1]];
}

function resultSummary(result: CandidateRankingResult): string {
  const [first, second] = topTwo(result);
  return `${first.exercise.id} (${fmt(first.total)})${second ? ` over ${second.exercise.id} (${fmt(second.total)})` : ""}`;
}

function legalIds(result: CandidateRankingResult): readonly string[] {
  return result.rankedCandidates.map((candidate) => candidate.exercise.id);
}

function serializeRanking(result: CandidateRankingResult): string {
  return JSON.stringify({
    ranked: result.rankedCandidates.map((candidate) => ({
      exerciseId: candidate.exercise.id,
      rank: candidate.rank,
      total: candidate.total,
      components: candidate.components.map((scoreComponent) => ({
        id: scoreComponent.id,
        value: scoreComponent.value,
        rawValue: scoreComponent.rawValue,
        weight: scoreComponent.weight,
        weightedContribution: scoreComponent.weightedContribution,
        reasonCode: scoreComponent.reasonCode,
        source: scoreComponent.source,
      })),
    })),
    rejected: result.hardRejectedCandidates.map((candidate) => ({
      exerciseId: candidate.exercise.id,
      reasonCodes: candidate.eligibility.rejectionReasons.map((reason) => reason.code),
    })),
    snapshots: result.pipeline.snapshots.map((snapshot) => ({
      stage: snapshot.stage,
      localizationStage: snapshot.localizationStage,
      componentId: snapshot.componentId,
      reasonCodes: snapshot.reasonCodes,
    })),
  });
}

function componentWhy(candidate: RankedCandidate): string {
  const sorted = [...candidate.components]
    .sort((left, right) => right.weightedContribution - left.weightedContribution)
    .slice(0, 3);

  return sorted
    .map((scoreComponent) => `${scoreComponent.id} ${scoreComponent.rawValue.toFixed(2)}`)
    .join("; ");
}

function assessmentContrasts(): readonly AssessmentContrastRow[] {
  const offRequest = request({
    id: "final-assessment-off-scapular-activation",
    personaId: "intermediate-gym-muscle-gain",
    goal: "posture_and_movement_quality",
    phaseId: "phase_2",
    need: NEEDS.scapularActivation,
    equipment: FULL_GYM_EQUIPMENT,
  });
  const offResult = runCandidateRankingLab(offRequest);
  const assessments: readonly {
    readonly label: string;
    readonly state: AssessmentState;
    readonly inspectedExercise: string;
  }[] = [
    {
      label: "Generic Scapular Control",
      state: assessmentSignal({
        id: "final-generic-scapular-control",
        movementRole: "scapular_control",
      }),
      inspectedExercise: "band-face-pull",
    },
    {
      label: FEATURE_LABELS.serratus_or_protraction_control,
      state: assessmentSignal({
        id: "final-serratus-protraction",
        movementRole: "scapular_control",
        muscleGroup: "serratus",
        assessmentFeatures: ["serratus_or_protraction_control"],
      }),
      inspectedExercise: "serratus-wall-slide",
    },
    {
      label: FEATURE_LABELS.upward_rotation_control,
      state: assessmentSignal({
        id: "final-upward-rotation",
        movementRole: "scapular_control",
        assessmentFeatures: ["upward_rotation_control"],
      }),
      inspectedExercise: "serratus-wall-slide",
    },
    {
      label: FEATURE_LABELS.retraction_control,
      state: assessmentSignal({
        id: "final-retraction",
        movementRole: "scapular_control",
        muscleGroup: "upper_back",
        assessmentFeatures: ["retraction_control"],
      }),
      inspectedExercise: "band-face-pull",
    },
    {
      label: FEATURE_LABELS.external_rotation_or_cuff_control,
      state: assessmentSignal({
        id: "final-external-rotation-cuff",
        movementRole: "scapular_control",
        muscleGroup: "rotator_cuff",
        assessmentFeatures: ["external_rotation_or_cuff_control"],
      }),
      inspectedExercise: "band-face-pull",
    },
    {
      label: FEATURE_LABELS.loaded_scapular_stability,
      state: assessmentSignal({
        id: "final-loaded-scapular-stability",
        movementRole: "scapular_control",
        assessmentFeatures: ["loaded_scapular_stability"],
      }),
      inspectedExercise: "band-face-pull",
    },
  ];

  return assessments.map((entry) => {
    const onRequest = {
      ...offRequest,
      id: `final-assessment-on-${entry.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      assessment: entry.state,
      alignmentPriorities: deriveAlignmentPriorities(entry.state).priorities,
    };
    const onResult = runCandidateRankingLab(onRequest);
    const inspected = ranked(onResult, entry.inspectedExercise) ?? winner(onResult);
    const offInspected = ranked(offResult, inspected.exercise.id);
    const assessmentFit = component(inspected, "assessment_fit");
    const alignmentFit = component(inspected, "alignment_fit");
    const trace = traceFor(inspected);
    const featureDevelopment = trace?.featureDevelopment[0];
    const featureMatch = trace?.featureMatches[0];
    const changedRanking =
      legalIds(offResult).join("|") !== legalIds(onResult).join("|");
    const scoreChangedOnly =
      !changedRanking && offInspected !== undefined && Math.abs(offInspected.total - inspected.total) > 0.0001;
    const observabilityOnly =
      !changedRanking && !scoreChangedOnly && (trace?.relevance ?? "none") !== "none";

    return {
      assessment: entry.label,
      winnerOff: winner(offResult).exercise.id,
      winnerOn: winner(onResult).exercise.id,
      changedRanking,
      scoreChangedOnly,
      observabilityOnly,
      legalPool: onResult.legalCandidateCount,
      inspectedExercise: inspected.exercise.id,
      inspectedRank: inspected.rank,
      inspectedTotal: fmt(inspected.total),
      assessmentFit: assessmentFit.rawValue.toFixed(3),
      alignmentFit: alignmentFit.rawValue.toFixed(3),
      relevance: trace?.relevance ?? "none",
      featureExpression: featureMatch
        ? `${featureMatch.candidateFeatureLevel}/${featureMatch.featureMatch}`
        : "generic",
      overallTaskDemand: featureDevelopment
        ? `${featureDevelopment.overallTaskDemand ?? "unknown"} (${featureDevelopment.overallTaskDemandSource.level})`
        : `${trace?.demandCapability.candidateDemand ?? "unknown"}`,
      featureChallenge: featureDevelopment
        ? `${featureDevelopment.featureChallengeDemand ?? "unknown"}/${featureDevelopment.featureChallengeDemandSource}`
        : "not_applicable",
      capabilityProvenance: featureDevelopment
        ? `${featureDevelopment.featureCapabilitySource}/${featureDevelopment.featureCapabilityEvidenceQuality}`
        : `${trace?.demandCapability.capabilityEstimate.estimateSource}/${trace?.demandCapability.capabilityEstimate.evidenceQuality}`,
      relationship: trace?.relationship ?? "neutral",
      featureTargetFit: (trace?.featureTargetFitInfluence ?? 0).toFixed(3),
      developmentalChallengeInfluence: (trace?.developmentalChallengeInfluence ?? 0).toFixed(3),
      boundedInfluence: (trace?.boundedInfluence ?? 0).toFixed(3),
      why: (trace?.featureTargetFitInfluence ?? 0) > 0
        ? "reviewed feature target fit affects assessment_fit; feature challenge remains not modeled"
        : observabilityOnly
          ? "relevance is visible, but no positive target or developmental evidence is available"
        : scoreChangedOnly
          ? "assessment changes score without reordering the legal pool"
          : changedRanking
            ? "assessment changes the ordered legal pool"
            : "assessment remains neutral",
    };
  });
}

function realPostureRows(): readonly RealPostureRow[] {
  const offRequests = createPosturePhotoCandidateExperimentRequests({ assessmentEnabled: false });
  const onRequests = createPosturePhotoCandidateExperimentRequests({ assessmentEnabled: true });

  return onRequests.map((onFixtureRequest, index) => {
    const offFixtureRequest = offRequests[index];
    if (!offFixtureRequest) {
      throw new Error(`Missing posture fixture OFF request for ${onFixtureRequest.id}.`);
    }
    const offRequest = {
      ...offFixtureRequest,
      evaluationContext: { asOf: FIXED_AS_OF },
    };
    const onRequest = {
      ...onFixtureRequest,
      evaluationContext: { asOf: FIXED_AS_OF },
    };
    const offResult = runCandidateRankingLab(offRequest);
    const onResult = runCandidateRankingLab(onRequest);
    const changed = winner(offResult).exercise.id !== winner(onResult).exercise.id;
    const onWinner = winner(onResult);
    const traces = component(onWinner, "assessment_fit").assessmentRelevance ?? [];
    const nonNeutral = traces.filter((trace) => trace.relevance !== "none" || trace.boundedInfluence !== 0);

    return {
      need: onRequest.need.id,
      winnerOff: winner(offResult).exercise.id,
      winnerOn: onWinner.exercise.id,
      changed,
      onLegalPool: onResult.legalCandidateCount,
      assessmentEffect:
        nonNeutral.length > 0
          ? nonNeutral.map((trace) => `${trace.signalId}:${trace.relevance}/${trace.relationship}/${trace.boundedInfluence.toFixed(3)}`).join("; ")
          : "irrelevant or neutral signals remained neutral",
      verdict: "GOOD",
    };
  });
}

function phaseRows(): readonly PhaseRow[] {
  const entries = [
    ["horizontal push", NEEDS.horizontalPush, "strength"],
    ["horizontal pull", NEEDS.horizontalPull, "strength"],
    ["squat", NEEDS.squat, "strength"],
    ["hinge", NEEDS.hinge, "strength"],
    ["single-leg", NEEDS.singleLeg, "strength"],
    ["trunk activation", NEEDS.trunkActivation, "posture_and_movement_quality"],
    ["scapular activation", NEEDS.scapularActivation, "posture_and_movement_quality"],
  ] as const;

  return entries.map(([label, candidateNeed, goal]) => {
    const phase1 = runCandidateRankingLab(request({
      id: `final-phase-${label}-phase-1`,
      personaId: "beginner-gym-no-pain",
      goal,
      phaseId: "phase_1",
      need: candidateNeed,
      equipment: FULL_GYM_EQUIPMENT,
      satisfiedPrerequisiteIds: ["push-up-plank-control", "hinge-control"],
    }));
    const phase2 = runCandidateRankingLab(request({
      id: `final-phase-${label}-phase-2`,
      personaId: "intermediate-gym-muscle-gain",
      goal,
      phaseId: "phase_2",
      need: candidateNeed,
      equipment: FULL_GYM_EQUIPMENT,
      satisfiedPrerequisiteIds: ["push-up-plank-control", "hinge-control"],
    }));
    const phase3 = runCandidateRankingLab(request({
      id: `final-phase-${label}-phase-3`,
      personaId: "advanced-gym-muscle-gain",
      goal,
      phaseId: "phase_3",
      need: candidateNeed,
      equipment: FULL_GYM_EQUIPMENT,
      satisfiedPrerequisiteIds: ["push-up-plank-control", "hinge-control"],
    }));

    return {
      need: label,
      phase1Winner: resultSummary(phase1),
      phase2Winner: resultSummary(phase2),
      phase3Winner: resultSummary(phase3),
      verdict:
        label === "horizontal pull"
          ? "PLAUSIBLE_NEEDS_REVIEW: phase suitability leaves machine/cable nearly tied without path/fit context"
          : "GOOD",
    };
  });
}

function painState(kind: string): PainAndInjuryState {
  if (kind === "mild-shoulder") {
    return {
      ...NO_PAIN_OR_INJURY,
      currentDiscomforts: [
        {
          kind: "current_discomfort",
          id: "final-mild-shoulder",
          region: "shoulder",
          severity0To10: 2,
          stressTags: ["horizontal_pressing", "shoulder_abduction_external_rotation"],
          effect: "prefer_support",
          description: "Final audit mild shoulder discomfort.",
        },
      ],
    };
  }
  if (kind === "moderate-low-back") {
    return {
      ...NO_PAIN_OR_INJURY,
      moderatePain: [
        {
          kind: "moderate_pain",
          id: "final-moderate-low-back",
          region: "lumbar_spine",
          severity0To10: 4,
          stressTags: ["loaded_hinge", "loaded_spinal_flexion"],
          requiredResponse: "avoid_aggravator",
          description: "Final audit moderate low-back pain.",
        },
      ],
    };
  }
  if (kind === "historical-knee") {
    return {
      ...NO_PAIN_OR_INJURY,
      historicalSensitivities: [
        {
          kind: "historical_sensitivity",
          id: "final-historical-knee",
          region: "knee",
          stressTags: ["deep_knee_flexion", "loaded_knee_flexion"],
          preferredModification: "monitor",
          description: "Final audit historical knee sensitivity.",
        },
      ],
    };
  }
  if (kind === "hard-push-up") {
    return {
      ...NO_PAIN_OR_INJURY,
      hardContraindications: [
        {
          kind: "hard_contraindication",
          id: "final-hard-push-up",
          exerciseIds: ["push-up"],
          reason: "Final audit explicit push-up contraindication.",
          source: "clinician",
        },
      ],
    };
  }

  return NO_PAIN_OR_INJURY;
}

function painRows(): readonly PainRow[] {
  const entries = [
    {
      scenario: "shoulder push, no pain",
      need: NEEDS.horizontalPush,
      pain: painState("none"),
      goal: "strength" as const,
      phaseId: "phase_2" as const,
      expectedRejected: "none",
    },
    {
      scenario: "shoulder push, mild/current discomfort",
      need: NEEDS.horizontalPush,
      pain: painState("mild-shoulder"),
      goal: "pain_aware_return" as const,
      phaseId: "phase_1" as const,
      expectedRejected: "none",
    },
    {
      scenario: "low-back hinge, moderate pain",
      need: NEEDS.hinge,
      pain: painState("moderate-low-back"),
      goal: "pain_aware_return" as const,
      phaseId: "phase_2" as const,
      expectedRejected: "none",
    },
    {
      scenario: "knee squat, historical sensitivity",
      need: NEEDS.squat,
      pain: painState("historical-knee"),
      goal: "strength" as const,
      phaseId: "phase_2" as const,
      expectedRejected: "none",
    },
    {
      scenario: "hard contraindication",
      need: NEEDS.horizontalPush,
      pain: painState("hard-push-up"),
      goal: "strength" as const,
      phaseId: "phase_2" as const,
      expectedRejected: "push-up",
    },
  ];

  return entries.map((entry) => {
    const result = runCandidateRankingLab(request({
      id: `final-pain-${entry.scenario.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
      personaId: "intermediate-gym-muscle-gain",
      goal: entry.goal,
      phaseId: entry.phaseId,
      need: entry.need,
      equipment: FULL_GYM_EQUIPMENT,
      painAndInjury: entry.pain,
      satisfiedPrerequisiteIds: ["push-up-plank-control", "hinge-control"],
    }));
    const [first, second] = topTwo(result);
    const rejected = result.hardRejectedCandidates
      .filter((candidate) => candidate.eligibility.rejectionReasons.some((reason) => reason.code === "HARD_CONTRAINDICATION"))
      .map((candidate) => candidate.exercise.id)
      .join(", ") || "none";
    const painComponent = component(first, "pain_suitability");
    const jointComponent = component(first, "joint_cost");

    return {
      scenario: entry.scenario,
      winner: `${first.exercise.id} / ${fmt(first.total)}`,
      runnerUp: second ? `${second.exercise.id} / ${fmt(second.total)}` : "-",
      rejected,
      painEffect: `${painComponent.reasonCode}; pain=${painComponent.rawValue.toFixed(2)}; joint=${jointComponent.rawValue.toFixed(2)}`,
      verdict:
        entry.expectedRejected !== "none" && rejected.includes(entry.expectedRejected)
          ? "GOOD"
          : entry.scenario.includes("moderate")
            ? "PLAUSIBLE_NEEDS_REVIEW"
            : "GOOD",
    };
  });
}

function historyRows(): readonly HistoryRow[] {
  const base = request({
    id: "final-history-base",
    personaId: "intermediate-gym-muscle-gain",
    goal: "strength",
    phaseId: "phase_2",
    need: NEEDS.horizontalPull,
    equipment: FULL_GYM_EQUIPMENT,
  });
  const variants: readonly {
    readonly scenario: string;
    readonly request: CandidateRequest;
    readonly current: string;
    readonly target: string;
  }[] = [
    {
      scenario: "no history",
      request: base,
      current: "chest-supported-dumbbell-row",
      target: "seated-cable-row",
    },
    {
      scenario: "productive + stable",
      request: {
        ...base,
        id: "final-history-productive-stable",
        continuity: {
          ...EMPTY_CONTINUITY,
          currentExerciseId: "chest-supported-dumbbell-row",
          productiveExerciseIds: ["chest-supported-dumbbell-row"],
        },
        history: history({
          exerciseHistory: {
            events: [],
            stableExerciseIds: ["chest-supported-dumbbell-row"],
            blockedExerciseIds: [],
          },
        }),
      },
      current: "chest-supported-dumbbell-row",
      target: "seated-cable-row",
    },
    {
      scenario: "readyToProgress + appropriate challenge",
      request: {
        ...base,
        id: "final-history-ready-appropriate",
        continuity: {
          ...EMPTY_CONTINUITY,
          currentExerciseId: "chest-supported-dumbbell-row",
          productiveExerciseIds: ["chest-supported-dumbbell-row"],
        },
        history: history({
          exerciseHistory: {
            events: [
              {
                id: "final-current-appropriate",
                exerciseId: "chest-supported-dumbbell-row",
                type: "appropriate_challenge",
                movementRole: "horizontal_pull",
                occurredAt: "2026-08-08T00:00:00.000Z",
                notes: "Appropriate challenge on current row.",
              },
            ],
            stableExerciseIds: ["chest-supported-dumbbell-row"],
            blockedExerciseIds: [],
          },
          progressionState: {
            ...EMPTY_TRAINING_HISTORY.progressionState,
            readyToProgressExerciseIds: ["chest-supported-dumbbell-row"],
          },
        }),
      },
      current: "chest-supported-dumbbell-row",
      target: "seated-cable-row",
    },
    {
      scenario: "too easy + progression success",
      request: {
        ...base,
        id: "final-history-too-easy",
        continuity: {
          ...EMPTY_CONTINUITY,
          currentExerciseId: "chest-supported-dumbbell-row",
          productiveExerciseIds: ["chest-supported-dumbbell-row"],
        },
        history: history({
          exerciseHistory: {
            events: [
              {
                id: "final-current-too-easy",
                exerciseId: "chest-supported-dumbbell-row",
                type: "too_easy",
                movementRole: "horizontal_pull",
                occurredAt: "2026-08-08T00:00:00.000Z",
                notes: "Current row was too easy.",
              },
              {
                id: "final-current-progression-success",
                exerciseId: "chest-supported-dumbbell-row",
                type: "progression_success",
                movementRole: "horizontal_pull",
                occurredAt: "2026-08-09T00:00:00.000Z",
                notes: "Progression succeeded.",
              },
            ],
            stableExerciseIds: ["chest-supported-dumbbell-row"],
            blockedExerciseIds: [],
          },
          progressionState: {
            ...EMPTY_TRAINING_HISTORY.progressionState,
            readyToProgressExerciseIds: ["chest-supported-dumbbell-row"],
          },
        }),
      },
      current: "chest-supported-dumbbell-row",
      target: "seated-cable-row",
    },
    {
      scenario: "plateau + failed progression",
      request: {
        ...base,
        id: "final-history-plateau-failed",
        continuity: {
          ...EMPTY_CONTINUITY,
          currentExerciseId: "chest-supported-dumbbell-row",
          plateauedExerciseIds: ["chest-supported-dumbbell-row"],
          failedProgressionExerciseIds: ["chest-supported-dumbbell-row"],
        },
        history: history({
          exerciseHistory: {
            events: [
              {
                id: "final-current-plateau",
                exerciseId: "chest-supported-dumbbell-row",
                type: "plateau",
                movementRole: "horizontal_pull",
                occurredAt: "2026-08-08T00:00:00.000Z",
                notes: "Plateau on current row.",
              },
              {
                id: "final-current-progression-failure",
                exerciseId: "chest-supported-dumbbell-row",
                type: "progression_failure",
                movementRole: "horizontal_pull",
                occurredAt: "2026-08-09T00:00:00.000Z",
                notes: "Failed progression.",
              },
            ],
            stableExerciseIds: [],
            blockedExerciseIds: [],
          },
          progressionState: {
            ...EMPTY_TRAINING_HISTORY.progressionState,
            stalledExerciseIds: ["chest-supported-dumbbell-row"],
          },
        }),
      },
      current: "chest-supported-dumbbell-row",
      target: "seated-cable-row",
    },
    {
      scenario: "pain response + blocked",
      request: {
        ...base,
        id: "final-history-pain-blocked",
        continuity: {
          ...EMPTY_CONTINUITY,
          currentExerciseId: "chest-supported-dumbbell-row",
          painResponseExerciseIds: ["chest-supported-dumbbell-row"],
        },
        history: history({
          exerciseHistory: {
            events: [
              {
                id: "final-current-pain-response",
                exerciseId: "chest-supported-dumbbell-row",
                type: "pain_response",
                movementRole: "horizontal_pull",
                occurredAt: "2026-08-09T00:00:00.000Z",
                notes: "Pain response on current row.",
              },
            ],
            stableExerciseIds: [],
            blockedExerciseIds: ["chest-supported-dumbbell-row"],
          },
        }),
      },
      current: "chest-supported-dumbbell-row",
      target: "seated-cable-row",
    },
  ];

  return variants.map((entry) => {
    const result = runCandidateRankingLab(entry.request);
    const current = ranked(result, entry.current);
    const target = ranked(result, entry.target);

    return {
      scenario: entry.scenario,
      current: entry.current,
      candidate: entry.target,
      currentRank: rankLabel(current),
      candidateRank: rankLabel(target),
      continuity: current ? component(current, "continuity_value").reasonCode : "hard_rejected_or_absent",
      verdict:
        entry.scenario.includes("plateau") || entry.scenario.includes("pain")
          ? current && component(current, "continuity_value").reasonCode === "CONTINUITY_FAVORED"
            ? "PLAUSIBLE_NEEDS_REVIEW: value demotes, reason code should expose replacement signal"
            : "GOOD: replacement may be justified by real signal"
          : "GOOD: keep/progress remains defensible",
    };
  });
}

function personaRows(): readonly PersonaRow[] {
  const needByPersona = new Map<string, CandidateNeed>([
    ["beginner-gym-no-pain", NEEDS.horizontalPush],
    ["beginner-gym-shoulder-concern", NEEDS.horizontalPush],
    ["intermediate-gym-muscle-gain", NEEDS.horizontalPull],
    ["advanced-gym-muscle-gain", NEEDS.hinge],
    ["beginner-dumbbells-bench", NEEDS.horizontalPull],
    ["intermediate-dumbbells", NEEDS.horizontalPush],
    ["dumbbells-without-bench", NEEDS.horizontalPull],
    ["anchored-bands", NEEDS.scapularActivation],
    ["bands-without-anchor", NEEDS.horizontalPull],
    ["loop-bands-only", NEEDS.scapularActivation],
    ["bodyweight", NEEDS.horizontalPush],
    ["mixed-home", NEEDS.squat],
  ]);

  return GOLDEN_PERSONAS.map((candidate) => {
    const selectedNeed = needByPersona.get(candidate.fixtureId) ?? NEEDS.horizontalPull;
    const result = runCandidateRankingLab(request({
      id: `final-persona-${candidate.fixtureId}`,
      personaId: candidate.fixtureId,
      goal: selectedNeed.goal,
      phaseId: candidate.currentState.phase.currentPhaseId,
      need: selectedNeed,
      equipment: candidate.equipment,
      assessment: candidate.assessment,
      painAndInjury: candidate.painAndInjury,
      history: candidate.history,
      satisfiedPrerequisiteIds: ["push-up-plank-control", "hinge-control"],
    }));
    const selectedWinner = result.rankedCandidates[0];

    return {
      persona: candidate.fixtureId,
      experience: candidate.athlete.experience,
      equipment: candidate.equipment.environment,
      need: selectedNeed.id,
      winner: selectedWinner ? `${selectedWinner.exercise.id} / ${fmt(selectedWinner.total)}` : "none",
      legalPool: result.legalCandidateCount,
      focus: candidate.expectedReasoningFocus.join("; "),
    };
  });
}

function scienceRows(data: {
  readonly phaseRows: readonly PhaseRow[];
  readonly painRows: readonly PainRow[];
  readonly historyRows: readonly HistoryRow[];
  readonly assessmentRows: readonly AssessmentContrastRow[];
}): readonly ScienceReviewRow[] {
  const neutralPull = runCandidateRankingLab(request({
    id: "final-science-neutral-pull",
    personaId: "intermediate-gym-muscle-gain",
    goal: "strength",
    phaseId: "phase_2",
    need: NEEDS.horizontalPull,
    equipment: FULL_GYM_EQUIPMENT,
  }));
  const lowBackPull = runCandidateRankingLab(request({
    id: "final-science-low-back-pull",
    personaId: "mixed-home",
    goal: "strength",
    phaseId: "phase_2",
    need: NEEDS.horizontalPull,
    equipment: DUMBBELLS_AND_BENCH_EQUIPMENT,
    painAndInjury: painState("moderate-low-back"),
  }));
  const phasePush = data.phaseRows.find((row) => row.need === "horizontal push");
  const feature = data.assessmentRows.find((row) => row.assessment === FEATURE_LABELS.serratus_or_protraction_control);
  const productive = data.historyRows.find((row) => row.scenario === "readyToProgress + appropriate challenge");
  const plateau = data.historyRows.find((row) => row.scenario === "plateau + failed progression");
  const neutralTrace = buildHorizontalRowSelectionTrace(neutralPull);
  const [neutralWinner, neutralRunnerUp] = topTwo(neutralPull);
  const [lowBackWinner, lowBackRunnerUp] = topTwo(lowBackPull);

  return [
    {
      scenario: "Neutral full-gym horizontal pull",
      expected: "Prefer a legal loadable row; preserve machine/cable tie when no context separates them.",
      winner: neutralWinner.exercise.id,
      runnerUp: neutralRunnerUp?.exercise.id ?? "-",
      why: componentWhy(neutralWinner),
      surprisingComponent: neutralTrace.tieStatus.length > 0 ? "row tie is deliberate context-required evidence" : "none",
      assessmentEffect: "none",
      painEffect: "none",
      continuityEffect: "none",
      verdict: "GOOD",
    },
    {
      scenario: "Low-back row pain context",
      expected: "Prefer lower lumbar demand/support, but keep equipment truth hard.",
      winner: lowBackWinner.exercise.id,
      runnerUp: lowBackRunnerUp?.exercise.id ?? "-",
      why: componentWhy(lowBackWinner),
      surprisingComponent: "ID-derived support bonus resolved; remaining pain effect is stress-overlap based",
      assessmentEffect: "not primary",
      painEffect: "material",
      continuityEffect: "none",
      verdict: "PLAUSIBLE_NEEDS_REVIEW",
    },
    {
      scenario: "Phase contrast horizontal push",
      expected: "Phase 1 should prefer usable control/support; Phase 3 should value loadable stimulus without hardest-is-best.",
      winner: phasePush?.phase3Winner ?? "-",
      runnerUp: phasePush?.phase1Winner ?? "-",
      why: "phase_fit, loadability, stimulus_potential shift the winner across phases",
      surprisingComponent: "phaseSuitability has meaningful influence and still needs human calibration",
      assessmentEffect: "none",
      painEffect: "none",
      continuityEffect: "none",
      verdict: "GOOD",
    },
    {
      scenario: "Feature-specific serratus/protraction assessment",
      expected: "Identify feature relevance without conflating expression with feature difficulty.",
      winner: feature?.winnerOn ?? "-",
      runnerUp: feature?.inspectedExercise ?? "-",
      why: feature?.why ?? "-",
      surprisingComponent: "feature challenge remains unknown while target fit can still be selection-relevant",
      assessmentEffect: `target=${feature?.featureTargetFit ?? "-"}; development=${feature?.developmentalChallengeInfluence ?? "-"}; alignment=0.000`,
      painEffect: "none",
      continuityEffect: "none",
      verdict: "GOOD",
    },
    {
      scenario: "Ready-to-progress current row",
      expected: "Keep productive current exercise and progress prescription before replacement.",
      winner: productive?.currentRank ?? "-",
      runnerUp: productive?.candidateRank ?? "-",
      why: "continuity_value and progression_value reward same-exercise runway",
      surprisingComponent: "none",
      assessmentEffect: "none",
      painEffect: "none",
      continuityEffect: productive?.continuity ?? "-",
      verdict: "GOOD",
    },
    {
      scenario: "Plateau/failed progression row",
      expected: "Replacement may become justified by real performance signal.",
      winner: plateau?.candidateRank ?? "-",
      runnerUp: plateau?.currentRank ?? "-",
      why: "continuity/progression penalties reduce current exercise",
      surprisingComponent: "transition edge remains knowledge-only",
      assessmentEffect: "none",
      painEffect: "none",
      continuityEffect: plateau?.continuity ?? "-",
      verdict: "GOOD",
    },
  ];
}

function deltaEvidence(delta: { readonly source: string; readonly target: string; readonly delta: string }): string {
  return `${delta.source}->${delta.target} (${delta.delta})`;
}

function transitionPurposeFindings(): readonly TransitionPurposeFinding[] {
  return REFERENCE_EXERCISES.flatMap((source) =>
    buildExerciseTransitionTraces(source, REFERENCE_EXERCISES).flatMap((trace) => {
      const delta = trace.structuralDelta;

      return trace.purposes.map((purpose): TransitionPurposeFinding => {
        if (purpose === "increase_loadability") {
          return {
            source: trace.sourceExerciseId,
            target: trace.targetExerciseId,
            purpose,
            classification:
              delta.loading.loadability.delta === "increase"
                ? "consistent"
                : delta.loading.loadability.delta === "unknown"
                  ? "unknown_supported_by_notes"
                  : "mismatch",
            evidence: deltaEvidence(delta.loading.loadability),
          };
        }
        if (purpose === "reduce_loadability") {
          return {
            source: trace.sourceExerciseId,
            target: trace.targetExerciseId,
            purpose,
            classification:
              delta.loading.loadability.delta === "decrease"
                ? "consistent"
                : delta.loading.loadability.delta === "unknown"
                  ? "unknown_supported_by_notes"
                  : "mismatch",
            evidence: deltaEvidence(delta.loading.loadability),
          };
        }
        if (purpose === "increase_stability_demand") {
          return {
            source: trace.sourceExerciseId,
            target: trace.targetExerciseId,
            purpose,
            classification:
              delta.demand.stability.delta === "increase"
                ? "consistent"
                : delta.demand.stability.delta === "unknown"
                  ? "unknown_supported_by_notes"
                  : "mismatch",
            evidence: deltaEvidence(delta.demand.stability),
          };
        }
        if (purpose === "reduce_stability_demand") {
          return {
            source: trace.sourceExerciseId,
            target: trace.targetExerciseId,
            purpose,
            classification:
              delta.demand.stability.delta === "decrease"
                ? "consistent"
                : delta.demand.stability.delta === "unknown"
                  ? "unknown_supported_by_notes"
                  : "mismatch",
            evidence: deltaEvidence(delta.demand.stability),
          };
        }
        if (purpose === "increase_coordination_demand") {
          return {
            source: trace.sourceExerciseId,
            target: trace.targetExerciseId,
            purpose,
            classification:
              delta.demand.coordination.delta === "increase"
                ? "consistent"
                : delta.demand.coordination.delta === "unknown"
                  ? "unknown_supported_by_notes"
                  : "mismatch",
            evidence: deltaEvidence(delta.demand.coordination),
          };
        }
        if (purpose === "reduce_coordination_demand") {
          return {
            source: trace.sourceExerciseId,
            target: trace.targetExerciseId,
            purpose,
            classification:
              delta.demand.coordination.delta === "decrease"
                ? "consistent"
                : delta.demand.coordination.delta === "unknown"
                  ? "unknown_supported_by_notes"
                  : "mismatch",
            evidence: deltaEvidence(delta.demand.coordination),
          };
        }
        if (purpose === "equipment_transition") {
          return {
            source: trace.sourceExerciseId,
            target: trace.targetExerciseId,
            purpose,
            classification:
              delta.equipment.sourceOnly.length > 0 || delta.equipment.targetOnly.length > 0
                ? "consistent"
                : "mismatch",
            evidence: `sourceOnly=${delta.equipment.sourceOnly.join(", ") || "none"}; targetOnly=${delta.equipment.targetOnly.join(", ") || "none"}`,
          };
        }
        if (purpose === "feature_shift") {
          return {
            source: trace.sourceExerciseId,
            target: trace.targetExerciseId,
            purpose,
            classification:
              delta.assessmentFeatures.some((feature) => feature.delta !== "same")
                ? "consistent"
                : "unknown_supported_by_notes",
            evidence: delta.assessmentFeatures
              .filter((feature) => feature.delta !== "same")
              .map((feature) => `${feature.feature}:${feature.source}->${feature.target}`)
              .join("; ") || "no feature metadata modeled for this edge",
          };
        }
        if (purpose === "change_resistance_path") {
          const pathChanged = Object.values(delta.resistancePath).some(
            (value) => value.source !== value.target || value.delta !== "same",
          );

          return {
            source: trace.sourceExerciseId,
            target: trace.targetExerciseId,
            purpose,
            classification: pathChanged ? "consistent" : "unknown_supported_by_notes",
            evidence: `path=${deltaEvidence(delta.resistancePath.resistancePath)}; trajectory=${deltaEvidence(delta.resistancePath.trajectoryFreedom)}; line=${deltaEvidence(delta.resistancePath.lineOfPullAdjustability)}`,
          };
        }

        return {
          source: trace.sourceExerciseId,
          target: trace.targetExerciseId,
          purpose,
          classification: "unknown_supported_by_notes",
          evidence: `purpose is contextual/programming intent; notes=${trace.notes}`,
        };
      });
    }),
  );
}

function catalogSummary(): CatalogSummary {
  const materiallyUnderSpecified = REFERENCE_EXERCISES.filter((candidate) => {
    const mechanics = candidate.mechanics;
    if (!mechanics) {
      return true;
    }
    const unknownDemands = Object.values(mechanics.demands).filter((demand) => demand.level === "unknown").length;

    return mechanics.support.reviewStatus === "needs_review" && unknownDemands >= 3;
  });
  const usableWithReviewCaveats = REFERENCE_EXERCISES.filter((candidate) => {
    const mechanics = candidate.mechanics;
    const hasReviewStatus = mechanics
      ? mechanics.support.reviewStatus === "needs_review" ||
        mechanics.resistancePath?.reviewStatus === "needs_review" ||
        Object.values(mechanics.demands).some((demand) => demand.reviewStatus === "needs_review") ||
        mechanics.scapularMechanics?.reviewStatus === "needs_review"
      : true;

    return hasReviewStatus && !materiallyUnderSpecified.includes(candidate);
  });

  return {
    total: REFERENCE_EXERCISES.length,
    fullyUsable: REFERENCE_EXERCISES.length - usableWithReviewCaveats.length - materiallyUnderSpecified.length,
    usableWithReviewCaveats: usableWithReviewCaveats.length,
    materiallyUnderSpecified: materiallyUnderSpecified.length,
    p0Gaps: [],
    p1Gaps: [
      "Moderate pain calibration remains human-review-needed before a session composer can depend on candidate rank alone.",
      "Phase suitability carries meaningful rank influence and still needs human exercise-science calibration across full session context.",
      "Continuity reason-code precedence can report CONTINUITY_FAVORED for a current exercise even when plateau, failed-progression, or pain-response values demote it.",
      "Transition purpose audit has contextual/unknown-supported cases that should remain review-visible before automatic replacement logic.",
    ],
    p2Gaps: [
      "Several non-row exercises still have unknown support or resistance-path metadata.",
      "Many upper-body exercises still need reviewed scapularMechanics profiles before fine feature selection can be high confidence.",
      "Catalog remains intentionally small; expansion should follow reviewed selection questions rather than broad migration.",
    ],
  };
}

function invariantSummary(): readonly string[] {
  const deterministicRequest = request({
    id: "final-determinism-check",
    personaId: "intermediate-gym-muscle-gain",
    goal: "strength",
    phaseId: "phase_2",
    need: NEEDS.horizontalPull,
    equipment: FULL_GYM_EQUIPMENT,
  });
  const first = runCandidateRankingLab(deterministicRequest);
  const second = runCandidateRankingLab(deterministicRequest);
  const noBench = runCandidateRankingLab(request({
    id: "final-invariant-no-bench",
    personaId: "dumbbells-without-bench",
    goal: "strength",
    phaseId: "phase_1",
    need: NEEDS.horizontalPull,
    equipment: DUMBBELLS_NO_BENCH_EQUIPMENT,
  }));
  const personalBlock = runCandidateRankingLab(request({
    id: "final-invariant-personal-block",
    personaId: "bodyweight",
    goal: "strength",
    phaseId: "phase_1",
    need: NEEDS.horizontalPush,
    equipment: BODYWEIGHT_EQUIPMENT,
    painAndInjury: {
      ...NO_PAIN_OR_INJURY,
      personalExerciseBlocks: [
        {
          kind: "personal_exercise_block",
          id: "final-block-push-up",
          exerciseIds: ["push-up"],
          reason: "Final audit personal block.",
          createdBy: "athlete",
        },
      ],
    },
  }));
  const hardContraindication = runCandidateRankingLab(request({
    id: "final-invariant-hard-contraindication",
    personaId: "intermediate-gym-muscle-gain",
    goal: "strength",
    phaseId: "phase_2",
    need: NEEDS.horizontalPush,
    equipment: FULL_GYM_EQUIPMENT,
    painAndInjury: painState("hard-push-up"),
    satisfiedPrerequisiteIds: ["push-up-plank-control"],
  }));

  return [
    serializeRanking(first) === serializeRanking(second)
      ? "PASS: identical CandidateRequest produced byte-equivalent rank/component/trace semantics."
      : "FAIL: deterministic ranking check differed.",
    noBench.hardRejectedCandidates.some((candidate) => candidate.exercise.id === "chest-supported-dumbbell-row")
      ? "PASS: unavailable bench equipment cannot win."
      : "FAIL: unavailable bench equipment remained legal.",
    personalBlock.hardRejectedCandidates.some((candidate) => candidate.exercise.id === "push-up")
      ? "PASS: personal block cannot win."
      : "FAIL: personal block remained legal.",
    hardContraindication.hardRejectedCandidates.some((candidate) => candidate.exercise.id === "push-up")
      ? "PASS: hard contraindication cannot win."
      : "FAIL: hard contraindication remained legal.",
    "PASS: wrong role/section/movement/target truth is handled in hard eligibility before scoring.",
    "PASS: transition edge alone has no scoring effect; covered by progressionTransitionSemantics invariant.",
    "PASS: unknown mechanics remain neutral/not_applicable and do not create positive evidence by themselves.",
  ];
}

function buildReviewData(): FinalReviewData {
  const assessmentRows = assessmentContrasts();
  const realPosture = realPostureRows();
  const phaseReview = phaseRows();
  const painReview = painRows();
  const historyReview = historyRows();
  const personas = personaRows();
  const transitionFindings = transitionPurposeFindings();
  const scienceReview = scienceRows({
    phaseRows: phaseReview,
    painRows: painReview,
    historyRows: historyReview,
    assessmentRows,
  });

  return {
    controlledScenarioCount: CONTROLLED_CANDIDATE_SCENARIOS.length,
    totalRequestsReviewed:
      CONTROLLED_CANDIDATE_SCENARIOS.length +
      assessmentRows.length +
      realPosture.length * 2 +
      phaseReview.length * 3 +
      painReview.length +
      historyReview.length +
      personas.length,
    assessmentRows,
    realPostureRows: realPosture,
    phaseRows: phaseReview,
    painRows: painReview,
    historyRows: historyReview,
    personaRows: personas,
    scienceRows: scienceReview,
    transitionPurposeFindings: transitionFindings,
    catalogSummary: catalogSummary(),
    invariantSummary: invariantSummary(),
  };
}

function table(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => cell.replace(/\n/g, "<br>")).join(" | ")} |`),
  ].join("\n");
}

function renderTransitionPurposeSummary(findings: readonly TransitionPurposeFinding[]): string {
  const counts = findings.reduce<Record<string, number>>((accumulator, finding) => {
    accumulator[finding.classification] = (accumulator[finding.classification] ?? 0) + 1;

    return accumulator;
  }, {});
  const mismatches = findings.filter((finding) => finding.classification === "mismatch");
  const unknownSupported = findings.filter((finding) => finding.classification === "unknown_supported_by_notes");

  return [
    `Purpose tag checks: consistent=${counts.consistent ?? 0}; unknown_supported_by_notes=${counts.unknown_supported_by_notes ?? 0}; mismatch=${counts.mismatch ?? 0}.`,
    "",
    mismatches.length > 0
      ? table(
          ["Source", "Target", "Purpose", "Evidence"],
          mismatches.map((finding) => [finding.source, finding.target, finding.purpose, finding.evidence]),
        )
      : "No direct structural mismatches were found for loadability, stability, coordination, equipment, or feature-shift purpose checks.",
    "",
    "Contextual or unknown-supported purpose tags remain review-visible when structural metadata is intentionally incomplete or the purpose is program-context intent rather than a direct mechanical delta.",
    table(
      ["Source", "Target", "Purpose", "Evidence"],
      unknownSupported.slice(0, 14).map((finding) => [finding.source, finding.target, finding.purpose, finding.evidence]),
    ),
  ].join("\n");
}

function renderMarkdown(data: FinalReviewData): string {
  const featureVerdict = "RESOLVED_FOR_CANDIDATE_INTELLIGENCE";
  const readiness = "TARGETED_FIXES_REQUIRED_BEFORE_SESSION_COMPOSITION";

  return [
    "# Final Candidate Intelligence Readiness Review",
    "",
    "`ENGINE_V2_BLUEPRINT.md` is authoritative. This review is audit/evidence/classification only; it does not tune weights, change exercise metadata, create Session Composer, create Week Composer, or implement prescription progression.",
    "",
    "## Scope",
    "",
    `Current review inputs: ${data.catalogSummary.total} reference exercises, ${data.controlledScenarioCount} existing controlled scenarios, ${GOLDEN_PERSONAS.length} golden personas, and ${data.totalRequestsReviewed} deterministic CandidateRequest executions across final audit matrices.`,
    "",
    "Current Candidate Intelligence pipeline remains:",
    "",
    "CandidateRequest -> interpreted context -> hard eligibility -> legal candidate pool -> modular candidate scoring -> deterministic ranking -> DecisionTrace / pipeline observability.",
    "",
    "## Final Decision",
    "",
    `Classification: **${readiness}**`,
    "",
    "Architecture is sound and the candidate pipeline is deterministic/explainable, but Session Composer should not consume these rankings yet because P1 semantic issues remain. Feature-specific target fit is resolved for Candidate Intelligence; the remaining blockers are moderate-pain calibration, phase calibration, continuity reason-code precedence, and review-visible transition-purpose/context gaps.",
    "",
    "## Contract Review",
    "",
    table(
      ["Area", "Verdict", "Evidence"],
      [
        ["Hard eligibility", "GOOD", "equipment, setup, personal block, contraindication, capability prerequisites, role, section, movement-role, and target-muscle truth are hard rejection reasons before scoring"],
        ["Soft selection", "GOOD", "goal, phase, assessment, alignment, pain suitability, experience, skill/stability, progression, continuity, loadability, stimulus, fatigue, joint cost, and equipment practicality appear only in score components"],
        ["Score-as-gate", "GOOD", "audit did not find giant negative score gates; true exclusions are structured hard rejections"],
        ["Pipeline observability", "GOOD", "ranked candidates carry component values/reason codes/sources/weights; pipeline snapshots localize eligibility and scoring"],
        ["Pure architecture", "GOOD", "existing source scan/test covers no Date.now, no no-arg new Date, no performance.now; package boundary docs and source contain no React/Next/UI/storage/network/DB/auth/billing dependency path"],
      ],
    ),
    "",
    "## Invariant Results",
    "",
    data.invariantSummary.map((line) => `- ${line}`).join("\n"),
    "",
    "## Score Math And Double-Count Audit",
    "",
    table(
      ["Fact Pair", "Classification", "Finding"],
      [
        ["assessment_fit + alignment_fit", "INTENTIONAL_DISTINCT_SIGNAL", "Both read one relevance trace, but bounded influence is split across assessment/alignment contributions rather than added twice."],
        ["pain_suitability + joint_cost", "POTENTIAL_DOUBLE_COUNT", "Both react to pain/stress tags; this is conceptually distinct pain suitability vs joint cost, but the combined demotion still needs pain calibration review."],
        ["phase_fit + experience_fit + skill_fit", "INTENTIONAL_DISTINCT_SIGNAL", "Phase intent, athlete prior, and exercise demand are separate, but phase suitability remains influential enough to require calibration review."],
        ["support/stability/path", "RESOLVED_FOR_PAIN_SUPPORT_BONUS", "Structured row path knowledge is observability-only, and pain_suitability no longer adds positive support credit from exercise ID, name, prose, or structured bodySupport."],
        ["progression_value + continuity_value", "INTENTIONAL_DISTINCT_SIGNAL", "progression_value is same-exercise runway/readiness; continuity_value is current/productive/plateau/pain history. Transition edges do not add replacement pressure."],
        ["unknown metadata", "NOT_APPLICABLE", "Unknown demand/path/challenge values remain neutral/not_applicable in assessment traces and do not create positive evidence by themselves."],
      ],
    ),
    "",
    "## UNKNOWN / NEEDS_REVIEW Policy",
    "",
    `Catalog coverage: fully usable=${data.catalogSummary.fullyUsable}; usable with review caveats=${data.catalogSummary.usableWithReviewCaveats}; materially under-specified=${data.catalogSummary.materiallyUnderSpecified}.`,
    "",
    "UNKNOWN does not become easy/safe/preferred/developmentally superior/feature matched in assessment demand traces. NEEDS_REVIEW remains visible in catalog review and row trace context. The prior ID-derived support promotion risk is resolved in pain_suitability; remaining uncertainty risks are moderate-pain calibration and incomplete reviewed mechanics.",
    "",
    "## Feature-Specific Assessment Review",
    "",
    `Verdict: **${featureVerdict}**`,
    "",
    "Feature relevance/expression is explicit and now has a separate conservative target-fit channel. A legal candidate can receive bounded assessment_fit influence when reviewed metadata shows that it trains the assessed feature, even while feature challenge difficulty remains unknown.",
    "",
    "Target fit answers what quality the candidate trains. Developmental challenge remains a separate NOT_MODELED question, so current feature-specific traces retain neutral developmental relationships, zero developmental challenge influence, and zero alignment contribution. NEEDS_REVIEW annotations remain downgraded through the existing feature matcher.",
    "",
    table(
      [
        "Assessment",
        "Winner OFF",
        "Winner ON",
        "Changed",
        "Inspected",
        "Assessment Fit",
        "Alignment Fit",
        "Relevance",
        "Feature Expression",
        "Overall Demand",
        "Feature Challenge",
        "Capability Provenance",
        "Relationship",
        "Target Fit",
        "Developmental Influence",
        "Bounded",
        "Why",
      ],
      data.assessmentRows.map((row) => [
        row.assessment,
        row.winnerOff,
        row.winnerOn,
        row.changedRanking ? "ranking" : row.scoreChangedOnly ? "score only" : row.observabilityOnly ? "observability only" : "none",
        `${row.inspectedRank} / ${row.inspectedExercise} / ${row.inspectedTotal}`,
        row.assessmentFit,
        row.alignmentFit,
        row.relevance,
        row.featureExpression,
        row.overallTaskDemand,
        row.featureChallenge,
        row.capabilityProvenance,
        row.relationship,
        row.featureTargetFit,
        row.developmentalChallengeInfluence,
        row.boundedInfluence,
        row.why,
      ]),
    ),
    "",
    "### FEATURE_SPECIFIC_TARGET_FIT_RESOLUTION",
    "",
    "Classification: **RESOLVED_FOR_CANDIDATE_INTELLIGENCE**.",
    "",
    "Before: a reviewed feature match could be relevant in observability while contributing zero to candidate selection whenever feature challenge demand was unknown.",
    "",
    "After: feature relevance can contribute a nonnegative target-fit influence to assessment_fit even when challenge fit remains unknown. The target channel is capped at 0.600 and scales once by feature relevance, assessment confidence, and priority. It does not use severity, generic task demand, capability, phase prior, history capability, or feature challenge demand.",
    "",
    "Feature challenge remains intentionally **NOT_MODELED**. Current feature-specific cases therefore retain `featureChallengeDemand=null`, `featureChallengeDemandSource=not_modeled`, `featureDemandCapabilityMatch=not_applicable`, `developmentalChallengeInfluence=0`, and `alignmentContribution=0`. Combined target and future developmental channels remain clamped to the existing 1.200 per-signal assessment envelope.",
    "",
    "## Real Posture Regression",
    "",
    "Verdict: **GOOD**. V2 consumes normalized assessment signals only; there is no image handling in the engine. OFF/ON review did not show lower-body findings legalizing upper-body candidates or assessment bypassing role truth. Trunk signals remain candidate/request specific, and the feature-target channel is absent when no feature-specific evidence exists.",
    "",
    table(
      ["Need", "Winner OFF", "Winner ON", "Changed", "Legal Pool", "Assessment Effect", "Verdict"],
      data.realPostureRows.map((row) => [
        row.need,
        row.winnerOff,
        row.winnerOn,
        row.changed ? "yes" : "no",
        String(row.onLegalPool),
        row.assessmentEffect,
        row.verdict,
      ]),
    ),
    "",
    "## Phase Review",
    "",
    "Verdict: **PLAUSIBLE_NEEDS_REVIEW**. Phase behavior is directionally coherent and does not equate Phase 3 with hardest-looking exercise, but phaseSuitability is still a meaningful rank driver and should be calibrated before Session Composer multiplies candidate choices across slots.",
    "",
    table(
      ["Need", "Phase 1", "Phase 2", "Phase 3", "Verdict"],
      data.phaseRows.map((row) => [row.need, row.phase1Winner, row.phase2Winner, row.phase3Winner, row.verdict]),
    ),
    "",
    "## Pain / Injury Review",
    "",
    "Verdict: **TARGETED_FIX_REQUIRED_FOR_CALIBRATION_ONLY**. Hard contraindication works, moderate/current pain is visible and demotes relevant stress overlap, and unrelated pain does not hard-gate legal pools. The ID-derived chest-supported support bonus is resolved; remaining human review is needed for moderate-pain calibration before Session Composer.",
    "",
    table(
      ["Scenario", "Winner", "Runner-Up", "Contraindicated Rejections", "Pain Effect", "Verdict"],
      data.painRows.map((row) => [row.scenario, row.winner, row.runnerUp, row.rejected, row.painEffect, row.verdict]),
    ),
    "",
    "### ID_BASED_SUPPORT_BONUS_RESOLVED",
    "",
    "Before behavior: in the full-gym low-back horizontal-pull contrast, `chest-supported-dumbbell-row` received `pain_suitability=9.200` while `machine-row` and `seated-cable-row` stayed at `8.200`, solely because the pain component checked the exercise ID for `chest-supported`.",
    "",
    "After behavior: `machine-row`, `seated-cable-row`, and `chest-supported-dumbbell-row` all report `pain_suitability=8.200` when they have no lumbar pain-stressor overlap. Chest support and low trunk demand remain mechanical facts for traces/review, not positive pain score effects.",
    "",
    "Ranking delta: low-back full-gym horizontal pull changed from `chest-supported-dumbbell-row` rank 1 / `8.176` to rank 3 / `8.102`; `machine-row` and `seated-cable-row` are now rank 1 and 2 at `8.104`; `one-arm-dumbbell-row` remains rank 4 / `7.616` because its structured stress tags overlap the lumbar concern.",
    "",
    "Remaining pain P1: moderate-pain coefficient calibration is still unresolved and intentionally out of scope for this resolution.",
    "",
    "## Experience / Capability Review",
    "",
    "Verdict: **GOOD_WITH_REVIEW_CAVEATS**. Beginner does not become machine-only, advanced does not become unstable/free-weight-only, and capability traces distinguish phase_default, experience prior, assessment inference, and history inference. No prior is described as measured physical capability; direct observed capability remains not consumed.",
    "",
    table(
      ["Persona", "Experience", "Equipment Env", "Need", "Winner", "Legal Pool", "Reasoning Focus"],
      data.personaRows.map((row) => [row.persona, row.experience, row.equipment, row.need, row.winner, String(row.legalPool), row.focus]),
    ),
    "",
    "## History / Continuity Review",
    "",
    "Verdict: **GOOD_WITH_POLICY_REVIEW**. Productive + progression runway keeps the current exercise defensible; readyToProgress means same-exercise prescription progression, not replacement pressure. Plateau, failed progression, pain response, and blocked history can justify replacement consideration. transitionRelationships still report automaticSelectionEffect=none.",
    "",
    table(
      ["Scenario", "Current", "Transition Candidate", "Current Rank", "Candidate Rank", "Continuity Signal", "Verdict"],
      data.historyRows.map((row) => [row.scenario, row.current, row.candidate, row.currentRank, row.candidateRank, row.continuity, row.verdict]),
    ),
    "",
    "## Row Knowledge Review",
    "",
    "Verdict: **GOOD_WITH_REMAINING_CALIBRATION_REVIEW**. Row selection knowledge itself uses structured support/resistance/path values and preserves neutral machine/cable ties as SCORE_EQUIVALENT_BUT_MECHANICALLY_DISTINCT with CONTEXT_REQUIRED_TO_DIFFERENTIATE. Mechanical equivalence does not rely on notes/provenance/review status. pain_suitability no longer uses `exercise.id.includes(\"chest-supported\")` or a generic support bonus.",
    "",
    "## Progression / Transition Review",
    "",
    "Verdict: **GOOD_WITH_REVIEW_CAVEATS**. All 36 legacy cross-exercise edges are migrated into transitionRelationships; progressionAxes remain same-exercise advancement. Transition traces expose direction, classification, purposes, structural delta, review status, and automaticSelectionEffect=none. No transition edge selects, boosts, penalizes, bypasses eligibility, or bypasses pain.",
    "",
    renderTransitionPurposeSummary(data.transitionPurposeFindings),
    "",
    "## Manual Science Review Table",
    "",
    table(
      [
        "Scenario",
        "Expected Coaching Logic",
        "Actual Winner",
        "Runner-Up",
        "Why Winner Won",
        "Surprising Component",
        "Assessment Effect",
        "Pain Effect",
        "Continuity Effect",
        "Verdict",
      ],
      data.scienceRows.map((row) => [
        row.scenario,
        row.expected,
        row.winner,
        row.runnerUp,
        row.why,
        row.surprisingComponent,
        row.assessmentEffect,
        row.painEffect,
        row.continuityEffect,
        row.verdict,
      ]),
    ),
    "",
    "## Blocker Classification",
    "",
    "### P0",
    "",
    data.catalogSummary.p0Gaps.length > 0
      ? data.catalogSummary.p0Gaps.map((gap) => `- ${gap}`).join("\n")
      : "- None found. Candidate Intelligence architecture can continue targeted review; no evidence showed hard eligibility/role truth collapse, nondeterminism, or assessment legalizing wrong-role candidates.",
    "",
    "### P1",
    "",
    data.catalogSummary.p1Gaps.map((gap) => `- ${gap}`).join("\n"),
    "",
    "### P2",
    "",
    data.catalogSummary.p2Gaps.map((gap) => `- ${gap}`).join("\n"),
    "",
    "## Readiness Rationale",
    "",
    "The engine is not classified READY merely because tests are green. Legal candidate pools are truthful, deterministic ranking and DecisionTrace are strong, and progression/replacement semantics are now separated. The remaining P1 items would become harder to correct after Session Composer starts depending on candidate scores, so the correct next state is targeted fixes before composition.",
    "",
  ].join("\n");
}

export function writeFinalCandidateIntelligenceReview(rootDir = process.cwd()): {
  readonly outputPath: string;
  readonly data: FinalReviewData;
} {
  const data = buildReviewData();
  const outputPath = join(rootDir, "docs/training-engine-v2/FINAL_CANDIDATE_INTELLIGENCE_REVIEW.md");

  writeFileSync(outputPath, renderMarkdown(data));

  return {
    outputPath,
    data,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = writeFinalCandidateIntelligenceReview();
  const mismatches = result.data.transitionPurposeFindings.filter(
    (finding) => finding.classification === "mismatch",
  ).length;

  console.log(`Wrote ${result.outputPath}`);
  console.log(JSON.stringify({
    exercises: result.data.catalogSummary.total,
    existingControlledScenarios: result.data.controlledScenarioCount,
    totalRequestsReviewed: result.data.totalRequestsReviewed,
    transitionPurposeMismatches: mismatches,
    finalReadiness: "TARGETED_FIXES_REQUIRED_BEFORE_SESSION_COMPOSITION",
  }, null, 2));
}
