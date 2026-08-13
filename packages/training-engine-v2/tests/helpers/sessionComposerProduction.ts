import { createHash } from "node:crypto";
import {
  CONTROLLED_CANDIDATE_SCENARIOS,
  REFERENCE_EXERCISES,
  PRODUCTION_SESSION_SEARCH_POLICY,
  buildSessionPrescriptionHandoff,
  buildSessionSequencingInput,
  buildSessionCandidateResults,
  composeSessionSkeleton,
  composeSessionSkeletonExhaustive,
  deriveCanonicalCompositionFacts,
  evaluatePostPrescriptionDuration,
  validateSessionCandidateResults,
  validateSessionIntent,
  type CandidatePainExecutionReadiness,
  type CandidateRequest,
  type CandidateRankingResult,
  type ExerciseSelectionNeed,
  type SessionCandidateBuildContext,
  type SessionIntent,
  type SessionNeed,
  type SessionNeedPriority,
  type SessionSkeleton,
  type StructuralCapacityMode,
} from "../../src";

const baseRequest = CONTROLLED_CANDIDATE_SCENARIOS.find((entry) =>
  entry.id === "horizontal-pull-gym-neutral",
)!.request;

export const PRODUCTION_COMPOSER_AS_OF = "2026-08-12T12:00:00-04:00";

export function selection(input: Partial<ExerciseSelectionNeed> &
Pick<ExerciseSelectionNeed, "requestedRole">): ExerciseSelectionNeed {
  return {
    requestedRole: input.requestedRole,
    targetMovementRoles: input.targetMovementRoles ?? [],
    targetActionFunctions: input.targetActionFunctions ?? [],
    targetMuscles: input.targetMuscles ?? [],
    muscleRequirement: input.muscleRequirement ?? "primary_required",
    targetBodyRegions: input.targetBodyRegions ?? [],
  };
}

export function sessionNeed(input: {
  readonly id: string;
  readonly section: SessionNeed["section"];
  readonly priority: SessionNeedPriority;
  readonly priorityOrder: number;
  readonly selection: ExerciseSelectionNeed;
  readonly standaloneAdmission?: SessionNeed["standaloneAdmission"];
  readonly dependencies?: SessionNeed["dependencies"];
}): SessionNeed {
  return {
    id: input.id,
    section: input.section,
    priority: input.priority,
    priorityOrder: input.priorityOrder,
    standaloneAdmission: input.standaloneAdmission ??
      (input.priority === "required" ? "admitted" : "duration_conditional"),
    sourceEvidence: [{
      sourceKind: input.priority === "required" ? "session_primary_purpose" : "direct_muscle_priority",
      sourceId: `${input.id}:source`,
      evidenceRefs: [`${input.id}:evidence`],
    }],
    dependencies: input.dependencies ?? [],
    reasonCode: `need_${input.id}`,
    explanation: `Trace-only rationale for ${input.id}.`,
    selection: input.selection,
  };
}

export const PUSH_NEED = sessionNeed({
  id: "main-push",
  section: "main",
  priority: "required",
  priorityOrder: 0,
  selection: selection({
    requestedRole: "primary_strength",
    targetMovementRoles: ["horizontal_push"],
    targetMuscles: ["chest"],
  }),
});

export const PULL_NEED = sessionNeed({
  id: "main-pull",
  section: "main",
  priority: "required",
  priorityOrder: 1,
  selection: selection({
    requestedRole: "primary_strength",
    targetMovementRoles: ["horizontal_pull"],
    targetMuscles: ["mid_back", "lats"],
  }),
});

export const DIRECT_CHEST_NEED = sessionNeed({
  id: "direct-chest",
  section: "main",
  priority: "preferred",
  priorityOrder: 0,
  selection: selection({
    requestedRole: "primary_strength",
    targetMuscles: ["chest"],
  }),
});

export const BICEPS_NEED = sessionNeed({
  id: "biceps",
  section: "accessory",
  priority: "optional",
  priorityOrder: 0,
  standaloneAdmission: "duration_conditional",
  selection: selection({
    requestedRole: "hypertrophy_accessory",
    targetActionFunctions: ["elbow_flexion"],
    targetMuscles: ["biceps"],
  }),
});

