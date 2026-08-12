import type { ExerciseDefinition } from "../../domain/exercise";
import type {
  AcuteSeverePain,
  CurrentDiscomfort,
  HardContraindication,
  HistoricalSensitivity,
  ModeratePain,
  PainAndInjuryState,
} from "../../domain/painInjury";
import type { JointStressTag, Side } from "../../domain/primitives";
import {
  buildExerciseStressProfile,
  structuredStressReceiverEligibility,
} from "./exerciseStressProfile";
import { reviewUrgencyForModeratePain } from "./reviewUrgency";
import type {
  CandidatePainSignalTrace,
  CanonicalPainEvidence,
  ExerciseStressFact,
  ExerciseStressPotentialTrace,
  PainRequestedAction,
  PainRequestedActionSource,
  PainStressMatchFact,
} from "./types";

type MatchablePainSignal =
  | HistoricalSensitivity
  | CurrentDiscomfort
  | ModeratePain
  | AcuteSeverePain
  | HardContraindication;

function unique<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

function stressTagsFor(signal: MatchablePainSignal): readonly JointStressTag[] {
  return signal.kind === "hard_contraindication" ? signal.stressTags ?? [] : signal.stressTags;
}

function severityFor(signal: MatchablePainSignal): number | null {
  switch (signal.kind) {
    case "current_discomfort":
    case "moderate_pain":
    case "acute_severe_pain":
      return signal.severity0To10;
    case "historical_sensitivity":
    case "hard_contraindication":
      return null;
  }
}

function sideFor(signal: MatchablePainSignal): Side | null {
  return signal.side ?? null;
}

function actionFor(signal: MatchablePainSignal): {
  readonly requestedAction: PainRequestedAction | null;
  readonly requestedActionSource: PainRequestedActionSource;
} {
  switch (signal.kind) {
    case "historical_sensitivity":
      return {
        requestedAction: signal.preferredModification ?? null,
        requestedActionSource: signal.preferredModification
          ? "preferred_modification"
          : "not_provided",
      };
    case "current_discomfort":
      return {
        requestedAction: signal.effect,
        requestedActionSource: "current_discomfort_effect",
      };
    case "moderate_pain":
      return {
        requestedAction: signal.requiredResponse,
        requestedActionSource: "moderate_pain_required_response",
      };
    case "acute_severe_pain":
      return {
        requestedAction: signal.urgentReviewRecommended ? "urgent_review" : null,
        requestedActionSource: signal.urgentReviewRecommended
          ? "acute_review_recommendation"
          : "not_provided",
      };
    case "hard_contraindication":
      return {
        requestedAction: null,
        requestedActionSource: "not_provided",
      };
  }
}

function matchFactsFor(input: {
  readonly signal: MatchablePainSignal;
  readonly stressFactsByTag: ReadonlyMap<JointStressTag, ExerciseStressFact>;
}): readonly PainStressMatchFact[] {
  const action = actionFor(input.signal);

  return [...unique(stressTagsFor(input.signal))]
    .sort((left, right) => left.localeCompare(right))
    .flatMap((stressTag) => {
      const exerciseFact = input.stressFactsByTag.get(stressTag);
      if (!exerciseFact) {
        return [];
      }

      return [{
        matchId: `${input.signal.id}:${stressTag}`,
        signalId: input.signal.id,
        signalKind: input.signal.kind,
        severity: severityFor(input.signal),
        region: input.signal.region ?? null,
        side: sideFor(input.signal),
        stressTag,
        exerciseSources: exerciseFact.sources,
        requestedAction: action.requestedAction,
        requestedActionSource: action.requestedActionSource,
      }];
    });
}

