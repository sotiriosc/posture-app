import type { ExerciseDefinition } from "../domain/exercise";
import type { CandidateRequest } from "./request";
import type { CandidatePainMatchTrace } from "./pain";
import type {
  CandidateRankingResult,
  RankedCandidate,
  RejectedCandidate,
} from "./types";

export const HORIZONTAL_ROW_SELECTION_EXERCISE_IDS = [
  "machine-row",
  "seated-cable-row",
  "chest-supported-dumbbell-row",
  "one-arm-dumbbell-row",
] as const;

export type HorizontalRowSelectionExerciseId =
  (typeof HORIZONTAL_ROW_SELECTION_EXERCISE_IDS)[number];

export type RowTieStatusCode =
  | "SCORE_EQUIVALENT_AND_KNOWLEDGE_EQUIVALENT"
  | "SCORE_EQUIVALENT_BUT_MECHANICALLY_DISTINCT"
  | "CONTEXT_REQUIRED_TO_DIFFERENTIATE";

export interface RowSupportTrace {
  readonly basePosition: string;
  readonly stance: string;
  readonly orientation: string;
  readonly supportContacts: readonly string[];
  readonly supportAmount: string;
  readonly supportRelationship: string;
  readonly reviewStatus: string;
  readonly notes: string;
}

export interface RowResistancePathTrace {
  readonly resistancePath: string;
  readonly trajectoryFreedom: string;
  readonly lineOfPullAdjustability: string;
  readonly laterality: string;
  readonly fitDependency: string;
  readonly reviewStatus: string;
  readonly notes: string;
  readonly provenance: readonly string[];
}

export interface RowDemandTrace {
  readonly trunk: string;
  readonly stability: string;
  readonly coordination: string;
  readonly jointControl: string;
}

export interface RowLoadingTrace {
  readonly loadability: string;
  readonly loadingPotential: string;
  readonly localFatigue: string;
  readonly systemicFatigue: string;
}

interface RowMechanicalSignature {
  readonly support: Pick<
    RowSupportTrace,
    | "basePosition"
    | "stance"
    | "orientation"
    | "supportContacts"
    | "supportAmount"
    | "supportRelationship"
  >;
  readonly resistancePath: Pick<
    RowResistancePathTrace,
    | "resistancePath"
    | "trajectoryFreedom"
    | "lineOfPullAdjustability"
    | "laterality"
    | "fitDependency"
  >;
  readonly demand: RowDemandTrace;
  readonly loading: RowLoadingTrace;
}

export interface RowSelectionCandidateTrace {
  readonly exerciseId: string;
  readonly name: string;
  readonly legal: boolean;
  readonly rank: number | null;
  readonly total: number | null;
  readonly rejectionCodes: readonly string[];
  readonly support: RowSupportTrace;
  readonly resistancePath: RowResistancePathTrace;
  readonly demand: RowDemandTrace;
  readonly loading: RowLoadingTrace;
  readonly contextualDifferentiators: readonly string[];
  readonly contextRequired: readonly string[];
  readonly scoreVectorSignature: string | null;
  readonly mechanicsSignature: string;
}

export interface RowTieTrace {
  readonly exerciseIds: readonly [string, string];
  readonly scoreEquivalent: boolean;
  readonly mechanicallyDistinct: boolean;
  readonly statusCodes: readonly RowTieStatusCode[];
  readonly evidence: readonly string[];
}

export interface HorizontalRowSelectionTrace {
  readonly requestId: string;
  readonly candidates: readonly RowSelectionCandidateTrace[];
  readonly tieStatus: readonly RowTieTrace[];
}

function supportTrace(exercise: ExerciseDefinition): RowSupportTrace {
  const support = exercise.mechanics?.support;

  return {
    basePosition: support?.basePosition ?? "unknown",
    stance: support?.stance ?? "unknown",
    orientation: support?.orientation ?? "unknown",
    supportContacts: (support?.supportContacts ?? [])
      .map(
        (contact) =>
          `${contact.bodyRegion}:${contact.source}:${contact.mode}:${contact.side}:${contact.taskRole}`,
      )
      .sort(),
    supportAmount: support?.supportAmount ?? "unknown",
    supportRelationship: support?.supportRelationship ?? "unknown",
    reviewStatus: support?.reviewStatus ?? "needs_review",
    notes: support?.notes ?? "Support mechanics are not modeled.",
  };
}

function resistancePathTrace(exercise: ExerciseDefinition): RowResistancePathTrace {
  const path = exercise.mechanics?.resistancePath;

  return {
    resistancePath: path?.resistancePath ?? "unknown",
    trajectoryFreedom: path?.trajectoryFreedom ?? "unknown",
    lineOfPullAdjustability: path?.lineOfPullAdjustability ?? "unknown",
    laterality: path?.laterality ?? "unknown",
    fitDependency: path?.fitDependency ?? "unknown",
    reviewStatus: path?.reviewStatus ?? "needs_review",
    notes: path?.notes ?? "Resistance/path mechanics are not modeled.",
    provenance: path?.provenance ?? [],
  };
}

