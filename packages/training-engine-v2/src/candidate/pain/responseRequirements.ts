import type {
  CandidatePainSignalTrace,
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
): readonly PainResponseRequirementTrace[] {
  return signals.flatMap((signal) => {
    if (!signal.requestedAction) {
      return [];
    }

    const ownership = ownershipFor(signal.requestedAction);
    const noCandidateMatch =
      signal.matchedStressFacts.length === 0 &&
      signal.requestedAction !== "monitor" &&
      signal.requestedAction !== "urgent_review";
    const executionStatus = noCandidateMatch
      ? "not_applicable_no_candidate_stress_match" as const
      : ownership.status;
    const evidence = signal.matchedStressFacts.length > 0
      ? signal.matchedStressFacts.map(
          (match) =>
            `${match.signalId} matches ${match.stressTag} through ${match.exerciseSources.join(", ")}.`,
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
      primaryFutureOwner: ownership.owner,
      executionStatus,
      matchedStressFacts: signal.matchedStressFacts,
      evidence,
    }];
  });
}