function signalTraceFor(input: {
  readonly signal: MatchablePainSignal;
  readonly stressFactsByTag: ReadonlyMap<JointStressTag, ExerciseStressFact>;
}): CandidatePainSignalTrace {
  const matches = matchFactsFor(input);
  const action = actionFor(input.signal);

  return {
    signalId: input.signal.id,
    signalKind: input.signal.kind,
    severity: severityFor(input.signal),
    region: input.signal.region ?? null,
    side: sideFor(input.signal),
    inputStressTags: [...unique(stressTagsFor(input.signal))].sort((left, right) =>
      left.localeCompare(right),
    ),
    requestedAction: action.requestedAction,
    requestedActionSource: action.requestedActionSource,
    matchedStressFacts: matches,
    uniqueMatchCount: matches.length,
    invalidatedTrainingRoles:
      input.signal.kind === "acute_severe_pain"
        ? [...unique(input.signal.invalidatesTrainingRoles)].sort()
        : [],
    hardExerciseIds:
      input.signal.kind === "hard_contraindication"
        ? [...unique(input.signal.exerciseIds ?? [])].sort()
        : [],
    moderateReviewUrgency:
      input.signal.kind === "moderate_pain"
        ? reviewUrgencyForModeratePain(input.signal.severity0To10)
        : null,
    urgentReviewRecommended:
      input.signal.kind === "acute_severe_pain"
        ? input.signal.urgentReviewRecommended
        : null,
    hardContraindicationSource:
      input.signal.kind === "hard_contraindication" ? input.signal.source : null,
    hardContraindicationReason:
      input.signal.kind === "hard_contraindication" ? input.signal.reason : null,
  };
}

function exerciseStressPotentialTracesFor(input: {
  readonly exercise: ExerciseDefinition;
  readonly signals: readonly MatchablePainSignal[];
}): readonly ExerciseStressPotentialTrace[] {
  return (input.exercise.stressAnnotations ?? [])
    .map((annotation) => {
      const candidateReceiverEligibility = structuredStressReceiverEligibility(annotation);
      const requiresPrescriptionResolution =
        candidateReceiverEligibility === "candidate_potential_only";
      const matchedPainSignalIds = input.signals
        .filter((signal) => stressTagsFor(signal).includes(annotation.tag))
        .map((signal) => signal.id)
        .sort();
      const reason =
        candidateReceiverEligibility === "candidate_canonical_match_eligible"
          ? "Accepted intrinsic structured stress can participate in candidate-level canonical matching."
          : candidateReceiverEligibility === "candidate_potential_only"
            ? "Structured stress is prescription modifiable, variant dependent, or dose created; candidate scope exposes potential evidence and requires prescription resolution before counting realized stress."
            : "Structured stress is not accepted or has unknown scope; candidate scope exposes it without counting it as realized stress.";

      return {
        candidateExerciseId: input.exercise.id,
        tag: annotation.tag,
        source: annotation.source,
        exposureScope: annotation.exposureScope,
        sideScope: annotation.sideScope,
        reviewStatus: annotation.reviewStatus,
        provenance: annotation.provenance,
        matchedPainSignalIds,
        candidateReceiverEligibility,
        requiresPrescriptionResolution,
        reason,
      };
    })
    .sort(
      (left, right) =>
        left.tag.localeCompare(right.tag) ||
        left.source.localeCompare(right.source) ||
        left.exposureScope.localeCompare(right.exposureScope),
    );
}

export function buildCanonicalPainEvidence(input: {
  readonly exercise: ExerciseDefinition;
  readonly painAndInjury: PainAndInjuryState;
}): CanonicalPainEvidence {
  const exerciseStressFacts = buildExerciseStressProfile(input.exercise);
  const stressFactsByTag = new Map(
    exerciseStressFacts.map((fact) => [fact.tag, fact] as const),
  );
  const signals: readonly MatchablePainSignal[] = [
    ...input.painAndInjury.historicalSensitivities,
    ...input.painAndInjury.currentDiscomforts,
    ...input.painAndInjury.moderatePain,
    ...input.painAndInjury.acuteSeverePain,
    ...input.painAndInjury.hardContraindications,
  ];
  const signalTraces = signals
    .map((signal) => signalTraceFor({ signal, stressFactsByTag }))
    .sort(
      (left, right) =>
        left.signalId.localeCompare(right.signalId) ||
        left.signalKind.localeCompare(right.signalKind),
    );
  const signalMatches = signalTraces.flatMap((signal) => signal.matchedStressFacts);
  const exerciseStressPotentialTraces = exerciseStressPotentialTracesFor({
    exercise: input.exercise,
    signals,
  });

  return {
    candidateExerciseId: input.exercise.id,
    exerciseStressFacts,
    exerciseStressPotentialTraces,
    signalTraces,
    signalMatches,
    uniqueMatchCount: signalMatches.length,
  };
}