export const TRICEPS_NEED = sessionNeed({
  id: "triceps",
  section: "accessory",
  priority: "preferred",
  priorityOrder: 0,
  selection: selection({
    requestedRole: "hypertrophy_accessory",
    targetActionFunctions: ["elbow_extension"],
    targetMuscles: ["triceps"],
  }),
});

export const SQUAT_NEED = sessionNeed({
  id: "main-squat",
  section: "main",
  priority: "required",
  priorityOrder: 0,
  selection: selection({
    requestedRole: "primary_strength",
    targetMovementRoles: ["squat", "knee_dominant"],
    targetMuscles: ["quads", "glutes"],
  }),
});

export const HINGE_NEED = sessionNeed({
  id: "main-hinge",
  section: "main",
  priority: "required",
  priorityOrder: 1,
  selection: selection({
    requestedRole: "primary_strength",
    targetMovementRoles: ["hinge"],
    targetMuscles: ["hamstrings", "glutes"],
  }),
});

export const CARRY_NEED = sessionNeed({
  id: "carry",
  section: "accessory",
  priority: "preferred",
  priorityOrder: 0,
  selection: selection({
    requestedRole: "capacity",
    targetMovementRoles: ["carry"],
    targetMuscles: ["trunk"],
  }),
});

export const BRACING_NEED = sessionNeed({
  id: "loaded-bracing",
  section: "accessory",
  priority: "preferred",
  priorityOrder: 1,
  selection: selection({
    requestedRole: "capacity",
    targetMovementRoles: ["loaded_bracing"],
    targetMuscles: ["trunk"],
  }),
});

export function productionIntent(input: {
  readonly id?: string;
  readonly needs?: readonly SessionNeed[];
  readonly capacity?: StructuralCapacityMode;
  readonly availableMinutes?: number;
  readonly continuity?: SessionIntent["continuityEvidence"];
  readonly kind?: SessionIntent["kind"];
  readonly contextRequest?: CandidateRequest;
} = {}): SessionIntent {
  const request = input.contextRequest ?? baseRequest;
  const painRefs = [
    ...request.painAndInjury.historicalSensitivities,
    ...request.painAndInjury.currentDiscomforts,
    ...request.painAndInjury.moderatePain,
    ...request.painAndInjury.acuteSeverePain,
    ...request.painAndInjury.hardContraindications,
  ].map((entry) => entry.id);
  return {
    id: input.id ?? "production-composer-fixture",
    athleteId: request.athlete.id,
    kind: input.kind ?? "ordinary_training",
    phaseIntent: request.phase,
    primaryGoal: request.goal,
    needs: input.needs ?? [PUSH_NEED, PULL_NEED],
    structuralCapacity: input.capacity ?? "standard",
    availableMinutes: input.availableMinutes ?? 45,
    assessmentContextRefs: request.assessment.signals.map((entry) => entry.id),
    painResponseContextRefs: painRefs,
    fatigueContext: request.fatigueSignals,
    continuityEvidence: input.continuity ?? { identities: [] },
    plannerSourceTrace: {
      plannerId: "production-fixture-planner",
      sourceRefs: ["controlled-production-fixture"],
    },
    unresolvedWeeklyContextRefs: ["week-composer-not-implemented"],
  };
}

export function productionContext(request: CandidateRequest = baseRequest): SessionCandidateBuildContext {
  return {
    athlete: request.athlete,
    assessment: request.assessment,
    alignmentPriorities: request.alignmentPriorities,
    painAndInjury: request.painAndInjury,
    trainingSafety: request.trainingSafety,
    equipment: request.equipment,
    history: request.history,
    satisfiedPrerequisiteIds: [
      "push-up-plank-control",
      "hinge-control",
      "suitcase-carry-loaded-gait-setup",
    ],
    evaluationAsOf: PRODUCTION_COMPOSER_AS_OF,
  };
}

export function buildResults(
  intent: SessionIntent,
  request: CandidateRequest = baseRequest,
): Readonly<Record<string, CandidateRankingResult>> {
  return buildSessionCandidateResults(intent, productionContext(request));
}