function demandTrace(exercise: ExerciseDefinition): RowDemandTrace {
  const demands = exercise.mechanics?.demands;

  return {
    trunk: demands?.trunk_control.level ?? "unknown",
    stability: demands?.stability.level ?? "unknown",
    coordination: demands?.coordination.level ?? "unknown",
    jointControl: demands?.joint_control.level ?? "unknown",
  };
}

function loadingTrace(exercise: ExerciseDefinition): RowLoadingTrace {
  return {
    loadability: exercise.loading.loadability,
    loadingPotential: exercise.loading.loadingPotential,
    localFatigue: exercise.loading.localFatigue,
    systemicFatigue: exercise.loading.systemicFatigue,
  };
}

function scoreVectorSignature(candidate: RankedCandidate): string {
  return candidate.components
    .map((component) => `${component.id}:${component.rawValue.toFixed(3)}`)
    .join("|");
}

function mechanicalSignature(exercise: ExerciseDefinition): RowMechanicalSignature {
  const support = supportTrace(exercise);
  const resistancePath = resistancePathTrace(exercise);

  return {
    support: {
      basePosition: support.basePosition,
      stance: support.stance,
      orientation: support.orientation,
      supportContacts: support.supportContacts,
      supportAmount: support.supportAmount,
      supportRelationship: support.supportRelationship,
    },
    resistancePath: {
      resistancePath: resistancePath.resistancePath,
      trajectoryFreedom: resistancePath.trajectoryFreedom,
      lineOfPullAdjustability: resistancePath.lineOfPullAdjustability,
      laterality: resistancePath.laterality,
      fitDependency: resistancePath.fitDependency,
    },
    demand: demandTrace(exercise),
    loading: loadingTrace(exercise),
  };
}

function mechanicsSignature(exercise: ExerciseDefinition): string {
  return JSON.stringify(mechanicalSignature(exercise));
}

function hasCurrentLumbarDiscomfort(request: CandidateRequest): boolean {
  return request.painAndInjury.currentDiscomforts.some(
    (pain) => pain.region === "lumbar_spine",
  );
}

function contextualDifferentiators(
  request: CandidateRequest,
  exercise: ExerciseDefinition,
  rejection: RejectedCandidate | undefined,
  painMatchTrace: CandidatePainMatchTrace,
): readonly string[] {
  const differentiators: string[] = [];

  if (rejection) {
    differentiators.push(
      `hard eligibility: ${rejection.eligibility.rejectionReasons.map((reason) => reason.code).join(", ")}`,
    );
  }

  if (request.continuity.currentExerciseId === exercise.id) {
    differentiators.push("exercise-specific continuity: current exercise");
  }

  if (request.continuity.productiveExerciseIds.includes(exercise.id)) {
    differentiators.push("exercise-specific continuity: productive");
  }

  if (
    request.continuity.plateauedExerciseIds.includes(exercise.id) ||
    request.continuity.failedProgressionExerciseIds.includes(exercise.id)
  ) {
    differentiators.push("exercise-specific continuity: plateau/failure");
  }

  if (request.continuity.painResponseExerciseIds.includes(exercise.id)) {
    differentiators.push("exercise-specific continuity: pain response");
  }

  if (request.history.exerciseHistory.stableExerciseIds.includes(exercise.id)) {
    differentiators.push("exercise-specific history: stable exercise");
  }

  if (request.history.exerciseHistory.blockedExerciseIds.includes(exercise.id)) {
    differentiators.push("exercise-specific history: blocked exercise");
  }

  if (request.history.exerciseHistory.events.some((event) => event.exerciseId === exercise.id)) {
    differentiators.push("exercise-specific history: recorded exposure");
  }

  const painOverlap = painMatchTrace.signalTraces.filter(
    (signal) =>
      signal.uniqueMatchCount > 0 &&
      (signal.signalKind === "current_discomfort" ||
        signal.signalKind === "moderate_pain" ||
        signal.signalKind === "historical_sensitivity"),
  );
  painOverlap.forEach((signal) =>
    differentiators.push(`pain/stress overlap: ${signal.signalId}`),
  );

  if (
    hasCurrentLumbarDiscomfort(request) &&
    exercise.mechanics?.support.supportContacts.some(
      (contact) => contact.bodyRegion === "chest" && contact.taskRole === "primary",
    )
  ) {
    differentiators.push(
      "structured support: primary chest contact in lumbar-spine context",
    );
  }

  return differentiators.length > 0 ? differentiators : ["none"];
}

