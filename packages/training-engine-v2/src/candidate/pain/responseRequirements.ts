import type {
  CandidatePainSignalTrace,
  ExerciseStressPotentialTrace,
  PainRequestedAction,
  PainResponseExecutionStatus,
  PainResponseOwner,
  PainResponseRequirementTrace,
} from "./types";

function ownershipFor(action: PainRequestedAction): {
  readonly owner: PainResponseOwner;
  readonly status: PainResponseExecutionStatus;
} {
  switch (action) {
    case "monitor":
      return {
        owner: "observation",
        status: "observed_no_modification_applied",
      };
    case "avoid_aggravator":
      return {
        owner: "candidate_review",
        status: "policy_unresolved_candidate_review_required",
      };
    case "reduce_range":
    case "reduce_load":
    case "reduce_load_and_range":
      return {
        owner: "prescription",
        status: "deferred_unexecutable_at_candidate_layer",
      };
    case "substitute_role":
      return {
        owner: "session_intent_or_session_composer",
        status: "deferred_unexecutable_at_candidate_layer",
      };
    case "prefer_support":
    case "increase_support":
      return {
        owner: "future_candidate_prescription_or_session",
        status: "deferred_unexecutable_at_candidate_layer",
      };
    case "urgent_review":
      return {
        owner: "external_urgent_review",
        status: "unresolved_urgent_review_required",
      };
  }
}

export function buildPainResponseRequirements(
  signals: readonly CandidatePainSignalTrace[],
  potentialTraces: readonly ExerciseStressPotentialTrace[] = [],
): readonly PainResponseRequirementTrace[] {
  return signals.flatMap((signal) => {
    if (!signal.requestedAction) {
      return [];
    }

    const ownership = ownershipFor(signal.requestedAction);
    const potentialMatches = potentialTraces.filter(
      (trace) =>
        trace.requiresPrescriptionResolution &&
        trace.matchedPainSignalIds.includes(signal.signalId),
    );
    const noCandidateMatch =
      signal.matchedStressFacts.length === 0 &&
      signal.requestedAction !== "monitor" &&
      signal.requestedAction !== "urgent_review";
    const executionStatus = noCandidateMatch && potentialMatches.length > 0
      ? "potential_stress_requires_prescription_resolution" as const
      : noCandidateMatch
        ? "not_applicable_no_candidate_stress_match" as const
        : ownership.status;
    const owner = noCandidateMatch && potentialMatches.length > 0
      ? "prescription" as const
      : ownership.owner;
    const evidence = signal.matchedStressFacts.length > 0
      ? signal.matchedStressFacts.map(
          (match) =>
            `${match.signalId} matches ${match.stressTag} through ${match.exerciseSources.join(", ")}.`,
        )
      : potentialMatches.length > 0
        ? potentialMatches.map(
            (match) =>
              `${signal.signalId} matches potential ${match.tag}; ${match.exposureScope} exposure requires prescription resolution before candidate receivers count realized stress.`,
          )
      : signal.requestedAction === "urgent_review"
        ? [
            `${signal.signalId} explicitly recommends urgent review; no candidate stress match is required to preserve that request.`,
          ]
        : [
            `${signal.signalId} requests ${signal.requestedAction}, but this candidate has no structured stress match.`,
          ];

    return [{
      signalId: signal.signalId,
      signalKind: signal.signalKind,
      requestedAction: signal.requestedAction,
      requestedActionSource: signal.requestedActionSource,
      primaryFutureOwner: owner,
      executionStatus,
      matchedStressFacts: signal.matchedStressFacts,
      potentialStressEvidence: potentialMatches.length > 0 ? potentialMatches : undefined,
      evidence,
    }];
  });
}