export function trimResults(
  results: Readonly<Record<string, CandidateRankingResult>>,
  exerciseIdsByNeed: Readonly<Record<string, readonly string[]>>,
): Readonly<Record<string, CandidateRankingResult>> {
  return Object.freeze(Object.fromEntries(Object.entries(results).map(([needId, result]) => {
    const allowed = exerciseIdsByNeed[needId];
    return [needId, allowed ? {
      ...result,
      rankedCandidates: result.rankedCandidates.filter((candidate) => allowed.includes(candidate.exercise.id)),
    } : result];
  })));
}

export function withReadiness(input: {
  readonly results: Readonly<Record<string, CandidateRankingResult>>;
  readonly needId: string;
  readonly exerciseId: string;
  readonly readiness: CandidatePainExecutionReadiness;
}): Readonly<Record<string, CandidateRankingResult>> {
  const result = input.results[input.needId];
  const rankedCandidates = result.rankedCandidates.map((candidate) =>
    candidate.exercise.id === input.exerciseId
      ? {
        ...candidate,
        painExecutionReadiness: {
          ...candidate.painExecutionReadiness,
          readiness: input.readiness,
          applicableRequirements: input.readiness === "EXECUTABLE_AT_CANDIDATE_SCOPE"
            ? []
            : [{
              signalId: `${input.exerciseId}-requirement`,
              signalKind: "current_discomfort" as const,
              requestedAction: "reduce_range" as const,
              requestedActionSource: "current_discomfort_effect" as const,
              primaryFutureOwner: input.readiness === "REQUIRES_CANDIDATE_REVIEW"
                ? "candidate_review" as const
                : "prescription" as const,
              executionStatus: input.readiness === "REQUIRES_CANDIDATE_REVIEW"
                ? "policy_unresolved_candidate_review_required" as const
                : "deferred_unexecutable_at_candidate_layer" as const,
              matchedStressFacts: [],
              evidence: [`${input.exerciseId}-structured-requirement`],
            }],
        },
      }
      : candidate,
  );
  return {
    ...input.results,
    [input.needId]: {
      ...result,
      rankedCandidates,
      painExecutionReadiness: {
        ...result.painExecutionReadiness,
        executableCandidateIds: rankedCandidates
          .filter((entry) => entry.painExecutionReadiness.readiness === "EXECUTABLE_AT_CANDIDATE_SCOPE")
          .map((entry) => entry.exercise.id),
        bestExecutableCandidateId: rankedCandidates.find((entry) =>
          entry.painExecutionReadiness.readiness === "EXECUTABLE_AT_CANDIDATE_SCOPE"
        )?.exercise.id ?? null,
        hasExecutableCandidate: rankedCandidates.some((entry) =>
          entry.painExecutionReadiness.readiness === "EXECUTABLE_AT_CANDIDATE_SCOPE"
        ),
      },
    },
  };
}

export function compactFixture(input: {
  readonly intent?: SessionIntent;
  readonly candidates?: Readonly<Record<string, readonly string[]>>;
} = {}): {
  readonly intent: SessionIntent;
  readonly results: Readonly<Record<string, CandidateRankingResult>>;
} {
  const intent = input.intent ?? productionIntent();
  const results = trimResults(buildResults(intent), input.candidates ?? {
    "main-push": ["dumbbell-bench-press", "machine-chest-press"],
    "main-pull": ["machine-row", "chest-supported-dumbbell-row"],
  });
  return { intent, results };
}

export function composeCompact(input: Parameters<typeof compactFixture>[0] = {}): SessionSkeleton {
  const fixture = compactFixture(input);
  return composeSessionSkeleton({ intent: fixture.intent, candidateResultsByNeed: fixture.results });
}

export interface ProductionCalibrationCase {
  readonly id: string;
  readonly intent: SessionIntent;
  readonly results: Readonly<Record<string, CandidateRankingResult>>;
}