function contextRequired(exercise: ExerciseDefinition): readonly string[] {
  const path = exercise.mechanics?.resistancePath;
  const required: string[] = [];

  if (!path) {
    return ["resistance/path profile missing"];
  }

  if (path.fitDependency === "machine_geometry") {
    required.push("machine geometry and anthropometric fit feedback");
  }

  if (path.fitDependency === "setup_geometry") {
    required.push("setup geometry or path preference");
  }

  if (path.resistancePath === "cable_anchored") {
    required.push("cable attachment, pulley geometry, and line-of-pull preference");
  }

  if (path.trajectoryFreedom === "high") {
    required.push("preference/tolerance for self-selected trajectory");
  }

  return required.length > 0 ? required : ["none"];
}

function hasCurrentRequestDifferentiator(candidate: RowSelectionCandidateTrace): boolean {
  return candidate.contextualDifferentiators.some((entry) => entry !== "none");
}

function tieEvidence(
  left: RowSelectionCandidateTrace,
  right: RowSelectionCandidateTrace,
): readonly string[] {
  const evidence = [
    "Score vectors are equal at three-decimal component precision.",
  ];

  if (left.mechanicsSignature !== right.mechanicsSignature) {
    evidence.push("Support/resistance-path/demand/loading metadata differ.");
  } else {
    evidence.push("Support/resistance-path/demand/loading metadata are equivalent at current trace scope.");
  }

  if (!hasCurrentRequestDifferentiator(left) && !hasCurrentRequestDifferentiator(right)) {
    evidence.push("Current request has no exercise-specific history, pain, equipment, fit, or path-preference signal that should break this tie.");
  }

  return evidence;
}

function tieTrace(
  left: RowSelectionCandidateTrace,
  right: RowSelectionCandidateTrace,
): RowTieTrace | undefined {
  if (!left.legal || !right.legal || left.scoreVectorSignature !== right.scoreVectorSignature) {
    return undefined;
  }

  const mechanicallyDistinct = left.mechanicsSignature !== right.mechanicsSignature;
  const statusCodes: RowTieStatusCode[] = [
    mechanicallyDistinct
      ? "SCORE_EQUIVALENT_BUT_MECHANICALLY_DISTINCT"
      : "SCORE_EQUIVALENT_AND_KNOWLEDGE_EQUIVALENT",
  ];

  if (
    mechanicallyDistinct &&
    !hasCurrentRequestDifferentiator(left) &&
    !hasCurrentRequestDifferentiator(right)
  ) {
    statusCodes.push("CONTEXT_REQUIRED_TO_DIFFERENTIATE");
  }

  return {
    exerciseIds: [left.exerciseId, right.exerciseId],
    scoreEquivalent: true,
    mechanicallyDistinct,
    statusCodes,
    evidence: tieEvidence(left, right),
  };
}

export function buildHorizontalRowSelectionTrace(
  result: CandidateRankingResult,
  exerciseIds: readonly string[] = HORIZONTAL_ROW_SELECTION_EXERCISE_IDS,
): HorizontalRowSelectionTrace {
  const rankedById = new Map(
    result.rankedCandidates.map((candidate) => [candidate.exercise.id, candidate]),
  );
  const rejectedById = new Map(
    result.hardRejectedCandidates.map((candidate) => [candidate.exercise.id, candidate]),
  );
  const allById = new Map<string, ExerciseDefinition>();

  result.rankedCandidates.forEach((candidate) => allById.set(candidate.exercise.id, candidate.exercise));
  result.hardRejectedCandidates.forEach((candidate) => allById.set(candidate.exercise.id, candidate.exercise));

  const candidates = exerciseIds.flatMap((exerciseId): RowSelectionCandidateTrace[] => {
    const ranked = rankedById.get(exerciseId);
    const rejected = rejectedById.get(exerciseId);
    const exercise = ranked?.exercise ?? rejected?.exercise ?? allById.get(exerciseId);
    const painMatchTrace = ranked?.painMatchTrace ?? rejected?.eligibility.painMatchTrace;

    if (!exercise || !painMatchTrace) {
      return [];
    }

    return [
      {
        exerciseId,
        name: exercise.name,
        legal: Boolean(ranked),
        rank: ranked?.rank ?? null,
        total: ranked?.total ?? null,
        rejectionCodes: rejected?.eligibility.rejectionReasons.map((reason) => reason.code) ?? [],
        support: supportTrace(exercise),
        resistancePath: resistancePathTrace(exercise),
        demand: demandTrace(exercise),
        loading: loadingTrace(exercise),
        contextualDifferentiators: contextualDifferentiators(
          result.request,
          exercise,
          rejected,
          painMatchTrace,
        ),
        contextRequired: contextRequired(exercise),
        scoreVectorSignature: ranked ? scoreVectorSignature(ranked) : null,
        mechanicsSignature: mechanicsSignature(exercise),
      },
    ];
  });

  const tieStatus: RowTieTrace[] = [];

  for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
      const tie = tieTrace(candidates[leftIndex], candidates[rightIndex]);
      if (tie) {
        tieStatus.push(tie);
      }
    }
  }

  return {
    requestId: result.request.id,
    candidates,
    tieStatus,
  };
}