export function buildProductionCalibrationCases(): readonly ProductionCalibrationCase[] {
  const definitions: readonly {
    id: string;
    needs: readonly SessionNeed[];
    capacity: StructuralCapacityMode;
    candidates: Readonly<Record<string, readonly string[]>>;
  }[] = [
    { id: "upper-strength", needs: [PUSH_NEED, PULL_NEED], capacity: "standard", candidates: { "main-push": ["dumbbell-bench-press", "machine-chest-press"], "main-pull": ["machine-row", "chest-supported-dumbbell-row"] } },
    { id: "upper-shared-chest", needs: [PUSH_NEED, PULL_NEED, DIRECT_CHEST_NEED], capacity: "standard", candidates: { "main-push": ["dumbbell-bench-press", "machine-chest-press"], "main-pull": ["machine-row"], "direct-chest": ["dumbbell-bench-press", "machine-chest-press"] } },
    { id: "upper-expanded", needs: [PUSH_NEED, PULL_NEED, BICEPS_NEED], capacity: "expanded", candidates: { "main-push": ["dumbbell-bench-press"], "main-pull": ["machine-row"], biceps: ["dumbbell-curl"] } },
    { id: "upper-condensed", needs: [PUSH_NEED, PULL_NEED, TRICEPS_NEED], capacity: "condensed", candidates: { "main-push": ["machine-chest-press"], "main-pull": ["machine-row"], triceps: ["cable-triceps-pressdown"] } },
    { id: "lower-strength", needs: [SQUAT_NEED, HINGE_NEED], capacity: "standard", candidates: { "main-squat": ["goblet-squat", "leg-press"], "main-hinge": ["dumbbell-romanian-deadlift", "cable-pull-through"] } },
    { id: "carry-shared", needs: [PUSH_NEED, CARRY_NEED, BRACING_NEED], capacity: "standard", candidates: { "main-push": ["machine-chest-press"], carry: ["suitcase-carry"], "loaded-bracing": ["suitcase-carry"] } },
  ];
  const controlled = definitions.map((definition) => {
    const intent = productionIntent({
      id: `calibration-${definition.id}`,
      needs: definition.needs,
      capacity: definition.capacity,
    });
    return {
      id: definition.id,
      intent,
      results: trimResults(buildResults(intent), definition.candidates),
    };
  });
  const broadIntent = productionIntent({
    id: "calibration-full-candidate-expanded",
    needs: [
      PUSH_NEED,
      PULL_NEED,
      DIRECT_CHEST_NEED,
      { ...TRICEPS_NEED, priorityOrder: 1 },
      BICEPS_NEED,
    ],
    capacity: "expanded",
  });
  return [
    ...controlled,
    {
      id: "full-candidate-expanded-boundary",
      intent: broadIntent,
      results: buildResults(broadIntent),
    },
  ];
}

export function compareBoundedToExhaustive(caseItem: ProductionCalibrationCase): {
  readonly equivalent: boolean;
  readonly exhaustive: SessionSkeleton;
  readonly bounded: SessionSkeleton;
} {
  const exhaustive = composeSessionSkeletonExhaustive({
    intent: caseItem.intent,
    candidateResultsByNeed: caseItem.results,
  });
  const bounded = composeSessionSkeleton({
    intent: caseItem.intent,
    candidateResultsByNeed: caseItem.results,
    searchPolicy: {
      exactExpandedStateBudget: 0,
      boundedExpandedStateBudget: 48,
      retainedParetoFrontierPerLayer: 4,
    },
  });
  const signature = (result: SessionSkeleton) => JSON.stringify({
    status: result.compositionStatus,
    readiness: result.executionReadiness,
    assignments: result.assignments.map((assignment) => ({
      id: assignment.exerciseId,
      section: assignment.section,
      role: assignment.role,
      needs: assignment.satisfiedNeedIds,
    })),
  });
  return { equivalent: signature(exhaustive) === signature(bounded), exhaustive, bounded };
}

export const SESSION_COMPOSER_PRODUCTION_FINGERPRINT_NAMES = [
  "canonicalExerciseSelectionNeed",
  "needsFirstSessionIntent",
  "domainMigration",
  "candidateResultConsistency",
  "canonicalCompositionFactProjection",
  "hardValidityPolicy",
  "candidateReviewPolicy",
  "prescriptionRequiredPolicy",
  "multipleAnchorContinuity",
  "lexicographicEvaluation",
  "preferredOptionalAdmission",
  "marginalValue",
  "redundancy",
  "searchCalibration",
  "productionSearchPolicy",
  "searchCompleteness",
  "prescriptionHandoff",
  "sequencingHandoff",
  "fixedShellPersonalization",
  "antiBloat",
  "productionSessionComposer",
  "combinedSessionComposerKernel",
] as const;

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function buildProductionComposerFingerprints(): Readonly<Record<string, string>> {
  const cases = buildProductionCalibrationCases();
  const comparisons = cases.map((entry) => ({ id: entry.id, ...compareBoundedToExhaustive(entry) }));
  const outputs = comparisons.map((entry) => entry.exhaustive);
  const controlled = buildControlledProductionScenarios().map((entry) => ({
    id: entry.id,
    skeleton: composeSessionSkeleton({ intent: entry.intent, candidateResultsByNeed: entry.results }),
  }));
  const baseline = cases[0];
  const baselineSkeleton = outputs[0];
  const facts = [...deriveCanonicalCompositionFacts({
    candidateResultsByNeed: baseline.results,
    continuity: baseline.intent.continuityEvidence,
  }).entries()];
  const prescriptionHandoff = buildSessionPrescriptionHandoff({
    intent: baseline.intent,
    skeleton: baselineSkeleton,
    candidateResultsByNeed: baseline.results,
  });
  const durationFeasibility = evaluatePostPrescriptionDuration({
    availableMinutes: baseline.intent.availableMinutes,
    expectedExerciseIds: baselineSkeleton.assignments.map((assignment) => assignment.exerciseId),
    durationFacts: [],
  });
  const payloads: Record<Exclude<
  (typeof SESSION_COMPOSER_PRODUCTION_FINGERPRINT_NAMES)[number],
  "combinedSessionComposerKernel"
  >, unknown> = {
    canonicalExerciseSelectionNeed: cases.flatMap((entry) => entry.intent.needs.map((need) => need.selection)),
    needsFirstSessionIntent: cases.map((entry) => entry.intent),
    domainMigration: cases.map((entry) => ({
      intentKeys: Object.keys(entry.intent).sort(),
      validation: validateSessionIntent(entry.intent),
      hasSlots: "slots" in entry.intent,
    })),
    candidateResultConsistency: cases.map((entry) =>
      validateSessionCandidateResults(entry.intent, entry.results)),
    canonicalCompositionFactProjection: facts,
    hardValidityPolicy: controlled.map((entry) => ({
      id: entry.id,
      status: entry.skeleton.compositionStatus,
      infeasibility: entry.skeleton.infeasibility,
    })),
    candidateReviewPolicy: outputs.map((entry) => ({
      readiness: entry.executionReadiness,
      reviews: entry.assignments.map((assignment) => assignment.unresolvedCandidateReviewIds),
      fallbacks: entry.assignments.map((assignment) => assignment.bestExecutableFallbackExerciseId),
    })),
    prescriptionRequiredPolicy: controlled.map((entry) => ({
      id: entry.id,
      readiness: entry.skeleton.executionReadiness,
      requirements: entry.skeleton.assignments.map((assignment) =>
        assignment.executionBlockingPrescriptionRequirementIds),
    })),
    multipleAnchorContinuity: controlled.filter((entry) => entry.id.includes("continuity"))
      .map((entry) => entry.skeleton.assignments.map((assignment) => ({
        id: assignment.exerciseId,
        classification: assignment.continuityClassification,
        refs: assignment.continuityEvidenceRefs,
      }))),
    lexicographicEvaluation: outputs.map((entry) => entry.evaluation),
    preferredOptionalAdmission: outputs.map((entry) => entry.needSatisfaction),
    marginalValue: outputs.map((entry) => entry.trace.selectedReasonCodesByExercise),
    redundancy: outputs.map((entry) => entry.redundancy),
    searchCalibration: comparisons.map((entry) => ({
      id: entry.id,
      equivalent: entry.equivalent,
      exhaustive: entry.exhaustive.search,
      bounded: entry.bounded.search,
    })),
    productionSearchPolicy: PRODUCTION_SESSION_SEARCH_POLICY,
    searchCompleteness: comparisons.map((entry) => ({
      exact: entry.exhaustive.search.completeness,
      bounded: entry.bounded.search.completeness,
    })),
    prescriptionHandoff: {
      handoff: composerBehaviorPrescriptionHandoffProjection(prescriptionHandoff),
      duration: {
        status: durationFeasibility.status,
        knownTotalSeconds: durationFeasibility.knownTotalSeconds,
        availableSeconds: durationFeasibility.availableSeconds,
        missingExerciseIds: durationFeasibility.missingExerciseIds,
      },
    },
    sequencingHandoff: buildSessionSequencingInput(baselineSkeleton),
    fixedShellPersonalization: FIXED_SHELL_PRODUCTION_USERS,
    antiBloat: outputs.map((entry) => ({
      assignmentCount: entry.assignments.length,
      emptySections: entry.sections.filter((section) => section.assignmentExerciseIds.length === 0),
    })),
    productionSessionComposer: outputs,
  };
  const fingerprints = Object.fromEntries(Object.entries(payloads).map(([name, payload]) => [name, hash(payload)]));
  return {
    ...fingerprints,
    combinedSessionComposerKernel: hash(fingerprints),
  };
}

function composerBehaviorPrescriptionHandoffProjection(
  handoff: ReturnType<typeof buildSessionPrescriptionHandoff>,
) {
  return {
    sessionIntentId: handoff.sessionIntentId,
    assignments: handoff.assignments.map((assignment) => ({
      handoffId: assignment.handoffId,
      exerciseId: assignment.exerciseId,
      phaseId: assignment.phaseId,
      section: assignment.section,
      role: assignment.role,
      satisfiedNeedIds: assignment.satisfiedNeedIds,
      continuityEvidenceRefs: assignment.continuityEvidenceRefs,
      requiredPrescriptionResolutionIds: assignment.requiredPrescriptionResolutionIds,
      potentialStressTags: assignment.potentialStressTags,
      explicitRequirementRefs: assignment.explicitRequirementRefs,
      knownRequirements: assignment.knownRequirements,
      orderingConstraints: assignment.orderingConstraints,
      sourceExposureEventExpected: assignment.sourceExposureEventExpected,
    })),
  };
}

export const PRODUCTION_CATALOG_ROWS = REFERENCE_EXERCISES.length;

export interface ControlledProductionScenario {
  readonly id: string;
  readonly intent: SessionIntent;
  readonly results: Readonly<Record<string, CandidateRankingResult>>;
  readonly expectedCompositionStatus: SessionSkeleton["compositionStatus"];
}

const CALF_NEED = sessionNeed({
  id: "calf",
  section: "accessory",
  priority: "preferred",
  priorityOrder: 0,
  standaloneAdmission: "admitted",
  selection: selection({
    requestedRole: "hypertrophy_accessory",
    targetActionFunctions: ["ankle_plantar_flexion"],
    targetMuscles: ["calves"],
  }),
});

const SCAPULAR_PREPARATION_NEED = sessionNeed({
  id: "scapular-preparation",
  section: "activation",
  priority: "preferred",
  priorityOrder: 0,
  standaloneAdmission: "admitted",
  selection: selection({
    requestedRole: "activation",
    targetMovementRoles: ["scapular_control"],
    targetMuscles: ["serratus"],
  }),
  dependencies: [{
    dependencyId: "scapular-prepares-push",
    targetNeedIds: ["main-push"],
    targetExerciseIds: [],
    movementRoles: ["horizontal_push"],
    actionFunctions: [],
    bodyRegions: ["shoulder"],
    assessmentSignalIds: [],
    requiredRangeIds: [],
    painResponseRequirementIds: [],
    required: true,
  }],
});

function scenarioRequest(id: string): CandidateRequest {
  return CONTROLLED_CANDIDATE_SCENARIOS.find((entry) => entry.id === id)?.request ?? baseRequest;
}

function makeControlled(input: {
  readonly id: string;
  readonly needs: readonly SessionNeed[];
  readonly capacity?: StructuralCapacityMode;
  readonly candidates: Readonly<Record<string, readonly string[]>>;
  readonly contextRequestId?: string;
  readonly continuity?: SessionIntent["continuityEvidence"];
  readonly readinessChange?: {
    readonly needId: string;
    readonly exerciseId: string;
    readonly readiness: CandidatePainExecutionReadiness;
  };
  readonly blockTraining?: boolean;
}): ControlledProductionScenario {
  const request = scenarioRequest(input.contextRequestId ?? "horizontal-pull-gym-neutral");
  const intent = productionIntent({
    id: `controlled-${input.id}`,
    needs: input.needs,
    capacity: input.capacity,
    continuity: input.continuity,
    contextRequest: request,
  });
  let results = trimResults(buildResults(intent, request), input.candidates);
  if (input.readinessChange) {
    results = withReadiness({ results, ...input.readinessChange });
  }
  if (input.blockTraining) {
    results = Object.fromEntries(Object.entries(results).map(([needId, result]) => [needId, {
      ...result,
      trainingReadiness: {
        ...result.trainingReadiness,
        status: "REVIEW_REQUIRED_BEFORE_ORDINARY_TRAINING" as const,
        downstreamTrainingAllowed: false,
        reviewRequiredFirst: true,
        unresolvedSignalIds: ["controlled-training-safety-block"],
      },
    }]));
  }
  return {
    id: input.id,
    intent,
    results,
    expectedCompositionStatus: input.blockTraining ? "blocked_by_training_readiness" : "valid",
  };
}

export function buildControlledProductionScenarios(): readonly ControlledProductionScenario[] {
  const anchor = (exerciseId: string, needId: string) => ({
    exerciseId,
    previouslyServedNeedIds: [needId],
    responseReceiverTraceRefs: [`response:${exerciseId}`],
    observationalClassification: "anchor" as const,
    productive: true,
    plateaued: false,
    failedProgression: false,
    equipmentLost: false,
    explicitlyBlocked: false,
    repeatedAdverseEvidence: false,
  });
  const homePullNeed = {
    ...PULL_NEED,
    section: "accessory" as const,
    selection: { ...PULL_NEED.selection, requestedRole: "secondary_strength" as const },
  };
  return [
    makeControlled({ id: "full-gym-upper-strength", needs: [PUSH_NEED, PULL_NEED], candidates: { "main-push": ["dumbbell-bench-press", "machine-chest-press"], "main-pull": ["machine-row", "chest-supported-dumbbell-row"] } }),
    makeControlled({ id: "full-gym-upper-hypertrophy", needs: [PUSH_NEED, PULL_NEED, DIRECT_CHEST_NEED, { ...TRICEPS_NEED, priorityOrder: 1 }, BICEPS_NEED], capacity: "expanded", candidates: { "main-push": ["dumbbell-bench-press"], "main-pull": ["machine-row"], "direct-chest": ["dumbbell-bench-press"], triceps: ["cable-triceps-pressdown"], biceps: ["dumbbell-curl"] } }),
    makeControlled({ id: "lower-strength", needs: [SQUAT_NEED, HINGE_NEED], candidates: { "main-squat": ["goblet-squat"], "main-hinge": ["dumbbell-romanian-deadlift"] } }),
    makeControlled({ id: "full-body-general-fitness", needs: [PUSH_NEED, PULL_NEED, { ...SQUAT_NEED, priorityOrder: 2 }], candidates: { "main-push": ["push-up"], "main-pull": ["machine-row"], "main-squat": ["goblet-squat"] } }),
    makeControlled({ id: "posture-movement-quality", needs: [PUSH_NEED, PULL_NEED, SCAPULAR_PREPARATION_NEED], candidates: { "main-push": ["machine-chest-press"], "main-pull": ["machine-row"], "scapular-preparation": ["serratus-wall-slide"] } }),
    makeControlled({ id: "shoulder-discomfort", needs: [PUSH_NEED, PULL_NEED], contextRequestId: "horizontal-push-shoulder-discomfort", candidates: { "main-push": ["machine-chest-press"], "main-pull": ["machine-row"] }, readinessChange: { needId: "main-push", exerciseId: "machine-chest-press", readiness: "REQUIRES_PRESCRIPTION" } }),
    makeControlled({ id: "low-back-sensitivity", needs: [{ ...PULL_NEED, priorityOrder: 0 }], contextRequestId: "horizontal-pull-low-back-discomfort", candidates: { "main-pull": ["chest-supported-dumbbell-row"] } }),
    makeControlled({ id: "knee-discomfort", needs: [SQUAT_NEED], candidates: { "main-squat": ["leg-press"] }, readinessChange: { needId: "main-squat", exerciseId: "leg-press", readiness: "REQUIRES_PRESCRIPTION" } }),
    makeControlled({ id: "grip-sensitive-user", needs: [PUSH_NEED, PULL_NEED], candidates: { "main-push": ["machine-chest-press"], "main-pull": ["machine-row"] } }),
    makeControlled({ id: "productive-continuity", needs: [PUSH_NEED, PULL_NEED], continuity: { identities: [anchor("machine-chest-press", "main-push"), anchor("machine-row", "main-pull")] }, candidates: { "main-push": ["dumbbell-bench-press", "machine-chest-press"], "main-pull": ["chest-supported-dumbbell-row", "machine-row"] } }),
    makeControlled({ id: "adverse-response", needs: [PUSH_NEED, PULL_NEED], continuity: { identities: [{ ...anchor("machine-chest-press", "main-push"), repeatedAdverseEvidence: true }] }, candidates: { "main-push": ["dumbbell-bench-press", "machine-chest-press"], "main-pull": ["machine-row"] }, readinessChange: { needId: "main-push", exerciseId: "machine-chest-press", readiness: "REQUIRES_PRESCRIPTION" } }),
    makeControlled({ id: "time-constrained", needs: [PUSH_NEED, PULL_NEED, TRICEPS_NEED], capacity: "condensed", candidates: { "main-push": ["machine-chest-press"], "main-pull": ["machine-row"], triceps: ["cable-triceps-pressdown"] } }),
    makeControlled({ id: "home-equipment", needs: [PUSH_NEED, homePullNeed], contextRequestId: "anchored-bands-horizontal-pull", candidates: { "main-push": ["push-up"], "main-pull": ["band-row"] } }),
    makeControlled({ id: "p0-direct-need", needs: [PUSH_NEED, CALF_NEED], candidates: { "main-push": ["machine-chest-press"], calf: ["standing-calf-raise"] } }),
    makeControlled({ id: "training-safety-blocked", needs: [PUSH_NEED, PULL_NEED], candidates: { "main-push": ["machine-chest-press"], "main-pull": ["machine-row"] }, blockTraining: true }),
    makeControlled({ id: "no-cooldown-need", needs: [PUSH_NEED, PULL_NEED], candidates: { "main-push": ["machine-chest-press"], "main-pull": ["machine-row"] } }),
  ];
}

export type FixedShellClassification =
  | "MATERIAL_SESSION_DIFFERENCE"
  | "MATERIAL_NEED_DIFFERENCE_SAME_ANCHOR"
  | "PRESCRIPTION_DIFFERENCE_REQUIRED"
  | "JUSTIFIED_CONVERGENCE";

export const FIXED_SHELL_PRODUCTION_USERS: readonly {
  readonly factor: string;
  readonly classification: FixedShellClassification;
}[] = [
  { factor: "strength-goal", classification: "JUSTIFIED_CONVERGENCE" },
  { factor: "hypertrophy-goal", classification: "MATERIAL_SESSION_DIFFERENCE" },
  { factor: "posture-goal", classification: "MATERIAL_NEED_DIFFERENCE_SAME_ANCHOR" },
  { factor: "shoulder-discomfort", classification: "PRESCRIPTION_DIFFERENCE_REQUIRED" },
  { factor: "low-back-sensitivity", classification: "MATERIAL_SESSION_DIFFERENCE" },
  { factor: "assessment-priority", classification: "MATERIAL_NEED_DIFFERENCE_SAME_ANCHOR" },
  { factor: "productive-continuity", classification: "MATERIAL_NEED_DIFFERENCE_SAME_ANCHOR" },
  { factor: "adverse-response", classification: "PRESCRIPTION_DIFFERENCE_REQUIRED" },
  { factor: "explicit-preference", classification: "JUSTIFIED_CONVERGENCE" },
  { factor: "structural-capacity", classification: "MATERIAL_SESSION_DIFFERENCE" },
  { factor: "high-fatigue", classification: "PRESCRIPTION_DIFFERENCE_REQUIRED" },
] as const;
